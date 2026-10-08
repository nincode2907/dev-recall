import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { searchCases } from "../tests/search-cases.ts";
import { readData } from "./read-data.ts";

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
  page.on("requestfailed", (request) =>
    console.error(
      `Request failed: ${request.url()} ${request.failure()?.errorText}`,
    ),
  );
  await page.goto(base);
  await expect(
    page.getByRole("heading", { name: "Bạn muốn làm gì?" }),
  ).toBeVisible();
  const input = page.getByRole("combobox");
  await expect(input).toBeFocused();
  await expect(page.getByRole("option")).toHaveCount(53);
  assert.equal(await page.locator("html").getAttribute("lang"), "vi");
  assert.equal((await page.request.get(`${base}/favicon.svg`)).status(), 200);
  await expect
    .poll(() =>
      page
        .locator(".brand img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);

  for (const [query, expectedId] of searchCases) {
    await input.fill(query);
    const top = await page
      .getByRole("option")
      .evaluateAll((rows) => rows.slice(0, 3).map((row) => row.id));
    assert.ok(
      top.includes(`result-${expectedId}`),
      `${query}: ${top.join(", ")}`,
    );
  }

  await input.fill("git rename branch");
  await input.press("Meta+a");
  await input.press("Meta+c");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "git rename branch",
    "Cmd+C phải copy text đã chọn",
  );
  await input.press("Control+k");
  assert.equal(
    await input.evaluate(
      (element: HTMLInputElement) =>
        element.selectionEnd! - element.selectionStart!,
    ),
    "git rename branch".length,
  );
  await input.press("Control+Enter");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "git branch -m <new-name>",
  );

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
  await expect(page.getByRole("option")).toHaveCount(11);
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
  await expect(page.locator(".key-plus")).toHaveText("→");
  await page.keyboard.press("Meta+k");
  await expect(input).toBeFocused();
  const selection = await input.evaluate(
    (element: HTMLInputElement) =>
      element.selectionEnd! - element.selectionStart!,
  );
  assert.equal(selection, "tmux chia man hinh doc".length);
  await page.screenshot({ path: "artifacts/app-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 1280, height: 800 });
  await input.fill("");
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await input.press("ArrowUp");
  assert.equal(
    await page.evaluate(() => window.scrollY),
    scrollBefore,
    "Chọn kết quả chỉ cuộn list",
  );
  await expect(input).toBeInViewport();
  await expect(page.getByRole("option").last()).toBeInViewport();
  await input.press("ArrowDown");
  await expect(page.getByRole("option").first()).toBeInViewport();
  await input.press("Enter");
  await expect(page.locator(".detail")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Sao chép nội dung" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Đã sao chép");
  await expect(page.getByRole("status")).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(input).toBeFocused();
  await input.press("ArrowDown");
  await expect(page.locator(".notice")).toBeEmpty();
  await page.screenshot({ path: "artifacts/app-laptop.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1100 });

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

  // Delayed clipboard: a double shortcut writes once; changing query must not
  // display a success notice that refers to an old selection.
  await page.evaluate(`window.copyCalls = 0;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: () => { window.copyCalls++; return new Promise(resolve => { window.finishCopy = resolve; }); }
    } });`);
  await input.fill("git rename branch");
  await input.press("Meta+Enter");
  await input.press("Meta+Enter");
  await expect(
    page.getByRole("button", { name: "Sao chép nội dung" }),
  ).toBeDisabled();
  assert.equal(
    await page.evaluate(
      () => (window as typeof window & { copyCalls: number }).copyCalls,
    ),
    1,
  );
  await input.fill("tmux zoom pane");
  await page.evaluate(() =>
    (window as typeof window & { finishCopy: () => void }).finishCopy(),
  );
  await expect(
    page.getByRole("button", { name: "Sao chép phím tắt" }),
  ).toBeEnabled();
  await expect(page.locator(".notice")).toBeEmpty();
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

  for (const name of [
    "plan-v1",
    "data-format",
    "architecture",
    "v0.1-review",
  ]) {
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
    const item = (await readData()).find((item) => item.id === "terminal-pwd")!;
    for (const [source, expected] of [
      ["[unclosed", "YAML không hợp lệ"],
      [JSON.stringify([item, item]), "id trùng"],
      ["not-a-list", "danh sách"],
    ]) {
      const badContext = await browser.newContext();
      const badPage = await badContext.newPage();
      await badPage.route("**/data/terminal.yaml*", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: `export default ${JSON.stringify(source)};`,
        }),
      );
      await badPage.goto(base);
      await expect(
        badPage.getByRole("heading", { name: "Chưa đọc được kho kiến thức" }),
      ).toBeVisible();
      await expect(badPage.getByRole("alert")).toContainText("terminal.yaml");
      await expect(badPage.getByRole("alert")).toContainText(expected);
      await expect(badPage.getByRole("alert")).toContainText(
        "npm run validate:data",
      );
      await expect(
        badPage.getByRole("button", { name: "Tải lại trang" }),
      ).toBeVisible();
      await badContext.close();
    }
  }

  const startupContext = await browser.newContext();
  const startupPage = await startupContext.newPage();
  let finishStartup!: () => void;
  const pendingStartup = new Promise<void>((resolve) => {
    finishStartup = resolve;
  });
  await startupPage.route(
    production ? "**/assets/*.js" : "**/src/main.tsx",
    async (route) => {
      await pendingStartup;
      await route.continue();
    },
  );
  await startupPage.goto(base, { waitUntil: "commit" });
  await expect(
    startupPage.getByText("Đang mở Dev Recall…", { exact: true }),
  ).toBeVisible();
  await expect(
    startupPage.getByRole("link", { name: "Tải lại trang nếu chờ quá lâu" }),
  ).toBeVisible();
  finishStartup();
  await expect(startupPage.getByRole("combobox")).toBeFocused();
  await expect(startupPage.locator(".startup")).toHaveCount(0);
  await startupContext.close();

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
  await expect
    .poll(() =>
      page
        .locator(".brand img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: "artifacts/app-ready.png", fullPage: false });
  assert.deepEqual(errors, [], `Lỗi browser: ${errors.join("; ")}`);
  console.log(
    `Browser ${production ? "production" : "dev"} đạt: 53 item, ${searchCases.length} queries top 3, Cmd/Ctrl keyboard + normal Cmd+C, clipboard thật/lỗi/pending, cảnh báo, empty, ${production ? "" : "malformed YAML + duplicate ID, "}startup, desktop/laptop/mobile, 4 tài liệu, favicon và proxy.`,
  );
} finally {
  await browser.close();
}
