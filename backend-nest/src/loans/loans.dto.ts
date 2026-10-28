import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateLoanDto {
  @IsInt() readerId: number;
  @IsInt() bookId: number;
  @IsOptional() @Matches(DATE, { message: 'Ngày mượn phải có dạng YYYY-MM-DD' }) borrowDate?: string;
  @IsOptional() @IsInt() @Min(1) @Max(365) days?: number; // bỏ trống -> dùng số ngày mặc định trong cài đặt
}

export class ReturnLoanDto {
  @IsOptional() @Matches(DATE, { message: 'Ngày trả phải có dạng YYYY-MM-DD' }) returnDate?: string; // bỏ trống -> hôm nay
}
