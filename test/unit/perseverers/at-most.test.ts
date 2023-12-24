import {AtMost} from 'lib/perseverers/at-most';
import {AssertableDate} from 'lib/assertableDate';
import {sleep} from 'lib/utils';

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
            const successValue = 2;
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return successValue;
                }

                return 0;
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(1000);

            await expect(
                new AtMost({ maxMillis: 3000 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc(passAfter)).yieldsValue(successValue)
            ).resolves.toEqual(successValue);
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

        it('should reject after max time, when promise function takes longer than this to resolve', async () => {
            // Given
            const waitableFunc = () => sleep(10_000).then(() => 'success');

            // When / Then
            await expect(
                new AtMost({ maxMillis: 500 }).until(waitableFunc).yieldsValue('success')
            ).rejects.toThrowError('The provided function did not yield the expected value within the allotted time (500 millis)');
        });
    });

    describe('satisfies', () => {
        it('should return, when value is immediately yielded', async () => {
            // Given
            const waitableFunc = async () => 'Hello World!';

            // When / Then
            await expect(async () =>
                await new AtMost<string>({ maxMillis: 1000 }).until(() => waitableFunc()).satisfies(value => new RegExp('Hello.*').test(value))
            ).not.toThrowError();
        });

        it('should return, when value is yielded within allotted time', async () => {
            // Given
            const successValue: string = 'Hello World';
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return successValue;
                }

                return 'Goodbye World!';
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(1000);

            await expect(
                new AtMost<string>({ maxMillis: 3000 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc(passAfter)).satisfies(value => new RegExp('Hello.*').test(value))
            ).resolves.toEqual(successValue);
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                return 'Goodbye World!';
            };

            // When / Then
            await expect(
                new AtMost<string>({ maxMillis: 500 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc()).satisfies(value => new RegExp('Hello.*').test(value))
            ).rejects.toThrowError('The provided function did not yield the expected value within the allotted time (500 millis)');
        });

        it('should reject after max time, when promise function takes longer than this to resolve', async () => {
            // Given
            const waitableFunc = () => sleep(10_000).then(() => 'success');

            // When / Then
            await expect(
                new AtMost({ maxMillis: 500 }).until(waitableFunc).satisfies(val => val === 'success')
            ).rejects.toThrowError('The provided function did not yield the expected value within the allotted time (500 millis)');
        });
    });

    describe('noExceptions', () => {
        it('should return, when value is immediately yielded', async () => {
            // Given
            const waitableFunc = async () => 'Hello World!';

            // When / Then
            await expect(async () =>
                await new AtMost({ maxMillis: 1000 }).until(() => waitableFunc()).noExceptions()
            ).not.toThrowError();
        });

        it('should return, when value is yielded within allotted time', async () => {
            // Given
            const successValue: string = 'Hello World';
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return successValue;
                }

                throw new Error('Not Ready!');
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(1000);

            await expect(
                new AtMost({ maxMillis: 3000 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc(passAfter)).noExceptions()
            ).resolves.toEqual(successValue);
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                throw new Error('Not ready!');
            };

            // When / Then
            await expect(
                new AtMost({ maxMillis: 500 }).withPollInterval(50, 'MILLISECONDS').until(() => waitableFunc()).noExceptions()
            ).rejects.toThrowError('The provided function did not stop throwing within the allotted time (500 millis)');
        });

        it('should reject after max time, when promise function takes longer than this to resolve', async () => {
            // Given
            const waitableFunc = () => sleep(10_000).then(() => 'success');

            // When / Then
            await expect(
                new AtMost({ maxMillis: 500 }).until(waitableFunc).noExceptions()
            ).rejects.toThrowError('The provided function did not stop throwing within the allotted time (500 millis)');
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