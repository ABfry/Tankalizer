// サーバアクション
'use server';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * 雅を増やす非同期関数
 * @async
 * @function addMiyabi
 * @param {Object} params - 雅追加のためのパラメータオブジェクト
 * @param {string} params.userId - ユーザのID
 * @param {string} params.postId - 雅する投稿のID
 */
export const addMiyabi = async ({ userId, postId }: { userId: string; postId: string }) => {
  try {
    const res = await fetch(`${backendUrl}/miyabi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        post_id: postId,
      }),
    });

    // エラーがある場合はログを出力
    if (!res.ok) {
      console.log(res.statusText);
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * 雅を減らす非同期関数
 * @async
 * @function removeMiyabi
 * @param {Object} params - 雅追加のためのパラメータオブジェクト
 * @param {string} params.userId - ユーザのID
 * @param {string} params.postId - 雅する投稿のID
 */
export const removeMiyabi = async ({ userId, postId }: { userId: string; postId: string }) => {
  try {
    const res = await fetch(`${backendUrl}/miyabi`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
        user_id: userId,
      }),
    });

    // エラーがある場合はログを出力
    if (!res.ok) {
      console.log(res.statusText);
    }
  } catch (error) {
    console.error(error);
  }
};
