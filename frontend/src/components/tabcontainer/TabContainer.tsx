'use client';
import React, { ReactNode, useState } from 'react';
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

  const onClickTabItem = (newIndex: number) => {
    setActiveId(newIndex);
  };

  return (
    <div className='mx-auto max-w-sm pt-10 lg:max-w-lg'>
      <TabBar items={items} callbackTabClick={onClickTabItem} activeIndex={activeId} />
      <AnimatePresence mode='wait'>
        {items.map((item, index) => {
          return index === activeId ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut', delay: 0 }}
              key={index}
            >
              {item.content}
            </motion.div>
          ) : null;
        })}
      </AnimatePresence>
    </div>
  );
};

export default TabContainer;
