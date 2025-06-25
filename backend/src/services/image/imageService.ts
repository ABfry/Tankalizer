import type { IStorageService } from '../storage/iStorageService.js';
import type { IImageService } from './iImageService.js';
import { generateUuid } from '../../utils/generate-uuid.js';

// バケット内の画像を保存するルートパス
const IMAGE_STORAGE_PATH = 'image';

export class ImageService implements IImageService {
  constructor(private readonly storageService: IStorageService) {}

  /**
   * 画像をアップロードする
   * @param file - アップロードする画像ファイル
   * @returns アップロードした画像のURL
   */
  async uploadImage(file: File): Promise<string> {
    try {
      // 画像かどうかチェック
      if (!this.isImage(file)) {
        throw new Error('画像ファイルではありません');
      }

      // ファイル名を生成
      const fileName = this.generateFileName(file);

      // ストレージにアップロード
      const key = await this.storageService.upload(file, fileName);

      return key;
    } catch (error) {
      console.error(error);
      throw new Error('画像のアップロードに失敗しました');
    }
  }

  getImage(imageUrl: string): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }

  /**
   * ファイルが画像かどうかを判定する
   * @param file - 判定するファイル
   * @returns ファイルが画像かどうか
   */
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * ファイル名を生成する
   * @param file - ファイル名を生成するファイル
   * @returns ファイル名
   */
  generateFileName(file: File): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const directory = `${year}-${month}-${day}`;
    const uuid = generateUuid();
    const fileName = `${IMAGE_STORAGE_PATH}/${directory}/${uuid}.${file.type.split('/')[1]}`;
    return fileName;
  }
}
