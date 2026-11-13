import { Book } from './book.entity';
import { Loan } from './loan.entity';
import { Reader } from './reader.entity';
import { Setting } from './setting.entity';
import { User } from './user.entity';
<<<<<<< HEAD
import { PasswordOtp } from '../password-reset/password-otp.entity'; // [THÊM MỚI]

export { Book, Loan, Reader, Setting, User, PasswordOtp }; // [THÊM MỚI] PasswordOtp
export const ENTITIES = [Setting, Reader, User, Book, Loan, PasswordOtp]; // [THÊM MỚI] PasswordOtp
=======

export { Book, Loan, Reader, Setting, User };
export const ENTITIES = [Setting, Reader, User, Book, Loan];
>>>>>>> b87cac6dd30c98b70e4b7a9d9940984bb3298348
