'use client';

import { useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import ScrollableList from '@/components/ScrollableList';
import { ProfileTypes } from '@/types/profileTypes';
import User from '@/components/User';
import { motion } from 'framer-motion';
import {
  fetchMutuals,
  fetchFollowing,
} from '@/app/(main)/profile/[userId]/actions/fetchFollowings';

// props の型定義
interface UserListProps {
  profile: ProfileTypes;
  limit: number;
  max: number;
  mode?: 'mutuals' | 'following';
  className?: string;
}

/**
 * ユーザリストを表示するコンポーネント
 * @component UserList
 * @param {UserListProps} props - ユーザリストのデータを含むオブジェクト
 * @return {JSX.Elements} ユーザリストを表示するReactコンポーネント
 */
const UserList = ({ profile, limit, max, mode = 'mutuals', className }: UserListProps) => {
  // ユーザーデータの配列
  const [users, setUsers] = useState<ProfileTypes[]>([]);
  // ユーザ取得時のオフセットID
  const offsetIdRef = useRef('');
  // これ以上取得できるユーザがあるかのフラグ
  const [hasMore, setHasMore] = useState(true);
  // セッションの取得
  const session = useSession();
  // ユーザ取得の重複実行を防ぐためのref
  const isFetchingRef = useRef(false);

  // ラベル定義
  const LABELS = {
    loading: 'ユーザを取得中...',
    noMore: 'これ以上ユーザを取得できません。',
    toTop: '一番上に戻る',
  };

  /**
   * 追加のユーザデータを取得し，状態を更新する非同期関数のCallback Ref
   * @async
   * @function loadMoreUsers
   * @returns {Promise<void>} ユーザデータの取得と状態更新が完了するPromise
   */
  const loadMoreUsers = useCallback(async () => {
    // セッションロード中ならユーザ取得をしない
    if (session.status === 'loading') return;
    // ユーザ取得中なら重複実行しない
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // ユーザーデータを取得
    let newUsers;
    if (mode === 'mutuals') {
      newUsers = await fetchMutuals({
        limit: limit,
        cursor: offsetIdRef.current,
        targetUserId: profile.userId ?? '',
        userId: session.data?.user_id ?? '',
      });
    } else {
      newUsers = await fetchFollowing({
        limit: max,
        cursor: offsetIdRef.current,
        targetUserId: profile.userId ?? '',
        userId: session.data?.user_id ?? '',
      });
    }
    console.log('取得したユーザ数:', newUsers);
    if (newUsers && newUsers.length > 0) {
      setUsers((prevUsers) => {
        const updatedUsers = [...prevUsers, ...newUsers];
        if (updatedUsers.length >= max) {
          setHasMore(false);
        }
        return updatedUsers;
      });
      offsetIdRef.current = newUsers[newUsers.length - 1].userId;
      // 取得したユーザ数がlimit未満の場合は，これ以上取得できるユーザは無い．
      if (newUsers.length < limit) {
        setHasMore(false);
      }
    } else {
      // ユーザが取得できなかった場合は，これ以上取得できるユーザは無いとする．
      setHasMore(false);
    }
    isFetchingRef.current = false;
  }, [session.status, session.data?.user_id, mode, limit, profile.userId, max]);

  return (
    <ScrollableList
      items={users}
      renderItem={(user, i) => (
        <motion.div
          key={user.userId ?? i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <User profile={user} className='' />
        </motion.div>
      )}
      loadMore={loadMoreUsers}
      hasMore={hasMore}
      labels={LABELS}
      className={className}
    />
  );
};

export default UserList;
