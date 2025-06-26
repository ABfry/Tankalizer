import { type IUserService, type CreateUserDTO } from './iUserService.js';
import {
  type IUserRepository,
  type CreateUserRepoDTO,
  type User,
} from '../../repositories/user/iUserRepository.js';
import { type IImageService } from '../image/iImageService.js';
import { compressIconImage } from '../../utils/compress-image.js';
import { env } from '../../config/env.js';

export class UserService implements IUserService {
  // userRepositoryのインスタンスをコンストラクタで受け取る
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageService: IImageService
  ) {}

  /**
   * 新しいユーザーを作成するビジネスロジック
   * 既にユーザーが存在する場合は作成しない
   * @param userDto - ユーザー作成に必要なデータ
   * @returns {Promise<User>} 作成または取得したユーザー情報
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async createUser(userDto: CreateUserDTO): Promise<User> {
    console.log(
      `[UserService#createUser] ユーザー作成処理を開始します．(oauth_app: ${userDto.oauth_app}, connect_info: ${userDto.connect_info})`
    );

    // ユーザーが既に存在するかどうかをリポジトリに問い合わせる
    const existingUser = await this.userRepository.findByEmail(userDto.connect_info);

    // ユーザーが既に存在した場合
    if (existingUser) {
      console.log(
        `[UserService#createUser] ユーザーは既に存在します．処理を終了します．(user_id: ${existingUser.id})`
      );
      // 既に存在するユーザー情報をそのまま返す
      return existingUser;
    }

    // ユーザーが存在しない場合，リポジトリに新しいユーザーの作成を依頼する
    console.log('[UserService#createUser] 新規ユーザーを作成します．');

    let key: string;
    let compressedFile: File;

    if (userDto.icon_image && userDto.icon_image instanceof File) {
      // postDto.imageがFileのインスタンスかチェックする
      console.log('[UserService#createUser] 画像処理を実行します．');
      compressedFile = await compressIconImage(userDto.icon_image);

      // S3にアップロード
      key = await this.imageService.uploadImage(compressedFile);
    } else {
      key = env.DEFAULT_ICON_PATH;
    }

    // DB保存用データの作成
    const userRepoDto: CreateUserRepoDTO = {
      name: userDto.name,
      oauth_app: userDto.oauth_app,
      connect_info: userDto.connect_info,
      profile_text: userDto.profile_text,
      icon_url: key,
    };

    await this.userRepository.create(userRepoDto);

    // 作成したユーザー情報を再度取得して返す
    const newUser = await this.userRepository.findByEmail(userDto.connect_info);

    if (!newUser) {
      // 万が一，作成直後にユーザーが見つからない場合はエラーを投げる
      console.error('[UserService#createUser] ユーザー作成直後にユーザーが見つかりませんでした．');
      throw new Error('ユーザーの作成に失敗しました．');
    }

    console.log(
      `[UserService#createUser] 新規ユーザーの作成が完了しました．(user_id: ${newUser.id})`
    );
    return newUser;
  }
}
