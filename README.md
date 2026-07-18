# KURASHI MARKET｜暮集選物所

暮集選物所是一個日式生活策展型靜態電商網站，集合二手書、客製喜帖、室內設計案例與百貨雜物。專案以 HTML、CSS 與 Vanilla JavaScript 建立，不需要編譯或後端服務即可展示完整的本機購物流程。

> 這是電商網站而非遊戲；原始需求中的「遊戲程式碼」在本專案對應為可互動的電商網站程式碼。

## 特色

- 侘寂編輯風與都會百貨網格，提供森林綠、酒紅色、倫敦藍、聰穎黃四組主題。
- 16 筆跨四類的擬真商品與案例資料，使用不含 API 金鑰的 Unsplash CDN 圖片。
- 商品搜尋、分類、價格篩選、排序與分頁。
- 商品狀態篩選與手機可收合篩選器。
- 商品詳情、分類專屬欄位、收藏、最近瀏覽與庫存限制。
- 購物車、優惠碼 `KURASHI100`、免運門檻與費用摘要。
- 信用卡、ATM、超商代碼三種安全付款模擬，全程標示不產生真實交易。
- 本機測試訂單、動態 Product 結構化資料、Open Graph、Sitemap 與 robots.txt。
- `localStorage` 無法使用時退回記憶體內狀態。

## 操作方式

1. 從首頁四個分類或「所有選物」開始瀏覽。
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
│     ├─ data/             商品資料
│     ├─ pages/            各頁面控制
│     └─ ui/               共用外框、主題與商品卡片
├─ tests/                  Node.js 內建測試
└─ docs/                   計畫、視覺與測試文件
```

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
- 所有購物資料只保存在目前瀏覽器，清除網站資料後即消失。
- Unsplash 圖片需要網路；失敗時顯示本機預留圖。
- 付款功能是模擬器，不會連接綠界或產生真實交易。
- 正式綠界整合必須由受控的 .NET API 保存 MerchantID、HashKey、HashIV，產生 CheckMacValue 並驗證回呼。任何金鑰都不得放入前端程式碼或版本控制。

## 授權

程式碼與專案原創文字採 MIT License，詳見 `LICENSE`。Unsplash 圖片由其原作者提供，使用受 [Unsplash License](https://unsplash.com/license) 約束，不包含在本專案 MIT 授權範圍內。商品名稱與內容為示範資料。
