import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FriendRequestStatus } from 'src/types/friend-request.enum'; // Đường dẫn đến file enum của bạn

@Schema()
export class FriendRequest extends Document {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  IDSender: string;

  @Prop({ type: String, required: true })
  IDReceiver: string;

  @Prop({ 
    type: String, 
    enum: FriendRequestStatus, 
    default: FriendRequestStatus.PENDING 
  })
  Status: FriendRequestStatus;

  @Prop({ type: Date, default: Date.now })
  DateRequest: Date;

  @Prop({ type: Boolean, default: false })
  IsDeleted: boolean;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
