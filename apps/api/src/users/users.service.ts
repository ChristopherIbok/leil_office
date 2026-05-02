import { ConflictException, Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { name: string; email: string; password: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException("Email is already registered.");
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        role: (dto.role as Role) ?? Role.TEAM_MEMBER
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }

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
