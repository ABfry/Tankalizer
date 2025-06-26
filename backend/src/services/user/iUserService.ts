import type { z } from '@hono/zod-openapi';
import type { User } from '../../repositories/user/iUserRepository.js';
import type { createUserSchema } from '../../schema/User/createUserSchemaV2.js';

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export interface IUserService {
  createUser(userDto: CreateUserDTO): Promise<User>;
}
