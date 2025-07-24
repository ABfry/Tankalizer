import { z, createRoute } from '@hono/zod-openapi';
import { followRequestSchema, followResponseSchema } from '../../schema/Follow/followSchema.js';

const errorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

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
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'バリデーションエラー',
    },
    403: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '禁止された操作（自分自身のフォローなど）',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'ユーザーが存在しない',
    },
    409: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: '競合エラー（既にフォロー済みなど）',
    },
    500: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'サーバー内部エラー',
    },
  },
});

export type followRouteResponse200 = z.infer<
  (typeof followRoute.responses)['200']['content']['application/json']['schema']
>;

export type followRouteResponse400 = z.infer<
  (typeof followRoute.responses)['400']['content']['application/json']['schema']
>;

export type followRouteResponse403 = z.infer<
  (typeof followRoute.responses)['403']['content']['application/json']['schema']
>;

export type followRouteResponse404 = z.infer<
  (typeof followRoute.responses)['404']['content']['application/json']['schema']
>;

export type followRouteResponse409 = z.infer<
  (typeof followRoute.responses)['409']['content']['application/json']['schema']
>;

export type followRouteResponse500 = z.infer<
  (typeof followRoute.responses)['500']['content']['application/json']['schema']
>;

export type followRouteResponseError = z.infer<typeof errorResponseSchema>;
