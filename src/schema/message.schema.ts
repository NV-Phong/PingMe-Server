import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Emotion } from 'src/types/emotion.enum';
import { MessageStatus } from 'src/types/message-status.enum';
import { MessageType } from 'src/types/message-type.enum';

@Schema({ timestamps: true })
export class Message extends Document {
   @Prop({ required: true })
   Message: string;

   @Prop({
      required: true,
      enum: MessageType,
      default: MessageType.TEXT,
      type: String,
   })
   MessageType: MessageType;

   @Prop({ default: Date.now })
   CreateAt: Date;

   @Prop({ default: false })
   IsDeleted: boolean;

   @Prop({ required: true })
   IDSender: String;

   @Prop({ type: String, enum: MessageStatus, default: MessageStatus.SENT })
   MessageStatus: MessageStatus;

   @Prop({ type: String })
   Emotion: Emotion;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
