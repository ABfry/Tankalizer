'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import * as Dialog from '@radix-ui/react-dialog';
import { judgeImage } from '@/lib/JudgeImage';
import { calcFileSize } from '@/lib/CalcFileSize';
import CustomDialog from '@/components/Dialog';
import updateProfile from '@/app/(main)/profile/[userId]/actions/updateProfile';
import { ProfileTypes } from '@/types/profileTypes';
import { getImageUrl } from '@/lib/utils';

interface ProfileEditorProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  profile?: ProfileTypes;
}

/**
 * プロフィール編集モーダルを表示するコンポーネント
 *
 * @component ProfileEditor
 * @return {JSX.Element} プロフィール編集モーダルを表示するReactコンポーネント
 */
const ProfileEditor = ({ className, isOpen, setIsOpen, profile }: ProfileEditorProps) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false); // 更新失敗のダイアログの表示状態
  const MAX_NAME_LENGTH = 20; // 名前の最大文字数
  const MAX_BIO_LENGTH = 255; // 自己紹介の最大文字数
  const MAX_IMAGE_SIZE = 5; // 最大ファイルサイズ（5MB）
  const isImageUpdated = useRef(false); // 画像が更新されたかどうかのフラグ
  const iconUrl = getImageUrl(profile?.iconUrl ?? '');

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
    // 画像が更新されたことを示すフラグを設定
    isImageUpdated.current = true;
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const updatedProfile = await updateProfile({
        userId: session.data?.user_id ?? '',
        name,
        bio,
        imageData: isImageUpdated.current ? fileInputRef.current?.files?.[0] ?? null : null,
      });

      if (updatedProfile) {
        // 更新成功
        setIsOpen?.(false);
        isImageUpdated.current = false;
        window.location.reload(); // 最新プロフィール反映
      } else {
        // 更新失敗
        setIsErrorDialogOpen(true);
      }
    } catch (error) {
      // エラー発生
      setIsErrorDialogOpen(true);
      console.error('プロフィール更新中にエラーが発生しました:', error);
    }
  }, [session.data?.user_id, name, bio, setIsOpen]);

  // モーダルが開かれるたびにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setName(profile?.name ?? '');
      setBio(profile?.bio ?? '');
      setCurrentImageUrl(iconUrl ?? undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, profile, iconUrl]);
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => setIsOpen?.(open)}>
      <Dialog.Portal>
        {/* フェードイン/アウト付きのオーバーレイ */}
        <Dialog.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />

        {/* モーダルコンテンツ */}
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
            <div
              className='relative mb-2 size-24 cursor-pointer overflow-hidden rounded-full'
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={currentImageUrl ?? '/iconDefault.png'}
                alt='現在のプロフィール画像'
                fill
                sizes='96px'
                className='object-cover'
              />
            </div>

            {/* 削除ボタン（画像がある場合のみ表示） */}
            {/*{currentImageUrl && (
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
            )*/}
            {/* 選択ボタン（画像がない場合のみ表示） */}
            <button
              type='button'
              className='mb-1 text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline'
              onClick={() => fileInputRef.current?.click()}
            >
              画像を選択
            </button>

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
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-black shadow hover:bg-gray-100'
              onClick={() => setIsOpen?.(false)}
            >
              取消
            </button>
            <button
              className='rounded-md bg-orange-400 px-4 py-2 text-sm text-white shadow hover:bg-orange-500'
              onClick={handleSave}
            >
              保存
            </button>
          </div>
          <CustomDialog
            isOpen={isErrorDialogOpen}
            description='更新に失敗しました。時間をおいてやり直してみてください。'
            isOnlyOK={true}
            yesCallback={() => {
              setIsErrorDialogOpen(false);
            }}
            yesText='はい'
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProfileEditor;
