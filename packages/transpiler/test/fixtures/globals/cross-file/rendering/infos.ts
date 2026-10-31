/**
 * @internal
 * @record
 */
export interface Info {
    id: string;
    check: (value: number) => boolean;
}

/**
 * Builds a check function (imported and called from another file).
 * @internal
 */
export function createCheck(threshold: number): (value: number) => boolean {
    return (value: number): boolean => value > threshold;
}

/**
 * Reassigns its parameter (Kotlin parameters are immutable).
 * @internal
 */
export function countDown(num: number): number {
    let steps = 0;
    while (num > 0) {
        num -= 2;
        steps++;
    }
    return steps;
}

/**
 * @internal
 */
export const defaultInfo: Info = {
    id: 'default',
    check: createCheck(1)
};
