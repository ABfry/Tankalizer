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
    jwt: async ({ token, user, trigger }) => {
      if (trigger === 'signIn' && user) {
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: user.name,
              icon: user.image,
            }),
          });

          if (!res.ok) {
            throw new Error('Backend user creation failed');
          }

          const data = await res.json();
          token.user_id = data.user_id;
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
