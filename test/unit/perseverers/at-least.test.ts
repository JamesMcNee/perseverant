import {AssertableDate} from 'lib/assertableDate';
import {AtLeast} from 'lib/perseverers/at-least';
import {sleep} from 'lib/utils';

describe('AtLeast', () => {

    describe('yieldsValue', () => {
        it('should reject, when value is immediately yielded', async () => {
            // Given
            const waitableFunc = async () => 5;

            // When / Then
            await expect(async () =>
                await new AtLeast({ minMillis: 1000 }).andAtMost(2000, 'MILLISECONDS').until(() => waitableFunc()).yieldsValue(5)
            ).rejects.toThrowError('The provided function yielded the value before it was supposed to!');
        });

        it('should return, when value is yielded between min and max allotted time', async () => {
            // Given
            const successValue = 2;
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return successValue;
                }

                return 0;
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(30);

            await expect(
                new AtLeast({ minMillis: 30 }).andAtMost(100, 'MILLISECONDS').withPollInterval(20, 'MILLISECONDS').until(() => waitableFunc(passAfter)).yieldsValue(successValue)
            ).resolves.toEqual(successValue);
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                return 0;
            };

            // When / Then
            await expect(
                new AtLeast({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(() => waitableFunc()).yieldsValue(2)
            ).rejects.toThrowError('The provided function did not yield the expected value after the max allotted time (20 millis)');
        });

        it('should reject after max time, when promise function takes longer than this to resolve', async () => {
            // Given
            const waitableFunc = () => sleep(10_000).then(() => 'success');

            // When / Then
            await expect(
                new AtLeast({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(waitableFunc).yieldsValue('success')
            ).rejects.toThrowError('The provided function did not yield the expected value after the max allotted time (20 millis)');
        });
    });

    describe('satisfies', () => {
        it('should reject, when value immediately satisfies the predicate', async () => {
            // Given
            const waitableFunc = async () => 'Hello World';

            // When / Then
            await expect(async () =>
                await new AtLeast<string>({ minMillis: 1000 }).andAtMost(2000, 'MILLISECONDS').until(() => waitableFunc()).satisfies(value => new RegExp('Hello.*').test(value))
            ).rejects.toThrowError('The provided function yielded the value before it was supposed to!');
        });

        it('should return, when value is yielded between min and max allotted time', async () => {
            // Given
            const successValue: string = 'Hello World';
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return successValue;
                }

                return 'Goodbye World';
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(30);

            await expect(
                new AtLeast<string>({ minMillis: 30 }).andAtMost(100, 'MILLISECONDS').withPollInterval(20, 'MILLISECONDS').until(() => waitableFunc(passAfter)).satisfies(value => new RegExp('Hello.*').test(value))
            ).resolves.toEqual(successValue);
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                return 'Goodbye World';
            };

            // When / Then
            await expect(
                new AtLeast<string>({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(() => waitableFunc()).satisfies(value => new RegExp('Hello.*').test(value))
            ).rejects.toThrowError('The provided function did not yield the expected value after the max allotted time (20 millis)');
        });

        it('should reject after max time, when promise function takes longer than this to resolve', async () => {
            // Given
            const waitableFunc = () => sleep(10_000).then(() => 'success');

            // When / Then
            await expect(
                new AtLeast<string>({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(() => waitableFunc()).satisfies(value => value === 'success')
            ).rejects.toThrowError('The provided function did not yield the expected value after the max allotted time (20 millis)');
        });
    });

    describe('noExceptions', () => {
        it('should reject, when value immediately satisfies the predicate', async () => {
            // Given
            const waitableFunc = async () => 'Hello World';

            // When / Then
            await expect(async () =>
                await new AtLeast({ minMillis: 1000 }).andAtMost(2000, 'MILLISECONDS').until(() => waitableFunc()).noExceptions()
            ).rejects.toThrowError('The provided function stopped throwing before it was supposed to!');
        });

        it('should return, when value is yielded between min and max allotted time', async () => {
            // Given
            const successValue: string = 'Hello World';
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return successValue;
                }

                throw new Error('Not Ready!');
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(30);

            await expect(
                new AtLeast({ minMillis: 30 }).andAtMost(100, 'MILLISECONDS').withPollInterval(20, 'MILLISECONDS').until(() => waitableFunc(passAfter)).noExceptions()
            ).resolves.toEqual(successValue);
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                throw new Error('Not Ready!');
            };

            // When / Then
            await expect(
                new AtLeast({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(() => waitableFunc()).noExceptions()
            ).rejects.toThrowError('The provided function did not stop throwing within the allotted time (20 millis)');
        });

        it('should reject after max time, when promise function takes longer than this to resolve', async () => {
            // Given
            const waitableFunc = () => sleep(10_000).then(() => 'success');

            // When / Then
            await expect(
                new AtLeast({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(() => waitableFunc()).noExceptions()
            ).rejects.toThrowError('The provided function did not stop throwing within the allotted time (20 millis)');
        });
    });

    describe('pollInterval', () => {

        it('throws an error, when poll interval greater than minMillis', () => {
            // Given
            const minMillis = 500;
            const pollInterval = 501;

            // When/Then
            expect(() =>
                new AtLeast({ minMillis }).andAtMost(1000, 'MILLISECONDS').withPollInterval(pollInterval, 'MILLISECONDS')
            ).toThrowError('The poll interval must be less than the min allowed wait time of 500ms');
        });
    });

    it('andAtMost should throw if the time provided is less than the minimum', () => {
        // Given
        const minMillis = 1000;
        const maxMillis = 500;

        // When / Then
        expect(() => {
            new AtLeast({ minMillis }).andAtMost(maxMillis, 'MILLISECONDS');
        }).toThrowError('The maximum wait time must not be more than the minimum of: 1000ms');
    });
});