import { type IMiyabiRepository, type Miyabi } from './iMiyabiRepository.js';
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
}
