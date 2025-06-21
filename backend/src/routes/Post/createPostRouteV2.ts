import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  createPostSchema,
  createPostResponseSchema,
} from '../../schema/Post/createPostSchemaV2.js';

type createPostSchema = z.infer<typeof createPostSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const createPostRouteV2 = createRoute({
  method: 'post',
  path: '/v2/post',
  tags: ['Post V2'],
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: createPostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createPostResponseSchema,
        },
      },
      description: '投稿の作成が正常に完了しました．',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'リクエストが不正です．',
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

export type createPostRouteResponse200 = z.infer<
  (typeof createPostRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type createPostRouteResponse400 = z.infer<
  (typeof createPostRouteV2.responses)['400']['content']['application/json']['schema']
>;

export type createPostRouteResponse500 = z.infer<
  (typeof createPostRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type createPostRouteResponseError = z.infer<typeof ErrorResponseSchema>;
