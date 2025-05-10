class QueueItem<T> {
    public value: T;
    public next?: QueueItem<T>;

    public constructor(value: T) {
        this.value = value;
    }
}

export class Queue<T> {
    private _head?: QueueItem<T>;
    private _tail?: QueueItem<T>;

    public get isEmpty() {
        return this._head === undefined;
    }

    public clear() {
        this._head = undefined;
        this._tail = undefined;
    }

    public enqueue(item: T) {
        const queueItem = new QueueItem<T>(item);
        if (this._tail) {
            // not empty -> add after tail
            this._tail!.next = queueItem;
            this._tail = queueItem;
        } else {
            // empty -> new item takes head and tail
            this._head = queueItem;
            this._tail = queueItem;
        }
    }

    public peek(): T | undefined {
        const head = this._head;
        if (!head) {
            return undefined;
        }
        return head.value;
    }

    public dequeue(): T | undefined {
        const head = this._head;
        if (!head) {
            return undefined;
        }

        const newHead:QueueItem<T>|undefined = head.next;
        this._head = newHead;
        // last item removed?
        if (!newHead) {
            this._tail = undefined;
        }
        return head.value;
    }
}
