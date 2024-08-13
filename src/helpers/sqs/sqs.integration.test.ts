/**
 * @group unit
 */

import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { initIntegrationTest } from '@test/integration-test';
import { deleteAllSqsMessages, getSqsMessage, sendSqsMessages } from './sqs';

jest.setTimeout(20000);

describe('Sqs integration', () => {
  let stack: {
    sqsClient: SQSClient;
    snsClient: SNSClient;
    queueUrl: string;
    topicArn: string;
  };

  beforeAll(() => {
    stack = initIntegrationTest();
  });

  afterAll(async () => {
    await deleteAllSqsMessages(stack.sqsClient, stack.queueUrl);
  });

  test('should purge all sqs messages', async () => {
    // Given
    const message1 = { message: 'fakeMessage1' };
    const message2 = { message: 'fakeMessage2' };
    const messages = [message1, message2];

    // When
    await sendSqsMessages(stack.sqsClient, stack.queueUrl, messages);
    const messagesBeforePurge = await getSqsMessage(stack.sqsClient, stack.queueUrl);
    await deleteAllSqsMessages(stack.sqsClient, stack.queueUrl);
    const messagesAfterPurge = await getSqsMessage(stack.sqsClient, stack.queueUrl);

    // Then
    expect(messagesBeforePurge).toHaveLength(2);
    expect(messagesAfterPurge).toHaveLength(0);
  });
});
