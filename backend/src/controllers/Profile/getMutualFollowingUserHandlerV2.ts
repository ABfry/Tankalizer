import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { type IProfileService, NotFoundError } from '../../services/profile/iProfileService.js';
import { type IProfileRepository } from '../../repositories/profile/iProfileRepository.js';
import { ProfileService } from '../../services/profile/profileService.js';
import { ProfileRepository } from '../../repositories/profile/profileRepository.js';
import { S3StorageService } from '../../services/storage/s3StorageService.js';
import type { IStorageService } from '../../services/storage/iStorageService.js';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import type { getMutualFollowingUserRouteV2 } from '../../routes/Profile/getMutualFollowingUserRouteV2.js';
import { getMutualFollowingUserSchema } from '../../schema/Profile/getMutualFollowingUserSchemaV2.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import { IconService } from '../../services/icon/iconService.js';
import type { IIconService } from '../../services/icon/iIconService.js';

type getMutualFollowingUserSchema = z.infer<typeof getMutualFollowingUserSchema>;

const getMutualFollowingUserHandlerV2: RouteHandler<
  typeof getMutualFollowingUserRouteV2,
  {}
> = async (c: Context) => {
  const profileRepository: IProfileRepository = new ProfileRepository();
  const userRepository: IUserRepository = new UserRepository();
  // s3設定
  const s3Client = new S3Client({
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
  const storageService: IStorageService = new S3StorageService(s3Client, env.S3_BUCKET_NAME);
  const iconService: IIconService = new IconService(storageService);
  const profileService: IProfileService = new ProfileService(
    profileRepository,
    userRepository,
    iconService
  );

  try {
    // リクエストからデータを取得
    const { user_id, viewer_id, limit, cursor } = await c.req.json<getMutualFollowingUserSchema>();

    const profiles = await profileService.getMutualFollowingUser({
      user_id,
      viewer_id,
      limit,
      cursor,
    });

    return c.json(
      {
        message: '相互フォローしているユーザーを取得しました．',
        users: profiles,
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

export default getMutualFollowingUserHandlerV2;
