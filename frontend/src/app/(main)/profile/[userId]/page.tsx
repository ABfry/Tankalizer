'use client';
import React from 'react';
import { useParams } from 'next/navigation';

import ProfileBox from './_components/ProfileBox';
import Timeline from '@/components/Timeline';

/**
 * 指定されたIDのユーザのプロフィールを表示する．
 * @async
 * @function Profile
 * @returns {JSX.Element} プロフィールを表示するReactコンポーネント
 */
const Profile = () => {
  const { userId } = useParams() as { userId: string };

  return (
    <div>
      <div className='mx-auto max-w-sm pt-10 lg:max-w-lg'>
        <ProfileBox userId={userId} />
        <Timeline limit={10} max={100} targetUserId={userId ?? ''} />
      </div>
    </div>
  );
};

export default Profile;
