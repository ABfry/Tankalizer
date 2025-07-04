/**
 * カスタムエラークラス群
 * ユーザ側エラーとサーバ側エラーを区別するため
 */

/**
 * ユーザ側エラーの基底クラス
 * バリデーションエラーやビジネスロジックエラーなど
 */
export class ClientError extends Error {
  public readonly statusCode: number;
  public readonly errorType: 'client';

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
    this.errorType = 'client';
  }
}

/**
 * サーバ側エラーの基底クラス
 * データベースエラーや外部API呼び出しエラーなど
 */
export class ServerError extends Error {
  public readonly statusCode: number;
  public readonly errorType: 'server';

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
    this.errorType = 'server';
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ClientError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * ビジネスロジックエラー
 */
export class BusinessLogicError extends ClientError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BusinessLogicError';
  }
}

/**
 * リソースが存在しないエラー
 */
export class NotFoundError extends ClientError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 重複・競合エラー
 */
export class ConflictError extends ClientError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 権限・認可エラー
 */
export class ForbiddenError extends ClientError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends ServerError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * エラーがユーザ側エラーかどうかを判定
 */
export function isClientError(error: unknown): error is ClientError {
  return error instanceof ClientError;
}

/**
 * エラーがサーバ側エラーかどうかを判定
 */
export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}
