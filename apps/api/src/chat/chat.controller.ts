import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AuthUser, CurrentUser } from "../common/decorators/current-user.decorator";
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
  channels(@CurrentUser() user: AuthUser, @Query("projectId") projectId?: string) {
    if (user.role === "CLIENT") {
      return this.chat.channelsForClient(user.sub, projectId);
    }
    return this.chat.channels(projectId);
  }

  @Post("messages")
  @Roles("ADMIN", "TEAM_MEMBER")
  createMessage(@CurrentUser() user: AuthUser, @Body() dto: CreateMessageDto) {
    return this.chat.createMessage(user.sub, dto);
  }

  @Get("channels/:channelId/messages")
  messages(@CurrentUser() user: AuthUser, @Param("channelId") channelId: string) {
    if (user.role === "CLIENT") {
      return this.chat.messagesForClient(channelId, user.sub);
    }
    return this.chat.messages(channelId);
  }
}
