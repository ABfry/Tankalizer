import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  getProfileSchema,
  getProfileResponseSchema,
} from '../../schema/Profile/getProfileSchemaV2.js';

type getProfileSchema = z.infer<typeof getProfileSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const getProfileRouteV2 = createRoute({
  method: 'post',
  path: '/v2/profile',
  tags: ['Profile V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: getProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getProfileResponseSchema,
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

export type getProfileRouteResponse200 = z.infer<
  (typeof getProfileRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type getProfileRouteResponse404 = z.infer<
  (typeof getProfileRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type getProfileRouteResponse500 = z.infer<
  (typeof getProfileRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type getProfileRouteResponseError = z.infer<typeof ErrorResponseSchema>;
