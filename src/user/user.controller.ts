import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get(':keyword')
   GetUserByKeyword(@Param('keyword') keyword: string) {
      return this.userService.SearchUsersByKeyword(keyword);
   }

   @Get(':userId/friends')
   async getFriends(@Param('userId') userId: string) {
     return this.userService.getAcceptedFriends(userId);
   }
}
