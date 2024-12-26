import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './dto/post.dto';

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
}
