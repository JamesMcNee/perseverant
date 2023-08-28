import {sleep} from 'lib/utils';
import {PersevereFor, Until} from 'lib/perseverers/persevere-for';
import {TemporalUnit} from 'lib/temporal-unit';
import {AssertableDate} from 'lib/assertableDate';

export class AtMost extends PersevereFor {

    constructor(private options: {
        maxMillis: number
    }) {
        super();
        this.pollIntervalMillis = this.options.maxMillis / 5;
    }

    public override withPollInterval(value: number, unit: TemporalUnit): this {
        super.withPollInterval(value, unit);

        if (this.options.maxMillis <= this.pollIntervalMillis) {
            throw new Error(`The poll interval must be less than the maximum allowed wait time of ${this.options.maxMillis}ms`);
        }

        return this;
    }

    public until<T>(arg: (() => Promise<T>) | Promise<T>): Until<T> {
        if (arg instanceof Promise) {
            return new AtMostUntil<T>({
                maxMillis: this.options.maxMillis,
                pollIntervalMillis: this.pollIntervalMillis,
                testableFunc: () => arg
            });
        }

        return new AtMostUntil<T>({
            maxMillis: this.options.maxMillis,
            pollIntervalMillis: this.pollIntervalMillis,
            testableFunc: arg
        });
    }

}

export class AtMostUntil<T> implements Until<T> {

    constructor(private readonly options: {
        maxMillis: number
        pollIntervalMillis: number
        testableFunc: () => Promise<T>
    }) {}

    public async yieldsValue(value: T): Promise<void> {
        const maxFinishTime = new AssertableDate().plusMillis(this.options.maxMillis);

        do {
            const awaited = await this.options.testableFunc();

            if (value === awaited) {
                return;
            }

            await sleep(this.calculatePollInterval(maxFinishTime));
        } while (maxFinishTime.isInTheFuture());

        throw new Error(`The provided function did not yield the expected value within the allotted time (${this.options.maxMillis} millis)`);
    }

    private calculatePollInterval(maxFinishTime: AssertableDate): number {
        const timeUntilFinishInMillis = maxFinishTime.millisFromNow();

        return this.options.pollIntervalMillis < timeUntilFinishInMillis ? this.options.pollIntervalMillis : timeUntilFinishInMillis;
    }
}