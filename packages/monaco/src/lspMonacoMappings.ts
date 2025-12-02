import { DiagnosticSeverity } from '@coderline/alphatab-language-server/server/types';
import * as monaco from 'monaco-editor';
import {
    CompletionTriggerKind,
    SignatureHelpTriggerKind,
    type TextDocumentContentChangeEvent
} from 'vscode-languageserver-protocol';
import type {
    CompletionItem,
    Diagnostic,
    DiagnosticRelatedInformation,
    Hover,
    ParameterInformation,
    Range,
    SignatureHelp,
    SignatureInformation,
    TextEdit
} from 'vscode-languageserver-types';
import {
    CompletionItemKind,
    CompletionItemTag,
    InsertTextFormat,
    MarkedString,
    MarkupContent
} from 'vscode-languageserver-types';

export function lspToMonacoSeverity(severity: DiagnosticSeverity | undefined): monaco.MarkerSeverity {
    if (severity === undefined) {
        return monaco.MarkerSeverity.Info;
    } else {
        switch (severity) {
            case DiagnosticSeverity.Error:
                return monaco.MarkerSeverity.Error;
            case DiagnosticSeverity.Hint:
                return monaco.MarkerSeverity.Hint;
            case DiagnosticSeverity.Information:
                return monaco.MarkerSeverity.Info;
            case DiagnosticSeverity.Warning:
                return monaco.MarkerSeverity.Warning;
        }
    }
}

export type MonacoLocation = Pick<
    monaco.editor.IRelatedInformation,
    'startColumn' | 'startLineNumber' | 'endColumn' | 'endLineNumber'
>;

export function lspToMonacoMarker(diagnostic: Diagnostic): monaco.editor.IMarkerData {
    return {
        severity: lspToMonacoSeverity(diagnostic.severity),
        message: diagnostic.message,
        ...lspToMonacoRange(diagnostic.range),
        code: diagnostic.code?.toString(),
        tags: diagnostic.tags,
        source: diagnostic.source,
        relatedInformation: diagnostic.relatedInformation?.map(lspToMonacoRelatedInformation)
    };
}

export function lspToMonacoRange(range: Range): monaco.Range {
    return new monaco.Range(
        range.start.line + 1,
        range.start.character + 1,
        range.end.line + 1,
        range.end.character + 1
    );
}

export function monacoToLspRange(range: monaco.IRange): Range {
    return {
        start: {
            line: range.startLineNumber - 1,
            character: range.startColumn - 1
        },
        end: {
            line: range.endLineNumber - 1,
            character: range.endColumn - 1
        }
    };
}

export function lspToMonacoRelatedInformation(value: DiagnosticRelatedInformation): monaco.editor.IRelatedInformation {
    return {
        ...lspToMonacoRange(value.location.range),
        resource: monaco.Uri.parse(value.location.uri),
        message: value.message
    };
}

export function monacoToLspContentChange(change: monaco.editor.IModelContentChange): TextDocumentContentChangeEvent {
    return {
        range: monacoToLspRange(change.range),
        text: change.text
    };
}

export function monacoToLspCompletionTriggerKind(
    triggerKind: monaco.languages.CompletionTriggerKind
): CompletionTriggerKind {
    switch (triggerKind) {
        case monaco.languages.CompletionTriggerKind.Invoke:
            return CompletionTriggerKind.Invoked;
        case monaco.languages.CompletionTriggerKind.TriggerCharacter:
            return CompletionTriggerKind.TriggerCharacter;
        case monaco.languages.CompletionTriggerKind.TriggerForIncompleteCompletions:
            return CompletionTriggerKind.TriggerForIncompleteCompletions;
    }
}

export function lspToMonacoCompletionItem(
    value: CompletionItem,
    cursorPosition: monaco.languages.CompletionItem['range']
): monaco.languages.CompletionItem {
    return {
        insertText: value.insertText ?? value.label,
        kind: lspToMonacoCompletionKind(value.kind),
        label: {
            label: value.label,
            description: value.labelDetails?.description,
            detail: value.labelDetails?.detail
        },
        range: cursorPosition,
        command: value.command
            ? {
                  id: value.command.command,
                  title: value.command.title,
                  arguments: value.command.arguments
              }
            : undefined,
        additionalTextEdits: value.additionalTextEdits?.map(lspToMonacoTextEdit),
        action: undefined,
        commitCharacters: value.commitCharacters,
        detail: value.detail,
        documentation: value.documentation,
        filterText: value.filterText,
        insertTextRules:
            value.insertTextFormat === InsertTextFormat.Snippet
                ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                : undefined,
        preselect: value.preselect,
        sortText: value.sortText,
        tags: value.tags
    };
}

export function lspToMonacoCompletionKind(kind: CompletionItemKind | undefined): monaco.languages.CompletionItemKind {
    if (kind === undefined) {
        return monaco.languages.CompletionItemKind.Text;
    }

    switch (kind) {
        case CompletionItemKind.Text:
            return monaco.languages.CompletionItemKind.Text;
        case CompletionItemKind.Method:
            return monaco.languages.CompletionItemKind.Method;
        case CompletionItemKind.Function:
            return monaco.languages.CompletionItemKind.Function;
        case CompletionItemKind.Constructor:
            return monaco.languages.CompletionItemKind.Constructor;
        case CompletionItemKind.Field:
            return monaco.languages.CompletionItemKind.Field;
        case CompletionItemKind.Variable:
            return monaco.languages.CompletionItemKind.Variable;
        case CompletionItemKind.Class:
            return monaco.languages.CompletionItemKind.Class;
        case CompletionItemKind.Interface:
            return monaco.languages.CompletionItemKind.Interface;
        case CompletionItemKind.Module:
            return monaco.languages.CompletionItemKind.Module;
        case CompletionItemKind.Property:
            return monaco.languages.CompletionItemKind.Property;
        case CompletionItemKind.Unit:
            return monaco.languages.CompletionItemKind.Unit;
        case CompletionItemKind.Value:
            return monaco.languages.CompletionItemKind.Value;
        case CompletionItemKind.Enum:
            return monaco.languages.CompletionItemKind.Enum;
        case CompletionItemKind.Keyword:
            return monaco.languages.CompletionItemKind.Keyword;
        case CompletionItemKind.Snippet:
            return monaco.languages.CompletionItemKind.Snippet;
        case CompletionItemKind.Color:
            return monaco.languages.CompletionItemKind.Color;
        case CompletionItemKind.File:
            return monaco.languages.CompletionItemKind.File;
        case CompletionItemKind.Reference:
            return monaco.languages.CompletionItemKind.Reference;
        case CompletionItemKind.Folder:
            return monaco.languages.CompletionItemKind.Folder;
        case CompletionItemKind.EnumMember:
            return monaco.languages.CompletionItemKind.EnumMember;
        case CompletionItemKind.Constant:
            return monaco.languages.CompletionItemKind.Constant;
        case CompletionItemKind.Struct:
            return monaco.languages.CompletionItemKind.Struct;
        case CompletionItemKind.Event:
            return monaco.languages.CompletionItemKind.Event;
        case CompletionItemKind.Operator:
            return monaco.languages.CompletionItemKind.Operator;
        case CompletionItemKind.TypeParameter:
            return monaco.languages.CompletionItemKind.TypeParameter;
    }
}

export function monacoToLspCompletionKind(kind: monaco.languages.CompletionItemKind): CompletionItemKind {
    switch (kind) {
        case monaco.languages.CompletionItemKind.Text:
            return CompletionItemKind.Text;
        case monaco.languages.CompletionItemKind.Method:
            return CompletionItemKind.Method;
        case monaco.languages.CompletionItemKind.Function:
            return CompletionItemKind.Function;
        case monaco.languages.CompletionItemKind.Constructor:
            return CompletionItemKind.Constructor;
        case monaco.languages.CompletionItemKind.Field:
            return CompletionItemKind.Field;
        case monaco.languages.CompletionItemKind.Variable:
            return CompletionItemKind.Variable;
        case monaco.languages.CompletionItemKind.Class:
            return CompletionItemKind.Class;
        case monaco.languages.CompletionItemKind.Interface:
            return CompletionItemKind.Interface;
        case monaco.languages.CompletionItemKind.Module:
            return CompletionItemKind.Module;
        case monaco.languages.CompletionItemKind.Property:
            return CompletionItemKind.Property;
        case monaco.languages.CompletionItemKind.Unit:
            return CompletionItemKind.Unit;
        case monaco.languages.CompletionItemKind.Value:
            return CompletionItemKind.Value;
        case monaco.languages.CompletionItemKind.Enum:
            return CompletionItemKind.Enum;
        case monaco.languages.CompletionItemKind.Keyword:
            return CompletionItemKind.Keyword;
        case monaco.languages.CompletionItemKind.Snippet:
            return CompletionItemKind.Snippet;
        case monaco.languages.CompletionItemKind.Color:
            return CompletionItemKind.Color;
        case monaco.languages.CompletionItemKind.File:
            return CompletionItemKind.File;
        case monaco.languages.CompletionItemKind.Reference:
            return CompletionItemKind.Reference;
        case monaco.languages.CompletionItemKind.Folder:
            return CompletionItemKind.Folder;
        case monaco.languages.CompletionItemKind.EnumMember:
            return CompletionItemKind.EnumMember;
        case monaco.languages.CompletionItemKind.Constant:
            return CompletionItemKind.Constant;
        case monaco.languages.CompletionItemKind.Struct:
            return CompletionItemKind.Struct;
        case monaco.languages.CompletionItemKind.Event:
            return CompletionItemKind.Event;
        case monaco.languages.CompletionItemKind.Operator:
            return CompletionItemKind.Operator;
        case monaco.languages.CompletionItemKind.TypeParameter:
            return CompletionItemKind.TypeParameter;
        case monaco.languages.CompletionItemKind.Customcolor:
            return CompletionItemKind.Color;
        case monaco.languages.CompletionItemKind.User:
            return CompletionItemKind.Text;
        case monaco.languages.CompletionItemKind.Issue:
            return CompletionItemKind.Text;
        case monaco.languages.CompletionItemKind.Tool:
            return CompletionItemKind.Text;
    }
}

export function lspToMonacoTextEdit(value: TextEdit): monaco.editor.ISingleEditOperation {
    return {
        range: lspToMonacoRange(value.range),
        text: value.newText
    };
}

export function monacoToLspTextEdit(value: monaco.editor.ISingleEditOperation): TextEdit {
    return {
        range: monacoToLspRange(value.range),
        newText: value.text ?? ''
    };
}

export function monacoToLspCompletionItem(value: monaco.languages.CompletionItem): CompletionItem {
    return {
        label: typeof value.label === 'string' ? value.label : value.label.label,
        additionalTextEdits: value.additionalTextEdits?.map(monacoToLspTextEdit),
        command: value.command
            ? {
                  command: value.command.id,
                  title: value.command.title,
                  arguments: value.command.arguments
              }
            : undefined,
        commitCharacters: value.commitCharacters,
        data: undefined,
        detail: value.detail,
        documentation: value.documentation
            ? {
                  kind: typeof value.documentation === 'string' ? 'plaintext' : 'markdown',
                  value:
                      value.documentation === 'string'
                          ? value.documentation
                          : (value.documentation as monaco.IMarkdownString).value
              }
            : undefined,
        filterText: value.filterText,
        insertText: value.insertText,
        insertTextFormat:
            value.insertTextRules === monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                ? InsertTextFormat.Snippet
                : InsertTextFormat.PlainText,
        insertTextMode: undefined,
        kind: monacoToLspCompletionKind(value.kind),
        labelDetails:
            typeof value.label === 'string'
                ? undefined
                : {
                      description: value.label.description,
                      detail: value.label.detail
                  },
        preselect: value.preselect,
        sortText: value.sortText,
        tags: value.tags?.map(monacoToLspTag),
        textEdit: undefined,
        textEditText: undefined
    };
}

export function monacoToLspTag(value: monaco.languages.CompletionItemTag): CompletionItemTag {
    switch (value) {
        case monaco.languages.CompletionItemTag.Deprecated:
            return CompletionItemTag.Deprecated;
    }
}

export function lspToMonacoHover(response: Hover): monaco.languages.Hover {
    return {
        range: response.range ? lspToMonacoRange(response.range) : undefined,
        contents: MarkupContent.is(response.contents)
            ? lspToMonacoMarkupContent(response.contents)
            : MarkedString.is(response.contents)
              ? lspToMonacoMarkedString(response.contents)
              : response.contents.flatMap(lspToMonacoMarkedString)
    };
}

function lspToMonacoMarkupContent(contents: MarkupContent): monaco.IMarkdownString[] {
    return [
        {
            value: contents.kind === 'markdown' ? contents.value : markdownToPlainText(contents.value)
        }
    ];
}

const codeBlock = '```';

function lspToMonacoMarkedString(contents: MarkedString): monaco.IMarkdownString[] {
    return [
        {
            value:
                typeof contents === 'string'
                    ? contents
                    : `${codeBlock}${contents.language}\n${contents.value}\n${codeBlock}`
        }
    ];
}

function markdownToPlainText(value: string): string {
    return value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
}

export function monacoToLspSignatureHelpTriggerKind(
    triggerKind: monaco.languages.SignatureHelpTriggerKind
): SignatureHelpTriggerKind {
    switch (triggerKind) {
        case monaco.languages.SignatureHelpTriggerKind.ContentChange:
            return SignatureHelpTriggerKind.ContentChange;
        case monaco.languages.SignatureHelpTriggerKind.Invoke:
            return SignatureHelpTriggerKind.Invoked;
        case monaco.languages.SignatureHelpTriggerKind.TriggerCharacter:
            return SignatureHelpTriggerKind.TriggerCharacter;
    }
}

export function monacoToLspSignatureHelp(v: monaco.languages.SignatureHelp): SignatureHelp {
    return {
        signatures: v.signatures.map(monacoToLspSignatureInformation),
        activeParameter: v.activeParameter,
        activeSignature: v.activeSignature
    };
}

function monacoToLspSignatureInformation(value: monaco.languages.SignatureInformation): SignatureInformation {
    return {
        label: value.label,
        activeParameter: value.activeParameter,
        documentation: monacoToLspMarkupContent(value.documentation),
        parameters: value.parameters.map(monacoToLspParameterInformation)
    };
}

function monacoToLspParameterInformation(value: monaco.languages.ParameterInformation): ParameterInformation {
    return {
        label: value.label,
        documentation: monacoToLspMarkupContent(value.documentation)
    };
}

function monacoToLspMarkupContent(
    documentation: string | monaco.IMarkdownString | undefined
): string | MarkupContent | undefined {
    if (typeof documentation === 'string' || documentation === undefined) {
        return documentation;
    }
    return {
        kind: 'markdown',
        value: documentation.value
    };
}

export function lspToMonacoSignatureHelp(response: SignatureHelp): monaco.languages.SignatureHelpResult {
    return {
        dispose() {},
        value: {
            signatures: response.signatures.map(lspToMonacoSignatureInformation),
            activeParameter: response.activeParameter ?? 0,
            activeSignature: response.activeSignature ?? 0
        }
    };
}

function lspToMonacoSignatureInformation(v: SignatureInformation): monaco.languages.SignatureInformation {
    return {
        label: v.label,
        parameters: v.parameters?.map(lspToMonacoParameterInformation) ?? [],
        activeParameter: v.activeParameter ?? 0,
        documentation: lspToMonacoMarkdownString(v.documentation)
    };
}

function lspToMonacoParameterInformation(v: ParameterInformation): monaco.languages.ParameterInformation {
    return {
        label: v.label,
        documentation: lspToMonacoMarkdownString(v.documentation)
    };
}

function lspToMonacoMarkdownString(documentation: string | MarkupContent | undefined): string | monaco.IMarkdownString {
    if (documentation === undefined) {
        return '';
    }
    if (typeof documentation === 'string') {
        return documentation;
    }
    return lspToMonacoMarkupContent(documentation)[0];
}
