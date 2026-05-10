/**
 * Covers `new Promise<T>(resolve => ...)` construction, exercising the
 * transpiler's lowering of explicit Promise instantiation.
 *
 * @public
 */
export class PromiseConstruction {
    public delayed(value: number): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(value);
        });
    }
}
