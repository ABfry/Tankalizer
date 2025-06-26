import sharp from 'sharp';

interface CompressionOptions {
  targetFileSize: number;
  width?: number;
  height?: number;
  logPrefix: string;
}

const fileToBuffer = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const findOptimalQuality = async (
  sharpInstance: sharp.Sharp,
  targetFileSize: number
): Promise<Buffer | null> => {
  let minQuality = 1;
  let maxQuality = 100;
  let bestBuffer: Buffer | null = null;

  // 二分探索で最適な品質を探す
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

  return bestBuffer;
};

const bufferToFile = (buffer: Buffer, originalFile: File): File => {
  return new File([buffer], originalFile.name, { type: 'image/jpeg' });
};

/**
 * 画像を指定されたファイルサイズ以下になるように圧縮する
 * @param file - 圧縮したい画像file
 * @param options - 圧縮オプション
 * @returns {Promise<File>} 圧縮後の画像file
 */
const compressImageWithOptions = async (file: File, options: CompressionOptions): Promise<File> => {
  const { targetFileSize, width, height, logPrefix } = options;
  const buffer = await fileToBuffer(file);

  const sharpInstance = sharp(buffer).rotate();
  if (width && height) {
    sharpInstance.resize(width, height, { fit: 'inside' });
  }

  const initialBuffer = await sharpInstance.jpeg().toBuffer();
  if (initialBuffer.length <= targetFileSize) {
    console.log(`[${logPrefix}] 高品質のまま圧縮完了．`);
    return bufferToFile(initialBuffer, file);
  }

  console.log(`[${logPrefix}] 品質を調整して再圧縮します（二分探索）．`);
  const bestBuffer = await findOptimalQuality(sharpInstance, targetFileSize);

  if (bestBuffer) {
    console.log(`[${logPrefix}] 最適な品質での圧縮が完了しました．`);
    return bufferToFile(bestBuffer, file);
  }

  console.warn(`[${logPrefix}] 最低品質でもターゲットサイズを超えました．`);
  const finalBuffer = await sharpInstance.jpeg({ quality: 1 }).toBuffer();
  return bufferToFile(finalBuffer, file);
};

/**
 * 画像を指定されたファイルサイズ以下になるように圧縮する．
 * @param file - 圧縮したい画像file
 * @returns {Promise<File>} 圧縮後の画像file
 */
export const compressImage = async (file: File): Promise<File> => {
  return compressImageWithOptions(file, {
    targetFileSize: 500 * 1024,
    width: 1080,
    height: 1080,
    logPrefix: 'compressImage',
  });
};

/**
 * アイコン用に画像を圧縮する．
 * @param file - 圧縮したい画像file
 * @returns {Promise<File>} 圧縮後の画像file
 */
export const compressIconImage = async (file: File): Promise<File> => {
  return compressImageWithOptions(file, {
    targetFileSize: 100 * 1024,
    width: 256,
    height: 256,
    logPrefix: 'compressIconImage',
  });
};
