export interface IImageService {
  uploadImage(file: File, userId: string): Promise<string>;
  getImage(image_url: string): Promise<Buffer>;
  isImage(file: File): boolean;
}
