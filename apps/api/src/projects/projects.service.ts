import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
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

  findAll(search?: string) {
    return this.prisma.project.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      } : undefined,
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, files: true, members: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findByClient(clientId: string, search?: string) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { clientId },
          { members: { some: { userId: clientId } } }
        ],
        ...(search ? {
          AND: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }
            ]
          }
        } : {})
      },
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

  async findOneForClient(id: string, clientId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        tasks: true,
        files: true,
        channels: true,
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } }
      }
    });
    if (!project) throw new NotFoundException("Project not found");
    const isMember = project.members.some(m => m.userId === clientId);
    const isClient = project.clientId === clientId;
    if (!isMember && !isClient) throw new ForbiddenException("Access denied");
    return project;
  }

  update(id: string, dto: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
