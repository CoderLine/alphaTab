import { ThrowingReadable, type IReadable } from '@coderline/alphatab/io/IReadable';
import { Score } from '@coderline/alphatab/model/Score';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * This is the base public class for creating new song importers which
 * enable reading scores from any binary datasource
 * @public
 */
export abstract class ScoreImporter {
    protected data!: IReadable;
    protected settings!: Settings;

    /**
     * Initializes the importer with the given data and settings.
     */
    public init(data: IReadable, settings: Settings): void {
        if (data instanceof ThrowingReadable) {
            this.data = data;
        } else {
            this.data = new ThrowingReadable(data);
        }
        this.settings = settings;
        // when beginning reading a new score we reset the IDs.
        Score.resetIds();
    }

    public abstract get name(): string;

    /**
     * Reads the {@link Score} contained in the data.
     * @returns The score that was contained in the data.
     */
    public abstract readScore(): Score;
}
