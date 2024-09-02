import * as sns from 'aws-cdk-lib/aws-sns';

export function snsFitersIncludes(allowlist: string[]) {
  return sns.FilterOrPolicy.filter(sns.SubscriptionFilter.stringFilter({ allowlist }));
}
