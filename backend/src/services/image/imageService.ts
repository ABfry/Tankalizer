import type { IStorageService } from '../storage/iStorageService.js';
import type { IImageService } from './iImageService.js';

// バケット内の画像を保存するルートパス
const IMAGE_STORAGE_PATH = '/';

export class ImageService implements IImageService {
  constructor(private readonly storageService: IStorageService) {}

  /**
   * 画像をアップロードする
   * @param file - アップロードする画像ファイル
   * @returns アップロードした画像のURL
   */
  uploadImage(file: File): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getImage(imageUrl: string): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
  isImage(file: File): boolean {
    throw new Error('Method not implemented.');
  }
}
