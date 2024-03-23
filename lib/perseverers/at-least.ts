import {sleep} from 'lib/utils';
import {ErrorHandler, TemporalBinding, Until} from 'lib/perseverers/temporal-binding';
import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';
import {AssertableDate} from 'lib/assertableDate';

export class AtLeast {

    constructor(private options: {
        minMillis: number
    }) {
    }

    /**
     * Sets the maximum time to persevere
     *
     * @param value the numeric value to wait
     * @param unit the temporal unit that the value denotes
     * @return TemporalBinding a temporally bound class ready for further configuration
     */
    public andAtMost(value: number, unit: TemporalUnit): TemporalBinding {
        const maxMillis = TemporalUnitConversion.asMillis(value, unit);

        if (maxMillis < this.options.minMillis) {
            throw new Error(`The maximum wait time must not be more than the minimum of: ${this.options.minMillis}ms`);
        }

        return new AtLeastAndAtMost({
            minMillis: this.options.minMillis,
            maxMillis: maxMillis
        });
    }
}

export class AtLeastAndAtMost extends TemporalBinding {

    constructor(private options: {
        minMillis: number,
        maxMillis: number
    }) {
        super();
        this.pollIntervalMillis = this.options.minMillis / 5;
    }

    /**
     * Sets the interval to wait between polling the function to check its value / state.
     *
     * The poll interval must **NOT** be more than the minimum allowed wait time, otherwise an error will be thrown.
     *
     * @param value the value to wait for in the provided unit
     * @param unit the temporal unit to wait for (e.g. SECONDS)
     */
    public override withPollInterval(value: number, unit: TemporalUnit): Omit<this, 'withPollInterval'> {
        super.withPollInterval(value, unit);

        if (this.options.minMillis <= this.pollIntervalMillis) {
            throw new Error(`The poll interval must be less than the min allowed wait time of ${this.options.minMillis}ms`);
        }

        return this;
    }

    /**
     * Persevere until the provided promise yielding function satisfies the matching criteria (applied in next chained call).
     * @param promissoryFunction to poll
     */
    public until<T>(promissoryFunction: () => Promise<T>): Until<T> {
        return new UntilBetween<T>({
            minMillis: this.options.minMillis,
            maxMillis: this.options.maxMillis,
            pollIntervalMillis: this.pollIntervalMillis,
            testableFunc: promissoryFunction
        });
    }
}

export class UntilBetween<T> implements Until<T> {

    constructor(private readonly options: {
        minMillis: number
        maxMillis: number
        pollIntervalMillis: number
        errorHandler?: ErrorHandler
        testableFunc: () => Promise<T>
    }) {
    }

    /**
     * Persevere, polling the underlying promise function, until either a matching value is provided or the perseverance criteria is breached.
     * @param expected expected value that the underlying promise function should yield
     * @return the value that the underlying promise yields
     */
    public async yieldsValue(expected: T): Promise<T> {
        return this.satisfies(actual => actual === expected);
    }

    /**
     * Persevere, polling the underlying promise function, until either a value satisfying the predicate is provided or the perseverance criteria is breached.
     * @param predicate that the underlying promise function should yield a value to satisfy
     * @return the value that the underlying promise yields
     */
    public async satisfies(predicate: (value: T) => boolean): Promise<T> {
        const mustBeAtLeastTime = new AssertableDate().plusMillis(this.options.minMillis);
        const maxFinishTime = new AssertableDate().plusMillis(this.options.maxMillis);

        let latestValue: T ;
        do {
            const awaited = await Promise.race([
                this.options.testableFunc().then(value => {
                    return {
                        key: 'RESOLVED',
                        value
                    };
                }),
                sleep(maxFinishTime.millisFromNow()).then(() => {
                    return {
                        key: 'TIMED_OUT',
                        value: null
                    };
                })
            ]);

            latestValue = awaited.value;

            if (awaited.key === 'RESOLVED' && predicate(awaited.value)) {
                if (mustBeAtLeastTime.isInTheFuture()) {
                    const errorMessage = 'The provided function yielded the value before it was supposed to!';

                    if (this.options.errorHandler) {
                        throw this.options.errorHandler(errorMessage, latestValue);
                    }

                    throw new Error(errorMessage);
                }

                return awaited.value;
            }

            await sleep(this.calculatePollInterval(maxFinishTime));
        } while (maxFinishTime.isInTheFuture());

        const errorMessage = `The provided function did not yield the expected value after the max allotted time (${this.options.maxMillis} millis)`;

        if (this.options.errorHandler) {
            throw this.options.errorHandler(errorMessage, latestValue);
        }

        throw new Error(errorMessage);
    }

    /**
     * Persevere, polling the underlying promise function, until it stops throwing / rejecting or the perseverance criteria is breached.
     * @return the value that the underlying promise yields
     */
    public async noExceptions(): Promise<T> {
        const mustBeAtLeastTime = new AssertableDate().plusMillis(this.options.minMillis);
        const maxFinishTime = new AssertableDate().plusMillis(this.options.maxMillis);

        do {
            let value: T;
            try {
                value = await Promise.race([
                    this.options.testableFunc(),
                    sleep(maxFinishTime.millisFromNow()).then(() => {
                        throw new Error('Times up!');
                    })
                ]);
            } catch (e) {
                await sleep(this.calculatePollInterval(maxFinishTime));

                continue;
            }

            if (mustBeAtLeastTime.isInTheFuture()) {
                throw new Error('The provided function stopped throwing before it was supposed to!');
            }

            return value;
        } while (maxFinishTime.isInTheFuture());

        throw new Error(`The provided function did not stop throwing within the allotted time (${this.options.maxMillis} millis)`);
    }

    private calculatePollInterval(maxFinishTime: AssertableDate): number {
        const timeUntilFinishInMillis = maxFinishTime.millisFromNow();

        return this.options.pollIntervalMillis < timeUntilFinishInMillis ? this.options.pollIntervalMillis : timeUntilFinishInMillis;
    }
}