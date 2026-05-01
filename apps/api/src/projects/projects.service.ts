import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        clientId: dto.clientId,
        channels: { create: { name: "General" } }
      },
      include: { client: { select: { id: true, name: true, email: true } }, members: true }
    });
  }

  findAll() {
    return this.prisma.project.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, files: true, members: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        tasks: true,
        files: true,
        channels: true,
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } }
      }
    });
  }

  update(id: string, dto: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
