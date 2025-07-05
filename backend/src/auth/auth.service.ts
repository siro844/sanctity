import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin-dto';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ref } from 'process';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService, private jwtService: JwtService) { }
  async signup(signUpDto: SignupDto) {
    const { email, password, username } = signUpDto;
    const user = await this.databaseService.user.findUnique({
      where: {
        email: email,
      }
    })
    if (user) {
      throw new BadRequestException("Email In Use")
    }
    const usernameTaken = await this.databaseService.user.findUnique({
      where: {
        username: username,
      }
    })
    if (user) {
      throw new BadRequestException("Username In Use")
    }

    const hashedPassword = await bcrypt.hash(password, 5)
    signUpDto.password = hashedPassword;

    await this.databaseService.user.create({ data: signUpDto });
    return { message: "User created successfully" };

  }
  async signin(signInDto: SigninDto) {
    const { email, password } = signInDto;
    const user = await this.databaseService.user.findUnique({
      where: {
        email: email,
      }
    })
    if (!user) {
      throw new UnauthorizedException("Wrong Credentials")
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException("Wrong Credentials")
    }
    return this.generateUserTokens(user.id);
  }


  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });

    const refreshToken = uuidv4();
    this.storeRefreshToken(userId, refreshToken);
    return {
      accessToken,
      refreshToken,
    }
  }
  async storeRefreshToken(userId: number, refreshToken: string) {
    const existingToken = await this.databaseService.refreshToken.findUnique({
      where: { userId },
    });
    if (existingToken) {
      await this.databaseService.refreshToken.update({
        where: { userId },
        data: { token: refreshToken, expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      });
    }
    else {
      await this.databaseService.refreshToken.create({
        data: {
          userId,
          token: refreshToken,
          expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  async refresh(refreshTokenDto :RefreshTokenDto){
    const { token } = refreshTokenDto;
    const existingToken = await this.databaseService.refreshToken.findFirst({
      where: {
        token: token,
      },
    });
    if (!existingToken) {
      throw new UnauthorizedException("Invalid Refresh Token");
    }
    if (existingToken.expiration < new Date()) {
      throw new UnauthorizedException("Refresh Token Expired");
    }
    const userId = existingToken.userId;
    return this.generateUserTokens(userId);
  }

}
