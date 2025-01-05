import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/schema/message1.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private readonly messageModel: Model<Message>) {}

  // Lưu tin nhắn vào MongoDB theo room
  async saveMessage(senderId: string, room: string, content: string): Promise<Message> {
    const newMessage = new this.messageModel({ senderId, room, content });
    return await newMessage.save();
  }

  // Lấy lịch sử tin nhắn trong phòng
  async getMessages(room: string): Promise<Message[]> {
    return await this.messageModel
      .find({ room })
      .sort({ sentAt: 1 }) // Sắp xếp theo thời gian gửi
      .exec();
  }
}
