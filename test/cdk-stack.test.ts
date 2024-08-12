import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkStack } from '../src/cdk-stack';

const sqsClient = new SQSClient({
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:4566',
});

const QUEUE_URL = 'http://localhost:4566/000000000000/CreateServerlessAwsWebhookQueue';

const snsClient = new SNSClient({
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:4566',
});

const TOPIC_ARN = 'arn:aws:sns:us-east-1:000000000000:CreateServerlessAwsWebhookTopic';

describe('CreateServerlessAwsWebhook unit', () => {
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
    console.log(Messages);
    expect(Messages).not.toBeUndefined();
    expect(Messages?.length).toEqual(1);
    const receivedMessage = JSON.parse(JSON.parse((Messages as any)[0].Body).Message);
    expect(receivedMessage).toEqual(messageBody);

    // Clean up by deleting the message from the queue
    const deleteParams = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: (Messages as any)[0].ReceiptHandle,
    };

    await sqsClient.send(new DeleteMessageCommand(deleteParams));
  });

  test('should send a message to SNS and verify it is in the SQS queue', async () => {
    // Define the message to send
    const messageBody = {
      message: 'fakeMessage',
    };

    // Send the message
    const publishParams = {
      TopicArn: TOPIC_ARN,
      Message: JSON.stringify(messageBody),
    };

    await snsClient.send(new PublishCommand(publishParams));

    // Receive the message
    const receiveParams = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5, // Adjust as necessary
    };

    const { Messages } = await sqsClient.send(new ReceiveMessageCommand(receiveParams));

    // Verify the message is in the queue
    expect(Messages).not.toBeUndefined();
    expect(Messages?.length).toEqual(1);
    const receivedMessage = JSON.parse(JSON.parse((Messages as any)[0].Body).Message);
    expect(receivedMessage).toEqual(messageBody);

    // Clean up by deleting the message from the queue
    const deleteParams = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: (Messages as any)[0].ReceiptHandle,
    };

    await sqsClient.send(new DeleteMessageCommand(deleteParams));
  });
});
