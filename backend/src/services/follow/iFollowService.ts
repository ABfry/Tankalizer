// フォロー機能のサービスインターフェース

/**
 * フォロー操作のエラー種別
 */
export enum FollowError {
  SELF_FOLLOW = 'SELF_FOLLOW',
  ALREADY_FOLLOWING = 'ALREADY_FOLLOWING',
  NOT_FOLLOWING = 'NOT_FOLLOWING',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * フォロー操作の結果
 */
export type FollowResult = 
  | { success: true }
  | { success: false; error: FollowError; message: string };

/**
 * アンフォロー操作の結果
 */
export type UnfollowResult = 
  | { success: true }
  | { success: false; error: FollowError; message: string };

export interface IFollowService {
  /**
   * ユーザをフォロー
   * @param followerId フォローする人のユーザID
   * @param followeeId フォローされる人のユーザID
   * @returns フォロー操作の結果
   */
  followUser(followerId: string, followeeId: string): Promise<FollowResult>;

  /**
   * ユーザのフォロー解除
   * @param followerId フォローする人のユーザID
   * @param followeeId フォローされる人のユーザID
   * @returns アンフォロー操作の結果
   */
  unfollowUser(followerId: string, followeeId: string): Promise<UnfollowResult>;
}
