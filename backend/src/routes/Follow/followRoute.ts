import { createRoute } from '@hono/zod-openapi';
import { followRequestSchema, followResponseSchema } from '../../schema/Follow/followSchema.js';

/**
 * フォロー機能のルート定義
 *
 * APIエンドポイントの仕様を定義
 */
export const followRoute = createRoute({
  method: 'post', // HTTPメソッド
  path: '/follow', // エンドポイントのパス
  tags: ['Follow'], // OpenAPIでのタグ分け
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: followRequestSchema, // リクエストボディのスキーマ
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: followResponseSchema, // レスポンスボディのスキーマ
        },
      },
      description: 'フォロー成功',
    },
    400: {
      description: 'エラー',
    },
  },
});
