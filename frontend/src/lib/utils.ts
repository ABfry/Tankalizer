import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cdnUrl =
  process.env.NEXT_PUBLIC_CDN_URL ?? 'https://202502-test-bucket.s3.ap-northeast-1.amazonaws.com';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 画像のURLを取得する
 * @param imageUrl - 画像のURL
 * @returns 画像のURL
 */
export function getImageUrl(imageUrl: string): string {
  if (imageUrl === '') return '';
  return `${cdnUrl}/${imageUrl}`;
}
