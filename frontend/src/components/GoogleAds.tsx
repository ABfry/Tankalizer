'use client';

import React, { useEffect, useRef } from 'react';
import { AdType } from '@/types/adTypes';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleAdsProps {
  ad: AdType;
}

const GoogleAds = ({ ad }: GoogleAdsProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.dataset.adsbygoogleStatus) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (err) {
        console.error('Google Ads error:', err);
      }
    }
  }, []);

  return (
    <div className='border-b border-gray-500 p-4'>
      <div className='my-4 rounded-lg border border-gray-300 bg-gray-50'>
        <div className='mb-2 text-center text-xs text-gray-500'>広告</div>
        <ins
          ref={adRef}
          className='adsbygoogle'
          style={ad.style || { display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
          data-ad-slot={ad.adSlot}
          data-ad-format={ad.format || 'auto'}
          data-full-width-responsive='true'
        />
      </div>
    </div>
  );
};

export default GoogleAds;
