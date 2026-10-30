# 🩵🩷 Baby Gender Guessing Game

一個免費、手機友善的寶寶性別投票網站。親友選男生或女生，投票後立即看到**所有訪客共用的即時票數與比例**。

## 技術組成

- **Cloudflare Pages**：免費方案可部署網站與 `/functions` API。
- **Cloudflare D1**：儲存投票資料（一般家庭活動通常足以使用免費額度，請以 Cloudflare 最新額度為準）。
- 原生 HTML / CSS / JavaScript，不需要 Node、前端編譯或第三方 UI 套件。

## 上線教學：Cloudflare Dashboard + GitHub（建議）

1. 把這個資料夾的內容放到 GitHub repository 的根目錄，確保根目錄有 `public/`、`functions/`、`migrations/`。
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)，前往 **Workers & Pages → D1**（UI 分類可能調整），建立名為 `baby-guess-db` 的 D1 資料庫。
3. 進入該 D1 資料庫的 **Console**，複製 `migrations/0001_create_votes.sql` 的全部內容並執行，建立 `votes` 資料表。
4. 在 **Workers & Pages → Create → Pages → Connect to Git** 連結 GitHub repository，設定：
   - **Framework preset**：None
   - **Build command**：留空（若 UI 強制輸入，可用 `exit 0`）
   - **Build output directory**：`public`
   - **Root directory**：repository 根目錄
5. 部署之後，開啟這個 Pages 專案的 **Settings → Bindings → Add binding → D1 database**。
   - **Variable name**：`DB`（**必須大寫，完全一致**）
   - **D1 database**：選 `baby-guess-db`
   - 如果有 **Production / Preview** 的環境切換，確保 Production 綁定好。
6. **重新部署** Pages（Deployments → Retry deployment，或推送一次 Git commit）讓 binding 生效。
7. 開啟自動產生的 `https://<your-project>.pages.dev` 網址，在不同瀏覽器測試投票。新的瀏覽器可以各投一票；同瀏覽器重新整理會顯示原本的票。

> 重要：只把 `public/` 上傳到普通靜態 hosting，投票 API **不會運作**。必須使用支援 Pages Functions 的 Git 部署（或透過相容的 Wrangler 工具部署），並完成 D1 binding。

## 本機預覽

**只看畫面**：在 `public` 下執行 `python3 -m http.server 8080` 並開啟 `http://localhost:8080`，但投票會因沒有 API 無法送出。

**完整本機測試**（需要 Node.js 與 npm）：

```bash
npm install
npx wrangler pages dev public --d1 DB=baby-guess-db --local
```

首次本機測試前可用以下指令建立本機 D1 schema（執行過一次即可）：

```bash
npx wrangler d1 execute baby-guess-db --local --file=./migrations/0001_create_votes.sql
```

Wrangler 版本會影響本機 D1 配置方式；上線最穩健的是使用上面 Dashboard 的 SQL Console + binding 步驟。

## 投票規則與注意事項

- 同一個瀏覽器使用 `localStorage` UUID 辨識投票者；D1 的 `voter_id` 唯一索引阻止同識別碼重複投票或改票。
- 這是**輕量防重複**，不是帳號驗證：清除瀏覽器資料、使用無痕模式或換裝置，仍可能重複投票。適合親友趣味活動，不適合正式選舉或有獎競賽。
- 網站沒有收集姓名或 email；只存匿名識別碼、選項、建立時間。投票資料留存在你的 Cloudflare D1 中。
- 統計 API 是公開資料；網站在投票後才顯示結果，但懂技術的人仍可直接呼叫 API 查詢比例。
- 網站顯示的是「大家的猜測」，不是醫學性別預測或正式揭曉結果。

## 修改內容

- 標題、活動文字、按鈕：`public/index.html`
- 顏色、字型、排版：`public/style.css`
- 前端互動與分享：`public/app.js`
- 後端投票與統計：`functions/api/votes.js`

## 清空票數（活動重置）

在 Cloudflare D1 Console 執行：

```sql
DELETE FROM votes;
```

如要讓已投過的人可以重新投票，**也必須更改** `public/app.js` 中的 `voterStorageKey` 字串（例如從 `v1` 改成 `v2`），再重新部署。否則舊瀏覽器可能以舊 UUID 再投，但 D1 中該 UUID 已被清除，也仍可新投；更換 key 則更明確。

## 費用

在 Cloudflare Pages 與 D1 的免費額度內可為 $0。若超出免費額度，則取決於 Cloudflare 的方案與計費政策；自訂網域如需購買則另計。你不需要買網域，直接分享 `pages.dev` 連結即可。
