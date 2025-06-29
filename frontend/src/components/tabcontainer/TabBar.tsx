'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TabItem } from './TabContainer';

interface TabBarProps {
  items: TabItem[];
  callbackTabClick: (id: number) => void;
  activeIndex: number;
}

const TabBar = ({ items, callbackTabClick, activeIndex }: TabBarProps) => {
  return (
    <div className='relative'>
      <ul className='flex w-full'>
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={index}
              className={`
                relative flex-1 cursor-pointer rounded-md py-2
                text-center transition-colors duration-300 hover:bg-black/5
                ${isActive ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-700'}
              `}
              onClick={() => callbackTabClick(index)}
            >
              {item.title}
            </li>
          );
        })}
      </ul>

      {/* あにめーしょん下線 */}
      <motion.div
        className='absolute bottom-0 h-0.5 bg-orange-400'
        initial={false}
        animate={{
          left: `${(activeIndex / items.length) * 100}%`,
          width: `${100 / items.length}%`,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
      />
    </div>
  );
};

export default TabBar;
