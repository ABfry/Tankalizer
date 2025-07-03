import { type IMiyabiRepository, type Miyabi, type RankedPost } from './iMiyabiRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';
import mysql from 'mysql2';

export class MiyabiRepository implements IMiyabiRepository {
  /**
   * ユーザーが特定の投稿に雅したか確認する
   * @param userId - ユーザーID
   * @param postId - 投稿ID
   * @returns {Promise<Miyabi | null>}
   */
  async findMiyabi(userId: string, postId: string, dbc?: mysql.Connection): Promise<Miyabi | null> {
    const query = `
    SELECT * FROM ${env.MIYABI_TABLE_NAME}
    WHERE user_id = :user_id AND post_id = :post_id
    LIMIT 1;
  `;
    const option = { user_id: userId, post_id: postId };
    let results;
    if (dbc) {
      // トランザクション中の場合
      results = await db.queryOnConnection(dbc, query, option);
    } else {
      // 通常の場合
      results = await db.query(query, option);
    }

    return results[0] || null;
  }

  /**
   * 雅を作成する (投稿に雅する)
   * @param userId - ユーザーID
   * @param postId - 投稿ID
   * @returns {Promise<void>}
   */
  async create(userId: string, postId: string, dbc?: mysql.Connection): Promise<void> {
    const query = `
      INSERT INTO ${env.MIYABI_TABLE_NAME}
      (user_id, post_id)
      VALUES (:userId, :postId);
    `;
    const option = { userId, postId };
    try {
      if (dbc) {
        // トランザクション中の場合
        await db.queryOnConnection(dbc, query, option);
      } else {
        // 通常の場合
        await db.query(query, option);
      }
      console.log(
        `[MiyabiRepository#create] 雅の作成に成功しました．(userId: ${userId}, postId: ${postId})`
      );
    } catch (error) {
      console.error(
        `[MiyabiRepository#create] 雅の作成に失敗しました．(userId: ${userId}, postId: ${postId})`,
        error
      );
      throw error;
    }
  }

  /**
   * 雅を削除する
   * @param userId - ユーザーID
   * @param postId - 投稿ID
   * @returns {Promise<void>}
   */
  async delete(userId: string, postId: string, dbc?: mysql.Connection): Promise<void> {
    const query = `DELETE FROM ${env.MIYABI_TABLE_NAME} WHERE user_id = :userId AND post_id = :postId;`;
    const option = { userId, postId };
    try {
      if (dbc) {
        // トランザクション中の場合
        await db.queryOnConnection(dbc, query, option);
      } else {
        // 通常の場合
        await db.query(query, option);
      }
      console.log(
        `[MiyabiRepository#delete] 雅の削除に成功しました．(userId: ${userId}, postId: ${postId})`
      );
    } catch (error) {
      console.error(
        `[MiyabiRepository#delete] 雅の削除に失敗しました．(userId: ${userId}, postId: ${postId})`,
        error
      );
      throw error;
    }
  }

  /**
   * 雅ランキングを取得する
   * @param limit - 取得する投稿数の上限
   * @param viewerId - ビューアーのユーザーID（オプション）
   * @returns {Promise<PostWithRank[]>}
   */
  async getMiyabiRanking(limit: number, viewerId?: string): Promise<RankedPost[]> {
    const params: { [key: string]: any } = { limit };

    // viewerId が指定されている場合，閲覧者が雅済みかチェックする句を動的に生成
    let isMiyabiClause: string;
    if (viewerId) {
      isMiyabiClause = `(EXISTS (SELECT 1 FROM ${env.MIYABI_TABLE_NAME} WHERE post_id = p.id AND user_id = :viewerId))`;
      params.viewerId = viewerId;
    } else {
      // viewerIdがなければ，is_miyabiは常にfalse
      isMiyabiClause = 'FALSE';
    }

    const sql = `
      SELECT
        p.id,
        p.original,
        p.tanka,
        p.image_path,
        p.created_at,
        p.user_id,
        u.name AS user_name,
        u.icon_url AS user_icon,
        (EXISTS (SELECT 1 FROM ${env.DEVELOPERS_TABLE_NAME} WHERE user_id = u.id)) AS is_developer,
        COUNT(m.id) AS miyabi_count,
        ${isMiyabiClause} AS is_miyabi
      FROM
        ${env.POSTS_TABLE_NAME} AS p
      -- 投稿者情報を取得するためにusersテーブルをJOIN
      JOIN
        ${env.USERS_TABLE_NAME} AS u ON p.user_id = u.id
      -- 雅の数を集計するためにmiyabisテーブルをJOIN
      JOIN
        ${env.MIYABI_TABLE_NAME} AS m ON p.id = m.post_id
      WHERE
        -- 直近7日間の投稿に絞る
        m.created_at >= (NOW() - INTERVAL 7 DAY)
        AND p.is_deleted = FALSE
      GROUP BY
        p.id, u.id
      ORDER BY
        miyabi_count DESC, p.created_at DESC
      LIMIT :limit
    `;

    try {
      const results = await db.query(sql, params);

      // 整形
      const rankedPosts: RankedPost[] = results.map((row: any, index: number) => ({
        ...row,
        rank: index + 1,
        is_developer: Boolean(row.is_developer),
        is_miyabi: Boolean(row.is_miyabi),
        miyabi_count: Number(row.miyabi_count),
      }));

      return rankedPosts;
    } catch (error) {
      console.error(
        '[MiyabiRepository#getMiyabiRanking] 雅ランキングの取得に失敗しました．',
        error
      );
      throw new Error('データベースからの雅ランキング取得処理に失敗しました．');
    }
  }
}
