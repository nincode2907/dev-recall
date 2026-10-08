# ADR-001 — Lưu trữ knowledge và quyền sở hữu dữ liệu

- Status: **PROPOSED — chờ người dùng chốt**
- Date: 2026-10-08
- Phase: [Phase 1 — Foundation](../MASTER_ROADMAP.md#phase-1)
- Decision owner: người dùng Dev Recall

## Bối cảnh

V0.1 đọc 53 recall từ các file `data/*.yaml` bằng raw import đồng bộ. YAML là nguồn chuẩn; app không có database, không ghi dữ liệu cá nhân và không có API. Người dùng hiện chỉnh kiến thức bằng cách sửa YAML rồi build lại production.

Phase 2 dự kiến thêm Add/Edit. Nếu bật ghi trước khi chốt nơi lưu, YAML và một kho trong trình duyệt có thể cùng trông như nguồn chuẩn; bản build sau cũng có thể ghi đè nội dung người dùng. Quyết định này phải xác định ai sở hữu dữ liệu, runtime nào có quyền ghi và cách đưa dữ liệu sang native nếu gate desktop được mở sau này.

## Quyết định đề xuất

**Chọn IndexedDB làm canonical store cho browser profile, với một origin chính và export backup có version.** Đây là khuyến nghị cho browser-first hiện tại, chưa phải quyết định được chấp nhận và chưa thay đổi app.

| Mục                      | Quyết định đề xuất                                                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical browser origin | `http://dev-recall.localhost` qua route hiện tại. `http://127.0.0.1:15300` là direct/test origin riêng; không được xem là cùng profile hay cùng kho. Nếu sau này app có hostname production ổn định, phải có migration có chủ đích trước khi dùng origin đó để ghi. |
| Chủ sở hữu knowledge     | Người dùng sở hữu bản local trong IndexedDB của browser profile tại origin chính. Sau bootstrap, đây là **nguồn duy nhất có quyền ghi** cho profile đó.                                                                                                             |
| Vai trò YAML             | `data/*.yaml` là seed mặc định, source cho validation/build và fixture cho test. YAML không được nhập lại hoặc overlay mỗi lần khởi động sau bootstrap. Bản seed mới đi qua migration có kiểm soát; không tự ghi đè recall người dùng đã sửa.                       |
| Repository               | UI/search gọi hợp đồng `KnowledgeRepository`; implementation browser dùng IndexedDB. `UsageRepository` là ranh giới riêng về quyền reset/retention; usage chưa bật mặc định. Không buộc hai repository thành cùng schema hoặc cùng transaction.                     |
| Version                  | Metadata lưu `schemaVersion` cho cấu trúc database và seed version/manifest để biết bootstrap/migration đã chạy tới đâu. Version của file backup độc lập với cả hai. Migration phải forward có kiểm tra và có backup trước thay đổi dữ liệu.                        |
| Backup                   | Format JSON có `format`, `formatVersion`, `exportedAt`, `sourceOrigin` và danh sách knowledge. Knowledge luôn có trong bản backup đầy đủ. Usage/query history mặc định không đi kèm; nếu sau này hỗ trợ thì người dùng chọn riêng và thấy rõ trước khi export.      |
| Chuyển runtime           | Native runtime là profile/storage khác. Nếu gate G4 chọn Tauri, chuyển bằng export/import được kiểm, không giả định webview IndexedDB tự đọc chung. SQLite trong app directory là ứng viên cho Phase 15; Phase 1 không khóa package hay schema native.              |

## Ranh giới dữ liệu và khởi tạo

- Tách dữ liệu knowledge canonical khỏi metadata sử dụng: ID ổn định của recall là khóa tham chiếu; reset usage không xóa knowledge.
- App repository là nơi duy nhất nhận thay đổi knowledge. File backup là bản sao bên ngoài, không phải writer thứ hai; nó chỉ trở thành canonical sau một lần restore được người dùng yêu cầu và xác thực thành công.
- Ở lần chạy đầu, người dùng chọn khôi phục backup hoặc dùng seed. **Nếu chọn seed**, validate toàn bộ seed trước, rồi ghi các record và marker/version bootstrap trong cùng một transaction. Nếu chọn backup, validate backup thay cho seed và ghi backup cùng marker trong một transaction; không cần validate seed ở nhánh này. Nếu bất kỳ bước nào lỗi, transaction bị hủy và không có record hay marker một phần; lần sau phải thử lại hoặc báo lỗi, không được coi kho rỗng là đã khởi tạo.
- Hợp đồng cập nhật seed cho các phase sau: ID seed mới được thêm; ID chưa bị sửa local có thể nhận nội dung seed mới; ID đã bị người dùng sửa được giữ nguyên và đưa ra để xem xét cập nhật; ID bị bỏ khỏi seed không tự xóa dữ liệu local. Không tái sử dụng ID đã có cho một recall mang ý nghĩa khác. Cách xác định thay đổi local và màn hình xử lý conflict sẽ được đặc tả trước phase implement tương ứng.
- Nếu bootstrap/mở database thất bại, không âm thầm khởi tạo một kho rỗng có thể ghi. UI tương lai phải nói rõ storage lỗi và không giả rằng dữ liệu cá nhân đã biến mất; chỉ cho xem seed ở chế độ read-only nếu có fallback.
- Dữ liệu không tự gửi ra server. Không lưu query hoặc history qua lần mở app cho tới khi người dùng bật usage logging theo một quyết định riêng.
- `http://dev-recall.localhost` là route local hiện được cấp cho app và là origin canonical được đề xuất cho profile này; đây chưa phải hostname production hay cam kết URL lâu dài. `http://127.0.0.1:15300`, port khác, browser profile khác và Tauri webview là những phạm vi khác nhau. Nếu route canonical phải đổi, dừng ghi trên route mới cho tới khi người dùng export, xác thực và restore dữ liệu; không tự khởi tạo một profile trống rồi nhận ghi mới.

## Hợp đồng backup và khôi phục

- Export đầy đủ có knowledge cùng `formatVersion`, `exportedAt` và `sourceOrigin`. Bản export là bản sao portable; người dùng cần chủ động export trước khi bắt đầu authoring và trước một lần đổi origin/runtime.
- Restore phải kiểm tra format/version/schema và toàn bộ record trước khi ghi. ID trùng trong file, file lỗi/không đầy đủ hoặc format mới hơn mà app chưa hiểu đều bị từ chối nguyên file; không import một phần.
- Restore đầy đủ được thực hiện vào profile/origin đích sạch **trước lần bootstrap đầu tiên**. Startup phải cho người dùng chọn restore backup hoặc dùng seed mặc định; nếu restore được chọn, validate và ghi backup cùng marker bootstrap trong một transaction thay cho seed. Vì vậy, “chưa có knowledge” nghĩa là profile chưa bootstrap và chưa restore, không chỉ là database chưa có bản ghi do người dùng tạo.
- Nếu kho đã bootstrap (kể cả mới chỉ chứa seed), Phase 2–3 chưa được phép âm thầm merge hay replace bằng backup; phải dừng và hướng người dùng tới luồng có preview cùng lựa chọn rõ ràng. Policy cho luồng đó cần được chốt trước khi implement.
- Khi người dùng bắt đầu đổi origin, origin cũ vẫn là nguồn canonical nhưng chuyển sang read-only trước khi tạo export để không phát sinh thay đổi bị bỏ sót. Nếu chuyển bị hủy, có thể bật ghi lại trên origin cũ. Restore và xác minh xong ở origin mới, người dùng xác nhận thì mới chuyển quyền ghi; giữ nguyên kho cũ. Nếu cần sửa/xuất lại trong lúc chuyển, phải restore lại bản export mới nhất trước khi xác nhận. Chi tiết giao diện xác nhận/chuyển quyền ghi thuộc phase implement migration.
- Browser storage vẫn là best-effort. Phase 2 không phụ thuộc vào lời hứa từ API giữ chỗ lưu trữ và không tự xin quyền đó khi khởi động. Export thủ công vẫn là đường recovery portable; app cần cho người dùng thấy giới hạn này trước khi bật authoring.

## Các phương án đã cân nhắc

| Phương án                                          | Ưu điểm                                                                                         | Tradeoff và kết luận                                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Giữ YAML làm canonical duy nhất                    | File dễ đọc, diff/review qua Git, dễ backup thủ công.                                           | Browser không ghi được file repo một cách portable; Add/Edit tiếp tục buộc sửa YAML/build. Có thể làm content source/seed, không phù hợp làm kho authoring của app browser.                  |
| **IndexedDB trên browser**                         | Có transaction, async, object có cấu trúc và hoạt động offline; hợp với app hiện tại.           | Theo origin và profile; browser có quota/eviction hoặc người dùng xóa site data. Cần export/restore rõ ràng và không được hứa “không bao giờ mất”. **Đề xuất chọn trước cho browser-first.** |
| File do người dùng chọn qua File System Access API | Người dùng nhìn thấy file thật, dễ chủ động backup và dùng ngoài app.                           | Cần picker/permission từ user gesture, phạm vi hỗ trợ browser không đồng đều; xử lý file bị di chuyển, ghi dở và xung đột khó hơn. Chưa chọn làm backend chính.                              |
| Tauri + SQLite/file local                          | Trải nghiệm local rõ, phù hợp native và transaction; có đường lưu bền trong app data directory. | Đòi shell/package, permission scope, build/OS QA và migration riêng. Native chưa qua gate G4, nên hoãn quyết định triển khai tới Phase 13/15.                                                |
| `localStorage`                                     | API đơn giản.                                                                                   | Đồng bộ, dung lượng nhỏ, dễ chặn UI khi dữ liệu lớn; không có transaction cho thay đổi nhiều bản ghi. Không chọn làm canonical store.                                                        |

## Hệ quả và rủi ro chấp nhận

**Được:** có một đường browser-first để Phase 2 triển khai mà không viết trực tiếp vào YAML; đọc/ghi có transaction; offline; hợp đồng repository cho phép UI/search không phụ thuộc backend.

**Phải xử lý:** IndexedDB là best-effort storage. Người dùng có thể xóa site data; browser có thể thu hồi dữ liệu theo quota/pressure. Export tải file và restore phải được implement rồi kiểm ở Phase 2–3 trước khi coi Capture/Edit an toàn. Nếu storage denied/quota/corrupt/version mới hơn, app cần thông báo và recovery thay vì tạo kho trống.

**Không cam kết:** backup tự động, encryption-at-rest do app, sync nhiều máy, đọc chung giữa origins, ghi trực tiếp YAML, Tauri, SQLite hay browser support cho File System Access. Chúng cần phase/gate riêng.

## Rollback và migration

Trước Phase 2, rollback chỉ là giữ nguyên runtime YAML hiện tại vì ADR này chưa đổi app. Sau khi người dùng bắt đầu authoring ở IndexedDB, không thể rollback bằng cách bỏ database và quay về seed: phải export canonical knowledge, kiểm backup, rồi mới gỡ implementation hoặc chuyển runtime. Migration giữ ID/content/metadata hợp lệ, báo conflict theo ID, không silently merge hoặc ghi đè; recovery được kiểm trước khi xoá kho cũ.

Native migration (nếu được chọn) dùng bản export có version làm biên chuyển. Giữ bản browser gốc tới khi xác nhận import và hành trình restore trên native; không tự xóa dữ liệu nguồn sau copy.

## Điều kiện chốt

Phase 1 chỉ được đánh dấu `DONE` khi người dùng chốt hoặc sửa các điểm sau:

1. Đồng ý dùng IndexedDB cho browser-first và `dev-recall.localhost` là origin canonical, hay chọn phương án khác.
2. Đồng ý YAML chỉ còn là seed sau bootstrap; không có hai nguồn có quyền ghi.
3. Đồng ý export versioned JSON là đường sở hữu/phục hồi dữ liệu; query/usage không tự đi kèm backup.
4. Ghi rõ giới hạn best-effort của browser storage và việc native profile cần migration riêng.

Sau khi chốt, cập nhật status/date/người quyết định ở đây và execution baseline trong [Master Roadmap](../MASTER_ROADMAP.md). **Phase 1 không implement database, migration runtime, export, Add/Edit hoặc native code.**

## Nguồn kỹ thuật

- [IndexedDB: transactions, structured records và same-origin](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology)
- [IndexedDB: cách dùng, lỗi và version change](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Browser storage quota và eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Web Storage API và giới hạn của localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [File System API và quyền truy cập file](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) · [`showDirectoryPicker()` còn giới hạn hỗ trợ](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker)
- [Tauri SQL plugin](https://v2.tauri.app/plugin/sql/) · [Tauri capabilities và quyền theo webview](https://v2.tauri.app/security/capabilities/)
- [V0.1 architecture](../architecture.md) · [data contract](../data-format.md) · [Master Roadmap](../MASTER_ROADMAP.md)
