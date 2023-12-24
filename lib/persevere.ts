import {AtMost} from 'lib/perseverers/at-most';
import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';
import {AtLeast} from 'lib/perseverers/at-least';
import {TemporalBinding} from 'lib/perseverers/temporal-binding';

export class Persevere {

    /**
     * Configure to persevere for at most the given amount of time.
     *
     * @param value the numeric value to wait
     * @param unit the temporal unit that the value denotes
     * @return TemporalBinding a temporally bound class ready for further configuration
     */
    public atMost<T>(value: number, unit: TemporalUnit): TemporalBinding<T> {
        return new AtMost({
            maxMillis: TemporalUnitConversion.asMillis(value, unit)
        });
    }

    /**
     * Configure to persevere for at least the given amount of time, must also be configured with an upper bound through a subsequent call to `.andAtMost()`.
     *
     * @param value the numeric value to wait
     * @param unit the temporal unit that the value denotes
     * @return TemporalBinding a temporally bound class ready for further configuration
     */
    public atLeast<T>(value: number, unit: TemporalUnit): AtLeast<T> {
        return new AtLeast({
            minMillis: TemporalUnitConversion.asMillis(value, unit)
        });
    }
}