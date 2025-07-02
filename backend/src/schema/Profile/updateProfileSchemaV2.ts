import { z } from '@hono/zod-openapi';

// リクエストの型
export const updateProfileSchema = z.object({
  user_id: z.string().openapi({
    example: '8e21e23a-eb9f-11ef-9ce7-0242ac130002',
    description: 'プロフィールを編集したいユーザーのID',
  }),
  user_name: z.string().max(20).openapi({
    example: '太郎くん',
    description: '新しいユーザー名',
  }),
  profile_text: z.string().max(255).openapi({
    example: '虎ノ門ヒルズで歌人やってます．',
    description: '新しい自己紹介文',
  }),
  icon_image: z
    .custom((val) => val === null || val instanceof Blob || val == '')
    .optional()
    .openapi({
      type: 'string',
      format: 'binary',
      description: '新しいアイコン画像ファイル',
    }),
});

// profileのスキーマ
export const Profile = z.object({
  user_id: z.string(), // ユーザid
  user_name: z.string(), // ユーザ名
  profile_text: z.string(), // 自己紹介文
  icon_url: z.string(), // ユーザアイコン
  created_at: z.date(), // ユーザ作成日時
  is_following: z.boolean(), // フォローしているか？
  total_miyabi: z.number(), // 総獲得雅数
  total_post: z.number(), // 総投稿数
  following_count: z.number(), // 総フォロー数
  follower_count: z.number(), // 総フォロワー数
});

// レスポンスの型
export const updateProfileResponseSchema = z.object({
  message: z.string(),
  profile: Profile,
});
