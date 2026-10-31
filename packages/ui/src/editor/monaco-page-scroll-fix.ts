import type * as Monaco from 'monaco-editor';
import { ResizableContentWidget } from 'monaco-editor/editor/contrib/hover/browser/resizableContentWidget';
import { SuggestWidget } from 'monaco-editor/editor/contrib/suggest/browser/suggestWidget';

// Monaco's suggest and hover widgets measure the editor with its page position (which
// includes `scrollY`) but compare it with the viewport height. On a page whose document
// scrolls they therefore open above the cursor even when there is room below
// (https://github.com/microsoft/monaco-editor/issues/5512). The fix below corrects those
// two measurements on Monaco's private methods. test/monaco-page-scroll-fix.test.ts fails
// when the patched Monaco code changes; delete this module once Monaco fixes #5512.

type ScrolledVisiblePosition = ReturnType<Monaco.editor.ICodeEditor['getScrolledVisiblePosition']>;

interface SuggestWidgetInternals {
    editor?: Monaco.editor.ICodeEditor;
    _layout(size: unknown): void;
}

interface HoverWidgetInternals {
    _editor?: Monaco.editor.ICodeEditor;
    _availableVerticalSpaceAbove(position: Monaco.IPosition): number | undefined;
    _availableVerticalSpaceBelow(position: Monaco.IPosition): number | undefined;
}

let applied = false;

/** Applies the placement fix once per page; leaves Monaco untouched if its internals moved. */
export function applyMonacoPageScrollFix(): void {
    if (applied) { return; }
    applied = true;
    patchSuggestWidget();
    patchHoverWidget();
}

function pageScrollY(editor: Monaco.editor.ICodeEditor | undefined): number {
    return editor?.getDomNode()?.ownerDocument.defaultView?.scrollY ?? 0;
}

function warnNotApplied(member: string): void {
    console.warn(`[AlphaTexEditor] Monaco's ${member} changed; page-scroll placement fix not applied (see monaco-page-scroll-fix.ts).`);
}

function patchSuggestWidget(): void {
    const proto = SuggestWidget?.prototype as SuggestWidgetInternals | undefined;
    if (typeof proto?._layout !== 'function') {
        warnNotApplied('SuggestWidget._layout');
        return;
    }
    const layout = proto._layout;
    // `_layout` reads the cursor through `getScrolledVisiblePosition` only to add it to the
    // editor's page position; shifting it by `scrollY` for the duration of the synchronous
    // call turns that sum into the viewport position the rest of the method expects.
    proto._layout = function (this: SuggestWidgetInternals, size: unknown) {
        const editor = this.editor;
        const scrollY = pageScrollY(editor);
        if (!editor || scrollY === 0) {
            return layout.call(this, size);
        }
        const hadOwn = Object.prototype.hasOwnProperty.call(editor, 'getScrolledVisiblePosition');
        const original = editor.getScrolledVisiblePosition;
        editor.getScrolledVisiblePosition = (position): ScrolledVisiblePosition => {
            const visible = original.call(editor, position);
            return visible && { ...visible, top: visible.top - scrollY };
        };
        try {
            return layout.call(this, size);
        } finally {
            if (hadOwn) {
                editor.getScrolledVisiblePosition = original;
            } else {
                delete (editor as Partial<Monaco.editor.ICodeEditor>).getScrolledVisiblePosition;
            }
        }
    };
}

function patchHoverWidget(): void {
    const proto = ResizableContentWidget?.prototype as HoverWidgetInternals | undefined;
    if (typeof proto?._availableVerticalSpaceAbove !== 'function' || typeof proto._availableVerticalSpaceBelow !== 'function') {
        warnNotApplied('ResizableContentWidget._availableVerticalSpaceAbove/Below');
        return;
    }
    const above = proto._availableVerticalSpaceAbove;
    const below = proto._availableVerticalSpaceBelow;
    proto._availableVerticalSpaceAbove = function (this: HoverWidgetInternals, position) {
        const space = above.call(this, position);
        return space === undefined ? space : space - pageScrollY(this._editor);
    };
    proto._availableVerticalSpaceBelow = function (this: HoverWidgetInternals, position) {
        const space = below.call(this, position);
        return space === undefined ? space : space + pageScrollY(this._editor);
    };
}
