# AMUHARU｜安暮恆生活

安暮恆生活是一個日式生活提案型靜態電商網站，從日常需要出發，整理值得長久相伴的商品與服務。`AMUHARU` 取自 Andy 的 `A`、Mumu 的 `MU` 與 Harvey 的 `HAR`；中文「安、暮、恆」傳達安穩日常與長久陪伴。專案以 HTML、CSS 與 Vanilla JavaScript 建立，不需要編譯或後端服務即可展示完整的本機購物流程。

> 這是電商網站而非遊戲；原始需求中的「遊戲程式碼」在本專案對應為可互動的電商網站程式碼。

## 特色

- 侘寂編輯風與都會百貨網格，提供森林綠、酒紅色、倫敦藍、聰穎黃四組主題。
- 目前提供 16 筆、四個分類的擬真商品與案例資料；分類數量由前端設定控制，不是網站架構限制。
- 首頁分類、商品篩選、可見商品與分類說明共用同一組啟用設定。
- 使用不含 API 金鑰的 Unsplash CDN 圖片，失敗時顯示本機預留圖。
- 商品搜尋、分類、價格篩選、排序與分頁。
- 商品狀態篩選與手機可收合篩選器。
- 商品詳情、分類專屬欄位、收藏、最近瀏覽與庫存限制。
- 購物車、優惠碼 `AMUHARU100`、免運門檻與費用摘要。
- 信用卡、ATM、超商代碼三種安全付款模擬，全程標示不產生真實交易。
- 本機測試訂單、動態 Product 結構化資料、Open Graph、Sitemap 與 robots.txt。
- `localStorage` 無法使用時退回記憶體內狀態。

## 操作方式

1. 從首頁目前啟用的分類或「所有選物」開始瀏覽。
2. 使用關鍵字、分類、價格與排序縮小結果。
3. 在商品詳情選擇數量並加入購物車；室內設計案例改為預約初談。
4. 在購物車修改數量、輸入測試優惠碼並前往結帳。
5. 填寫測試資料，選擇信用卡、ATM 或超商代碼並建立本機測試訂單。

## 安裝與執行

不需安裝相依套件。建議使用本機靜態伺服器，避免瀏覽器限制 ES Modules：

```powershell
cd F:\Codex\Projects\kurashi-market
python -m http.server 4173
```

開啟 `http://127.0.0.1:4173/`。也可執行：

```powershell
npm run serve
```

不建議直接雙擊 HTML，因部分瀏覽器會阻擋 `file://` 頁面的 ES Modules。

## 專案結構

```text
kurashi-market/
├─ index.html / products.html / product.html
├─ products/                16 個可索引的靜態商品頁
├─ cart.html / checkout.html / order-complete.html
├─ favorites.html / account.html / about.html / faq.html
├─ src/
│  ├─ assets/              本機預留圖
│  ├─ css/                 Token、基礎、元件與頁面樣式
│  └─ js/
│     ├─ core/             純函式與狀態邏輯
│     ├─ data/             商品資料與暫時商店設定
│     ├─ pages/            各頁面控制
│     └─ ui/               共用外框、主題與商品卡片
├─ tests/                  Node.js 內建測試
└─ docs/                   計畫、視覺與測試文件
```

## 暫時分類設定

後台尚未建立前，編輯 `src/js/data/storefront.js` 的 `enabledCategoryIds` 即可決定前台分類與順序。例如只顯示二手書與百貨雜物：

```js
enabledCategoryIds: Object.freeze(['books', 'goods'])
```

移除識別碼會停用分類；設定空陣列會顯示「目前尚無分類」狀態。若要加入新的分類，先在 `src/js/data/products.js` 的 `categories` 與商品資料加入相同識別碼，再將它放進 `enabledCategoryIds`。解析函式沒有分類數量上限，測試已涵蓋兩個、四個、八個與零分類情境。

未來後台上線後，應以 API 回傳資料取代 `src/js/data/storefront.js`，並維持相同的分類資料形狀；屆時即可移除這個暫時設定入口，而不用重寫頁面。

## 測試方式

需要 Node.js 20 或更新版本：

```powershell
npm test
```

商品資料更新後，重新產生靜態商品頁與 Sitemap：

```powershell
npm run generate:products
```

測試涵蓋安全儲存、購物車、商品查詢、結帳驗證、付款模擬、狀態保存、主題與共用 UI 輸出。完整人工測試清單請見 `docs/TEST-PLAN.md`。

## 靜態部署

將儲存庫內容原樣複製到 Synology NAS Web Station 的網站根目錄即可。伺服器需以 UTF-8 提供 HTML，並正確提供 `.js`、`.css`、`.svg`、`.xml` MIME 類型。

## 已知限制與金流風險

- 沒有真實會員驗證、資料庫、伺服器庫存、物流、郵件或訂單同步。
- 分類目前由前端設定檔管理，尚無後台權限、驗證與即時同步。
- 所有購物資料只保存在目前瀏覽器，清除網站資料後即消失。
- Unsplash 圖片需要網路；失敗時顯示本機預留圖。
- 付款功能是模擬器，不會連接綠界或產生真實交易。
- 正式綠界整合必須由受控的 .NET API 保存 MerchantID、HashKey、HashIV，產生 CheckMacValue 並驗證回呼。任何金鑰都不得放入前端程式碼或版本控制。

## 授權

程式碼與專案原創文字採 MIT License，詳見 `LICENSE`。Unsplash 圖片由其原作者提供，使用受 [Unsplash License](https://unsplash.com/license) 約束，不包含在本專案 MIT 授權範圍內。商品名稱與內容為示範資料。
