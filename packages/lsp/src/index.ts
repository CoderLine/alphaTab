import {
    barMetaData,
    beatProperties,
    durationChangeProperties,
    noteProperties,
    scoreMetaData,
    staffMetaData,
    structuralMetaData
} from '@coderline/alphatab-language-server/documentation/documentation';
import { startNodeLanguageServer, startWebWorkerLanguageServer } from '@coderline/alphatab-language-server/server';

const documentation = {
    structuralMetaData,
    scoreMetaData,
    staffMetaData,
    barMetaData,
    durationChangeProperties,
    beatProperties,
    noteProperties
};

import type {
    AlphaTexExample,
    CommonDoc,
    MetadataDoc,
    PropertyDoc,
    ValueDoc,
    ValueItemDoc,
    WithDescription
} from '@coderline/alphatab-language-server/documentation/types';

import textMateGrammarJson from './alphatex.tmLanguage.json';
import languageConfigurationJson from './language-configuration.json';

// export jsons as untyped objects for further use

/**
 * The TextMate grammar definition as JSON encoded.
 * Write this to a local json (e.g. alphatex.tmLanguage.json ) or pass it to any supported parser for further use.
 */
const textMateGrammar: any = textMateGrammarJson;
/**
 * The contents of a language-configuration.json to use in editors like VSCode.
 */
const languageConfiguration: any = languageConfigurationJson;

export {
    startNodeLanguageServer,
    startWebWorkerLanguageServer,
    documentation,
    textMateGrammar,
    languageConfiguration,
    type WithDescription,
    type CommonDoc,
    type ValueItemDoc,
    type ValueDoc,
    type PropertyDoc,
    type AlphaTexExample as Example,
    type MetadataDoc
};

if (import.meta.main) {
    startNodeLanguageServer();
}
