import type { z } from '@hono/zod-openapi';
import type { createPostSchema } from '../../schema/Post/createPostSchemaV2.js';
import type { deletePostSchema } from '../../schema/Post/deletePostSchemaV2.js';
import type { getPostSchema } from '../../schema/Post/getPostSchemaV2.js';
import type { getOnePostSchema } from '../../schema/Post/getOnePostSchemaV2.js';
import type { getFollowingPostSchema } from '../../schema/Post/getFollowingPostSchemaV2.js';
import type { Post } from '../../repositories/post/iPostRepository.js';

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type DeletePostDTO = z.infer<typeof deletePostSchema>;
export type GetPostDTO = z.infer<typeof getPostSchema>;
export type GetOnePostDTO = z.infer<typeof getOnePostSchema>;
export type GetFollowingPostDTO = z.infer<typeof getFollowingPostSchema>;

export type CreatePostResult = {
  message: string;
  tanka: string[];
};

export type DeletePostResult = {
  message: string;
};

export class NotFoundError extends Error {
  constructor(message: '投稿が見つかりません．' | 'ユーザーが見つかりません．') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export interface IPostService {
  createPost(postDto: CreatePostDTO): Promise<CreatePostResult>;
  deletePost(deletePostDto: DeletePostDTO): Promise<DeletePostResult>;
  getPost(getPostDto: GetPostDTO): Promise<Post[]>;
  getOnePost(getOnePostDto: GetOnePostDTO): Promise<Post>;
  getFollowingPost(getFollowingPostDto: GetFollowingPostDTO): Promise<Post[]>;
}
