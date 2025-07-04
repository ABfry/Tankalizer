import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  getOnePostSchema,
  getOnePostResponseSchema,
} from '../../schema/Post/getOnePostSchemaV2.js';

type getOnePostSchema = z.infer<typeof getOnePostSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getOnePostRouteV2 = createRoute({
  method: 'post',
  path: '/v2/share',
  tags: ['Post V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getOnePostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getOnePostResponseSchema,
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

export type getOnePostRouteResponse200 = z.infer<
  (typeof getOnePostRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getOnePostRouteResponse404 = z.infer<
  (typeof getOnePostRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type getOnePostRouteResponse500 = z.infer<
  (typeof getOnePostRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getOnePostRouteResponseError = z.infer<typeof ErrorResponseSchema>;
