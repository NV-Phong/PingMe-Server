import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/create.dto';

@Controller('auth')
export class AuthController {
   constructor(private readonly authservice: AuthService) {}

   @Post('register')
   Register(@Body() registerDTO: RegisterDTO) {
      return this.authservice.RegisterNewUser(registerDTO);
   }
}
