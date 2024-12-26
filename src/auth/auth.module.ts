import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/use.schema';
import { JwtModule } from '@nestjs/jwt';
import {
   JwtStrategy,
   RefreshTokenStrategy,
} from 'src/configuration/jwt.strategy';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      JwtModule.register({
         secret: process.env.JWT_SECRET,
         signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
   ],
   providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
   controllers: [AuthController],
})
export class AuthModule {}
