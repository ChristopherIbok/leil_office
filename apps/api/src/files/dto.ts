import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateFileRecordDto {
  @IsString()
  projectId: string;

  @IsString()
  url: string;

  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  mimeType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;
}

export class PresignUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  name: string;

  @IsString()
  mimeType: string;
}
