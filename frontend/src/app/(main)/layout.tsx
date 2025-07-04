import React from 'react';
import HeaderAndMenu from '@/components/HeaderAndMenu';
import MotionWrapper from '@/components/MotionWrapper';
import YomuButton from '@/components/YomuButton';
import { TransitionProvider } from '@/contexts/TransitionContext';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TransitionProvider>
      <HeaderAndMenu />
      <MotionWrapper>{children}</MotionWrapper>
      <YomuButton />
    </TransitionProvider>
  );
};

export default MainLayout;
