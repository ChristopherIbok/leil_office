import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import { AwsConfig } from './src/config/aws.config.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    const awsConfig = configService.get<AwsConfig>('aws');

    const region = awsConfig.region;
    const userPoolId = awsConfig.cognito.userPoolId;
    const clientId = awsConfig.cognito.clientId;

    if (!region || !userPoolId) {
      console.warn('JWT Strategy: AWS Cognito variables missing. Cognito auth will not work, but server is starting for local dev.');
    }

    // Only call super if we have the configuration, or provide defaults to avoid crash
    const options = {
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: clientId,
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      algorithms: ['RS256'],
    };

    // @ts-ignore - Allow initialization even if config is incomplete for local dev
    super(region && userPoolId ? options : { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: 'dev-fallback' });
  }

  async validate(payload: any) {
    const user = await this.authService.validateCognitoUser(payload);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}