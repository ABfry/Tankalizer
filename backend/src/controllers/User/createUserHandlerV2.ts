import { type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { z } from 'zod';

import type { createUserRouteV2 } from '../../routes/User/createUserRouteV2.js';
import { type IUserService } from '../../services/user/iUserService.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserService } from '../../services/user/userService.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import type { CreateUserDTO } from '../../services/user/iUserService.js';

import { S3StorageService } from '../../services/storage/s3StorageService.js';
import type { IStorageService } from '../../services/storage/iStorageService.js';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import { IconService } from '../../services/icon/iconService.js';
import type { IIconService } from '../../services/icon/iIconService.js';

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
const userService: IUserService = new UserService(userRepository, iconService);

const createUserHandlerV2: RouteHandler<typeof createUserRouteV2, {}> = async (c: Context) => {
  try {
    // リクエストからデータを取得
    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const oauth_app = formData.get('oauth_app') as 'github' | 'google';
    const connect_info = formData.get('connect_info') as string;
    const profile_text = formData.get('profile_text') as string;
    const icon_url = formData.get('icon_url') as string;

    const userDto: CreateUserDTO = { name, oauth_app, connect_info, profile_text, icon_url };

    console.log('[Handler] /v2/user へのリクエストを受け付けました．', userDto);

    // ユーザー作成処理
    const createUserResponse = await userService.createUser(userDto);

    // ユーザーが既に作成済みの場合
    if (createUserResponse.type === 'existing') {
      return c.json(
        {
          message: 'ユーザーは既に作成済みです．',
          user: createUserResponse.user,
          type: createUserResponse.type,
        },
        200
      );
    }

    // 旧DBからの乗り換えが完了した場合
    if (createUserResponse.type === 'migrated') {
      return c.json(
        {
          message: '旧DBからの乗り換えが完了しました．',
          user: createUserResponse.user,
          type: createUserResponse.type,
        },
        200
      );
    }

    // 新規ユーザーの作成が完了した場合
    if (createUserResponse.type === 'created') {
      return c.json(
        {
          message: '新規ユーザーの作成が完了しました．',
          user: createUserResponse.user,
          type: createUserResponse.type,
        },
        200
      );
    }

    // typeが不明な場合
    return c.json(
      {
        message: '不明なエラーが発生しました．',
        statusCode: 500,
        error: 'Internal Server Error',
      },
      500
    );
  } catch (err: any) {
    // エラーハンドリング
    console.error('[Handler] ユーザー作成処理中にエラーが発生しました．', err);
    return c.json(
      {
        message: err.message,
        statusCode: 500,
        error: 'Internal Server Error',
      },
      500
    );
  }
};

export default createUserHandlerV2;
