import { type IPostService, type CreatePostResult } from './iPostService.js';
import {
  type IPostRepository,
  type CreatePostRepoDTO,
  type Post,
} from '../../repositories/post/iPostRepository.js';
import type { CreatePostDTO } from './iPostService.js';

import generateTanka from '../../lib/gemini.js';

export class PostService implements IPostService {
  // postRepositoryのインスタンスをコンストラクタで受け取る
  constructor(private readonly postRepository: IPostRepository) {}

  /**
   * 新しい投稿を作成するビジネスロジック
   * @param postDto - 投稿作成に必要なデータ
   * @returns {Promise<CreatePostResult>} 作成結果
   * @throws {Error} DBエラーなど、その他の予期せぬエラー
   */
  async createPost(postDto: CreatePostDTO): Promise<CreatePostResult> {
    console.log(`[PostService#createPost] 投稿作成処理を開始します．(userId: ${postDto.user_id})`);
    let image_path: string | null = null;
    let fileForTanka: File | null = null;

    // 画像圧縮処理

    // 画像をアップロードしてパスを取得する処理
    if (postDto.image) {
      console.log('[PostService#createPost] ダミーの画像処理を実行します．');
      // 本物の処理に差し替える部分 ①：ここで圧縮処理

      // 本物の処理に差し替える部分 ②：ここでS3にアップロード
      image_path = '2025-6-21/image.jpeg'; // ダミーのパス

      // ダミーのFileオブジェクト（generateTankaに渡すため）
      fileForTanka = null;
    }

    // GeminiにTankaを生成するリクエストを送信する処理
    console.log('[PostService#createPost] 短歌の生成を開始します．');
    const tankaResult = await generateTanka(postDto.original, null);
    if (!tankaResult.isSuccess) {
      // 短歌の生成に失敗したらエラーを投げる
      throw new Error(`短歌の生成に失敗しました: ${tankaResult.message}`);
    }
    const tanka = tankaResult.tanka;
    console.log('[PostService#createPost] 短歌の生成が完了しました．');
    //console.log('[PostService#createPost] 生成された短歌:', tanka);
    //console.log('tankaの型', typeof tanka);

    // DB保存用データの作成
    const postRepoDto: CreatePostRepoDTO = {
      original: postDto.original,
      tanka: tanka,
      image_path: image_path,
      user_id: postDto.user_id,
    };

    // 投稿をDBに作成する
    await this.postRepository.create(postRepoDto);

    console.log(`[PostService#createPost] 投稿の作成が完了しました．(userId: ${postDto.user_id})`);

    return {
      message: '投稿しました．',
      tanka: tanka,
    };
  }
}
