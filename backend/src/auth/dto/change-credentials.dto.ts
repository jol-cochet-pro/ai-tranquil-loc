import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  newEmail: string;

  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/, {
    message:
      'Password must contain at least 1 uppercase, 1 lowercase and 1 digit',
  })
  newPassword: string;
}
