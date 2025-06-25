import type { z } from '@hono/zod-openapi';
import type { createPostSchema } from '../../schema/Post/createPostSchemaV2.js';
import type { deletePostSchema } from '../../schema/Post/deletePostSchemaV2.js';
import type { getPostSchema } from '../../schema/Post/getPostSchemaV2.js';
import type { getOnePostSchema } from '../../schema/Post/getOnePostSchemaV2.js';
import type { Post } from '../../repositories/post/iPostRepository.js';

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type DeletePostDTO = z.infer<typeof deletePostSchema>;
export type GetPostDTO = z.infer<typeof getPostSchema>;
export type GetOnePostDTO = z.infer<typeof getOnePostSchema>;

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
  getPost(getPostDto: GetPostDTO): Promise<Post[]>;
  getOnePost(getOnePostDto: GetOnePostDTO): Promise<Post>;
}
