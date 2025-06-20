import db from '../../lib/db.js';
import { env } from '../../config/env.js';

// Post作成時にServiceから受け取るデータの型 (DTO)
export type CreatePostDTO = {
  original: string;
  tanka: object;
  image_path: string | null;
  user_id: string;
};

// DBから取得する投稿データの型
export type Post = {
  id: string;
  original: string;
  tanka: object;
  image_path: string | null;
  user_id: string;
  is_deleted: boolean;
  created_at: Date;
};

export class PostRepository {
  /**
   * 新しい投稿をDBに作成する
   * @param postDto - 作成する投稿のデータ (CreatePostDTO)
   * @returns {Promise<void>}
   */
  async create(postDto: CreatePostDTO): Promise<void> {
    const sql = `
      INSERT INTO ${env.POSTS_TABLE_NAME}
      (original, tanka, image_path, user_id)
      VALUES (:original, :tanka, :image_path, :user_id);
    `;

    try {
      await db.query(sql, {
        original: postDto.original,
        tanka: postDto.tanka,
        image_path: postDto.image_path,
        user_id: postDto.user_id,
      });
      console.log(`[PostRepository#create] 投稿の作成に成功しました．(userId: ${postDto.user_id})`);
    } catch (error) {
      console.error(
        `[PostRepository#create] 投稿の作成に失敗しました．(userId: ${postDto.user_id})`,
        error
      );
      throw error;
    }
  }

  /**
   * 投稿IDを指定して投稿を1件取得する
   * @param id - 取得したい投稿のID
   * @returns {Promise<Post | null>}
   */
  async findById(id: string): Promise<Post | null> {
    const sql = `
      SELECT * FROM ${env.POSTS_TABLE_NAME}
      WHERE id = :id AND is_deleted = FALSE
      LIMIT 1;
    `;
    const result = await db.query<Post>(sql, { id });
    return result[0] || null;
  }

  /**
   * ユーザーIDを指定して、そのユーザーの投稿一覧を取得する
   * @param userId - ユーザーのID
   * @returns {Promise<Post[]>}
   */
  async findByUserId(userId: string): Promise<Post[]> {
    const sql = `
      SELECT * FROM ${env.POSTS_TABLE_NAME}
      WHERE user_id = :userId AND is_deleted = FALSE
      ORDER BY created_at DESC;
    `;
    return await db.query<Post>(sql, { userId });
  }
}
