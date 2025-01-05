import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from 'src/schema/message.schema';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from 'src/schema/chat.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Message.name, schema: MessageSchema },
         { name: Chat.name, schema: ChatSchema },
      ]),
   ],
   providers: [ChatGateway, ChatService],
   controllers: [ChatController],
})
export class ChatModule {}
