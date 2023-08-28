import {AtMost} from 'lib/perseverers/at-most';
import {TemporalUnit, TemporalUnitConversion} from 'lib/temporal-unit';
import {AtLeast} from 'lib/perseverers/at-least';
import {PersevereFor} from 'lib/perseverers/persevere-for';

export class Persevere {

    public atMost(value: number, unit: TemporalUnit): PersevereFor {
        return new AtMost({
            maxMillis: TemporalUnitConversion.asMillis(value, unit)
        });
    }

    public atLeast(value: number, unit: TemporalUnit): AtLeast {
        return new AtLeast({
            minMillis: TemporalUnitConversion.asMillis(value, unit)
        });
    }
}

export function persevere() {
    return new Persevere();
}
