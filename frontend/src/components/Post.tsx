// クライアントコンポーネント
'use client';

import React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { PostTypes } from '@/types/postTypes';
import ImageModal from '@/components/ImageModal';
import MiyabiButton from '@/components/MiyabiButton';
import DropDownButton from './DropDownButton';
import { formatDateKanji, toKanjiNumber } from '@/app/(main)/timeline/utils/kanjiNumber';
import { MdDeleteForever, MdShare, MdReport } from 'react-icons/md';
import { useSession } from 'next-auth/react';
import Dialog from '@/components/Dialog';
import LoginDialog from './LoginDialog';
import { addMiyabi, removeMiyabi } from '@/app/(main)/timeline/actions/countMiyabi';
import deletePost from '@/app/(main)/timeline/actions/deletePost';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';
import ReportDialog from './ReportDialog';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

// props の型定義
interface PostProps {
  post: PostTypes;
  className?: string;
  onDelete?: (postId: string) => void;
}

/**
 * 単一の投稿を表示するコンポーネント
 * @component Post
 * @param {PostProps} props - 投稿データを含むオブジェクト
 * @return {JSX.Element} 投稿を表示するReactコンポーネント
 */
const Post = ({ post, className, onDelete }: PostProps) => {
  // 短歌をパースする
  const tanka = parseTanka(post.tanka);
  // 投稿に画像が含まれるか
  const hasImage = Boolean(post.imageUrl);
  const imageUrl = getImageUrl(post.imageUrl);
  // ユーザアイコン
  const userIconUrl = getImageUrl(post.user.iconUrl);
  // 雅カウントの状態
  const [miyabiCount, setMiyabiCount] = useState(post.miyabiCount);
  // 画像の拡大表示状態
  const [modalOpen, setModalOpen] = useState(false);
  // 削除確認ダイアログの表示状態
  const [dialogOpen, setDialogOpen] = useState(false);
  // 通報ダイアログの表示状態
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  // コピートーストの表示状態
  const [toastOpen, setToastOpen] = useState(false);
  // 削除失敗ダイアログの表示状態
  const [deleteFailedDialogOpen, setDeleteFailedDialogOpen] = useState(false);
  // ユーザIDが一致するなら自分の投稿
  const isMyPost = useSession().data?.user_id === post.user.userId;
  // ドロップダウンメニューの要素
  const dropDownItems = [];
  // ドロップダウンメニューの投稿共有ボタン
  const dropDownShareButton = {
    label: '短歌を共有',
    onClick: async () => {
      const link = `${baseUrl}/post/${post.id}`;
      try {
        await navigator.clipboard.writeText(link);
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 2000);
      } catch (e) {
        console.error(e);
      }
    },
    className: '',
    icon: <MdShare />,
    color: 'black',
  };
  // ドロップダウンメニューの投稿削除ボタン
  const dropDownDeleteButton = {
    label: '短歌を削除',
    onClick: () => setDialogOpen(true),
    className: '',
    icon: <MdDeleteForever />,
    color: 'red',
  };
  // ドロップダウンに共有ボタン追加
  dropDownItems.push(dropDownShareButton);
  // 自分の投稿ならドロップダウンに削除ボタン追加
  if (isMyPost) {
    dropDownItems.push(dropDownDeleteButton);
  }
  // ドロップダウンメニューの投稿通報ボタン
  const dropDownReportButton = {
    label: '短歌を通報',
    onClick: () => setReportDialogOpen(true),
    className: '',
    icon: <MdReport />,
    color: 'red',
  };
  // 自分の投稿でないならドロップダウンに共有ボタン追加
  if (!isMyPost) {
    dropDownItems.push(dropDownReportButton);
  }
  // セッションの取得
  const session = useSession();
  // ログイン状態
  const isLoggedIn = session.status === 'authenticated';
  // ログイン促進ダイアログの開閉状態
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  // 親の持つPostsから自身を削除する
  const handleDelete = () => {
    onDelete?.(post.id);
  };

  const router = useRouter();

  const getRankBackground = (rank: number | undefined): string => {
    switch (rank) {
      case 1:
        return 'bg-[#E6B422]/75 my-3 mx-4 rounded-xl shadow-lg';
      case 2:
        return 'bg-[#C9CACA]/75 my-3 mx-4 rounded-xl shadow-lg';
      case 3:
        return 'bg-[#B87333]/75 my-3 mx-4 rounded-xl shadow-lg';
      default:
        return 'border-b border-gray-500';
    }
  };

  const [nameLine1, nameLine2] = splitName(post.user.name);

  return (
    <div className={`${className} p-4 ${getRankBackground(post.rank)}`}>
      {/* 雅ランキングでの順位表記 */}
      {post.rank && (
        <p className='text-center text-2xl font-bold text-black'>第{toKanjiNumber(post.rank)}位</p>
      )}
      {/* プロフィールアイコン */}
      <div className='mb-3 flex items-center'>
        <Image
          src={userIconUrl !== '' ? userIconUrl : '/iconDefault.png'}
          height={40}
          width={40}
          alt='Icon'
          onClick={() => router.push(`/profile/${post.user.userId}`)}
          className='cursor-pointer rounded-full hover:brightness-75'
        />
        <div className='ml-2 cursor-pointer items-center'>
          <p
            onClick={() => router.push(`/profile/${post.user.userId}`)}
            className='select-none text-lg text-black hover:underline'
          >
            {post.user.name}
          </p>
        </div>
        {/* 開発者バッジ */}
        {post.isDeveloper && (
          <Image
            src='/developer.png'
            height={30}
            width={30}
            alt='Developer Badge'
            className='ml-2'
          />
        )}
        <DropDownButton className='ml-auto flex' items={dropDownItems}></DropDownButton>
      </div>
      {/* アイコン以外 */}
      <div
        className={`relative mx-auto flex aspect-[4/3] w-full items-start justify-center overflow-hidden ${
          hasImage ? 'cursor-pointer' : ''
        }`}
        // 画像をクリックすると拡大表示を有効化
        onClick={() => {
          if (hasImage) setModalOpen(true);
        }}
      >
        <Image
          src={imageUrl}
          fill
          alt='Image'
          className={`rounded-xl object-cover ${hasImage ? 'brightness-50' : ''}`}
        />
        <div className='absolute top-1/2 flex -translate-y-1/2 items-start justify-center'>
          <p
            className={`self-end font-shinryu ${
              hasImage ? 'text-white' : 'text-black'
            } mr-3 text-sm [text-orientation:upright] [writing-mode:vertical-rl] sm:text-sm md:text-base lg:text-lg`}
          >
            {nameLine1}
            {nameLine2 && (
              <>
                <br />
                {'\n\u3000' + nameLine2}
              </>
            )}
          </p>
          <p
            className={`inline-block align-top font-shinryu ${
              hasImage ? 'text-white' : 'text-black'
            } whitespace-pre-line text-xl [text-orientation:upright] [writing-mode:vertical-rl] sm:text-xl md:text-2xl lg:text-3xl`}
          >
            {tanka}
          </p>
        </div>
      </div>
      <p className='mt-3 w-full whitespace-pre-line break-words text-black'>{post.original}</p>
      <div className='mt-3 flex items-center text-black'>
        {formatDateKanji(post.date)}
        <div className='ml-auto flex items-center'>
          <p className='mr-2 text-sm'>{toKanjiNumber(miyabiCount)}</p>
          <MiyabiButton
            size='small'
            onClick={async () => {
              if (isLoggedIn) {
                setMiyabiCount((count) => ++count);
                await addMiyabi({ userId: session.data?.user_id ?? '', postId: post.id });
              } else {
                setLoginDialogOpen(true);
              }
            }}
            onCancel={async () => {
              if (isLoggedIn) {
                setMiyabiCount((count) => --count);
                await removeMiyabi({ userId: session.data?.user_id ?? '', postId: post.id });
              } else {
                setLoginDialogOpen(true);
              }
            }}
            initialIsClicked={post.miyabiIsClicked}
            isAnimationDisabled={!isLoggedIn}
            className='mr-0'
          />
        </div>
      </div>
      {/* 拡大表示が有効の場合，モーダルを表示する */}
      {modalOpen && <ImageModal imageUrl={imageUrl} setModalOpen={setModalOpen} />}
      {/* 削除確認ダイアログ表示が有効の場合，ダイアログを表示する */}
      <Dialog
        isOpen={dialogOpen}
        title='短歌の削除'
        description='この短歌を削除しますか？'
        yesCallback={async () => {
          console.log('はい');
          setDialogOpen(false);
          const result = await deletePost({
            userId: session.data?.user_id ?? '',
            postId: post.id,
          });
          if (!result) setDeleteFailedDialogOpen(true);
          else handleDelete();
        }}
        noCallback={() => {
          console.log('いいえ');
          setDialogOpen(false);
        }}
        yesText='はい'
        noText='いいえ'
      />
      {/* 削除失敗ダイアログ表示が有効の場合，ダイアログを表示する */}
      <Dialog
        isOpen={deleteFailedDialogOpen}
        title='エラー'
        description='短歌の削除に失敗しました。時間をおいてやり直してみてください。'
        yesCallback={() => {
          setDeleteFailedDialogOpen(false);
        }}
        yesText='はい'
        isOnlyOK
      />
      {/* 通報ダイアログ表示が有効の場合，ダイアログを表示する */}
      <ReportDialog isOpen={reportDialogOpen} setIsOpen={setReportDialogOpen} post={post} />
      {/* リンクをコピーした場合，トーストを表示する */}
      <AnimatePresence mode='wait'>
        {toastOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-orange-400 p-2 shadow-lg'
          >
            <p className='text-center text-sm text-white'>リンクをコピーしました</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ログイン確認ダイアログ表示が有効の場合，ダイアログを表示する */}
      <LoginDialog isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} />
    </div>
  );
};

/**
 * 短歌をパースして，改行と全角空白を追加する．
 * @function parseTanka
 * @param {Array<string>} tanka - 短歌の配列
 * @return {string} パースされた短歌の文字列
 */
const parseTanka = (tanka: Array<string>): string => {
  const parsedTanka: string = `${tanka[0]}\n\u3000${tanka[1]}\n\u3000\u3000${tanka[2]}\n${tanka[3]}\n\u3000${tanka[4]}`;
  return parsedTanka;
};

/**
 * 名前を適切な位置で二行に分割する．
 * 半角空白があればそこを区切りとし，なければ文字数の中央で分割。
 * @function splitName
 * @param {string} name - 分割する名前
 * @return {[string, string]} 分割された名前の配列
 */
const splitName = (name: string): [string, string] => {
  // 名前が10文字以下ならそのまま返す
  if (name.length <= 10) {
    return [name, ''];
  }
  // 空白で分割できる場合
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    // 最後の要素を第二行，それ以前を第一行として結合
    return [parts.slice(0, parts.length - 1).join(' '), parts[parts.length - 1]];
  }
  // 空白なしなら二分割
  const mid = Math.floor(name.length / 2);
  return [name.slice(0, mid), name.slice(mid)];
};

export default Post;
