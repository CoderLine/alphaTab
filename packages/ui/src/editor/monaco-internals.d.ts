// Monaco ships no typings for its internal modules; monaco-page-scroll-fix.ts reaches into these two.
declare module 'monaco-editor/editor/contrib/suggest/browser/suggestWidget' {
    export const SuggestWidget: { prototype: object } | undefined;
}
declare module 'monaco-editor/editor/contrib/hover/browser/resizableContentWidget' {
    export const ResizableContentWidget: { prototype: object } | undefined;
}
