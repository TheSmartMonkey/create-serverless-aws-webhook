#!/usr/bin/env node
import { logger } from '@/common/logger';
import * as cdk from 'aws-cdk-lib';
import { createCdkStack } from '../lib/cdk-stack';

const app = new cdk.App({ context: { stage: process.env.DEV_NAME } });
const stage = app.node.tryGetContext('stage');

if (stage) {
  createCdkStack(app, `${stage}-aws-webhook`, { env: { region: 'eu-west-3' } });
} else {
  logger.info('STAGE is not defined !');
}
