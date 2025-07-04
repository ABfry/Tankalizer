import type { IFollowService } from './iFollowService.js';
import type { IFollowRepository } from '../../repositories/follow/iFollowRepository.js';
import type { IUserRepository } from '../../repositories/user/iUserRepository.js';
import { BusinessLogicError, DatabaseError } from '../../utils/errors/customErrors.js';

// フォロー機能のサービス実装クラス

export class FollowService implements IFollowService {
  // リポジトリをコンストラクタで注入（依存性注入）
  constructor(
    private followRepository: IFollowRepository,
    private userRepository: IUserRepository
  ) {}

  /**
   * ユーザをフォローする処理
   * ・自分自身のフォローは禁止
   * ・重複フォローは禁止
   */
  async followUser(followerId: string, followeeId: string): Promise<void> {
    try {
      // フォローするユーザーの存在チェック
      const follower = await this.userRepository.findById(followerId);
      if (!follower) {
        throw new BusinessLogicError('フォローするユーザーが存在しません');
      }

      // フォローされるユーザーの存在チェック
      const followee = await this.userRepository.findById(followeeId);
      if (!followee) {
        throw new BusinessLogicError('フォローされるユーザーが存在しません');
      }

      // 自分自身のフォローをチェック
      if (followerId === followeeId) {
        throw new BusinessLogicError('自分自身をフォローすることはできません');
      }

      // 既にフォローしているかチェック
      const isAlreadyFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (isAlreadyFollowing) {
        throw new BusinessLogicError('既にフォローしています');
      }

      // 問題なければフォロー関係を作成
      await this.followRepository.createFollow(followerId, followeeId);
    } catch (error) {
      // ビジネスロジックエラーはそのまま再スロー
      if (error instanceof BusinessLogicError) {
        throw error;
      }
      // その他のエラーはデータベースエラーとして扱う
      throw new DatabaseError('フォロー処理中にサーバエラーが発生しました');
    }
  }

  /**
   * ユーザのフォローを解除する処理
   * ・フォローしていない場合は解除できない
   */
  async unfollowUser(followerId: string, followeeId: string): Promise<void> {
    try {
      // フォローするユーザーの存在チェック
      const follower = await this.userRepository.findById(followerId);
      if (!follower) {
        throw new BusinessLogicError('フォローするユーザーが存在しません');
      }

      // フォローされるユーザーの存在チェック
      const followee = await this.userRepository.findById(followeeId);
      if (!followee) {
        throw new BusinessLogicError('フォローされるユーザーが存在しません');
      }

      // フォローしているかチェック
      const isFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (!isFollowing) {
        throw new BusinessLogicError('フォローしていません');
      }

      // フォロー関係を削除
      await this.followRepository.deleteFollow(followerId, followeeId);
    } catch (error) {
      // ビジネスロジックエラーはそのまま再スロー
      if (error instanceof BusinessLogicError) {
        throw error;
      }
      // その他のエラーはデータベースエラーとして扱う
      throw new DatabaseError('アンフォロー処理中にサーバエラーが発生しました');
    }
  }
}
