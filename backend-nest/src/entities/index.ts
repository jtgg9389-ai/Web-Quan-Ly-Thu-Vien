import { Book } from './book.entity';
import { Loan } from './loan.entity';
import { Reader } from './reader.entity';
import { Setting } from './setting.entity';
import { User } from './user.entity';
import { PasswordOtp } from '../password-reset/password-otp.entity'; // [THÊM MỚI]

export { Book, Loan, Reader, Setting, User, PasswordOtp }; // [THÊM MỚI] PasswordOtp
export const ENTITIES = [Setting, Reader, User, Book, Loan, PasswordOtp]; // [THÊM MỚI] PasswordOtp