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

      await db.query(sql, values); // 第2引数に配列を渡す
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
}
