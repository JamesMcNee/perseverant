import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';

describe('Temporal Unit', () => {

    describe('asMillis', () => {

        const testCases: Record<TemporalUnit, {input: number, expected: number}[]> = {
            MILLISECOND: [
                { input: 1234, expected: 1234},
                { input: 9876, expected: 9876},
            ],
            MILLISECONDS: [
                { input: 1234, expected: 1234},
                { input: 9876, expected: 9876},
            ],
            SECOND: [
                { input: 1, expected: 1_000 },
                { input: 15, expected: 15_000 }
            ],
            SECONDS: [
                { input: 1, expected: 1_000 },
                { input: 15, expected: 15_000 }
            ],
            MINUTE: [
                { input: 1, expected: 60_000 },
                { input: 15, expected: 900_000 }
            ],
            MINUTES: [
                { input: 1, expected: 60_000 },
                { input: 15, expected: 900_000 }
            ],
            HOUR: [
                { input: 1, expected: 3_600_000 },
                { input: 15, expected: 54_000_000 }
            ],
            HOURS: [
                { input: 1, expected: 3_600_000 },
                { input: 15, expected: 54_000_000 }
            ]
        };

        for (const [temporalUnit, cases] of Object.entries(testCases)) {
            for (const {input, expected} of cases) {
                it(`should correctly calculate that [${input} ${temporalUnit}] is [${expected} milliseconds]`, () => {
                    const actual = TemporalUnitConversion.asMillis(input, temporalUnit as TemporalUnit);

                    expect(actual).toEqual(expected);
                });
            }
        }
    });
});