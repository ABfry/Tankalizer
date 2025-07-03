'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

// props の型定義
interface ScrollableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  labels?: {
    loading?: string;
    noMore?: string;
    toTop?: string;
  };
  className?: string;
}

/**
 * スクロール可能なリストを表示するコンポーネント
 * @component ScrollableList
 * @param {ScrollableListProps} props - スクロール可能なリストのデータを含むオブジェクト
 * @return {JSX.Elements} スクロール可能なリストを表示するReactコンポーネント
 */
const ScrollableList = <T,>({
  items,
  renderItem,
  loadMore,
  hasMore,
  labels = {},
  className,
}: ScrollableListProps<T>) => {
  //IntersectionObserverを保持するためのref
  const observer = useRef<IntersectionObserver | null>(null);
  // 一番上まで戻るボタンの表示状態
  const [showTopButton, setShowTopButton] = useState(false);

  // デフォルトのラベル
  const loadingText = labels?.loading ?? '読み込み中...';
  const noMoreText = labels?.noMore ?? 'これ以上読み込めません。';
  const toTopText = labels?.toTop ?? '一番上に戻る';

  // ターゲットの要素を監視するためのcallback ref
  const targetRef = useCallback(
    (node: HTMLDivElement | null) => {
      // 前回の監視を解除
      if (observer.current) observer.current.disconnect();
      // IntersectionObserverを作成
      observer.current = new IntersectionObserver(async (entries) => {
        // ターゲット要素が画面内に入り，かつまだ取得できる投稿があれば
        if (entries[0].isIntersecting && hasMore) await loadMore();
      });
      //nodeが存在する場合，監視を開始
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMore]
  );

  // スクロールを監視するためのイベントリスナーの追加
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`${className}`}>
      {items.map(renderItem)}
      {hasMore && <p className='py-3 text-center'>{loadingText}</p>}
      <div ref={targetRef} className='h-px' />
      {!hasMore && <p className='py-3 text-center'>{noMoreText}</p>}
      <AnimatePresence mode='wait'>
        {showTopButton && (
          <motion.div
            initial={{ opacity: 0, x: '-50%', y: -10 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, x: '-50%', y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className='fixed left-1/2 top-12 my-5 flex items-center justify-center rounded-xl bg-orange-400 px-3 hover:bg-orange-500'
          >
            <FaArrowUp color='white' />
            <a className='py-1 pl-1 text-white hover:cursor-pointer'>{toTopText}</a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollableList;
