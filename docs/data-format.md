# Dữ liệu Dev Recall

## Nguồn chuẩn và cách thêm

Mỗi nhóm nằm trong `data/<category>.yaml`. Dữ liệu được parse và validate tại build cũng như trong trình duyệt. Không lưu item trong localStorage. Thêm bằng cách sửa file phù hợp; trong dev, Vite cập nhật module khi lưu. Production cần build lại.

```yaml
- id: terminal-process-on-port
  title: Xem tiến trình đang giữ port
  type: command
  category: terminal
  aliases:
    - thằng nào giữ port
    - find process using port
  content: "lsof -nP -i :<port>"
  example: "lsof -nP -i :3000"
  note: "Thay <port> bằng số port cần kiểm tra."
  risk: safe
```

## Hợp đồng

| Trường   | Quy tắc                                                                   |
| -------- | ------------------------------------------------------------------------- |
| id       | Chuỗi duy nhất toàn kho; chữ thường, số và gạch ngang; giữ ổn định        |
| title    | Tên nhu cầu dễ nhận biết, không rỗng                                      |
| type     | command, shortcut, path, config, snippet, concept, workflow, routine, fix |
| category | terminal, tmux, git, docker, macos                                        |
| aliases  | Danh sách chuỗi không rỗng; cách gọi Việt/Anh, nhu cầu thực tế            |
| content  | Nội dung chính để hiển thị/copy; chuỗi không rỗng                         |
| example  | Tùy chọn; ví dụ cụ thể, có nút copy riêng                                 |
| note     | Giải thích điều kiện, nền tảng và tác dụng; chuỗi không rỗng              |
| risk     | safe, caution, destructive                                                |
| riskNote | Bắt buộc với caution/destructive; nói rõ tác động                         |

Validator từ chối unknown fields để phát hiện lỗi gõ. Chuỗi tùy chọn nếu có cũng phải không rỗng. Collection phải là list không rỗng. Định nghĩa có thể thực thi tại `src/data/schema.ts` là hợp đồng cuối cùng.

## Quy trình bổ sung item

1. Chọn category đúng và ID ổn định, duy nhất. Khi thêm category mới phải cập nhật schema, nhãn UI và test, không chỉ tạo file YAML.
2. Viết title theo việc muốn làm; thêm aliases thực sự hữu ích. Category có trong query sẽ giới hạn nhóm, vì vậy đặt đúng nhóm là quan trọng.
3. Kiểm command/phím tắt bằng tài liệu chính thức; nêu rõ phụ thuộc macOS, zsh/bash, tool cần cài hoặc phiên bản khi có khác biệt.
4. Dùng `<parameter>` cho mẫu và `example` cho ví dụ riêng. Không đưa secret/token hoặc máy chủ cá nhân vào dữ liệu.
5. Phân loại tác động: `caution` cho thao tác có gián đoạn; `destructive` cho mất thay đổi, xóa dữ liệu hoặc kết thúc tác vụ. Viết riskNote cụ thể.
6. Chạy `npm run validate:data` và `npm test`; xem trực tiếp query và nội dung copy.

## Search và giới hạn

Search chuẩn hóa chữ thường, dấu tiếng Việt, chữ đ và khoảng trắng; bỏ một số từ đệm. Tìm trên title, aliases, category và content. Mọi token còn lại cần khớp qua fuzzy search; query nhiều token phải có ít nhất một nửa token khớp chuỗi trực tiếp để loại kết quả quá xa. Khớp alias/title chính xác và khớp cụm được ưu tiên. Query có category nhận diện được sẽ giới hạn đúng nhóm. Chưa có semantic search hoặc hiểu mọi câu tự nhiên. Sửa aliases nếu người dùng thường diễn đạt một cách chưa được tìm đúng.

Tmux: Prefix mặc định Ctrl+B, nhấn rồi thả trước phím tiếp theo. `%` chia trái/phải, `"` chia trên/dưới; không suy luận theo tên vertical/horizontal. Không đọc hoặc giả định prefix cá nhân.

Git: phân biệt `git restore --staged` (bỏ stage, giữ working tree) và `git restore -- <file>` (bỏ thay đổi chưa stage, khôi phục từ index). `git update-index --skip-worktree <file>` đặt cờ trong index local cho file tracked; đây là cờ phục vụ sparse checkout, không phải cơ chế ignore bền vững cho thay đổi local. Bỏ cờ bằng `--no-skip-worktree`; xem [Git update-index](https://git-scm.com/docs/git-update-index). Không gộp các thao tác này dưới alias mơ hồ “reset file”.

## Nguồn xác minh seed

- [tmux manual](https://man.openbsd.org/tmux.1): key bindings, split-window và copy mode.
- [Git documentation](https://git-scm.com/docs): status, diff, switch, branch, restore, update-index, log, stash.
- [Docker CLI](https://docs.docker.com/reference/cli/docker/) và [Compose CLI](https://docs.docker.com/reference/cli/docker/compose/).
- [Apple keyboard shortcuts](https://support.apple.com/en-us/102650) và [screenshots](https://support.apple.com/en-us/102646).
- [Apple Terminal shell commands](https://support.apple.com/guide/terminal/execute-commands-and-run-tools-apdb66b5242-0d18-49fc-9c47-a2498b7c91d5/mac); tra local man page cho pwd, ls, find, mkdir, lsof, cd, du, tail, open và zsh.
- [ripgrep guide](https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md): rg.

Seed chỉ là thao tác chung. Không kiểm bằng cách chạy lệnh xóa hoặc thay đổi môi trường thật.
