import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your specific frontend URL
  },
  namespace: 'tasks',
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinProject')
  handleJoinProject(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`project_${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`project_${projectId}`);
  }

  notifyTaskUpdate(projectId: string, data: any) {
    this.server.to(`project_${projectId}`).emit('taskUpdated', data);
  }
}