import { readData } from "./read-data.ts";

try {
  const items = await readData();
  console.log(
    `Dữ liệu hợp lệ: ${items.length} item, ${new Set(items.map((item) => item.category)).size} nhóm, ID duy nhất.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
