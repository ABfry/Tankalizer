import { z } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  updateProfileSchema,
  updateProfileResponseSchema,
} from '../../schema/Profile/updateProfileSchemaV2.js';

type updateProfileSchema = z.infer<typeof updateProfileSchema>;

const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string(),
});

export const updateProfileRouteV2 = createRoute({
  method: 'put',
  path: '/v2/profile',
  tags: ['Profile V2'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: updateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateProfileResponseSchema,
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

export type updateProfileRouteResponse200 = z.infer<
  (typeof updateProfileRouteV2.responses)['200']['content']['application/json']['schema']
>;

export type updateProfileRouteResponse404 = z.infer<
  (typeof updateProfileRouteV2.responses)['404']['content']['application/json']['schema']
>;

export type updateProfileRouteResponse500 = z.infer<
  (typeof updateProfileRouteV2.responses)['500']['content']['application/json']['schema']
>;

export type updateProfileRouteResponseError = z.infer<typeof ErrorResponseSchema>;
