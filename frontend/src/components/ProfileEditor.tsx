'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import * as Dialog from '@radix-ui/react-dialog';
import { judgeImage } from '@/lib/JudgeImage';
import { calcFileSize } from '@/lib/CalcFileSize';

interface ProfileEditorProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

/**
 * プロフィール編集モーダルを表示するコンポーネント
 *
 * @component ProfileEditor
 * @return {JSX.Element} プロフィール編集モーダルを表示するReactコンポーネント
 */
const ProfileEditor = ({ className, isOpen, setIsOpen }: ProfileEditorProps) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();
  const MAX_NAME_LENGTH = 40; // 名前の最大文字数
  const MAX_BIO_LENGTH = 160; // 自己紹介の最大文字数
  const MAX_IMAGE_SIZE = 5; // 最大ファイルサイズ（5MB）

  // 画像選択用の隠し input への参照
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // セッションの取得
  const session = useSession();

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 画像のバリデーション
      if (!judgeImage(file)) {
        alert('JPG/PNG形式の画像を選択してください。');
        return;
      }
      if (calcFileSize(file) > MAX_IMAGE_SIZE) {
        alert(`ファイルサイズが${MAX_IMAGE_SIZE}MBを超えています。`);
        return;
      }
      setCurrentImageUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleSave = useCallback(() => {
    // TODO: 保存処理をここに実装
    setIsOpen?.(false);
  }, [setIsOpen]);
  // モーダルが開かれるたびにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setName(session.data?.user?.name ?? '');
      setBio('');
      setCurrentImageUrl(session.data?.user?.image ?? undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, session.data?.user?.name, session.data?.user?.image]);
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => setIsOpen?.(open)}>
      <Dialog.Portal>
        {/* overlay with fade‐in/out */}
        <Dialog.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />

        {/* modal content with the full animation combo */}
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 min-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
            data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
            ${className ?? ''}`}
        >
          <Dialog.Title className='mb-6 text-center text-lg font-semibold'>
            プロフィールを編集
          </Dialog.Title>

          {/* プロフィール画像 */}
          <div className='mb-4 flex flex-col items-center'>
            <Image
              src={currentImageUrl ?? '/iconDefault.png'}
              alt='現在のプロフィール画像'
              width={96}
              height={96}
              className='mb-2 cursor-pointer rounded-full object-cover'
              onClick={() => fileInputRef.current?.click()}
            />

            {/* 削除ボタン（画像がある場合のみ表示） */}
            {currentImageUrl && (
              <button
                type='button'
                className='mb-1 text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline'
                onClick={() => {
                  setCurrentImageUrl(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                画像を削除
              </button>
            )}
            {/* 選択ボタン（画像がない場合のみ表示） */}
            {!currentImageUrl && (
              <button
                type='button'
                className='mb-1 text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline'
                onClick={() => fileInputRef.current?.click()}
              >
                画像を選択
              </button>
            )}

            {/* 隠しファイル入力 */}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageChange}
            />
          </div>

          {/* 名前 */}
          <div className='mb-4'>
            <label htmlFor='name' className='mb-1 block text-sm font-semibold text-gray-700'>
              名前
            </label>
            <div className='relative flex items-center'>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue.length <= MAX_NAME_LENGTH) {
                    setName(inputValue);
                  } else {
                    setName(inputValue.slice(0, MAX_NAME_LENGTH));
                  }
                }}
                className='w-full rounded-md border border-gray-300 p-2 text-sm focus:border-orange-500 focus:outline-none'
              />
              <span className='absolute inset-y-0 right-3 flex select-none items-center text-sm text-orange-500'>
                {MAX_NAME_LENGTH - name.length}
              </span>
            </div>
          </div>

          {/* 自己紹介 */}
          <div className='mb-6'>
            <label htmlFor='bio' className='mb-1 block text-sm font-semibold text-gray-700'>
              自己紹介
            </label>
            <div className='relative flex items-center'>
              <textarea
                id='bio'
                rows={4}
                value={bio}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue.length <= MAX_BIO_LENGTH) {
                    setBio(inputValue);
                  } else {
                    setBio(inputValue.slice(0, MAX_BIO_LENGTH));
                  }
                }}
                className='w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-orange-500 focus:outline-none'
              />
              <span className='absolute bottom-2 right-3 flex select-none items-center text-sm text-orange-500'>
                {MAX_BIO_LENGTH - bio.length}
              </span>
            </div>
          </div>

          {/* ボタン */}
          <div className='flex justify-center gap-3'>
            <button
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={() => setIsOpen?.(false)}
            >
              取消
            </button>
            <button
              className='rounded-md bg-orange-400 px-4 py-2 text-sm text-white hover:bg-orange-500'
              onClick={handleSave}
            >
              保存
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProfileEditor;
