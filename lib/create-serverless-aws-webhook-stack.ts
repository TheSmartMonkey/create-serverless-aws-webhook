const cdk = require('aws-cdk-lib');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { Topic } = require('aws-cdk-lib/aws-sns');
const { Queue } = require('aws-cdk-lib/aws-sqs');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { SnsEventSource } = require('aws-cdk-lib/aws-lambda-event-sources');
const { SqsSubscription } = require('aws-cdk-lib/aws-sns-subscriptions');
const { Stack, Duration } = require('aws-cdk-lib');
// const sqs = require('aws-cdk-lib/aws-sqs');

export class CreateServerlessAwsWebhookStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an SQS queue
    const queue = new Queue(this, 'MyQueue');

    // Create an SNS topic
    const topic = new Topic(this, 'MyTopic');

    // Subscribe the SQS queue to the SNS topic
    topic.addSubscription(new SqsSubscription(queue));

    // Create a Lambda function
    const myLambda = new Function(this, 'MyLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromInline(`
        exports.handler = async function(event) {
          console.log("EVENT: ", JSON.stringify(event, null, 2));
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Hello from Lambda!", event })
          };
        };
      `),
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    });

    // Grant the Lambda function permissions to interact with the SQS queue
    queue.grantSendMessages(myLambda);

    // Create an API Gateway REST API
    const api = new RestApi(this, 'MyApi', {
      restApiName: 'MyService',
      description: 'This service serves a Lambda function.',
    });

    // Create a resource and method for the API
    const getIntegration = new LambdaIntegration(myLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    api.root.addMethod('GET', getIntegration);

    // Add an SNS publish action to the Lambda function
    myLambda.addEventSource(new SnsEventSource(topic));
  }
}

// module.exports = { CreateServerlessAwsWebhookStack };
