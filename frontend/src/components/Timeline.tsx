'use client';

import { useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PostTypes } from '@/types/postTypes';
import { AdType, TimelineItemType } from '@/types/adTypes';
import PostList from '@/components/PostList';
import ScrollableList from '@/components/ScrollableList';
import {
  fetchPosts,
  fetchRanking,
  fetchPostsForFollowing,
} from '@/app/(main)/timeline/actions/fetchPosts';

// props の型定義
interface TimelineProps {
  limit: number;
  max: number;
  targetUserId?: string;
  mode?: 'ranking' | 'timeline' | 'following';
  className?: string;
}

/**
 * タイムラインを表示するコンポーネント
 * @component Timeline
 * @param {TimelineProps} props - タイムラインのデータを含むオブジェクト
 * @return {JSX.Elements} タイムラインを表示するReactコンポーネント
 */
const Timeline = ({ limit, max, targetUserId, mode = 'timeline', className }: TimelineProps) => {
  // 投稿データの配列
  const [, setPosts] = useState<PostTypes[]>([]);
  // タイムライン項目（投稿+広告）の配列
  const [timelineItems, setTimelineItems] = useState<TimelineItemType[]>([]);
  // 投稿取得時のオフセットID
  const offsetIdRef = useRef('');
  // これ以上取得できる投稿があるかのフラグ
  const [hasMore, setHasMore] = useState(true);
  // セッションの取得
  const session = useSession();
  // 投稿取得の重複実行を防ぐためのref
  const isFetchingRef = useRef(false);

  // ラベル定義
  const LABELS = {
    loading: '短歌を取得中...',
    noMore: 'これ以上短歌を取得できません。',
    toTop: '最新の短歌に戻る',
  };

  // 広告を生成する関数
  const generateAd = (): AdType => {
    const adSlots = ['7312785637'];
    const randomSlot = adSlots[Math.floor(Math.random() * adSlots.length)];

    return {
      id: `ad-${Date.now()}-${Math.random()}`,
      type: 'ad',
      adSlot: randomSlot,
      format: 'auto',
      style: { display: 'block' },
    };
  };

  // 投稿配列に広告をランダム挿入する関数
  const insertAdsInPosts = (posts: PostTypes[]): TimelineItemType[] => {
    const result: TimelineItemType[] = [];

    posts.forEach((post, index) => {
      result.push(post);

      // 3-7投稿ごとに広告を挿入（ランダム間隔）
      if ((index + 1) % (Math.floor(Math.random() * 4) + 3) === 0) {
        result.push(generateAd());
      }
    });

    return result;
  };

  /**
   * 追加の投稿データを取得し，状態を更新する非同期関数のCallback Ref
   * @async
   * @function loadMorePosts
   * @returns {Promise<void>} 投稿データの取得と状態更新が完了するPromise
   */
  const loadMorePosts = useCallback(async () => {
    // セッションロード中なら投稿取得をしない
    if (session.status === 'loading') return;
    // 投稿取得中なら重複実行しない
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // 投稿データを取得
    let newPosts;
    if (mode === 'timeline') {
      newPosts = await fetchPosts({
        limit: limit,
        cursor: offsetIdRef.current,
        filterByUserId: targetUserId,
        userId: session.data?.user_id ?? '',
      });
    } else if (mode === 'following') {
      newPosts = await fetchPostsForFollowing({
        limit: limit,
        cursor: offsetIdRef.current,
        userId: session.data?.user_id ?? '',
      });
    } else if (mode === 'ranking') {
      newPosts = await fetchRanking({
        limit: max,
        userId: session.data?.user_id ?? '',
      });
    }
    if (newPosts && newPosts.length > 0) {
      setPosts((prevPosts) => {
        const updatedPosts = [...prevPosts, ...newPosts];
        if (updatedPosts.length >= max) {
          setHasMore(false);
        }
        return updatedPosts;
      });

      // 新しい投稿に広告を挿入してタイムライン項目に追加
      setTimelineItems((prevItems) => {
        const newItemsWithAds = insertAdsInPosts(newPosts);
        return [...prevItems, ...newItemsWithAds];
      });

      offsetIdRef.current = newPosts[newPosts.length - 1].id;
      // 取得した投稿数がlimit未満の場合は，これ以上取得できる投稿は無い．
      if (newPosts.length < limit) {
        setHasMore(false);
      }
    } else {
      // 投稿が取得できなかった場合は，これ以上取得できる投稿は無いとする．
      setHasMore(false);
    }
    isFetchingRef.current = false;
  }, [limit, max, targetUserId, mode, session.status, session.data?.user_id, insertAdsInPosts]);

  // 見かけ上の投稿を削除する関数
  const deletePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setTimelineItems((prevItems) =>
      prevItems.filter((item) => ('type' in item && item.type === 'ad' ? true : item.id !== postId))
    );
  };

  return (
    <ScrollableList
      items={timelineItems}
      renderItem={(item) => <PostList key={item.id} posts={[item]} onDelete={deletePost} />}
      loadMore={loadMorePosts}
      hasMore={hasMore}
      labels={LABELS}
      className={className}
    />
  );
};

export default Timeline;
