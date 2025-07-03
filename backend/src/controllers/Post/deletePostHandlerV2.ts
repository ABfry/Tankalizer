import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { type IPostService } from '../../services/post/iPostService.js';
import { type IPostRepository } from '../../repositories/post/iPostRepository.js';
import { PostService } from '../../services/post/postService.js';
import { PostRepository } from '../../repositories/post/postRepository.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import type { IImageService } from '../../services/image/iImageService.js';
import type { IStorageService } from '../../services/storage/iStorageService.js';
import { ImageService } from '../../services/image/imageService.js';
import { S3StorageService } from '../../services/storage/s3StorageService.js';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import type { deletePostRouteV2 } from '../../routes/Post/deletePostRouteV2.js';
import { deletePostSchema } from '../../schema/Post/deletePostSchemaV2.js';

type deletePostSchema = z.infer<typeof deletePostSchema>;

const deletePostHandlerV2: RouteHandler<typeof deletePostRouteV2, {}> = async (c: Context) => {
  const postRepository = new PostRepository();
  // s3設定
  const s3Client = new S3Client({
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
  const storageService: IStorageService = new S3StorageService(s3Client, env.S3_BUCKET_NAME);
  const imageService: IImageService = new ImageService(storageService);
  const userRepository: IUserRepository = new UserRepository();
  const postService: IPostService = new PostService(postRepository, imageService, userRepository);

  try {
    // リクエストからデータを取得
    const { post_id, user_id } = await c.req.json<deletePostSchema>();

    // サービスを呼び出す
    const result = await postService.deletePost({ post_id, user_id });

    // 成功レスポンスを返す
    return c.json(result, 200);
  } catch (err: any) {
    // エラーレスポンスを返す
    if (err.message === '投稿が見つかりません．') {
      return c.json({ message: err.message, statusCode: 404, error: 'Not Found' }, 404);
    }
    if (err.message === '許可がありません．') {
      return c.json({ message: err.message, statusCode: 403, error: 'Forbidden' }, 403);
    }
    console.error('[deletePostHandlerV2] エラーが発生しました．', err);
    return c.json(
      {
        message: err.message || '投稿削除処理中に不明なエラーが発生しました．',
        statusCode: 500,
        error: 'Internal Server Error',
      },
      500
    );
  }
};

export default deletePostHandlerV2;
