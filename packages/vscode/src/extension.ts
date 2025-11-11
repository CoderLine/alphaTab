import path from 'node:path';
import type * as vscode from 'vscode';

import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'));

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'alphatex' }],
        synchronize: {
        }
    };

    client = new LanguageClient('alphaTex', 'alphaTex Language Client', serverOptions, clientOptions);
    client.start();
}

export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
