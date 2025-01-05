import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
   constructor(private readonly chatService: ChatService) {}

   @Get()
   async getChatsByMember(@Request() req) {
      const id = req.user.IDUser;
      return this.chatService.findChatsByMemberId(id);
   }
}
