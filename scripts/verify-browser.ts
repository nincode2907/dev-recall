import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const base = "http://127.0.0.1:15300";
const production = process.argv.includes("--production");
await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await expect(
    page.getByRole("heading", { name: "Bạn muốn làm gì?" }),
  ).toBeVisible();
  const input = page.getByRole("combobox");
  await expect(input).toBeFocused();
  await expect(page.getByRole("option")).toHaveCount(53);
  assert.equal(await page.locator("html").getAttribute("lang"), "vi");
  assert.equal((await page.request.get(`${base}/favicon.svg`)).status(), 200);

  await input.fill("thằng nào giữ port");
  await expect(
    page.getByRole("heading", {
      name: "Xem tiến trình đang giữ port",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sao chép nội dung" }).click();
  await expect(page.getByRole("status")).toContainText("Đã sao chép");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "lsof -nP -i :<port>",
  );
  await page.getByRole("button", { name: "Sao chép ví dụ" }).click();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "lsof -nP -i :3000",
  );

  await input.fill("tmux");
  await expect(page.getByRole("option")).toHaveCount(10);
  const before = await input.getAttribute("aria-activedescendant");
  await input.press("ArrowDown");
  assert.notEqual(await input.getAttribute("aria-activedescendant"), before);
  await input.press("Enter");
  await expect(page.locator(".detail")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(input).toBeFocused();
  await input.fill("tmux chia man hinh doc");
  await expect(
    page.getByRole("heading", { name: "Chia pane tmux trái/phải" }),
  ).toBeVisible();
  await page.keyboard.press("Meta+Enter");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "Prefix + %",
  );
  await page.keyboard.press("Meta+k");
  await expect(input).toBeFocused();
  const selection = await input.evaluate(
    (element: HTMLInputElement) =>
      element.selectionEnd! - element.selectionStart!,
  );
  assert.equal(selection, "tmux chia man hinh doc".length);
  await page.screenshot({ path: "artifacts/app-desktop.png", fullPage: true });

  await input.fill("docker xóa container chết");
  await expect(page.locator(".risk-destructive")).toContainText(
    "tất cả container đã dừng",
  );
  await input.fill("xyzqwerty987654");
  await expect(
    page.getByText("Chưa có kết quả phù hợp", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sao chép nội dung" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Xem lại kho thao tác" }).click();
  await expect(page.getByRole("option")).toHaveCount(53);
  await input.fill("tmux");
  await input.press("ArrowUp");
  await input.fill("");
  await expect(page.getByRole("option").first()).toBeInViewport();

  await page.evaluate(
    "Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } })",
  );
  await page.getByRole("button", { name: "Sao chép nội dung" }).click();
  await expect(page.getByRole("status")).toContainText("Chưa sao chép được");
  await page.reload();

  await page.setViewportSize({ width: 390, height: 844 });
  await input.fill("thằng nào giữ port");
  await expect(
    page.getByRole("button", { name: "Sao chép ví dụ" }),
  ).toBeVisible();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "Mobile có tràn ngang",
  );
  await page.screenshot({ path: "artifacts/app-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1100 });

  for (const name of ["plan-v1", "data-format"]) {
    await page.goto(`${base}/docs/${name}.html`);
    await expect(page.locator("h1")).toBeVisible();
    assert.equal(await page.locator("html").getAttribute("lang"), "vi");
    assert.ok(await page.locator('link[rel="icon"]').getAttribute("href"));
    assert.equal(
      (await page.request.get(`${base}/docs/${name}.md`)).status(),
      200,
    );
    await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${name} tràn ngang`,
    );
    await page.setViewportSize({ width: 1440, height: 1100 });
  }

  if (!production) {
    const badContext = await browser.newContext();
    const badPage = await badContext.newPage();
    await badPage.route("**/data/terminal.yaml*", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: 'export default "not-a-list";',
      }),
    );
    await badPage.goto(base);
    await expect(
      badPage.getByRole("heading", { name: "Chưa đọc được kho kiến thức" }),
    ).toBeVisible();
    await expect(badPage.getByRole("alert")).toContainText("terminal.yaml");
    await badContext.close();
  }

  await page.goto("http://dev-recall.localhost");
  await expect(
    page.getByRole("heading", { name: "Bạn muốn làm gì?" }),
  ).toBeVisible();
  await page.getByRole("combobox").fill("mac xem file ẩn");
  await expect(
    page.getByRole("heading", { name: "Hiện hoặc ẩn file ẩn trong Finder" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sao chép phím tắt" }).click();
  await expect(page.getByRole("status")).toContainText("Đã sao chép");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "⌘ + Shift + .",
  );
  assert.deepEqual(errors, [], `Lỗi browser: ${errors.join("; ")}`);
  console.log(
    `Browser ${production ? "production" : "dev"} đạt: 53 item, query, keyboard/focus, clipboard thật + lỗi, cảnh báo, empty, ${production ? "" : "dữ liệu lỗi, "}mobile, 2 tài liệu, favicon và proxy.`,
  );
} finally {
  await browser.close();
}
