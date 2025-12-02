import { Logger } from '@coderline/alphatab/Logger';
import type { Score } from '@coderline/alphatab/model/Score';
import { ZipEntry } from '@coderline/alphatab/zip/ZipEntry';
import { ScoreExporter } from '@coderline/alphatab/exporter/ScoreExporter';
import { GpifWriter } from '@coderline/alphatab/exporter//GpifWriter';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { BinaryStylesheet } from '@coderline/alphatab/importer/BinaryStylesheet';
import { PartConfiguration } from '@coderline/alphatab/importer/PartConfiguration';
import { ZipWriter } from '@coderline/alphatab/zip/ZipWriter';
import { LayoutConfiguration } from '@coderline/alphatab/importer/LayoutConfiguration';
/**
 * This ScoreExporter can write Guitar Pro 7+ (gp) files.
 * @public
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
