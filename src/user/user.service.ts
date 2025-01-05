import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
}
