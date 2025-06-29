import type { z } from '@hono/zod-openapi';
import type { getProfileSchema } from '../../schema/Profile/getProfileSchema.js';
import type { Profile } from '../../repositories/profile/iProfileRepository.js';

export type GetProfileDTO = z.infer<typeof getProfileSchema>;

export interface IProfileService {
  getProfile(getProfileDto: GetProfileDTO): Promise<Profile>;
}
