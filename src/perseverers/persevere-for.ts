import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';

export interface Until<T> {
    /**
     * Persevere, polling the underlying promise function, until either a matching value is provided or the perseverance criteria is breached.
     * @param value expected value that the underlying promise function should yield
     */
    yieldsValue(value: T): Promise<void>
}

export abstract class PersevereFor {

    protected pollIntervalMillis: number;

    /**
     * Sets the interval to wait between polling the function to check its value / state.
     * @param value the value to wait for in the provided unit
     * @param unit the temporal unit to wait for (e.g. SECONDS)
     */
    public withPollInterval(value: number, unit: TemporalUnit): Omit<this, 'withPollInterval'> {
        this.pollIntervalMillis = TemporalUnitConversion.asMillis(value, unit);
        return this;
    }
    abstract until<T>(promissoryFunction: () => Promise<T>): Until<T>;
}