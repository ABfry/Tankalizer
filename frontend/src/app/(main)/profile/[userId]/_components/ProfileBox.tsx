'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { ProfileTypes } from '@/types/profileTypes';
import { follow, unfollow } from '../actions/FollowunFollow';
import { getImageUrl } from '@/lib/utils';
import ProfileEditor from '@/components/ProfileEditor';
import { useSession } from 'next-auth/react';

export interface ProfileBoxProps {
  profile?: ProfileTypes;
  userId: string;
}

const ProfileBox = ({ profile, userId }: ProfileBoxProps) => {
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  // セッションの取得
  const session = useSession();
  const iconUrl = getImageUrl(profile?.iconUrl ?? '');

  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsFavorited(profile.isFollowing);
    }
  }, [profile]);

  const handleFavoriteClick = async () => {
    if (!session.data?.user_id || !userId) return;

    const requestData = {
      followerId: session.data.user_id,
      followeeId: userId,
    };

    if (isFavorited) {
      // 現在フォローしている場合、アンフォローする
      const result = await unfollow(requestData);
      if (result) {
        setIsFavorited(false);
      }
    } else {
      // 現在フォローしていない場合、フォローする
      const result = await follow(requestData);
      if (result) {
        setIsFavorited(true);
      }
    }
  };

  // totalPost に応じた背景色のクラスを決定
  const getBackgroundClass = () => {
    const totalPost = profile?.totalPost || 0;

    if (totalPost >= 200) return 'from-purple-700'; // 紫色
    if (totalPost >= 150) return 'from-purple-300'; // 淡い紫色
    if (totalPost >= 100) return 'from-blue-500'; // 青色
    if (totalPost >= 75) return 'from-cyan-300'; // 水色
    if (totalPost >= 50) return 'from-red-700'; // 濃い赤色
    if (totalPost >= 30) return 'from-red-300'; // 淡い赤色
    if (totalPost >= 10) return 'from-yellow-500'; // 濃い黄色
    return 'from-amber-100'; // デフォルト
  };

  // totalMiyabi に応じた画像パスを決定
  const getImageSrc = () => {
    const totalMiyabi = profile?.totalMiyabi || 0;

    if (totalMiyabi >= 250) return '/1.png';
    if (totalMiyabi >= 200) return '/2.png';
    if (totalMiyabi >= 175) return '/3.png';
    if (totalMiyabi >= 150) return '/4.png';
    if (totalMiyabi >= 125) return '/5.png';
    if (totalMiyabi >= 100) return '/6.png';
    if (totalMiyabi >= 75) return '/7.png';
    if (totalMiyabi >= 50) return '/8.png';
    if (totalMiyabi >= 30) return '/9.png';
    if (totalMiyabi >= 20) return '/10.png';
    if (totalMiyabi >= 10) return '/11.png';
    return '/12.png'; // デフォルト（条件を満たさない場合）
  };

  return (
    <div
      className={`relative mx-4 rounded-2xl border-2 border-gray-300 bg-gradient-to-r ${getBackgroundClass()} to-amber-50 shadow-lg`}
    >
      <div className='border-b border-gray-300 py-2 text-center text-xl font-semibold text-gray-700'>
        プロフィール
      </div>
      <div className='space-y-6 p-10'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='relative pt-10'>
            <Image
              src={iconUrl !== '' ? iconUrl : '/iconDefault.png'}
              alt='プロフィール画像'
              width={100}
              height={100}
              className='z-10 rounded-full border-2 border-gray-300'
            />
            {profile?.isDeveloper && (
              <Image
                src='/developer.png'
                alt='Developer Badge'
                width={50}
                height={50}
                className='absolute bottom-[-10px] right-[-30px] z-20'
              />
            )}
            {getImageSrc() && (
              <Image
                src={getImageSrc()}
                alt='上の画像'
                width={50}
                height={50}
                className='absolute left-1/2 top-[-20px] z-20 -translate-x-1/2'
              />
            )}
            <div className='absolute inset-0 flex items-center justify-center'>
              <Image
                src='/syodou_fude.png'
                alt='筆'
                width={80}
                height={80}
                className='absolute left-[-110px] top-[-20px] size-[100px] md:left-[-110px]  lg:left-[-140px] '
              />
              <Image
                src='/syodou_sumi_bou.png'
                alt='墨棒'
                width={100}
                height={100}
                className='absolute bottom-[-40px] right-[-100px] size-[140px] md:right-[-100px] lg:right-[-140px]'
              />
              <Image
                src='/syodou_suzuri.png'
                alt='硯'
                width={80}
                height={80}
                className='absolute bottom-[-100px] left-[-110px] size-[100px] md:left-[-110px]  lg:left-[-140px] '
              />
            </div>
          </div>
          <div className='w-full space-y-2 text-center'>
            <label htmlFor='name' className='block text-lg text-gray-700'>
              {profile?.name ?? '取得中'}
            </label>
            <div className='mt-4 text-gray-600'>
              <p>総獲得雅数: {profile?.totalMiyabi ?? '取得中'}</p>
              <p>総詠歌数: {profile?.totalPost ? `${profile.totalPost}首` : '取得中'}</p>
            </div>
            <p className='pt-5 text-gray-600'>{profile?.bio}</p>
            {session.status === 'authenticated' && session.data?.user_id !== userId && (
              <div className='mt-4 flex justify-center'>
                <button
                  onClick={handleFavoriteClick}
                  className='relative flex items-center justify-center rounded-full p-4 text-yellow-400 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-yellow-400/20 active:scale-95'
                  aria-label='お気に入りに追加'
                >
                  <svg
                    className='size-24'
                    viewBox='0 0 24 24'
                    fill={isFavorited ? 'url(#rainbow)' : 'currentColor'}
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <defs>
                      <linearGradient
                        id='rainbow'
                        x1='0%'
                        y1='0%'
                        x2='200%'
                        y2='0%'
                        gradientUnits='objectBoundingBox'
                      >
                        <animateTransform
                          attributeName='gradientTransform'
                          type='translate'
                          from='0 0'
                          to='-1 0'
                          dur='3s'
                          repeatCount='indefinite'
                        />
                        <stop offset='0%' stopColor='#ff0000' />
                        <stop offset='8.33%' stopColor='#ff7f00' />
                        <stop offset='16.66%' stopColor='#ffff00' />
                        <stop offset='25%' stopColor='#00ff00' />
                        <stop offset='33.33%' stopColor='#0000ff' />
                        <stop offset='41.66%' stopColor='#8b00ff' />
                        <stop offset='50%' stopColor='#ff0000' />
                        <stop offset='58.33%' stopColor='#ff7f00' />
                        <stop offset='66.66%' stopColor='#ffff00' />
                        <stop offset='75%' stopColor='#00ff00' />
                        <stop offset='83.33%' stopColor='#0000ff' />
                        <stop offset='91.66%' stopColor='#8b00ff' />
                        <stop offset='100%' stopColor='#ff0000' />
                      </linearGradient>
                    </defs>
                    <path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z' />
                  </svg>
                  <span className='absolute text-lg font-bold text-black'>推し</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className='absolute right-2 top-6'>
          {session.data?.user_id === userId && (
            <button
              onClick={() => setProfileEditorOpen(true)}
              className='rounded-md border border-gray-400 bg-white/70 px-3 py-1 text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none'
            >
              編集
            </button>
          )}
        </div>
      </div>
      <ProfileEditor
        className=''
        isOpen={profileEditorOpen}
        setIsOpen={setProfileEditorOpen}
        profile={profile ?? undefined}
      />
    </div>
  );
};

export default ProfileBox;
