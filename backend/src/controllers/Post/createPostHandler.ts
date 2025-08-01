import { z, type RouteHandler } from '@hono/zod-openapi';
import type { Context } from 'hono';
import db from '../../lib/db.js';
import { createPostSchema } from '../../schema/Post/createPostSchema.js';
import type { createPostRoute } from '../../routes/Post/createPostRoute.js';
import { env } from '../../config/env.js';
import generateTanka from '../../lib/gemini.js';
import { sampleUploadSchema } from '../../schema/sampleS3Schema.js';
import type { sampleS3UploadRoute } from '../../routes/sampleS3Route.js';
import { uploadFile } from '../../lib/s3-connector.js';
import path from 'path';
import sharp from 'sharp';

type createPostSchema = z.infer<typeof createPostSchema>;

const createPostHandler: RouteHandler<typeof createPostRoute, {}> = async (c: Context) => {
  try {
    // 受け取ったデータを各変数に格納
    const formData = await c.req.formData();
    const originalValue = formData.get('original');
    const image = (formData.get('image') as File) || null;
    const user_name = formData.get('user_name');
    const user_icon = formData.get('user_icon');

    //console.log(image);
    // imageがnullならimage_pathをnullにする．
    let image_path;
    let file: File | null = null;
    if (image == null) {
      image_path = null;
    } else {
      //console.log(image);
      // ここに圧縮処理 (jpegにしてqualityさげる．めざせ500KB)
      // File型からbufferへ
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const new_file_name = 'file.jpg';

      await compressImage(buffer)
        .then(async (resultBuffer) => {
          // BufferからFile型へ変換
          file = new File([resultBuffer], new_file_name, { type: 'image/jpeg' });
          //console.log(file);
          // アップロード
          image_path = await uploadFile(file);
        })
        .catch((err) => {
          console.error('画像圧縮エラー:', err);
          return c.json(
            {
              message: '画像のアップロードに失敗しました．',
              statusCode: 500,
              error: '画像のアップロードに失敗しました．',
            },
            500
          );
        });
    }

    if (!originalValue || typeof originalValue !== 'string') {
      console.log('originalはstringである必要があります．');
      return c.json(
        {
          message: 'originalはstringである必要があります．',
          statusCode: 400,
          error: 'Bad Request',
        },
        400
      );
    }
    const original = originalValue;

    const response = await generateTanka(original, file);

    // gemini APIのエラー確認
    if (response.isSuccess == false) {
      console.log(response.message);
      return c.json(
        {
          message: response.message,
          statusCode: 500,
          error: response.message,
        },
        500
      );
    }

    const tanka = JSON.stringify(response.tanka);
    //console.log(tanka);

    // ここからDBのpostテーブルへ情報登録
    const sql = `insert into ${env.POSTS_TABLE_NAME} (original, tanka, image_path, user_name, user_icon) values (:original, :tanka, :image_path, :user_name, :user_icon)`;
    await db.query(sql, { original, tanka, image_path, user_name, user_icon });

    // レスポンス
    console.log('投稿しました．');
    return c.json(
      {
        message: '投稿しました．',
        tanka: response.tanka,
      },
      200
    );
  } catch (err) {
    console.log('投稿に失敗しました．' + err);
    return c.json(
      {
        message: '投稿に失敗しました．',
        statusCode: 500,
        error: '投稿に失敗しました．',
      },
      500
    );
  }
};

export default createPostHandler;

// 1080pに圧縮．それでも500KB超えていたら二分探索で500KB以下にする
async function compressImage(inputBuffer: Buffer): Promise<Buffer> {
  let minQuality = 1;
  let maxQuality = 100;
  let bestQuality = maxQuality;
  let bestBuffer: Buffer | null = null;
  const targetFileSize = 500 * 1024; // 500KB

  // jpegに変換して，それ以外何もしなくても500KB以下か?
  const compressedJpegBuffer = await sharp(inputBuffer).jpeg().toBuffer();
  if (compressedJpegBuffer.length <= targetFileSize) {
    return compressedJpegBuffer;
  }

  // 1080pにして500KB以下か?
  const compressed1080pBuffer = await sharp(inputBuffer)
    .rotate()
    .resize(1080, 1080, {
      fit: 'inside',
    })
    .jpeg()
    .toBuffer();
  if (compressed1080pBuffer.length <= targetFileSize) {
    return compressed1080pBuffer;
  }

  // 二分探索
  while (minQuality <= maxQuality) {
    const midQuality = Math.floor((minQuality + maxQuality) / 2);
    const compressedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(1080, 1080, {
        fit: 'inside',
      })
      .jpeg({ quality: midQuality })
      .toBuffer();

    // サイズがtargetFileSizeより大きければ，maxQualityを小さく
    if (compressedBuffer.length > targetFileSize) {
      maxQuality = midQuality - 1;
    } else {
      // サイズがtargetFileSizeより小さければ，一旦bestBufferとし，minQualityを大きく
      bestBuffer = compressedBuffer;
      bestQuality = midQuality;
      minQuality = midQuality + 1;
    }
  }

  if (!bestBuffer) {
    throw new Error('画像の圧縮に失敗しました．');
  }

  return bestBuffer;
}
