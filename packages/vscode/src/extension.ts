import path from 'node:path';
import { setupPreview } from 'src/preview';
import * as vscode from 'vscode';

import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
    const logChannel = vscode.window.createOutputChannel('alphaTab', { log: true });

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
        synchronize: {},
        outputChannel: logChannel
    };

    const client = new LanguageClient('alphaTex', 'alphaTex Language Client', serverOptions, clientOptions);
    client.start();
    disposables.push(client);

    disposables.push(...setupPreview(context, logChannel));
}

export function deactivate() {
    for(const d of disposables) {
        d.dispose();
    }
    
    disposables = [];
}
