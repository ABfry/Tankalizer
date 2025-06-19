import type { IStorageService } from '../storage/iStorageService.js';
import type { IImageService } from './iImageService.js';

export class ImageService implements IImageService {
  constructor(private readonly storageService: IStorageService) {}
  uploadImage(file: File, userId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getImage(image_url: string): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
  isImage(file: File): boolean {
    throw new Error('Method not implemented.');
  }
}
