export type Profile = {
  user_id: string;
  user_name: string;
  icon_url: string;
  created_at: Date;
  total_miyabi: number;
  total_post: number;
  following_count: number;
  follower_count: number;
  is_following: boolean;
};

export interface IProfileRepository {
  getProfile(user_id: string, viewer_id?: string): Promise<Profile>;
}
