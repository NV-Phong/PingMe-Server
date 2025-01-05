import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  room: string;  // Thêm trường room để lưu phòng chat

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  sentAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
