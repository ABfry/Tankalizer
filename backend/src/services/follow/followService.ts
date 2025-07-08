import type { IFollowService } from './iFollowService.js';
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
  async followUser(followerId: string, followeeId: string): Promise<void> {
    try {
      // 自分自身のフォローをチェック
      if (followerId === followeeId) {
        throw new Error('自分自身をフォローすることはできません');
      }

      // 既にフォローしているかチェック
      const isAlreadyFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (isAlreadyFollowing) {
        throw new Error('既にフォローしています');
      }

      // フォロー関係を作成（FOREIGN KEY制約でユーザー存在チェックされる）
      await this.followRepository.createFollow(followerId, followeeId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * ユーザのフォローを解除する処理
   * ・フォローしていない場合は解除できない
   */
  async unfollowUser(followerId: string, followeeId: string): Promise<void> {
    try {
      // フォローしているかチェック
      const isFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (!isFollowing) {
        throw new Error('フォロー関係が存在しません');
      }

      // フォロー関係を削除
      await this.followRepository.deleteFollow(followerId, followeeId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
