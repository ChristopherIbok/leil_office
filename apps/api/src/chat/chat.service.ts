import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateChannelDto, CreateMessageDto } from "./dto";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  createChannel(dto: CreateChannelDto) {
    return this.prisma.channel.create({ data: dto });
  }

  channels(projectId?: string) {
    return this.prisma.channel.findMany({
      where: projectId ? { projectId } : undefined,
      include: { _count: { select: { messages: true } } },
      orderBy: { createdAt: "asc" }
    });
  }

  channelsForClient(clientId: string, projectId?: string) {
    return this.prisma.channel.findMany({
      where: {
        project: {
          OR: [
            { clientId },
            { members: { some: { userId: clientId } } }
          ]
        },
        ...(projectId ? { projectId } : {})
      },
      include: { _count: { select: { messages: true } } },
      orderBy: { createdAt: "asc" }
    });
  }

  createMessage(senderId: string, dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: { ...dto, senderId },
      include: { sender: { select: { id: true, name: true, email: true } } }
    });
  }

  messages(channelId: string) {
    return this.prisma.message.findMany({
      where: { channelId },
      include: { sender: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: 100
    });
  }

  async messagesForClient(channelId: string, clientId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        project: {
          include: { members: true }
        }
      }
    });
    if (!channel?.project) throw new ForbiddenException("Access denied");
    const isMember = channel.project.members.some((m: { userId: string }) => m.userId === clientId);
    const isClient = channel.project.clientId === clientId;
    if (!isMember && !isClient) throw new ForbiddenException("Access denied");
    return this.messages(channelId);
  }
}
