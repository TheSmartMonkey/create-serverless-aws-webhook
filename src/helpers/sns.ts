import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

let snsClient: SNSClient;

export async function sendSnsMessage<T>(topicArn: string, messageBody: T): Promise<void> {
  initSns();
  const cmd = new PublishCommand({
    TopicArn: topicArn,
    Message: JSON.stringify(messageBody),
  });

  await snsClient.send(cmd);
}

function initSns(): SNSClient {
  if (snsClient) return snsClient;
  snsClient = new SNSClient({
    region: 'eu-west-3',
    endpoint: 'http://127.0.0.1:4566',
  });
  return snsClient;
}
