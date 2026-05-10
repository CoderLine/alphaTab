/**
 * Covers regex literals, including a stored regex and an inline regex
 * with the `g` flag used in `String.prototype.replace`.
 *
 * @public
 */
export class RegexExample {
    public hasDigits(s: string): boolean {
        const re = /\d+/;
        return re.test(s);
    }

    public extract(s: string): string {
        return s.replace(/[aeiou]/g, '*');
    }
}
