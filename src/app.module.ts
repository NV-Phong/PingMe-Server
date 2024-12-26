import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
   imports: [
      ConfigModule.forRoot({
         envFilePath: ['.env.development', '.env'],
         isGlobal: true,
      }),
      MongooseModule.forRoot(process.env.DATABASE),
      AuthModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
