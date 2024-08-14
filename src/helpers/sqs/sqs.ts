import { randomUUID } from '@/helpers/helper';
import {
  Message,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';
import { SQSRecord } from 'aws-lambda';

let sqsClient: SQSClient;

export async function sendSqsMessages<T>(queueUrl: string, messages: T[]): Promise<void> {
  initSqs();
  const cmd = new SendMessageBatchCommand({
    QueueUrl: queueUrl,
    Entries: formatMessagesToBatchMessages<T>(messages),
  });

  await sqsClient.send(cmd);
}

export async function getSqsMessages(queueUrl: string): Promise<Message[]> {
  initSqs();
  const cmd = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
  });

  const { Messages } = await sqsClient.send(cmd);
  return formatSqsRecevedMessages(Messages || []);
}

export async function deleteAllSqsMessages(queueUrl: string) {
  initSqs();
  const cmd = new PurgeQueueCommand({
    QueueUrl: queueUrl,
  });

  await sqsClient.send(cmd);
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

export function getMessagesFromSQSRecords<T>(sqsRecords: SQSRecord[]): T[] {
  const messages = sqsRecords.map((sqsRecord) => getMessageFromSQSRecord(sqsRecord)) ?? [];
  console.info({ messages });
  return messages as T[];
}

function getMessageFromSQSRecord<T>(sqsRecord: SQSRecord): T | undefined {
  try {
    if (sqsRecord?.body) {
      const body = JSON.parse(sqsRecord?.body);
      return JSON.parse(body.Message);
    }
  } catch {
    console.error(sqsRecord?.body);
  }
  return undefined;
}

function initSqs(): SQSClient {
  if (sqsClient) return sqsClient;
  sqsClient = new SQSClient({
    region: 'eu-west-3',
    endpoint: 'http://127.0.0.1:4566',
  });
  return sqsClient;
}
