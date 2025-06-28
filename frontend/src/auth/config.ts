import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';

const isDevelopment = process.env.NODE_ENV === 'development';

type ProviderType = 'github' | 'google';

const providers: Provider[] = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === 'function') {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== 'credentials');

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers,
  cookies: {
    pkceCodeVerifier: {
      name: isDevelopment
        ? 'next-auth.pkce.code_verifier'
        : '__Secure-next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        path: '/',
        secure: !isDevelopment,
        sameSite: 'lax',
      },
    },
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: async ({ token, user, trigger, account }) => {
      // console.log(process.env.BACKEND_URL);
      if (trigger === 'signIn' && user && account) {
        try {
          const formData = new FormData();
          formData.append('name', user.name || '歌人');
          formData.append('oauth_app', account.provider as ProviderType);
          if (user.email) {
            formData.append('connect_info', user.email);
          } else {
            throw new Error('ユーザのメールアドレスが取得できませんでした');
          }

          // アイコンURLが存在する場合は追加する
          if (user.image) {
            formData.append('icon_url', user.image);
          }

          const res = await fetch(`${process.env.BACKEND_URL}/user`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            console.error('ユーザの作成に失敗しました:', res);
            throw new Error('ユーザの作成に失敗しました');
          }

          // ユーザー作成に成功した場合，ユーザーIDをトークンに追加する
          const data = await res.json();
          token.user_id = data.user.id;
        } catch (error) {
          console.error('ユーザの作成に失敗しました:', error);
          throw error;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.user_id) {
        session.user_id = token.user_id;
      }
      return session;
    },
  },
});
