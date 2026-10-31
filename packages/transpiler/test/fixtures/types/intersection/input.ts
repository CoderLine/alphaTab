/**
 * Exercises the only intersection idiom the transpiler accepts:
 * `T & {}` (NonNullable<T>). Intersections of two distinct
 * non-empty operands are refused — see
 * test/fixtures/errors/intersection-multi-operand/.
 *
 * @public
 */
export class Intersection {
    public requireValue<T>(value: T & {}): T {
        return value;
    }
}
