/**
 * Top-level `const` of arrow-function type. Lowered as a field of
 * function/lambda type (not a static method).
 *
 * @public
 */
export const square: (n: number) => number = (n: number) => n * n;
