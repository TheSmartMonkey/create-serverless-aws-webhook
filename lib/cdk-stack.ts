import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as path from 'path';

// TODO: test ci cd with localstack (SNS filters --> messages in queue)
export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SNS topic
    const topic = new sns.Topic(this, 'CreateServerlessAwsWebhookTopic', {
      displayName: 'CreateServerlessAwsWebhookTopic',
      topicName: 'CreateServerlessAwsWebhookTopic',
    });

    // Dead Letter Queue
    const dlq = new sqs.Queue(this, 'CreateServerlessAwsWebhookDLQ', {
      queueName: 'CreateServerlessAwsWebhookDLQ',
      retentionPeriod: Duration.days(14),
    });

    // SQS Queues
    const queue = new sqs.Queue(this, 'CreateServerlessAwsWebhookQueue', {
      queueName: 'CreateServerlessAwsWebhookQueue',
      visibilityTimeout: Duration.seconds(10),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
    });

    // Subscription
    topic.addSubscription(new subs.SqsSubscription(queue));

    // Lambdas
    const lambdaRole = new iam.Role(this, 'LambdaAccessRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:SendMessage',
        'sqs:SendMessageBatch',
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes'
      ],
      resources: ['*']
    }));

    // Add CloudWatch Logs permissions
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    const allStatusFunction = new lambda.Function(this, 'AllStatusFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'functions/all-status/handler.main',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      role: lambdaRole,
    });
    queue.grantConsumeMessages(allStatusFunction);
    allStatusFunction.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
        maxBatchingWindow: Duration.seconds(10),
      }),
    );
    // allStatusFunction.addEventSource(new SqsEventSource(queue, { batchSize: 100, maxBatchingWindow: Duration.minutes(5) }));
  }
}
