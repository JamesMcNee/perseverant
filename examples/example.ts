import { persevereFor } from 'lib/index';


async function whatever(): Promise<void> {
    const shash: string = await persevereFor()
        .atMost(10, 'SECONDS')
        .until(async () => {
            const shash = 'hello';

            return shash;
        })
        .satisfies(s => s.startsWith('he'));


    console.log(shash);
}

whatever().catch(e => console.error(e));


