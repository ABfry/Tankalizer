export type Profile = {
  user_id: string;
  user_name: string;
  profile_text: string;
  icon_url: string;
  created_at: Date;
  is_developer: boolean;
  total_miyabi: number;
  total_post: number;
  following_count: number;
  follower_count: number;
  is_following: boolean;
};

export type UpdateProfileRepoDTO = {
  user_id: string;
  user_name: string;
  profile_text: string;
  image_path: string;
};

export type GetFollowingUserRepoDto = {
  user_id: string;
  viewer_id?: string;
  limit: number;
  cursor?: string;
};

export interface IProfileRepository {
  getProfile(user_id: string, viewer_id?: string): Promise<Profile>;
  updateProfile(updateProfileRepoDTO: UpdateProfileRepoDTO): Promise<void>;
  getFollowingUser(getFollowingUserRepoDto: GetFollowingUserRepoDto): Promise<Profile[]>;
}
