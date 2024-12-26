import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
   _id: Types.ObjectId;

   @Prop({ required: true, unique: true })
   username: string;

   @Prop()
   password: string;

   @Prop({ unique: true })
   email: string;

   @Prop()
   displayName: string;

   @Prop()
   avatar: string;

   @Prop()
   cover: string;

   @Prop()
   birthday: Date;

   @Prop()
   status: Boolean;

   @Prop()
   isDeleted: Boolean;

   @Prop({
      type: [
         {
            IDFRIEND: { type: String },
            acceptedDay: { type: Date },
            isPublic: { type: Boolean },
            isUnFriend: { type: Boolean },
         },
      ],
   })
   friends: Array<{
      IDFRIEND: string;
      acceptedDay: Date;
      isPublic: boolean;
      isUnFriend: boolean;
   }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
