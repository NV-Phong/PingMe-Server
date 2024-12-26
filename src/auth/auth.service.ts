import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/use.schema';
import { RegisterDTO } from './dto/create.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
   constructor(
      @InjectModel(User.name) private usermodel: Model<UserDocument>,
      private readonly jwtservice: JwtService,
   ) {}

   async RegisterNewUser(registerDTO: RegisterDTO): Promise<any> {
      const user = await this.usermodel.findOne({
         $or: [
            { username: registerDTO.username },
            { email: registerDTO.email },
         ],
      });

      if (user) {
         const errorMessage =
            user.username === registerDTO.username
               ? 'User with this UserName already exists'
               : 'User with this Email already exists';
         throw new HttpException(
            { message: errorMessage },
            HttpStatus.CONFLICT,
         );
      }

      if (!registerDTO.username || !registerDTO.password) {
         throw new HttpException(
            {
               message: !registerDTO.username
                  ? 'Username is required'
                  : 'Password is required',
            },
            HttpStatus.BAD_REQUEST,
         );
      } else {
         const HashedPassword = await bcrypt.hash(registerDTO.password, 10);

         await new this.usermodel({
            ...registerDTO,
            password: HashedPassword,
         }).save();

         return {
            message: 'User registered successfully',
            user: { username: registerDTO.username, email: registerDTO.email },
         };
      }
   }
}
