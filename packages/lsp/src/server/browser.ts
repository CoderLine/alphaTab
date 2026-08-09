import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser';
import { startLanguageServer } from '@coderline/alphatab-language-server/server/common';

type Port = ConstructorParameters<typeof BrowserMessageReader>[0];

/**
 * Starts a new language server communicating via WebWorker.
 * @param readerPort The port used to reading incoming language server messages
 * @param writerPort The port used to writer outgoing language server messages
 */
export function startWebWorkerLanguageServer(readerPort: Port, writerPort: Port) {
    startLanguageServer(
        createConnection(new BrowserMessageReader(readerPort), new BrowserMessageWriter(writerPort))
    );
}
