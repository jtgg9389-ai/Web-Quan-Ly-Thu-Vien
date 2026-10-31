# Kết nối Frontend (React) với Backend (NestJS + MySQL)

Sau bản cập nhật này, frontend **không còn dùng localStorage**: mọi dữ liệu đọc/ghi qua API backend, lưu vào MySQL.

## 1. Cập nhật code
1. Giải nén `ket-noi-frontend-backend.zip` **đè** vào thư mục `Web-Quan-Ly-Thu-Vien` (chọn Replace).
2. **Xóa thủ công** file không còn dùng: `frontend-react/src/lib/seed.ts`.
3. File `.gitignore` mới sẽ chặn `node_modules`, `dist`, `data`, `.env` khi push lên GitHub.

## 2. Chạy (mở 2 terminal)

**Terminal 1 – Backend** (bật MySQL/XAMPP trước):
```powershell
cd backend-nest
npm install
npm run start:dev
```
Thấy `🚀 API chạy tại http://localhost:3000/api`. Vì `DB_SYNC=true`, TypeORM tự thêm 2 cột mới `image` và `description` vào bảng `books` trong MySQL. Nếu CSDL còn trống thì chạy `npm run db:create` và `npm run db:seed` trước.

**Terminal 2 – Frontend:**
```powershell
cd frontend-react
npm install
npm run dev
```
Mở `http://localhost:5173`, đăng nhập `admin / admin123`.

## 3. Cách hoạt động
- Vite chuyển tiếp mọi yêu cầu `/api/...` sang `http://localhost:3000` (file `vite.config.ts`), nên trình duyệt chỉ gọi một địa chỉ, không vướng CORS và cookie hoạt động bình thường.
- Đăng nhập: backend trả access token (giữ trong bộ nhớ trang) và đặt refresh token vào cookie httpOnly. Tải lại trang (F5) vẫn giữ đăng nhập nhờ `POST /api/auth/refresh`. Access token hết hạn thì frontend tự refresh rồi gọi lại.
- Sách, độc giả, phiếu mượn – trả, cài đặt, tài khoản đều gọi API. Số còn lại, ngày trễ, tiền phạt do backend tính.
- Độc giả chỉ tải sách và phiếu của chính mình (`/loans/my`). Admin và thủ thư tải đầy đủ. Phân quyền do backend kiểm tra.
- Ảnh bìa tải lên được lưu trong cột `image` của bảng `books` (MEDIUMTEXT với MySQL).

## 4. Kiểm tra đã nối được chưa
Mở DevTools (F12), tab **Network**, đăng nhập rồi thêm một sách. Phải thấy các request `/api/auth/login`, `/api/books`... Mở phpMyAdmin hoặc MySQL Workbench, bảng `books` sẽ có sách vừa thêm. Tắt backend thì web báo "Không kết nối được máy chủ".

## 5. Khác với bản cũ
- Nút "Khôi phục dữ liệu mẫu" trong Cài đặt đã bỏ. Muốn nạp lại dữ liệu mẫu, chạy `npm run db:seed -- --force` ở `backend-nest` (xóa toàn bộ dữ liệu).
- Dữ liệu cũ trong localStorage của trình duyệt không được chuyển sang MySQL.
- Xóa sách hoặc độc giả đã từng có phiếu mượn sẽ bị từ chối (cả phiếu đã trả), để giữ lịch sử.
- Mỗi danh sách tải tối đa 500 dòng (đủ cho đồ án; thư viện lớn hơn cần thêm phân trang trên giao diện).

## 6. Lỗi thường gặp
| Hiện tượng | Cách xử lý |
|---|---|
| "Không kết nối được máy chủ" | Backend chưa chạy hoặc không ở cổng 3000. Nếu đổi `PORT`, sửa `target` trong `vite.config.ts` |
| Lỗi 500 khi lưu sách | MySQL chưa có cột mới. Kiểm tra `DB_SYNC=true` trong `.env` rồi chạy lại backend |
| Ảnh bìa lớn bị từ chối | Ảnh tải lên được thu nhỏ tự động (tối đa 360px). Link ảnh quá dài (trên 1,5 triệu ký tự) sẽ bị từ chối |
| Đăng nhập xong F5 bị đá ra | Cookie bị chặn. Truy cập qua `http://localhost:5173` (không dùng địa chỉ IP) |
| Triển khai thật | Đặt `VITE_API_URL=https://.../api` khi build frontend, và `CORS_ORIGIN=https://...` ở backend |
