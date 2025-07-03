import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  getFollowingUserSchema,
  getFollowingUserResponseSchema,
} from '../../schema/Profile/getFollowingUserSchemaV2.js';

type getFollowingUserSchema = z.infer<typeof getFollowingUserSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getFollowingUserRouteV2 = createRoute({
  method: 'post',
  path: '/v2/profile/following',
  tags: ['Profile V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getFollowingUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getFollowingUserResponseSchema,
        },
      },
      description: 'Successful response',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Not Found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Internal Server Error response',
    },
  },
});

export type getFollowingUserRouteResponse200 = z.infer<
  (typeof getFollowingUserRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getFollowingUserRouteResponse404 = z.infer<
  (typeof getFollowingUserRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type getFollowingUserRouteResponse500 = z.infer<
  (typeof getFollowingUserRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getFollowingUserRouteResponseError = z.infer<typeof ErrorResponseSchema>;
