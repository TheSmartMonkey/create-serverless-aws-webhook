import { deleteAllSqsMessages, getSqsMessages, sendSqsMessages } from '@/helpers/sqs/sqs';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkStack } from '../lib/cdk-stack';
import { TEST_QUEUE_URL } from './helper';

describe('CreateServerlessAwsWebhook unit', () => {
  beforeEach(async () => {
    await deleteAllSqsMessages(TEST_QUEUE_URL);
  });

  test('SQS Queue and SNS Topic Created', () => {
    // Given
    const app = new cdk.App();

    // When
    const stack = new CdkStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    // Then
    template.hasResourceProperties('AWS::SQS::Queue', {
      VisibilityTimeout: 10,
    });
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });

  test('should send a message to SQS and verify it is in the queue', async () => {
    // Given
    const messageBody = {
      message: 'fakeMessage',
    };

    // When
    await sendSqsMessages(TEST_QUEUE_URL, [messageBody]);
    const messages = await getSqsMessages(TEST_QUEUE_URL);

    // Verify the message is in the queue
    console.log(messages);
    expect(messages).not.toBeUndefined();
    expect(messages?.length).toEqual(1);
    expect(messages[0]).toEqual(messageBody);
  });
});
