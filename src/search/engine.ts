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

export function createSearch(items: RecallItem[]) {
  const indexed = items.map((item) => ({
    item,
    title: normalize(item.title),
    aliases: item.aliases.map(normalize),
    category: item.category === "macos" ? "mac macos" : item.category,
    content: normalize(item.content),
  }));
  const fuse = new Fuse(indexed, {
    keys: [
      { name: "title", weight: 0.35 },
      { name: "aliases", weight: 0.45 },
      { name: "category", weight: 0.15 },
      { name: "content", weight: 0.05 },
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
        // Multi-word queries need enough literal evidence, rather than every word
        // matching an unrelated typo in a different field.
        const searchable = [
          entry.title,
          ...entry.aliases,
          entry.category,
          entry.content,
        ].join(" ");
        if (
          tokens.length > 1 &&
          tokens.filter((token) => searchable.includes(token)).length <
            Math.ceil(tokens.length / 2)
        )
          return [];
        const phrases = [entry.title, ...entry.aliases];
        let score =
          (scores as number[]).reduce((sum, s) => sum + s, 0) / scores.length;
        if (phrases.some((phrase) => phrase === q)) score -= 3;
        else if (phrases.some((phrase) => phrase.includes(q))) score -= 1;
        return [{ item: entry.item, score }];
      })
      .sort(
        (a, b) =>
          a.score - b.score || a.item.title.localeCompare(b.item.title, "vi"),
      )
      .map((result) => result.item);
  };
}
