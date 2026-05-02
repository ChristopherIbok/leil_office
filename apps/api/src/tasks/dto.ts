import { IsArray, IsDateString, IsOptional, IsString, IsIn, ValidateIf } from "class-validator";

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(["TODO", "IN_PROGRESS", "REVIEW" , "DONE"])
  status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== null)
  @IsString()
  assigneeId?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.dueDate !== null)
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
