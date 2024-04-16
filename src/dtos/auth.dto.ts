import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}

export class RegisterDTO extends LoginDTO {
    @IsNotEmpty()
    displayName: string;

    @IsOptional()
    @IsBoolean()
    isAdmin: boolean;
}
