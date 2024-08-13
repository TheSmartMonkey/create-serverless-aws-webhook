/**
 * @group unit
 */

import { randomUUID } from '@/helpers/helper';
import {
  Message,
  PurgeQueueCommand,
  PurgeQueueRequest,
  ReceiveMessageCommand,
  ReceiveMessageRequest,
  SQSClient,
  SendMessageBatchCommand,
  SendMessageBatchRequest,
  SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';

export async function sendSqsMessages<T>(sqsClient: SQSClient, queueUrl: string, messages: T[]): Promise<void> {
  const params: SendMessageBatchRequest = {
    QueueUrl: queueUrl,
    Entries: formatMessagesToBatchMessages<T>(messages),
  };

  await sqsClient.send(new SendMessageBatchCommand(params));
}

export async function getSqsMessage(sqsClient: SQSClient, queueUrl: string): Promise<Message[]> {
  const params: ReceiveMessageRequest = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
  };

  const { Messages } = await sqsClient.send(new ReceiveMessageCommand(params));
  return formatSqsRecevedMessages(Messages || []);
}

export async function deleteAllSqsMessages(sqsClient: SQSClient, queueUrl: string) {
  const params: PurgeQueueRequest = {
    QueueUrl: queueUrl,
  };

  await sqsClient.send(new PurgeQueueCommand(params));
}

export function formatSqsRecevedMessages<T>(messages: Message[]): T {
  return messages.map((m: Message) => JSON.parse(m?.Body || '')) as T;
}

export function formatMessagesToBatchMessages<T>(messages: T[]): SendMessageBatchRequestEntry[] {
  return messages.map((m) => {
    return {
      Id: randomUUID(),
      MessageBody: JSON.stringify(m),
    };
  });
}
