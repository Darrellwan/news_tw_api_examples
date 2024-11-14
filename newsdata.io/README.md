# 台灣新聞自動抓取工具

這個 Google Apps Script 工具可以自動從 newsdata.io 抓取台灣新聞，並將結果存儲到 Google 試算表中。

## 使用前準備

1. 註冊 newsdata.io 帳號
   - 前往 [newsdata.io](https://newsdata.io/) 註冊帳號
   - 取得 API 金鑰（API Key）

2. 建立 Google 試算表
   - 開啟 Google 雲端硬碟
   - 建立新的試算表
   - 複製試算表的 ID（從網址中 /spreadsheets/d/ 後面的一串字符）

3. 設定 Google Apps Script
   - 在試算表中點選「擴充功能」>「Apps Script」
   - 建立新的檔案，命名為 news-newsdata_io.gs
   - 將程式碼複製貼上

## 基本設定

需要修改的常數：

    const API_KEY = 'YOUR_API_KEY';        // 替換成你的 newsdata.io API 金鑰
    const SPREADSHEET_ID = 'YOUR_SHEET_ID'; // 替換成你的試算表 ID

開發模式設定：

    const DEV_MODE = true;  // true: 只抓取 20 篇新聞, false: 抓取 100 篇

## 進階使用場景

以下是一些特殊使用場景的參數設定範例：

### 1. 新聞品質控制

    // 只取得優質新聞來源
    &prioritydomain=top

    // 排除特定新聞來源
    &excludedomain=example.com

### 2. 內容過濾

    // 只取得有圖片的新聞
    &image=1

    // 只取得有完整內容的新聞
    &full_content=1

### 3. 時間控制

    // 只取得最近 15 分鐘的新聞
    &timeframe=15m

    // 只取得最近 6 小時的新聞
    &timeframe=6

### 4. 分類過濾

    // 只取得特定分類的新聞
    &category=business,technology

    // 排除特定分類的新聞
    &excludecategory=entertainment

### 5. 關鍵字搜尋

    // 在標題中搜尋關鍵字
    &qInTitle=台積電

    // 在中繼資料中搜尋關鍵字
    &qInMeta=台積電

## 實用應用範例

### 1. 即時財經新聞監控
    
    apikey=YOUR_API_KEY&country=tw&language=zh&timeframe=15m&category=business&prioritydomain=top

### 2. 科技產業追蹤
    
    apikey=YOUR_API_KEY&country=tw&language=zh&qInTitle=(台積電 OR 聯電) AND (投資 OR 營收)&category=business

### 3. 圖片新聞整理
    
    apikey=YOUR_API_KEY&country=tw&language=zh&image=1&category=entertainment,lifestyle

### 4. 重要新聞即時追蹤
    
    apikey=YOUR_API_KEY&country=tw&language=zh&timeframe=15m&prioritydomain=top&full_content=1

## 使用注意事項

1. API 限制
   - 免費版每天最多 200 次請求
   - 每次請求最多回傳 10 篇新聞
   - 建議使用 DEV_MODE 進行測試

2. 效能考量
   - 使用 full_content=1 會增加回應時間
   - 使用 timeframe 可以減少重複新聞
   - 建議根據實際需求選擇合適的參數組合

3. 資料儲存
   - 新聞會依時間排序，最新的在最上方
   - 程式會自動過濾重複的新聞
   - 不會刪除舊的新聞資料

## 常見問題

Q: 執行時出現錯誤？
A: 檢查 API 金鑰和試算表 ID 是否正確設定

Q: 想要修改抓取的新聞數量？
A: 調整 TARGET_REQUESTS 的數值（DEV_MODE 為 false 時有效）

Q: 需要更頻繁地更新新聞？
A: 可以設定觸發器（Trigger）定時執行，但要注意 API 使用限制
