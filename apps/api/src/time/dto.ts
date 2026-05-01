import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateTimeLogDto {
  @IsString()
  taskId: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
