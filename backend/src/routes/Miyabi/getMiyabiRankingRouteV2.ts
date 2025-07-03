import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  getMiyabiRankingSchema,
  getMiyabiRankingResponseSchema,
} from '../../schema/Miyabi/getMiyabiRankingSchemaV2.js';

type getMiyabiRankingSchema = z.infer<typeof getMiyabiRankingSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getMiyabiRankingRouteV2 = createRoute({
  method: 'post',
  path: '/v2/miyabiranking',
  tags: ['MiyabiRanking V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getMiyabiRankingSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getMiyabiRankingResponseSchema,
        },
      },
      description: 'Successful response',
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

export type getMiyabiRankingRouteResponse200 = z.infer<
  (typeof getMiyabiRankingRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getMiyabiRankingRouteResponse500 = z.infer<
  (typeof getMiyabiRankingRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getMiyabiRankingRouteResponseError = z.infer<typeof ErrorResponseSchema>;
