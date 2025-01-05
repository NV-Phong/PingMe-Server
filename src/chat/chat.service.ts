import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
   ): Promise<Message> {
      const newMessage = new this.messageModel({
         Message: content,
         MessageType: MessageType.TEXT, // Đặt mặc định là TEXT, có thể mở rộng sau
         IDSender: senderId,
         IdChat: room, // Lưu room là ObjectId
         MessageStatus: MessageStatus.SENT,
      });

      return await newMessage.save(); // Lưu vào MongoDB
   }

   // Lấy lịch sử tin nhắn trong phòng
   async getMessages(room: string): Promise<Message[]> {
      return await this.messageModel
         .find({ room })
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
}
