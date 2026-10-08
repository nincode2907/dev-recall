import { parse } from "yaml";

export const itemTypes = [
  "command",
  "shortcut",
  "path",
  "config",
  "snippet",
  "concept",
  "workflow",
  "routine",
  "fix",
] as const;
export const categories = [
  "terminal",
  "tmux",
  "git",
  "docker",
  "macos",
] as const;
export type Category = (typeof categories)[number];
export type ItemType = (typeof itemTypes)[number];

export interface RecallItem {
  id: string;
  title: string;
  type: ItemType;
  category: Category;
  aliases: string[];
  content: string;
  note: string;
  example?: string;
  risk: "safe" | "caution" | "destructive";
  riskNote?: string;
}

const fields = new Set([
  "id",
  "title",
  "type",
  "category",
  "aliases",
  "content",
  "example",
  "note",
  "risk",
  "riskNote",
]);
const textFields = ["id", "title", "content", "note"] as const;
const isText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

export function parseCollection(sources: Record<string, string>): RecallItem[] {
  const items: RecallItem[] = [];
  const ids = new Set<string>();
  for (const [file, source] of Object.entries(sources).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    let entries: unknown;
    try {
      entries = parse(source);
    } catch {
      throw new Error(
        `${file}: YAML không hợp lệ. Kiểm tra thụt dòng và dấu ngoặc.`,
      );
    }
    if (!Array.isArray(entries) || entries.length === 0)
      throw new Error(`${file}: cần một danh sách item không rỗng.`);
    for (const [index, entry] of entries.entries()) {
      const where = `${file}, item ${index + 1}`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        throw new Error(`${where}: item phải là object.`);
      const row = entry as Record<string, unknown>;
      for (const key of Object.keys(row))
        if (!fields.has(key))
          throw new Error(`${where}: trường không được hỗ trợ “${key}”.`);
      for (const field of textFields)
        if (!isText(row[field]))
          throw new Error(`${where}: thiếu hoặc sai ${field}.`);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id as string))
        throw new Error(
          `${where}: id phải dùng chữ thường, số và dấu gạch ngang.`,
        );
      if (!itemTypes.includes(row.type as ItemType))
        throw new Error(`${where}: type không hợp lệ.`);
      if (!categories.includes(row.category as Category))
        throw new Error(`${where}: category không hợp lệ.`);
      if (
        !Array.isArray(row.aliases) ||
        !row.aliases.length ||
        !row.aliases.every(isText)
      )
        throw new Error(
          `${where}: aliases phải là danh sách chuỗi không rỗng.`,
        );
      if (!["safe", "caution", "destructive"].includes(row.risk as string))
        throw new Error(`${where}: risk không hợp lệ.`);
      for (const field of ["example", "riskNote"])
        if (row[field] !== undefined && !isText(row[field]))
          throw new Error(`${where}: ${field} phải là chuỗi không rỗng.`);
      if (row.risk !== "safe" && !isText(row.riskNote))
        throw new Error(`${where}: thao tác cần chú ý phải có riskNote.`);
      if (ids.has(row.id as string))
        throw new Error(`${where}: id trùng “${row.id}”.`);
      ids.add(row.id as string);
      items.push(row as unknown as RecallItem);
    }
  }
  if (!items.length)
    throw new Error("Không tìm thấy dữ liệu. Kiểm tra data/*.yaml.");
  return items;
}
