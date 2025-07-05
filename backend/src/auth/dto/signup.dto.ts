import { IsEmail, IsString, IsStrongPassword,MinLength } from 'class-validator'

export class SignupDto {

    @IsString()
    username: string;

    @IsString()
    @MinLength(8)
    @IsStrongPassword()
    password: string;

    @IsEmail()
    email: string;
}