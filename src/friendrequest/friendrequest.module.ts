import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequest, FriendRequestSchema } from 'src/schema/friendrequest.schema';
import { FriendRequestController } from './friendrequest.controller';
import { FriendRequestService } from './friendrequest.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }]),
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService]
})
export class FriendrequestModule {}
