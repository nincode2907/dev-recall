import { parseCollection, type RecallItem } from "./schema";

export type CollectionState =
  { items: RecallItem[]; error: null } | { items: []; error: string };

export function loadCollection(): CollectionState {
  try {
    const sources = import.meta.glob<string>("../../data/*.yaml", {
      query: "?raw",
      import: "default",
      eager: true,
    });
    return { items: parseCollection(sources), error: null };
  } catch (error) {
    return {
      items: [],
      error: error instanceof Error ? error.message : "Không đọc được dữ liệu.",
    };
  }
}
