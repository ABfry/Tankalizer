import type { IFollowService, FollowResult, UnfollowResult, FollowError } from './iFollowService.js';
import { FollowError as FollowErrorEnum } from './iFollowService.js';
import type { IFollowRepository } from '../../repositories/follow/iFollowRepository.js';

// フォロー機能のサービス実装クラス

export class FollowService implements IFollowService {
  // リポジトリをコンストラクタで注入（依存性注入）
  constructor(private followRepository: IFollowRepository) {}

  /**
   * ユーザをフォローする処理
   * ・自分自身のフォローは禁止
   * ・重複フォローは禁止
   */
  async followUser(followerId: string, followeeId: string): Promise<FollowResult> {
    try {
      // 自分自身のフォローをチェック
      if (followerId === followeeId) {
        return {
          success: false,
          error: FollowErrorEnum.SELF_FOLLOW,
          message: '自分自身をフォローすることはできません'
        };
      }

      // 既にフォローしているかチェック
      const isAlreadyFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (isAlreadyFollowing) {
        return {
          success: false,
          error: FollowErrorEnum.ALREADY_FOLLOWING,
          message: '既にフォローしています'
        };
      }

      // フォロー関係を作成（FOREIGN KEY制約でユーザー存在チェックされる）
      await this.followRepository.createFollow(followerId, followeeId);
      return { success: true };
    } catch (error: any) {
      console.error(error);
      
      // MySQL外部キー制約エラーの場合
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
        return {
          success: false,
          error: FollowErrorEnum.USER_NOT_FOUND,
          message: 'ユーザーが見つかりません'
        };
      }
      
      // その他のデータベースエラー
      return {
        success: false,
        error: FollowErrorEnum.DATABASE_ERROR,
        message: 'データベースエラーが発生しました'
      };
    }
  }

  /**
   * ユーザのフォローを解除する処理
   * ・フォローしていない場合は解除できない
   */
  async unfollowUser(followerId: string, followeeId: string): Promise<UnfollowResult> {
    try {
      // フォローしているかチェック
      const isFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (!isFollowing) {
        return {
          success: false,
          error: FollowErrorEnum.NOT_FOLLOWING,
          message: 'フォロー関係が存在しません'
        };
      }

      // フォロー関係を削除
      await this.followRepository.deleteFollow(followerId, followeeId);
      return { success: true };
    } catch (error: any) {
      console.error(error);
      
      // その他のデータベースエラー
      return {
        success: false,
        error: FollowErrorEnum.DATABASE_ERROR,
        message: 'データベースエラーが発生しました'
      };
    }
  }
}
