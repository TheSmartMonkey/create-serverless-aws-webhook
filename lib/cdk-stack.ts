import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { addNewQueues } from './add-new-queues';

// TODO: test ci cd with localstack (SNS filters --> messages in queue)
export function createCdkStack(app: App, id: string, props?: StackProps): void {
  const stack = new Stack(app, id, props);

  // SNS topic
  const topic = new sns.Topic(stack, 'create-serverless-aws-webhook-topic', {
    displayName: 'create-serverless-aws-webhook-topic',
    topicName: 'create-serverless-aws-webhook-topic',
  });

  // Create SQS to lambda constructs
  addNewQueues(stack, topic);
}
