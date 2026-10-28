import { Book } from './book.entity';
import { Loan } from './loan.entity';
import { Reader } from './reader.entity';
import { Setting } from './setting.entity';
import { User } from './user.entity';

export { Book, Loan, Reader, Setting, User };
export const ENTITIES = [Setting, Reader, User, Book, Loan];
