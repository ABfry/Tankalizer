import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { createPostRouteV2 } from '../../routes/Post/createPostRouteV2.js';
import { type IPostService } from '../../services/post/iPostService.js';
import { type IPostRepository } from '../../repositories/post/iPostRepository.js';
import { PostService } from '../../services/post/postService.js';
import { PostRepository } from '../../repositories/post/postRepository.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import type { CreatePostDTO } from '../../services/post/iPostService.js';
import { ImageService } from '../../services/image/imageService.js';
import { S3StorageService } from '../../services/storage/s3StorageService.js';
import type { IImageService } from '../../services/image/iImageService.js';
import type { IStorageService } from '../../services/storage/iStorageService.js';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';

const createPostHandlerV2: RouteHandler<typeof createPostRouteV2, {}> = async (c: Context) => {
  const postRepository: IPostRepository = new PostRepository();
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
    const formData = await c.req.formData();
    const original = formData.get('original') as string;
    const image = (formData.get('image') as File) || null; // 画像がない場合はnull
    const user_id = formData.get('user_id') as string;

    // バリデーション
    if (!original || !user_id) {
      return c.json(
        { message: 'originalとuser_idは必須です．', statusCode: 400, error: 'Bad Request' },
        400
      );
    }

    // DTOにデータを詰める
    const postDto: CreatePostDTO = {
      original,
      image,
      user_id,
    };

    // サービスを呼び出す
    const result = await postService.createPost(postDto);

    // 成功レスポンスを返す
    return c.json(result, 200);
  } catch (err: any) {
    // エラーレスポンスを返す
    console.error('[createPostHandlerV2] エラーが発生しました．', err);
    return c.json(
      {
        message: err.message || '投稿処理中に不明なエラーが発生しました．',
        statusCode: 500,
        error: 'Internal Server Error',
      },
      500
    );
  }
};

export default createPostHandlerV2;
