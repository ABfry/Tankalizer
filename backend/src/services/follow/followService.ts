import type { IFollowService } from './iFollowService.js';
import type { IFollowRepository } from '../../repositories/follow/iFollowRepository.js';
import {
  ClientError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../../utils/errors/customErrors.js';

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
        throw new ForbiddenError('自分自身をフォローすることはできません');
      }

      // 既にフォローしているかチェック
      const isAlreadyFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (isAlreadyFollowing) {
        throw new ConflictError('既にフォローしています');
      }

      // フォロー関係を作成（FOREIGN KEY制約でユーザー存在チェックされる）
      await this.followRepository.createFollow(followerId, followeeId);
    } catch (error) {
      // クライアントエラーはそのまま再スロー
      if (error instanceof ClientError) {
        throw error;
      }

      // SQLエラーをチェックして適切なエラーに変換
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        // MySQLのFOREIGN KEY制約エラーをメッセージから判定
        if (
          errorMessage.includes('foreign key constraint fails') &&
          errorMessage.includes('REFERENCES `users`')
        ) {
          throw new NotFoundError('指定されたユーザーが存在しません');
        }
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
      // フォローしているかチェック
      const isFollowing = await this.followRepository.isFollowing(followerId, followeeId);
      if (!isFollowing) {
        // フォローしていない（ユーザー存在有無に関わらず同じエラー）
        throw new ConflictError('フォロー関係が存在しません');
      }

      // フォロー関係を削除
      await this.followRepository.deleteFollow(followerId, followeeId);
    } catch (error) {
      // クライアントエラーはそのまま再スロー
      if (error instanceof ClientError) {
        throw error;
      }

      // その他のエラーはデータベースエラーとして扱う
      throw new DatabaseError('アンフォロー処理中にサーバエラーが発生しました');
    }
  }
}
