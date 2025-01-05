import { Controller, Post, Body, Put, Param, Delete,UseGuards } from '@nestjs/common';
import { FriendRequestService } from './friendrequest.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('friendrequests')
@UseGuards(AuthGuard('jwt'))
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  async sendRequest(@Body() body: { IDSender: string; IDReceiver: string }) {
    return this.friendRequestService.sendRequest(body.IDSender, body.IDReceiver);
  }

  @Put(':id/accept')
  async acceptRequest(@Param('id') IDFriendRequest: string) {
    return this.friendRequestService.acceptRequest(IDFriendRequest);
  }

  @Put(':id/reject')
  async rejectRequest(@Param('id') IDFriendRequest: string) {
    return this.friendRequestService.rejectRequest(IDFriendRequest);
  }

  @Delete(':id')
  async deleteRequest(@Param('id') IDFriendRequest: string) {
    return this.friendRequestService.deleteRequest(IDFriendRequest);
  }
}
