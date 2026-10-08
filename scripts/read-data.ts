import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseCollection } from "../src/data/schema.ts";

export async function readData() {
  const folder = new URL("../data/", import.meta.url);
  const files = (await readdir(folder))
    .filter((file) => file.endsWith(".yaml"))
    .sort();
  const sources = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [
        file,
        await readFile(fileURLToPath(new URL(file, folder)), "utf8"),
      ]),
    ),
  );
  return parseCollection(sources);
}
