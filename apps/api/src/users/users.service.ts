import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }

  update(id: string, dto: { name?: string; role?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: { name: dto.name, ...(dto.role ? { role: dto.role as Role } : {}) },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
