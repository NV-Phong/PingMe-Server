import {
   Body,
   Controller,
   Get,
   Param,
   Post,
   Request,
   UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { Chat } from 'src/schema/chat.schema';
import { Message } from 'src/schema/message.schema';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
   constructor(private readonly chatService: ChatService) {}

   @Get()
   async getChatsByMember(@Request() req) {
      const id = req.user.IDUser;
      return this.chatService.findChatsByMemberId(id);
   }

   @Post('personal/:IDReceiver')
   async createOrFindPersonalChat(
      @Request() req,
      @Param('IDReceiver') IDReceiver: string,
   ): Promise<Chat> {
      const userId = req.user.IDUser;
      const chat = await this.chatService.createOrFindPersonalChat(
         userId,
         IDReceiver,
      );
      return chat;
   }

   @Get('loadchat/:chatId')
   async loadChat(
      @Param('chatId') chatId: string,
   ): Promise<{ chat: Chat; messages: Message[] }> {
      const data = await this.chatService.loadChat(chatId);
      return data;
   }
}
