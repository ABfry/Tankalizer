import {
  type IMiyabiService,
  type CreateMiyabiDTO,
  type DeleteMiyabiDTO,
  type CreateMiyabiResult,
  type DeleteMiyabiResult,
  NotFoundError,
  ConflictError,
} from './iMiyabiService.js';
import {
  type IMiyabiRepository,
  type Miyabi,
} from '../../repositories/miyabi/iMiyabiRepository.js';
import { type IPostRepository, type Post } from '../../repositories/post/iPostRepository.js';
import { type IUserRepository, type User } from '../../repositories/user/iUserRepository.js';

export class MiyabiService implements IMiyabiService {
  // コンストラクタでサービスを受け取る
  constructor(
    private readonly miyabiRepository: IMiyabiRepository,
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * 雅を作成するビジネスロジック
   * @param createMiyabiDto - 雅作成に必要なデータ
   * @returns {Promise<DeleteMiyabiResult>} 作成結果
   * @throws {Error} 投稿あるいはユーザが見つからない，または既に同一雅が存在する場合にエラー
   */
  async createMiyabi(createMiyabiDto: CreateMiyabiDTO): Promise<CreateMiyabiResult> {
    console.log(
      `[MiyabiService#createMiyabi] 雅作成処理を開始します．(userId: ${createMiyabiDto.user_id}, postId: ${createMiyabiDto.post_id})`
    );

    const post: Post | null = await this.postRepository.findById(createMiyabiDto.post_id);

    if (!post) {
      throw new NotFoundError('投稿が見つかりません．');
    }

    const user: User | null = await this.userRepository.findById(createMiyabiDto.user_id);

    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません．');
    }

    const miyabi: Miyabi | null = await this.miyabiRepository.findMiyabi(
      createMiyabiDto.user_id,
      createMiyabiDto.post_id
    );

    if (miyabi) {
      throw new ConflictError('雅が既に存在します．');
    }

    await this.miyabiRepository.create(createMiyabiDto.user_id, createMiyabiDto.post_id);

    console.log(
      `[MiyabiService#createMiyabi] 雅の作成が完了しました．(userId: ${createMiyabiDto.user_id}, postId: ${createMiyabiDto.post_id})`
    );

    return {
      message: '雅を作成しました．',
    };
  }

  /**
   * 雅を削除するビジネスロジック
   * @param deleteMiyabiDto - 雅削除に必要なデータ
   * @returns {Promise<DeleteMiyabiResult>} 削除結果
   * @throws {Error} 雅が見つからない場合にエラー
   */
  async deleteMiyabi(deleteMiyabiDto: DeleteMiyabiDTO): Promise<DeleteMiyabiResult> {
    console.log(
      `[MiyabiService#deleteMiyabi] 雅削除処理を開始します．(userId: ${deleteMiyabiDto.user_id}, postId: ${deleteMiyabiDto.post_id})`
    );

    const miyabi: Miyabi | null = await this.miyabiRepository.findMiyabi(
      deleteMiyabiDto.user_id,
      deleteMiyabiDto.post_id
    );

    const post: Post | null = await this.postRepository.findById(deleteMiyabiDto.post_id);

    if (!post) {
      throw new NotFoundError('投稿が見つかりません．');
    }

    const user: User | null = await this.userRepository.findById(deleteMiyabiDto.user_id);

    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません．');
    }

    if (!miyabi) {
      throw new ConflictError('雅が見つかりません．');
    }

    await this.miyabiRepository.delete(deleteMiyabiDto.user_id, deleteMiyabiDto.post_id);

    console.log(
      `[MiyabiService#deleteMiyabi] 雅の削除が完了しました．(userId: ${deleteMiyabiDto.user_id}, postId: ${deleteMiyabiDto.post_id})`
    );

    return {
      message: '雅を削除しました．',
    };
  }
}
