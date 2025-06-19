import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

import type { IStorageService } from './iStorageService.js';
import { streamToBuffer } from '../../utils/stream.js';

const CDN_URL = 'image.tankalizer.jp';

export class S3StorageService implements IStorageService {
  constructor(private readonly s3Client: S3Client, private readonly bucketName: string) {}

  async upload(file: File, key: string): Promise<string> {
    // FileをBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // s3を叩くコマンド
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await this.s3Client.send(command);
    return this.getUrl(key);
  }

  async download(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const stream = (await this.s3Client.send(command)).Body;

    if (!stream) {
      throw new Error('ファイルが見つかりません');
    }

    return await streamToBuffer(stream);
  }

  getUrl(key: string): string {
    return `https://${CDN_URL}/${key}`;
  }
}
