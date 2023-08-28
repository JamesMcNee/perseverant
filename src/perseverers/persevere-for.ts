import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';

export interface Until<T> {
    yieldsValue(value: T): Promise<void>
}

export abstract class PersevereFor {

    protected pollIntervalMillis: number;

    public withPollInterval(value: number, unit: TemporalUnit): this {
        this.pollIntervalMillis = TemporalUnitConversion.asMillis(value, unit);
        return this;
    }
    abstract until<T>(promise: Promise<T>): Until<T>;
    abstract until<T>(testableFunc: () => Promise<T>): Until<T>;
}