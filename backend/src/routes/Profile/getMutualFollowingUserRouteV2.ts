import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  getMutualFollowingUserSchema,
  getMutualFollowingUserResponseSchema,
} from '../../schema/Profile/getMutualFollowingUserSchemaV2.js';

type getMutualFollowingUserSchema = z.infer<typeof getMutualFollowingUserSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getMutualFollowingUserRouteV2 = createRoute({
  method: 'post',
  path: '/v2/profile/mutual-following',
  tags: ['Profile V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getMutualFollowingUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getMutualFollowingUserResponseSchema,
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

export type getMutualFollowingUserRouteResponse200 = z.infer<
  (typeof getMutualFollowingUserRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getMutualFollowingUserRouteResponse404 = z.infer<
  (typeof getMutualFollowingUserRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type getMutualFollowingUserRouteResponse500 = z.infer<
  (typeof getMutualFollowingUserRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getMutualFollowingUserRouteResponseError = z.infer<typeof ErrorResponseSchema>;
