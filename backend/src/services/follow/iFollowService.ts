// フォロー機能のサービスインターフェース

export interface IFollowService {
  /**
   * ユーザをフォロー
   * @param followerId フォローする人のユーザID
   * @param followeeId フォローされる人のユーザID
   */
  followUser(followerId: string, followeeId: string): Promise<void>;

  /**
   * ユーザのフォロー解除
   * @param followerId フォローする人のユーザID
   * @param followeeId フォローされる人のユーザID
   */
  unfollowUser(followerId: string, followeeId: string): Promise<void>;
}
