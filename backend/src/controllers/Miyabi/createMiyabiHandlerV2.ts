import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { type IMiyabiService } from '../../services/miyabi/iMiyabiService.js';
import { type IMiyabiRepository } from '../../repositories/miyabi/iMiyabiRepository.js';
import { type IPostRepository } from '../../repositories/post/iPostRepository.js';
import { PostRepository } from '../../repositories/post/postRepository.js';
import { type IUserRepository } from '../../repositories/user/iUserRepository.js';
import { UserRepository } from '../../repositories/user/userRepository.js';
import { MiyabiService } from '../../services/miyabi/miyabiService.js';
import { MiyabiRepository } from '../../repositories/miyabi/miyabiRepository.js';
import type { createMiyabiSchema } from '../../schema/Miyabi/createMiyabiSchemaV2.js';
import type { createMiyabiRouteV2 } from '../../routes/Miyabi/createMiyabiRouteV2.js';

type createMiyabiSchema = z.infer<typeof createMiyabiSchema>;

const createMiyabiHandlerV2: RouteHandler<typeof createMiyabiRouteV2, {}> = async (c: Context) => {
  const miyabiRepository: IMiyabiRepository = new MiyabiRepository();
  const postRepository: IPostRepository = new PostRepository();
  const userRepository: IUserRepository = new UserRepository();
  const miyabiService: IMiyabiService = new MiyabiService(
    miyabiRepository,
    postRepository,
    userRepository
  );

  try {
    // リクエストからデータを取得
    const { user_id, post_id } = await c.req.json<createMiyabiSchema>();

    // サービスを呼び出す
    const result = await miyabiService.createMiyabi({ user_id, post_id });

    // 成功レスポンスを返す
    return c.json(result, 200);
  } catch (err: any) {
    // エラーレスポンスを返す
    if (err.message === '投稿が見つかりません．' || 'ユーザーが見つかりません．') {
      return c.json({ message: err.message, statusCode: 404, error: 'Not Found' }, 404);
    }
    console.error('[createMiyabiHandlerV2] エラーが発生しました．', err);
    return c.json(
      {
        message: err.message || '雅作成処理中に不明なエラーが発生しました．',
        statusCode: 500,
        error: 'Internal Server Error',
      },
      500
    );
  }
};

export default createMiyabiHandlerV2;
