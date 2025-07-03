import { OpenAPIHono } from '@hono/zod-openapi';
import { helloRoute } from './helloRoute.js';
import helloWorldHandler from '../controllers/helloHandler.js';
import { createPostRoute } from './Post/createPostRoute.js';
import createPostHandler from '../controllers/Post/createPostHandler.js';
import { deletePostRoute } from './Post/deletePostRoute.js';
import deletePostHandler from '../controllers/Post/deletePostHandler.js';
import { getPostRoute } from './Post/getPostRoute.js';
import getPostHandler from '../controllers/Post/getPostHandler.js';
import { getOnePostRoute } from './Post/getOnePostRoute.js';
import getOnePostHandler from '../controllers/Post/getOnePostHandler.js';
import { createMiyabiRoute } from './Miyabi/createMiyabiRoute.js';
import createMiyabiHandler from '../controllers/Miyabi/createMiyabiHandler.js';
import { deleteMiyabiRoute } from './Miyabi/deleteMiyabiRoute.js';
import deleteMiyabiHandler from '../controllers/Miyabi/deleteMiyabiHandler.js';
import { getMiyabiRankingRoute } from './Miyabi/getMiyabiRankingRoute.js';
import getMiyabiRankingHandler from '../controllers/Miyabi/getMiyabiRankingHandler.js';
import { createUserRoute } from './User/createUserRoute.js';
import createUserHandler from '../controllers/User/createUserHandler.js';
import { getProfileRoute } from './Profile/getProfileRoute.js';
import getProfileHandler from '../controllers/Profile/getProfileHandler.js';
import { idiconConverterRoute } from './idiconConverterRoute.js';
import idiconConverterHandler from '../controllers/idiconConverterHandler.js';
import { isOurAccountRoute } from './isOurAccountRoute.js';
import isOurAccountHandler from '../controllers/isOurAccountHandler.js';
import { sampleS3UploadRoute } from './sampleS3Route.js';
import sampleS3UploadHandler from '../controllers/sampleS3UploadHandler.js';
import { sampleS3DownloadRoute } from './sampleS3Route.js';
import sampleS3DownloadHandler from '../controllers/sampleS3DownloadHandler.js';
import { sampleGeminiRoute } from './Sample/sampleGeminiRoute.js';
import sampleGeminiHandler from '../controllers/Sample/sampleGeminiHandler.js';
import { newsTankaRoute } from './News/newsTankaRoute.js';
import newsTankaHandler from '../controllers/News/newsTankaHandler.js';
import { createUserRouteV2 } from './User/createUserRouteV2.js';
import createUserHandlerV2 from '../controllers/User/createUserHandlerV2.js';
import { createPostRouteV2 } from './Post/createPostRouteV2.js';
import createPostHandlerV2 from '../controllers/Post/createPostHandlerV2.js';
import { deletePostRouteV2 } from './Post/deletePostRouteV2.js';
import deletePostHandlerV2 from '../controllers/Post/deletePostHandlerV2.js';
import { getPostRouteV2 } from './Post/getPostRouteV2.js';
import getPostHandlerV2 from '../controllers/Post/getPostHandlerV2.js';
import { getOnePostRouteV2 } from './Post/getOnePostRouteV2.js';
import getOnePostHandlerV2 from '../controllers/Post/getOnePostHandlerV2.js';
import { createMiyabiRouteV2 } from './Miyabi/createMiyabiRouteV2.js';
import createMiyabiHandlerV2 from '../controllers/Miyabi/createMiyabiHandlerV2.js';
import { deleteMiyabiRouteV2 } from './Miyabi/deleteMiyabiRouteV2.js';
import deleteMiyabiHandlerV2 from '../controllers/Miyabi/deleteMiyabiHandlerV2.js';
import { getProfileRouteV2 } from './Profile/getProfileRouteV2.js';
import getProfileHandlerV2 from '../controllers/Profile/getProfileHandlerV2.js';
import { updateProfileRouteV2 } from './Profile/updateProfileRouteV2.js';
import updateProfileHandlerV2 from '../controllers/Profile/updateProfileHandlerV2.js';
import { getFollowingUserRouteV2 } from './Profile/getFollowingUserRouteV2.js';
import getFollowingUserHandlerV2 from '../controllers/Profile/getFollowingUserHandlerV2.js';
import { getMutualFollowingUserRouteV2 } from './Profile/getMutualFollowingUserRouteV2.js';
import getMutualFollowingUserHandlerV2 from '../controllers/Profile/getMutualFollowingUserHandlerV2.js';

const router = new OpenAPIHono();

export default router
  .openapi(helloRoute, helloWorldHandler)
  .openapi(createPostRoute, createPostHandler)
  .openapi(deletePostRoute, deletePostHandler)
  .openapi(getPostRoute, getPostHandler)
  .openapi(getOnePostRoute, getOnePostHandler)
  .openapi(createMiyabiRoute, createMiyabiHandler)
  .openapi(deleteMiyabiRoute, deleteMiyabiHandler)
  .openapi(getMiyabiRankingRoute, getMiyabiRankingHandler)
  .openapi(createUserRoute, createUserHandler)
  .openapi(getProfileRoute, getProfileHandler)
  .openapi(idiconConverterRoute, idiconConverterHandler)
  .openapi(isOurAccountRoute, isOurAccountHandler)
  .openapi(sampleS3UploadRoute, sampleS3UploadHandler)
  .openapi(sampleS3DownloadRoute, sampleS3DownloadHandler)
  .openapi(sampleGeminiRoute, sampleGeminiHandler)
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
  .openapi(getFollowingUserRouteV2, getFollowingUserHandlerV2)
  .openapi(getMutualFollowingUserRouteV2, getMutualFollowingUserHandlerV2);
// .openapi(helloRoute, helloWorldHandler); //こういう感じで足していく
