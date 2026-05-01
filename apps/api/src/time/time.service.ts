import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateTimeLogDto } from "./dto";

@Injectable()
export class TimeService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateTimeLogDto) {
    return this.prisma.timeLog.create({
      data: {
        userId,
        taskId: dto.taskId,
        duration: dto.duration,
        date: dto.date ? new Date(dto.date) : undefined
      },
      include: { task: { select: { id: true, title: true, projectId: true } } }
    });
  }

  findMine(userId: string) {
    return this.prisma.timeLog.findMany({
      where: { userId },
      include: { task: { select: { id: true, title: true, projectId: true } } },
      orderBy: { date: "desc" }
    });
  }
}
