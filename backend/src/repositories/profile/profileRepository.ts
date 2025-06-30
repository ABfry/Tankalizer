import { type IProfileRepository, type Profile } from './iProfileRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';

export class ProfileRepository implements IProfileRepository {
  /**
   * プロフィールを1つだけ取得する
   * @param user_id - ユーザーID
   * @param viewer_id - 閲覧者のユーザーID
   * @returns {Promise<Profile>} プロフィール
   */
  async getProfile(user_id: string, viewer_id?: string): Promise<Profile> {
    const params: { [key: string]: string | undefined } = { user_id, viewer_id };

    // viewer_id が指定されている場合, フォロー状態を確認するSELECT句を追加
    const followCheckClause = viewer_id
      ? `(EXISTS (SELECT 1 FROM ${env.FOLLOWS_TABLE_NAME} WHERE follower_id = :viewer_id AND followee_id = u.id)) AS is_following`
      : 'FALSE AS is_following';

    const sql = `
      SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.profile_text AS profile_text,
        u.icon_url,
        u.created_at,
        ${followCheckClause}, -- フォロー状態を確認する句
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
      // viewer_id が undefined の場合は params から削除
      if (!viewer_id) {
        delete params.viewer_id;
      }
      const results = await db.query(sql, params);

      const row = results[0];

      const profile: Profile = {
        user_id: row.user_id,
        user_name: row.user_name,
        profile_text: row.profile_text,
        icon_url: row.icon_url,
        created_at: row.created_at,
        is_following: Boolean(row.is_following),
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
