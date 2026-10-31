# Hướng dẫn làm Backend (NestJS) – ở nhà và ở trường

Backend dùng **NestJS + TypeORM**. Chỉ cần đổi file `.env` là chuyển giữa:
- **Ở nhà (Codespaces):** `DB_TYPE=sqlite`, không cần cài MySQL.
- **Thứ 7 ở trường:** `DB_TYPE=mysql`, kết nối MySQL thật. Code không phải sửa.

---

### 1. Đưa code vào Codespaces
1. Tải `backend-nest.zip` về máy, mở Codespaces của repo.
2. Trong **Explorer**, nhấn chuột phải vào vùng trống, chọn **Upload...**, chọn file zip.
3. Mở **Terminal** (Ctrl + `) và chạy:
```bash
unzip backend-nest.zip
rm -rf my-app          # xóa dự án nest new cũ (không cần nữa)
cd backend-nest
```

### 2. Cài thư viện và chạy
```bash
npm install
cp .env.example .env
npm run db:seed        # tạo bảng và nạp dữ liệu mẫu
npm run start:dev      # chạy server
```
Thấy dòng `🚀 API chạy tại http://localhost:3000/api` là được.

### 3. Mở thử
- Codespaces hiện thông báo cổng 3000, bấm **Open in Browser**, thêm đuôi `/api/health`.
- Kết quả đúng: `{"status":"ok","database":"connected","type":"sqljs",...}`

### 4. Chạy bộ kiểm tra tự động
Mở **terminal thứ hai** (dấu `+`), rồi:
```bash
cd backend-nest
npm run smoke
```
Phải ra `35 đạt, 0 lỗi`.

### 5. Đẩy lên GitHub (để mang đến trường)
```bash
cd ..                  # về thư mục gốc của repo
git add .
git commit -m "Backend NestJS"
git push
```

---

### 1. Chuẩn bị máy trường
- Cài **Node.js 18** (kiểm tra `node -v`), **Git**, **VS Code**.
- Cài **XAMPP**, mở XAMPP Control Panel, bấm **Start** ở dòng **MySQL**.
  (Nếu trường đã có MySQL sẵn thì hỏi thầy/cô user và mật khẩu.)

### 2. Lấy code về
```powershell
git clone https://github.com/<ten-ban>/Web-Quan-Ly-Thu-Vien.git
cd Web-Quan-Ly-Thu-Vien\backend-nest
npm install
copy .env.example .env
```

### 3. Sửa file `.env`
```
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # XAMPP: để trống. MySQL cài riêng: điền mật khẩu
DB_NAME=quan_ly_thu_vien
```

### 4. Tạo database, nạp dữ liệu, chạy
```powershell
npm run db:create
npm run db:seed
npm run start:dev
```
Mở `http://localhost:3000/api/health`, phải thấy `"type":"mysql"`.

### 5. Xem dữ liệu trong MySQL
Mở `http://localhost/phpmyadmin`, chọn database `quan_ly_thu_vien`, sẽ thấy 5 bảng: `books`, `readers`, `users`, `loans`, `settings`.
Chạy `npm run smoke` (terminal khác) để kiểm tra lại trên MySQL.

### Lỗi thường gặp
| Thông báo | Cách xử lý |
|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL chưa bật. Mở XAMPP bấm Start MySQL |
| `Access denied for user 'root'` | Sai `DB_PASSWORD` trong `.env` |
| `Unknown database` | Chưa chạy `npm run db:create` |
| `EADDRINUSE :3000` | Cổng 3000 đang bận. Đổi `PORT=3001` trong `.env` |
| `nest` không nhận lệnh | Dùng `npm run start:dev`, không gõ `nest` trực tiếp |

---

## C. Danh sách API

Gọi kèm header `Authorization: Bearer <accessToken>` (trừ đăng nhập/đăng ký).

| Nhóm | Method và đường dẫn | Quyền |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | Công khai / đã đăng nhập |
| Sách | `GET /api/books?search=&category=&page=&limit=`, `GET /api/books/:id` | Mọi người dùng |
| | `POST /api/books`, `PATCH /api/books/:id`, `DELETE /api/books/:id` | Admin, Thủ thư |
| Độc giả | `GET/POST /api/readers`, `GET/PATCH/DELETE /api/readers/:id` | Admin, Thủ thư |
| Phiếu | `GET /api/loans?status=all\|active\|returned\|overdue&search=` | Admin, Thủ thư |
| | `POST /api/loans` (lập phiếu mượn), `POST /api/loans/:id/return` (trả sách) | Admin, Thủ thư |
| | `GET /api/loans/my` | Độc giả (phiếu của mình) |
| Báo cáo | `GET /api/reports/summary`, `/categories`, `/top-books`, `/loans-by-month` | Admin, Thủ thư |
| Cài đặt | `GET /api/settings` (Admin, Thủ thư), `PUT /api/settings` | Admin |
| Tài khoản | `GET /api/users`, `PATCH /api/users/:id/role`, `DELETE /api/users/:id` | Admin |

Ví dụ nhanh bằng curl:
```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
curl -s localhost:3000/api/books -H "Authorization: Bearer $TOKEN"
```

## D. Quy tắc nghiệp vụ đã cài sẵn
- Lập phiếu mượn: trừ số sách còn lại, hết sách thì báo lỗi, hạn trả = ngày mượn + số ngày mặc định.
- Trả sách: ghi ngày trả, **tiền phạt = số ngày trễ × mức phạt/ngày**, cộng lại số sách.
- Không xóa sách hoặc độc giả đã có phiếu mượn. Không giảm số lượng sách thấp hơn số đang cho mượn.
- Mật khẩu băm bằng bcrypt, đăng nhập bằng JWT, phân quyền Admin / Thủ thư / Độc giả.

## E. Swagger – trang tài liệu API

Chạy server rồi mở **http://localhost:3000/api-docs**. Trang liệt kê toàn bộ API theo nhóm (App, Auth, Books, Readers, Loans, Reports, Settings, Users) và cho bấm **Try it out** để thử ngay.

Cách thử các API cần đăng nhập:
1. Mở `POST /api/auth/login`, bấm **Try it out**, nhập `{"username":"admin","password":"admin123"}`, bấm **Execute**.
2. Copy giá trị `accessToken` trong kết quả.
3. Bấm nút **Authorize** (ổ khóa, góc trên phải trang), dán token vào, bấm **Authorize**.
4. Từ giờ các API khác (có ổ khóa) gọi được bình thường.

## F. Refresh token và cookie

- `POST /api/auth/login` trả `accessToken` (sống ngắn, mặc định 15 phút) và **set refresh token vào cookie httpOnly** (JavaScript trong trình duyệt không đọc được, an toàn hơn lưu localStorage).
- Khi access token hết hạn, gọi `POST /api/auth/refresh` (trình duyệt tự gửi cookie) để lấy access token mới. Mỗi lần refresh, refresh token cũ bị thay bằng token mới.
- `POST /api/auth/logout` thu hồi refresh token trong CSDL và xóa cookie. Token cũ dùng lại sẽ bị từ chối (401).
- Mỗi tài khoản có một refresh token đang hợp lệ: đăng nhập ở nơi khác sẽ làm phiên cũ phải đăng nhập lại.
- Khi gọi từ giao diện web, `fetch` cần thêm `credentials: 'include'` để gửi và nhận cookie.
- Các biến mới trong `.env`: `JWT_EXPIRES_IN=15m`, `JWT_REFRESH_SECRET=<chuỗi khác JWT_SECRET>`, `JWT_REFRESH_DAYS=7`.

## G. Bước tiếp theo
Nối giao diện web (file HTML) với các API này, thay dữ liệu localStorage bằng `fetch`.
