import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  deleteMiyabiSchema,
  deleteMiyabiResponseSchema,
} from '../../schema/Miyabi/deleteMiyabiSchemaV2.js';

type deleteMiyabiSchema = z.infer<typeof deleteMiyabiSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const deleteMiyabiRouteV2 = createRoute({
  method: 'delete',
  path: '/v2/miyabi',
  tags: ['Miyabi V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: deleteMiyabiSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: deleteMiyabiResponseSchema,
        },
      },
      description: '雅の削除が正常に完了しました．',
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

export type deleteMiyabiRouteResponse200 = z.infer<
  (typeof deleteMiyabiRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type deleteMiyabiRouteResponse404 = z.infer<
  (typeof deleteMiyabiRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type deleteMiyabiRouteResponse500 = z.infer<
  (typeof deleteMiyabiRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type deleteMiyabiRouteResponseError = z.infer<typeof ErrorResponseSchema>;
