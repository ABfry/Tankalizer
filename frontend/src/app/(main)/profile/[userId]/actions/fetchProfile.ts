// サーバアクション
'use server';

import { ProfileTypes } from '@/types/profileTypes';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * プロフィールを取得する非同期関数
 * @async
 * @function fetchProfile
 * @param {Object} params - 投稿データ取得のためのパラメータオブジェクト
 * @param {string} params.targetUserId - ターゲットユーザのID（プロフィールを取得するユーザのID）
 * @param {string} params.userId - ユーザのID
 * @returns {Promise<ProfileTypes>} プロフィールデータを返すPromise．プロフィールが存在しない場合はnullを返す．
 */
const fetchProfile = async ({
  targetUserId,
  userId,
}: {
  targetUserId: string;
  userId: string;
}): Promise<ProfileTypes | null> => {
  try {
    const res = await fetch(`${backendUrl}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: targetUserId,
        viewer_id: userId,
      }),
    });

    // エラーがある場合はnullを返す
    if (!res.ok) {
      console.log(res.statusText);
      return null;
    }

    const json = await res.json();
    const profile: ProfileTypes = {
      userId: json.profile.user_id,
      name: json.profile.user_name,
      iconUrl: json.profile.icon_url,
      bio: json.profile.profile_text,
      isFollowing: json.profile.is_following,
      totalMiyabi: json.profile.total_miyabi,
      totalPost: json.profile.total_post,
      followingCount: json.profile.following_count,
      followerCount: json.profile.follower_count,
    };
    return profile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default fetchProfile;
