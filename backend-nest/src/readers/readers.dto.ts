import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReaderDto {
  @IsOptional() @IsString() @MaxLength(20) code?: string; // bỏ trống -> tự sinh R001...
  @IsString() @IsNotEmpty({ message: 'Họ tên không được để trống' }) @MaxLength(100) fullName: string;
  @IsString() @IsNotEmpty({ message: 'Số điện thoại không được để trống' }) @MaxLength(20) phone: string;
  @IsString() @IsNotEmpty({ message: 'Địa chỉ không được để trống' }) @MaxLength(255) address: string;
}
export class UpdateReaderDto extends PartialType(CreateReaderDto) {}
