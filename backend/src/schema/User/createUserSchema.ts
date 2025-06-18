import { z } from '@hono/zod-openapi';

// リクエストの型
export const createUserSchema = z.object({
  name: z.string().max(20).openapi({
    example: 'TARO-gh',
    description: 'ユーザ名（20文字以内）',
  }),
  oauth_app: z.enum(['github', 'google']).openapi({
    example: 'github',
    description: 'OAuthアプリの種類',
  }),
  connect_info: z.string().max(100).openapi({
    example: 'taro-gh@gmail.com', 
    description: 'メールアドレス',
  }),
  profile_text: z.string().max(255).optional().openapi({
    example: '大阪で歌人やってます',
    description: 'プロフィール文（任意）',
  }),
  icon_url: z.string().url().max(255).openapi({
    example: 'https://example.com/file.jpg',
    description: 'ユーザアイコンのURL（S3のURL）',
  }),
});

// レスポンスの型
export const createUserResponseSchema = z.object({
  message: z.string(),
});
