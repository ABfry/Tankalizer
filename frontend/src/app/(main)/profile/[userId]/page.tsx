import React from 'react';

import ProfileBox from './_components/ProfileBox';
import Timeline from '@/components/Timeline';
import TabContainer from '@/components/tabcontainer/TabContainer';

/**
 * 指定されたIDのユーザのプロフィールを表示する．
 * @async
 * @function Profile
 * @returns {JSX.Element} プロフィールを表示するReactコンポーネント
 */
const Profile = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;

  return (
    <div>
      <div className='mx-auto max-w-sm pt-10 lg:max-w-lg'>
        <ProfileBox userId={userId} />
        <TabContainer
          items={[
            {
              title: '投稿',
              content: <Timeline limit={10} max={100} targetUserId={userId ?? ''} />,
            },
            {
              title: '仮1',
              content: <div>aaaa</div>,
            },
            {
              title: '仮2',
              content: <div>bbbb</div>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Profile;
