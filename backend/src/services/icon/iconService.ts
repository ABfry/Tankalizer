import type { IStorageService } from '../storage/iStorageService.js';
import type { IIconService } from './iIconService.js';
import { generateUuid } from '../../utils/generate-uuid.js';

// バケット内のアイコンを保存するルートパス
const ICON_STORAGE_PATH = '/Icon';

export class IconService implements IIconService {
  constructor(private storageService: IStorageService) {}
  /**
   * アイコンをアップロードする
   * @param file
   * @param userId
   */
  async updatedIcon(file: File, userId: string): Promise<string> {
    // userIdでアイコンを保存するディレクトリを作成
    const directory = `${ICON_STORAGE_PATH}/${userId}`;

    // ファイルネームを生成
    const uuid = generateUuid();
    const fileName = `${directory}/${uuid}.${file.type.split('/')[1]}`;

    // ストレージにアップロード
    const url = await this.storageService.upload(file, fileName);

    // TODO : DBのuser_iconをurlに更新する
    //

    return url;
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
}
