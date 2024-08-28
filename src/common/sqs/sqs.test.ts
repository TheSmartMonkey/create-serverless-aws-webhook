/**
 * @group unit
 */

import { fakeSqsMessage } from '@test/fake';
import { formatSqsRecevedMessages } from './sqs';

describe('Sqs unit', () => {
  test('should create SQS Queue and SNS Topic', () => {
    // Given
    const message = { message: 'fakeMessage' };
    const sqsMessage = fakeSqsMessage(message);
    const sqsMessages = [sqsMessage];

    // When
    const response = formatSqsRecevedMessages<{ message: string }>(sqsMessages);

    // Then
    expect(response).toEqual(message);
  });
});
