import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register({ name, email, password, role }: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Email is already registered.");

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role ?? "TEAM_MEMBER"
      },
      select: userSelect
    });

    return this.withToken(user);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException("Invalid email or password.");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid email or password.");

    return this.withToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found.");
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException("Current password is incorrect.");
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: "Password updated successfully." };
  }

  private async withToken(user: { id: string; email: string; role: string; name: string; createdAt: Date }) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.config.get<string>("JWT_EXPIRES_IN", "15m") }
    );
    return { user, accessToken };
  }
}
