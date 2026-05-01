import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
      },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
  }

  findAll(projectId?: string) {
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: { assignee: { select: { id: true, name: true, email: true } }, comments: true },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }]
    });
  }

  update(id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
  }

  remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
