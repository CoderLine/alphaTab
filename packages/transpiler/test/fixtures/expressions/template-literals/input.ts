/**
 * Covers template literal strings:
 *  - basic template literal with variable interpolation
 *  - template literal with expression interpolation
 *  - template literal with method call interpolation
 *
 * @public
 */
export class TemplateLiterals {
    public greet(name: string): string {
        return `Hello, ${name}!`;
    }

    public describe(x: number, y: number): string {
        return `Point at (${x}, ${y})`;
    }

    public summary(items: number): string {
        return `You have ${items} item${items === 1 ? '' : 's'}.`;
    }
}
