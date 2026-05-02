import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service'; // Assuming this exists to wrap PrismaClient
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateCognitoUser(payload: { email: string; name?: string; 'custom:full_name'?: string; 'custom:role'?: string }) {
    // Check if user exists in local DB by email
    let user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Create local user record if it doesn't exist (First time login sync)
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload['custom:full_name'] || 'User',
          password: '', // Password is managed by Cognito, not stored locally,
          role: (payload['custom:role'] as Role) || 'CLIENT', // Use Cognito custom role or default to CLIENT
        },
      });
    }

    return user;
  }

  async register(email: string, pass: string, name: string, role: Role = 'CLIENT') {
    const hashedPassword = await bcrypt.hash(pass, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role, // Use provided role or default
      },
    });

    return this.login(user.email, pass);
  }

  async login(email: string, pass: string) {
    // Temporary test details for local development
    if (email === 'admin@leil.local' && pass === 'admin123') {
      const payload = { sub: 'dev-admin-id', email, role: 'ADMIN' };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: 'dev-admin-id',
          name: 'Portal Admin (Test)',
          email,
          role: 'ADMIN',
        },
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}