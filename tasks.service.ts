import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { TasksGateway } from './tasks.gateway';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private tasksGateway: TasksGateway,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    await this.checkProjectAccess(dto.projectId, userId);

    // Find the highest position in the target column to place the new task at the end
    const status = dto.status || TaskStatus.TODO;
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId: dto.projectId, status },
      orderBy: { position: 'desc' },
    });

    const position = dto.position ?? (lastTask ? lastTask.position + 1 : 0);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status,
        position,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    this.tasksGateway.notifyTaskUpdate(task.projectId, { action: 'created', task });
    return task;
  }

  private async checkProjectAccess(projectId: string, userId: string, allowClient = false) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { managerId: userId },
          { members: { some: { id: userId } } },
          ...(allowClient ? [{ clientId: userId }] : []),
        ],
      },
    });

    if (!project) {
      throw new ForbiddenException('Project access denied');
    }
    return project;
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId, true);

    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.checkProjectAccess(task.projectId, userId);

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    this.tasksGateway.notifyTaskUpdate(updatedTask.projectId, { action: 'updated', task: updatedTask });
    return updatedTask;
  }

  async reorder(id: string, newStatus: TaskStatus, newPosition: number, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.checkProjectAccess(task.projectId, userId);

    const oldStatus = task.status;
    const oldPosition = task.position;

    return this.prisma.$transaction(async (tx) => {
      if (oldStatus === newStatus) {
        if (oldPosition < newPosition) {
          // Moving down: decrement tasks between old and new
          await tx.task.updateMany({
            where: {
              projectId: task.projectId,
              status: newStatus,
              position: { gt: oldPosition, lte: newPosition },
            },
            data: { position: { decrement: 1 } },
          });
        } else if (oldPosition > newPosition) {
          // Moving up: increment tasks between new and old
          await tx.task.updateMany({
            where: {
              projectId: task.projectId,
              status: newStatus,
              position: { gte: newPosition, lt: oldPosition },
            },
            data: { position: { increment: 1 } },
          });
        }
      } else {
        // Moving columns: Close gap in old column
        await tx.task.updateMany({
          where: { projectId: task.projectId, status: oldStatus, position: { gt: oldPosition } },
          data: { position: { decrement: 1 } },
        });
        // Make room in new column
        await tx.task.updateMany({
          where: { projectId: task.projectId, status: newStatus, position: { gte: newPosition } },
          data: { position: { increment: 1 } },
        });
      }

      const updated = await tx.task.update({
        where: { id },
        data: { status: newStatus, position: newPosition },
      });

      this.tasksGateway.notifyTaskUpdate(updated.projectId, { action: 'reordered', task: updated });
      return updated;
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    await this.checkProjectAccess(task.projectId, userId, false);

    const deletedTask = await this.prisma.task.delete({ where: { id } });
    this.tasksGateway.notifyTaskUpdate(deletedTask.projectId, { action: 'deleted', taskId: id });
    return deletedTask;
  }
}