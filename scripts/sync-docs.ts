import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { documentation } from "../src/data/documentation.ts";

async function documentationFiles(
  directory: URL,
  prefix = "",
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = `${prefix}${entry.name}`;
    const child = new URL(
      `${entry.name}${entry.isDirectory() ? "/" : ""}`,
      directory,
    );
    if (entry.isDirectory())
      files.push(...(await documentationFiles(child, `${relativePath}/`)));
    else if (
      entry.isFile() &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".html"))
    )
      files.push(relativePath);
  }
  return files;
}

const docsDirectory = new URL("../docs/", import.meta.url);
const catalogSources = documentation.map((document) => document.source).sort();
const catalogFiles = catalogSources
  .flatMap((source) => [source, source.replace(/\.md$/, ".html")])
  .sort();
const sourceFiles = (await documentationFiles(docsDirectory)).sort();
if (new Set(catalogSources).size !== catalogSources.length)
  throw new Error("Danh mục UI có tài liệu bị khai báo trùng.");
if (catalogFiles.join("\n") !== sourceFiles.join("\n")) {
  const missing = sourceFiles.filter((file) => !catalogFiles.includes(file));
  const stale = catalogFiles.filter((file) => !sourceFiles.includes(file));
  throw new Error(
    `Danh mục tài liệu UI không khớp thư mục docs. Chưa có link: ${missing.join(", ") || "không"}; nguồn không tồn tại: ${stale.join(", ") || "không"}.`,
  );
}

const publicDirectory = new URL("../public/docs/", import.meta.url);
for (const source of catalogSources) {
  const html = source.replace(/\.md$/, ".html");
  const markdownBytes = await readFile(new URL(source, docsDirectory));
  const digest = createHash("sha256").update(markdownBytes).digest("hex");
  const htmlContent = await readFile(new URL(html, docsDirectory), "utf8");
  const declaredHashes = [
    ...htmlContent.matchAll(
      /<meta\s+name="source-sha256"\s+content="([a-f0-9]{64})"\s*\/?>/g,
    ),
  ];
  if (declaredHashes.length !== 1 || declaredHashes[0][1] !== digest)
    throw new Error(
      `${html} chưa đồng bộ với ${source}; cập nhật nội dung HTML và source-sha256.`,
    );

  const outputDirectory = new URL(
    `${dirname(source) === "." ? "" : `${dirname(source)}/`}`,
    publicDirectory,
  );
  await mkdir(outputDirectory, { recursive: true });
  await copyFile(
    new URL(source, docsDirectory),
    new URL(source, publicDirectory),
  );
  await copyFile(new URL(html, docsDirectory), new URL(html, publicDirectory));
}
console.log(
  `Đã kiểm hash và đồng bộ ${catalogSources.length} cặp tài liệu vào public/docs.`,
);
