import { type IProfileRepository, type Profile } from './iProfileRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';

export class ProfileRepository implements IProfileRepository {
  /**
   * 投稿を1つだけ取得する
   * @param user_id - ユーザーID
   * @returns {Promise<Post>} プロフィール
   */
  async getProfile(user_id: string): Promise<Profile> {
    const sql = `
      SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.icon_url,
        u.created_at,
        -- ユーザーの全投稿に対する雅の総数をカウント
        (
          SELECT COUNT(*)
          FROM ${env.MIYABI_TABLE_NAME} m
          JOIN ${env.POSTS_TABLE_NAME} p ON m.post_id = p.id
          WHERE p.user_id = u.id
        ) AS total_miyabi,
        -- 削除されていない投稿の総数をカウント
        (
          SELECT COUNT(*)
          FROM ${env.POSTS_TABLE_NAME} p
          WHERE p.user_id = u.id AND p.is_deleted = FALSE
        ) AS total_post,
        -- ユーザーがフォローしている人数をカウント
        (
          SELECT COUNT(*)
          FROM ${env.FOLLOWS_TABLE_NAME} f
          WHERE f.follower_id = u.id
        ) AS following_count,
        -- ユーザーをフォローしている人数（フォロワー）をカウント
        (
          SELECT COUNT(*)
          FROM ${env.FOLLOWS_TABLE_NAME} f
          WHERE f.followee_id = u.id
        ) AS follower_count
      FROM
        ${env.USERS_TABLE_NAME} u
      WHERE
        u.id = :user_id
    `;

    try {
      const results = await db.query(sql, { user_id });

      const row = results[0];

      const profile: Profile = {
        user_id: row.user_id,
        user_name: row.user_name,
        icon_url: row.icon_url,
        created_at: row.created_at,
        total_miyabi: Number(row.total_miyabi),
        total_post: Number(row.total_post),
        following_count: Number(row.following_count),
        follower_count: Number(row.follower_count),
      };

      return profile;
    } catch (error) {
      console.error(`[ProfileRepository#getProfile] プロフィールの取得に失敗しました．`, error);
      throw new Error('データベースからのプロフィール取得処理に失敗しました．');
    }
  }
}
