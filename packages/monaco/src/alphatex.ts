import { languageConfiguration, textMateGrammar } from '@coderline/alphatab-language-server';
import { registerGrammar } from '@coderline/alphatab-monaco/textmate';
import type { TextMateGrammarSupport } from '@coderline/alphatab-monaco/types';

/**
 * Registers alphaTex as language in the provided grammar support context.
 * @param grammarSupport The context for handling grammar support in Monaco.
 */
export async function registerAlphaTexGrammar(grammarSupport: TextMateGrammarSupport) {
    return registerGrammar(
        grammarSupport,
        'alphatex',
        async () => {
            return JSON.stringify(textMateGrammar);
        },
        async () => languageConfiguration
    );
}