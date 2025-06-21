import { type IUserRepository, type CreateUserRepoDTO, type User } from './iUserRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';

export class UserRepository implements IUserRepository {
  /**
   * メールアドレスをもとにユーザーを1件検索する
   * @param connect_info - メールアドレス (例: taro-gh@gmail.com)
   * @returns {Promise<User | null>} ユーザーが見つかった場合はUserオブジェクト，見つからなければnull
   */
  async findByEmail(connect_info: string): Promise<User | null> {
    const sql = `
      SELECT * FROM ${env.USERS_TABLE_NAME} 
      WHERE connect_info = :connect_info
      LIMIT 1;
    `;
    const result = await db.query<User>(sql, { connect_info });
    return result[0] || null;
  }

  /**
   * 新しいユーザーをDBに作成する
   * @param user - 作成するユーザーのデータ (CreateUserDTO)
   * @returns {Promise<void>}
   */
  async create(user: CreateUserRepoDTO): Promise<void> {
    const sql = `
      INSERT INTO ${env.USERS_TABLE_NAME} 
      (name, oauth_app, connect_info, profile_text, icon_url) 
      VALUES (:name, :oauth_app, :connect_info, :profile_text, :icon_url);
    `;
    try {
      await db.query(sql, {
        name: user.name,
        oauth_app: user.oauth_app,
        connect_info: user.connect_info,
        profile_text: user.profile_text,
        icon_url: user.icon_url,
      });
      console.log(
        `[UserRepository#create] ユーザーの作成に成功しました．(oauth_app: ${user.oauth_app}, connect_info: ${user.connect_info})`
      );
    } catch (error) {
      console.error(
        `[UserRepository#create] ユーザーの作成に失敗しました．(oauth_app: ${user.oauth_app}, connect_info: ${user.connect_info})`,
        error
      );
      throw error;
    }
  }
}
