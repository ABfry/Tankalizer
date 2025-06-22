export interface IIconService {
  updatedIcon(file: File, userId: string): Promise<string>;
  getIcon(userId: string): Promise<Buffer>;
}
