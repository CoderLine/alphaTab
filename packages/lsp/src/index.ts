import {
    barMetaData,
    beatProperties,
    durationChangeProperties,
    noteProperties,
    scoreMetaData,
    staffMetaData,
    structuralMetaData
} from '@coderline/alphatab-alphatex/definitions';
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
    MetadataTagDefinition,
    ParameterDefinition,
    ParameterValueDefinition,
    PropertyDefinition,
    SignatureDefinition,
    WithDescription,
    WithSignatures
} from '@coderline/alphatab-alphatex/types';

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
    documentation, languageConfiguration, startNodeLanguageServer,
    startWebWorkerLanguageServer, textMateGrammar, type AlphaTexExample,
    type MetadataTagDefinition, type ParameterDefinition, type ParameterValueDefinition, type PropertyDefinition, type SignatureDefinition, type WithDescription, type WithSignatures
};

if (import.meta.main) {
    startNodeLanguageServer();
}
