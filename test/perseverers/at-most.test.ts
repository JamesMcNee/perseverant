import {AtMost} from 'lib/perseverers/at-most';
import {AssertableDate} from 'lib/assertableDate';

describe('AtMost', () => {

    describe('yieldsValue', () => {
        it('should return, when value is immediately yielded', async () => {
            // Given
            const waitableFunc = async () => 5;

            // When / Then
            await expect(async () =>
                await new AtMost({ maxMillis: 1000 }).until(() => waitableFunc()).yieldsValue(5)
            ).not.toThrowError();
        });

        it('should return, when value is yielded within allotted time', async () => {
            // Given
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return 2;
                }

                return 0;
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(1000);

            await expect(
                new AtMost({ maxMillis: 3000 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc(passAfter)).yieldsValue(2)
            ).resolves.not.toThrowError();
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                return 0;
            };

            // When / Then
            await expect(
                new AtMost({ maxMillis: 500 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc()).yieldsValue(2)
            ).rejects.toThrowError('The provided function did not yield the expected value within the allotted time (500 millis)');
        });
    });

    describe('pollInterval', () => {

        it('throws an error, when poll interval greater than maxMillis', () => {
            // Given
            const maxMillis = 500;
            const pollInterval = 501;

            // When/Then
            expect(() =>
                new AtMost({ maxMillis }).withPollInterval(pollInterval, 'MILLISECONDS')
            ).toThrowError('The poll interval must be less than the maximum allowed wait time of 500ms');
        });
    });
});