import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as CreateServerlessAwsWebhook from '../lib/create-serverless-aws-webhook-stack';

const sqsClient = new SQSClient({
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:4566',
});

const QUEUE_URL = 'http://127.0.0.1:4566/000000000000/CreateServerlessAwsWebhookSta-CreateServerlessAwsWebho-5f7c5bf5';

describe('CreateServerlessAwsWebhook unit', () => {
  test('SQS Queue and SNS Topic Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CreateServerlessAwsWebhook.CreateServerlessAwsWebhookStack(app, 'MyTestStack');
    // THEN

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::SQS::Queue', {
      VisibilityTimeout: 10,
    });
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });

  test('should send an event to SQS and verify it is in the queue', async () => {
    // Define the message to send
    const messageBody = {
      message: 'fakeMessage',
    };

    // Send the message
    const sendParams = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
    };

    await sqsClient.send(new SendMessageCommand(sendParams));

    // Receive the message
    const receiveParams = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5, // Adjust as necessary
    };

    const { Messages } = await sqsClient.send(new ReceiveMessageCommand(receiveParams));

    // Verify the message is in the queue
    expect(Messages).not.toBeUndefined();
    expect(Messages?.length).toBeGreaterThan(0);
    const receivedMessage = JSON.parse((Messages as any)[0].Body);
    expect(receivedMessage).toEqual(messageBody);

    // Clean up by deleting the message from the queue
    const deleteParams = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: (Messages as any)[0].ReceiptHandle,
    };

    await sqsClient.send(new DeleteMessageCommand(deleteParams));
  });
});
