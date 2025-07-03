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
import type { getMiyabiRankingRouteV2 } from '../../routes/Miyabi/getMiyabiRankingRouteV2.js';
import { getMiyabiRankingSchema } from '../../schema/Miyabi/getMiyabiRankingSchemaV2.js';

type getMiyabiRankingSchema = z.infer<typeof getMiyabiRankingSchema>;

const getMiyabiRankingHandlerV2: RouteHandler<typeof getMiyabiRankingRouteV2, {}> = async (
  c: Context
) => {
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
    const { limit, viewerId } = await c.req.json<getMiyabiRankingSchema>();

    const ranked_posts = await miyabiService.getMiyabiRanking({ limit, viewerId });

    return c.json(
      {
        message: '雅ランキングを取得しました．',
        ranked_posts: ranked_posts,
      },
      200
    );
  } catch (err: any) {
    return c.json({ message: err.message, statusCode: 500, error: 'Internal Server Error' }, 500);
  }
};

export default getMiyabiRankingHandlerV2;
