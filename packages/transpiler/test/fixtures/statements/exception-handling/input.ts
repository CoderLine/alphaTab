/**
 * Covers exception-handling statements:
 *  - throw new Error(...)
 *  - try/catch block
 *  - try/finally block
 *  - combined try/catch/finally in a single method
 *  - bare catch (no binding variable)
 *
 * @public
 */
export class ExceptionHandling {
    public divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }

    public safeDouble(n: number): number {
        try {
            if (n < 0) {
                throw new Error('Negative input');
            }
            return n * 2;
        } catch (e) {
            return 0;
        }
    }

    public withCleanup(value: number): number {
        let result = 0;
        try {
            result = value * 2;
        } finally {
            result += 1;
        }
        return result;
    }

    public fullCleanup(value: number): number {
        let result = 0;
        try {
            if (value < 0) {
                throw new Error('bad input');
            }
            result = value * 2;
        } catch (e) {
            result = -1;
        } finally {
            result += 1;
        }
        return result;
    }

    public bareCatch(): number {
        try {
            throw new Error('oops');
        } catch {
            return -1;
        }
    }
}
