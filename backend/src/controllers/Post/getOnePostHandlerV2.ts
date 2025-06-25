import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { type IPostService } from '../../services/post/iPostService.js';
import { type IPostRepository } from '../../repositories/post/iPostRepository.js';
import { PostService } from '../../services/post/postService.js';
import { PostRepository } from '../../repositories/post/postRepository.js';
import { ImageService } from '../../services/image/imageService.js';
import { S3StorageService } from '../../services/storage/s3StorageService.js';
import type { IImageService } from '../../services/image/iImageService.js';
import type { IStorageService } from '../../services/storage/iStorageService.js';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import type { getOnePostRouteV2 } from '../../routes/Post/getOnePostRouteV2.js';
import { getOnePostSchema } from '../../schema/Post/getOnePostSchemaV2.js';

type getOnePostSchema = z.infer<typeof getOnePostSchema>;

const getOnePostHandlerV2: RouteHandler<typeof getOnePostRouteV2, {}> = async (c: Context) => {
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
  const postService: IPostService = new PostService(postRepository, imageService);

  try {
    // リクエストからデータを取得
    const { id, viewerId } = await c.req.json<getOnePostSchema>();

    const post = await postService.getOnePost({ id, viewerId });

    return c.json(
      {
        message: '投稿を取得しました．',
        post: post,
      },
      200
    );
  } catch (err: any) {
    return c.json({ message: err.message, statusCode: 500, error: 'Internal Server Error' }, 500);
  }
};

export default getOnePostHandlerV2;
