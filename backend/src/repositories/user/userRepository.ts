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
   * old_icon_urlをもとにユーザーを1件検索する
   * @param oldIconUrl - 旧アイコンURL
   * @returns {Promise<User | null>} ユーザーが見つかった場合はUserオブジェクト，見つからなければnull
   */
  async findByOldIconUrl(oldIconUrl: string): Promise<User | null> {
    const sql = `
      SELECT * FROM ${env.USERS_TABLE_NAME} 
      WHERE old_icon_url = :oldIconUrl
      LIMIT 1;
    `;
    const result = await db.query<User>(sql, { oldIconUrl });
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
      (id, name, oauth_app, connect_info, profile_text, icon_url) 
      VALUES (:id, :name, :oauth_app, :connect_info, :profile_text, :icon_url);
    `;
    try {
      await db.query(sql, {
        id: user.id,
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

  /**
   * ユーザーのconnect_infoとicon_urlを更新する
   * @param id - ユーザーID
   * @param connect_info - 新しいconnect_info
   * @param oauth_app - OAuth app
   * @param icon_url - 新しいアイコンURL
   * @returns {Promise<void>}
   */
  async updateConnectInfoAndIcon(id: string, connect_info: string, oauth_app: 'github' | 'google', icon_url: string): Promise<void> {
    const sql = `
      UPDATE ${env.USERS_TABLE_NAME}
      SET connect_info = :connect_info,
          oauth_app = :oauth_app,
          icon_url = :icon_url
      WHERE id = :id;
    `;
    try {
      await db.query(sql, {
        id,
        connect_info,
        oauth_app,
        icon_url,
      });
      console.log(
        `[UserRepository#updateConnectInfoAndIcon] ユーザー情報の更新に成功しました．(user_id: ${id})`
      );
    } catch (error) {
      console.error(
        `[UserRepository#updateConnectInfoAndIcon] ユーザー情報の更新に失敗しました．(user_id: ${id})`,
        error
      );
      throw error;
    }
  }
}
