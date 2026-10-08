import assert from "node:assert/strict";
import { test } from "node:test";
import { readData } from "../scripts/read-data.ts";
import { parseCollection } from "../src/data/schema.ts";

const items = await readData();
const valid = items[0];
const source = (item: unknown) => ({ "sample.yaml": JSON.stringify([item]) });

test("53 item, mỗi category đủ seed dự kiến", () => {
  assert.equal(items.length, 53);
  assert.equal(new Set(items.map((item) => item.id)).size, 53);
  for (const [category, count] of Object.entries({
    terminal: 10,
    tmux: 11,
    git: 11,
    docker: 10,
    macos: 10,
  }))
    assert.equal(
      items.filter((item) => item.category === category).length,
      count,
    );
});
test("ID trùng giữa các file bị từ chối", () => {
  assert.throws(
    () =>
      parseCollection({
        ...source(valid),
        "other.yaml": JSON.stringify([valid]),
      }),
    /id trùng/,
  );
});
test("Từ chối YAML lỗi, collection rỗng và object thay vì list", () => {
  for (const value of ["[unclosed", "[]", "title: wrong"])
    assert.throws(
      () => parseCollection({ "broken.yaml": value }),
      /broken.yaml/,
    );
  assert.throws(() => parseCollection({}), /Không tìm thấy dữ liệu/);
});
test("Schema phát hiện trường thiếu, lỗi gõ field và sai type", () => {
  for (const row of [
    { ...valid, title: "" },
    { ...valid, aliases: [] },
    { ...valid, aliases: [2] },
    { ...valid, type: "invalid" },
    { ...valid, category: "invalid" },
    { ...valid, id: "Bad ID" },
    { ...valid, command: "pwd" },
    { ...valid, example: 42 },
  ]) {
    assert.throws(() => parseCollection(source(row)), /sample.yaml/);
  }
});
test("Thao tác có tác động phải giải thích riskNote", () => {
  assert.throws(
    () =>
      parseCollection(
        source({ ...valid, risk: "destructive", riskNote: undefined }),
      ),
    /riskNote/,
  );
  assert.throws(
    () => parseCollection(source({ ...valid, risk: "caution", riskNote: "" })),
    /riskNote/,
  );
  assert.throws(
    () => parseCollection(source({ ...valid, risk: "invalid" })),
    /risk không hợp lệ/,
  );
});
