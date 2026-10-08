import assert from "node:assert/strict";
import { test } from "node:test";
import { performance } from "node:perf_hooks";
import { readData } from "../scripts/read-data.ts";
import { searchCases } from "./search-cases.ts";
import { createSearch, normalize } from "../src/search/engine.ts";

const items = await readData();
const search = createSearch(items);
const examples = searchCases;

for (const [query, expected] of examples)
  test(`Top 3: ${query}`, () => {
    const result = search(query);
    assert.ok(
      result.slice(0, 3).some((item) => item.id === expected),
      `Expected ${expected}, got ${result
        .slice(0, 3)
        .map((item) => item.id)
        .join(", ")}`,
    );
  });

test("Chuẩn hóa chữ đ, dấu, chữ hoa và khoảng trắng", () => {
  assert.equal(normalize("  ĐỔI   TÊN nhánh  "), "doi ten nhanh");
});
test("Query rỗng trả toàn bộ kho, vô nghĩa trả rỗng", () => {
  assert.equal(search("   ").length, 53);
  assert.equal(search("xyzqwerty987654").length, 0);
  assert.equal(search("tôi muốn cái gì").length, 0);
});
test("Tên công cụ giới hạn kết quả trong đúng nhóm", () => {
  for (const [category, count] of Object.entries({
    tmux: 11,
    git: 12,
    docker: 10,
    terminal: 10,
  })) {
    const result = search(`${category} rename`);
    assert.ok(result.every((item) => item.category === category));
    assert.equal(search(category).length, count);
  }
  assert.ok(
    search("mac xem file ẩn").every((item) => item.category === "macos"),
  );
});
test("Tìm aliases chính xác ưu tiên đúng item", () => {
  assert.equal(search("git diff staged")[0].id, "git-staged-diff");
  assert.equal(search("tmux rename")[0].id, "tmux-rename-window");
});
test("Không trả Git chỉ vì nhiều từ cùng khớp fuzzy yếu", () => {
  assert.deepEqual(
    search("thằng nào giữ port").map((item) => item.id),
    ["terminal-port-process"],
  );
});
test("Đo thời gian search với 53 item", () => {
  const timings = Array.from({ length: 100 }, (_, i) => {
    const uncachedSearch = createSearch(items);
    const start = performance.now();
    uncachedSearch(examples[i % examples.length][0]);
    return performance.now() - start;
  }).sort((a, b) => a - b);
  assert.ok(timings[94] < 100, "p95 search phải dưới 100 ms");
  console.log(
    `Search 53 item: p95 ${timings[94].toFixed(2)} ms, max ${timings.at(-1)!.toFixed(2)} ms (mục tiêu <100 ms).`,
  );
});

test("Các title và alias của 53 mục đều tìm được trong top 3", () => {
  for (const item of items)
    for (const query of [item.title, ...item.aliases])
      assert.ok(
        search(query)
          .slice(0, 3)
          .some((result) => result.id === item.id),
        `${item.id}: ${query}`,
      );
});
test("Query thiếu kiến thức không được ghép từ các fuzzy fragment", () => {
  for (const query of [
    "xem process nào ăn ram",
    "process ram",
    "terminal ram",
    "ram",
    "git recipe pineapple",
  ])
    assert.deepEqual(search(query), [], query);
});
