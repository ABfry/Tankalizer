export type CreateUserDTO = {
  name: string;
  oauth_app: 'github' | 'google';
  connect_info: string;
  profile_text?: string;
  icon_url: string;
};

export type User = {
  id: string;
  name: string;
  oauth_app: 'github' | 'google';
  connect_info: string;
  profile_text: string | null;
  icon_url: string;
  created_at: Date;
};

export interface IUserRepository {
  findByEmail(connect_info: string): Promise<User | null>;
  create(user: CreateUserDTO): Promise<void>;
}
