import type { IStorageService } from '../storage/iStorageService.js';
import type { IImageService } from './iImageService.js';
import { generateUuid } from '../../utils/generate-uuid.js';
import sharp from 'sharp';

// バケット内の画像を保存するルートパス
const IMAGE_STORAGE_PATH = '/';

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

  /**
   * 画像を指定されたファイルサイズ以下になるように圧縮する．
   * @param buffer - 圧縮したい画像のBuffer
   * @returns {Promise<Buffer>} 圧縮後の画像のBuffer
   */
  public async compressImage(buffer: Buffer): Promise<Buffer> {
    const targetFileSize = 500 * 1024; // 500KB

    // 先にリサイズと回転だけ適用
    const sharpInstance = sharp(buffer).rotate().resize(1080, 1080, { fit: 'inside' });

    // 最高品質で一度試し，500KB以下ならOK
    const initialBuffer = await sharpInstance.jpeg().toBuffer();
    if (initialBuffer.length <= targetFileSize) {
      console.log('[ImageService#compressImage] 高品質のまま圧縮完了．');
      return initialBuffer;
    }

    console.log('[ImageService#compressImage] 品質を調整して再圧縮します（二分探索）．');
    // 二分探索で最適な品質を探す
    let minQuality = 1;
    let maxQuality = 100;
    let bestBuffer: Buffer | null = null;
    while (minQuality <= maxQuality) {
      const midQuality = Math.floor((minQuality + maxQuality) / 2);
      const compressedBuffer = await sharpInstance.jpeg({ quality: midQuality }).toBuffer();
      if (compressedBuffer.length <= targetFileSize) {
        bestBuffer = compressedBuffer;
        minQuality = midQuality + 1;
      } else {
        maxQuality = midQuality - 1;
      }
    }
    if (bestBuffer) {
      console.log('[ImageService#compressImage] 最適な品質での圧縮が完了しました．');
      return bestBuffer;
    }
    // 最低品質で返す
    console.warn('[ImageService#compressImage] 最低品質でもターゲットサイズを超えました．');
    return sharpInstance.jpeg({ quality: 1 }).toBuffer();
  }
}
