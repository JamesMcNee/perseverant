import {AssertableDate} from 'lib/assertableDate';
import {AtLeast} from 'lib/perseverers/at-least';

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
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return 2;
                }

                return 0;
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(30);

            await expect(
                new AtLeast({ minMillis: 30 }).andAtMost(100, 'MILLISECONDS').withPollInterval(20, 'MILLISECONDS').until(() => waitableFunc(passAfter)).yieldsValue(2)
            ).resolves.not.toThrowError();
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
    });

    describe('satisfies', () => {
        it('should reject, when value immediately satisfies the predicate', async () => {
            // Given
            const waitableFunc = async () => 'Hello World';

            // When / Then
            await expect(async () =>
                await new AtLeast({ minMillis: 1000 }).andAtMost(2000, 'MILLISECONDS').until(() => waitableFunc()).satisfies(value => new RegExp('Hello.*').test(value))
            ).rejects.toThrowError('The provided function yielded the value before it was supposed to!');
        });

        it('should return, when value is yielded between min and max allotted time', async () => {
            // Given
            const waitableFunc = async (passAfter: AssertableDate) => {
                if (passAfter.isInThePast()) {
                    return 'Hello World';
                }

                return 'Goodbye World';
            };

            // When / Then
            const passAfter = new AssertableDate().plusMillis(30);

            await expect(
                new AtLeast({ minMillis: 30 }).andAtMost(100, 'MILLISECONDS').withPollInterval(20, 'MILLISECONDS').until(() => waitableFunc(passAfter)).satisfies(value => new RegExp('Hello.*').test(value))
            ).resolves.not.toThrowError();
        });

        it('should reject, when value is not yielded within allotted time', async () => {
            // Given
            const waitableFunc = async () => {
                return 'Goodbye World';
            };

            // When / Then
            await expect(
                new AtLeast({ minMillis: 10 }).andAtMost(20, 'MILLISECONDS').until(() => waitableFunc()).satisfies(value => new RegExp('Hello.*').test(value))
            ).rejects.toThrowError('The provided function did not yield the expected value after the max allotted time (20 millis)');
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
});