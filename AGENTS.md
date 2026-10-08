# Dev Recall

@/Users/buivannin/.codex/RTK.md

Bộ nhớ thao tác cá nhân cho developer macOS. Vite + React + TypeScript + Fuse.js;
YAML trong `data/` là nguồn chuẩn. Chạy lệnh từ root, cần Node.js 22.12+ và npm.

- Phạm vi bản đầu: search, chi tiết, copy; không tự chạy command, không API/cloud/auth.
- Query xử lý tại máy. Không đưa secret, token hay đường dẫn server riêng vào seed.
- UI dùng tiếng Việt, `lang=vi`, favicon; giữ nguyên command/path và tên công cụ.
- `src/data/schema.ts` là hợp đồng dữ liệu; CLI và browser dùng chung validator.
- `src/search/engine.ts` xử lý normalization/ranking; không đưa business search vào UI.
- Đổi nội dung kiến thức: đọc `docs/data-format.md`; giữ ID ổn định, aliases hữu ích,
  note chính xác và riskNote cho risk caution/destructive. Không tự đổi prefix tmux.
- Đổi phạm vi sản phẩm: đọc `docs/plan-v1.md`; các bản sau chưa được duyệt.
- Đổi search/state/runtime: đọc `docs/architecture.md`; metadata và lifecycle chỉ là
  đề xuất V0.2, chưa có trong runtime. Bằng chứng V0.1: `docs/v0.1-review.md`.
- Tài liệu Markdown là source; cập nhật HTML tương ứng và source-sha256 cùng thay đổi.
  `npm run docs:sync` phát hiện HTML không khớp nguồn và copy sang public/docs.
- Port được cấp từ Dev Hub registry ở
  `/Users/buivannin/Desktop/workspace/personal/dev-hub/projects.yml`.
  Block 15300–15399, app 15300, strictPort, bind 127.0.0.1; không tự đổi port.
  Proxy `http://dev-recall.localhost`; direct `http://127.0.0.1:15300`.
  Proxy chung hiện publish mọi interface; không thay bind hoặc project khác ngầm.
- Giữ server trong terminal tương tác có log; không kill process không rõ chủ sở hữu.
- Reuse global project-ai-bootstrap cho setup; product-builder cho scope sản phẩm;
  frontend-design cho thiết kế; task-qa-review cho review task khi được yêu cầu.
- Bắt đầu feature bằng nhánh riêng từ branch nền phù hợp; không implement trên main.
- Trong lúc implement chưa commit/push. Sau khi hoàn tất và checks phù hợp đạt,
  commit phần thay đổi của feature, push nhánh rồi báo tên nhánh/link để người dùng merge.
  Không tự merge vào main hoặc force-push.
- Không cài global tools hoặc sửa system services nếu chưa được yêu cầu.

## Lệnh

- `npm ci`: cài dependency theo lockfile.
- `npm run dev`: sync tài liệu, chạy Vite ở port đã đăng ký.
- `npm run check`: typecheck.
- `npm run format` / `npm run format:check`: format / kiểm style bằng Prettier.
- `npm run validate:data`: kiểm schema và ID trùng.
- `npm test`: test search, seed và schema.
- `npm run build`: sync tài liệu, validate dữ liệu, typecheck, build production.
- `npm run preview`: xem production build, dùng cùng port; dừng dev trước.
- `npm run test:browser`: kiểm UI, keyboard, clipboard, responsive; cần dev đang chạy
  và Chrome đã cài. Dùng session browser riêng, ảnh nằm trong artifacts/.
  Với preview production đang chạy, dùng `npm run test:browser -- --production`.

Definition of done: checks phù hợp đạt, luồng chính kiểm bằng browser, clipboard/error
và không có kết quả hoạt động, docs/HTML đồng bộ. Báo rõ phần chưa kiểm runtime.
