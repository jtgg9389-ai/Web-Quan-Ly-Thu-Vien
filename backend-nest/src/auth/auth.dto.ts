<<<<<<< HEAD
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
=======
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
>>>>>>> b87cac6dd30c98b70e4b7a9d9940984bb3298348

export class LoginDto {
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() password: string;
}

export class RegisterDto {
  @IsString() @IsNotEmpty({ message: 'Họ tên không được để trống' }) @MaxLength(100) fullName: string;
  @IsString() @IsNotEmpty({ message: 'Số điện thoại không được để trống' }) @MaxLength(20) phone: string;
  @IsString() @IsNotEmpty({ message: 'Địa chỉ không được để trống' }) @MaxLength(255) address: string;
  @IsString() @Matches(/^[a-zA-Z0-9_.]{3,50}$/, { message: 'Tên đăng nhập 3-50 ký tự: chữ, số, _ hoặc .' }) username: string;
  @IsString() @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' }) @MaxLength(100) password: string;
<<<<<<< HEAD
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })@MaxLength(255)email: string;
=======
>>>>>>> b87cac6dd30c98b70e4b7a9d9940984bb3298348
}
