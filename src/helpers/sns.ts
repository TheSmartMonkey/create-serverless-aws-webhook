import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

export async function sendSnsMessage<T>(snsClient: SNSClient, topicArn: string, messageBody: T): Promise<void> {
  const publishParams = {
    TopicArn: topicArn,
    Message: JSON.stringify(messageBody),
  };

  await snsClient.send(new PublishCommand(publishParams));
}

// export function formatSnsRecevedMessages<T>(messages: Message[]): T {
//   const msg = JSON.parse(messages as any);
//   return msg.map((m: Message) => JSON.parse(m?.Body || '').Message);
// }
