'use client';

import React, { useState, useEffect } from 'react';

import ProfileBox from './_components/ProfileBox';
import Timeline from '@/components/Timeline';
import TabContainer from '@/components/tabcontainer/TabContainer';
import UserList from '@/components/UserList';
import { ProfileTypes } from '@/types/profileTypes';
import fetchProfile from './actions/fetchProfile';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

/**
 * 指定されたIDのユーザのプロフィールを表示する．
 * @async
 * @function Profile
 * @returns {JSX.Element} プロフィールを表示するReactコンポーネント
 */
const Profile = () => {
  const { userId } = useParams() as { userId: string };
  const session = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileTypes | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザIDからプロフィールをFetchする
  useEffect(() => {
    const getProfile = async () => {
      if (!userId) return;
      const data = await fetchProfile({
        targetUserId: userId as string,
        userId: session.data?.user_id ?? '',
      });
      if (!data) {
        router.replace('/user-not-found');
        return;
      }
      setProfile(data);
      setLoading(false);
    };
    getProfile();
  }, [userId, router, session.data?.user_id]);

  if (loading) {
    return <div className='flex items-center justify-center py-10'>ユーザ情報を取得中...</div>;
  }
  if (!profile) {
    return (
      <div className='flex items-center justify-center py-10'>ユーザ情報の取得に失敗しました</div>
    );
  }

  return (
    <div>
      <div className='mx-auto max-w-sm pt-10 lg:max-w-lg'>
        <ProfileBox profile={profile} userId={userId} />
        <TabContainer
          items={[
            {
              title: '投稿',
              content: <Timeline limit={10} max={100} targetUserId={userId ?? ''} />,
            },
            {
              title: 'うたトモ',
              content: <UserList profile={profile} limit={10} max={100} mode='mutuals' />,
            },
            {
              title: '推し歌人',
              content: <UserList profile={profile} limit={10} max={100} mode='following' />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Profile;
