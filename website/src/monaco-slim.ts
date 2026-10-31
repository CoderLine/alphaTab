// Target of the `monaco-editor$` webpack alias: the editor API plus the editor
// features the alphaTex editor uses, without Monaco's bundled language
// registrations and remaining contributions (`features/register.all` adds ~1,000
// modules). The set follows what the alphaTex language server provides
// (completion, signature help, hover, diagnostics) and the options in
// packages/ui/src/editor/AlphaTexEditor.tsx (no folding, no context menu).
import 'monaco-editor/features/codicon/register';
import 'monaco-editor/features/bracketMatching/register';
import 'monaco-editor/features/clipboard/register';
import 'monaco-editor/features/comment/register';
import 'monaco-editor/features/cursorUndo/register';
import 'monaco-editor/features/find/register';
import 'monaco-editor/features/gotoError/register';
import 'monaco-editor/features/hover/register';
import 'monaco-editor/features/linesOperations/register';
import 'monaco-editor/features/multicursor/register';
import 'monaco-editor/features/parameterHints/register';
import 'monaco-editor/features/snippet/register';
import 'monaco-editor/features/suggest/register';
import 'monaco-editor/features/wordOperations/register';
// The suggest widget; `features/suggest` only adds the inline-completion bridge.
import 'monaco-editor/editor/contrib/suggest/browser/suggestController';

export * from 'monaco-editor/editor';
