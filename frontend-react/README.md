# Thư viện số – Frontend (React + TypeScript + Vite)

```
npm install
npm run dev        # http://localhost:5173  (cần chạy backend trước, cổng 3000)
```
Đăng nhập demo (dữ liệu từ backend/MySQL): `admin / admin123` · `thuthu / thuthu123` · `docgia / docgia123`

Dữ liệu lấy từ API backend NestJS. Vite chuyển tiếp `/api` sang `http://localhost:3000` (xem `vite.config.ts`).

## Cấu trúc `src/`
```
main.tsx                  điểm vào
App.tsx                   khai báo các route
index.css                 giao diện chung
types/index.ts            kiểu dữ liệu (Book, Reader, Loan, User, DB…)
lib/utils.ts              hàm tiện ích (ngày, tiền, mã…)
lib/calc.ts               tính toán (còn lại, quá hạn, tiền phạt…)
lib/api.ts                gọi API (access token trong bộ nhớ, tự refresh khi 401)
lib/data.ts               đổi dữ liệu API sang kiểu của giao diện, tải dữ liệu theo vai trò
context/StoreContext.tsx  dữ liệu + đăng nhập + các thao tác gọi API
hooks/useBookEditor.tsx   thêm/sửa sách
components/               Layout (sidebar), Cover, FormModal, Table, Widgets, Search, PageHeader, BookReader (lật trang)
pages/                    mỗi trang một file:
  Login · Dashboard · Books · BookDetail · Readers · Borrow · Return
  Loans · Overdue · Reports · Settings · Accounts · MyBooks
```

## Ảnh sách
- Bìa: `public/images/<mã sách>.jpg` (vd `B001.jpg`; hỗ trợ jpg, jpeg, png, webp, svg)
- Các trang trong sách: `public/images/<mã sách>/1.jpg, 2.jpg, 3.jpg …`
- Tách PDF thành ảnh: đặt PDF vào `pdf/` (tên theo mã sách) rồi chạy `python3 tach-pdf.py`
