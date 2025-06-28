import type { z } from '@hono/zod-openapi';
import type { createMiyabiSchema } from '../../schema/Miyabi/createMiyabiSchemaV2.js';
import type { deleteMiyabiSchema } from '../../schema/Miyabi/deleteMiyabiSchemaV2.js';

export type CreateMiyabiDTO = z.infer<typeof createMiyabiSchema>;
export type DeleteMiyabiDTO = z.infer<typeof deleteMiyabiSchema>;

export type CreateMiyabiResult = {
  message: string;
};

export type DeleteMiyabiResult = {
  message: string;
};

export interface IMiyabiService {
  createMiyabi(createMiyabiDto: CreateMiyabiDTO): Promise<CreateMiyabiResult>;
  deleteMiyabi(deleteMiyabiDto: DeleteMiyabiDTO): Promise<DeleteMiyabiResult>;
}
