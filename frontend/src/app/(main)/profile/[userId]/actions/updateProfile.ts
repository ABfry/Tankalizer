'use server';

import { ProfileTypes } from '@/types/profileTypes';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

/**
 * プロフィールを更新する非同期関数
 * @async
 * @function updateProfile
 * @param {Object} params - 更新用パラメータ
 * @param {string} params.userId - ユーザのID
 * @param {string} params.name - ユーザ名
 * @param {string} params.bio - 自己紹介
 * @param {File | null} params.imageData - プロフィール画像のデータ
 * @returns {Promise<ProfileTypes | null>} 更新後のプロフィールデータ、失敗時はnullを返す
 */
const updateProfile = async ({
  userId,
  name,
  bio,
  imageData,
}: {
  userId: string;
  name: string;
  bio: string;
  imageData: File | null;
}): Promise<ProfileTypes | null> => {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('user_name', name);
    formData.append('profile_text', bio);
    if (imageData) {
      formData.append('icon_image', imageData);
    }

    const res = await fetch(`${backendUrl}/profile`, {
      method: 'PUT',
      body: formData,
    });

    // エラーがある場合はnullを返す
    if (!res.ok) {
      console.log(res.statusText);
      return null;
    }

    const json = await res.json();
    const updatedProfile: ProfileTypes = {
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
    return updatedProfile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default updateProfile;
