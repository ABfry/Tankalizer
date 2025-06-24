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
import type { getPostRouteV2 } from '../../routes/Post/getPostRouteV2.js';
import { getPostSchema } from '../../schema/Post/getPostSchemaV2.js';

type getPostSchema = z.infer<typeof getPostSchema>;

const getPostHandlerV2: RouteHandler<typeof getPostRouteV2, {}> = async (c: Context) => {
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
    const { limit, cursor, filterByUserId, viewerId } = await c.req.json<getPostSchema>();

    const posts = await postService.getPost({ limit, cursor, filterByUserId, viewerId });

    return c.json(
      {
        message: '投稿を取得しました．',
        posts: posts,
      },
      200
    );
  } catch (err: any) {
    return c.json({ message: err.message, statusCode: 500, error: 'Internal Server Error' }, 500);
  }
};

export default getPostHandlerV2;
