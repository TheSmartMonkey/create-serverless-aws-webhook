import { Stack } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { createSqsTolambdaConstruct } from './sqs-lambda-construct';

export function addNewQueues(stack: Stack, topic: sns.Topic): void {
  createSqsTolambdaConstruct(stack, topic, 'all-status');
}
