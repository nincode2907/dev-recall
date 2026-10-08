# Kế hoạch Dev Recall V0.1

Ngày chốt: 2026-10-07. Người dùng đã duyệt triển khai Search + YAML + Copy, khoảng 50 item; sau đó bổ sung workflow tmux, mục Git cho `.DS_Store` và `skip-worktree`, thành 53 item. “V1” trong yêu cầu triển khai là bản đầu V0.1, không bao gồm toàn bộ roadmap.

## Mục tiêu

Bộ nhớ thao tác cá nhân cho developer dùng macOS: nhớ việc muốn làm nhưng quên command hoặc shortcut. Luồng chính: mở app → gõ nhu cầu → chọn kết quả → xem thao tác → copy. Search là giao diện chính.

## Phạm vi

- Một màn hình React tiếng Việt; tự focus tìm kiếm, danh sách kết quả và chi tiết.
- Tìm tiếng Việt có/không dấu, tiếng Anh, lỗi gõ nhẹ; aliases và category có ngay bản đầu.
- 53 item thuộc terminal, tmux, Git, Docker, macOS (10 terminal, 11 tmux, 12 Git, 10 Docker và 10 macOS). Hỗ trợ type command, shortcut, path, config, snippet, concept, workflow, routine, fix; seed ưu tiên thao tác ngắn.
- Copy nội dung chính và ví dụ riêng biệt; phản hồi thành công/thất bại. Không chạy command.
- YAML là nguồn chuẩn; kiểm schema và ID trùng trước build. Thêm item bằng sửa YAML.
- Có nhãn tác động cho thao tác xóa/ghi đè. Prefix tmux mặc định Ctrl+B, không suy đoán cấu hình cá nhân.
- Không Add/Edit UI, Favorites, Recent, Related, AI, auth, cloud, API, database, Docker app hay global shortcut trong V0.1.

## Trải nghiệm

Bảng tra cứu xanh slate nhạt, panel trắng, chữ tối, điểm nhấn xanh cobalt; code monospace. Kết quả bên trái, chi tiết bên phải; xếp dọc trên màn hình nhỏ. Khung command tối và keycap shortcut giúp phân biệt loại nội dung. Giữ nguyên kỹ thuật, dịch nhãn và thông báo sang tiếng Việt.

| Phím                                | Hành vi             |
| ----------------------------------- | ------------------- |
| ↑ / ↓ trong ô search hoặc danh sách | Chọn kết quả        |
| Enter tại ô search / kết quả        | Focus chi tiết      |
| ⌘ Enter / Ctrl Enter                | Copy nội dung chính |
| Esc                                 | Quay lại ô tìm kiếm |
| ⌘ K / Ctrl K                        | Focus và chọn query |

Không có query: hiển thị kho kiến thức và gợi ý tìm. Không có kết quả: gợi ý rút gọn query. Không tải được dữ liệu: nêu lỗi và file cần kiểm tra. Lỗi clipboard: hướng dẫn chọn nội dung và copy thủ công. Giữ ⌘ C cho thao tác copy văn bản thông thường.

## Kiến trúc

Vite + React + TypeScript + Fuse.js + YAML. CSS riêng; không UI framework hoặc state library. Dữ liệu đóng gói vào app bằng raw import; search chạy tại máy, không gửi query ra ngoài.

```text
data/*.yaml → loader + validator → search index → results → detail → clipboard
```

- `src/data/schema.ts`: hợp đồng dữ liệu dùng chung trình duyệt/CLI.
- `src/data/load.ts`: raw imports và trạng thái lỗi dữ liệu.
- `src/search/engine.ts`: chuẩn hóa tiếng Việt, ranking, fuzzy fallback.
- `src/components/`: bảng kết quả và chi tiết.
- `scripts/validate-data.ts`: kiểm dữ liệu trước build.
- `docs/data-format.md`: schema, hướng dẫn thêm item, nguồn xác minh.

Search ưu tiên title/alias khớp chính xác, sau đó khớp cụm từ và token với Fuse.js; category xuất hiện trong query ưu tiên đúng nhóm. Đây là tìm bằng aliases + fuzzy, chưa phải semantic search. Phân biệt tmux chia trái/phải và trên/dưới.

## Các mốc triển khai

| Mốc      | Công việc                          | Điều kiện hoàn thành                                  |
| -------- | ---------------------------------- | ----------------------------------------------------- |
| Nền tảng | Bootstrap, schema, loader, runtime | App chạy, dữ liệu lỗi/ID trùng được báo               |
| Tra cứu  | 53 item và search                  | Query nghiệm thu trả item mong đợi trong top 3        |
| Sử dụng  | UI, keyboard, copy                 | Hoàn thành luồng chính bằng chuột và bàn phím         |
| Bàn giao | Test, runtime, docs                | Check, test, build đạt; browser và tài liệu được kiểm |

## Nghiệm thu

- 53 item hợp lệ, ID duy nhất; dữ liệu lỗi chặn build.
- Top 3 đúng cho `tmux chia màn hình dọc`, `tmux chia man hinh doc`, `thằng nào giữ port`, `tạo nhiều folder`, `mac xem file ẩn`, `git đổi tên branch`.
- Kiểm query rỗng, không có kết quả, dấu tiếng Việt, lỗi gõ, category và tìm command trực tiếp.
- Copy đúng mẫu lệnh / ví dụ, phản hồi lỗi clipboard; không tự chạy command.
- Keyboard, focus, responsive, nhãn tiếng Việt, favicon và trạng thái rỗng/lỗi.
- Typecheck, dữ liệu, test search/schema và production build đạt. Mục tiêu search dưới 100 ms với bộ seed, đo trên máy thực hiện.
- Kiểm trực tiếp browser, HTTP IPv4/IPv6 của proxy và URL trực tiếp. Ghi kết quả thực tế vào README; không đánh dấu check chưa chạy là đạt.

## Runtime và bootstrap

Repo ban đầu trống, chưa có Git, AGENTS.md, manifest, docs hay project skills. Không có kiến thức cần di chuyển. `AGENTS.md` là operating manual; plan và data-format đọc khi cần. Tái sử dụng global `project-ai-bootstrap`, `product-builder`, `frontend-design`; không tạo skill trùng.

Dev Hub registry đã được đọc; allocator kiểm toàn block trên IPv4/IPv6 và Docker hai lần trước khi reserve. Block của Dev Recall: 15300–15399; app dùng 15300 với strictPort và bind 127.0.0.1. Cấu hình Caddy được sinh từ registry, giữ route khác. Proxy hiện có publish 80:80 trên mọi interface; bootstrap không thay publication. URL dự kiến `http://dev-recall.localhost`; URL trực tiếp `http://127.0.0.1:15300`. Chỉ kết luận URL dùng được sau runtime verification.

Rollback onboarding: dừng riêng process Dev Recall, xóa riêng entry `dev-recall` khỏi registry, sinh lại managed routes và tải lại proxy theo quy trình Dev Hub. Không chạm allocation project khác.

## Roadmap sau bản đầu

| Bản   | Phạm vi                                                                          |
| ----- | -------------------------------------------------------------------------------- |
| V0.2  | Add/Edit, Favorites, Recent; quyết định lưu bền vững và backup/export trước code |
| V0.3  | Tauri + global shortcut + mở/ẩn cửa sổ                                           |
| V0.4  | Related, import Navi/TLDR; đánh giá tích hợp Atuin                               |
| V0.5+ | AI hiểu query và context khi dữ liệu aliases không đủ                            |

Các bản sau chưa được duyệt triển khai. Không commit, push hay cài global tools trong phạm vi này.

## Tài liệu nguồn

- [Vite](https://vite.dev/guide/) và [server options](https://vite.dev/config/server-options).
- [Fuse.js](https://www.fusejs.io/).
- [tmux manual](https://man.openbsd.org/tmux.1).
- [Git restore](https://git-scm.com/docs/git-restore).
- [Docker container prune](https://docs.docker.com/reference/cli/docker/container/prune/).
- [Tauri global shortcut](https://v2.tauri.app/plugin/global-shortcut/), chỉ dùng cho roadmap.
