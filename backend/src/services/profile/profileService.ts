import {
  type GetProfileDTO,
  type IProfileService,
  NotFoundError,
  type UpdateProfileDTO,
  type GetFollowingUserDTO,
  type GetMutualFollowingUserDTO,
} from './iProfileService.js';
import {
  type IProfileRepository,
  type Profile,
  type UpdateProfileRepoDTO,
} from '../../repositories/profile/iProfileRepository.js';

import { type IUserRepository, type User } from '../../repositories/user/iUserRepository.js';
import { compressIconImage } from '../../utils/compressImage.js';
import type { IIconService } from '../icon/iIconService.js';

export class ProfileService implements IProfileService {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly userRepository: IUserRepository,
    private readonly iconService: IIconService
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

    // アイコン画像のアップロード
    let key = await this.uploadIcon(updateProfileDto.icon_image as File, updateProfileDto.user_id);

    if (!key) {
      key = user.icon_url;
    }

    // DB保存用データの作成
    const updateProfileRepoDTO: UpdateProfileRepoDTO = {
      user_id: updateProfileDto.user_id,
      user_name: updateProfileDto.user_name,
      profile_text: updateProfileDto.profile_text,
      image_path: key,
    };

    await this.profileRepository.updateProfile(updateProfileRepoDTO);

    const profile = await this.profileRepository.getProfile(
      updateProfileDto.user_id,
      updateProfileDto.user_id
    );

    console.log(
      `[ProfileService#updateProfile] プロフィールの更新が完了しました．(id: ${updateProfileDto.user_id})`
    );

    return profile;
  }

  private async uploadIcon(iconImage: File, userId: string): Promise<string | null> {
    try {
      if (iconImage && iconImage instanceof File) {
        // iconImageがFileのインスタンスかチェックする
        console.log('[ProfileService#updateProfile] 画像処理を実行します．');
        const compressedFile = await compressIconImage(iconImage);

        // S3にアップロード
        return await this.iconService.updatedIcon(compressedFile, userId);
      } else {
        return null;
      }
    } catch (error) {
      console.error('[ProfileService#updateProfile] 画像のアップロードに失敗しました．');
      return null;
    }
  }

  /**
   * フォローしているユーザーを取得するビジネスロジック
   * @param getFollowingUserDto - フォローしているユーザーを取得するためのDTO
   * @returns {Promise<Profile[]>} フォローしているユーザーのプロフィールの配列
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async getFollowingUser(getFollowingUserDto: GetFollowingUserDTO): Promise<Profile[]> {
    console.log(
      `[ProfileService#getFollowingUser] フォローしているユーザーの取得処理を開始します．(user_id: ${getFollowingUserDto.user_id})`
    );

    const user: User | null = await this.userRepository.findById(getFollowingUserDto.user_id);

    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません．');
    }

    const followingUsers = await this.profileRepository.getFollowingUser(getFollowingUserDto);

    console.log(
      `[ProfileService#getFollowingUser] フォローしているユーザーの取得が完了しました．(user_id: ${getFollowingUserDto.user_id})`
    );

    return followingUsers;
  }

  /**
   * 相互フォローしているユーザーを取得するビジネスロジック
   * @param getMutualFollowingUserDto - 相互フォローしているユーザーを取得するためのDTO
   * @returns {Promise<Profile[]>} 相互フォローしているユーザーのプロフィールの配列
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async getMutualFollowingUser(
    getMutualFollowingUserDto: GetMutualFollowingUserDTO
  ): Promise<Profile[]> {
    console.log(
      `[ProfileService#getMutualFollowingUser] 相互フォローしているユーザーの取得処理を開始します．(user_id: ${getMutualFollowingUserDto.user_id})`
    );

    const user: User | null = await this.userRepository.findById(getMutualFollowingUserDto.user_id);

    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません．');
    }

    const mutualfollowingUsers = await this.profileRepository.getMutualFollowingUser(
      getMutualFollowingUserDto
    );

    console.log(
      `[ProfileService#getMutualFollowingUser] 相互フォローしているユーザーの取得が完了しました．(user_id: ${getMutualFollowingUserDto.user_id})`
    );

    return mutualfollowingUsers;
  }
}
