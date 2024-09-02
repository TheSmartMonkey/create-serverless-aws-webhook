import { Duration, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';

export function createSqsTolambdaConstruct(stack: Stack, topic: sns.Topic, folder: string): void {
  const dlqName = `${stack.stackName}-${folder}-dlq`;
  const queueName = `${stack.stackName}-${folder}-queue`;
  const functionName = `${stack.stackName}-${folder}-function`;

  // Dead Letter Queue
  const dlq = new sqs.Queue(stack, dlqName, {
    queueName: dlqName,
    retentionPeriod: Duration.days(14),
  });

  // SQS Queues
  const queue = new sqs.Queue(stack, queueName, {
    queueName,
    visibilityTimeout: Duration.seconds(30),
    deadLetterQueue: {
      queue: dlq,
      maxReceiveCount: 3,
    },
  });

  // Topic subscription
  topic.addSubscription(new subs.SqsSubscription(queue));

  // Create the lambda function
  const lambdaRole = createLambdaRoles(stack);
  const lambdaFunction = new NodejsFunction(stack, functionName, {
    functionName,
    entry: path.resolve(__dirname, `../src/functions/${folder}/handler.ts`),
    handler: 'handler',
    runtime: lambda.Runtime.NODEJS_20_X,
    memorySize: 512,
    timeout: Duration.seconds(20),
    role: lambdaRole,
  });
  queue.grantConsumeMessages(lambdaFunction);
  lambdaFunction.addEventSource(
    new SqsEventSource(queue, {
      batchSize: 10,
      // maxBatchingWindow: Duration.seconds(10),
    }),
  );
  // TODO: Prod env / dev env
  // allStatusFunction.addEventSource(new SqsEventSource(queue, { batchSize: 100, maxBatchingWindow: Duration.minutes(5) }));
}

function createLambdaRoles(stack: Stack): iam.Role {
  // Lambda role
  const lambdaRole = new iam.Role(stack, 'LambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  });

  // S3 permissions
  lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));

  // SQS permissions
  lambdaRole.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sqs:SendMessage', 'sqs:SendMessageBatch', 'sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
      resources: ['*'],
    }),
  );

  // Add CloudWatch Logs permissions
  lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
  return lambdaRole;
}
