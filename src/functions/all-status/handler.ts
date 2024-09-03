import { createHandler } from '@/common/handler';
import { logger } from '@/common/logger';
import { getMessagesFromSQSRecords } from '@/common/sqs/sqs';
import { HandlerError, HandlerResponse } from '@/models/handler.model';

// TODO: create bucket in stack and add a file to it
export const handler = createHandler(async ({ event }: { event: any }): Promise<HandlerResponse<string>> => {
  logger.info({ event });

  // TODO: move to common/handler
  const records = getMessagesFromSQSRecords<any>(event.Records);

  for (const record of records) {
    if (record.body.eventType === 'status_accepted') {
      logger.info('Status accepted - sending to DLQ');
      throw new HandlerError(400, 'STATUS_ACCEPTED_NOT_ALLOWED');
    } else {
      // Process other event types here
      logger.info(`Processing event type: ${record.body.eventType}`);
    }
  }

  logger.info({ records });

  return {
    statusCode: 200,
    body: 'All status processed successfully',
  };
});
