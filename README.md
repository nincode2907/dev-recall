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
- [Kiến trúc và đề xuất V0.2](docs/architecture.md) · [Bản trực quan](docs/architecture.html)
- [Báo cáo kiểm chứng V0.1](docs/v0.1-review.md) · [Bản trực quan](docs/v0.1-review.html)
- [Hướng dẫn dữ liệu](docs/data-format.md) · [Bản trực quan](docs/data-format.html)
- [Master Roadmap](docs/MASTER_ROADMAP.md) · [Bản trực quan](docs/MASTER_ROADMAP.html)
- [Có gì mới theo version](docs/releases/index.html) · [Quy ước release notes](docs/release-notes.md)

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

## VERIFIED · 2026-10-08

- Dữ liệu 53 mục/5 nhóm/ID duy nhất, TypeScript, 55/55 tests, format và build đạt.
- 42 query Việt có/không dấu, English, category, command, typo top 3 trong unit và
  Chrome dev/production. Từng title/alias của 53 mục đều tìm được trong top 3.
- Search với index mới, 100 lượt trên 53 mục: p95 1,66 ms, max 2,27 ms (<100 ms).
- Browser kiểm bàn phím Cmd/Ctrl, focus, Cmd+C thường, clipboard thật/lỗi/pending,
  warning, empty/no-result, startup, desktop/laptop/mobile và bốn cặp docs.
- Malformed YAML và duplicate ID hiện lỗi hữu ích trong dev; build clone riêng
  xác nhận production từ chối hai lỗi này mà không sửa seed của repo thật.
- Direct URL, proxy IPv4/IPv6 đều HTTP 200 ở dev và preview production. Caddy valid,
  allocation không trùng; strictPort từ chối instance dev/preview thứ hai.
- Server giữ trong terminal tương tác có log; không cài global tool/system service.

## NOT VERIFIED / giới hạn

Chưa kiểm Safari/Firefox, Windows/Linux native, screen reader hay IME thực tế.
Không chạy toàn bộ seed command hoặc đọc/đổi tmux prefix cá nhân. App bind IPv4;
IPv6 dùng qua proxy. Search cần aliases, không hiểu mọi câu tự nhiên. Metadata,
failed-query logging và lifecycle chỉ được thiết kế trong kiến trúc, chưa triển khai.

Ảnh kiểm tra nằm trong `artifacts/` (không theo dõi Git).
