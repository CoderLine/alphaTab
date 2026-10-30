/** @target web */
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { MessagePackObjectReader } from '@coderline/alphatab/io/MessagePackObjectReader';
import { MessagePackObjectWriter } from '@coderline/alphatab/io/MessagePackObjectWriter';
import { Score } from '@coderline/alphatab/model/Score';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * Writes and reads the score sent to the rendering worker: one MessagePack value in a transferable buffer.
 * @target web
 * @internal
 */
export class WorkerScoreEncoding {
    public static encode(score: Score, initialCapacity: number): Uint8Array {
        const writer = new MessagePackObjectWriter(initialCapacity);
        ScoreSerializer.write(score, writer);
        return writer.toUint8Array();
    }

    public static decode(data: Uint8Array, settings: Settings): Score {
        const score = new Score();
        ScoreSerializer.read(score, new MessagePackObjectReader(data));
        score.finish(settings);
        return score;
    }
}
