import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  deletePostSchema,
  deletePostResponseSchema,
} from '../../schema/Post/deletePostSchemaV2.js';

type deletePostSchema = z.infer<typeof deletePostSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const deletePostRouteV2 = createRoute({
  method: 'delete',
  path: '/v2/post',
  tags: ['Post V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: deletePostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: deletePostResponseSchema,
        },
      },
      description: '投稿の削除が正常に完了しました．',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Forbidden',
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
      description: 'サーバー内部でエラーが発生しました．',
    },
  },
});

export type deletePostRouteResponse200 = z.infer<
  (typeof deletePostRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type deletePostRouteResponse400 = z.infer<
  (typeof deletePostRouteV2.responses)['400']['content']['application/json']['schema']
>;

export type deletePostRouteResponse500 = z.infer<
  (typeof deletePostRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type deletePostRouteResponseError = z.infer<typeof ErrorResponseSchema>;
