import { Environment } from '@src/Environment';
import { FileLoadError } from '@src/FileLoadError';

import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { ByteBuffer } from '@src/io/ByteBuffer';

import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';

import { Logger } from '@src/Logger';

declare var VbAjaxLoader: any;

/**
 * The ScoreLoader enables you easy loading of Scores using all
 * available importers
 */
export class ScoreLoader {
    /**
     * Loads a score asynchronously from the given datasource
     * @param path the source path to load the binary file from
     * @param success this function is called if the Score was successfully loaded from the datasource
     * @param error this function is called if any error during the loading occured.
     * @param settings settings for the score import
     * @target web
     */
    // TODO: use promises
    public static loadScoreAsync(
        path: string,
        success: (score: Score) => void,
        error: (error: any) => void,
        settings?: Settings
    ): void {
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', path, true, null, null);
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                let response: unknown = xhr.response;
                if (xhr.status === 200 || (xhr.status === 0 && response)) {
                    try {
                        let buffer: ArrayBuffer = xhr.response;
                        let reader: Uint8Array = new Uint8Array(buffer);
                        let score: Score = ScoreLoader.loadScoreFromBytes(reader, settings);
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
                    error(new FileLoadError('Unknow Error: ' + xhr.responseText, xhr));
                }
            }
        };
        // IE fallback
        if (xhr.responseType !== 'arraybuffer') {
            // use VB Loader to load binary array
            let vbArr: any = VbAjaxLoader('GET', path);
            let fileContents: any = vbArr.toArray();
            // decode byte array to string
            let data: string = '';
            let i: number = 0;
            while (i < fileContents.length - 1) {
                data += (fileContents[i] as number).toString();
                i++;
            }
            let reader: Uint8Array = ScoreLoader.getBytesFromString(data);
            let score: Score = ScoreLoader.loadScoreFromBytes(reader, settings);
            success(score);
        }
        xhr.send();
    }

    private static getBytesFromString(s: string): Uint8Array {
        let b: Uint8Array = new Uint8Array(s.length);
        for (let i: number = 0; i < s.length; i++) {
            b[i] = s.charCodeAt(i);
        }
        return b;
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

        let importers: ScoreImporter[] = Environment.buildImporters();
        Logger.debug(
            'ScoreLoader',
            'Loading score from ' + data.length + ' bytes using ' + importers.length + ' importers',
            null
        );
        let score: Score | null = null;
        let bb: ByteBuffer = ByteBuffer.fromBuffer(data);
        for (let importer of importers) {
            bb.reset();
            try {
                Logger.debug('ScoreLoader', 'Importing using importer ' + importer.name);
                importer.init(bb, settings);
                score = importer.readScore();
                Logger.debug('ScoreLoader', 'Score imported using ' + importer.name);
                break;
            } catch (e) {
                if (e instanceof UnsupportedFormatError) {
                    Logger.debug('ScoreLoader', importer.name + ' does not support the file');
                } else {
                    Logger.error('ScoreLoader', 'Score import failed due to unexpected error: ', e);
                    throw e;
                }
            }
        }
        if (score) {
            return score;
        }
        Logger.error('ScoreLoader', 'No compatible importer found for file');
        throw new UnsupportedFormatError('No compatible importer found for file');
    }
}
