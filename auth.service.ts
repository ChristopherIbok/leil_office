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

  async validateCognitoUser(payload: any) {
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
          password: '', // Password is managed by Cognito, not stored locally
          role: 'CLIENT', // Default role for new users
        },
      });
    }

    return user;
  }

  async register(email: string, pass: string, name: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CLIENT', // Default role
      },
    });

    return this.login(user.email, pass);
  }

  async login(email: string, pass: string) {
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