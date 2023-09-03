import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';

export interface Until<T> {
    /**
     * Persevere, polling the underlying promise function, until either a matching value is provided or the perseverance criteria is breached.
     * @param expected expected value that the underlying promise function should yield
     * @return the value that the underlying promise yields
     */
    yieldsValue(expected: T): Promise<T>

    /**
     * Persevere, polling the underlying promise function, until either a value satisfying the predicate is provided or the perseverance criteria is breached.
     * @param predicate that the underlying promise function should yield a value to satisfy
     * @return the value that the underlying promise yields
     */
    satisfies(predicate: (value: T) => boolean): Promise<T>

    /**
     * Persevere, polling the underlying promise function, until it stops throwing / rejecting or the perseverance criteria is breached.
     * @return the value that the underlying promise yields
     */
    noExceptions(): Promise<T>
}

export abstract class TemporalBinding {

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