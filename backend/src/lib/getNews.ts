import type { Context } from 'hono';
import { XMLParser } from 'fast-xml-parser';
import { env } from '../config/env.js';

const printLine = (): void => {
  console.log('--------------------------------');
};

const getNews = async () => {
  try {
    const response = await fetch(`https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja`);

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
    const data = parser.parse(xmlText);

    console.log('===== RSS構造の確認 =====');
    console.log(JSON.stringify(data, null, 2));

    // RSS構造に基づいてニュース記事を取得
    const items = data.rss.channel.item;

    console.log('===== items =====');
    console.log(items);

    if (!items) {
      throw new Error('ニュースアイテムが見つかりません。');
    }

    // itemsが配列でない場合（取得したニュースが1つで単一オブジェクトになる場合）は配列に変換
    let newsItems;
    if (Array.isArray(items)) {
      newsItems = items;
    } else {
      newsItems = [items];
    }

    console.log(`===== 取得したアイテム数: ${newsItems.length} =====`);

    // タイトルとリンクが含まれているニュースを全て候補として収集
    const validNewsItems = [];
    for (let i = 0; i < newsItems.length; i++) {
      const newsTemp = newsItems[i];

      if (newsTemp.title && newsTemp.link) {
        validNewsItems.push(newsTemp);
        console.log(`===== 有効なニュースを発見: ${i} =====`);
      }
    }

    if (validNewsItems.length === 0) {
      throw new Error('表示できるニュースがありません。');
    }

    // 有効なニュース候補の中からランダムに1つを選択
    const randomIndex = Math.floor(Math.random() * validNewsItems.length);
    const news = validNewsItems[randomIndex];

    console.log(
      `===== 候補数: ${validNewsItems.length}, 選択されたインデックス: ${randomIndex} =====`
    );
    console.log('===== 最終的に選択されたニュース =====');
    console.log({
      title: news.title,
      description: news.description,
      url: news.link,
    });

    return {
      isSuccess: true,
      news: {
        title: news.title,
        description: '',
        url: news.link,
      },
    };
  } catch (error: any) {
    console.error(error);
    return {
      isSuccess: false,
      message: error.message,
    };
  }
};

export default getNews;
