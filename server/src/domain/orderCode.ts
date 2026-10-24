export type Clock = () => Date;

// How the visible code of an order is formed. A strategy: another format is another class.
export interface OrderCodeGenerator {
    generate(id: number): string;
}

// OS-2026-025: the year the order is created in, and its id padded to three digits.
export class YearlySequenceCodeGenerator implements OrderCodeGenerator {
    constructor(private readonly clock: Clock = () => new Date()) {}

    generate(id: number): string {
        return `OS-${this.clock().getFullYear()}-${String(id).padStart(3, "0")}`;
    }
}
