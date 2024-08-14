export const TEST_QUEUE_URL = 'http://localhost:4566/000000000000/CreateServerlessAwsWebhookQueue';
export const TEST_TOPIC_ARN = 'arn:aws:sns:eu-west-3:000000000000:CreateServerlessAwsWebhookTopic';

export async function wait(seconds: number) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
