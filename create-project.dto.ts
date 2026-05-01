import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  clientId: string; // The client this project belongs to

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}