import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChatType } from 'src/types/chat-type.enum';

@Schema({ timestamps: true })
export class Chat extends Document {
   @Prop({ required: true })
   ChatName: string;

   @Prop()
   Avatar: string;

   @Prop({
      required: true,
      enum: ChatType,
      default: ChatType.PERSONAL,
      type: String,
   })
   ChatType: ChatType;

   @Prop({ default: false })
   IsDeleted: boolean;

   @Prop()
   GroupChat: GroupChatMember[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
