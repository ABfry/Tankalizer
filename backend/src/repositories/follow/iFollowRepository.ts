import mysql from 'mysql2';

// フォロー関連のリポジトリインターフェース
// 他のリポジトリと同様にトランザクション対応

export interface IFollowRepository {
  /**
   * フォロー
   * @param followerId フォローする人のユーザーID
   * @param followeeId フォローされる人のユーザーID
   * @param dbc トランザクション用のコネクション（オプション）
   */
  createFollow(followerId: string, followeeId: string, dbc?: mysql.Connection): Promise<void>;

  /**
   * フォロー解除
   * @param followerId フォローする人のユーザーID
   * @param followeeId フォローされる人のユーザーID
   * @param dbc トランザクション用のコネクション（オプション）
   */
  deleteFollow(followerId: string, followeeId: string, dbc?: mysql.Connection): Promise<void>;

  /**
   * フォロー中かどうか
   * @param followerId フォローする人のユーザーID
   * @param followeeId フォローされる人のユーザーID
   * @param dbc トランザクション用のコネクション（オプション）
   * @returns フォロー中の場合true、そうでなければfalse
   */
  isFollowing(followerId: string, followeeId: string, dbc?: mysql.Connection): Promise<boolean>;
}
