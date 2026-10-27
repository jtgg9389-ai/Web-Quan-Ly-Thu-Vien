# 📚 Quản lý thư viện
## ✨ Tính năng

### Quản lý sách
- Thêm, sửa, xóa, tìm kiếm theo mã, tên, tác giả, thể loại.
- Quản lý mã sách, tên sách, tác giả, thể loại, số lượng.
- Hiển thị số lượng còn lại, đánh dấu "Hết" khi không còn sách.

### Quản lý độc giả
- Lưu mã độc giả, họ tên, số điện thoại, địa chỉ.
- Thêm, sửa, xóa và tra cứu thông tin.

### Mượn – trả sách
- Lập phiếu mượn: ghi nhận ngày mượn, tự tính hạn trả.
- Lập phiếu trả: ghi nhận ngày trả, tự tính tiền phạt nếu trễ hạn.
- Tự động cập nhật số lượng sách còn lại.
- Chặn xóa sách đang cho mượn hoặc độc giả còn nợ sách.

### Thống kê và báo cáo
- Thống kê số lượng sách theo thể loại, tồn kho.
- Danh sách sách đang được mượn.
- Danh sách sách quá hạn và tiền phạt.
- Sách được mượn nhiều nhất, lượt mượn theo tháng, xuất dữ liệu JSON.

### Tài khoản và phân quyền
- Đăng nhập, đăng ký (tài khoản đăng ký mới có vai trò Độc giả), đăng xuất.
- Ba vai trò: **Quản trị**, **Thủ thư**, **Độc giả**.

## 🖥️ Danh sách màn hình

| # | Màn hình | Quản trị | Thủ thư | Độc giả |
|---|----------|:--------:|:-------:|:-------:|
| 1 | Tổng quan | ✅ | ✅ | |
| 2 | Quản lý sách | ✅ | ✅ | 👁 chỉ xem |
| 3 | Quản lý độc giả | ✅ | ✅ | |
| 4 | Lập phiếu mượn | ✅ | ✅ | |
| 5 | Lập phiếu trả | ✅ | ✅ | |
| 6 | Lịch sử phiếu | ✅ | ✅ | |
| 7 | Sách đang mượn | ✅ | ✅ | |
| 8 | Quá hạn và tiền phạt | ✅ | ✅ | |
| 9 | Thống kê báo cáo | ✅ | ✅ | |
| 10 | Cài đặt | ✅ | | |
| 11 | Quản lý tài khoản | ✅ | | |
| 12 | Sách của tôi | | | ✅ |

## 🔑 Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|----------|
| Quản trị | `admin` | `admin123` |
| Thủ thư | `thuthu` | `thuthu123` |

Người dùng mới có thể tự đăng ký tại màn hình đăng nhập. Quản trị viên đổi vai trò ở màn hình **Tài khoản**.

## 🚀 Chạy ứng dụng

**Cách 1: mở trực tiếp.** Tải repo về và mở file `index.html` bằng trình duyệt.

**Cách 2: chạy bằng server cục bộ** (tùy chọn):
```bash
python -m http.server 8000
# mở http://localhost:8000
```

## 🌐 Triển khai lên GitHub Pages

1. Đẩy mã nguồn lên repository (nhánh `main`).
2. Vào **Settings → Pages**.
3. Mục **Source** chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm **Save**.
4. Sau 1–2 phút, truy cập `https://<ten-ban>.github.io/<ten-repo>/`.

## ⚙️ Quy định mặc định

Có thể chỉnh trong màn hình **Cài đặt** (chỉ quản trị):

- Số ngày mượn mặc định: **14 ngày**
- Tiền phạt: **5.000đ / ngày / cuốn** quá hạn

Công thức: `tiền phạt = số ngày trễ × mức phạt mỗi ngày`.

## 🗂️ Cấu trúc dữ liệu

Dữ liệu lưu trong `localStorage` của trình duyệt (khóa `lib`, phiên đăng nhập khóa `libme`):

```text
cfg      { days, fine }
books    { id, name, author, cat, qty }
readers  { id, name, phone, addr }
loans    { id, reader, book, borrow, due, ret }
users    { u, pw, name, role, reader? }
```

Số sách còn lại không lưu riêng mà được tính: `còn lại = qty − số phiếu chưa trả của sách đó`.

## ⚠️ Giới hạn hiện tại

- **Dữ liệu không dùng chung:** mỗi trình duyệt có dữ liệu riêng, người khác không thấy thay đổi của bạn.
- **Bảo mật chỉ mang tính minh họa:** mật khẩu chỉ được băm đơn giản ở phía client và phân quyền kiểm tra bằng JavaScript, nên không an toàn cho môi trường thật.
- Không dùng mật khẩu thật trên bản demo công khai.

## 🛣️ Hướng phát triển

- [ ] Backend (Node.js / Python) và cơ sở dữ liệu (PostgreSQL, MySQL hoặc MongoDB)
- [ ] Xác thực phía server (bcrypt/argon2, JWT hoặc session) và kiểm tra quyền ở API
- [ ] Quên mật khẩu, đổi mật khẩu
- [ ] In phiếu mượn/trả, xuất Excel/PDF
- [ ] Ảnh bìa sách, mã vạch/QR
- [ ] Nhật ký thao tác của thủ thư
- [ ] Gia hạn sách, đặt giữ sách trước
- [ ] Tách mã nguồn thành nhiều file (HTML, CSS, JS)

## 🤝 Đóng góp

1. Fork repository hoặc tạo nhánh mới: `git checkout -b feature/ten-tinh-nang`
2. Commit thay đổi: `git commit -m "Mô tả thay đổi"`
3. Push nhánh: `git push origin feature/ten-tinh-nang`
4. Tạo Pull Request để nhóm review.

## 📄 Giấy phép

Chọn giấy phép phù hợp cho dự án (ví dụ MIT) và thêm file `LICENSE`.
