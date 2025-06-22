import type { z } from '@hono/zod-openapi';
import type { createPostSchema } from '../../schema/Post/createPostSchemaV2.js';

export type CreatePostDTO = z.infer<typeof createPostSchema>;

export type CreatePostResult = {
  message: string;
  tanka: string[];
};

export interface IPostService {
  createPost(postDto: CreatePostDTO): Promise<CreatePostResult>;
}
