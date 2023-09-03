import {Persevere} from 'lib/persevere';

/**
 * Entrypoint into the persevere chain
 *
 * Follow up with a temporal binding method (e.g. {@link Persevere(atMost:instance)}) in order to continue building...
 * @returns Persevere an instance of the {@link Persevere} class
 */
export function persevere(): Persevere {
    return new Persevere();
}

/**
 * Entrypoint into the persevere chain
 *
 * Follow up with a temporal binding method (e.g. {@link Persevere(atMost:instance)}) in order to continue building...
 * @returns Persevere an instance of the {@link Persevere} class
 */
export function persevereFor(): Persevere {
    return new Persevere();
}