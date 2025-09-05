import { Environment } from '@src/Environment';
import { FileLoadError } from '@src/FileLoadError';

import type { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { ByteBuffer } from '@src/io/ByteBuffer';

import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';

import { Logger } from '@src/Logger';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

/**
 * The ScoreLoader enables you easy loading of Scores using all
 * available importers
 */
export class ScoreLoader {
    /**
     * Loads the given alphaTex string.
     * @param tex The alphaTex string.
     * @param settings The settings to use for parsing.
     * @returns The parsed {@see Score}.
     */
    public static loadAlphaTex(tex: string, settings?: Settings): Score {
        const parser = new AlphaTexImporter();
        parser.logErrors = true;
        parser.initFromString(tex, settings ?? new Settings());
        return parser.readScore();
    }

    /**
     * Loads a score asynchronously from the given datasource
     * @param path the source path to load the binary file from
     * @param success this function is called if the Score was successfully loaded from the datasource
     * @param error this function is called if any error during the loading occured.
     * @param settings settings for the score import
     * @target web
     */
    public static loadScoreAsync(
        path: string,
        success: (score: Score) => void,
        error: (error: any) => void,
        settings?: Settings
    ): void {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', path, true, null, null);
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const response: unknown = xhr.response;
                if (xhr.status === 200 || (xhr.status === 0 && response)) {
                    try {
                        const buffer: ArrayBuffer = xhr.response;
                        const reader: Uint8Array = new Uint8Array(buffer);
                        const score: Score = ScoreLoader.loadScoreFromBytes(reader, settings);
                        success(score);
                    } catch (e) {
                        error(e);
                    }
                } else if (xhr.status === 0) {
                    error(new FileLoadError('You are offline!!\n Please Check Your Network.', xhr));
                } else if (xhr.status === 404) {
                    error(new FileLoadError('Requested URL not found.', xhr));
                } else if (xhr.status === 500) {
                    error(new FileLoadError('Internel Server Error.', xhr));
                } else if (xhr.statusText === 'parsererror') {
                    error(new FileLoadError('Error.\nParsing JSON Request failed.', xhr));
                } else if (xhr.statusText === 'timeout') {
                    error(new FileLoadError('Request Time out.', xhr));
                } else {
                    error(new FileLoadError(`Unknow Error: ${xhr.responseText}`, xhr));
                }
            }
        };
        xhr.send();
    }

    /**
     * Loads the score from the given binary data.
     * @param data The binary data containing a score in any known file format.
     * @param settings The settings to use during importing.
     * @returns The loaded score.
     */
    public static loadScoreFromBytes(data: Uint8Array, settings?: Settings): Score {
        if (!settings) {
            settings = new Settings();
        }

        const importers: ScoreImporter[] = Environment.buildImporters();
        Logger.debug('ScoreLoader', `Loading score from ${data.length} bytes using ${importers.length} importers`);
        let score: Score | null = null;
        const bb: ByteBuffer = ByteBuffer.fromBuffer(data);
        for (const importer of importers) {
            bb.reset();
            try {
                Logger.debug('ScoreLoader', `Importing using importer ${importer.name}`);
                importer.init(bb, settings);
                score = importer.readScore();
                Logger.debug('ScoreLoader', `Score imported using ${importer.name}`);
                break;
            } catch (e) {
                if (e instanceof UnsupportedFormatError) {
                    Logger.debug('ScoreLoader', `${importer.name} does not support the file`);
                } else {
                    Logger.error('ScoreLoader', 'Score import failed due to unexpected error: ', e);
                    throw e;
                }
            }
        }
        if (score) {
            return score;
        }
        throw new UnsupportedFormatError('No compatible importer found for file');
    }
}
