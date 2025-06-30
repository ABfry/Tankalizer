import type { z } from '@hono/zod-openapi';
import type { getProfileSchema } from '../../schema/Profile/getProfileSchemaV2.js';
import type { Profile } from '../../repositories/profile/iProfileRepository.js';

export type GetProfileDTO = z.infer<typeof getProfileSchema>;

export class NotFoundError extends Error {
  constructor(message: 'ユーザーが見つかりません．') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export interface IProfileService {
  getProfile(getProfileDto: GetProfileDTO): Promise<Profile>;
}
