import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/schema/chat.schema';
import { Message } from 'src/schema/message.schema';
import { MessageStatus } from 'src/types/message-status.enum';
import { MessageType } from 'src/types/message-type.enum';

@Injectable()
export class ChatService {
   constructor(
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
      return this.chatModel
         .find({
            'GroupChat.IDMember': memberId, // Truy vấn GroupChatMember.IDMEMBER
            IsDeleted: false, // Nếu bạn muốn loại bỏ các chat đã bị xóa
         })
         .exec();
   }

   async createOrFindPersonalChat(
      userId: string,
      targetId: string,
   ): Promise<Chat> {
      // Kiểm tra xem đoạn chat giữa hai người đã tồn tại chưa
      let chat = await this.chatModel.findOne({
         ChatType: 'PERSONAL',
         GroupChat: {
            $all: [
               { $elemMatch: { UserId: userId } },
               { $elemMatch: { UserId: targetId } },
            ],
         },
      });

      if (!chat) {
         // Nếu chưa tồn tại, tạo mới đoạn chat
         chat = new this.chatModel({
            ChatName: `${userId}-${targetId}`, // Tên chat tạm thời
            ChatType: 'PERSONAL',
            GroupChat: [
               { UserId: new Types.ObjectId(userId) },
               { UserId: new Types.ObjectId(targetId) },
            ],
         });

         await chat.save(); // Lưu chat vào MongoDB
      }

      return chat;
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
