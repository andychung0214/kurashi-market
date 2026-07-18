# 暮集選物所 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可直接部署至靜態網站託管環境、具完整本機購物流程與安全測試付款模擬的日式生活策展電商。

**Architecture:** 使用獨立 HTML 頁面與原生 ES Modules；純函式負責商品查詢、購物車金額、驗證與付款結果，瀏覽器模組負責畫面與 `localStorage`。所有頁面共用網站外框、主題與狀態層，綠界只保留未來伺服器端整合邊界。

**Tech Stack:** HTML5、CSS3、Vanilla JavaScript、原生 ES Modules、Node.js 20 內建 `node:test`、localStorage、Unsplash CDN 圖片。

## Global Constraints

- 不使用 React、Angular、Vue、TypeScript、後端服務或大型遊戲引擎。
- 首版可在 Synology NAS Web Station 等純靜態環境執行。
- 中文文件、註解與 UI 文案遵守專案 AGENTS.md 的繁體中文名詞翻譯規範。
- 不讀取、不輸出、不提交任何憑證、token、`.env` 或私人金鑰。
- 不在前端呼叫綠界或產生 CheckMacValue；付款結果必須標示為測試模擬。
- 新增業務行為必須先寫測試並確認因缺少功能而失敗，再撰寫最小實作。
- 主要斷點以 375px、768px 與 1200px 驗證，互動目標至少 44 × 44 CSS 像素。

---

### Task 1: 專案骨架、商品資料與儲存介面

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `src/js/data/products.js`
- Create: `src/js/core/storage.js`
- Create: `tests/storage.test.js`

**Interfaces:**
- Produces: `products: Product[]`
- Produces: `createSafeStorage(storage): { get(key, fallback), set(key, value), remove(key) }`

- [ ] **Step 1: 建立失敗測試**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafeStorage } from '../src/js/core/storage.js';

test('儲存空間拒絕存取時退回記憶體內資料', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const storage = createSafeStorage(blocked);
  storage.set('theme', 'forest');
  assert.equal(storage.get('theme', 'wine'), 'forest');
});
```

- [ ] **Step 2: 執行測試並確認失敗**

Run: `node --test tests/storage.test.js`

Expected: FAIL，錯誤指出找不到 `src/js/core/storage.js`。

- [ ] **Step 3: 建立最小實作與商品資料**

```js
export function createSafeStorage(storage = globalThis.localStorage) {
  const memory = new Map();
  return {
    get(key, fallback) {
      try { return JSON.parse(storage.getItem(key)) ?? fallback; }
      catch { return memory.has(key) ? memory.get(key) : fallback; }
    },
    set(key, value) {
      memory.set(key, value);
      try { storage.setItem(key, JSON.stringify(value)); return true; }
      catch { return false; }
    },
    remove(key) {
      memory.delete(key);
      try { storage.removeItem(key); } catch { /* 使用記憶體內狀態 */ }
    }
  };
}
```

`products.js` 建立至少 16 筆固定商品，四類各至少 4 筆；每筆包含 `id`、`category`、`name`、`price`、`stock`、`summary`、`description`、`images`、`tags`、`featured` 與分類專屬 `details`。室內設計案例另含 `kind: 'service'`，其他商品為 `kind: 'product'`。

- [ ] **Step 4: 加入測試指令並驗證**

```json
{
  "name": "kurashi-market",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test", "serve": "python -m http.server 4173" }
}
```

Run: `npm test`

Expected: PASS，1 個測試通過。

- [ ] **Step 5: 提交**

```bash
git add package.json .gitignore src/js/data/products.js src/js/core/storage.js tests/storage.test.js
git commit -m "feat(core): 建立商品資料與安全儲存層"
```

### Task 2: 購物車、商品查詢與付款核心

**Files:**
- Create: `src/js/core/cart.js`
- Create: `src/js/core/catalog.js`
- Create: `src/js/core/checkout.js`
- Create: `tests/cart.test.js`
- Create: `tests/catalog.test.js`
- Create: `tests/checkout.test.js`

**Interfaces:**
- Consumes: `Product[]`
- Produces: `addCartItem(items, product, quantity, variant)`、`updateCartQuantity(items, productId, quantity, stock)`、`calculateCart(items, options)`
- Produces: `filterProducts(products, filters)`、`sortProducts(products, sort)`、`paginate(items, page, pageSize)`
- Produces: `validateCheckout(input)`、`createTestPayment(method, order)`

- [ ] **Step 1: 建立購物車失敗測試**

```js
test('購物車限制數量並正確計算免運與折扣', () => {
  const product = { id: 'book-1', name: '山之書', price: 600, stock: 2 };
  const items = addCartItem([], product, 9, '預設');
  assert.equal(items[0].quantity, 2);
  assert.deepEqual(calculateCart(items, { coupon: 'KURASHI100' }), {
    subtotal: 1200, discount: 100, shipping: 100, total: 1200, remainingForFreeShipping: 800
  });
});
```

- [ ] **Step 2: 建立查詢與付款失敗測試**

```js
test('商品可依關鍵字與分類篩選', () => {
  const result = filterProducts(products, { query: '山', category: 'books' });
  assert.ok(result.length > 0);
  assert.ok(result.every((item) => item.category === 'books'));
});

test('ATM 只產生明確的測試付款資訊', () => {
  const payment = createTestPayment('atm', { id: 'KM-TEST', total: 1200 });
  assert.equal(payment.isSimulation, true);
  assert.match(payment.notice, /未產生真實交易/);
  assert.match(payment.reference, /^TEST-/);
});
```

- [ ] **Step 3: 執行測試並確認失敗**

Run: `node --test tests/cart.test.js tests/catalog.test.js tests/checkout.test.js`

Expected: FAIL，指出核心模組尚不存在。

- [ ] **Step 4: 撰寫最小核心實作**

```js
export function calculateCart(items, { coupon = '' } = {}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon.trim().toUpperCase() === 'KURASHI100' && subtotal >= 1000 ? 100 : 0;
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 100;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping,
    remainingForFreeShipping: Math.max(0, 2000 - subtotal) };
}

export function createTestPayment(method, order) {
  const suffix = String(order.id).replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase();
  const references = { card: `TEST-CARD-${suffix}`, atm: `TEST-ATM-${suffix}`, cvs: `TEST-CVS-${suffix}` };
  if (!references[method]) throw new Error('不支援的付款方式');
  return { method, reference: references[method], isSimulation: true,
    notice: '測試付款模擬：未產生真實交易。' };
}
```

同一步完成不可變購物車更新、大小寫不敏感搜尋、分類／價格篩選、四種排序、分頁及結帳必填欄位驗證。

- [ ] **Step 5: 驗證全部核心測試**

Run: `npm test`

Expected: PASS，儲存、購物車、商品查詢及付款測試全部通過。

- [ ] **Step 6: 提交**

```bash
git add src/js/core tests
git commit -m "feat(core): 建立購物車與測試付款邏輯"
```

### Task 3: 共用視覺系統、網站外框與主題

**Files:**
- Create: `src/css/tokens.css`
- Create: `src/css/base.css`
- Create: `src/css/components.css`
- Create: `src/css/pages.css`
- Create: `src/js/ui/shell.js`
- Create: `src/js/ui/theme.js`
- Create: `src/js/ui/product-card.js`
- Create: `src/assets/placeholder-product.svg`
- Create: `tests/theme.test.js`

**Interfaces:**
- Consumes: `createSafeStorage()`、`Product`
- Produces: `normalizeTheme(value)`、`applyTheme(theme, root)`、`renderShell(options)`、`renderProductCard(product)`

- [ ] **Step 1: 建立主題失敗測試**

```js
test('未知主題退回森林綠', () => {
  assert.equal(normalizeTheme('neon'), 'forest');
  assert.equal(normalizeTheme('wine'), 'wine');
});
```

- [ ] **Step 2: 執行並確認失敗**

Run: `node --test tests/theme.test.js`

Expected: FAIL，指出 `theme.js` 尚不存在。

- [ ] **Step 3: 建立主題與共用外框**

```js
const themes = new Set(['forest', 'wine', 'london', 'yellow']);
export const normalizeTheme = (value) => themes.has(value) ? value : 'forest';
export function applyTheme(value, root = document.documentElement) {
  const theme = normalizeTheme(value);
  root.dataset.theme = theme;
  return theme;
}
```

`shell.js` 產生跳至內容連結、公告列、桌機／手機導覽、主題選單、購物車數量、頁尾與手機購物車捷徑。`product-card.js` 依 `kind` 輸出「查看商品」或「查看案例」，圖片加入錯誤預留圖處理。

- [ ] **Step 4: 建立視覺 Token 與響應式元件**

```css
:root { --paper:#f4f0e6; --ink:#242722; --accent:#315847; --line:#c9c2b4; --focus:#d69f2e; }
[data-theme="wine"] { --accent:#762f3d; --focus:#a84b5c; }
[data-theme="london"] { --accent:#24506a; --focus:#397b9b; }
[data-theme="yellow"] { --accent:#8a6500; --focus:#d6a928; }
@media (min-width: 48rem) { .site-grid { grid-template-columns: repeat(12, 1fr); } }
@media (min-width: 75rem) { .page-shell { width:min(100% - 4rem, 1440px); } }
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior:auto!important; animation-duration:.01ms!important; } }
```

- [ ] **Step 5: 驗證**

Run: `npm test`

Expected: PASS，主題測試與既有核心測試全部通過。

- [ ] **Step 6: 提交**

```bash
git add src/css src/js/ui src/assets tests/theme.test.js
git commit -m "feat(ui): 建立日式主題與共用網站外框"
```

### Task 4: 首頁與商品列表

**Files:**
- Create: `index.html`
- Create: `products.html`
- Create: `src/js/pages/home.js`
- Create: `src/js/pages/products.js`

**Interfaces:**
- Consumes: `products`、`filterProducts()`、`sortProducts()`、`paginate()`、`renderShell()`、`renderProductCard()`
- Produces: 可操作首頁、搜尋／篩選／排序／分頁商品列表。

- [ ] **Step 1: 先建立瀏覽器驗收腳本清單**

在 `docs/TEST-PLAN.md` 的首頁與列表區先寫下：首頁四分類可達、搜尋「山」有結果、切換「喜帖」只顯示喜帖、最高價格排序正確、空結果可清除條件。

- [ ] **Step 2: 建立語意化頁面骨架**

```html
<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="src/css/tokens.css"><link rel="stylesheet" href="src/css/base.css">
<link rel="stylesheet" href="src/css/components.css"><link rel="stylesheet" href="src/css/pages.css">
<script type="module" src="src/js/pages/home.js"></script></head>
<body><header data-site-header></header><main id="main-content"></main><footer data-site-footer></footer></body></html>
```

`products.html` 使用相同資源，另提供具標籤的搜尋、分類、價格、排序與頁碼控制項；所有狀態同步至網址查詢參數。

- [ ] **Step 3: 實作首頁與列表渲染**

`home.js` 渲染主視覺、四分類、策展專題、精選商品與信任說明。`products.js` 從 `URLSearchParams` 建立篩選條件，依序呼叫 `filterProducts`、`sortProducts`、`paginate`，再渲染結果與 `aria-live` 數量訊息。

- [ ] **Step 4: 驗證自動化測試與瀏覽器**

Run: `npm test`

Run: `npm run serve`

Expected: 測試全部通過；在 375px、768px、1200px 實際完成驗收清單，瀏覽器主控台無錯誤。

- [ ] **Step 5: 提交**

```bash
git add index.html products.html src/js/pages docs/TEST-PLAN.md
git commit -m "feat(catalog): 建立首頁與商品列表"
```

### Task 5: 商品詳情、收藏與購物車頁面

**Files:**
- Create: `product.html`
- Create: `favorites.html`
- Create: `cart.html`
- Create: `src/js/core/shop-state.js`
- Create: `src/js/pages/product.js`
- Create: `src/js/pages/favorites.js`
- Create: `src/js/pages/cart.js`
- Create: `tests/shop-state.test.js`

**Interfaces:**
- Consumes: `products`、購物車核心、`createSafeStorage()`、共用 UI。
- Produces: `createShopState(storage)`，提供 `getCart`、`addToCart`、`updateQuantity`、`removeFromCart`、`toggleFavorite`、`addRecent`。

- [ ] **Step 1: 建立狀態失敗測試**

```js
test('加入同規格商品會合併且不超過庫存', () => {
  const state = createShopState(createSafeStorage(blockedStorage));
  state.addToCart({ id:'book-1', name:'山之書', price:600, stock:2 }, 1, '預設');
  state.addToCart({ id:'book-1', name:'山之書', price:600, stock:2 }, 2, '預設');
  assert.equal(state.getCart()[0].quantity, 2);
});
```

- [ ] **Step 2: 執行並確認失敗**

Run: `node --test tests/shop-state.test.js`

Expected: FAIL，指出 `shop-state.js` 尚不存在。

- [ ] **Step 3: 實作共用商店狀態**

```js
export function createShopState(storage) {
  const cartKey = 'kurashi.cart';
  return {
    getCart: () => storage.get(cartKey, []),
    addToCart(product, quantity, variant) {
      const next = addCartItem(storage.get(cartKey, []), product, quantity, variant);
      storage.set(cartKey, next); return next;
    }
  };
}
```

補齊更新、移除、收藏與最近瀏覽方法，所有方法回傳更新後陣列並發送 `kurashi:state-change` 自訂事件。

- [ ] **Step 4: 建立三個頁面**

商品詳情處理不存在識別碼、分類專屬欄位、圖片集、數量限制、收藏、SEO 與推薦商品；設計案例只顯示預約諮詢。收藏頁顯示收藏與最近瀏覽。購物車顯示空狀態、數量控制、移除、優惠碼、免運進度與結帳摘要。

- [ ] **Step 5: 驗證**

Run: `npm test`

Browser: 從商品詳情加入兩件商品、重新整理確認保留、修改數量、收藏、開啟錯誤識別碼、檢查設計案例無加入購物車按鈕。

Expected: 測試通過，流程無主控台錯誤，庫存與狀態符合規格。

- [ ] **Step 6: 提交**

```bash
git add product.html favorites.html cart.html src/js/core/shop-state.js src/js/pages tests/shop-state.test.js
git commit -m "feat(shop): 建立商品詳情收藏與購物車"
```

### Task 6: 結帳、付款模擬與本機訂單

**Files:**
- Create: `checkout.html`
- Create: `order-complete.html`
- Create: `account.html`
- Create: `src/js/pages/checkout.js`
- Create: `src/js/pages/order-complete.js`
- Create: `src/js/pages/account.js`
- Modify: `tests/checkout.test.js`

**Interfaces:**
- Consumes: `validateCheckout()`、`createTestPayment()`、`createShopState()`、`calculateCart()`。
- Produces: `createSimulationOrder(input, cart, totals)`，本機訂單資料不得包含完整卡號與安全碼。

- [ ] **Step 1: 建立資料安全失敗測試**

```js
test('模擬訂單不保存完整卡號或安全碼', () => {
  const order = createSimulationOrder({ name:'林森', paymentMethod:'card', cardNumber:'4242424242424242', cvv:'123' },
    [{ id:'book-1', price:600, quantity:1 }], { total:700 });
  assert.equal('cardNumber' in order.customer, false);
  assert.equal('cvv' in order.customer, false);
  assert.equal(order.payment.isSimulation, true);
});
```

- [ ] **Step 2: 執行並確認失敗**

Run: `node --test tests/checkout.test.js`

Expected: FAIL，指出 `createSimulationOrder` 尚未匯出。

- [ ] **Step 3: 實作安全訂單轉換**

```js
export function createSimulationOrder(input, cart, totals) {
  const { cardNumber, cvv, ...safeCustomer } = input;
  const id = `KM-${Date.now().toString(36).toUpperCase()}`;
  return { id, createdAt:new Date().toISOString(), customer:safeCustomer, items:cart, totals,
    payment:createTestPayment(input.paymentMethod, { id, total:totals.total }), status:'測試訂單' };
}
```

- [ ] **Step 4: 建立可存取的結帳流程**

結帳表單包含聯絡人、電子郵件、電話、地址、配送、發票與付款欄位。依付款方式顯示測試信用卡、ATM 或超商說明；錯誤摘要使用 `role="alert"` 並定位第一個錯誤欄位。送出期間停用按鈕，成功後儲存模擬訂單、清空購物車並導向完成頁。

- [ ] **Step 5: 建立完成與帳戶頁**

完成頁由網址訂單識別碼讀取本機訂單，顯示測試標記、付款參考碼與下一步。帳戶頁明確標示為本機示範資料，列出訂單與偏好設定。

- [ ] **Step 6: 驗證三種付款方式**

Run: `npm test`

Browser: 分別完成信用卡、ATM、超商代碼流程；檢查重複點擊、錯誤摘要、完成頁與本機訂單，並確認儲存資料無完整卡號或安全碼。

Expected: 所有測試通過，三種流程皆顯示「未產生真實交易」。

- [ ] **Step 7: 提交**

```bash
git add checkout.html order-complete.html account.html src/js/pages src/js/core/checkout.js tests/checkout.test.js
git commit -m "feat(checkout): 建立安全測試付款流程"
```

### Task 7: 資訊頁、SEO、文件與授權

**Files:**
- Create: `about.html`
- Create: `faq.html`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `README.md`
- Create: `docs/PLAN.md`
- Create: `docs/ART-DIRECTION.md`
- Modify: `docs/TEST-PLAN.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`

**Interfaces:**
- Consumes: 核准規格與已實作頁面。
- Produces: 可索引靜態網站與完整交付文件。

- [ ] **Step 1: 建立資訊頁與靜態 SEO 檔案**

`about.html` 說明選物原則，`faq.html` 說明四類商品與安全測試付款。所有頁面加入唯一標題、描述、canonical、Open Graph；`robots.txt` 允許索引並指向 `sitemap.xml`，網站地圖列出不含查詢參數的主要頁面。

- [ ] **Step 2: 完成交付文件**

README 包含網站介紹、特色、操作方式、安裝與執行、專案結構、測試、本機啟動方式、限制及授權。`docs/PLAN.md` 包含需求、範圍、里程碑、工作分解、風險與驗收條件。`docs/ART-DIRECTION.md` 包含四組色票、字體、元件、動畫與禁止事項。`docs/TEST-PLAN.md` 補齊功能、手動、行動裝置與無障礙核取清單。

- [ ] **Step 3: 建立貢獻與授權文件**

`CONTRIBUTING.md` 規定分支命名、繁體中文 Conventional Commit、測試、憑證安全與 PR 檢查。`LICENSE` 使用 MIT License，年份 2026，著作權人為專案維護者。

- [ ] **Step 4: 驗證連結與敏感資訊**

Run: `npm test`

Run: `git grep -nE "(sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY)"`

Expected: 測試全部通過；敏感樣式搜尋無結果；每個頁面的站內連結皆回傳 HTTP 200。

- [ ] **Step 5: 提交**

```bash
git add about.html faq.html robots.txt sitemap.xml README.md docs CONTRIBUTING.md LICENSE
git commit -m "docs: 完成網站文件與靜態搜尋最佳化"
```

### Task 8: 全面品質驗證、審查與交付

**Files:**
- Modify: 僅修改驗證或審查發現問題的檔案。

**Interfaces:**
- Consumes: 完整網站與全部文件。
- Produces: 經測試、瀏覽器驗證、審查與安全掃描的可推送 `main` 分支。

- [ ] **Step 1: 執行完整自動化測試**

Run: `npm test`

Expected: 全部測試通過，0 個失敗、0 個未處理錯誤。

- [ ] **Step 2: 執行實際瀏覽器驗證**

Run: `npm run serve`

在 375px、768px、1200px 逐頁檢查首頁、列表、詳情、收藏、購物車、結帳、完成、帳戶、品牌與 FAQ；走完三種付款方式；檢查鍵盤焦點、降低動態效果、圖片失敗、錯誤商品、空結果及重新整理狀態。

Expected: 主控台無錯誤、無水平溢位、主要流程可完成、所有付款頁明確標示測試模擬。

- [ ] **Step 3: 執行程式碼與規格審查**

依 `superpowers:requesting-code-review` 檢查工作差異、規格覆蓋、資料安全、無障礙、SEO 與測試品質。對每個可重現問題先建立失敗測試，再修正並重跑完整驗證。

- [ ] **Step 4: 驗證 Git 與敏感資訊狀態**

Run: `git diff --check && git status --short --branch`

Run: `git grep -nE "(sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY)"`

Expected: 無空白錯誤、無未提交變更、敏感樣式搜尋無結果。

- [ ] **Step 5: 顯示推送資訊並推送**

在任何 `git push` 前先向使用者顯示：

```text
Remote: origin https://github.com/andychung0214/kurashi-market.git
Branch: main
Commit: <經 git rev-parse --short HEAD 驗證的提交>
```

使用者已在原始需求授權直接推送；顯示資訊後執行 `git push -u origin main`。若驗證或認證失敗，回報實際錯誤且不得宣稱已推送。
