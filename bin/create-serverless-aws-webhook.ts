#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CreateServerlessAwsWebhookStack } from '../lib/create-serverless-aws-webhook-stack';

const app = new cdk.App();
new CreateServerlessAwsWebhookStack(app, 'CreateServerlessAwsWebhookStack');
