'use client';
import React, { ReactNode, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabBar from './TabBar';

export interface TabItem {
  title: string;
  content: ReactNode;
}

export interface TabBarProps {
  items: TabItem[];
}

const TabContainer = ({ items }: TabBarProps) => {
  const [activeId, setActiveId] = useState<number>(0); // 一番左初期値
  const [[page, direction], setPage] = useState([0, 0]); // 現在のページ状態の管理

  // タブ切り替え処理
  const switchToTab = useCallback(
    (newIndex: number) => {
      const newDirection = newIndex > activeId ? 1 : -1;
      setPage([newIndex, newDirection]);
      setActiveId(newIndex);
    },
    [activeId]
  );

  // タブ上のスワイプ周り
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className='mx-auto max-w-sm pt-10 lg:max-w-lg'>
      <TabBar items={items} callbackTabClick={switchToTab} activeIndex={activeId} />

      <div className='relative min-h-[300px] overflow-hidden'>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={{
              enter: (direction: number) => {
                return {
                  x: direction > 0 ? '100%' : '-100%',
                  opacity: 0.8,
                };
              },
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
              },
              exit: (direction: number) => {
                return {
                  zIndex: 0,
                  x: direction < 0 ? '100%' : '-100%',
                  opacity: 0.8,
                };
              },
            }}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{
              x: {
                type: 'tween',
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1],
              },
              opacity: { duration: 0.2 },
            }}
            className='absolute inset-0'
            drag='x'
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            // ドラッグ終了時の処理
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x); // 速度・方向の計算
              // 閾値超えてたらタブ移動する
              if (swipe < -swipeConfidenceThreshold) {
                if (activeId < items.length - 1) {
                  switchToTab(activeId + 1);
                }
              } else if (swipe > swipeConfidenceThreshold) {
                if (activeId > 0) {
                  switchToTab(activeId - 1);
                }
              }
            }}
          >
            {items[activeId].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TabContainer;
