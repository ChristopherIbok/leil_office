import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "notifications" })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  notifyUser(userId: string, notification: { type: string; message: string; data?: unknown }) {
    this.server.to(`user-${userId}`).emit("notification", notification);
  }

  notifyProject(projectId: string, notification: { type: string; message: string; data?: unknown }) {
    this.server.to(`project-${projectId}`).emit("notification", notification);
  }
}