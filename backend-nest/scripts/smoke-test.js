// Chạy thử toàn bộ API: npm run smoke  (cần server đang chạy)
const B = process.env.API || 'http://localhost:3000/api';
let ok = 0, bad = 0;
const call = async (m, p, body, tok) => {
  const r = await fetch(B + p, {
    method: m,
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null; try { j = await r.json(); } catch {}
  return { s: r.status, j };
};
const t = (name, c) => { c ? ok++ : bad++; console.log((c ? '✔ ' : '✘ ') + name); };

(async () => {
  t('GET /health', (await call('GET', '/health')).s === 200);
  const adm = await call('POST', '/auth/login', { username: 'admin', password: 'admin123' });
  t('Đăng nhập admin', adm.s === 201 && adm.j.accessToken); const A = adm.j.accessToken;
  t('Sai mật khẩu -> 401', (await call('POST', '/auth/login', { username: 'admin', password: 'sai' })).s === 401);
  t('Không có token -> 401', (await call('GET', '/books')).s === 401);

  const list = await call('GET', '/books?search=clean', null, A);
  t('Tìm sách "clean"', list.s === 200 && list.j.total === 1);

  const nb = await call('POST', '/books', { title: 'Sách thử', author: 'Tác giả', category: 'Thử', quantity: 2 }, A);
  t('Thêm sách (tự sinh mã)', nb.s === 201 && nb.j.code && nb.j.available === 2);
  const upd = await call('PATCH', '/books/' + nb.j.id, { author: 'Tác giả mới' }, A);
  t('Sửa sách', upd.s === 200 && upd.j.author === 'Tác giả mới');
  const nr = await call('POST', '/readers', { fullName: 'Độc giả thử', phone: '0900000000', address: 'HCM' }, A);
  t('Thêm độc giả', nr.s === 201 && nr.j.code);

  const l1 = await call('POST', '/loans', { readerId: nr.j.id, bookId: nb.j.id }, A);
  t('Lập phiếu mượn 1', l1.s === 201 && l1.j.status === 'borrowing');
  const l2 = await call('POST', '/loans', { readerId: nr.j.id, bookId: nb.j.id }, A);
  t('Lập phiếu mượn 2', l2.s === 201);
  t('Hết sách -> 400', (await call('POST', '/loans', { readerId: nr.j.id, bookId: nb.j.id }, A)).s === 400);
  t('Số còn lại = 0', (await call('GET', '/books/' + nb.j.id, null, A)).j.available === 0);
  t('Không xóa được sách đã có phiếu -> 409', (await call('DELETE', '/books/' + nb.j.id, null, A)).s === 409);
  const r1 = await call('POST', `/loans/${l1.j.id}/return`, {}, A);
  t('Trả sách đúng hạn, phạt 0', r1.s === 201 && r1.j.fineAmount === 0);
  t('Trả lần 2 -> 400', (await call('POST', `/loans/${l1.j.id}/return`, {}, A)).s === 400);
  t('Số còn lại = 1', (await call('GET', '/books/' + nb.j.id, null, A)).j.available === 1);
  await call('POST', `/loans/${l2.j.id}/return`, {}, A);

  const od = await call('GET', '/loans?status=overdue', null, A);
  const p1 = od.j.data.find((x) => x.code === 'P001');
  t('Danh sách quá hạn có P001', od.s === 200 && p1 && p1.lateDays > 0 && p1.fineAmount === p1.lateDays * 5000);
  const rp1 = await call('POST', `/loans/${p1.id}/return`, {}, A);
  t('Trả sách trễ có tiền phạt', rp1.j.fineAmount === p1.fineAmount && rp1.j.fineAmount > 0);

  const sm = await call('GET', '/reports/summary', null, A);
  t('Báo cáo tổng quan', sm.s === 200 && sm.j.bookTitles >= 7);
  t('Báo cáo thể loại / top sách / theo tháng',
    (await call('GET', '/reports/categories', null, A)).s === 200 &&
    (await call('GET', '/reports/top-books', null, A)).s === 200 &&
    (await call('GET', '/reports/loans-by-month', null, A)).s === 200);

  const u = 'dg' + Date.now();
  const reg = await call('POST', '/auth/register', { fullName: 'Người Mới', phone: '0911111111', address: 'HCM', username: u, password: '123456' });
  t('Đăng ký độc giả', reg.s === 201 && reg.j.user.role === 'reader'); const R = reg.j.accessToken;
  t('Đăng ký trùng tên -> 409', (await call('POST', '/auth/register', { fullName: 'X', phone: '1', address: 'x', username: u, password: '123456' })).s === 409);
  t('Độc giả xem sách', (await call('GET', '/books', null, R)).s === 200);
  t('Độc giả không xem được /readers -> 403', (await call('GET', '/readers', null, R)).s === 403);
  t('Độc giả xem phiếu của mình', (await call('GET', '/loans/my', null, R)).s === 200);

  const lib = await call('POST', '/auth/login', { username: 'thuthu', password: 'thuthu123' }); const L = lib.j.accessToken;
  t('Thủ thư xem cài đặt', (await call('GET', '/settings', null, L)).s === 200);
  t('Thủ thư không sửa được cài đặt -> 403', (await call('PUT', '/settings', { finePerDay: 1 }, L)).s === 403);
  t('Thủ thư không vào /users -> 403', (await call('GET', '/users', null, L)).s === 403);
  t('Admin xem /users', (await call('GET', '/users', null, A)).s === 200);

  console.log(`\nKết quả: ${ok} đạt, ${bad} lỗi`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error('Không gọi được API:', e.message); process.exit(1); });
