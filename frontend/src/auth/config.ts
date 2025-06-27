import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';

const isDevelopment = process.env.NODE_ENV === 'development';

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
      console.log(process.env.BACKEND_URL);
      if (trigger === 'signIn' && user && account) {
        try {
          const formData = new FormData();
          formData.append('name', user.name || '');
          formData.append('oauth_app', account.provider as 'github' | 'google');
          formData.append('connect_info', user.email || '');

          const res = await fetch(`${process.env.BACKEND_URL}/user`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            console.error('Backend user creation failed', res);
            throw new Error('Backend user creation failed');
          }

          // ユーザー作成に成功した場合，ユーザーIDをトークンに追加する
          const data = await res.json();
          token.user_id = data.id;
        } catch (error) {
          console.error('Failed to create user:', error);
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
