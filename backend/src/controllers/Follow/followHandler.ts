import { type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';

import type { followRoute } from '../../routes/Follow/followRoute.js';
import { FollowService } from '../../services/follow/followService.js';
import { FollowRepository } from '../../repositories/follow/followRepository.js';
import type { IFollowService } from '../../services/follow/iFollowService.js';
import type { IFollowRepository } from '../../repositories/follow/iFollowRepository.js';

/**
 * フォロー機能のハンドラー
 *
 * APIリクエストを受け取り、サービスを呼び出して
 * レスポンスを返す
 */

// 依存性注入：リポジトリとサービスのインスタンスを作成
const followRepository: IFollowRepository = new FollowRepository();
const followService: IFollowService = new FollowService(followRepository);

/**
 * フォロー処理のハンドラー関数
 * POST /follow のリクエストを処理
 */
const followHandler: RouteHandler<typeof followRoute, {}> = async (c: Context) => {
  try {
    // リクエストボディからデータを取得
    const { followerId, followeeId } = await c.req.json();

    console.log(`[Handler] フォローリクエストを受け付けました: ${followerId} -> ${followeeId}`);

    // サービスを呼び出してフォロー処理を実行
    await followService.followUser(followerId, followeeId);

    console.log(`[Handler] フォロー処理が正常に完了しました: ${followerId} -> ${followeeId}`);

    // 成功レスポンスを返す
    return c.json(
      {
        message: 'フォローしました',
      },
      200
    );
  } catch (err: any) {
    console.error('[Handler] フォロー処理中にエラーが発生しました:', err);

    return c.json(
      {
        message: err.message,
        statusCode: 500,
        error: 'Internal Server Error',
        errorType: 'server',
      },
      500
    );
  }
};

export default followHandler;
