import { Settings } from '@src/alphatab';
import { ByteBuffer } from '@src/io/ByteBuffer';
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

    /**
     * Exports the given score to a binary buffer. 
     * @param score The score to serialize
     * @param settings  The settings to use during serialization
     * @returns A byte buffer with the serialized score.
     */
    public export(score: Score, settings: Settings | null = null): Uint8Array {
        const writable = ByteBuffer.withCapacity(1024);
        this.init(writable, settings ?? new Settings());
        this.writeScore(score);
        return writable.toArray();
    }

    public abstract get name(): string;

    /**
     * Writes the given score into the data sink.
     * @returns The score to write.
     */
    public abstract writeScore(score: Score): void;
}
