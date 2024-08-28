import { Bucket, CreateBucketCommand, DeleteBucketCommand, GetBucketAclCommand, ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';

let client: S3Client;

export async function doesS3BucketExist(bucketName: string): Promise<boolean> {
  initS3();
  const cmd = new GetBucketAclCommand({
    Bucket: bucketName,
  });

  const bucket = await client.send(cmd);
  return bucket.$metadata.httpStatusCode === 200;
}

export async function getAllS3Bucket(): Promise<Bucket[]> {
  initS3();
  const cmd = new ListBucketsCommand();
  const buckets = await client.send(cmd);
  return buckets.Buckets || [];
}

export async function createBucket(bucketName: string) {
  initS3();
  const cmd = new CreateBucketCommand({
    Bucket: bucketName,
  });
  await client.send(cmd);
}

export async function deleteAllTestS3Buckets(): Promise<Bucket[]> {
  initS3();
  const buckets = await getAllS3Bucket();
  const testBuckets = buckets.filter((b) => b?.Name?.includes('test-bucket'));

  for (const b of testBuckets) {
    const cmd = new DeleteBucketCommand({
      Bucket: b.Name,
    });
    await client.send(cmd);
  }

  return testBuckets;
}

function initS3(): S3Client {
  if (client) return client;
  client = new S3Client({ region: 'eu-west-3' });
  // TODO: env variable for localstack
  // client = new S3Client({ region: 'eu-west-3', endpoint: 'http://127.0.0.1:4566' });
  return client;
}
