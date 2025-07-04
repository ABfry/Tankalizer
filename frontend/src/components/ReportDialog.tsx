'use client';
import React, { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import CustomDialog from '@/components/Dialog';
import { PostTypes } from '@/types/postTypes';
import reportToDiscord from '@/app/(main)/timeline/actions/reportToDiscord';
import fetchProfile from '@/app/(main)/profile/[userId]/actions/fetchProfile';
import { useSession } from 'next-auth/react';
import { ProfileTypes } from '@/types/profileTypes';

interface ReportDialogProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  post: PostTypes;
}

/**
 * 通報ダイアログを表示するコンポーネント
 *
 * @component ReportDialog
 * @return {JSX.Element} 通報ダイアログを表示するReactコンポーネント
 */
const ReportDialog = ({ className, isOpen, setIsOpen, post }: ReportDialogProps) => {
  const [report, setReport] = useState('');
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false); // 通報失敗のダイアログの表示状態
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false); // 通報成功のダイアログの表示状態
  const MAX_REPORT_LENGTH = 255; // 通報内容の最大文字数
  const MIN_REPORT_LENGTH = 10; // 通報内容の最小文字数
  // セッションの取得
  const session = useSession();
  // ログイン状態
  const isLoggedIn = session.status === 'authenticated';
  const userId = isLoggedIn ? session.data?.user_id : undefined;
  const [profile, setProfile] = useState<ProfileTypes | undefined>(undefined);

  // ダイアログが開かれるたびにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setReport('');
    }
  }, [isOpen]);

  // ユーザIDからプロフィールをFetchする
  useEffect(() => {
    const getProfile = async () => {
      if (!userId) return;
      const data = await fetchProfile({
        targetUserId: userId as string,
        userId: session.data?.user_id ?? '',
      });
      setProfile(data);
    };
    getProfile();
  }, [userId, session.data?.user_id]);

  const handleReport = useCallback(async () => {
    try {
      await reportToDiscord({ message: report, post: post, user: profile });
      setIsSuccessDialogOpen(true);
    } catch (error) {
      setIsErrorDialogOpen(true);
      console.error('通報中にエラーが発生しました:', error);
    }
  }, [report, post, profile]);

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
            短歌を通報する
          </Dialog.Title>

          {/* 通報内容 */}
          <div className='mb-6'>
            <label htmlFor='report' className='mb-1 block text-sm font-semibold text-gray-700'>
              通報内容
            </label>
            <div className='relative flex items-center'>
              <textarea
                id='report'
                rows={4}
                value={report}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue.length <= MAX_REPORT_LENGTH) {
                    setReport(inputValue);
                  } else {
                    setReport(inputValue.slice(0, MAX_REPORT_LENGTH));
                  }
                }}
                className='w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-red-500 focus:outline-none'
              />
              <span className='absolute bottom-2 right-3 flex select-none items-center text-sm text-red-500'>
                {report.length - MIN_REPORT_LENGTH}
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
              className='rounded-md bg-red-400 px-4 py-2 text-sm text-white shadow hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
              onClick={handleReport}
              disabled={report.length < MIN_REPORT_LENGTH || !profile}
            >
              通報
            </button>
          </div>
          <CustomDialog
            isOpen={isErrorDialogOpen}
            description='通報に失敗しました。時間をおいてやり直してみてください。'
            isOnlyOK={true}
            yesCallback={() => {
              setIsErrorDialogOpen(false);
            }}
            yesText='はい'
          />
          <CustomDialog
            isOpen={isSuccessDialogOpen}
            description='通報が完了しました。ご協力ありがとうございました。'
            isOnlyOK={true}
            yesCallback={() => {
              setIsSuccessDialogOpen(false);
              setIsOpen?.(false);
            }}
            yesText='はい'
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ReportDialog;
