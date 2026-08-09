import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { startLanguageServer } from '@coderline/alphatab-language-server/server/common';

/**
 * Starts a new language server communicating from a Node.js process with a parent Node.js.
 */
export function startNodeLanguageServer() {
    startLanguageServer(createConnection(ProposedFeatures.all));
}
