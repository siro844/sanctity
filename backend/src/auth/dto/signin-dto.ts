import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator'

export class SigninDto {

    @IsString()
    @MinLength(8)
    @IsStrongPassword()
    password: string;

    @IsEmail()
    email: string;
}