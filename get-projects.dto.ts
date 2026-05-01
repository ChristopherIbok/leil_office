import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetProjectsDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 10;
}