import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { type IPostService, NotFoundError } from '../../services/post/iPostService.js';
import { type IPostRepository } from '../../repositories/post/iPostRepository.js';
import { PostService } from '../../services/post/postService.js';
import { PostRepository } from '../../repositories/post/postRepository.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import { ImageService } from '../../services/image/imageService.js';
import { S3StorageService } from '../../services/storage/s3StorageService.js';
import type { IImageService } from '../../services/image/iImageService.js';
import type { IStorageService } from '../../services/storage/iStorageService.js';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import type { getFollowingPostRouteV2 } from '../../routes/Post/getFollowingPostRouteV2.js';
import { getFollowingPostSchema } from '../../schema/Post/getFollowingPostSchemaV2.js';

type getFollowingPostSchema = z.infer<typeof getFollowingPostSchema>;

const getFollowingPostHandlerV2: RouteHandler<typeof getFollowingPostRouteV2, {}> = async (
  c: Context
) => {
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
    const { limit, cursor, viewerId } = await c.req.json<getFollowingPostSchema>();

    const posts = await postService.getFollowingPost({ limit, cursor, viewerId });

    return c.json(
      {
        message: '投稿を取得しました．',
        posts: posts,
      },
      200
    );
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return c.json({ message: err.message, statusCode: 404, error: 'Not Found' }, 404);
    }
    return c.json({ message: err.message, statusCode: 500, error: 'Internal Server Error' }, 500);
  }
};

export default getFollowingPostHandlerV2;
