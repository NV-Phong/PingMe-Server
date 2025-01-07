import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/schema/chat.schema';
import { Message } from 'src/schema/message.schema';
import { MessageStatus } from 'src/types/message-status.enum';
import { MessageType } from 'src/types/message-type.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
   constructor(
      private readonly userService: UserService, // Inject UserService vào constructor
      @InjectModel(Message.name) private readonly messageModel: Model<Message>,
      @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
   ) {}

   // Lưu tin nhắn vào MongoDB theo room
   async saveMessage(
      senderId: string,
      room: string,
      content: string,
      IDReceiver: string,
   ): Promise<Message> {
      const newMessage = new this.messageModel({
         Message: content,
         MessageType: MessageType.TEXT, // Đặt mặc định là TEXT, có thể mở rộng sau
         IDSender: senderId,
         IdChat: room, // Lưu room là ObjectId
         IDReceiver: IDReceiver,
         MessageStatus: MessageStatus.SENT,
      });

      return await newMessage.save(); // Lưu vào MongoDB
   }

   // Lấy lịch sử tin nhắn trong phòng
   async getMessages(room: string): Promise<Message[]> {
      return await this.messageModel
         .find({ IdChat: room }) // Truy vấn theo room
         .sort({ sentAt: 1 }) // Sắp xếp theo thời gian gửi
         .exec();
   }

   async findChatsByMemberId(memberId: string): Promise<Chat[]> {
      // Tìm tất cả các chat mà thành viên tham gia
      return this.chatModel
        .find({
          GroupChat: {
            $elemMatch: { UserId: new Types.ObjectId(memberId) }, // Tìm thành viên trong GroupChat
          },
          IsDeleted: false, // Nếu bạn muốn loại bỏ các chat đã bị xóa
        })
        .exec();
    }
    

   // Tìm đoạn chat PERSONAL giữa 2 user
   async findPersonalChat(
      userId: string,
      targetId: string,
   ): Promise<Chat | null> {
      // Kiểm tra xem đoạn chat giữa hai người đã tồn tại chưa
      const chat = await this.chatModel
         .findOne({
            ChatType: 'PERSONAL', // Loại chat là cá nhân
            GroupChat: {
               $all: [
                  { $elemMatch: { UserId: new Types.ObjectId(userId) } },
                  { $elemMatch: { UserId: new Types.ObjectId(targetId) } },
               ],
            },
         })
         .exec();

      // Nếu không tìm thấy đoạn chat
      if (!chat) {
         return null;
      }

      return chat; // Trả về đoạn chat nếu tìm thấy
   }

   async createOrFindPersonalChat(
      userId: string,
      targetId: string,
   ): Promise<Chat> {
      // Kiểm tra nếu userId và targetId trùng nhau
      if (userId === targetId) {
         throw new Error('Cannot create a personal chat with yourself');
      }
      // Kiểm tra xem đoạn chat giữa hai người đã tồn tại chưa
      let chat = await this.findPersonalChat(userId, targetId); // Sử dụng hàm findPersonalChat đã có

      if (!chat) {
         // Tìm thông tin người dùng
         const user = await this.userService.getUserById(userId); // Tìm người dùng qua userId
         const target = await this.userService.getUserById(targetId); // Tìm người dùng qua targetId

         // Kiểm tra nếu không tìm thấy user hoặc target
         if (!user || !target) {
            throw new Error('User not found');
         }

         // Nếu chưa tồn tại, tạo mới đoạn chat
         chat = new this.chatModel({
            ChatName: `${user.displayName}-${target.displayName}`, // Tên chat tạm thời
            ChatType: 'PERSONAL',
            GroupChat: [
               {
                  UserId: new Types.ObjectId(userId),
                  NickName: user.displayName, // Lưu NickName từ displayName của user
               },
               {
                  UserId: new Types.ObjectId(targetId),
                  NickName: target.displayName,
               },
            ],
         });

         await chat.save(); // Lưu chat vào MongoDB
      }

      return chat; // Trả về chat tìm được hoặc chat mới tạo
   }

   // Lấy chi tiết đoạn chat và lịch sử tin nhắn
   async loadChat(
      chatId: string,
   ): Promise<{ chat: Chat; messages: Message[] }> {
      console.log(chatId);
      // Lấy thông tin đoạn chat
      const chat = await this.chatModel.findById(chatId).exec();

      if (!chat) {
         throw new Error('Chat not found');
      }

      // Lấy danh sách tin nhắn của đoạn chat
      const messages = await this.messageModel
         .find({ IdChat: chatId })
         .sort({ createdAt: 1 }) // Sắp xếp theo thời gian
         .exec();

      return { chat, messages };
   }
}
