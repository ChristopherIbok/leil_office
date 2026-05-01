import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "chat" })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage("join-channel")
  joinChannel(@ConnectedSocket() socket: Socket, @MessageBody() channelId: string) {
    socket.join(channelId);
    return { channelId };
  }

  // REST persists the message; the socket fan-out keeps active workspaces live.
  @SubscribeMessage("message-created")
  broadcast(@MessageBody() payload: { channelId: string; message: unknown }) {
    this.server.to(payload.channelId).emit("message-created", payload.message);
  }
}
