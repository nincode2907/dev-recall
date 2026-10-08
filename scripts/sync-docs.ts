import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";

const names = ["plan-v1", "data-format", "architecture", "v0.1-review"];
await mkdir(new URL("../public/docs/", import.meta.url), { recursive: true });
for (const name of names) {
  const markdown = await readFile(
    new URL(`../docs/${name}.md`, import.meta.url),
  );
  const hash = createHash("sha256").update(markdown).digest("hex");
  const html = await readFile(
    new URL(`../docs/${name}.html`, import.meta.url),
    "utf8",
  );
  const declaredHashes = [
    ...html.matchAll(
      /<meta\s+name="source-sha256"\s+content="([a-f0-9]{64})"\s*\/?>/g,
    ),
  ];
  if (declaredHashes.length !== 1 || declaredHashes[0][1] !== hash)
    throw new Error(
      `${name}.html chưa đồng bộ Markdown. Đọc source, cập nhật nội dung HTML và source-sha256.`,
    );
  for (const extension of ["md", "html"])
    await copyFile(
      new URL(`../docs/${name}.${extension}`, import.meta.url),
      new URL(`../public/docs/${name}.${extension}`, import.meta.url),
    );
}
console.log(
  `Đã kiểm nguồn Markdown và đồng bộ ${names.length} cặp tài liệu vào public/docs.`,
);
