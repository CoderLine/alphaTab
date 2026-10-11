// Target of the `monaco-editor$` webpack alias: the editor API plus all editor
// features, without the bundled language registrations of Monaco's root entry.
import 'monaco-editor/features/register.all';

export * from 'monaco-editor/editor';
