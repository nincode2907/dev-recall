import type { Category, ItemType } from "./schema";

export const categoryLabels = {
  terminal: "Terminal",
  tmux: "tmux",
  git: "Git",
  docker: "Docker",
  macos: "macOS",
} satisfies Record<Category, string>;

export const typeLabels = {
  command: "Câu lệnh",
  shortcut: "Phím tắt",
  path: "Đường dẫn",
  config: "Cấu hình",
  snippet: "Đoạn mã",
  concept: "Khái niệm",
  workflow: "Quy trình",
  routine: "Thao tác định kỳ",
  fix: "Cách xử lý",
} satisfies Record<ItemType, string>;
