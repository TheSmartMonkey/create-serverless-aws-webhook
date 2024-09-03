import { Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { snsFitersIncludes } from './sns-filter';
import { createSqsTolambda } from './sqs-to-lambda';

export function addNewQueues(stack: Stack, topic: sns.Topic, sqsFailureDlq: sqs.Queue, lambdaRole: iam.Role): void {
  createSqsTolambda(
    stack,
    topic,
    sqsFailureDlq,
    lambdaRole,
    'all-status',
    {
      eventType: snsFitersIncludes(['status_accepted', 'status_pending', 'status_done']),
    },
    {},
  );
  createSqsTolambda(
    stack,
    topic,
    sqsFailureDlq,
    lambdaRole,
    'done-status',
    {
      eventType: snsFitersIncludes(['status_done']),
    },
    {},
  );
}
