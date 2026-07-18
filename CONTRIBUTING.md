# 貢獻指南

## 開發流程

1. 從最新的 `main` 建立 `feature/xxx`、`fix/xxx` 或 `chore/xxx` 分支。
2. 新增或修正行為時先建立失敗測試，再撰寫最小實作。
3. 執行 `npm test`，並使用本機靜態伺服器檢查受影響頁面。
4. 提交前執行 `git diff --check`，確認沒有憑證、token、`.env` 或私人金鑰。

## 程式碼規範

- 使用語意化英文命名；中文 UI、註解與文件使用繁體中文。
- JavaScript 使用原生 ES Modules，不加入大型框架或不必要相依套件。
- CSS 優先重用現有 Token 與元件類別，保持可見焦點與 44px 觸控區域。
- 業務計算維持純函式，DOM 操作留在 `src/js/pages` 或 `src/js/ui`。
- 商品分類先加入 `src/js/data/products.js`，再由 `src/js/data/storefront.js` 控制啟用與順序；不得在 HTML 寫死分類選項。

## Commit 訊息

遵守 Conventional Commits，描述必須使用 zh-TW：

```text
feat(cart): 建立免運門檻提示
fix(checkout): 避免重複建立測試訂單
docs: 更新本機執行說明
```

## 金流安全

正式金流整合不得在前端保存 MerchantID、HashKey、HashIV 或其他金鑰。CheckMacValue、回呼驗證與冪等處理必須由安全後端執行。任何涉及金流的變更都要在 PR 說明風險與測試環境證據。
