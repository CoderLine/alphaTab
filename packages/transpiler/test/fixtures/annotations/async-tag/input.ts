/**
 * @public
 */
export class AsyncTag {
    /**
     * @async
     */
    public load(): Promise<number> {
        return Promise.resolve(42);
    }
}
