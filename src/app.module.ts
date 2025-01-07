import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { FriendrequestModule } from './friendrequest/friendrequest.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         envFilePath: ['.env.development', '.env'],
         isGlobal: true,
      }),
      MongooseModule.forRoot(process.env.DATABASE),
      AuthModule,
      UserModule,
      ChatModule,
      FriendrequestModule,
      FileModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
