import { BinaryStylesheet } from '@src/importer/BinaryStylesheet';
import { GpifParser } from '@src/importer/GpifParser';
import { GpxFileSystem } from '@src/importer/GpxFileSystem';
import { PartConfiguration } from '@src/importer/PartConfiguration';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { Score } from '@src/model/Score';
import { Logger } from '@src/Logger';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { IOHelper } from '@src/io/IOHelper';

/**
 * This ScoreImporter can read Guitar Pro 6 (gpx) files.
 */
export class GpxImporter extends ScoreImporter {
    public get name(): string {
        return 'Guitar Pro 6';
    }

    public constructor() {
        super();
    }

    public readScore(): Score {
        // at first we need to load the binary file system
        // from the GPX container
        Logger.debug(this.name, 'Loading GPX filesystem');
        let fileSystem: GpxFileSystem = new GpxFileSystem();
        fileSystem.fileFilter = s => {
            return s.endsWith('score.gpif') || s.endsWith('BinaryStylesheet') || s.endsWith('PartConfiguration');
        };
        fileSystem.load(this.data);
        Logger.debug(this.name, 'GPX filesystem loaded');

        let xml: string | null = null;
        let binaryStylesheetData: Uint8Array | null = null;
        let partConfigurationData: Uint8Array | null = null;
        for (let entry of fileSystem.files) {
            switch (entry.fileName) {
                case 'score.gpif':
                    xml = IOHelper.toString(entry.data!, this.settings.importer.encoding);
                    break;
                case 'BinaryStylesheet':
                    binaryStylesheetData = entry.data;
                    break;
                case 'PartConfiguration':
                    partConfigurationData = entry.data;
                    break;
            }
        }

        if (!xml) {
            throw new UnsupportedFormatError('No score.gpif found in GPX');
        }

        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        Logger.debug(this.name, 'Start Parsing score.gpif');
        let gpifParser: GpifParser = new GpifParser();
        gpifParser.parseXml(xml, this.settings);
        Logger.debug(this.name, 'score.gpif parsed');
        let score: Score = gpifParser.score;

        if (binaryStylesheetData) {
            Logger.debug(this.name, 'Start Parsing BinaryStylesheet');
            let binaryStylesheet: BinaryStylesheet = new BinaryStylesheet(binaryStylesheetData);
            binaryStylesheet.apply(score);
            Logger.debug(this.name, 'BinaryStylesheet parsed');
        }

        if (partConfigurationData) {
            Logger.debug(this.name, 'Start Parsing Part Configuration');
            let partConfiguration: PartConfiguration = new PartConfiguration(partConfigurationData);
            partConfiguration.apply(score);
            Logger.debug(this.name, 'Part Configuration parsed');
        }

        return score;
    }
}
