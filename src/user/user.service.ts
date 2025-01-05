import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/use.schema';

@Injectable()
export class UserService {
   constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
   ) {}

   async SearchUsersByKeyword(
      keyword: string,
   ): Promise<
      | { displayName: string; email: string; username: string; _id: string }[]
      | { message: string }
   > {
      const users = await this.userModel
         .find({
            $or: [
               { username: { $regex: keyword, $options: 'i' } },
               { email: { $regex: keyword, $options: 'i' } },
               { displayName: { $regex: keyword, $options: 'i' } },
            ],
            isDeleted: { $ne: true },
         })
         .select('displayName email username _id')
         .exec();

      if (users.length === 0) {
         return { message: 'No users found matching the keyword.' };
      }

      return users.map((user) => ({
         _id: user._id.toString(),
         username: user.username,
         email: user.email,
         displayName: user.displayName,
      }));
   }
   // Lấy danh sách bạn bè 
   async getAcceptedFriends(userId: string): Promise<User[]> {
      const user = await this.userModel.findById(userId).exec();
      
      if (!user) {
        throw new Error('User not found');
      }
  
      // Lọc danh sách bạn bè đã chấp nhận (isUnFriend = false và có acceptedDay)
      const acceptedFriendsIds = user.friends
        .filter(friend => !friend.isUnFriend && friend.acceptedDay)
        .map(friend => friend.IDFRIEND);
  
      // Truy vấn các bạn bè có trong danh sách
      return this.userModel.find({ _id: { $in: acceptedFriendsIds } }).exec();
    }
}
