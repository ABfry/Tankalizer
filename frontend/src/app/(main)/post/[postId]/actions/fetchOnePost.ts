// サーバアクション
'use server';

import { PostTypes } from '@/types/postTypes';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * 単体の投稿データを取得する非同期関数
 * @async
 * @function fetchOnePost
 * @param {Object} params - 投稿データ取得のためのパラメータオブジェクト
 * @param {string} params.userId - ユーザのID
 * @param {string} params.postId - 取得する投稿のID（オフセット）
 * @returns {Promise<PostTypes[]>} 投稿データを返すPromise．投稿が存在しない場合はnullを返す．
 */
export const fetchOnePost = async ({
  userId,
  postId,
}: {
  userId?: string;
  postId?: string;
}): Promise<PostTypes | null> => {
  try {
    const res = await fetch(`${backendUrl}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: postId,
        viewerId: userId,
      }),
    });

    // エラーがある場合はnullを返す
    if (!res.ok) {
      console.log(res.statusText);
      return null;
    }

    const json = await res.json();
    const post: PostTypes = {
      id: json.post.id,
      tanka: json.post.tanka,
      original: json.post.original,
      imageUrl: json.post.image_path ?? '',
      date: new Date(json.post.created_at),
      user: {
        name: json.post.user_name,
        iconUrl: json.post.user_icon,
        userId: json.post.user_id,
      },
      miyabiCount: json.post.miyabi_count,
      miyabiIsClicked: json.post.is_miyabi,
      rank: json.post.rank,
      isDeveloper: json.post.is_developer ?? false,
    };
    return post;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default fetchOnePost;
