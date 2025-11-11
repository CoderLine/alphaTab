import type * as alphaTab from '@src/alphaTab.main';
import type { createConnection } from 'vscode-languageserver/lib/node/main';
import type { TextDocument } from 'vscode-languageserver-textdocument';

export type Connection = ReturnType<typeof createConnection>;

export interface AlphaTexTextDocument extends TextDocument {
    score?: alphaTab.model.Score;
    ast?: alphaTab.importer.alphaTex.AlphaTexScoreNode;
}
