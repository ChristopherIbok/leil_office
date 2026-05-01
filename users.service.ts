import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async findByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role },
      select: { id: true, name: true, email: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}