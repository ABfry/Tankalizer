'use server';

import { getImageUrl } from '@/lib/utils';
import { PostTypes } from '@/types/postTypes';
import { Profile } from 'next-auth';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

const reportToDiscord = async ({
  message,
  post,
  user,
}: {
  message: string;
  post: PostTypes;
  user: Profile | undefined;
}) => {
  if (!webhookUrl) {
    console.log('Discord webhook URLが設定されていません。');
    return;
  }

  const imageUrl = getImageUrl(post.imageUrl);
  const shareLink = `${baseUrl}/post/${post.id}`;

  // DiscordのEmbed形式に合わせたオブジェクトを作成
  type DiscordEmbed = {
    title: string;
    color: number;
    fields: { name: string; value: string; inline: boolean }[];
    timestamp: string;
    image?: { url: string };
  };

  // 通報内容をDiscordのEmbed形式に変換
  const embed: DiscordEmbed = {
    title: `Tankalizerで通報がありました！`,
    color: 0xff0000,
    fields: [
      { name: '通報者', value: user?.name ?? '取得できませんでした。', inline: false },
      {
        name: '通報者ID',
        value: user?.userId?.toString() ?? '取得できませんでした。',
        inline: false,
      },
      { name: '通報内容', value: message, inline: false },
      { name: 'ポストID', value: post.id.toString(), inline: false },
      { name: '投稿者', value: post.user.name, inline: false },
      { name: '投稿者ID', value: post.user.userId.toString(), inline: false },
      { name: '短歌', value: post.tanka.toString(), inline: false },
      { name: '原文', value: post.original, inline: false },
      { name: '投稿リンク', value: shareLink, inline: false },
    ],
    timestamp: new Date().toISOString(),
  };

  // 画像がある場合はEmbedに追加
  if (post.imageUrl) {
    embed.image = { url: imageUrl };
  }

  // DiscordのWebhookにPOSTリクエストを送信
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      embeds: [embed],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`Discord webhook error ${response.status}: ${errorText}`);
  }
};

export default reportToDiscord;
