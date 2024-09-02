import { createHandler } from '@/common/handler';
import { logger } from '@/common/logger';
import { getMessagesFromSQSRecords } from '@/common/sqs/sqs';
import { HandlerResponse } from '@/models/handler.model';

// TODO: create bucket in stack and add a file to it
export const handler = createHandler(async ({ event }: { event: any }): Promise<HandlerResponse<string>> => {
  logger.info('Hello');
  const records = getMessagesFromSQSRecords<any>(event.Records);
  logger.info(records);

  return {
    statusCode: 200,
    body: 'Done status',
  };
});
