import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  createUserSchema,
  createUserResponseSchema,
} from '../../schema/User/createUserSchemaV2.js';

type createUserSchema = z.infer<typeof createUserSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const createUserRouteV2 = createRoute({
  method: 'post',
  path: '/v2/user',
  tags: ['User v2'],
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createUserResponseSchema,
        },
      },
      description: 'ユーザーの作成または情報取得が正常に完了しました．',
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

export type createUserRouteResponse200 = z.infer<
  (typeof createUserRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type createUserRouteResponse500 = z.infer<
  (typeof createUserRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type createUserRouteResponseError = z.infer<typeof ErrorResponseSchema>;
