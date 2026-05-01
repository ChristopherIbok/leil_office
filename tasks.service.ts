import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { TasksGateway } from './tasks.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private tasksGateway: TasksGateway,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    // Verify user has access to the project (Manager or Member)
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        OR: [
          { managerId: userId },
          { members: { some: { id: userId } } },
        ],
      },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to create tasks in this project');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    this.tasksGateway.notifyTaskUpdate(task.projectId, { action: 'created', task });
    return task;
  }

  async findAllByProject(projectId: string, userId: string) {
    // Verify access (Manager, Member, or the Client of the project)
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { managerId: userId },
          { members: { some: { id: userId } } },
          { clientId: userId },
        ],
      },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) throw new NotFoundException('Task not found');

    // Verify access via project participation
    const project = await this.prisma.project.findFirst({
      where: {
        id: task.projectId,
        OR: [
          { managerId: userId },
          { members: { some: { id: userId } } },
        ],
      },
    });

    if (!project) {
      throw new ForbiddenException('You do not have permission to update tasks in this project');
    }

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

  async remove(id: string, userId: string) {
    // Delete permission restricted to Project Manager for data integrity
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.project.managerId !== userId) {
      throw new ForbiddenException('Only the project manager can delete tasks');
    }

    const deletedTask = await this.prisma.task.delete({ where: { id } });
    this.tasksGateway.notifyTaskUpdate(deletedTask.projectId, { action: 'deleted', taskId: id });
    return deletedTask;
  }
}