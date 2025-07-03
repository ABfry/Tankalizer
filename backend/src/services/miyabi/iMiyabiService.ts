import type { z } from '@hono/zod-openapi';
import type { createMiyabiSchema } from '../../schema/Miyabi/createMiyabiSchemaV2.js';
import type { deleteMiyabiSchema } from '../../schema/Miyabi/deleteMiyabiSchemaV2.js';
import type { getMiyabiRankingSchema } from '../../schema/Miyabi/getMiyabiRankingSchemaV2.js';
import type { RankedPost } from '../../repositories/miyabi/iMiyabiRepository.js';

export type CreateMiyabiDTO = z.infer<typeof createMiyabiSchema>;
export type DeleteMiyabiDTO = z.infer<typeof deleteMiyabiSchema>;
export type GetMiyabiRankingDTO = z.infer<typeof getMiyabiRankingSchema>;

export type CreateMiyabiResult = {
  message: string;
};

export type DeleteMiyabiResult = {
  message: string;
};

export class CreateMiyabiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateMiyabiError';
  }
}

export class DeleteMiyabiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeleteMiyabiError';
  }
}

export class NotFoundError extends Error {
  constructor(message: '投稿が見つかりません．' | 'ユーザーが見つかりません．') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: '雅が既に存在します．' | '雅が見つかりません．') {
    super(message);
    this.name = 'ConflictError';
  }
}

export interface IMiyabiService {
  createMiyabi(createMiyabiDto: CreateMiyabiDTO): Promise<CreateMiyabiResult>;
  deleteMiyabi(deleteMiyabiDto: DeleteMiyabiDTO): Promise<DeleteMiyabiResult>;
  getMiyabiRanking(getMiyabiRankingDto: GetMiyabiRankingDTO): Promise<RankedPost[]>;
}
