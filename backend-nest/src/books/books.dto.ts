import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateBookDto {
  @IsOptional() @IsString() @MaxLength(20) code?: string; // bỏ trống -> tự sinh B001...
  @IsString() @IsNotEmpty({ message: 'Tên sách không được để trống' }) @MaxLength(200) title: string;
  @IsString() @IsNotEmpty({ message: 'Tác giả không được để trống' }) @MaxLength(100) author: string;
  @IsString() @IsNotEmpty({ message: 'Thể loại không được để trống' }) @MaxLength(50) category: string;
  @IsInt() @Min(1, { message: 'Số lượng phải từ 1 trở lên' }) @Max(100000) quantity: number;
  @IsOptional() @IsString() @MaxLength(1500000) image?: string; // link hoặc data URL
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
export class UpdateBookDto extends PartialType(CreateBookDto) {}
