import {
  type IProfileRepository,
  type Profile,
  type UpdateProfileRepoDTO,
  type GetFollowingUserRepoDto,
} from './iProfileRepository.js';
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
        (EXISTS (SELECT 1 FROM ${env.DEVELOPERS_TABLE_NAME} WHERE user_id = u.id)) AS is_developer,
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
        is_developer: Boolean(row.is_developer),
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

  /**
   * プロフィールを更新する
   * @param updateProfileRepoDTO - 更新するプロフィールのデータ
   * @returns {Promise<void>}
   */
  async updateProfile(updateProfileRepoDto: UpdateProfileRepoDTO): Promise<void> {
    const { user_id, user_name, profile_text, image_path } = updateProfileRepoDto;

    const sql = `
      UPDATE ${env.USERS_TABLE_NAME}
      SET
        name = :user_name,
        profile_text = :profile_text,
        icon_url = :image_path
      WHERE
        id = :user_id
    `;

    try {
      const result = await db.query(sql, {
        user_id,
        user_name,
        profile_text,
        image_path,
      });
    } catch (error) {
      console.error(`[ProfileRepository#updateProfile] プロフィールの更新に失敗しました．`, error);
      throw new Error('データベースのプロフィール更新処理に失敗しました．');
    }
  }

  /**
   * フォローしているユーザーを取得する
   * @param getFollowingUserRepoDto - フォローしているユーザーを取得するためのDTO
   * @returns {Promise<Profile[]>} フォローしているユーザーのプロフィールの配列
   */
  async getFollowingUser(getFollowingUserRepoDto: GetFollowingUserRepoDto): Promise<Profile[]> {
    const { user_id, viewer_id, limit, cursor } = getFollowingUserRepoDto;
    const params: { [key: string]: string | number | undefined } = { user_id, viewer_id, limit };

    let cursorClause = '';
    if (cursor) {
      cursorClause =
        'AND f.followed_at < (SELECT followed_at FROM follows WHERE follower_id = :user_id AND followee_id = :cursor)';
      params.cursor = cursor;
    }

    const followCheckClause = viewer_id
      ? `(EXISTS (SELECT 1 FROM ${env.FOLLOWS_TABLE_NAME} WHERE follower_id = :viewer_id AND followee_id = u.id)) AS is_following`
      : 'FALSE AS is_following';

    const sql = `
      SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.profile_text,
        u.icon_url,
        u.created_at,
        ${followCheckClause},
        (EXISTS (SELECT 1 FROM ${env.DEVELOPERS_TABLE_NAME} WHERE user_id = u.id)) AS is_developer,
        (
          SELECT COUNT(*)
          FROM ${env.MIYABI_TABLE_NAME} m
          JOIN ${env.POSTS_TABLE_NAME} p ON m.post_id = p.id
          WHERE p.user_id = u.id
        ) AS total_miyabi,
        (
          SELECT COUNT(*)
          FROM ${env.POSTS_TABLE_NAME} p
          WHERE p.user_id = u.id AND p.is_deleted = FALSE
        ) AS total_post,
        (
          SELECT COUNT(*)
          FROM ${env.FOLLOWS_TABLE_NAME} f
          WHERE f.follower_id = u.id
        ) AS following_count,
        (
          SELECT COUNT(*)
          FROM ${env.FOLLOWS_TABLE_NAME} f
          WHERE f.followee_id = u.id
        ) AS follower_count
      FROM
        ${env.USERS_TABLE_NAME} u
      JOIN
        ${env.FOLLOWS_TABLE_NAME} f ON u.id = f.followee_id
      WHERE
        f.follower_id = :user_id
        ${cursorClause}
      ORDER BY
        f.followed_at DESC
      LIMIT :limit
    `;

    try {
      if (!viewer_id) {
        delete params.viewer_id;
      }
      const results = await db.query(sql, params);
      return results.map((row: any) => ({
        user_id: row.user_id,
        user_name: row.user_name,
        profile_text: row.profile_text,
        icon_url: row.icon_url,
        created_at: row.created_at,
        is_following: Boolean(row.is_following),
        is_developer: Boolean(row.is_developer),
        total_miyabi: Number(row.total_miyabi),
        total_post: Number(row.total_post),
        following_count: Number(row.following_count),
        follower_count: Number(row.follower_count),
      }));
    } catch (error) {
      console.error(
        `[ProfileRepository#getFollowingUser] フォローしているユーザーの取得に失敗しました．`,
        error
      );
      throw new Error('データベースからのフォローしているユーザー取得処理に失敗しました．');
    }
  }
}
