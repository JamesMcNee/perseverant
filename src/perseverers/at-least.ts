import {sleep} from 'lib/utils';
import {PersevereFor, Until} from 'lib/perseverers/persevere-for';
import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';
import {AssertableDate} from 'lib/assertableDate';

export class AtLeast {

    constructor(private options: {
        minMillis: number
    }) {
    }

    public andAtMost(value: number, unit: TemporalUnit): PersevereFor {
        return new AtLeastAndAtMost({
            minMillis: this.options.minMillis,
            maxMillis: TemporalUnitConversion.asMillis(value, unit)
        });
    }
}

export class AtLeastAndAtMost extends PersevereFor {

    constructor(private options: {
        minMillis: number,
        maxMillis: number
    }) {
        super();
        this.pollIntervalMillis = this.options.minMillis / 5;
    }

    public override withPollInterval(value: number, unit: TemporalUnit): this {
        super.withPollInterval(value, unit);

        if (this.options.minMillis <= this.pollIntervalMillis) {
            throw new Error(`The poll interval must be less than the min allowed wait time of ${this.options.minMillis}ms`);
        }

        return this;
    }

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
        testableFunc: () => Promise<T>
    }) {
    }

    public async yieldsValue(expected: T): Promise<void> {
        return this.satisfies(actual => actual === expected);
    }

    public async satisfies(predicate: (value: T) => boolean): Promise<void> {
        const mustBeAtLeastTime = new AssertableDate().plusMillis(this.options.minMillis);
        const maxFinishTime = new AssertableDate().plusMillis(this.options.maxMillis);

        do {
            const awaited = await this.options.testableFunc();

            if (predicate(awaited)) {
                if (mustBeAtLeastTime.isInTheFuture()) {
                    throw new Error('The provided function yielded the value before it was supposed to!');
                }

                return;
            }

            await sleep(this.calculatePollInterval(maxFinishTime));
        } while (maxFinishTime.isInTheFuture());

        throw new Error(`The provided function did not yield the expected value after the max allotted time (${this.options.maxMillis} millis)`);
    }

    private calculatePollInterval(maxFinishTime: AssertableDate): number {
        const timeUntilFinishInMillis = maxFinishTime.millisFromNow();

        return this.options.pollIntervalMillis < timeUntilFinishInMillis ? this.options.pollIntervalMillis : timeUntilFinishInMillis;
    }
}