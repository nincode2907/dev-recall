import Fuse from "fuse.js";
import { categories, type RecallItem } from "../data/schema";

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

const stopWords = new Set([
  "toi",
  "minh",
  "muon",
  "cach",
  "de",
  "cho",
  "cai",
  "lenh",
  "nao",
  "mot",
  "gi",
]);
const categoryWords: Record<string, string> = {
  mac: "macos",
  macos: "macos",
  terminal: "terminal",
  tmux: "tmux",
  git: "git",
  docker: "docker",
};

// A small typo means one insertion/deletion/substitution or adjacent swap.
// Do not let short words match arbitrary fragments in unrelated fields.
function nearWord(a: string, b: string): boolean {
  if (a.length < 3 || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const different = [...a].flatMap((char, i) => (char === b[i] ? [] : [i]));
    if (different.length <= 1) return true;
    const [i, j] = different;
    return (
      different.length === 2 && j === i + 1 && a[i] === b[j] && a[j] === b[i]
    );
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
    } else if (!skipped) {
      skipped = true;
      j++;
    } else return false;
  }
  return true;
}

export function createSearch(items: RecallItem[]) {
  const indexed = items.map((item) => {
    const title = normalize(item.title);
    const aliases = item.aliases.map(normalize);
    const content = normalize(item.content);
    const example = normalize(item.example ?? "");
    const category = item.category === "macos" ? "mac macos" : item.category;
    const searchable = [title, ...aliases, category, content, example].join(
      " ",
    );
    return {
      item,
      title,
      aliases,
      category,
      content,
      example,
      searchable,
      words: [...new Set(searchable.split(/[^\p{L}\p{N}]+/u).filter(Boolean))],
    };
  });
  const fuse = new Fuse(indexed, {
    keys: [
      { name: "title", weight: 0.35 },
      { name: "aliases", weight: 0.45 },
      { name: "category", weight: 0.15 },
      { name: "content", weight: 0.05 },
      { name: "example", weight: 0.05 },
    ],
    threshold: 0.36,
    ignoreLocation: true,
    includeScore: true,
    shouldSort: true,
  });
  const tokenCache = new Map<string, Map<string, number>>();

  return (query: string): RecallItem[] => {
    const q = normalize(query);
    if (!q) return items;
    const tokens = [
      ...new Set(q.split(" ").filter((token) => !stopWords.has(token))),
    ];
    if (!tokens.length) return [];
    const category = tokens
      .map((token) => categoryWords[token])
      .find((value) =>
        categories.includes(value as (typeof categories)[number]),
      );
    const intentTokens = tokens.filter((token) => !categoryWords[token]);
    const tokenScores = tokens.map((token) => {
      const cached = tokenCache.get(token);
      if (cached) return cached;
      const scores = new Map(
        fuse
          .search(token)
          .map((result) => [result.item.item.id, result.score ?? 1]),
      );
      if (tokenCache.size >= 200) tokenCache.clear();
      tokenCache.set(token, scores);
      return scores;
    });
    return indexed
      .flatMap((entry) => {
        if (category && entry.item.category !== category) return [];
        const scores = tokenScores.map((map) => map.get(entry.item.id));
        if (scores.some((score) => score === undefined)) return [];
        let fuzzyCount = 0;
        for (const token of intentTokens) {
          const literal = /^[\p{L}\p{N}]+$/u.test(token)
            ? entry.words.some(
                (word) =>
                  word === token ||
                  (token.length >= 3 && word.startsWith(token)),
              )
            : entry.searchable.includes(token);
          if (literal) continue;
          // A bare short acronym is too ambiguous for a fuzzy guess.
          if (intentTokens.length === 1 && token.length <= 3 && !category)
            return [];
          if (!entry.words.some((word) => nearWord(token, word))) return [];
          fuzzyCount++;
        }
        if (fuzzyCount > Math.max(1, Math.floor(intentTokens.length / 3)))
          return [];
        const phrases = [entry.title, ...entry.aliases];
        let score =
          (scores as number[]).reduce((sum, s) => sum + s, 0) / scores.length;
        const tier =
          phrases.some((phrase) => phrase === q) ||
          entry.content === q ||
          entry.example === q
            ? 0
            : phrases.some((phrase) => phrase.includes(q)) ||
                entry.content.includes(q)
              ? 1
              : fuzzyCount === 0
                ? 2
                : 3;
        return [{ item: entry.item, score, tier }];
      })
      .sort(
        (a, b) =>
          a.tier - b.tier ||
          a.score - b.score ||
          a.item.title.localeCompare(b.item.title, "vi"),
      )
      .map((result) => result.item);
  };
}
