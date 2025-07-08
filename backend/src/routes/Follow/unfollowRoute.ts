import { z, createRoute } from '@hono/zod-openapi';
import { followRequestSchema, followResponseSchema } from '../../schema/Follow/followSchema.js';

const errorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

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
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'バリデーションエラー',
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
      description: '競合エラー（フォローしていないなど）',
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

export type unfollowRouteResponse200 = z.infer<
  (typeof unfollowRoute.responses)['200']['content']['application/json']['schema']
>;

export type unfollowRouteResponse400 = z.infer<
  (typeof unfollowRoute.responses)['400']['content']['application/json']['schema']
>;

export type unfollowRouteResponse404 = z.infer<
  (typeof unfollowRoute.responses)['404']['content']['application/json']['schema']
>;

export type unfollowRouteResponse409 = z.infer<
  (typeof unfollowRoute.responses)['409']['content']['application/json']['schema']
>;

export type unfollowRouteResponse500 = z.infer<
  (typeof unfollowRoute.responses)['500']['content']['application/json']['schema']
>;

export type unfollowRouteResponseError = z.infer<typeof errorResponseSchema>;
