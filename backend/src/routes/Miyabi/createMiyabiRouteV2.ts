import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  createMiyabiSchema,
  createMiyabiResponseSchema,
} from '../../schema/Miyabi/createMiyabiSchemaV2.js';

type createMiyabiSchema = z.infer<typeof createMiyabiSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const createMiyabiRouteV2 = createRoute({
  method: 'post',
  path: '/v2/miyabi',
  tags: ['Miyabi V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: createMiyabiSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createMiyabiResponseSchema,
        },
      },
      description: '雅の作成が正常に完了しました．',
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

export type createMiyabiRouteResponse200 = z.infer<
  (typeof createMiyabiRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type createMiyabiRouteResponse404 = z.infer<
  (typeof createMiyabiRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type createMiyabiRouteResponse500 = z.infer<
  (typeof createMiyabiRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type createMiyabiRouteResponseError = z.infer<typeof ErrorResponseSchema>;
