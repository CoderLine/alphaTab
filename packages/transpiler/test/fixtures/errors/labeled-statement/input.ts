/**
 * @public
 */
export class Labeled {
    public findFirst(matrix: number[][], target: number): number {
        outer: for (const row of matrix) {
            for (const cell of row) {
                if (cell === target) {
                    break outer;
                }
            }
        }
        return -1;
    }
}
