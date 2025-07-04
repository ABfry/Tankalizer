import { z } from '@hono/zod-openapi';

// リクエストの型
export const getOnePostSchema = z.object({
  id: z.string().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: '取得したい投稿の投稿id',
  }),
  viewerId: z.string().optional().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: '閲覧者のユーザーid',
  }),
});

// postのスキーマ
export const Post = z.object({
  id: z.string(),
  original: z.string(),
  tanka: z.array(z.string()),
  image_path: z.string().nullable(),
  created_at: z.string(),
  user_id: z.string(),
  user_name: z.string(),
  user_icon: z.string(),
  is_developer: z.boolean(),
  miyabi_count: z.number().int().min(0),
  is_miyabi: z.boolean(),
});

// レスポンスの型
export const getOnePostResponseSchema = z.object({
  message: z.string(),
  post: Post,
});
