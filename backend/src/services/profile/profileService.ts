import { type GetProfileDTO, type IProfileService, NotFoundError } from './iProfileService.js';
import {
  type IProfileRepository,
  type Profile,
} from '../../repositories/profile/iProfileRepository.js';

import { type IUserRepository, type User } from '../../repositories/user/iUserRepository.js';

export class ProfileService implements IProfileService {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * プロフィールを取得するビジネスロジック
   * @param getProfileDto - ユーザーID
   * @returns {Promise<Profile>} 取得結果
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async getProfile(getProfileDto: GetProfileDTO): Promise<Profile> {
    console.log(
      `[ProfileService#getProfile] プロフィール取得処理を開始します．(id: ${getProfileDto.user_id})`
    );

    const user: User | null = await this.userRepository.findById(getProfileDto.user_id);

    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません．');
    }

    if (getProfileDto.viewer_id) {
      const viewer: User | null = await this.userRepository.findById(getProfileDto.viewer_id);
      if (!viewer) {
        // 指定されたviewer_idが存在しなければエラー
        throw new NotFoundError('ユーザーが見つかりません．');
      }
    }
    const profile = await this.profileRepository.getProfile(
      getProfileDto.user_id,
      getProfileDto.viewer_id
    );

    console.log(
      `[ProfileService#getProfile] プロフィールの取得が完了しました．(id: ${getProfileDto.user_id})`
    );

    return profile;
  }
}
