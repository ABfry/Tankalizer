import sharp from 'sharp';

/**
 * 画像を指定されたファイルサイズ以下になるように圧縮する．
 * @param file - 圧縮したい画像file
 * @returns {Promise<Buffer>} 圧縮後の画像file
 */
export const compressImage = async (file: File): Promise<File> => {
  const targetFileSize = 500 * 1024; // 500KB

  // FileオブジェクトをBufferに変換
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 先にリサイズと回転だけ適用
  const sharpInstance = sharp(buffer).rotate().resize(1080, 1080, { fit: 'inside' });

  // 最高品質で一度試し，500KB以下ならOK
  const initialBuffer = await sharpInstance.jpeg().toBuffer();
  if (initialBuffer.length <= targetFileSize) {
    console.log('[compressImage] 高品質のまま圧縮完了．');
    // BufferをFileオブジェクトに戻して返す
    return new File([initialBuffer], file.name, { type: 'image/jpeg' });
  }

  console.log('[compressImage] 品質を調整して再圧縮します（二分探索）．');
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
    console.log('[compressImage] 最適な品質での圧縮が完了しました．');
    // BufferをFileオブジェクトに戻して返す
    return new File([bestBuffer], file.name, { type: 'image/jpeg' });
  }

  // 最低品質で返す
  console.warn('[compressImage] 最低品質でもターゲットサイズを超えました．');
  const finalBuffer = await sharpInstance.jpeg({ quality: 1 }).toBuffer();
  // BufferをFileオブジェクトに戻して返す
  return new File([finalBuffer], file.name, { type: 'image/jpeg' });
};

/**
 * アイコン用に画像を圧縮する．
 * @param file - 圧縮したい画像file
 * @returns {Promise<File>} 圧縮後の画像file
 */
export const compressIconImage = async (file: File): Promise<File> => {
  const targetFileSize = 100 * 1024; // 100KB
  const targetSize = 256; // 256x256

  // FileオブジェクトをBufferに変換
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // リサイズと回転を適用
  const sharpInstance = sharp(buffer).rotate().resize(targetSize, targetSize, { fit: 'inside' });

  // 品質を調整して圧縮
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
    console.log('[compressIconImage] 最適な品質での圧縮が完了しました．');
    return new File([bestBuffer], file.name, { type: 'image/jpeg' });
  }

  console.warn('[compressIconImage] 最低品質でもターゲットサイズを超えました．');
  const finalBuffer = await sharpInstance.jpeg({ quality: 1 }).toBuffer();
  return new File([finalBuffer], file.name, { type: 'image/jpeg' });
};
