import {
  type GetProfileDTO,
  type IProfileService,
  NotFoundError,
  type UpdateProfileDTO,
} from './iProfileService.js';
import {
  type IProfileRepository,
  type Profile,
  type UpdateProfileRepoDTO,
} from '../../repositories/profile/iProfileRepository.js';

import { type IUserRepository, type User } from '../../repositories/user/iUserRepository.js';
import { keyframes } from 'hono/css';

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

  /**
   * プロフィールを更新するビジネスロジック
   * @param updateProfileDto - プロフィールデータ
   * @returns {Promise<Profile>} 更新後のプロフィール取得結果
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async updateProfile(updateProfileDto: UpdateProfileDTO): Promise<Profile> {
    console.log(
      `[ProfileService#updateProfile] プロフィール更新処理を開始します．(id: ${updateProfileDto.user_id})`
    );

    const user: User | null = await this.userRepository.findById(updateProfileDto.user_id);

    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません．');
    }

    // DB保存用データの作成
    const updateProfileRepoDTO: UpdateProfileRepoDTO = {
      user_id: updateProfileDto.user_id,
      user_name: updateProfileDto.user_name,
      profile_text: updateProfileDto.profile_text,
      image_path: key,
    };

    const profile = await this.profileRepository.getProfile(
      updateProfileDto.user_id,
      updateProfileDto.user_id
    );

    console.log(
      `[ProfileService#getProfile] プロフィールの更新が完了しました．(id: ${updateProfileDto.user_id})`
    );

    return profile;
  }
}
