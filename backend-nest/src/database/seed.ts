// Nạp dữ liệu mẫu. Dùng: npm run db:seed  (thêm -- --force để xóa và nạp lại)
import { hashSync } from 'bcryptjs';
import { Role } from '../common/role.enum';
import { addDays, today } from '../common/utils';
import { Book, Loan, Reader, Setting, User } from '../entities';
import { AppDataSource } from './data-source';

const day = (n: number) => addDays(today(), n);

async function main() {
  const force = process.argv.includes('--force');
  const ds = await AppDataSource.initialize();
  try {
    if ((await ds.getRepository(User).count()) > 0 && !force) {
      console.log('ℹ️ Đã có dữ liệu. Dùng "npm run db:seed -- --force" để xóa và nạp lại.');
      return;
    }
    // Xóa theo thứ tự khóa ngoại (chạy được cả MySQL và SQLite)
    for (const t of ['loans', 'users', 'books', 'readers', 'settings']) await ds.query(`DELETE FROM ${t}`);

    await ds.transaction(async (m) => {
      await m.save(Setting, [
        { key: 'loan_days', value: '14' },
        { key: 'fine_per_day', value: '5000' },
      ]);
      const books = await m.save(Book, [
        { code: 'B001', title: 'Đắc nhân tâm', author: 'Dale Carnegie', category: 'Kỹ năng', quantity: 5, available: 5 },
        { code: 'B002', title: 'Nhà giả kim', author: 'Paulo Coelho', category: 'Văn học', quantity: 4, available: 4 },
        { code: 'B003', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Lịch sử', quantity: 3, available: 3 },
        { code: 'B004', title: 'Clean Code', author: 'Robert C. Martin', category: 'Công nghệ', quantity: 2, available: 2 },
        { code: 'B005', title: 'Dế Mèn phiêu lưu ký', author: 'Tô Hoài', category: 'Thiếu nhi', quantity: 6, available: 6 },
        { code: 'B006', title: 'Tư duy nhanh và chậm', author: 'Daniel Kahneman', category: 'Tâm lý', quantity: 3, available: 3 },
      ]);
      const readers = await m.save(Reader, [
        { code: 'R001', fullName: 'Nguyễn Văn An', phone: '0901234567', address: 'Quận 1, TP.HCM' },
        { code: 'R002', fullName: 'Trần Thị Bình', phone: '0912345678', address: 'Quận 3, TP.HCM' },
        { code: 'R003', fullName: 'Lê Minh Châu', phone: '0987654321', address: 'Thủ Đức, TP.HCM' },
        { code: 'R004', fullName: 'Phạm Quốc Dũng', phone: '0933222111', address: 'Bình Thạnh, TP.HCM' },
      ]);
      const users = await m.save(User, [
        { username: 'admin', passwordHash: hashSync('admin123', 10), fullName: 'Quản trị viên', role: Role.Admin },
        { username: 'thuthu', passwordHash: hashSync('thuthu123', 10), fullName: 'Thủ thư Mai', role: Role.Librarian },
        { username: 'docgia', passwordHash: hashSync('docgia123', 10), fullName: 'Nguyễn Văn An', role: Role.Reader, reader: readers[0] },
      ]);
      const by = users[1];
      await m.save(Loan, [
        { code: 'P001', reader: readers[0], book: books[0], borrowDate: day(-20), dueDate: day(-6), returnDate: null, createdBy: by },
        { code: 'P002', reader: readers[1], book: books[3], borrowDate: day(-5), dueDate: day(9), returnDate: null, createdBy: by },
        { code: 'P003', reader: readers[2], book: books[1], borrowDate: day(-30), dueDate: day(-16), returnDate: day(-18), createdBy: by },
        { code: 'P004', reader: readers[3], book: books[2], borrowDate: day(-3), dueDate: day(11), returnDate: null, createdBy: by },
      ]);
      // Số còn lại = tổng - số phiếu chưa trả
      await m.query(`UPDATE books SET available = quantity -
        (SELECT COUNT(*) FROM loans WHERE loans.book_id = books.id AND loans.return_date IS NULL)`);
    });
    console.log('✅ Đã nạp dữ liệu mẫu. Tài khoản: admin/admin123, thuthu/thuthu123, docgia/docgia123');
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error('❌ Lỗi nạp dữ liệu:', e.message);
  process.exit(1);
});
