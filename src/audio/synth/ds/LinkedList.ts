export class LinkedListNode<T> {
    public list: LinkedList<T>;
    public nextInternal: LinkedListNode<T> | null = null;
    public prevInternal: LinkedListNode<T> | null = null;
    public value: T;

    public constructor(list: LinkedList<T>, value: T) {
        this.list = list;
        this.value = value;
    }

    public get next(): LinkedListNode<T> | null {
        return !this.nextInternal || this.list.first === this.nextInternal ? null : this.nextInternal;
    }

    public get prev(): LinkedListNode<T> | null {
        return !this.prevInternal || this === this.list.first ? null : this.prevInternal;
    }
}

export class LinkedList<T> {
    public first: LinkedListNode<T> | null = null;
    public length: number = 0;

    public addFirst(value: T): void {
        const node: LinkedListNode<T> = new LinkedListNode<T>(this, value);
        if (!this.first) {
            this.insertNodeToEmptyList(node);
        } else {
            this.insertNodeBefore(this.first, node);
            this.first = node;
        }
    }

    public addLast(value: T): void {
        const node: LinkedListNode<T> = new LinkedListNode<T>(this, value);
        if (!this.first) {
            this.insertNodeToEmptyList(node);
        } else {
            this.insertNodeBefore(this.first, node);
        }
    }

    public removeFirst(): T | null {
        if (!this.first) {
            return null;
        }
        let v: T = this.first.value;
        this.remove(this.first);
        return v;
    }

    public removeLast(): T | null {
        if (!this.first) {
            return null;
        }

        if (!this.first.prevInternal) {
            return null;
        }

        const v: T = this.first.prevInternal.value;
        this.remove(this.first.prevInternal);
        return v;
    }

    public remove(n: LinkedListNode<T>): void {
        if (n.nextInternal === n) {
            this.first = null;
        } else {
            if (n.nextInternal) {
                n.nextInternal.prevInternal = n.prevInternal;
            }
            if (n.prevInternal) {
                n.nextInternal = n.nextInternal;
            }

            if (this.first === n) {
                this.first = n.nextInternal;
            }
        }
        this.length--;
    }

    private insertNodeBefore(node: LinkedListNode<T>, newNode: LinkedListNode<T>): void {
        newNode.nextInternal = node;
        newNode.prevInternal = node.prevInternal;
        if (node.prevInternal) {
            node.prevInternal.nextInternal = newNode;
        }
        node.prevInternal = newNode;
        newNode.list = this;
        this.length++;
    }

    private insertNodeToEmptyList(node: LinkedListNode<T>): void {
        node.nextInternal = node;
        node.prevInternal = node;
        node.list = this;
        this.first = node;
        this.length++;
    }
}
