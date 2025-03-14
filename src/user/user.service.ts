import {
   HttpException,
   HttpStatus,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { FollowDTO } from './dto/follow.dto';

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
         .select('displayName email username _id cover avatar')
         .exec();

      if (users.length === 0) {
         return { message: 'No users found matching the keyword.' };
      }

      return users.map((user) => ({
         _id: user._id.toString(),
         username: user.username,
         email: user.email,
         displayName: user.displayName,
         cover: user.cover,
         avatar: user.avatar,
      }));
   }
   // Lấy danh sách bạn bè
   async getAcceptedFriends(IDUser: string): Promise<User[]> {
      const user = await this.userModel.findById(IDUser).exec();

      if (!user) {
         throw new Error('User not found');
      }

      // Lọc danh sách bạn bè đã chấp nhận (isUnFriend = false và có acceptedDay)
      const acceptedFriendsIds = user.friends
         .filter((friend) => !friend.isUnFriend && friend.acceptedDay)
         .map((friend) => friend.IDFRIEND);

      // Truy vấn các bạn bè có trong danh sách
      return this.userModel.find({ _id: { $in: acceptedFriendsIds } }).exec();
   }

   async unfriend(
      IDUser: string,
      IDFriend: string,
   ): Promise<{ message: string }> {
      const user = await this.userModel.findById(IDUser);
      const friend = await this.userModel.findById(IDFriend);

      if (!user || !friend) {
         throw new NotFoundException('User or friend not found.');
      }

      // Xóa bạn khỏi danh sách của người dùng
      user.friends = user.friends.filter((f) => f.IDFRIEND !== IDFriend);

      // Xóa bạn khỏi danh sách của người bạn
      friend.friends = friend.friends.filter((f) => f.IDFRIEND !== IDUser);

      // Lưu lại cả hai người dùng với danh sách bạn bè đã cập nhật
      await user.save();
      await friend.save();

      return { message: 'Unfriended successfully.' };
   }

   async updateUser(
      id: string,
      updateData: Partial<Omit<User, '_id' | 'password'>>,
   ): Promise<User> {
      // Kiểm tra nếu id không hợp lệ
      if (!Types.ObjectId.isValid(id)) {
         throw new NotFoundException(`User with ID "${id}" not found`);
      }

      // Cập nhật thông tin người dùng
      const updatedUser = await this.userModel
         .findByIdAndUpdate(
            id,
            { $set: updateData }, // Chỉ cập nhật các thuộc tính được truyền
            { new: true, runValidators: true }, // Trả về document sau khi cập nhật
         )
         .exec();

      if (!updatedUser) {
         throw new NotFoundException(`User with ID "${id}" not found`);
      }

      return updatedUser;
   }

   // Lấy thông tin user theo ID
   async getUserById(id: string): Promise<User> {
      try {
         const user = await this.userModel.findById(id).exec();
         if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
         }
         return user;
      } catch (error) {
         throw new NotFoundException(`User with ID "${id}" not found`);
      }
   }

   // Thêm 1 Following
   async addFollowing(followDTO: FollowDTO) {
      const [userFollowing, userFollower] = await Promise.all([
         this.userModel.findById(followDTO.IDUser).exec(),
         this.userModel.findById(followDTO.IDFollowing).exec(),
      ]);

      if (!userFollowing || !userFollower) {
         throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (
         userFollowing.Follow?.some(
            (follow) => follow.Following === followDTO.IDFollowing,
         )
      ) {
         throw new HttpException(
            'Already following this user',
            HttpStatus.BAD_REQUEST,
         );
      }

      // Thêm người theo dõi vào mảng Follow
      userFollowing.Follow?.push({ Following: followDTO.IDFollowing });
      userFollower.Follow?.push({ Follower: followDTO.IDUser });

      // Cập nhật số lượng người theo dõi và đang theo dõi
      userFollowing.NumberOfFollowing =
         (userFollowing.NumberOfFollowing || 0) + 1;
      userFollower.NumberOfFollowers =
         (userFollower.NumberOfFollowers || 0) + 1;

      // Lưu các thay đổi
      await Promise.all([userFollowing.save(), userFollower.save()]);

      return { message: 'Followed successfully' };
   }

   async getUserStats(IDUser: string) {
      const user = await this.userModel.findById(IDUser);
      if (!user) {
         throw new Error('User not found');
      }

      return {
         numberOfFollowers: user.NumberOfFollowers,
         numberOfFollowing: user.NumberOfFollowing,
      };
   }
}
