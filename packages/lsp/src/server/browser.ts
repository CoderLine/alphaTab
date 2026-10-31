import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser';
import { startLanguageServer } from '@coderline/alphatab-language-server/server/common';

/**
 * The messaging members the language server uses on a port. A `MessagePort`, a `Worker`
 * and a worker's `self` (`DedicatedWorkerGlobalScope`) all satisfy it, so the type is
 * usable from projects with either the DOM or the WebWorker library.
 */
export interface LanguageServerMessagePort {
    postMessage(message: unknown): void;
    addEventListener(type: 'error', listener: (event: Event) => void): void;
    onmessage: ((event: MessageEvent) => unknown) | null;
}

/**
 * Starts a new language server communicating via WebWorker.
 * @param readerPort The port used to reading incoming language server messages
 * @param writerPort The port used to writer outgoing language server messages
 */
export function startWebWorkerLanguageServer(
    readerPort: LanguageServerMessagePort,
    writerPort: LanguageServerMessagePort
) {
    startLanguageServer(
        createConnection(
            new BrowserMessageReader(readerPort as MessagePort),
            new BrowserMessageWriter(writerPort as MessagePort)
        )
    );
}
