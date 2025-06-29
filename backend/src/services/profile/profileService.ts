import { type IProfileService } from './iProfileService.js';
import {
  type IProfileRepository,
  type Profile,
} from '../../repositories/profile/iProfileRepository.js';

export class ProfileService implements IProfileService {
  constructor(private readonly profileRepository: IProfileRepository) {}

  /**
   * プロフィールを取得するビジネスロジック
   * @param user_id - ユーザーID
   * @returns {Promise<Profile>} 取得結果
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async getProfile(user_id: string): Promise<Profile> {
    console.log(`[ProfileService#getProfile] 投稿取得処理を開始します．(id: ${getOnePostDto.id})`);

    const post = await this.postRepository.getOnePost(getOnePostDto.id, getOnePostDto.viewerId);

    console.log(`[ProfileService#getProfile] 投稿の取得が完了しました．(id: ${getOnePostDto.id})`);

    return post;
  }
}
