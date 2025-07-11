import { redirect } from 'next/navigation';
import { signIn, providerMap } from '@/auth/config';
import { AuthError } from 'next-auth';
import React from 'react';
import Image from 'next/image';

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  // ボタンに表示するテキストを定義しておくと便利です
  const providerDisplayNames: { [key: string]: string } = {
    github: 'ぎっとはぶ でログイン',
    google: 'ぐーぐる でログイン',
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center '>
      {/* ヘッダ */}
      <div className='fixed top-0 z-40 flex h-12 w-full items-center justify-center bg-white font-kokuryu text-2xl'>
        <div className=''>Tankalizer</div>
      </div>

      <div className='fixed left-0 top-0 z-[-1] h-screen w-full opacity-20'>
        <Image src='/bg.jpg' alt='Background' fill className='object-cover' />
      </div>

      <div className='w-full max-w-md rounded-xl border border-gray-300 bg-white p-6 shadow-lg'>
        <h1 className='mb-6 text-center font-shinryu text-4xl'>共に歌を詠まん</h1>

        {/* ボタンをまとめるコンテナに space-y を使い、ボタン間のスペースを確保 */}
        <div className='space-y-4'>
          {Object.values(providerMap).map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                'use server';
                try {
                  await signIn(provider.id, {
                    redirectTo: callbackUrl ?? '',
                  });
                } catch (error) {
                  if (error instanceof AuthError) {
                    return redirect(`${process.env.AUTH_URL}?error=${error.type}`);
                  }
                  throw error;
                }
              }}
            >
              <button
                type='submit'
                className='w-full rounded-lg bg-amber-500 py-3 font-medium text-white shadow-md transition duration-300 hover:bg-amber-600'
              >
                {/* provider.id に応じて動的にテキストを表示 */}
                <span>{providerDisplayNames[provider.id] || `${provider.name} でログイン`}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
