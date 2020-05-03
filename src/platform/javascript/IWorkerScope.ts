/**
 * @target web
 */
export interface IWorkerScope {
    addEventListener(eventType: string, listener: (e: MessageEvent) => void, capture?: boolean): void;
    postMessage(message: unknown): void;
}
