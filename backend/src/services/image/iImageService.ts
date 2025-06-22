export interface IImageService {
  uploadImage(file: File): Promise<string>;
  getImage(imageUrl: string): Promise<Buffer>;
  isImage(file: File): boolean;
}
