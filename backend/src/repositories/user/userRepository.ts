import { type IUserRepository, type CreateUserRepoDTO, type User } from './iUserRepository.js';
import db from '../../lib/db.js';
import { env } from '../../config/env.js';
import mysql from 'mysql2';

export class UserRepository implements IUserRepository {
  /**
   * メールアドレスをもとにユーザーを1件検索する
   * @param connect_info - メールアドレス (例: taro-gh@gmail.com)
   * @returns {Promise<User | null>} ユーザーが見つかった場合はUserオブジェクト，見つからなければnull
   */
  async findByEmail(connect_info: string, oauth_app: 'github' | 'google'): Promise<User | null> {
    const sql = `
      SELECT * FROM ${env.USERS_TABLE_NAME} 
      WHERE connect_info = :connect_info
      AND oauth_app = :oauth_app
      LIMIT 1;
    `;
    const result = await db.query<User>(sql, { connect_info, oauth_app });
    //console.log('作成したユーザー', result);
    return result[0] || null;
  }

  /**
   * ユーザーIDをもとにユーザーを1件検索する
   * @param id - ユーザーID
   * @returns {Promise<User | null>} ユーザーが見つかった場合はUserオブジェクト，見つからなければnull
   */
  async findById(id: string, dbc?: mysql.Connection): Promise<User | null> {
    const query = `
      SELECT * FROM ${env.USERS_TABLE_NAME} 
      WHERE id = :id
      LIMIT 1;
    `;
    const option = { id };
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
