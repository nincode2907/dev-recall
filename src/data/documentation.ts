export type DocumentationItem = {
  source: string;
  title: string;
  description: string;
};

export type DocumentationSection = {
  title: string;
  documents: DocumentationItem[];
};

export const documentationSections: DocumentationSection[] = [
  {
    title: "Tổng quan sản phẩm",
    documents: [
      {
        source: "plan-v1.md",
        title: "Kế hoạch V0.1",
        description: "Phạm vi và trải nghiệm của phiên bản đầu.",
      },
      {
        source: "architecture.md",
        title: "Kiến trúc",
        description: "Cấu trúc app, search và runtime.",
      },
      {
        source: "data-format.md",
        title: "Định dạng dữ liệu",
        description: "Quy tắc thêm và kiểm tra kiến thức.",
      },
      {
        source: "v0.1-review.md",
        title: "Kiểm chứng V0.1",
        description: "Kết quả QA, phạm vi và giới hạn đã biết.",
      },
    ],
  },
  {
    title: "Roadmap và phát hành",
    documents: [
      {
        source: "MASTER_ROADMAP.md",
        title: "Master Roadmap",
        description: "Baseline hiện tại, phase kế tiếp và định nghĩa V1.",
      },
      {
        source: "decisions/ADR-001-storage.md",
        title: "ADR-001 — Lưu trữ và quyền sở hữu dữ liệu",
        description: "Đề xuất IndexedDB browser-first; chờ người dùng chốt.",
      },
      {
        source: "release-notes.md",
        title: "Quy ước Có gì mới",
        description: "Quy tắc ghi thay đổi cho mọi version, kể cả patch.",
      },
    ],
  },
  {
    title: "Các phiên bản",
    documents: [
      {
        source: "releases/index.md",
        title: "Lịch sử versions",
        description: "Danh sách release notes mới nhất trước.",
      },
      {
        source: "releases/v0.1.0.md",
        title: "V0.1.0 — Có gì mới",
        description: "Tính năng, sửa lỗi và bằng chứng của bản đầu.",
      },
    ],
  },
];

export const documentation: DocumentationItem[] = documentationSections.flatMap(
  (section) => section.documents,
);

export function documentationUrl(source: string, extension: "html" | "md") {
  return `/docs/${source.replace(/\.md$/, `.${extension}`)}`;
}
