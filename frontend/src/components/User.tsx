// クライアントコンポーネント
'use client';

import React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { ProfileTypes } from '@/types/profileTypes';
import { useSession } from 'next-auth/react';
import Dialog from '@/components/Dialog';
import LoginDialog from './LoginDialog';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';
import { follow, unfollow } from '@/app/(main)/profile/[userId]/actions/FollowunFollow';

// props の型定義
interface UserProps {
  profile: ProfileTypes;
  className?: string;
}

/**
 * 単一のユーザを表示するコンポーネント
 * @component User
 * @param {UserProps} props - ユーザデータを含むオブジェクト
 * @return {JSX.Element} 投稿を表示するReactコンポーネント
 */
const User = ({ profile, className }: UserProps) => {
  // ユーザアイコン
  const userIconUrl = getImageUrl(profile.iconUrl ?? '');
  // 推し解除確認ダイアログの表示状態
  const [dialogOpen, setDialogOpen] = useState(false);
  // 推し解除失敗ダイアログの表示状態
  const [unfollowFailedDialogOpen, setUnfollowFailedDialogOpen] = useState(false);
  // セッションの取得
  const session = useSession();
  // ログイン促進ダイアログの開閉状態
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  // フォロー状態
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  // 自分自身かどうかの判定
  const isMyProfile = session.data?.user_id === profile.userId;

  const router = useRouter();

  return (
    <div className={`${className} border-b border-gray-500 p-4`}>
      {/* プロフィールアイコン */}
      <div className='mb-3 flex flex-nowrap items-center'>
        <Image
          src={userIconUrl !== '' ? userIconUrl : '/iconDefault.png'}
          height={50}
          width={50}
          alt='Icon'
          onClick={() => router.push(`/profile/${profile.userId}`)}
          className='cursor-pointer rounded-full hover:brightness-75'
        />
        <div
          className='ml-2 flex min-w-0 flex-1 cursor-pointer items-center'
          onClick={() => router.push(`/profile/${profile.userId}`)}
        >
          <p className='truncate text-lg text-black hover:underline'>{profile.name}</p>
          {profile.isDeveloper && (
            <Image
              src='/developer.png'
              height={40}
              width={40}
              alt='Developer Badge'
              className='ml-2'
            />
          )}
        </div>
        {!isMyProfile && (
          <button
            className={`ml-auto shrink-0 rounded-full px-4 py-2 ${
              isFollowing
                ? 'bg-orange-400 text-white hover:bg-orange-500'
                : 'border border-gray-300 bg-white/70 text-black hover:bg-gray-100/70'
            }`}
            onClick={async () => {
              if (session.status !== 'authenticated') {
                setLoginDialogOpen(true);
                return;
              }
              // ログイン済みなら，推し登録・解除の処理を行う
              if (isFollowing) {
                setDialogOpen(true);
              } else {
                const result = await follow({
                  followerId: session.data?.user_id ?? '',
                  followeeId: profile.userId,
                });
                if (result) {
                  setIsFollowing(true);
                }
              }
            }}
          >
            {isFollowing ? '推し解除' : '推す！'}
          </button>
        )}
      </div>
      <p className='ml-[58px] text-gray-600'>{profile.bio}</p>
      {/* 推し解除確認ダイアログ表示が有効の場合，ダイアログを表示する */}
      <Dialog
        isOpen={dialogOpen}
        title='推し解除'
        description='このユーザを推しから外しますか？'
        yesCallback={async () => {
          console.log('はい');
          const result = await unfollow({
            followerId: session.data?.user_id ?? '',
            followeeId: profile.userId,
          });
          if (!result) {
            setUnfollowFailedDialogOpen(true);
          } else {
            setIsFollowing(false);
          }
          setDialogOpen(false);
        }}
        noCallback={() => {
          console.log('いいえ');
          setDialogOpen(false);
        }}
        yesText='はい'
        noText='いいえ'
      />
      {/* 推し解除失敗ダイアログ表示が有効の場合，ダイアログを表示する */}
      <Dialog
        isOpen={unfollowFailedDialogOpen}
        title='エラー'
        description='推しの解除に失敗しました。時間をおいてやり直してみてください。'
        yesCallback={() => {
          setUnfollowFailedDialogOpen(false);
        }}
        yesText='はい'
        isOnlyOK
      />
      {/* ログイン確認ダイアログ表示が有効の場合，ダイアログを表示する */}
      <LoginDialog isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} />
    </div>
  );
};

export default User;
