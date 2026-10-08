import { useEffect, useMemo, useRef, useState } from "react";
import { loadCollection } from "../data/load";
import { categories } from "../data/schema";
import { createSearch } from "../search/engine";
import { ItemDetail } from "../components/ItemDetail";
import { categoryLabels, typeLabels } from "../data/labels";
import { Icon } from "../components/Icon";

const collection = loadCollection();
const suggestions = [
  "thằng nào giữ port",
  "tmux chia màn hình dọc",
  "mac xem file ẩn",
];

export function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const copyContextRef = useRef(0);
  const copyingRef = useRef(false);
  const orderedItems = useMemo(
    () =>
      [...collection.items].sort(
        (a, b) =>
          categories.indexOf(a.category) - categories.indexOf(b.category),
      ),
    [],
  );
  const search = useMemo(() => createSearch(orderedItems), [orderedItems]);
  const results = useMemo(() => search(query), [query, search]);
  const selectedIndex = Math.max(
    0,
    results.findIndex((item) => item.id === selectedId),
  );
  const selected = results[selectedIndex];

  function updateQuery(value: string) {
    copyContextRef.current++;
    setQuery(value);
    setSelectedId(null);
    setNotice(null);
  }
  function selectItem(id: string) {
    copyContextRef.current++;
    setSelectedId(id);
    setNotice(null);
  }
  async function copy(text: string, label: string) {
    if (copyingRef.current) return;
    copyingRef.current = true;
    const context = copyContextRef.current;
    setCopying(true);
    setNotice(null);
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard không khả dụng.");
      await navigator.clipboard.writeText(text);
      if (context === copyContextRef.current)
        setNotice({ kind: "success", message: `Đã sao chép ${label}.` });
    } catch {
      if (context === copyContextRef.current)
        setNotice({
          kind: "error",
          message:
            "Chưa sao chép được. Hãy chọn nội dung cần dùng rồi nhấn ⌘ C hoặc Ctrl C.",
        });
    } finally {
      copyingRef.current = false;
      setCopying(false);
    }
  }

  useEffect(() => {
    const current =
      selected && document.getElementById(`result-${selected.id}`);
    const list = current?.parentElement;
    if (current && list) {
      const row = current.getBoundingClientRect();
      const viewport = list.getBoundingClientRect();
      if (row.top < viewport.top) list.scrollTop += row.top - viewport.top;
      else if (row.bottom > viewport.bottom)
        list.scrollTop += row.bottom - viewport.bottom;
    }
  }, [selected]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "Enter" &&
        selected
      ) {
        event.preventDefault();
        void copy(selected.content, selected.title);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      const isSearchTarget =
        target === inputRef.current ||
        target.classList.contains("result-button");
      if (
        !isSearchTarget ||
        event.isComposing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (
        (event.key === "ArrowDown" || event.key === "ArrowUp") &&
        results.length
      ) {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const index =
          (selectedIndex + direction + results.length) % results.length;
        selectItem(results[index].id);
        if (target.classList.contains("result-button"))
          document.getElementById(`result-${results[index].id}`)?.focus();
      } else if (event.key === "Enter" && selected) {
        event.preventDefault();
        detailRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Dev Recall — Trang tra cứu">
          <img src="/favicon.svg" width="34" height="34" alt="" />
          <span>
            dev<span className="brand-light">recall</span>
            <span className="brand-period">.</span>
          </span>
        </a>
        <div className="header-note">
          <span className="status-dot" />
          Bộ nhớ thao tác cá nhân<span className="version">V0.1</span>
        </div>
      </header>
      <main>
        <div className="intro">
          <span className="eyebrow">NHỚ VIỆC, TÌM LẠI THAO TÁC</span>
          <h1>Bạn muốn làm gì?</h1>
          <p>Gõ theo cách bạn nhớ. Tìm lại câu lệnh, phím tắt và đường dẫn.</p>
        </div>
        {collection.error ? (
          <section className="data-error" role="alert">
            <Icon name="warning" size={28} />
            <h2>Chưa đọc được kho kiến thức</h2>
            <p>{collection.error}</p>
            <p>
              Kiểm tra file trong <code>data/</code>, chạy{" "}
              <code>npm run validate:data</code> rồi tải lại trang.
            </p>
            <button onClick={() => window.location.reload()}>
              Tải lại trang
            </button>
          </section>
        ) : (
          <>
            <div className="search-box">
              <Icon name="search" size={24} />
              <label className="sr-only" htmlFor="recall-search">
                Tìm thao tác bạn muốn làm
              </label>
              <input
                id="recall-search"
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Ví dụ: tmux chia màn hình dọc…"
                autoComplete="off"
                spellCheck={false}
                maxLength={180}
                role="combobox"
                aria-autocomplete="list"
                aria-controls="recall-results"
                aria-expanded={results.length > 0}
                aria-activedescendant={
                  selected ? `result-${selected.id}` : undefined
                }
              />
              <div className="search-accessories">
                {query ? (
                  <button
                    className="clear-search"
                    aria-label="Xóa nội dung tìm kiếm"
                    onClick={() => {
                      updateQuery("");
                      inputRef.current?.focus();
                    }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                ) : (
                  <kbd>⌘ K</kbd>
                )}
              </div>
            </div>
            <div className="query-suggestions">
              <span>Thử tìm</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    updateQuery(suggestion);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                  <Icon name="arrow" size={12} />
                </button>
              ))}
            </div>
            <div className="recall-panel">
              <section className="results-column" aria-label="Kết quả tìm kiếm">
                <div className="results-heading">
                  <span>
                    {query.trim() ? "Kết quả tìm kiếm" : "Kho thao tác của bạn"}
                  </span>
                  <span className="result-count" aria-live="polite">
                    {results.length}
                  </span>
                </div>
                <div
                  className="result-list"
                  id="recall-results"
                  role="listbox"
                  aria-label="Chọn thao tác"
                >
                  {results.map((item) => (
                    <button
                      key={item.id}
                      id={`result-${item.id}`}
                      className={`result-button ${selected?.id === item.id ? "is-selected" : ""}`}
                      role="option"
                      aria-selected={selected?.id === item.id}
                      tabIndex={selected?.id === item.id ? 0 : -1}
                      onClick={() => {
                        selectItem(item.id);
                      }}
                    >
                      <span className={`result-icon category-${item.category}`}>
                        <Icon
                          name={
                            item.type === "shortcut" ? "shortcut" : "terminal"
                          }
                          size={19}
                        />
                      </span>
                      <span className="result-text">
                        <span className="result-title">{item.title}</span>
                        <span className="result-meta">
                          {categoryLabels[item.category]}
                          <span>·</span>
                          {typeLabels[item.type]}
                          {item.risk !== "safe" && (
                            <span
                              className="risk-indicator"
                              title="Có lưu ý trước khi dùng"
                            >
                              <Icon name="warning" size={13} />
                              <span className="sr-only">
                                Có lưu ý trước khi dùng
                              </span>
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="result-arrow">
                        <Icon name="arrow" size={17} />
                      </span>
                    </button>
                  ))}
                </div>
                {!results.length && (
                  <div className="empty-list">
                    <Icon name="search" size={24} />
                    <strong>Chưa có kết quả phù hợp</strong>
                    <p>
                      Thử rút gọn câu hoặc thêm tên công cụ, như “tmux zoom”.
                    </p>
                    <button
                      onClick={() => {
                        updateQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      Xem lại kho thao tác
                    </button>
                  </div>
                )}
                <div className="results-footer">
                  <Icon name="book" size={15} />
                  <span>
                    {orderedItems.length} thao tác · {categories.length} nhóm
                  </span>
                </div>
              </section>
              {selected ? (
                <ItemDetail
                  item={selected}
                  ref={detailRef}
                  onCopy={(text, label) => void copy(text, label)}
                  copying={copying}
                />
              ) : (
                <section className="detail detail-empty">
                  <div className="empty-symbol" aria-hidden="true">
                    [ ? ]
                  </div>
                  <h2>Đổi cách tìm, thử lại nhé.</h2>
                  <p>
                    Kho thao tác tìm theo tên và cách gọi quen thuộc. Bạn có thể
                    gõ tiếng Việt không dấu hoặc tên lệnh.
                  </p>
                  <button
                    onClick={() => {
                      updateQuery("thằng nào giữ port");
                      inputRef.current?.focus();
                    }}
                  >
                    Thử “thằng nào giữ port”
                    <Icon name="arrow" size={16} />
                  </button>
                </section>
              )}
            </div>
            <div className="keyboard-guide">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> Chọn kết quả
              </span>
              <span>
                <kbd>↵</kbd> Xem chi tiết
              </span>
              <span>
                <kbd>⌘ ↵</kbd> Sao chép
              </span>
              <span>
                <kbd>Esc</kbd> Tìm tiếp
              </span>
            </div>
            <div
              className={`notice ${notice ? `notice-${notice.kind}` : ""}`}
              role="status"
              aria-live="polite"
            >
              {notice && (
                <>
                  <Icon
                    name={notice.kind === "success" ? "check" : "warning"}
                    size={18}
                  />
                  <span>{notice.message}</span>
                  <button
                    aria-label="Ẩn thông báo"
                    onClick={() => setNotice(null)}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </main>
      <footer className="app-footer">
        <span>Từ điều bạn từng biết, đến việc bạn cần làm.</span>
        <a href="/docs/plan-v1.html">
          Kế hoạch phát triển
          <Icon name="arrow" size={13} />
        </a>
      </footer>
    </div>
  );
}
