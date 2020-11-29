import { Settings } from '@src/alphatab';
import { IWriteable } from '@src/io/IWriteable';
import { Score } from '@src/model/Score';

/**
 * This is the base class for creating new song exporters which
 * enable writing scores to a binary datasink.
 */
export abstract class ScoreExporter {
    protected data!: IWriteable;
    protected settings!: Settings;

    /**
     * Initializes the importer with the given data and settings.
     */
    public init(data: IWriteable, settings: Settings): void {
        this.data = data;
        this.settings = settings;
    }

    public abstract get name(): string;

    /**
     * Writes the given score into the data sink.
     * @returns The score to write.
     */
    public abstract writeScore(score: Score): void;
}
