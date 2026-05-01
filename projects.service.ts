import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateProjectDto } from './create-project.dto';
import { GetProjectsDto } from './get-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, managerId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        clientId: dto.clientId,
        managerId: managerId,
        members: {
          connect: { id: managerId },
        },
      },
      include: {
        manager: true,
        client: true,
        members: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        OR: [
          { managerId: userId },
          { members: { some: { id: userId } } },
          { clientId: userId },
        ],
      },
      include: {
        manager: true,
        client: true,
        members: true,
      },
    });

    if (!project) throw new Error('Project not found or access denied');
    return project;
  }

  async findAllForUser(userId: string, query: GetProjectsDto) {
    const { status, skip, take } = query;

    return this.prisma.project.findMany({
      where: {
        status,
        OR: [
          { managerId: userId },
          { members: { some: { id: userId } } },
          { clientId: userId },
        ],
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}