import type { z } from '@hono/zod-openapi';
import type { getProfileSchema } from '../../schema/Profile/getProfileSchemaV2.js';
import type { updateProfileSchema } from '../../schema/Profile/updateProfileSchemaV2.js';
import type { Profile } from '../../repositories/profile/iProfileRepository.js';

export type GetProfileDTO = z.infer<typeof getProfileSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export class NotFoundError extends Error {
  constructor(message: 'ユーザーが見つかりません．') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export interface IProfileService {
  getProfile(getProfileDto: GetProfileDTO): Promise<Profile>;
  updateProfile(updateProfileDto: UpdateProfileDTO): Promise<Profile>;
}
