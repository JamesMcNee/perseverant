export type TemporalUnit = 'MILLISECONDS' | 'SECONDS' | 'MINUTES' | 'HOURS'

export class TemporalUnitConversion {

    public static asMillis(value: number, unit: TemporalUnit): number {
        switch (unit) {
        case 'MILLISECONDS':
            return value;
        case 'SECONDS':
            return value * 1000;
        case 'MINUTES':
            return value * 60 * 1000;
        case 'HOURS':
            return value * 60 * 60 * 1000;
        default:
            throw new Error('Unknown unit: ' + unit);
        }
    }
}