export type CreatePostRepoDTO = {
  original: string;
  tanka: string[];
  image_path?: string | null;
  user_id: string;
};

export type Post = {
  id: string;
  original: string;
  tanka: object;
  image_path: string | null;
  created_at: Date;
  user_id: string;
  is_deleted: boolean;
};

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  create(user: CreatePostRepoDTO): Promise<void>;
}
