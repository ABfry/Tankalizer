export type Miyabi = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
};

export interface IMiyabiRepository {
  findMiyabi(userId: string, postId: string): Promise<Miyabi | null>;
  create(userId: string, postId: string): Promise<void>;
  delete(userId: string, postId: string): Promise<void>;
}
