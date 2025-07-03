import { z } from '@hono/zod-openapi';

// リクエストの型
export const getPostSchema = z.object({
  limit: z.number().optional().default(10).openapi({
    example: 10,
    description: '取得する投稿の数',
  }),
  cursor: z.string().optional().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: 'どの投稿より古いのを取得するか指定する投稿id',
  }),
  filterByUserId: z.string().optional().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: '特定のユーザーの投稿を取得するためのユーザーid',
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
export const getPostResponseSchema = z.object({
  message: z.string(),
  posts: z.array(Post),
});
