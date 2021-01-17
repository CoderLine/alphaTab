export class Queue<T> {
    private _items: T[] = [];
    private _position: number = 0;

    public isEmpty: boolean = true;

    public clear() {
        this._items = [];
        this._position = 0;
        this.isEmpty = true;
    }

    public enqueue(item: T) {
        this.isEmpty = false;
        this._items.push(item);
    }

    public peek(): T {
        return this._items[this._position];
    }

    public dequeue(): T {
        const item = this._items[this._position];
        this._position++;
        if (this._position >= this._items.length / 2) {
            this._items = this._items.slice(this._position);
            this._position = 0;
        }
        this.isEmpty = this._items.length == 0;
        return item;
    }

    public toArray(): T[] {
        const items = this._items.slice(this._position);
        items.reverse();
        return items;
    }
}
