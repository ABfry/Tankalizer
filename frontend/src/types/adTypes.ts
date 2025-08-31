export type AdType = {
  id: string;
  type: 'ad';
  adSlot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: {
    display: string;
    width?: string;
    height?: string;
  };
};

export type TimelineItemType = import('./postTypes').PostTypes | AdType;

export const isAd = (item: TimelineItemType): item is AdType => {
  return 'type' in item && item.type === 'ad';
};