import { createRoute } from '@hono/zod-openapi';
import { followRequestSchema, followResponseSchema } from '../../schema/Follow/followSchema.js';

/**
 * フォロー機能のルート定義
 *
 * APIエンドポイントの仕様を定義
 */
export const followRoute = createRoute({
  method: 'post', // HTTPメソッド
  path: '/v2/follow', // エンドポイントのパス
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
      description: 'バリデーションエラー',
    },
    403: {
      description: '禁止された操作（自分自身のフォローなど）',
    },
    404: {
      description: 'ユーザーが存在しない',
    },
    409: {
      description: '競合エラー（既にフォロー済みなど）',
    },
    500: {
      description: 'サーバー内部エラー',
    },
  },
});
