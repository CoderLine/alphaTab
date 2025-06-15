import { Logger } from '@src/Logger';
import type { Score } from '@src/model/Score';
import { ZipEntry } from '@src/zip/ZipEntry';
import { ScoreExporter } from '@src/exporter/ScoreExporter';
import { GpifWriter } from '@src/exporter//GpifWriter';
import { IOHelper } from '@src/io/IOHelper';
import { BinaryStylesheet } from '@src/importer/BinaryStylesheet';
import { PartConfiguration } from '@src/importer/PartConfiguration';
import { ZipWriter } from '@src/zip/ZipWriter';
import { LayoutConfiguration } from '@src/importer/LayoutConfiguration';
/**
 * This ScoreExporter can write Guitar Pro 7+ (gp) files.
 */
export class Gp7Exporter extends ScoreExporter {
    public get name(): string {
        return 'Guitar Pro 7-8';
    }

    public writeScore(score: Score): void {
        Logger.debug(this.name, 'Writing data entries');
        const gpifWriter: GpifWriter = new GpifWriter();
        const gpifXml = gpifWriter.writeXml(score);
        const binaryStylesheet = BinaryStylesheet.writeForScore(score);
        const partConfiguration = PartConfiguration.writeForScore(score);
        const layoutConfiguration = LayoutConfiguration.writeForScore(score);

        Logger.debug(this.name, 'Writing ZIP entries');
        const fileSystem: ZipWriter = new ZipWriter(this.data);
        fileSystem.writeEntry(new ZipEntry('VERSION', IOHelper.stringToBytes('7.0')));
        fileSystem.writeEntry(new ZipEntry('Content/', new Uint8Array(0)));
        fileSystem.writeEntry(new ZipEntry('Content/BinaryStylesheet', binaryStylesheet));
        fileSystem.writeEntry(new ZipEntry('Content/PartConfiguration', partConfiguration));
        fileSystem.writeEntry(new ZipEntry('Content/LayoutConfiguration', layoutConfiguration));
        fileSystem.writeEntry(new ZipEntry('Content/score.gpif', IOHelper.stringToBytes(gpifXml)));

        if(gpifWriter.backingTrackAssetFileName) {
            fileSystem.writeEntry(new ZipEntry(gpifWriter.backingTrackAssetFileName!, score.backingTrack!.rawAudioFile!));
        }

        fileSystem.end();
    }
}
