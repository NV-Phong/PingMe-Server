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

  // Chấp nhận lời mời kết bạn
  async acceptRequest(IDFriendRequest: string) {
    const request = await this.friendRequestModel.findOneAndUpdate(
      { IDFriendRequest, Status: FriendRequestStatus.PENDING },
      { Status: FriendRequestStatus.ACCEPTED },
      { new: true },
    );

    if (!request) {
      const errorMessage = 'Friend request not found or already handled.';
      throw new Error(errorMessage);  // Ném lỗi với thông báo tùy chỉnh
    }

    return request;
  }

  // Từ chối lời mời kết bạn
  async rejectRequest(IDFriendRequest: string) {
    const request = await this.friendRequestModel.findOneAndUpdate(
      { IDFriendRequest, Status: FriendRequestStatus.PENDING },
      { Status: FriendRequestStatus.DECLINED },
      { new: true },
    );

    if (!request) {
         const errorMessage ='Friend request not found or already handled.';
         throw new Error(errorMessage);
    }

    return request;
  }

  // Xóa lời mời kết bạn
  async deleteRequest(IDFriendRequest: string) {
    return this.friendRequestModel.findOneAndUpdate(
      { IDFriendRequest },
      { IsDeleted: true },
      { new: true },
    );
  }
}
