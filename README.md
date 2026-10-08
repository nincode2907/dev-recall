# Dev Recall

Bộ nhớ thao tác cá nhân: tìm bằng cách bạn nhớ, xem câu lệnh/phím tắt rồi copy.
V0.1 gồm 53 item thuộc Terminal, tmux, Git, Docker, macOS; query chạy tại máy.

## Chạy

Cần Node.js 22.12+ và npm. Từ root:

```sh
npm ci
npm run dev
```

- [Mở Dev Recall](http://dev-recall.localhost)
- [URL trực tiếp](http://127.0.0.1:15300)
- [Kế hoạch Markdown](docs/plan-v1.md) · [Bản trực quan](docs/plan-v1.html)
- [Hướng dẫn dữ liệu](docs/data-format.md) · [Bản trực quan](docs/data-format.html)

Dev Hub đã cấp block 15300–15399; app bind 127.0.0.1:15300, strictPort.
Proxy chung hiện publish port 80 trên mọi interface. Không đổi publication trong task này.

## Sử dụng và kiểm tra

Gõ nhu cầu, ↑/↓ chọn kết quả, Enter focus chi tiết, ⌘ Enter copy, Esc tìm tiếp, ⌘ K chọn query.
Windows/Linux dùng Ctrl thay cho ⌘. ⌘ C/Ctrl C giữ hành vi copy văn bản thông thường.
Mẫu `<parameter>` cần thay trước khi dùng; ví dụ có nút copy riêng. App không chạy command.
Thêm kiến thức bằng sửa `data/*.yaml`, xem hướng dẫn dữ liệu.

```sh
npm run check
npm run validate:data
npm test
npm run build
npm run test:browser  # dev đang chạy; Chrome đã cài
```

Sau build, dừng dev trước khi chạy `npm run preview` vì hai lệnh dùng chung port.
Tài liệu HTML được kiểm hash Markdown và đóng gói vào production build.
Chưa có Add/Edit UI, Favorites, Recent, Tauri, AI hay import history.

## Đã kiểm tra · 2026-10-07

- `npm ci`, typecheck, validate dữ liệu, production build và Prettier đạt.
- 28 test search/schema đạt; các query nghiệm thu nằm trong top 3.
- Search trên 53 item tại máy. Baseline 50 item ban đầu có p95 khoảng 1,5 ms.
- Browser dev và production: query, keyboard/focus, clipboard thật và lỗi,
  nhãn tác động, empty, mobile 390px, favicon và hai cặp tài liệu đạt.
- Lỗi dữ liệu được kiểm bằng interception module trong dev; production chặn dữ liệu
  sai tại build. Proxy phản hồi đúng qua IPv4/IPv6 và Chrome.
- App khởi chạy trong phiên terminal tương tác của công cụ, giữ log. Điều khiển app
  Terminal native không khả dụng trong phiên này; không cài hoặc đổi system service.

Ảnh kiểm tra nằm trong `artifacts/` (không theo dõi Git).
