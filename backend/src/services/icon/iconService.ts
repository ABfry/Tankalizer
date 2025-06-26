import type { IStorageService } from '../storage/iStorageService.js';
import type { IIconService } from './iIconService.js';
import { generateUuid } from '../../utils/generateUuid.js';

// バケット内のアイコンを保存するルートパス
const ICON_STORAGE_PATH = 'icon';

export class IconService implements IIconService {
  constructor(private readonly storageService: IStorageService) {}
  /**
   * アイコンをアップロードする
   * @param file
   * @param userId
   */
  async updatedIcon(file: File, userId: string): Promise<string> {
    // ファイル名を生成
    const fileName = this.generateFileName(file, userId);

    // ストレージにアップロード
    const key = await this.storageService.upload(file, fileName);

    return key;
  }

  /**
   * ユーザIDからアイコンを取得する
   * @param userId
   */
  async getIcon(userId: string): Promise<Buffer> {
    // TODO : DBからユーザアイコンのURLを取得
    const icon_url = '';
    return await this.storageService.download(icon_url);
  }

  /**
   * ファイル名を生成する
   * @param file - ファイル名を生成するファイル
   * @param userId - ユーザID
   * @returns ファイル名
   */
  generateFileName(file: File, userId: string): string {
    // userIdでアイコンを保存するディレクトリを作成
    const directory = `${ICON_STORAGE_PATH}/${userId}`;

    // ファイルネームを生成
    const uuid = generateUuid();
    const fileName = `${directory}/${uuid}.${file.type.split('/')[1]}`;
    return fileName;
  }
}

// つかいかた
// import { env } from '../../config/env.js';
// import { S3StorageService } from '../storage/s3StorageService.js';
// import { S3Client } from '@aws-sdk/client-s3';

// // インスタンス化
// // s3設定
// const s3Client = new S3Client({
//   region: 'ap-northeast-1',
//   credentials: {
//     accessKeyId: env.S3_ACCESS_KEY_ID,
//     secretAccessKey: env.S3_SECRET_ACCESS_KEY,
//   },
// });

// // アイコンサービスのインスタンス化
// const iconService = new IconService(new S3StorageService(s3Client, env.S3_BUCKET_NAME));

// // アップロード
// const resultUrl = await iconService.updatedIcon(file, userId);
