# What's new — quy ước cho mọi version

Ngày chốt yêu cầu: 2026-10-08. Người dùng muốn mỗi version, dù lớn hay nhỏ, có một trang HTML tóm tắt có gì mới và có gì thay đổi, dễ đọc như trang What's new của Chrome. Đây là tài liệu hướng dẫn release, không thêm feature vào app.

## Một version, một trang

- Source: `docs/releases/v<major>.<minor>.<patch>.md`; human view: `.html` cùng tên.
- Index: `docs/releases/index.md/html`, mới nhất trước; mỗi entry có version, ngày, trạng thái, mức ảnh hưởng, summary và link riêng.
- Không bỏ patch, hotfix, data correction hay cải tiến nhỏ. Một bản nhỏ có thể chỉ cần 1–3 câu, nhưng vẫn có trang riêng.
- Không coi một phase là một version. Nhiều phase có thể cùng release; một phase có thể có nhiều patch. Chỉ ghi thay đổi thực sự có trong bản đó.
- `V0.1` là tên ngắn của package `0.1.0`. Chưa tự tạo `0.1.1` chỉ vì đang viết tài liệu, không bump version trong lượt planning.

## Trạng thái phải trung thực

| Status    | Khi dùng                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| Draft     | Đang soạn; feature/checks chưa hoàn tất. Không nằm trong mục “đã phát hành”.                                         |
| Ready     | Có code/evidence đạt trên branch; chờ người dùng merge/release. Ghi rõ branch/commit và tested scope.                |
| Released  | Người dùng đã thực sự merge/release theo protocol đã chốt; ngày/commit/tag có evidence. Không tự suy từ push branch. |
| Withdrawn | Bản bị rút; nêu lý do, ảnh hưởng và bản thay thế/recovery. Không xóa lịch sử.                                        |

Ngày lập note, ngày kiểm và ngày phát hành là ba thông tin khác nhau. Chưa release thì không điền một ngày giả. Trang V0.1.0 hiện là retrospective Ready theo commit `8a3a22c`, chưa xác nhận merge/tag.

## Version number và mức ảnh hưởng

Trước V1, đề xuất `0.minor.patch`: patch cho sửa lỗi/data/doc không thay hành vi hoặc schema tương thích; minor cho capability mới hoặc thay đổi schema/hành vi đáng kể, luôn ghi migration. Từ V1: major cho incompatibility, minor cho feature tương thích, patch cho fix tương thích. Chốt SemVer trước release; không gán số version cứng cho từng milestone.

Nhãn tác động người dùng độc lập với số version/dòng diff:

| Nhãn | Người dùng cần biết                                                               |
| ---- | --------------------------------------------------------------------------------- |
| Lớn  | Thay luồng dùng, nguồn lưu trữ, runtime, compatibility hoặc cần migration/backup. |
| Vừa  | Thêm capability có ích trong luồng hiện tại, không cần đổi toàn bộ cách dùng.     |
| Nhỏ  | Fix/cải tiến/data correction gọn; vẫn nêu lợi ích và điều kiện nếu có.            |

Không chọn patch để che một breaking change. Không gọi một thay đổi “lớn” chỉ vì diff nhiều dòng HTML.

## Nội dung một trang

Trang mở đầu bằng version/ngày/status/impact và một câu “bản này giúp việc gì”. Phần tóm tắt đọc trong khoảng một phút; chi tiết kỹ thuật đưa sang architecture/QA hoặc PR, không nhồi vào What's new.

| Section              | Nội dung                                                                            |
| -------------------- | ----------------------------------------------------------------------------------- |
| Có gì mới            | Capability mới và cách bắt đầu dùng, ví dụ cụ thể khi giúp hiểu.                    |
| Có gì thay đổi       | Trước → sau, lợi ích/tác động. Nêu thay đổi lớn và nhỏ riêng khi cần.               |
| Đã sửa               | Lỗi nào người dùng gặp và behavior sau sửa; không chỉ tên file/code.                |
| Kiến thức            | Recall thêm/sửa/deprecated, thay đổi command/context/risk đáng chú ý.               |
| Migration / breaking | Cần backup/đổi cấu hình/restore gì, compatibility và rollback; hoặc ghi không có.   |
| Known issues         | Giới hạn còn lại, workaround; không giấu NOT VERIFIED sau một badge READY.          |
| Kiểm chứng           | Tested runtime/checks quan trọng và link evidence; phân biệt VERIFIED/NOT VERIFIED. |
| Dùng ngay            | Link mở app, shortcut/cách dùng thay đổi và hướng dẫn update khi có.                |

Section không có thay đổi có thể ghi “Không có” ngắn hoặc gộp, không thêm filler. Screenshot chỉ khi giúp thấy UI mới; fix dữ liệu nhỏ không bắt buộc screenshot. Risk/dangerous operation không bị che bởi copy marketing.

## Mẫu bản cập nhật nhỏ

```text
V0.x.y · Ready · Nhỏ · ngày kiểm YYYY-MM-DD
Sửa cách tìm tên nhánh Git bằng tiếng Việt không dấu.

Đã sửa: “git doi ten nhanh” ưu tiên thao tác đổi tên thay vì tạo nhánh.
Migration: Không có.
Kiểm chứng: query regression + typecheck/data checks đã chạy; link QA.
Known issues: các giới hạn hiện hành chưa thay đổi, link scope nếu cần.
```

Đây là mẫu, không phải release mới. Chỉ điền kết quả test đã chạy của bản thực tế; không copy benchmark V0.1 sang mọi version.

## Delivery checklist cho một release được giao

1. Kiểm actual diff, scope và commit/base của version; tách capability đã ship khỏi kế hoạch.
2. Xác nhận version nguồn duy nhất; UI/About/package/artifact/notes cùng version khi những phần đó tồn tại.
3. Viết Markdown, index entry và HTML visual; giữ source-sha256 đúng nguồn sau format.
4. Đăng ký/đồng bộ trang mới vào docs delivery manifest, kể cả thư mục releases; build phải chứa HTML/Markdown và mọi link/asset cần. Hiện sync-docs chỉ có bốn cặp cũ, không tự discover trang mới; cần xử lý trong phiên delivery được giao, không claim đã làm ở lượt planning.
5. Kiểm links, mobile/desktop, readability, release status, metadata và source hash. Nếu native được activate, bundle What's new đọc offline; không cần network để biết bản vừa cập nhật.
6. Chạy checks theo thay đổi; ghi VERIFIED/NOT VERIFIED. Thu screenshot nếu nội dung cần, tránh test lại cả sản phẩm cho một doc/data fix không liên quan.
7. Theo Git policy đã được người dùng chốt: tạo nhánh lúc bắt đầu; implement xong/checks đạt mới commit/push; báo branch/compare để người dùng merge. Instruction riêng cấm Git (như planning này) được ưu tiên.
8. Chỉ chuyển Ready → Released sau khi có evidence merge/release. Không tự merge, publish/tag hoặc deploy khi chưa có scope tương ứng.

Release notes bổ sung, không thay thế [Master Roadmap](MASTER_ROADMAP.md), [architecture](architecture.md) hay [QA](v0.1-review.md). AGENTS chỉ giữ link/quy ước ngắn, không duplicate toàn checklist.
