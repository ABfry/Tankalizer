export interface IIconService {
  updatedIcon(file: File, userId: string): Promise<string>;
  getIcon(icon_url: string): Promise<Buffer>;
}
