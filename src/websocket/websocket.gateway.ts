import { UsersService } from '@module/users/services/user.service';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly userService: UsersService) {}

  // private async emitUserList() {
  //   const users = await this.userService.getLoggedInAgents();
  //   this.server.emit('user-list', users);
  // }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('get-user-list')
  handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageBody?: { pageIndex?: number; pageSize?: number },
  ): void {
    console.log('New client connected:', client.id);
    const pageIndex = messageBody?.pageIndex ?? 1; // Default to 0 if undefined
    const pageSize = messageBody?.pageSize ?? 10;

    // Fetch and emit the current user list to the new client
    this.userService.getLoggedInAgents(pageIndex, pageSize).then((users) => {
      client.emit('user-list', users); // Send the user list to the new client
    });
  }

  async emitUpdatedUserList(pageIndex: number, pageSize: number) {
    const users = await this.userService.getLoggedInAgents(pageIndex, pageSize);
    this.server.emit('user-list', users);
  }
}
