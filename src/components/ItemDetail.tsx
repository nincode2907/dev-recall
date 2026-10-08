import { forwardRef } from "react";
import type { RecallItem } from "../data/schema";
import { categoryLabels, typeLabels } from "../data/labels";
import { Icon } from "./Icon";

export const ItemDetail = forwardRef<
  HTMLElement,
  {
    item: RecallItem;
    copying: boolean;
    onCopy: (text: string, label: string) => void;
  }
>(function ItemDetail({ item, copying, onCopy }, ref) {
  const isShortcut = item.type === "shortcut";
  const isSequence = item.content.startsWith("Prefix + ");
  const hasTemplate = /<[^>]+>/.test(item.content);
  return (
    <section
      className="detail"
      tabIndex={-1}
      ref={ref}
      aria-labelledby="detail-title"
    >
      <div className="detail-meta">
        <span className={`category-label category-${item.category}`}>
          {categoryLabels[item.category]}
        </span>
        <span className="meta-divider">/</span>
        <span>{typeLabels[item.type]}</span>
        <span className="detail-marker" aria-hidden="true">
          <Icon name={isShortcut ? "shortcut" : "terminal"} />
        </span>
      </div>
      <h2 id="detail-title">{item.title}</h2>
      {item.risk !== "safe" && (
        <div className={`risk-note risk-${item.risk}`}>
          <Icon name="warning" size={18} />
          <div>
            <strong>
              {item.risk === "destructive"
                ? "Có thể mất dữ liệu hoặc kết thúc tác vụ"
                : "Cần chú ý trước khi dùng"}
            </strong>
            <p>{item.riskNote}</p>
          </div>
        </div>
      )}
      <div className={isShortcut ? "shortcut-surface" : "command-surface"}>
        <div className="surface-caption">
          {isShortcut
            ? "Phím cần nhớ"
            : hasTemplate
              ? "Mẫu lệnh"
              : item.type === "path"
                ? "Đường dẫn"
                : "Nội dung"}
          <span aria-hidden="true">{isShortcut ? "↳" : ">_"}</span>
        </div>
        {isShortcut ? (
          <div
            className="key-sequence"
            aria-label={
              isSequence
                ? item.content.replace(" + ", ", sau đó ")
                : item.content
            }
          >
            {item.content.split(" + ").map((key, i) => (
              <span className="key-part" key={`${i}-${key}`}>
                {i > 0 && (
                  <span className="key-plus" aria-hidden="true">
                    {isSequence ? "→" : "+"}
                  </span>
                )}
                <kbd>{key}</kbd>
              </span>
            ))}
          </div>
        ) : (
          <pre>
            <code>{item.content}</code>
          </pre>
        )}
        <button
          className={
            isShortcut ? "copy-action" : "copy-action copy-action-dark"
          }
          onClick={() => onCopy(item.content, item.title)}
          disabled={copying}
        >
          <Icon name="copy" size={17} />
          Sao chép {isShortcut ? "phím tắt" : "nội dung"}
          <span className="copy-key">⌘ ↵</span>
        </button>
      </div>
      {hasTemplate && (
        <p className="template-note">
          Thay phần trong <code>&lt;…&gt;</code> bằng giá trị của bạn trước khi
          dùng.
        </p>
      )}
      {item.example && (
        <div className="example-block">
          <div className="section-caption">
            Ví dụ
            <button
              className="copy-example"
              onClick={() => onCopy(item.example!, `ví dụ: ${item.title}`)}
              disabled={copying}
            >
              <Icon name="copy" size={15} />
              Sao chép ví dụ
            </button>
          </div>
          <pre>
            <code>{item.example}</code>
          </pre>
        </div>
      )}
      <div className="note-block">
        <div className="section-caption">Ghi nhớ</div>
        <p>{item.note}</p>
      </div>
      <div className="aliases-block">
        <div className="section-caption">Bạn cũng có thể tìm bằng</div>
        <div className="alias-tags">
          {item.aliases.map((alias) => (
            <span key={alias}>{alias}</span>
          ))}
        </div>
      </div>
      <div className="detail-footnote">
        <span className="tiny-dot" />
        Tra cứu và sao chép. Bạn chủ động dùng trong công cụ của mình.
      </div>
    </section>
  );
});
