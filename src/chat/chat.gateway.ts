import {
   WebSocketGateway,
   WebSocketServer,
   SubscribeMessage,
   OnGatewayConnection,
   OnGatewayDisconnect,
   MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway(3002, {
   cors: {
      origin: '*', // Cho phép mọi nguồn kết nối
   },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer() server: Server;

   constructor(private readonly chatService: ChatService) {}

   // Xử lý khi người dùng kết nối
   handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
   }

   // Xử lý khi người dùng ngắt kết nối
   handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
   }

   // Người dùng tham gia vào phòng (room)
   @SubscribeMessage('join-room')
   handleJoinRoom(client: Socket, payload: { room: string }): void {
      const { room } = payload; // Trích xuất tên room từ payload
      if (!room) {
         client.emit('error', 'Room name is required');
         return;
      }
      client.join(room); // Thêm client vào phòng
      this.server
         .to(room)
         .emit('user-joined', { message: `welcome ${client.id}` });
      console.log(`${client.id} joined room: ${room}`);
   }

   // Người dùng gửi tin nhắn đến phòng
   @SubscribeMessage('send-message')
   async handleSendMessage(
      client: Socket,
      payload: { room: string; senderId: string; content: string },
   ): Promise<void> {
      const { room, senderId, content } = payload;

      if (!senderId || !room || !content) {
         console.log('error, thiếu trường dữ liệu');
         client.emit(
            'error',
            'Missing required fields: senderId, room, content',
         );
         return;
      }

      // Kiểm tra nếu client không ở trong room
      if (!this.server.sockets.adapter.rooms.get(room)?.has(client.id)) {
         client.emit('error', 'You are not in this room');
         return;
      }

      // Lưu tin nhắn vào MongoDB
      const message = await this.chatService.saveMessage(
         senderId,
         room,
         content,
      );

      // Gửi tin nhắn đến tất cả người dùng trong phòng
      this.server.to(room).emit('receive-message', message);

      // Xác nhận gửi thành công cho người gửi
      client.emit('message-sent', message);
   }

   // Lấy lịch sử tin nhắn trong phòng
   @SubscribeMessage('get-messages')
   async handleGetMessages(client: Socket, room: string): Promise<void> {
      const messages = await this.chatService.getMessages(room);
      client.emit('chat-history', messages);
   }
}
