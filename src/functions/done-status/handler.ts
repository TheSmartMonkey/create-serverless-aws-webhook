import { createHandler } from '@/common/handler';
import { logger } from '@/common/logger';
import { HandlerResponse } from '@/models/handler.model';
import { SQSEvent } from 'aws-lambda';

// TODO: create bucket in stack and add a file to it
export const handler = createHandler(async ({ event }: { event: SQSEvent }): Promise<HandlerResponse<string>> => {
  logger.info({ event });

  return {
    statusCode: 200,
    body: 'Done status',
  };
});
