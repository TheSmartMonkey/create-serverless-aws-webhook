import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import { addNewQueues } from './add-new-queues';

// TODO: test ci cd with localstack (SNS filters --> messages in queue)
export function createCdkStack(app: App, id: string, props?: StackProps): Stack {
  const stack = new Stack(app, id, props);

  // SNS topic
  const topic = new sns.Topic(stack, `${stack.stackName}-topic`, {
    displayName: `${stack.stackName}-topic`,
    topicName: `${stack.stackName}-topic`,
    // TODO: add a dlq to topic
  });

  new sns.TopicPolicy(stack, `${stack.stackName}-topic-policy`, {
    topics: [topic],
    policyDocument: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['sns:Publish'],
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal('apigateway.amazonaws.com')],
          resources: [topic.topicArn],
        }),
      ],
    }),
  });

  // Create API Gateway
  const api = new apigateway.RestApi(stack, `${stack.stackName}-api`, {
    restApiName: `${stack.stackName}-api`,
    description: 'This service receives webhooks and sends them to SNS.',
  });

  // Create API Gateway resource and method
  const webhookResource = api.root.addResource('webhook');
  const apiGatewayRole = new iam.Role(stack, `${stack.stackName}-api-gateway-role`, {
    assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
  });

  apiGatewayRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: [topic.topicArn],
    }),
  );

  const apiIntegration = new apigateway.AwsIntegration({
    service: 'sns',
    action: 'Publish',
    integrationHttpMethod: 'POST',
    options: {
      credentialsRole: apiGatewayRole,
      requestParameters: {
        'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'",
      },
      requestTemplates: {
        'application/json': `Action=Publish&TopicArn=$util.urlEncode('${topic.topicArn}')&Message=$util.urlEncode($input.body)`,
      },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': JSON.stringify({ message: 'Message sent to SNS topic' }),
          },
        },
      ],
    },
  });

  webhookResource.addMethod('POST', apiIntegration, {
    methodResponses: [{ statusCode: '200' }],
  });

  // Grant permissions to API Gateway to publish to SNS
  topic.grantPublish(apiGatewayRole);

  // Create SQS to lambda constructs
  addNewQueues(stack, topic);

  return stack;
}
