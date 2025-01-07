import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from 'src/schema/message.schema';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from 'src/schema/chat.schema';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/schema/use.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Message.name, schema: MessageSchema },
         { name: Chat.name, schema: ChatSchema },
         { name: User.name, schema: UserSchema },
      ]),
   ],
   providers: [ChatGateway, ChatService, UserService],
   controllers: [ChatController],
})
export class ChatModule {}
