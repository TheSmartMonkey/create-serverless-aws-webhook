/**
 * @group unit
 */

import { deleteAllTestS3Buckets, doesS3BucketExist } from '@/helpers/s3';
import { fakeBucketName } from '@test/fake';
import { main } from './handler';

describe('All status unit', () => {
  beforeEach(async () => {
    await deleteAllTestS3Buckets();
  });

  test('should create S3 bucket', async () => {
    // Given
    const event = {
      bucketName: fakeBucketName(),
    };

    // When
    const response = await main(event);
    const bucketExist = await doesS3BucketExist(response.body.bucketName);

    // Then
    expect(bucketExist).toBeTruthy();
  });
});
