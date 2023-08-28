import {AssertableDate} from 'lib/assertableDate';

describe('AssertableDate', () => {

    describe('isAfter', () => {

        it('should return true, when date argument is after base date', () => {
            // Given
            const theFuture: AssertableDate = new AssertableDate(Date.parse('2023-08-28T10:01:02.034Z'));
            const thePast: Date = new Date(Date.parse('2023-08-28T10:01:02.033Z'));

            // When
            const actual = theFuture.isAfter(thePast);

            // Then
            expect(actual).toBe(true);
        });

        it('should return false, when date argument is before base date', () => {
            // Given
            const theFuture: Date = new Date(Date.parse('2023-08-28T10:01:02.034Z'));
            const thePast: AssertableDate = new AssertableDate(Date.parse('2023-08-28T10:01:02.033Z'));

            // When
            const actual = thePast.isAfter(theFuture);

            // Then
            expect(actual).toBe(false);
        });

        it('should return false, when date argument is the same as the base date', () => {
            // Given
            const theFuture: AssertableDate = new AssertableDate(Date.parse('2023-08-28T10:01:02.034Z'));

            // When
            const actual = theFuture.isAfter(theFuture);

            // Then
            expect(actual).toBe(false);
        });
    });

    describe('isBefore', () => {

        it('should return true, when date argument is before base date', () => {
            // Given
            const theFuture: Date = new Date(Date.parse('2023-08-28T10:01:02.034Z'));
            const thePast: AssertableDate = new AssertableDate(Date.parse('2023-08-28T10:01:02.033Z'));

            // When
            const actual = thePast.isBefore(theFuture);

            // Then
            expect(actual).toBe(true);
        });

        it('should return false, when date argument is after base date', () => {
            // Given
            const theFuture: AssertableDate = new AssertableDate(Date.parse('2023-08-28T10:01:02.034Z'));
            const thePast: Date = new Date(Date.parse('2023-08-28T10:01:02.033Z'));

            // When
            const actual = theFuture.isBefore(thePast);

            // Then
            expect(actual).toBe(false);
        });

        it('should return false, when date argument is the same as the base date', () => {
            // Given
            const theFuture: AssertableDate = new AssertableDate(Date.parse('2023-08-28T10:01:02.034Z'));

            // When
            const actual = theFuture.isBefore(theFuture);

            // Then
            expect(actual).toBe(false);
        });
    });

});