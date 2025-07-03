import { z } from 'zod';

// フォロー関連のスキーマ定義
// リクエスト、レスポンスの形式を定義

// フォロー・フォロー解除APIのリクエスト形式
export const followRequestSchema = z.object({
  followerId: z.string().uuid('フォローするユーザーIDが正しくありません'), // フォローする人のID
  followeeId: z.string().uuid('フォローされるユーザーIDが正しくありません'), // フォローされる人のID
});

// フォロー・フォロー解除APIのレスポンス形式
export const followResponseSchema = z.object({
  message: z.string(), // 処理結果のメッセージ
});

// TypeScript型定義（Zodスキーマから自動生成）
export type FollowRequest = z.infer<typeof followRequestSchema>;
export type FollowResponse = z.infer<typeof followResponseSchema>;
