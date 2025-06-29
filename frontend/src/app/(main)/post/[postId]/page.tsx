import React from 'react';
import { auth } from '@/auth/config';
import fetchOnePost from './actions/fetchOnePost';
import PostPage from './PostPage';
import { notFound } from 'next/navigation';

const tankaToString = (tanka: string[]) => {
  return tanka.join(' ');
};

export const generateMetadata = async (context: { params: Promise<{ postId: string }> }) => {
  const params = await context.params;

  const post = await fetchOnePost({
    userId: '',
    postId: params.postId,
  });

  if (!post) return { title: '投稿が見つかりません' };

  return {
    title: `Tankalizer: ${post.user.name}さんの短歌`,
    description: tankaToString(post.tanka),
  };
};

/**
 * 指定されたIDの投稿を表示する．
 * @async
 * @function Post
 * @returns {JSX.Element} プロフィールを表示するReactコンポーネント
 */
const Page = async (context: { params: Promise<{ postId: string }> }) => {
  const params = await context.params;
  const session = await auth();

  const post = await fetchOnePost({
    userId: session?.user_id ?? '',
    postId: params.postId,
  });

  if (!post) notFound();

  return (
    <div>
      <PostPage post={post} />
    </div>
  );
};

export default Page;
