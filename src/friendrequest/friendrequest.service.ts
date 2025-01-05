import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {FriendRequest} from 'src/schema/friendrequest.schema';
import { FriendRequestStatus } from 'src/types/friend-request.enum';
import { User } from 'src/schema/use.schema'; 
import { UserService } from 'src/user/user.service';
@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
    @InjectModel(User.name) private userModel: Model<User>,
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

    const newRequest = new this.friendRequestModel({ 
      IDSender,
      IDReceiver,
      Status: FriendRequestStatus.PENDING,
    });

    return newRequest.save();
  }
  async acceptRequest(friendRequestId: string): Promise<{ message: string }> {
    // Tìm yêu cầu kết bạn với trạng thái PENDING
    const request = await this.friendRequestModel.findOneAndUpdate(
      { _id: friendRequestId, Status: FriendRequestStatus.PENDING },
      { Status: FriendRequestStatus.ACCEPTED },
      { new: true },
    );
  
    if (!request) {
      throw new HttpException(
        { message: 'Friend request not found or already handled.' },
        HttpStatus.BAD_REQUEST,  // Trả về mã lỗi 400 nếu không tìm thấy yêu cầu
      );
    }
  
    const { IDSender, IDReceiver } = request; // Lấy ID của người gửi và người nhận từ yêu cầu
  
    try {
      // Tìm người gửi và người nhận
      const sender = await this.userModel.findById(IDSender);
      const receiver = await this.userModel.findById(IDReceiver);
  
      if (!sender || !receiver) {
        throw new NotFoundException('User not found.');
      }
  
      // Cập nhật danh sách bạn bè của người gửi
      sender.friends.push({
        IDFRIEND: IDReceiver,
        acceptedDay: new Date(),
        isPublic: true,
        isUnFriend: false,
      });
  
      // Cập nhật danh sách bạn bè của người nhận
      receiver.friends.push({
        IDFRIEND: IDSender,
        acceptedDay: new Date(),
        isPublic: true,
        isUnFriend: false,
      });
  
      // Lưu lại thông tin
      await sender.save();
      await receiver.save();
  
      return { message: 'Friend request accepted successfully.' }; // Thông báo thành công
    } catch (error) {
      throw new HttpException(
        { message: 'Error updating friends list.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  async declineRequest(IDSender: string, IDReceiver: string, IDFriendRequest: string) {
    const request = await this.friendRequestModel.findOneAndUpdate(
      { _id: IDFriendRequest, Status: FriendRequestStatus.PENDING },
      { Status: FriendRequestStatus.DECLINED },
      { new: true },
    );

    if (!request) {
      throw new HttpException(
        { message: 'Friend request not found or already handled.' },
        HttpStatus.BAD_REQUEST,  // Trả về mã lỗi 400 nếu không tìm thấy yêu cầu
      );
    }

    return {
      message: 'Friend request declined successfully.',
      request,
    };
  }
// Lấy tất cả yêu cầu kết bạn PENDING của người dùng
  async getPendingRequestsForUser(IDReceiver: string) {
    const requests = await this.friendRequestModel
      .find({ IDReceiver, Status: FriendRequestStatus.PENDING })
      .populate('IDSender', 'username' ) // Populating thông tin người gửi nếu cần (username, hoặc các thông tin khác)
      .exec();

    if (!requests || requests.length === 0) {
      throw new NotFoundException('No pending friend requests found.');
    }

    return requests.map(request => ({
      IDSender: request.IDSender,
      DateRequest: request.DateRequest,
      Status: request.Status,
    }));
  }
}
