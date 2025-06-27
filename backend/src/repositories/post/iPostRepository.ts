export type CreatePostRepoDTO = {
  original: string;
  tanka: string[];
  image_path?: string | null;
  user_id: string;
};

export type GetPostRepoDTO = {
  limit: number;
  cursor?: string | null;
  filterByUserId?: string | null;
  viewerId?: string | null;
};

export type Post = {
  id: string;
  original: string;
  tanka: string[];
  image_path: string | null;
  created_at: Date;
  user_id: string;
  user_name: string;
  user_icon: string;
  miyabi_count: number;
  is_miyabi: boolean;
};

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  create(user: CreatePostRepoDTO): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
  getPost(dto: GetPostRepoDTO): Promise<Post[]>;
  getOnePost(id: string, viewerId?: string): Promise<Post>;
}
