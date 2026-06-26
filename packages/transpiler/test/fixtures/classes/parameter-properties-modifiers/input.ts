/**
 * Optional and default-initializer parameter properties.
 * The optional one's property type should be nullable. The default value
 * lives on the parameter, not on the property.
 *
 * @public
 */
export class Profile {
    public constructor(
        public readonly name: string,
        public readonly nickname?: string,
        public readonly age: number = 0
    ) {}

    public describe(): string {
        return `${this.name}/${this.nickname ?? ''}/${this.age}`;
    }
}
