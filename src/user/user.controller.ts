import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
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

   @Patch(':id')
   async updateUser(
      @Param('id') id: string,
      @Body() updateData: Partial<Omit<User, '_id' | 'password'>>,
   ) {
      return this.userService.updateUser(id, updateData);
   }

   // GET: /users/infuser/:id
  @Get('infuser/getById')
  async getUser(@Request() req): Promise<User> {
   const id = req.user.IDUser;
   return this.userService.getUserById(id);
  }
}
