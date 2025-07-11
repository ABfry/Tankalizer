import { z } from '@hono/zod-openapi';

// リクエストの型
export const createPostSchema = z.object({
  original: z.string().openapi({
    example: 'これは投稿の原文です．技育博に向けてブラッシュアップを頑張りましょう．',
    description: '原文',
  }),
  image: z
    .custom((val) => val === null || val instanceof Blob || val == '')
    .optional()
    .openapi({
      type: 'string',
      format: 'binary',
      description: '添付画像ファイル',
    }),
  user_id: z.string().openapi({
    example: '5e622fe0-4dcd-11f0-8c6b-0242ac130003',
    description: 'ユーザーID (36文字のUUID形式)',
  }),
});

// レスポンスの型
export const createPostResponseSchema = z.object({
  message: z.string(),
  tanka: z.array(z.string()),
});
