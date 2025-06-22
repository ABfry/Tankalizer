import type { z } from '@hono/zod-openapi';
import type { createPostSchema } from '../../schema/Post/createPostSchemaV2.js';
import type { deletePostSchema } from '../../schema/Post/deletePostSchemaV2.js';

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type DeletePostDTO = z.infer<typeof deletePostSchema>;

export type CreatePostResult = {
  message: string;
  tanka: string[];
};

export type DeletePostResult = {
  message: string;
};

export interface IPostService {
  createPost(postDto: CreatePostDTO): Promise<CreatePostResult>;
  deletePost(deletePostDto: DeletePostDTO): Promise<DeletePostResult>;
}
