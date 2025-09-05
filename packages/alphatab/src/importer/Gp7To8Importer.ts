import { BinaryStylesheet } from '@src/importer/BinaryStylesheet';
import { GpifParser } from '@src/importer/GpifParser';
import { PartConfiguration } from '@src/importer/PartConfiguration';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';

import type { Score } from '@src/model/Score';

import { Logger } from '@src/Logger';

import { ZipReader } from '@src/zip/ZipReader';
import type { ZipEntry } from '@src/zip/ZipEntry';
import { IOHelper } from '@src/io/IOHelper';
import { LayoutConfiguration } from '@src/importer/LayoutConfiguration';

/**
 * This ScoreImporter can read Guitar Pro 7 and 8 (gp) files.
 */
export class Gp7To8Importer extends ScoreImporter {
    public get name(): string {
        return 'Guitar Pro 7-8';
    }

    public readScore(): Score {
        // at first we need to load the binary file system
        // from the GPX container
        Logger.debug(this.name, 'Loading ZIP entries');
        const fileSystem: ZipReader = new ZipReader(this.data);
        let entries: ZipEntry[];
        try {
            entries = fileSystem.read();
        } catch (e) {
            throw new UnsupportedFormatError('No Zip archive', e as Error);
        }

        Logger.debug(this.name, 'Zip entries loaded');
        let xml: string | null = null;
        let binaryStylesheetData: Uint8Array | null = null;
        let partConfigurationData: Uint8Array | null = null;
        let layoutConfigurationData: Uint8Array | null = null;
        const entryLookup = new Map<string, ZipEntry>();
        for (const entry of entries) {
            entryLookup.set(entry.fullName, entry);
            switch (entry.fileName) {
                case 'score.gpif':
                    xml = IOHelper.toString(entry.data, this.settings.importer.encoding);
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
            throw new UnsupportedFormatError('No score.gpif found in zip archive');
        }

        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        Logger.debug(this.name, 'Start Parsing score.gpif');
        const gpifParser: GpifParser = new GpifParser();
        gpifParser.loadAsset = (fileName) => {
            if(entryLookup.has(fileName)) {
                return entryLookup.get(fileName)!.data;
            };
            return undefined;
        };
        gpifParser.parseXml(xml, this.settings);
        Logger.debug(this.name, 'score.gpif parsed');
        const score: Score = gpifParser.score;

        if (binaryStylesheetData) {
            Logger.debug(this.name, 'Start Parsing BinaryStylesheet');
            const stylesheet: BinaryStylesheet = new BinaryStylesheet(binaryStylesheetData);
            stylesheet.apply(score);
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
