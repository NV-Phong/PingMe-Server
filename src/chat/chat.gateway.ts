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
import { ChatType } from 'src/types/chat-type.enum';

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
      payload: {
         room: string;
         senderId: string;
         content: string;
         chatType: string;
      },
   ): Promise<void> {
      const { room, senderId, content, chatType } = payload;

      if (!senderId || !room || !content || !chatType) {
         console.log('error, thiếu trường dữ liệu');
         client.emit(
            'error',
            'Missing required fields: senderId, room, content',
         );
         return;
      }
      if (chatType === ChatType.GROUP) {
         // **Xử lý tin nhắn nhóm**

         // Nếu client chưa tham gia room, tự động join vào room
         if (!this.server.sockets.adapter.rooms.get(room)?.has(client.id)) {
            client.join(room);
            console.log(`${client.id} đã tham gia phòng: ${room}`);
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
      } else if (chatType === ChatType.PERSONAL) {
         // **Xử lý tin nhắn cá nhân**

         // Gửi tin nhắn trực tiếp đến người nhận (room = ID của người nhận)
         const recipientSocket = this.server.sockets.sockets.get(room);

         if (!recipientSocket) {
            client.emit('error', 'Recipient is not connected');
            return;
         }

         // Lưu tin nhắn vào MongoDB
         const message = await this.chatService.saveMessage(
            senderId,
            room,
            content,
         );

         // Gửi tin nhắn trực tiếp đến người nhận
         recipientSocket.emit('receive-message', message);

         // Xác nhận gửi thành công cho người gửi
         client.emit('message-sent', message);
      } else {
         // Loại `chatType` không hợp lệ
         client.emit('error', 'Invalid chatType');
      }
   }

   // Lấy lịch sử tin nhắn trong phòng
   @SubscribeMessage('get-messages')
   async handleGetMessages(client: Socket, room: string): Promise<void> {
      const messages = await this.chatService.getMessages(room);
      client.emit('chat-history', messages);
   }
}
