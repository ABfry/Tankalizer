import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { getPostSchema, getPostResponseSchema } from '../../schema/Post/getPostSchemaV2.js';

type getPostSchema = z.infer<typeof getPostSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getPostRouteV2 = createRoute({
  method: 'post',
  path: '/v2/timeline',
  tags: ['Post V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getPostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getPostResponseSchema,
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

export type getPostRouteResponse200 = z.infer<
  (typeof getPostRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getPostRouteResponse404 = z.infer<
  (typeof getPostRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type getPostRouteResponse500 = z.infer<
  (typeof getPostRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getPostRouteResponseError = z.infer<typeof ErrorResponseSchema>;
