import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequest, FriendRequestSchema } from 'src/schema/friendrequest.schema';
import { FriendRequestController } from './friendrequest.controller';
import { FriendRequestService } from './friendrequest.service';
import { User, UserSchema } from 'src/schema/use.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema },{ name: User.name, schema: UserSchema },]),
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService]
})
export class FriendrequestModule {}
