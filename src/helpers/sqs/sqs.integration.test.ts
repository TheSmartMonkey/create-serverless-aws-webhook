/**
 * @group unit
 */

import { TEST_QUEUE_URL } from '@test/helper';
import { deleteAllSqsMessages, getSqsMessages, sendSqsMessages } from './sqs';

jest.setTimeout(20000);

describe('Sqs integration', () => {
  beforeEach(async () => {
    await deleteAllSqsMessages(TEST_QUEUE_URL);
  });

  test('should purge all sqs messages', async () => {
    // Given
    const message1 = { message: 'fakeMessage1' };
    const message2 = { message: 'fakeMessage2' };
    const messages = [message1, message2];

    // When
    await sendSqsMessages(TEST_QUEUE_URL, messages);
    const messagesBeforePurge = await getSqsMessages(TEST_QUEUE_URL);
    await deleteAllSqsMessages(TEST_QUEUE_URL);
    const messagesAfterPurge = await getSqsMessages(TEST_QUEUE_URL);

    // Then
    expect(messagesBeforePurge).toHaveLength(2);
    expect(messagesAfterPurge).toHaveLength(0);
  });
});
