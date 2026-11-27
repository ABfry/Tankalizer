import { OpenAPIHono } from '@hono/zod-openapi';
import { sign } from 'hono/jwt';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AppConfig } from '../config/env.js';
import type { AppEnv, Container } from '../di/container.js';
import { errorHandler } from '../middleware/errorHandler.js';
import router from './route.js';

const SECRET = 'test-secret-that-is-long-enough-32';

const config = {
  NODE_ENV: 'test',
  BACKEND_JWT_SECRET: SECRET,
  JWT_ISSUER: 'tankalizer-web',
  JWT_AUDIENCE: 'tankalizer-api',
} as AppConfig;

// どのサービスのどのメソッドも、呼ばれた引数を記録して空配列を返す
let calls: { method: string; args: unknown[] }[] = [];
const service = new Proxy(
  {},
  {
    get:
      (_target, method) =>
      async (...args: unknown[]) => {
        calls.push({ method: String(method), args });
        return [];
      },
  }
);
const container = new Proxy({}, { get: () => service }) as Container;

const createApp = () => {
  const app = new OpenAPIHono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('config', config);
    c.set('container', container);
    await next();
  });
  app.route('/', router);
  app.onError(errorHandler);
  return app;
};

const bearer = async (sub: string) => {
  const now = Math.floor(Date.now() / 1000);
  const token = await sign(
    { sub, iss: config.JWT_ISSUER, aud: config.JWT_AUDIENCE, iat: now, exp: now + 300 },
    SECRET,
    'HS256'
  );
  return { Authorization: `Bearer ${token}` };
};

const postJson = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

beforeEach(() => {
  calls = [];
});

describe('OpenAPI ドキュメント', () => {
  const doc = createApp().getOpenAPI31Document({
    openapi: '3.1.0',
    info: { title: 'Tankalizer API', version: '1.0.0' },
  });

  it('すべてのルートが載る', () => {
    expect(Object.keys(doc.paths ?? {}).sort()).toEqual(
      [
        '/news',
        '/v2/follow',
        '/v2/miyabi',
        '/v2/miyabiranking',
        '/v2/post',
        '/v2/profile',
        '/v2/profile/following',
        '/v2/profile/mutual-following',
        '/v2/share',
        '/v2/timeline',
        '/v2/timeline/following',
        '/v2/unfollow',
        '/v2/user',
      ].sort()
    );
  });

  it('.openapi() で付けた説明と、制約・既定値が出力される', () => {
    const timeline = doc.paths?.['/v2/timeline']?.post?.requestBody;
    expect(timeline).toMatchObject({
      content: {
        'application/json': {
          schema: {
            properties: {
              limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
                example: 10,
                description: '取得する投稿の数',
              },
            },
          },
        },
      },
    });

    const createPost = doc.paths?.['/v2/post']?.post?.requestBody;
    expect(createPost).toMatchObject({
      content: {
        'multipart/form-data': {
          schema: {
            properties: { image: { type: 'string', format: 'binary' } },
            required: ['original'],
          },
        },
      },
    });
  });
});

describe('リクエストのバリデーション', () => {
  it('省略した limit には既定値 10 が入る', async () => {
    const res = await createApp().request('/v2/timeline', postJson({}));

    expect(res.status).toBe(200);
    expect(calls).toEqual([
      {
        method: 'getPost',
        args: [{ limit: 10, cursor: undefined, filterByUserId: undefined, viewerId: undefined }],
      },
    ]);
  });

  it('範囲外の limit は 400 で、issues の配列を返す', async () => {
    const res = await createApp().request('/v2/timeline', postJson({ limit: 0 }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({
      success: false,
      error: { name: 'ZodError', issues: [{ code: 'too_small', path: ['limit'] }] },
    });
    expect(calls).toEqual([]);
  });

  it('必須の項目がないと 400 を返し、サービスを呼ばない', async () => {
    const res = await createApp().request('/v2/follow', postJson({}, await bearer('user-1')));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({
      success: false,
      error: { issues: [{ code: 'invalid_type', path: ['followeeId'] }] },
    });
    expect(calls).toEqual([]);
  });

  it('multipart の文字数制限を検証する', async () => {
    const form = new FormData();
    form.set('user_name', 'x'.repeat(21));
    form.set('profile_text', '自己紹介');

    const res = await createApp().request('/v2/profile', {
      method: 'PUT',
      headers: await bearer('user-1'),
      body: form,
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({
      error: { issues: [{ code: 'too_big', path: ['user_name'] }] },
    });
  });
});
