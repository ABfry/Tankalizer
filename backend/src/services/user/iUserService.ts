import type { z } from '@hono/zod-openapi';
import type { User } from '../../repositories/user/iUserRepository.js';
import type { createUserSchema } from '../../schema/User/createUserSchemaV2.js';

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export type CreateUserResponseType = 'created' | 'existing' | 'migrated';

export interface CreateUserResponse {
  user: User;
  type: CreateUserResponseType;
}

export interface IUserService {
  createUser(userDto: CreateUserDTO): Promise<CreateUserResponse>;
}
