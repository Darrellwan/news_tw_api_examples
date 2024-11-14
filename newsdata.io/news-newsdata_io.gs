const API_KEY = 'YOUR_API_KEY';
const BASE_API_URL = 'https://newsdata.io/api/1/news';
const SPREADSHEET_ID = '1qeHLgof44CADejL0GmLYt5WXMlpJgW4l7NukXBjYTyc';
const NEWS_SHEET_NAME = 'Taiwan News';
const ERROR_SHEET_NAME = 'Error Log';
const NEWS_LOG_SHEET_NAME = 'News Raw Data';
const NEWS_PER_REQUEST = 10;
const DEV_MODE = true;
const TARGET_REQUESTS = DEV_MODE ? 2 : 10;
const DELAY_BETWEEN_REQUESTS = 1200;

function convertToTaipeiTime(utcDateString) {
  const date = new Date(utcDateString);
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function fetchTaiwanNews() {
  try {
    const newsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(NEWS_SHEET_NAME) || 
                      SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(NEWS_SHEET_NAME);
    
    const logSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(NEWS_LOG_SHEET_NAME) || 
                    SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(NEWS_LOG_SHEET_NAME);
    
    if (newsSheet.getLastRow() === 0) {
      const headers = ['Article ID', 'Title', 'Description', 'Source', 'Published Date (TPE)', 'Link'];
      newsSheet.appendRow(headers);
    }
    
    const lastRow = newsSheet.getLastRow();
    const existingArticleIds = lastRow > 1 
      ? new Set(newsSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat())
      : new Set();

    logSheet.clear();
    logSheet.appendRow(['Timestamp', 'Request Count', 'Raw JSON Data']);

    let allNews = [];
    let nextPage = null;
    let requestCount = 0;

    while (requestCount < TARGET_REQUESTS) {
      const apiUrl = `${BASE_API_URL}?apikey=${API_KEY}&country=tw&language=zh&size=${NEWS_PER_REQUEST}${nextPage ? `&page=${nextPage}` : ''}`;
      const response = UrlFetchApp.fetch(apiUrl);
      const newsData = JSON.parse(response.getContentText());

      if (newsData.status !== 'success') {
        throw new Error('Failed to fetch news data');
      }

      logSheet.appendRow([
        new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'}),
        requestCount + 1,
        JSON.stringify(newsData)
      ]);

      const newArticles = newsData.results.filter(news => !existingArticleIds.has(news.article_id));
      allNews = allNews.concat(newArticles);
      
      requestCount++;

      Logger.log(`Completed request ${requestCount} of ${TARGET_REQUESTS}, got ${newArticles.length} new articles`);

      if (!newsData.nextPage) {
        Logger.log('No more news available');
        break;
      }

      nextPage = newsData.nextPage;

      if (requestCount < TARGET_REQUESTS) {
        Utilities.sleep(DELAY_BETWEEN_REQUESTS);
      }
    }

    allNews.reverse().forEach(news => {
      const row = [
        news.article_id,
        news.title,
        news.description,
        news.source_id,
        convertToTaipeiTime(news.pubDate),
        news.link
      ];
      newsSheet.insertRowAfter(1).getRange(2, 1, 1, row.length).setValues([row]);
    });

    Logger.log(`Successfully fetched and inserted ${allNews.length} new Taiwan news articles in ${requestCount} requests`);

  } catch (error) {
    const errorMessage = `Error fetching Taiwan news data: ${error.message}`;
    Logger.log(errorMessage);

    const errorSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ERROR_SHEET_NAME) || 
                      SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(ERROR_SHEET_NAME);
    errorSheet.appendRow([new Date(), 'fetchTaiwanNews', errorMessage]);
  }
}

