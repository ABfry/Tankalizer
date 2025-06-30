import { z } from '@hono/zod-openapi';

// リクエストの型
export const getProfileSchema = z.object({
  user_id: z.string().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: 'ユーザーID',
  }),
  viewer_id: z.string().optional().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: '閲覧者のユーザーid',
  }),
});

// profileのスキーマ
export const Profile = z.object({
  user_id: z.string(), // ユーザid
  user_name: z.string(), // ユーザ名
  icon_url: z.string(), // ユーザアイコン
  created_at: z.date(), // ユーザ作成日時
  is_following: z.boolean(), // フォローしているか？
  total_miyabi: z.number(), // 総獲得雅数
  total_post: z.number(), // 総投稿数
  following_count: z.number(), // 総フォロー数
  follower_count: z.number(), // 総フォロワー数
});

// レスポンスの型
export const getProfileResponseSchema = z.object({
  message: z.string(),
  profile: Profile,
});
