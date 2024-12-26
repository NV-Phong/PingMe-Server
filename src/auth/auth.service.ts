import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/use.schema';
import { LoginDTO, RegisterDTO } from './dto/post.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
   constructor(
      @InjectModel(User.name) private usermodel: Model<UserDocument>,
      private readonly jwtservice: JwtService,
   ) {}

   async Register(registerDTO: RegisterDTO): Promise<any> {
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

   GenerateAccessToken(user: User) {
      const payload = {
         username: user.username,
         sub: user._id,
         email: user.email,
      };
      return this.jwtservice.sign(payload, {
         secret: process.env.ACCESS_TOKEN_SECRET,
         expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      });
   }

   GenerateRefreshToken(user: User) {
      const payload = {
         username: user.username,
         sub: user._id,
         email: user.email,
      };
      return this.jwtservice.sign(payload, {
         secret: process.env.REFRESH_TOKEN_SECRET,
         expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      });
   }

   async Login(login: LoginDTO): Promise<LoginResponse> {
      const user = await this.usermodel.findOne({ username: login.username });
      if (user && (await bcrypt.compare(login.password, user.password))) {
         const AccessToken = this.GenerateAccessToken(user);
         const RefreshToken = this.GenerateRefreshToken(user);

         return {
            access_token: AccessToken,
            refresh_token: RefreshToken,
         };
      }
      throw new HttpException(
         {
            message: 'Invalid credentials, please try again',
            statusCode: HttpStatus.BAD_REQUEST,
         },
         HttpStatus.BAD_REQUEST,
      );
   }

   async RefreshAccessToken(
      refreshaccesstokenDTO: RefreshAccessTokenDTO,
   ): Promise<TokenResponse> {
      try {
         const user = await this.usermodel
            .findById(refreshaccesstokenDTO.IDUser)
            .exec();
         if (!user) {
            throw new HttpException(
               `User with ID ${refreshaccesstokenDTO.IDUser} not found`,
               HttpStatus.NOT_FOUND,
            );
         }
         return { access_token: this.GenerateAccessToken(user) };
      } catch (error) {
         throw new HttpException(
            {
               message: 'Invalid token',
               statusCode: HttpStatus.BAD_REQUEST,
               error: error.message || error,
            },
            HttpStatus.BAD_REQUEST,
         );
      }
   }
}
