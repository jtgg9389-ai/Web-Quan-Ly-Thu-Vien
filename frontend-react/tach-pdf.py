import fitz, glob, os

MAC_DINH = (1, 50)             # mặc định: lấy từ trang 1 đến trang 30
RIENG = {}                     # vd: {'B002': (5, 34)} = sách B002 lấy từ trang 5 đến 34

# Chạy ở thư mục frontend: python3 tach-pdf.py   (PDF để trong thư mục pdf/, đặt tên theo mã sách: B002.pdf)
for f in glob.glob('pdf/*.pdf'):
    ma = os.path.basename(f)[:-4]
    doc = fitz.open(f)
    a, b = RIENG.get(ma, MAC_DINH)
    b = min(b, len(doc))
    os.makedirs('public/images/' + ma, exist_ok=True)
    for n, i in enumerate(range(a - 1, b), start=1):
        doc[i].get_pixmap(dpi=110).save(f'public/images/{ma}/{n}.jpg')
    print('Xong', ma, ':', b - a + 1, 'trang (từ trang', a, 'đến', b, 'của PDF)')
