import { ScoreExporter } from '@src/exporter/ScoreExporter';
import { IOHelper } from '@src/io/IOHelper';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';

/**
 * This ScoreExporter can write alphaTex strings.
 */
export class AlphaTexExporter extends ScoreExporter {
    // used to lookup some default values.
    public get name(): string {
        return 'alphaTex';
    }

    public exportToString(score: Score, settings: Settings | null = null) {
        this.settings = settings ?? new Settings();
        return this.scoreToAlphaTexString(score);
    }

    public writeScore(score: Score) {
        // TODO: create an exporter using the alphaTex AST
        const raw = IOHelper.stringToBytes(this.scoreToAlphaTexString(score));
        this.data.write(raw, 0, raw.length);
    }

    public scoreToAlphaTexString(score: Score): string {
        // const node = this.scoreToAlphaTexAst(score);
        // const writer = new AlphaTexWriter();
        // writer.comments = this.settings.exporter.comments;
        // writer.indentString = this.settings.exporter.indent > 0 ? ' '.repeat(this.settings.exporter.indent) : '';
        // this.writeScoreTo(writer, score);
        // return writer.tex;
        return '';
    }
}
