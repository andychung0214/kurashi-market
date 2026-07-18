# AMUHARU 品牌與動態分類改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將網站更名為 `AMUHARU｜安暮恆生活`，讓分類入口、可見商品、篩選與分類說明由可替換的前端設定驅動，並修復首頁 Hero 圖片。

**Architecture:** 新增一個純資料商店設定模組與一組可單元測試的分類解析函式；頁面只消費解析後的 `enabledCategories` 與 `visibleProducts`。目前分類由本機設定提供，未來後台只需產生相同資料形狀；品牌資訊由同一設定供共用外框與靜態商品頁產生器使用。

**Tech Stack:** HTML5、CSS、Vanilla JavaScript 原生 ES Modules、Node.js 內建測試工具、Python 靜態伺服器、瀏覽器手動驗證。

## Global Constraints

- 不使用 React、Angular、Vue、TypeScript、後端服務或大型函式庫。
- 網站維持純靜態託管相容性；不得依賴建構步驟才能瀏覽。
- 中文名稱固定為 `安暮恆生活`，英文名稱固定為 `AMUHARU`。
- 分類數量不得設 2、4 或 8 的上限；空設定必須顯示空狀態。
- 中文文件、註解與 UI 文案遵守 `AGENTS.md` 名詞翻譯規範。
- 不讀取、輸出或提交憑證、token、`.env` 或私人金鑰。
- 金流維持本機測試模擬，不呼叫綠界、不產生真實交易。
- 每個功能依測試驅動開發順序：先失敗測試、再最小實作、再通過測試。

---

## File Structure

- Create `src/js/data/storefront.js`：品牌設定、暫時啟用分類識別碼與通用品牌文案。
- Create `src/js/core/storefront.js`：解析啟用分類、篩出可見商品的純函式。
- Create `tests/storefront.test.js`：兩、四、八、未知與零分類案例。
- Create `src/js/pages/faq.js`：依啟用分類建立常見問題導覽與內容。
- Modify `src/js/data/products.js`：補充分類標記與分類專屬常見問題資料。
- Modify `src/js/pages/home.js`：渲染啟用分類、空狀態與可見精選商品。
- Modify `src/js/pages/products.js`：動態建立篩選選項並只搜尋可見商品。
- Modify `src/js/pages/product.js`：拒絕已停用商品並只推薦可見商品。
- Modify `src/js/ui/shell.js`：從設定輸出新品牌頁首與頁尾。
- Modify `src/css/pages.css`：分類格線改為自適應欄數。
- Modify `index.html`, `products.html`, `about.html`, `faq.html`：新品牌文案、動態掛載點與 Hero 圖片。
- Modify other root HTML files, `src/assets/placeholder-product.svg`：替換使用者可見的舊品牌。
- Modify `scripts/generate-product-pages.mjs`, generated `products/*.html`, `sitemap.xml`：同步靜態商品頁品牌與索引。
- Modify `README.md`, `docs/PLAN.md`, `docs/ART-DIRECTION.md`, `docs/TEST-PLAN.md`, `LICENSE`, `CONTRIBUTING.md`：更新品牌、架構與測試文件。
- Modify `tests/static-products.test.js`, `tests/ui.test.js`：驗證品牌一致性、靜態頁與外框。

---

### Task 1: 建立可替換的商店設定與分類解析層

**Files:**
- Create: `src/js/data/storefront.js`
- Create: `src/js/core/storefront.js`
- Modify: `src/js/data/products.js`
- Create: `tests/storefront.test.js`

**Interfaces:**
- Produces: `storefrontConfig: { brand, enabledCategoryIds }`
- Produces: `resolveEnabledCategories(categories, enabledIds, warn?): Category[]`
- Produces: `filterProductsByCategories(products, enabledCategories): Product[]`
- Category shape: `{ id, name, mark, note, faq: Array<{ question, answer }> }`

- [ ] **Step 1: 寫入失敗測試**

建立 `tests/storefront.test.js`，以獨立測試資料確認順序、任意數量、未知識別碼、警告、空設定及商品可見性：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEnabledCategories, filterProductsByCategories } from '../src/js/core/storefront.js';

const categories = Array.from({ length: 8 }, (_, index) => ({
  id: `category-${index + 1}`, name: `分類 ${index + 1}`
}));

for (const count of [2, 4, 8]) {
  test(`可依設定解析 ${count} 個分類且保留順序`, () => {
    const ids = categories.slice(0, count).map(({ id }) => id).reverse();
    assert.deepEqual(resolveEnabledCategories(categories, ids).map(({ id }) => id), ids);
  });
}

test('未知分類會被忽略並留下可讀警告', () => {
  const warnings = [];
  const result = resolveEnabledCategories(categories, ['category-2', 'missing'], (message) => warnings.push(message));
  assert.deepEqual(result.map(({ id }) => id), ['category-2']);
  assert.match(warnings[0], /missing/);
});

test('空設定不會擅自恢復全部分類', () => {
  assert.deepEqual(resolveEnabledCategories(categories, []), []);
});

test('商品只保留啟用分類', () => {
  const products = [{ id: 'a', category: 'category-1' }, { id: 'b', category: 'category-2' }];
  assert.deepEqual(filterProductsByCategories(products, [categories[1]]).map(({ id }) => id), ['b']);
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `node --test tests/storefront.test.js`

Expected: FAIL，錯誤指出找不到 `src/js/core/storefront.js`。

- [ ] **Step 3: 實作最小分類解析函式**

建立 `src/js/core/storefront.js`：

```js
export function resolveEnabledCategories(categories, enabledIds, warn = console.warn) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  return enabledIds.flatMap((id) => {
    const category = byId.get(id);
    if (category) return [category];
    warn(`忽略未知商品分類：${id}`);
    return [];
  });
}

export function filterProductsByCategories(products, enabledCategories) {
  const enabledIds = new Set(enabledCategories.map(({ id }) => id));
  return products.filter((product) => enabledIds.has(product.category));
}
```

建立 `src/js/data/storefront.js`：

```js
export const storefrontConfig = Object.freeze({
  brand: Object.freeze({
    englishName: 'AMUHARU',
    chineseName: '安暮恆生活',
    type: '日式生活提案型綜合商店',
    shortDescription: '從日常需要出發，整理值得長久相伴的商品與服務。'
  }),
  enabledCategoryIds: Object.freeze(['books', 'invitations', 'interiors', 'goods'])
});
```

為 `src/js/data/products.js` 的現有分類逐項增加 `mark` 與 `faq`。例如二手書分類：

```js
{
  id: 'books', name: '二手書', mark: '本', note: '留有時間手感的閱讀選本',
  faq: [
    { question: '書況如何說明？', answer: '每本書會記錄眉批、折痕、泛黃、藏書章與書衣狀態；商品詳情的描述優先於一般分級。' },
    { question: '同一本書可以買多本嗎？', answer: '依實際庫存為準。多數二手書只有一冊，購物車會自動限制數量。' }
  ]
}
```

其餘現有分類移入 `faq.html` 目前對應的專屬問答；沒有問答的分類允許使用空陣列。

- [ ] **Step 4: 執行單項與完整測試**

Run: `node --test tests/storefront.test.js`

Expected: 6 tests PASS。

Run: `npm test`

Expected: 全部既有測試與新測試 PASS。

- [ ] **Step 5: 提交分類設定層**

```powershell
git add -- src/js/data/storefront.js src/js/core/storefront.js src/js/data/products.js tests/storefront.test.js
git commit -m "feat(catalog): 建立可設定商品分類"
```

---

### Task 2: 讓首頁、商品列表、詳情與常見問題共用啟用分類

**Files:**
- Create: `src/js/pages/faq.js`
- Modify: `src/js/pages/home.js`
- Modify: `src/js/pages/products.js`
- Modify: `src/js/pages/product.js`
- Modify: `index.html`
- Modify: `products.html`
- Modify: `faq.html`
- Modify: `src/css/pages.css`
- Modify: `tests/ui.test.js`

**Interfaces:**
- Consumes: `storefrontConfig.enabledCategoryIds`
- Consumes: `resolveEnabledCategories(categories, enabledIds)`
- Consumes: `filterProductsByCategories(products, enabledCategories)`
- Produces: 首頁分類卡、列表篩選、可見商品、分類專屬常見問題與已停用商品保護。

- [ ] **Step 1: 寫入 UI 組字失敗測試**

把分類選項與分類卡組字抽成 `home.js`、`products.js` 可匯出的純函式前，先在 `tests/ui.test.js` 新增：

```js
import { categoryMarkup } from '../src/js/pages/home.js';
import { categoryOptionsMarkup } from '../src/js/pages/products.js';

test('分類卡與篩選選項依傳入分類產生', () => {
  const input = [
    { id: 'one', name: '分類一', mark: '一', note: '第一段說明' },
    { id: 'two', name: '分類二', mark: '二', note: '第二段說明' }
  ];
  assert.match(categoryMarkup(input), /category=one/);
  assert.doesNotMatch(categoryMarkup(input), /category=three/);
  assert.match(categoryOptionsMarkup(input), /value="two">分類二/);
});

test('零分類使用明確空狀態', () => {
  assert.match(categoryMarkup([]), /目前尚無分類/);
});
```

頁面模組必須用 `if (typeof document !== 'undefined')` 包住初始化，讓 Node.js 可匯入純函式。

- [ ] **Step 2: 執行 UI 測試確認失敗**

Run: `node --test tests/ui.test.js`

Expected: FAIL，錯誤指出 `categoryMarkup` 或 `categoryOptionsMarkup` 尚未匯出。

- [ ] **Step 3: 實作分類驅動畫面**

在 `home.js` 匯出並使用：

```js
export function categoryMarkup(items) {
  if (!items.length) return '<div class="empty-state"><h3>目前尚無分類</h3><p>新的生活提案正在整理中，歡迎稍後再來看看。</p></div>';
  return items.map((category) => `
    <a class="category-link" href="products.html?category=${encodeURIComponent(category.id)}">
      <span class="category-link__mark" aria-hidden="true">${escapeHtml(category.mark)}</span>
      <span><strong>${escapeHtml(category.name)}</strong><small>${escapeHtml(category.note)}</small></span>
      <span aria-hidden="true">→</span>
    </a>`).join('');
}
```

首頁精選改從 `visibleProducts` 篩選；分類卡改用 `enabledCategories`。`products.js` 匯出：

```js
export function categoryOptionsMarkup(items) {
  return '<option value="all">全部分類</option>' + items
    .map(({ id, name }) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`).join('');
}
```

兩個頁面函式皆從 `src/js/core/html.js` 匯入 `escapeHtml`；分類網址參數使用 `encodeURIComponent`。

`products.html` 的分類 `<select>` 只保留空掛載點，初始化時寫入上方結果；查詢參數若指定未啟用分類，回復 `all`。搜尋、排序與分頁輸入改用 `visibleProducts`。

`product.js` 從 `visibleProducts` 尋找商品，並用相同集合建立推薦。分類名稱從 `enabledCategories` 取得；已停用商品與未知商品共用找不到狀態。

建立 `faq.js`：從分類的 `faq` 陣列產生分類導覽與區段，再接上付款、配送等固定通用區段。分類問答為空時不建立空區段。所有分類名稱、問題與答案先用既有 `escapeHtml` 跳脫後插入。

`index.html` 分類標題改為 `Explore by need｜從生活需要開始`；精選說明改成不帶固定件數。`faq.html` 改用 `[data-category-faq-nav]` 與 `[data-category-faq-list]` 掛載點，載入 `src/js/pages/faq.js`。

`src/css/pages.css` 桌機分類格線改為：

```css
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  border-top: 1px solid var(--line);
  column-gap: 3rem;
}
```

移除媒體查詢中固定 `repeat(2, 1fr)` 的規則。

- [ ] **Step 4: 執行功能測試**

Run: `node --test tests/storefront.test.js tests/ui.test.js tests/catalog.test.js`

Expected: 全部指定測試 PASS。

Run: `npm test`

Expected: 全部測試 PASS。

- [ ] **Step 5: 提交分類驅動畫面**

```powershell
git add -- src/js/pages/home.js src/js/pages/products.js src/js/pages/product.js src/js/pages/faq.js index.html products.html faq.html src/css/pages.css tests/ui.test.js
git commit -m "feat(catalog): 讓前台依啟用分類呈現"
```

---

### Task 3: 套用 AMUHARU 品牌與分類中立文案

**Files:**
- Modify: `src/js/ui/shell.js`
- Modify: `index.html`, `products.html`, `product.html`, `cart.html`, `checkout.html`, `order-complete.html`, `favorites.html`, `account.html`, `about.html`, `faq.html`
- Modify: `src/assets/placeholder-product.svg`
- Modify: `tests/ui.test.js`
- Create: `tests/brand-copy.test.js`

**Interfaces:**
- Consumes: `storefrontConfig.brand`
- Produces: 全站使用者可見的新品牌名稱、分類中立介紹與 SEO 文案。

- [ ] **Step 1: 寫入品牌一致性失敗測試**

在 `tests/ui.test.js` 增加外框斷言：

```js
assert.match(markup.header, /AMUHARU/);
assert.match(markup.header, /安暮恆生活/);
assert.doesNotMatch(markup.header + markup.footer, /KURASHI|暮集選物所/);
```

建立 `tests/brand-copy.test.js`，只掃描使用者可見網站檔案，排除 `.git`、`.worktrees` 與歷史設計規格：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const rootFiles = ['index.html', 'products.html', 'product.html', 'cart.html', 'checkout.html', 'order-complete.html', 'favorites.html', 'account.html', 'about.html', 'faq.html'];

test('使用者可見頁面不含舊品牌或固定四分類文案', async () => {
  for (const file of rootFiles) {
    const content = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /KURASHI MARKET|暮集選物所|四大分類|四種生活|Four collections/);
  }
});
```

- [ ] **Step 2: 執行品牌測試確認失敗**

Run: `node --test tests/ui.test.js tests/brand-copy.test.js`

Expected: FAIL，列出仍含舊品牌的頁面與外框。

- [ ] **Step 3: 更新共用外框與頁面文案**

`shell.js` 匯入 `storefrontConfig`，品牌標記使用「安」，導覽使用「關於我們」，頁尾使用：

```html
<p class="footer-brand">安暮恆生活</p>
<p>從日常需要出發，整理值得長久相伴的商品與服務。</p>
```

首頁 Hero 使用：

```html
<p class="eyebrow">A calmer way to choose</p>
<h1>把喜歡的日常，<br>安穩留在身邊</h1>
<p class="lede">從每一天真正需要的事物出發，我們整理材質、狀態與服務內容，讓每一次選擇都更清楚、更長久。</p>
```

品牌介紹主文案使用：

```html
<p class="eyebrow">About AMUHARU</p>
<h1>選擇不必填滿生活，<br>只要回應真正的需要。</h1>
<p class="lede">AMUHARU 來自一家人的名字，也來自我們對生活的想像：安穩地感受日常，讓值得留下的事物長久相伴。</p>
```

其餘頁面的 `<title>`、Meta Description、Open Graph、可見標題、替代文字與版權逐一改成新品牌；通用文案不列舉現有四分類。分類專屬商品內容可保留。

- [ ] **Step 4: 執行品牌與完整測試**

Run: `node --test tests/ui.test.js tests/brand-copy.test.js`

Expected: 全部指定測試 PASS。

Run: `npm test`

Expected: 全部測試 PASS。

- [ ] **Step 5: 提交品牌改版**

```powershell
git add -- src/js/ui/shell.js src/assets/placeholder-product.svg index.html products.html product.html cart.html checkout.html order-complete.html favorites.html account.html about.html faq.html tests/ui.test.js tests/brand-copy.test.js
git commit -m "feat(brand): 套用安暮恆生活品牌文案"
```

---

### Task 4: 修復 Hero 圖片並同步靜態搜尋最佳化內容

**Files:**
- Modify: `index.html`
- Modify: `scripts/generate-product-pages.mjs`
- Modify: `tests/static-products.test.js`
- Regenerate: `products/*.html`
- Regenerate: `sitemap.xml`

**Interfaces:**
- Consumes: `storefrontConfig.brand`
- Produces: 可取得且有本機預留圖的 Hero 圖片、新品牌靜態商品頁與網站地圖。

- [ ] **Step 1: 選擇並實際確認新的 Unsplash 圖片**

使用瀏覽或 HTTP 請求驗證候選圖片網址，要求最終狀態為 200 且內容類型為圖片：

```powershell
$heroUrl = 'https://images.unsplash.com/photo-1734400743592-98fba1b25d49?auto=format&fit=crop&w=1600&q=85'
$response = Invoke-WebRequest -Uri $heroUrl -Method Head
$response.StatusCode
$response.Headers.'Content-Type'
```

Expected: `200` 且 `image/jpeg` 或 `image/webp`。不得使用 API Access Key 或 Secret Key。

- [ ] **Step 2: 寫入靜態頁失敗測試**

將 `tests/static-products.test.js` 的標題斷言改為：

```js
assert.match(html, new RegExp(`<title>${escapedName}｜安暮恆生活</title>`));
assert.match(html, /property="og:title" content="[^"]+｜安暮恆生活"/);
```

另確認首頁 Hero 有圖片失敗處理：

```js
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.match(home, /class="hero__media"[\s\S]+onerror="this\.onerror=null;this\.src='src\/assets\/placeholder-product\.svg'"/);
```

- [ ] **Step 3: 執行靜態測試確認失敗**

Run: `node --test tests/static-products.test.js`

Expected: FAIL，舊產生頁仍使用暮集品牌且 Hero 尚未提供預留圖。

- [ ] **Step 4: 實作 Hero 與產生器更新**

把驗證成功的網址同時套用到 `index.html` 的 Hero `img` 與 `og:image`，並在 Hero `img` 增加：

```html
onerror="this.onerror=null;this.src='src/assets/placeholder-product.svg'"
```

`scripts/generate-product-pages.mjs` 匯入 `storefrontConfig`，以 `storefrontConfig.brand.chineseName` 組成 `<title>` 與 `og:title`。執行：

Run: `npm run generate:products`

Expected: 16 個 `products/*.html` 與 `sitemap.xml` 重新產生。

- [ ] **Step 5: 驗證產生結果可重複**

Run: `node --test tests/static-products.test.js`

Expected: 全部靜態商品頁與 Sitemap 測試 PASS。

Run: `npm run generate:products; git diff --exit-code -- products sitemap.xml`

Expected: exit 0，第二次產生沒有差異。

- [ ] **Step 6: 提交圖片與靜態頁**

```powershell
git add -- index.html scripts/generate-product-pages.mjs tests/static-products.test.js products sitemap.xml
git commit -m "fix(media): 更新首頁圖片與靜態商品品牌"
```

---

### Task 5: 更新文件並完成全站驗證

**Files:**
- Modify: `README.md`
- Modify: `docs/PLAN.md`
- Modify: `docs/ART-DIRECTION.md`
- Modify: `docs/TEST-PLAN.md`
- Modify: `LICENSE`
- Modify: `CONTRIBUTING.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: 已完成的品牌、分類設定與驗證方式。
- Produces: 與實際程式碼一致的操作、架構、測試、限制與授權文件。

- [ ] **Step 1: 更新文件與套件名稱**

README 必須說明 `src/js/data/storefront.js` 是暫時的前台分類管理入口，並提供以下實際操作範例：

```js
enabledCategoryIds: Object.freeze(['books', 'goods'])
```

同時說明增至更多分類時，需先在分類資料與商品資料加入對應識別碼，再放進 `enabledCategoryIds`。`docs/PLAN.md`、`docs/ART-DIRECTION.md` 與 `docs/TEST-PLAN.md` 移除固定四分類的架構假設，保留「目前展示資料有四類」的事實。`package.json` 名稱改成 `amuharu-storefront`。LICENSE 版權名稱改為 `AMUHARU`。

- [ ] **Step 2: 搜尋舊品牌與固定分類假設**

Run:

```powershell
rg -n 'KURASHI MARKET|暮集選物所|Four collections|四種生活的入口|四大分類' -g '!.git/**' -g '!.worktrees/**' -g '!docs/superpowers/specs/2026-07-19-kurashi-market-design.md' -g '!docs/superpowers/specs/2026-07-19-amu-haru-dynamic-categories-design.md' -g '!docs/superpowers/plans/2026-07-19-kurashi-market.md'
```

Expected: 無輸出。新版規格中為說明遷移而保留的舊名稱不視為錯誤。

- [ ] **Step 3: 執行全部自動化驗證**

Run: `npm test`

Expected: 全部測試 PASS。

Run: `git diff --check`

Expected: 無輸出、exit 0。

Run: `rg -n '(apiAccessKey|apiSecretKey|HashKey|HashIV|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY)' -g '!.git/**' -g '!.worktrees/**'`

Expected: 除安全說明文字外，不得出現任何實際憑證值或私人金鑰內容。

- [ ] **Step 4: 啟動靜態伺服器並瀏覽器驗證**

Run: `python -m http.server 4173`

在瀏覽器以 1200px、768px、375px 驗證：

1. 首頁顯示 `AMUHARU｜安暮恆生活`，Hero 圖片可見。
2. 首頁分類卡數量等於 `enabledCategoryIds`，換行無溢位。
3. 商品列表分類選項與首頁一致，搜尋與排序正常。
4. 商品詳情、加入購物車、購物車與測試結帳流程正常。
5. 常見問題只顯示啟用分類的專屬說明。
6. 暫時將設定改為兩類與零類驗證畫面，再恢復四類並重跑 `npm test`；不得提交暫時設定。

Expected: 無阻斷操作的主控台錯誤；各寬度無水平溢位；付款畫面持續顯示未產生真實交易。

- [ ] **Step 5: 提交文件**

```powershell
git add -- README.md docs/PLAN.md docs/ART-DIRECTION.md docs/TEST-PLAN.md LICENSE CONTRIBUTING.md package.json
git commit -m "docs: 更新安暮恆品牌與分類設定說明"
```

---

### Task 6: 程式碼審查、最終驗證與 GitHub 推送

**Files:**
- Modify: only files required by actionable review findings

**Interfaces:**
- Produces: 已審查、已驗證且推送至 `origin/main` 的版本。

- [ ] **Step 1: 使用 requesting-code-review skill 審查**

審查範圍從 `e430891` 到目前 `HEAD`，重點檢查分類資料流、HTML 跳脫、停用商品、空分類、靜態產生器與文案一致性。若有重要問題，先依測試驅動開發修正並以 Conventional Commit 提交。

- [ ] **Step 2: 使用 verification-before-completion skill 執行新鮮驗證**

Run: `npm test`

Expected: 全部測試 PASS。

Run: `npm run generate:products; git status --short`

Expected: 產生器不造成未提交變更，工作目錄乾淨。

Run: `git log --oneline origin/main..HEAD`

Expected: 只包含本次已審查的規格、功能、修正與文件提交。

- [ ] **Step 3: 推送前顯示必要資訊**

Run:

```powershell
git remote get-url origin
git branch --show-current
git log --oneline origin/main..HEAD
```

將上述 remote、branch 與所有待推送 commit 原樣回報給使用者後，才可執行 push。

- [ ] **Step 4: 推送並驗證遠端**

Run: `git push origin main`

Expected: push 成功。

Run: `git rev-parse HEAD; git ls-remote origin refs/heads/main`

Expected: 本機 HEAD 與遠端 main SHA 完全相同。

- [ ] **Step 5: 使用 finishing-a-development-branch skill 收尾**

確認沒有待提交變更、不遺留測試伺服器處理序，並回報實作內容、測試數量、瀏覽器驗證證據、審查結果、推送 commit 與遠端 SHA。
