import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppEnv } from '../di/container.js';
import followHandler from '../controllers/Follow/followHandler.js';
import unfollowHandler from '../controllers/Follow/unfollowHandler.js';
import createMiyabiHandlerV2 from '../controllers/Miyabi/createMiyabiHandlerV2.js';
import deleteMiyabiHandlerV2 from '../controllers/Miyabi/deleteMiyabiHandlerV2.js';
import getMiyabiRankingHandlerV2 from '../controllers/Miyabi/getMiyabiRankingHandlerV2.js';
import newsTankaHandler from '../controllers/News/newsTankaHandler.js';
import createPostHandlerV2 from '../controllers/Post/createPostHandlerV2.js';
import deletePostHandlerV2 from '../controllers/Post/deletePostHandlerV2.js';
import getFollowingPostHandlerV2 from '../controllers/Post/getFollowingPostHandlerV2.js';
import getOnePostHandlerV2 from '../controllers/Post/getOnePostHandlerV2.js';
import getPostHandlerV2 from '../controllers/Post/getPostHandlerV2.js';
import getFollowingUserHandlerV2 from '../controllers/Profile/getFollowingUserHandlerV2.js';
import getMutualFollowingUserHandlerV2 from '../controllers/Profile/getMutualFollowingUserHandlerV2.js';
import getProfileHandlerV2 from '../controllers/Profile/getProfileHandlerV2.js';
import updateProfileHandlerV2 from '../controllers/Profile/updateProfileHandlerV2.js';
import createUserHandlerV2 from '../controllers/User/createUserHandlerV2.js';
import { followRoute } from './Follow/followRoute.js';
import { unfollowRoute } from './Follow/unfollowRoute.js';
import { createMiyabiRouteV2 } from './Miyabi/createMiyabiRouteV2.js';
import { deleteMiyabiRouteV2 } from './Miyabi/deleteMiyabiRouteV2.js';
import { getMiyabiRankingRouteV2 } from './Miyabi/getMiyabiRankingRouteV2.js';
import { newsTankaRoute } from './News/newsTankaRoute.js';
import { createPostRouteV2 } from './Post/createPostRouteV2.js';
import { deletePostRouteV2 } from './Post/deletePostRouteV2.js';
import { getFollowingPostRouteV2 } from './Post/getFollowingPostRouteV2.js';
import { getOnePostRouteV2 } from './Post/getOnePostRouteV2.js';
import { getPostRouteV2 } from './Post/getPostRouteV2.js';
import { getFollowingUserRouteV2 } from './Profile/getFollowingUserRouteV2.js';
import { getMutualFollowingUserRouteV2 } from './Profile/getMutualFollowingUserRouteV2.js';
import { getProfileRouteV2 } from './Profile/getProfileRouteV2.js';
import { updateProfileRouteV2 } from './Profile/updateProfileRouteV2.js';
import { createUserRouteV2 } from './User/createUserRouteV2.js';

// zod 4 の ZodError は JSON にすると issues が message（文字列）に潰れるため、
// zod 3 のときと同じ { success: false, error: { issues, name } } の形で 400 を返す。
const router = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: { issues: result.error.issues, name: result.error.name } },
        400
      );
    }
  },
});

export default router
  .openapi(newsTankaRoute, newsTankaHandler)
  .openapi(createUserRouteV2, createUserHandlerV2)
  .openapi(createPostRouteV2, createPostHandlerV2)
  .openapi(deletePostRouteV2, deletePostHandlerV2)
  .openapi(getPostRouteV2, getPostHandlerV2)
  .openapi(getOnePostRouteV2, getOnePostHandlerV2)
  .openapi(createMiyabiRouteV2, createMiyabiHandlerV2)
  .openapi(deleteMiyabiRouteV2, deleteMiyabiHandlerV2)
  .openapi(getProfileRouteV2, getProfileHandlerV2)
  .openapi(updateProfileRouteV2, updateProfileHandlerV2)
  .openapi(followRoute, followHandler)
  .openapi(unfollowRoute, unfollowHandler)
  .openapi(getFollowingUserRouteV2, getFollowingUserHandlerV2)
  .openapi(getMutualFollowingUserRouteV2, getMutualFollowingUserHandlerV2)
  .openapi(getFollowingPostRouteV2, getFollowingPostHandlerV2)
  .openapi(getMiyabiRankingRouteV2, getMiyabiRankingHandlerV2);
