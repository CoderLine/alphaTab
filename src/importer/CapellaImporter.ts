import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';

import { Score } from '@src/model/Score';

import { Logger } from '@src/Logger';

import { ZipReader } from '@src/zip/ZipReader';
import { ZipEntry } from "@src/zip/ZipEntry";
import { IOHelper } from '@src/io/IOHelper';
import { CapellaParser } from './CapellaParser';

/**
 * This ScoreImporter can read Capella (cap/capx) files.
 */
export class CapellaImporter extends ScoreImporter {
    public get name(): string {
        return 'Capella';
    }

    public constructor() {
        super();
    }

    public readScore(): Score {
        Logger.debug(this.name, 'Loading ZIP entries');
        let fileSystem: ZipReader = new ZipReader(this.data);
        let entries: ZipEntry[];
        let xml: string | null = null;
        entries = fileSystem.read();

        Logger.debug(this.name, 'Zip entries loaded');
        if (entries.length > 0) {
            for (let entry of entries) {
                switch (entry.fileName) {
                    case 'score.xml':
                        xml = IOHelper.toString(entry.data, this.settings.importer.encoding);
                        break;
                }
            }
        } else {
            this.data.reset();
            xml = IOHelper.toString(this.data.readAll(), this.settings.importer.encoding);
        }

        if (!xml) {
            throw new UnsupportedFormatError('No valid capella file');
        }

        Logger.debug(this.name, 'Start Parsing score.xml');
        try {
            let capellaParser: CapellaParser = new CapellaParser();
            capellaParser.parseXml(xml, this.settings);
            Logger.debug(this.name, 'score.xml parsed');
            let score: Score = capellaParser.score;
            return score;
        } catch (e) {
            throw new UnsupportedFormatError('Failed to parse CapXML', e);
        }
    }
}
