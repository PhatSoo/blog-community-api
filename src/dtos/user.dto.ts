import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  @IsNotEmpty()
  readonly displayName: string;

  readonly isAdmin?: boolean;
}
