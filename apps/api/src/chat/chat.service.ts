import { Injectable } from "@nestjs/common";
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
}
