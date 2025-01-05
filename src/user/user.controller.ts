import {
   Body,
   Controller,
   Get,
   Request,
   Param,
   Post,
   UseGuards,
   Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/schema/use.schema';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get(':keyword')
   GetUserByKeyword(@Param('keyword') keyword: string) {
      return this.userService.SearchUsersByKeyword(keyword);
   }

   @Get('list/friend')
   async getFriends(@Request() req) {
      if (!req.user || !req.user.IDUser) {
         throw new Error('User not found in request');
      }
      const IDUser = req.user.IDUser;
      return this.userService.getAcceptedFriends(IDUser);
   }

   @Post('unfriend/:IDFriend')
   async unfriend(@Param('IDFriend') IDFriend: string, @Request() req) {
      if (!req.user || !req.user.IDUser) {
         throw new Error('User not found in request');
      }
      const IDUser = req.user.IDUser; // Lấy IDUser từ token

      return this.userService.unfriend(IDUser, IDFriend); // Gọi service để hủy kết bạn
   }

   @Patch(':id')
   async updateUser(
      @Param('id') id: string,
      @Body() updateData: Partial<Omit<User, '_id' | 'password'>>,
   ) {
      return this.userService.updateUser(id, updateData);
   }

   @Get('infuser/getById')
   async getUser(@Request() req): Promise<User> {
      const id = req.user.IDUser;
      return this.userService.getUserById(id);
   }
}
