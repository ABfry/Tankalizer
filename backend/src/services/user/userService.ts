import { type IUserService, type CreateUserDTO } from './iUserService.js';
import {
  type IUserRepository,
  type CreateUserRepoDTO,
  type User,
} from '../../repositories/user/iUserRepository.js';
import { type IImageService } from '../image/iImageService.js';
import { compressIconImage } from '../../utils/compressImage.js';
import { env } from '../../config/env.js';
import type { IIconService } from '../icon/iIconService.js';
import { generateUuid } from '../../utils/generateUuid.js';
import type { CreateUserResponse } from './iUserService.js';

export class UserService implements IUserService {
  // userRepositoryのインスタンスをコンストラクタで受け取る
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly iconService: IIconService
  ) {}

  /**
   * 新しいユーザーを作成するビジネスロジック
   * 既にユーザーが存在する場合は作成しない
   * @param userDto - ユーザー作成に必要なデータ
   * @returns {Promise<User>} 作成または取得したユーザー情報
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async createUser(userDto: CreateUserDTO): Promise<CreateUserResponse> {
    console.log(
      `[UserService#createUser] ユーザー作成処理を開始します．(oauth_app: ${userDto.oauth_app}, connect_info: ${userDto.connect_info})`
    );

    // ユーザーが既に存在するかどうかをリポジトリに問い合わせる
    const existingUser = await this.userRepository.findByEmail(
      userDto.connect_info,
      userDto.oauth_app
    );

    // ユーザーが既に存在した場合
    if (existingUser) {
      console.log(
        `[UserService#createUser] ユーザーは既に存在します．処理を終了します．(user_id: ${existingUser.id})`
      );
      // 既に存在するユーザー情報をそのまま返す
      return { user: existingUser, type: 'existing' };
    }

    // old_icon_urlでユーザーを検索
    const existingUserByIcon = await this.userRepository.findByOldIconUrl(userDto.icon_url);

    // old_icon_urlが一致するユーザーが存在した場合
    if (existingUserByIcon) {
      const updatedUser = await this.updateExistingUser(existingUserByIcon, userDto);
      return { user: updatedUser, type: 'migrated' };
    }

    // ユーザーが存在しない場合，リポジトリに新しいユーザーの作成を依頼する
    console.log('[UserService#createUser] 新規ユーザーを作成します．');

    const userId = generateUuid();
    const key = await this.uploadIconByUrl(userDto.icon_url, userId);

    // DB保存用データの作成
    const userRepoDto: CreateUserRepoDTO = {
      id: userId,
      name: userDto.name,
      oauth_app: userDto.oauth_app,
      connect_info: userDto.connect_info,
      profile_text: userDto.profile_text,
      icon_url: key,
    };

    await this.userRepository.create(userRepoDto);

    // 作成したユーザー情報を再度取得して返す
    const newUser = await this.userRepository.findByEmail(userDto.connect_info, userDto.oauth_app);

    if (!newUser) {
      // 万が一，作成直後にユーザーが見つからない場合はエラーを投げる
      console.error('[UserService#createUser] ユーザー作成直後にユーザーが見つかりませんでした．');
      throw new Error('ユーザーの作成に失敗しました．');
    }

    console.log(
      `[UserService#createUser] 新規ユーザーの作成が完了しました．(user_id: ${newUser.id})`
    );
    return { user: newUser, type: 'created' };
  }

  private async uploadIconByUrl(iconUrl: string, userId: string): Promise<string> {
    const response = await fetch(iconUrl);
    const blob = await response.blob();
    const file = new File([blob], 'icon.png', { type: 'image/png' });
    return await this.uploadIcon(file, userId);
  }

  private async uploadIcon(iconImage: File, userId: string): Promise<string> {
    try {
      if (iconImage && iconImage instanceof File) {
        // iconImageがFileのインスタンスかチェックする
        console.log('[UserService#createUser] 画像処理を実行します．');
        const compressedFile = await compressIconImage(iconImage);

        // S3にアップロード
        return await this.iconService.updatedIcon(compressedFile, userId);
      } else {
        return env.DEFAULT_ICON_PATH;
      }
    } catch (error) {
      console.error('[UserService#uploadIcon] 画像のアップロードに失敗しました．');
      return env.DEFAULT_ICON_PATH;
    }
  }

  /**
   * 旧データベースに登録されていたユーザーの情報を更新する
   * @param existingUser - 既存のユーザー情報
   * @param userDto - 更新するユーザー情報
   * @returns {Promise<User>} 更新後のユーザー情報
   */
  private async updateExistingUser(existingUser: User, userDto: CreateUserDTO): Promise<User> {
    console.log(
      `[UserService#updateExistingUser] old_icon_urlが一致するユーザーが見つかりました．情報を更新します．(user_id: ${existingUser.id})`
    );

    // アイコンをS3にアップロード
    const newIconUrl = await this.uploadIconByUrl(userDto.icon_url, existingUser.id);

    // connect_infoとicon_urlを更新
    await this.userRepository.updateConnectInfoAndIcon(
      existingUser.id,
      userDto.connect_info,
      userDto.oauth_app,
      newIconUrl
    );

    // 更新後のユーザー情報を取得して返す
    const updatedUser = await this.userRepository.findById(existingUser.id);
    if (!updatedUser) {
      throw new Error('ユーザー情報の更新に失敗しました．');
    }

    console.log(
      `[UserService#updateExistingUser] ユーザー情報の更新が完了しました．(user_id: ${updatedUser.id})`
    );
    return updatedUser;
  }
}
