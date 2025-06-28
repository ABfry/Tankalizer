import { type IMiyabiRepository, type Miyabi } from './iMiyabiRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';

export class MiyabiRepository implements IMiyabiRepository {
  /**
   * ユーザーが特定の投稿に雅したか確認する
   * @param userId - ユーザーID
   * @param postId - 投稿ID
   * @returns {Promise<Miyabi | null>}
   */
  async findMiyabi(userId: string, postId: string): Promise<Miyabi | null> {
    const sql = `
    SELECT * FROM ${env.MIYABI_TABLE_NAME}
    WHERE user_id = :user_id AND post_id = :post_id
    LIMIT 1;
  `;
    const result = await db.query(sql, { user_id: userId, post_id: postId });
    return result[0] || null;
  }

  /**
   * 雅を作成する (投稿に雅する)
   * @param userId - ユーザーID
   * @param postId - 投稿ID
   * @returns {Promise<void>}
   */
  async create(userId: string, postId: string): Promise<void> {
    const sql = `
      INSERT INTO ${env.MIYABI_TABLE_NAME}
      (user_id, post_id)
      VALUES (:userId, :postId);
    `;
    try {
      await db.query(sql, { userId, postId });
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
  async delete(userId: string, postId: string): Promise<void> {
    const sql = `DELETE FROM ${env.MIYABI_TABLE_NAME} WHERE user_id = :userId AND post_id = :postId;`;
    try {
      await db.query(sql, { userId, postId });
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
