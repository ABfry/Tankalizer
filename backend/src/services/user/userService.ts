import {
  UserRepository,
  type CreateUserDTO,
  type User,
} from '../../repositories/user/userRepository.js';

export class UserService {
  // userRepositoryのインスタンスをコンストラクタで受け取る
  constructor(private readonly userRepository: UserRepository) {}

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
    await this.userRepository.create(userDto);

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
