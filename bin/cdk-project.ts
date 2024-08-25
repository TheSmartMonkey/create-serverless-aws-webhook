#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { createCdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
createCdkStack(app, 'CreateServerlessAwsWebhookStack', { env: { region: 'eu-west-3' } });
