/**
 * Covers class inheritance:
 *  - extends keyword
 *  - constructor with super() call
 *  - method override with override keyword
 *  - calling super.method()
 *
 * @public
 */
export class Animal {
    protected name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public speak(): string {
        return `${this.name} makes a sound.`;
    }
}

/**
 * @public
 */
export class Dog extends Animal {
    public constructor(name: string) {
        super(name);
    }

    public override speak(): string {
        const base = super.speak();
        return `${base} Woof!`;
    }
}
