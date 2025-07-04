'use server';

import { getImageUrl } from '@/lib/utils';
import { PostTypes } from '@/types/postTypes';

const reportToDiscord = async ({ message, post }: { message: string; post: PostTypes }) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('Discord webhook URLが設定されていません。');
    return;
  }

  const imageUrl = getImageUrl(post.imageUrl);

  // DiscordのEmbed形式に合わせたオブジェクトを作成
  type DiscordEmbed = {
    title: string;
    color: number;
    description: string;
    fields: { name: string; value: string; inline: boolean }[];
    timestamp: string;
    image?: { url: string };
  };

  // 通報内容をDiscordのEmbed形式に変換
  const embed: DiscordEmbed = {
    title: `Tankalizerで通報がありました！`,
    color: 0xff0000,
    description: message,
    fields: [
      { name: 'ポストID', value: post.id.toString(), inline: false },
      { name: 'ユーザー名', value: post.user.name, inline: false },
      { name: 'ユーザーID', value: post.user.userId.toString(), inline: false },
      { name: '短歌', value: post.tanka.toString(), inline: false },
      { name: '原文', value: post.original, inline: false },
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
