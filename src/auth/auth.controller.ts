import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './dto/post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
   constructor(private readonly authservice: AuthService) {}

   @Post('register')
   Register(@Body() registerDTO: RegisterDTO) {
      return this.authservice.Register(registerDTO);
   }

   @Post('login')
   Login(@Body() loginDTO: LoginDTO) {
      return this.authservice.Login(loginDTO);
   }

   @Post('refresh-token')
   @UseGuards(AuthGuard('jwt-refresh'))
   RefreshToken(@Req() req) {
      return this.authservice.RefreshAccessToken(req.user);
   }
}
