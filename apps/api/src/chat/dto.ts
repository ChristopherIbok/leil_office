import { IsOptional, IsString } from "class-validator";

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class CreateMessageDto {
  @IsString()
  channelId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  attachmentName?: string;
}
