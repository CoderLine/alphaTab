/**
 * @public
 */
export class ForInObject {
    public countKeys(o: object): number {
        let count = 0;
        for (const _key in o) {
            count++;
        }
        return count;
    }
}
