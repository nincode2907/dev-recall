# Kiến trúc Dev Recall V0.1

Trạng thái ngày 2026-10-08: kiến trúc đang chạy cho bản đầu đã duyệt. Các phần ghi “Đề xuất V0.2” là thiết kế tương lai, chưa triển khai. Phạm vi chuẩn: [kế hoạch V0.1](plan-v1.md). Cách bổ sung kiến thức: [data-format](data-format.md). Bằng chứng nghiệm thu: [review V0.1](v0.1-review.md).

## Sản phẩm và luồng chính

“Tôi nhớ việc muốn làm, nhưng quên cách làm.” App là bộ nhớ thao tác cá nhân cho developer macOS: mở → gõ intent → chọn kết quả → xem → copy → tiếp tục làm việc. Chỉ 53 mục ở năm nhóm; không phải kho lệnh tổng hợp.

Search tự focus khi khởi động. ↑/↓ chọn và cuộn trong list; Enter focus detail; Cmd/Ctrl Enter copy nội dung chính; Esc quay lại search; Cmd/Ctrl K chọn query để thay nhanh. Cmd+C vẫn copy text bình thường. Prefix tmux là chuỗi hai bước, hiển thị bằng mũi tên; shortcut đồng thời dùng dấu cộng. Không tự chạy command.

## Dòng dữ liệu V0.1

```text
data/*.yaml (nguồn chuẩn, 53 mục)
  → raw imports đồng bộ
  → parseCollection (schema + ID duy nhất)
  → thứ tự nhóm + search index
  → query / selectedId trong React
  → danh sách + detail
  → navigator.clipboard.writeText
```

| Thành phần                    | Trách nhiệm                                                           | Ranh giới                                                               |
| ----------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| data/*.yaml                   | Kiến thức canonical, ID ổn định, aliases, content/example, note/risk  | Không query, usage count hay secret                                     |
| src/data/schema.ts            | Parse YAML, validate field/type/riskNote, phát hiện ID trùng toàn kho | Dùng chung CLI và browser                                               |
| src/data/load.ts              | Import eager và biến lỗi thành CollectionState                        | Browser không fetch dữ liệu runtime                                     |
| src/search/engine.ts          | Normalization, matching, ranking, cache token có giới hạn             | Không phụ thuộc React, DOM, storage hay network                         |
| src/app/App.tsx               | Query, selection, keyboard, focus, clipboard feedback                 | State phiên hiện tại; không lưu history                                 |
| src/components/ItemDetail.tsx | Hiển thị nội dung, cảnh báo, mẫu/ví dụ và nút copy                    | Không chạy lệnh, không quyết định ranking                               |
| scripts/read-data.ts          | Đọc YAML từ disk cho CLI và test                                      | Qua cùng validator                                                      |
| scripts/sync-docs.ts          | Kiểm source-sha256, đóng gói bốn cặp Markdown/HTML                    | Hash chứng minh nguồn tương ứng, không tự chứng minh nội dung HTML đúng |

Không database, localStorage, API, analytics, cloud, auth hay AI trong V0.1. Vite HMR đọc lại YAML trong dev; bản production phải build lại sau khi sửa dữ liệu. Query và nội dung copy không gửi ra ngoài app.

## Search và ranking

Chuẩn hóa chữ thường, NFD, dấu tiếng Việt, đ → d, khoảng trắng; bỏ một số từ đệm. Tìm title, aliases, category, content và example. Thứ tự ưu tiên: exact title/alias/command → phrase → literal token → fuzzy. Category nhận diện được là bộ lọc đúng nhóm.

Fuse.js tạo candidate/score; guard từ giới hạn fuzzy ở một lỗi ký tự hoặc đảo hai ký tự liền nhau, không ghép fragment giữa các từ không liên quan. Fuzzy từ từ 3 ký tự; một token ngắn tối đa 3 ký tự cần literal hoặc category. Prefix từ từ 3 ký tự giúp tìm khi đang gõ. Số token fuzzy không vượt max(1, floor(số token intent / 3)); cache tối đa 200 token. Tie-break theo title tiếng Việt. Đây là deterministic retrieval, không hiểu ngữ nghĩa.

42 query Việt/Anh, không dấu, category, direct command và typo được dùng chung trong unit/browser tests. Từng title/alias của 53 mục phải trả mục trong top 3. Query “xem process nào ăn ram” trả rỗng vì chưa có kiến thức phù hợp. Không thêm mục RAM trong lượt này.

## State, feedback và lỗi

| Trạng thái                           | Hành vi và cách tiếp tục                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Chờ module khởi động                 | Nội dung HTML “Đang mở Dev Recall…” và link tải lại; React thay fallback rồi focus search |
| Query rỗng                           | Toàn bộ kho theo thứ tự nhóm và gợi ý tìm                                                 |
| Không có kết quả                     | Gợi ý rút gọn/thêm tên công cụ; nút xem lại kho; không còn nút copy                       |
| YAML/schema/ID lỗi                   | Nêu file/item/ID khi có, cách validate và tải lại; không hiện kho thiếu một phần          |
| Copy pending                         | Khóa copy để tránh ghi lặp; selection/query vẫn dùng được                                 |
| Copy thành công/thất bại             | Status cố định trong viewport có nội dung đã copy hoặc hướng dẫn chọn text rồi Cmd/Ctrl C |
| Đổi query/selection khi copy pending | Bỏ feedback thuộc context cũ; không tuyên bố đã copy mục mới                              |
| Caution/destructive                  | Cảnh báo cụ thể trước nội dung copy; không tự chạy command hay thêm confirmation flow     |

Keyboard bỏ qua keydown khi đang composition. Arrow chỉ cuộn list, không làm search biến khỏi viewport. Focus detail có outline; Esc đưa input vào vùng nhìn thấy. Responsive xếp detail dưới list trên màn hình nhỏ; code wrap không tràn ngang.

## Runtime và vận hành

| Mục           | Cấu hình                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Registry      | /Users/buivannin/Desktop/workspace/personal/dev-hub/projects.yml, entry dev-recall                       |
| Allocation    | 15300–15399; app 15300                                                                                   |
| Dev / preview | host 127.0.0.1, port 15300, strictPort true                                                              |
| Direct        | http://127.0.0.1:15300                                                                                   |
| Proxy         | http://dev-recall.localhost, Caddy reverse proxy tới host.docker.internal:15300 trong container hiện tại |
| Shared proxy  | compose.proxy.yml publish 80:80 trên mọi interface; không đổi hạ tầng project khác                       |

Dev và preview không chạy cùng port một lúc. Giữ server trong terminal tương tác có log; dừng đúng process của Dev Recall trước khi chuyển mode. Không dựng service nền/global shortcut. Bản build gồm JS/CSS/data và public/docs; browser verification chạy riêng dev và production.

## Đề xuất V0.2: usage metadata tách khỏi kiến thức

Chỉ đề xuất, không thêm field vào schema V0.1 hoặc ghi storage. Giữ ID canonical làm khóa; metadata có schemaVersion riêng và repository adapter để sau này chọn storage/backup. Không rewrite YAML mỗi khi người dùng copy.

```typescript
type UsageMetadata = {
  schemaVersion: 1;
  byItem: Record<
    string,
    {
      views: number;
      copies: number;
      lastUsed: string | null; // UTC ISO timestamp
    }
  >;
  successfulQueries: Record<
    string,
    {
      count: number;
      lastUsed: string;
      chosenItemIds: string[];
    }
  >;
  zeroResultQueries: Record<
    string,
    {
      count: number;
      lastSeen: string;
    }
  >;
};
```

“View” là người dùng chủ động mở detail bằng Enter hoặc click kết quả, không đếm mỗi arrow/re-render. “Copy” chỉ tăng khi clipboard write thành công. lastUsed là lần view/copy gần nhất. Successful query được đếm một lần trong phiên query khi người dùng chủ động mở/copy mục; phân biệt với query chỉ có result. Query rỗng không được ghi. Metadata ID không còn trong kho được giữ riêng để không mất lịch sử khi rename/deprecate; chuyển ID phải có mapping rõ ràng.

Trước triển khai cần chốt storage local, opt-in, retention/cap, xóa dữ liệu và export/backup. Query có thể chứa thông tin nhạy cảm; mặc định không có network sink. Metadata lỗi phải có thể reset độc lập, không làm kho kiến thức không mở được.

## Đề xuất V0.2: failed-query design

Không ghi query trong V0.1. Phiên tương lai có thể gom query đã normalize, đếm một lần khi query cuối ổn định và người dùng xác nhận không tìm được (Enter khi zero-result) hoặc rời search. Debounce khoảng 600 ms chỉ tạo candidate trong memory; không ghi mỗi phím. Bỏ query rỗng, chỉ gồm từ đệm hoặc quá ngắn. Query sửa tiếp/hủy candidate không tạo log. Giới hạn số entry và thời gian giữ trước khi code.

```text
Missing knowledge (ví dụ minh họa)
  xem process nào ăn ram ×4
  kiểm tra dung lượng pin ×3
```

Nhóm có/không dấu về cùng khóa bằng normalization hiện tại; không tự gộp ngữ nghĩa bằng AI. Giữ normalized text tối thiểu, không lưu toàn bộ raw variants mặc định. Cho người dùng xem/xóa/đánh dấu “đã bổ sung” trước khi liên kết tới Add/Edit tương lai. Gợi ý từ usage không tự tạo/verify knowledge và không gửi query ra ngoài.

## Đề xuất V0.2: knowledge lifecycle

Các trạng thái dưới đây thuộc canonical knowledge/provenance tương lai, không thuộc usage metadata. Chưa có trong YAML hoặc UI V0.1.

| Trạng thái   | Ý nghĩa                                  | Điều kiện và provenance đề xuất                                                            |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Verified     | Đã kiểm đúng trong điều kiện được ghi    | Nguồn chính thức, verifiedAt, phiên bản/tool/nền tảng; không có nghĩa đúng mãi             |
| Personal     | Quy ước/cấu hình riêng của người dùng    | Điều kiện cá nhân rõ ràng, ví dụ custom prefix; không gắn nhãn universal                   |
| Imported     | Nhận từ nguồn ngoài, chưa tự coi là đúng | Source URL, license, importedAt; review trước khi chuyển Verified                          |
| AI Suggested | Đề xuất chưa được người dùng kiểm        | Model/source context và reviewer; không mặc định Verified, không tự chạy                   |
| Deprecated   | Lỗi thời hoặc được thay thế              | Lý do, deprecatedAt, replacementId; giữ ID cho metadata, ẩn khỏi search mặc định tương lai |

Personal có thể chuyển Verified khi đủ bằng chứng trong phạm vi cá nhân; Imported/AI Suggested phải qua review. Mục sai/lỗi thời chuyển Deprecated; mục sửa giữ ID nếu vẫn cùng intent, tạo replacement ID khi intent đổi. Lifecycle không thay thế risk/riskNote.

## Nguồn và giới hạn kiểm

- [tmux manual](https://man.openbsd.org/tmux.1): prefix, hướng split, shell/config, pane title.
- [Git update-index](https://git-scm.com/docs/git-update-index): skip-worktree và giới hạn.
- [Docker Compose restart](https://docs.docker.com/reference/cli/docker/compose/restart/): restart không áp dụng cấu hình mới.
- [Apple shortcuts](https://support.apple.com/en-us/102650): shortcut macOS và Finder.

Runtime chỉ chứng minh app tra cứu/copy. Không chạy 53 command vào môi trường thật và không xác nhận custom tmux prefix của người dùng. Tính năng V0.2, native global shortcut và OS khác chưa được triển khai/kiểm.
