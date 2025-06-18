export interface IStorageService {
  upload(file: File, key: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  getUrl(key: string): string;
}
