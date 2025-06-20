import type { CreateUserDTO, User } from '../../repositories/user/iUserRepository.js';

export interface IUserService {
  createUser(userDto: CreateUserDTO): Promise<User>;
}
