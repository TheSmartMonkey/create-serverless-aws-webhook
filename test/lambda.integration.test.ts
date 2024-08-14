import { deleteAllTestS3Buckets, doesS3BucketExist } from '@/helpers/s3';
import { sendSnsMessage } from '@/helpers/sns';
import { deleteAllSqsMessages, sendSqsMessages } from '@/helpers/sqs/sqs';
import { TEST_QUEUE_URL, TEST_TOPIC_ARN, wait } from '@test/helper';
import { fakeBucketName } from './fake';

jest.setTimeout(20000);

describe('Lambda integration', () => {
  beforeEach(async () => {
    await deleteAllTestS3Buckets();
    await deleteAllSqsMessages(TEST_QUEUE_URL);
  });

  test('should send a message to SNS and receve it in lambda', async () => {
    // Given
    const messageBody = {
      bucketName: fakeBucketName(),
    };

    // When
    await sendSnsMessage(TEST_TOPIC_ARN, messageBody);
    const bucketExist = await doesS3BucketExist(messageBody.bucketName);

    // Then
    expect(bucketExist).toBeTruthy();
  });

  test('should send a message to SQS and receve it in lambda', async () => {
    // Given
    const messageBody = {
      bucketName: fakeBucketName(),
    };

    // When
    await sendSqsMessages(TEST_QUEUE_URL, [messageBody]);
    console.log(messageBody.bucketName);
    await wait(5);
    const bucketExist = await doesS3BucketExist(messageBody.bucketName);

    // Then
    expect(bucketExist).toBeTruthy();
  });
});
