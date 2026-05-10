/**
 * Covers `||=` and `&&=` on boolean operands.
 * These lower to `f = f || rhs` / `f = f && rhs` without int-casts.
 *
 * @public
 */
export class LogicalAssignBool {
    public orAssign(a: boolean, b: boolean): boolean {
        let f = a;
        f ||= b;
        return f;
    }

    public andAssign(a: boolean, b: boolean): boolean {
        let f = a;
        f &&= b;
        return f;
    }
}
