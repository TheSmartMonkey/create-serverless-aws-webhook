# create-serverless-aws-webhook

Based on : https://github.com/cdk-patterns/serverless/blob/main/the-big-fan/README.md

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CreateServerlessAwsWebhookStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Getting started

`localstack start -d`
`cdklocal bootstrap --profile localstack`
`cdklocal deploy --profile localstack`

## Test the stack

Invoke lambda

```sh
awslocal lambda invoke --function-name CreateServerlessAwsWebhookSta-AllStatusFunctionE79FA16-ea36deec --cli-binary-format raw-in-base64-out --payload '{"body": "{\"num1\": \"10\", \"num2\": \"10\"}" }' output.txt
```

```sh
curl -X POST http://localhost:4566/2015-03-31/functions/CreateServerlessAwsWebhookSta-AllStatusFunctionE79FA16-ea36deec/invocations -H "Content-Type: application/json" -d '{"key1": "value1"}'
```
