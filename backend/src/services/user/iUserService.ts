import type { CreateUserRepoDTO, User } from '../../repositories/user/iUserRepository.js';

export interface IUserService {
  createUser(userDto: CreateUserRepoDTO): Promise<User>;
}
