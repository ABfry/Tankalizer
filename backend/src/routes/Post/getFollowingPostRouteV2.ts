import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  getFollowingPostSchema,
  getFollowingPostResponseSchema,
} from '../../schema/Post/getFollowingPostSchemaV2.js';

type getFollowingPostSchema = z.infer<typeof getFollowingPostSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getFollowingPostRouteV2 = createRoute({
  method: 'post',
  path: '/v2/timeline/following',
  tags: ['Post V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getFollowingPostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getFollowingPostResponseSchema,
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

export type getFollowingPostRouteResponse200 = z.infer<
  (typeof getFollowingPostRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getFollowingPostRouteResponse404 = z.infer<
  (typeof getFollowingPostRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type getFollowingPostRouteResponse500 = z.infer<
  (typeof getFollowingPostRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getFollowingPostRouteResponseError = z.infer<typeof ErrorResponseSchema>;
