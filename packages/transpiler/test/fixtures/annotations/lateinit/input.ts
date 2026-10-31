/**
 * @public
 */
export class LateInit {
    /**
     * @lateinit
     */
    public dependency!: string;

    public init(value: string): void {
        this.dependency = value;
    }
}
