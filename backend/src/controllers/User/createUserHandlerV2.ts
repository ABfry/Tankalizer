import { type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { z } from 'zod';

import type { createUserRouteV2 } from '../../routes/User/createUserRouteV2.js';
import { type IUserService } from '../../services/user/iUserService.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserService } from '../../services/user/userService.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import { createUserSchema } from '../../schema/User/createUserSchemaV2.js';

const userRepository: IUserRepository = new UserRepository();
const userService: IUserService = new UserService(userRepository);

// zod-openapiのスキーマから，TypeScriptの型を推論
type createUserSchema = z.infer<typeof createUserSchema>;

const createUserHandlerV2: RouteHandler<typeof createUserRouteV2, {}> = async (c: Context) => {
  try {
    // リクエストボディを取得し，スキーマでバリデーション
    const userDto = await c.req.json<createUserSchema>();
    console.log('[Handler] /v2/user へのリクエストを受け付けました．', userDto);

    // DBに新規作成・既に存在するユーザー情報を受け取る
    const user = await userService.createUser(userDto);

    // 成功レスポンスを返す
    console.log(`[Handler] ユーザー作成処理が正常に完了しました．(userId: ${user.id})`);
    return c.json(
      {
        message: 'ユーザー作成処理が正常に完了しました．',
        user: {
          id: user.id,
          name: user.name,
          icon_url: user.icon_url,
        },
      },
      200
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
