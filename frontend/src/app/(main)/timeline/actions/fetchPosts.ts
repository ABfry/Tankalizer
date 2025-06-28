// サーバアクション
'use server';

import { PostTypes } from '@/types/postTypes';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

// response の型定義
interface PostResponse {
  id: string;
  original: string;
  tanka: [];
  image_path: string;
  created_at: string;
  user_name: string;
  user_icon: string;
  user_id: string;
  miyabi_count: number;
  is_miyabi: boolean;
  rank?: number;
}

/**
 * 投稿データを取得する非同期関数
 * @async
 * @function fetchPosts
 * @param {Object} params - 投稿データ取得のためのパラメータオブジェクト
 * @param {number} params.limit - 取得する投稿の最大件数
 * @param {string} params.cursor - 取得を開始する投稿のID（オフセット）
 * @param {string} params.filterByUserId - 取得する対象のユーザID
 * @param {string} params.userId - 閲覧ユーザのID
 * @returns {Promise<PostTypes[]>} 投稿データの配列を返すPromise．投稿が存在しない場合は空配列を返す．
 */
export const fetchPosts = async ({
  limit,
  cursor,
  filterByUserId,
  userId,
}: {
  limit: number;
  cursor?: string;
  filterByUserId?: string;
  userId?: string;
}): Promise<PostTypes[] | []> => {
  try {
    const res = await fetch(`${backendUrl}/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: limit,
        cursor: cursor,
        filterByUserId: filterByUserId,
        viewerId: userId,
      }),
    });

    // エラーがある場合は空の配列を返す
    if (!res.ok) {
      console.log(res.statusText);
      return [];
    }

    const json = await res.json();
    return json.posts.map((post: PostResponse) => ({
      id: post.id,
      tanka: post.tanka,
      original: post.original,
      imageUrl: post.image_path ?? '',
      date: new Date(post.created_at),
      user: {
        name: post.user_name,
        iconUrl: post.user_icon,
        userId: post.user_id,
      },
      miyabiCount: post.miyabi_count,
      miyabiIsClicked: post.is_miyabi,
      rank: post.rank,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * 雅ランキングを取得する非同期関数
 * @async
 * @function fetchRanking
 * @param {Object} params - ランキング取得のためのパラメータオブジェクト
 * @param {number} params.limit - 取得する投稿の最大件数
 * @param {string} params.iconUrl - ユーザのアイコン画像URL
 * @returns {Promise<PostTypes[]>} 投稿データの配列を返すPromise．投稿が存在しない場合は空配列を返す．
 */
export const fetchRanking = async ({
  limit,
  iconUrl,
}: {
  limit: number;
  iconUrl?: string;
}): Promise<PostTypes[] | []> => {
  try {
    const res = await fetch(`${backendUrl}/miyabiranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: limit,
        my_icon: iconUrl,
      }),
    });

    // エラーがある場合は空の配列を返す
    if (!res.ok) {
      console.log(res.statusText);
      return [];
    }

    const json = await res.json();
    return json.posts.map((post: PostResponse) => ({
      id: post.id,
      tanka: post.tanka,
      original: post.original,
      imageUrl: post.image_path ?? '',
      date: new Date(post.created_at),
      user: {
        name: post.user_name,
        iconUrl: post.user_icon,
        userId: post.user_id,
      },
      miyabiCount: post.miyabi_count,
      miyabiIsClicked: post.is_miyabi,
      rank: post.rank,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
