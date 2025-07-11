import type { z } from '@hono/zod-openapi';
import type { getProfileSchema } from '../../schema/Profile/getProfileSchemaV2.js';
import type { updateProfileSchema } from '../../schema/Profile/updateProfileSchemaV2.js';
import type { getFollowingUserSchema } from '../../schema/Profile/getFollowingUserSchemaV2.js';
import type { getMutualFollowingUserSchema } from '../../schema/Profile/getMutualFollowingUserSchemaV2.js';
import type { Profile } from '../../repositories/profile/iProfileRepository.js';

export type GetProfileDTO = z.infer<typeof getProfileSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type GetFollowingUserDTO = z.infer<typeof getFollowingUserSchema>;
export type GetMutualFollowingUserDTO = z.infer<typeof getMutualFollowingUserSchema>;

export class NotFoundError extends Error {
  constructor(message: 'ユーザーが見つかりません．') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export interface IProfileService {
  getProfile(getProfileDto: GetProfileDTO): Promise<Profile>;
  updateProfile(updateProfileDto: UpdateProfileDTO): Promise<Profile>;
  getFollowingUser(getFollowingUserDto: GetFollowingUserDTO): Promise<Profile[]>;
  getMutualFollowingUser(getMutualFollowingUserDto: GetMutualFollowingUserDTO): Promise<Profile[]>;
}
