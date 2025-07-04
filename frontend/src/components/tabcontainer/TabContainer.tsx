'use client';
import React, { ReactNode, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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

  // タブ切り替え処理
  const switchToTab = useCallback(
    (newIndex: number) => {
      setActiveId(newIndex);
    },
    []
  );

  // タブ上のスワイプ周り
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className='mx-auto max-w-sm px-3 pt-3 lg:max-w-lg'>
      <TabBar items={items} callbackTabClick={switchToTab} activeIndex={activeId} />

      <div className='relative min-h-[300px] overflow-hidden'>
        {items.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            initial={false}
            animate={{
              x: index === activeId ? 0 : index < activeId ? '-100%' : '100%',
              opacity: index === activeId ? 1 : 0.8,
              display: index === activeId ? 'block' : 'none',
            }}
            transition={{
              x: {
                type: 'tween',
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1],
              },
              opacity: { duration: 0.2 },
            }}
            drag={index === activeId ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              if (index === activeId) {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  if (activeId < items.length - 1) {
                    switchToTab(activeId + 1);
                  }
                } else if (swipe > swipeConfidenceThreshold) {
                  if (activeId > 0) {
                    switchToTab(activeId - 1);
                  }
                }
              }
            }}
          >
            {item.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TabContainer;

// ---- つかいかた ----
// const Tab1 = (): ReactNode => {
//   return <div>コンテンツ1</div>;
// };

// const Tab2 = (): ReactNode => {
//   return <div>コンテンツ2</div>;
// };

// const Tab3 = (): ReactNode => {
//   return <div>コンテンツ3</div>;
// };

// const tabItems: TabItem[] = [
//   {
//     title: 'Tab1',
//     content: <Tab1 />,
//   },
//   {
//     title: 'Tab2',
//     content: <Tab2 />,
//   },
//   {
//     title: 'Tab3',
//     content: <Tab3 />,
//   },
// ];

// const page = () => {
//   return (
//     <TabContainer items={tabItems} />
//   );
// };
