import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser, AuthUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { ChatService } from "./chat.service";
import { CreateChannelDto, CreateMessageDto } from "./dto";

@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post("channels")
  @Roles("ADMIN", "TEAM_MEMBER")
  createChannel(@Body() dto: CreateChannelDto) {
    return this.chat.createChannel(dto);
  }

  @Get("channels")
  channels(@Query("projectId") projectId?: string) {
    return this.chat.channels(projectId);
  }

  @Post("messages")
  createMessage(@CurrentUser() user: AuthUser, @Body() dto: CreateMessageDto) {
    return this.chat.createMessage(user.sub, dto);
  }

  @Get("channels/:channelId/messages")
  messages(@Param("channelId") channelId: string) {
    return this.chat.messages(channelId);
  }
}
