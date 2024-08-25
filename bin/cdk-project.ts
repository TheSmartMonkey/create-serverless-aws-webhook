#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'CreateServerlessAwsWebhookStack', { env: { region: 'eu-west-3' } });
