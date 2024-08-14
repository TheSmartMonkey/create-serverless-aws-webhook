import { createBucket } from '@/helpers/s3';
import { getMessagesFromSQSRecords } from '@/helpers/sqs/sqs';

export async function main(event: any) {
  console.log('All status hello !');

  console.log('Creating bucket !');
  console.log(event);
  const records = getMessagesFromSQSRecords<any>(event.Records);
  const bucketName = records[0].bucketName;
  await createBucket(bucketName);
  console.log('Bucket created !');

  return {
    statusCode: 200,
    body: {
      bucketName,
    },
  };
}
