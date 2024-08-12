import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';

export function initIntegrationTest() {
  const snsClient = new SNSClient({
    region: 'us-east-1',
    endpoint: 'http://127.0.0.1:4566',
  });
  const topicArn = 'arn:aws:sns:us-east-1:000000000000:CreateServerlessAwsWebhookTopic';

  const sqsClient = new SQSClient({
    region: 'us-east-1',
    endpoint: 'http://127.0.0.1:4566',
  });
  const queueUrl = 'http://localhost:4566/000000000000/CreateServerlessAwsWebhookQueue';

  return { sqsClient, snsClient, queueUrl, topicArn };
}
