import { createRoute } from '@hono/zod-openapi';
import { followRequestSchema, followResponseSchema } from '../../schema/Follow/followSchema.js';

/**
 * アンフォロー機能のルート定義
 *
 * APIエンドポイントの仕様を定義
 */
export const unfollowRoute = createRoute({
  method: 'post', // HTTPメソッド
  path: '/v2/unfollow', // エンドポイントのパス
  tags: ['Follow'], // OpenAPIでのタグ分け
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: followRequestSchema, // リクエストボディのスキーマ（フォローと同じ）
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: followResponseSchema, // レスポンスボディのスキーマ（フォローと同じ）
        },
      },
      description: 'アンフォロー成功',
    },
    400: {
      description: 'バリデーションエラー',
    },
    404: {
      description: 'ユーザーが存在しない',
    },
    409: {
      description: '競合エラー（フォローしていないなど）',
    },
    500: {
      description: 'サーバー内部エラー',
    },
  },
});
