import db from '../../lib/db.js';
import { env } from '../../config/env.js';
import mysql from 'mysql2';
import type { IFollowRepository } from './iFollowRepository.js';

// フォロー機能のリポジトリ実装

export class FollowRepository implements IFollowRepository {
  /**
   * フォロー関係をデータベースに保存
   * follows テーブルに新しいレコードを挿入
   * @param followerId - フォローする人のユーザーID
   * @param followeeId - フォローされる人のユーザーID
   * @param dbc - トランザクション用のコネクション（オプション）
   */
  async createFollow(
    followerId: string,
    followeeId: string,
    dbc?: mysql.Connection
  ): Promise<void> {
    const query = `
      INSERT INTO ${env.FOLLOWS_TABLE_NAME} (follower_id, followee_id)
      VALUES (:followerId, :followeeId)
    `;
    const params = { followerId, followeeId };

    try {
      if (dbc) {
        // トランザクション中の場合
        await db.queryOnConnection(dbc, query, params);
      } else {
        // 通常の場合
        await db.query(query, params);
      }
      console.log(
        `[FollowRepository#createFollow] フォローの作成に成功しました. (${followerId} -> ${followeeId})`
      );
    } catch (error) {
      console.error(
        `[FollowRepository#createFollow] フォローの作成に失敗しました. (${followerId} -> ${followeeId})`,
        error
      );
      throw error;
    }
  }

  /**
   * フォロー関係をデータベースから削除
   * follows テーブルから該当のレコードを削除
   * @param followerId - フォローする人のユーザーID
   * @param followeeId - フォローされる人のユーザーID
   * @param dbc - トランザクション用のコネクション（オプション）
   */
  async deleteFollow(
    followerId: string,
    followeeId: string,
    dbc?: mysql.Connection
  ): Promise<void> {
    const query = `
      DELETE FROM ${env.FOLLOWS_TABLE_NAME}
      WHERE follower_id = :followerId AND followee_id = :followeeId
    `;
    const params = { followerId, followeeId };

    try {
      if (dbc) {
        // トランザクション中の場合
        await db.queryOnConnection(dbc, query, params);
      } else {
        // 通常の場合
        await db.query(query, params);
      }
      console.log(
        `[FollowRepository#deleteFollow] フォローの削除に成功しました. (${followerId} -> ${followeeId})`
      );
    } catch (error) {
      console.error(
        `[FollowRepository#deleteFollow] フォローの削除に失敗しました. (${followerId} -> ${followeeId})`,
        error
      );
      throw error;
    }
  }

  /**
   * フォロー関係が存在するかデータベースに問い合わせ
   * COUNT(*) を使って存在チェック
   * @param followerId - フォローする人のユーザーID
   * @param followeeId - フォローされる人のユーザーID
   * @param dbc - トランザクション用のコネクション（オプション）
   * @returns フォロー中の場合true、そうでなければfalse
   */
  async isFollowing(
    followerId: string,
    followeeId: string,
    dbc?: mysql.Connection
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${env.FOLLOWS_TABLE_NAME}
      WHERE follower_id = :followerId AND followee_id = :followeeId
    `;
    const params = { followerId, followeeId };

    try {
      let result;
      if (dbc) {
        // トランザクション中の場合
        result = await db.queryOnConnection<{ count: number }>(dbc, query, params);
      } else {
        // 通常の場合
        result = await db.query<{ count: number }>(query, params);
      }
      return result[0].count > 0; // 1以上なら true（フォロー中）
    } catch (error) {
      console.error(
        `[FollowRepository#isFollowing] フォロー状態の確認に失敗しました. (${followerId} -> ${followeeId})`,
        error
      );
      throw error;
    }
  }
}
