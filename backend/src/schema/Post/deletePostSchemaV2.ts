import { z } from '@hono/zod-openapi';

// リクエストの型
export const deletePostSchema = z.object({
  post_id: z.string().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: '投稿id',
  }),
  user_id: z.string().openapi({
    example: '5e622fe0-4dcd-11f0-8c6b-0242ac130003',
    description: 'ユーザーID (36文字のUUID形式)',
  }),
});

// レスポンスの型
export const deletePostResponseSchema = z.object({
  message: z.string(),
});
