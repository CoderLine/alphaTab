import type {
    AlphaTabConfig,
    AlphaTexPreviewState,
    AlphaTexPreviewMessages as AlphaTexPreviewMessages
} from 'src/preview/app';
import * as vscode from 'vscode';

export function setupPreview(
    context: vscode.ExtensionContext,
    logChannel: vscode.LogOutputChannel
): vscode.Disposable[] {
    const preview = new AlphaTexPreview(logChannel, context);

    const openPreviewCommand = vscode.commands.registerCommand('alphatab-vscode.commands.openPreview', () => {
        preview.open();
    });

    const refreshPreviewCommand = vscode.commands.registerCommand('alphatab-vscode.commands.refreshPreview', () => {
        preview.refresh();
    });

    return [openPreviewCommand, refreshPreviewCommand, preview];
}

class AlphaTexPreviewSerializer implements vscode.WebviewPanelSerializer {
    public constructor(private _preview: AlphaTexPreview) {}
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        this._preview.initializeWebViewPanel(webviewPanel);

        if (!state) {
            return;
        }
        const previewState: AlphaTexPreviewState = state;
        try {
            this._preview.document = await vscode.workspace.openTextDocument(
                vscode.Uri.parse(previewState.documentUri)
            );
            this._preview.refresh();
        } catch {}
    }
}

class AlphaTexPreview implements vscode.Disposable {
    private _disposables: vscode.Disposable[] = [];
    private _disposing = false;
    public document?: vscode.TextDocument;
    private _webviewPanel?: vscode.WebviewPanel;
    private _readyPromise?: Promise<void>;

    public constructor(
        private _logChannel: vscode.LogOutputChannel,
        private _context: vscode.ExtensionContext
    ) {
        this._disposables.push(
            vscode.workspace.onDidSaveTextDocument(document => {
                this.onDocumentUpdated(document, 'onDidSaveTextDocument');
            })
        );

        this._disposables.push(
            vscode.workspace.onDidChangeTextDocument(event => {
                this.onDocumentUpdated(event.document, 'onDidChangeTextDocument');
            })
        );

        this._disposables.push(
            vscode.workspace.onDidCloseTextDocument(document => {
                this.onDocumentClosed(document);
            })
        );

        this._disposables.push(
            vscode.window.registerWebviewPanelSerializer('alphatex.preview', new AlphaTexPreviewSerializer(this))
        );
    }

    public dispose() {
        this._disposing = true;
        for (const d of this._disposables) {
            d.dispose();
        }
        this._disposing = false;
        this._disposables = [];
    }

    private async onDocumentClosed(document: vscode.TextDocument) {
        const changedUri = document.uri.toString();
        const activeUri = this.document?.uri.toString();
        if (changedUri !== activeUri) {
            return;
        }

        this.close();
    }

    private async onDocumentUpdated(document: vscode.TextDocument, event: string) {
        const changedUri = document.uri.toString();
        const activeUri = this.document?.uri.toString();
        if (changedUri !== activeUri) {
            if (document.uri.scheme === 'file') {
                this._logChannel.trace(
                    `Document updated (${event}), skipping preview update not active document: ${changedUri} !== ${activeUri}`
                );
            }

            return;
        }
        this._logChannel.trace(`Active Document updated (${event}), ${changedUri}`);
        await this.refresh();
    }

    public async refresh() {
        const document = this.document;
        if (!document) {
            this._logChannel.trace(`Skipping refresh, no active document`);
            return;
        }
        const webviewPanel = this._webviewPanel;
        if (!webviewPanel) {
            this._logChannel.trace(`Skipping refresh, preview not opened`);
            return;
        }

        if (this._readyPromise) {
            this._logChannel.trace(`Waiting for preview to report as initialized`);
            await this._readyPromise;
        }

        const activeUri = document.uri.toString();
        this._logChannel.trace(`Refreshing active document ${activeUri}`);

        const message: AlphaTexPreviewMessages = {
            command: 'alphatab-vscode.commands.refreshPreview',
            alphaTex: document.getText(),
            documentUri: document.uri.toString()
        };

        for (let i = 0; i < 10; i++) {
            if (await webviewPanel.webview.postMessage(message)) {
                this._logChannel.trace(`Refresh message posted to browser`);
                break;
            } else {
                this._logChannel.trace(`Refresh failed, postMessage failed`);
                await new Promise(resolve => {
                    setTimeout(resolve, 500);
                });
            }
        }
    }

    public initializeWebViewPanel(panel: vscode.WebviewPanel) {
        this._webviewPanel = panel;

        const dist = vscode.Uri.joinPath(this._context.extensionUri, 'dist');
        const previewAppScriptPath = vscode.Uri.joinPath(dist, 'preview.js');
        const soundfontPath = vscode.Uri.joinPath(dist, 'assets', 'sonivox.sf3');
        const bravuraPath = vscode.Uri.joinPath(dist, 'assets', 'Bravura.woff2');

        const previewAppScriptUri = panel.webview.asWebviewUri(previewAppScriptPath);
        const soundfontUri = panel.webview.asWebviewUri(soundfontPath);
        const bravuraUri = panel.webview.asWebviewUri(bravuraPath);

        const config: AlphaTabConfig = {
            soundfont: soundfontUri.toString(),
            bravura: bravuraUri.toString()
        };

        const promiseWithResolvers = Promise.withResolvers<void>();
        this._readyPromise = promiseWithResolvers.promise;

        panel.webview.onDidReceiveMessage(e => {
            const message: AlphaTexPreviewMessages = e;
            switch (message.command) {
                case 'alphatab-vscode.commands.previewInitialized':
                    promiseWithResolvers.resolve();
                    break;
            }
        });

        panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>alphaTex</title>
            </head>
            <body>
                <div id="initializing">alphaTab is initializing...</div>
                <script>
                window.alphaTabConfig = ${JSON.stringify(config)};
                </script>
                <script src=${JSON.stringify(previewAppScriptUri.toString())}></script>
            </body>
            </html>
            `;

        panel.onDidDispose(() => {
            if (!this._disposing) {
                const index = this._disposables.indexOf(panel!);
                if (index >= 0) {
                    this._disposables.splice(index, 1);
                }
            }
            this._webviewPanel = undefined;
        });

        panel.onDidChangeViewState(
            ({ webviewPanel }) => {
                vscode.commands.executeCommand('setContext', 'alphaTexPreviewFocus', webviewPanel.active);
            },
            null,
            this._disposables
        );

        this._disposables.push(panel);
    }

    public async close() {
        this.document = undefined;
        if (!this._webviewPanel) {
            return;
        }

        this._webviewPanel.dispose();
        this._webviewPanel = undefined;
    }

    public async open() {
        if (!vscode.window.activeTextEditor) {
            this._logChannel.trace(`Skipping open of preview, no active text editor`);
            return;
        }

        const document = vscode.window.activeTextEditor.document;
        if (document.languageId !== 'alphatex') {
            this._logChannel.trace(`Skipping open of preview, document has wrong language: ${document.languageId}`);
            return;
        }

        this.document = document;

        let panel = this._webviewPanel;
        if (!panel) {
            const dist = vscode.Uri.joinPath(this._context.extensionUri, 'dist');

            panel = vscode.window.createWebviewPanel('alphatex.preview', 'alphaTex Preview', vscode.ViewColumn.Beside, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [dist]
            });

            this.initializeWebViewPanel(panel);
        }

        panel.reveal(vscode.ViewColumn.Beside);
        vscode.commands.executeCommand('setContext', 'alphaTexPreviewFocus', true);

        await this.refresh();
    }
}
