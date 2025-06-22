import { type IPostRepository, type CreatePostRepoDTO, type Post } from './iPostRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';

export class PostRepository implements IPostRepository {
  /**
   * 投稿IDをもとに投稿を1件検索する
   * @param id - ID (UUID形式)
   * @returns {Promise<Post | null>} 投稿が見つかった場合はPostオブジェクト，見つからなければnull
   */
  async findById(id: string): Promise<Post | null> {
    const sql = `
      SELECT * FROM ${env.POSTS_TABLE_NAME} 
      WHERE id = :id
      LIMIT 1;
    `;
    const result = await db.query<Post>(sql, { id });
    return result[0] || null;
  }

  /**
   * 新しい投稿をDBに作成する
   * @param postRepoDto - 作成する投稿のデータ (CreatePostDTO)
   * @returns {Promise<void>}
   */
  async create(postRepoDto: CreatePostRepoDTO): Promise<void> {
    const sql = `
      INSERT INTO ${env.POSTS_TABLE_NAME}
        (original, tanka, image_path, user_id)
      VALUES
        (:original, :tanka, :image_path, :user_id);
    `;

    try {
      const values = {
        original: postRepoDto.original,
        tanka: JSON.stringify(postRepoDto.tanka),
        image_path: postRepoDto.image_path,
        user_id: postRepoDto.user_id,
      };

      await db.query(sql, values);
      console.log(
        `[PostRepository#create] 投稿の作成に成功しました．(userId: ${postRepoDto.user_id})`
      );
    } catch (error) {
      console.error(
        `[PostRepository#create] 投稿の作成に失敗しました．(userId: ${postRepoDto.user_id})`,
        error
      );
      throw error;
    }
  }

  /**
   * 投稿を削除（削除フラグをONに）する
   * @param id - 投稿ID
   * @param userId - ユーザーID
   * @returns {Promise<void>}
   */
  async delete(id: string, userId: string): Promise<void> {
    const sql = `
      UPDATE ${env.POSTS_TABLE_NAME}
      SET is_deleted = TRUE
      WHERE id = :id AND user_id = :userId;
    `;
    try {
      await db.query(sql, { id, userId });
      console.log(`[PostRepository#delete] 投稿の削除に成功しました．(postId: ${id})`);
    } catch (error) {
      console.error(`[PostRepository#delete] 投稿の削除に失敗しました．(postId: ${id})`, error);
      throw error;
    }
  }

  /**
   * 投稿を取得する
   * @param dto - 取得条件 (GetPostsRepoDTO)
   * @returns {Promise<Post[]>} 投稿の配列
   */
  async getPosts(dto: {
    limit: number;
    cursor?: string | null;
    filterByUserId?: string | null;
    viewerId?: string | null;
  }): Promise<Post[]> {
    const { limit, cursor, filterByUserId, viewerId } = dto;
    let sql = `
      SELECT * FROM ${env.POSTS_TABLE_NAME}
      WHERE is_deleted = FALSE
    `;

    if (filterByUserId) {
      sql += ` AND user_id = :filterByUserId`;
    }

    if (cursor) {
      sql += ` AND created_at < (SELECT created_at FROM ${env.POSTS_TABLE_NAME} WHERE id = :cursor)`;
    }

    sql += `
      ORDER BY created_at DESC
      LIMIT :limit;
    `;

    const values: Record<string, any> = { limit };
    if (filterByUserId) values.filterByUserId = filterByUserId;
    if (cursor) values.cursor = cursor;

    const result = await db.query<Post>(sql, values);
    return result;
  }
}
