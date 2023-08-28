export class AssertableDate extends Date {

    public isBefore(other: Date): boolean {
        return this.getTime() < other.getTime();
    }

    public isInThePast(): boolean {
        return this.isBefore(new Date());
    }

    public isAfter(other: Date): boolean {
        return this.getTime() > other.getTime();
    }

    public isInTheFuture(): boolean {
        return this.isAfter(new Date());
    }

    public plusMillis(milliseconds: number): AssertableDate {
        return new AssertableDate(this.getTime() + milliseconds);
    }

    public minusMillis(milliseconds: number): AssertableDate {
        return new AssertableDate(this.getTime() - milliseconds);
    }

    public millisFromNow(): number {
        const difference =  this.getTime() - new Date().getTime();
        return difference > 0 ? difference : 0;
    }
}