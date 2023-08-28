export type TemporalUnit =
    'MILLISECOND' | 'MILLISECONDS' |
    'SECOND' | 'SECONDS' |
    'MINUTE' | 'MINUTES' |
    'HOUR' | 'HOURS';

export class TemporalUnitConversion {

    public static asMillis(value: number, unit: TemporalUnit): number {
        switch (unit) {
        case 'MILLISECOND':
        case 'MILLISECONDS':
            return value;
        case 'SECOND':
        case 'SECONDS':
            return value * 1000;
        case 'MINUTE':
        case 'MINUTES':
            return value * 60 * 1000;
        case 'HOUR':
        case 'HOURS':
            return value * 60 * 60 * 1000;
        default:
            throw new Error('Unknown unit: ' + unit);
        }
    }
}