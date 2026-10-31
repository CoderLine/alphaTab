import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// src/editor/monaco-page-scroll-fix.ts corrects two private Monaco measurements. These
// checks pin the exact Monaco code it was written against, so a Monaco update that moves
// or fixes it (https://github.com/microsoft/monaco-editor/issues/5512) fails here: then
// re-check the bug on a scrolled page and update or delete the fix.

// Monaco's `exports` map has no `./package.json`, so the root is found from its entry file.
function packageRoot(file: string): string {
    const dir = path.dirname(file);
    return path.basename(dir) === 'monaco-editor' ? dir : packageRoot(dir);
}
const monacoRoot = packageRoot(createRequire(import.meta.url).resolve('monaco-editor'));
const source = (file: string) => readFileSync(path.join(monacoRoot, 'esm/vs/editor/contrib', file), 'utf8');

describe('Monaco code patched by monaco-page-scroll-fix', () => {
    it('SuggestWidget._layout adds the cursor to the page position of the editor', () => {
        const widget = source('suggest/browser/suggestWidget.js');
        expect(widget).toContain('export { SuggestContentWidget, SuggestWidget,');
        expect(widget).toContain('    _layout(size) {');
        expect(widget).toContain('const editorBox = getDomNodePagePosition(this.editor.getDomNode());');
        expect(widget).toContain('const cursorBox = this.editor.getScrolledVisiblePosition(this.editor.getPosition());');
        expect(widget).toContain('const cursorBottom = editorBox.top + cursorBox.top + cursorBox.height;');
        expect(widget).toContain('const maxHeightBelow = Math.min(bodyBox.height - cursorBottom - info.verticalPadding, fullHeight);');
        // The fix shifts every `getScrolledVisiblePosition` call made during `_layout`.
        expect(widget.match(/getScrolledVisiblePosition\(/g)).toHaveLength(1);
    });

    it('ResizableContentWidget measures vertical space from the page position of the editor', () => {
        const widget = source('hover/browser/resizableContentWidget.js');
        expect(widget).toContain('export { ResizableContentWidget };');
        expect(widget).toContain('const editorBox = getDomNodePagePosition(editorDomNode);\n        return editorBox.top + mouseBox.top - TOP_HEIGHT;');
        expect(widget).toContain('const mouseBottom = editorBox.top + mouseBox.top + mouseBox.height;\n        return bodyBox.height - mouseBottom - BOTTOM_HEIGHT;');
    });
});
