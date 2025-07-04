import { XMLParser } from 'fast-xml-parser';
import { debugLog } from './debugLog.js';

// RSSの型定義
interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  guid?: string | { '#text': string; '@_isPermaLink': string };
  source?: string;
}

interface RSSFormat {
  rss: {
    '@_version': string;
    channel: {
      item: RSSItem | RSSItem[];
    };
  };
}

interface NewsSuccess {
  isSuccess: true;
  news: {
    title: string;
    description: string;
    url: string;
  };
}

interface NewsError {
  isSuccess: false;
  message: string;
}

type NewsResponse = NewsSuccess | NewsError;

// ニュース取得先のURL
const RSS_FEED_URL = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';

const getNews = async (): Promise<NewsResponse> => {
  try {
    const response = await fetch(RSS_FEED_URL);

    // HTTPエラーが発生した場合
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    // XMLテキストを取得
    const xmlText: string = await response.text();

    // XMLパーサーを初期化
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    // XMLをオブジェクトに変換
    const data: RSSFormat = parser.parse(xmlText);

    debugLog('===== RSS構造の確認 =====');
    debugLog(JSON.stringify(data, null, 2));

    // RSS構造に基づいてニュース記事を取得
    const items = data.rss.channel.item;

    debugLog('===== items =====');
    debugLog(items);

    if (!items) {
      throw new Error('ニュースアイテムが見つかりません。');
    }

    // itemsが配列でない場合（取得したニュースが1つで単一オブジェクトになる場合）は配列に変換
    let newsItems: RSSItem[];
    if (Array.isArray(items)) {
      newsItems = items;
    } else {
      newsItems = [items];
    }

    debugLog(`===== 取得したアイテム数: ${newsItems.length} =====`);

    // タイトルとリンクが含まれているニュースを全て候補として収集
    const validNewsItems: RSSItem[] = [];
    for (let i = 0; i < newsItems.length; i++) {
      const newsTemp = newsItems[i];

      if (newsTemp.title && newsTemp.link) {
        validNewsItems.push(newsTemp);
        debugLog(`===== 有効なニュースを発見: ${i} =====`);
      }
    }

    if (validNewsItems.length === 0) {
      throw new Error('表示できるニュースがありません。');
    }

    // 有効なニュース候補の中からランダムに1つを選択
    const randomIndex = Math.floor(Math.random() * validNewsItems.length);
    const news = validNewsItems[randomIndex];

    debugLog(
      `===== 候補数: ${validNewsItems.length}, 選択されたインデックス: ${randomIndex} =====`
    );

    const result: NewsSuccess = {
      isSuccess: true,
      news: {
        title: news.title,
        description: '',
        url: news.link,
      },
    };

    debugLog('===== 最終的に選択されたニュース =====');
    debugLog(result);
    return result;
  } catch (error: any) {
    console.error(error);
    const result: NewsError = {
      isSuccess: false,
      message: error.message,
    };
    return result;
  }
};

export default getNews;
