import type { TextMateGrammarSupport } from '@coderline/alphatab-monaco/types';
import * as monaco from 'monaco-editor';
import * as oniguruma from 'vscode-oniguruma';
import { INITIAL, parseRawGrammar, Registry, type StateStack } from 'vscode-textmate';

/**
 * Adds TextMate grammar support to Monaco via `vscode-oniguruma` and `vscode-textmate`
 * @param onigurumaWasm The `onig.wasm` file shipped together with vscode-oniguruma.
 */
export function addTextMateGrammarSupport(onigurumaWasm: ArrayBuffer): TextMateGrammarSupport {
    const grammars: TextMateGrammarSupport['grammars'] = {};
    const registry = new Registry({
        onigLib: (async () => {
            await oniguruma.loadWASM(onigurumaWasm);
            return {
                createOnigScanner(patterns: any) {
                    return new oniguruma.OnigScanner(patterns);
                },
                createOnigString(s) {
                    return new oniguruma.OnigString(s);
                }
            };
        })(),
        loadGrammar: async scopeName => {
            if (scopeName in grammars) {
                const grammar = await grammars[scopeName]();
                // activate JSON parsing
                const filePath = grammar.startsWith('{') ? `${scopeName}.tmLanguage.json` : undefined;
                return parseRawGrammar(grammar, filePath);
            }
            return null;
        }
    });

    return {
        registry: registry,
        grammars
    };
}

/**
 * Registers a TextMate grammar in moncao.
 * @param grammarSupport The support object in which to register the grammar.
 * @param languageId The ID of the language
 * @param loadGrammar A promise to load the grammar source code.
 * @param loadLanguageConfiguration A promise to load the monaco language configuration.
 */
export async function registerGrammar(
    grammarSupport: TextMateGrammarSupport,
    languageId: string,
    loadGrammar: () => Promise<string>,
    loadLanguageConfiguration: () => Promise<monaco.languages.LanguageConfiguration>
) {
    const sourceScope = `source.${languageId}`;
    grammarSupport.grammars[sourceScope] = loadGrammar;

    const grammar = (await grammarSupport.registry.loadGrammar(sourceScope))!;
    monaco.languages.register({
        id: languageId
    });

    monaco.languages.setLanguageConfiguration(languageId, await loadLanguageConfiguration());
    monaco.languages.setTokensProvider(languageId, {
        getInitialState() {
            return INITIAL;
        },
        tokenize(line, state) {
            const tokenizerState = state as StateStack;
            const textMateResult = grammar.tokenizeLine(line, tokenizerState, 500);
            if (textMateResult.stoppedEarly) {
                return {
                    endState: state,
                    tokens: textMateResult.tokens.map(t => ({ ...t, scopes: t.scopes.reverse().join(' ') }))
                };
            }

            let endState: StateStack;
            if (state.equals(textMateResult.ruleStack)) {
                endState = tokenizerState;
            } else {
                endState = textMateResult.ruleStack;
            }

            return {
                endState,
                tokens: textMateResult.tokens.map(t => ({ ...t, scopes: t.scopes.reverse().join(' ') }))
            };
        }
    });
}
