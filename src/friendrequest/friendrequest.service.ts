import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {FriendRequest} from 'src/schema/friendrequest.schema';
import { FriendRequestStatus } from 'src/types/friend-request.enum';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
  ) {}

  // Gửi lời mời kết bạn
  async sendRequest(IDSender: string, IDReceiver: string) {
    const existingRequest = await this.friendRequestModel.findOne({
      IDSender,
      IDReceiver,
      Status: FriendRequestStatus.PENDING,
    });

    if (existingRequest) {
      const errorMessage =
      IDSender === existingRequest.IDSender
        ? 'Request already sent and pending from your side.'
        : 'Request already sent and pending from the other user side.';
       throw new HttpException(
                  { message: errorMessage },
                  HttpStatus.BAD_REQUEST,
        );
    }

    const newRequest = new this.friendRequestModel({ IDSender, IDReceiver });
    return newRequest.save();
  }
}
