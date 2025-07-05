import { Controller, Get, Post, Body, Patch,ValidationPipe, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin-dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body(ValidationPipe) signUpDto: SignupDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('refresh')
  async refresh(@Body()refreshTokenDto : RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

}
