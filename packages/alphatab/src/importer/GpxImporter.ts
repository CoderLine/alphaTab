import { BinaryStylesheet } from '@coderline/alphatab/importer/BinaryStylesheet';
import { GpifParser } from '@coderline/alphatab/importer/GpifParser';
import { GpxFileSystem } from '@coderline/alphatab/importer/GpxFileSystem';
import { PartConfiguration } from '@coderline/alphatab/importer/PartConfiguration';
import { ScoreImporter } from '@coderline/alphatab/importer/ScoreImporter';
import type { Score } from '@coderline/alphatab/model/Score';
import { Logger } from '@coderline/alphatab/Logger';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { LayoutConfiguration } from '@coderline/alphatab/importer/LayoutConfiguration';

/**
 * This ScoreImporter can read Guitar Pro 6 (gpx) files.
 * @internal
 */
export class GpxImporter extends ScoreImporter {
    public get name(): string {
        return 'Guitar Pro 6';
    }

    public readScore(): Score {
        // at first we need to load the binary file system
        // from the GPX container
        Logger.debug(this.name, 'Loading GPX filesystem');
        const fileSystem: GpxFileSystem = new GpxFileSystem();
        fileSystem.fileFilter = s => {
            return (
                s.endsWith('score.gpif') ||
                s.endsWith('BinaryStylesheet') ||
                s.endsWith('PartConfiguration') ||
                s.endsWith('LayoutConfiguration')
            );
        };
        fileSystem.load(this.data);
        Logger.debug(this.name, 'GPX filesystem loaded');

        let xml: string | null = null;
        let binaryStylesheetData: Uint8Array | null = null;
        let partConfigurationData: Uint8Array | null = null;
        let layoutConfigurationData: Uint8Array | null = null;
        for (const entry of fileSystem.files) {
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
                case 'LayoutConfiguration':
                    layoutConfigurationData = entry.data;
                    break;
            }
        }

        if (!xml) {
            throw new UnsupportedFormatError('No score.gpif found in GPX');
        }

        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        Logger.debug(this.name, 'Start Parsing score.gpif');
        const gpifParser: GpifParser = new GpifParser();
        gpifParser.parseXml(xml, this.settings);
        Logger.debug(this.name, 'score.gpif parsed');
        const score: Score = gpifParser.score;

        if (binaryStylesheetData) {
            Logger.debug(this.name, 'Start Parsing BinaryStylesheet');
            const binaryStylesheet: BinaryStylesheet = new BinaryStylesheet(binaryStylesheetData);
            binaryStylesheet.apply(score);
            Logger.debug(this.name, 'BinaryStylesheet parsed');
        }

        let partConfigurationParser: PartConfiguration | null = null;
        if (partConfigurationData) {
            Logger.debug(this.name, 'Start Parsing Part Configuration');
            partConfigurationParser = new PartConfiguration(partConfigurationData);
            partConfigurationParser.apply(score);
            Logger.debug(this.name, 'Part Configuration parsed');
        }

        if (layoutConfigurationData && partConfigurationParser != null) {
            Logger.debug(this.name, 'Start Parsing Layout Configuration');
            const layoutConfigurationParser: LayoutConfiguration = new LayoutConfiguration(
                partConfigurationParser,
                layoutConfigurationData
            );
            layoutConfigurationParser.apply(score);
            Logger.debug(this.name, 'Layout Configuration parsed');
        }

        return score;
    }
}
