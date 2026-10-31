/** @target web */
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { SerializerSchema } from '@coderline/alphatab/generated/SerializerSchema';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { MessagePackObjectReader } from '@coderline/alphatab/io/MessagePackObjectReader';
import { MessagePackObjectWriter } from '@coderline/alphatab/io/MessagePackObjectWriter';
import { Score } from '@coderline/alphatab/model/Score';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * Writes and reads the score sent to the rendering worker: one MessagePack array of the
 * {@link SerializerSchema.fingerprint} and the score, in a transferable buffer. Records are keyed by field id, so
 * the main thread and the worker must run the same alphaTab build; data of another build is rejected.
 * @target web
 * @internal
 */
export class WorkerScoreEncoding {
    public static encode(score: Score, initialCapacity: number): Uint8Array {
        const writer = new MessagePackObjectWriter(initialCapacity);
        writer.startArray(2);
        writer.writeNumber(SerializerSchema.fingerprint);
        ScoreSerializer.write(score, writer);
        writer.endArray();
        return writer.toUint8Array();
    }

    public static decode(data: Uint8Array, settings: Settings): Score {
        const score = new Score();
        let index = 0;
        new MessagePackObjectReader(data).readArray(r => {
            if (index === 0) {
                const fingerprint = r.readValue();
                if (fingerprint !== SerializerSchema.fingerprint) {
                    throw WorkerScoreEncoding._otherBuild(`format ${String(fingerprint)}`);
                }
            } else if (index === 1) {
                ScoreSerializer.read(score, r);
            }
            index++;
        });
        if (index !== 2) {
            throw WorkerScoreEncoding._otherBuild('no format');
        }
        score.finish(settings);
        return score;
    }

    private static _otherBuild(found: string): AlphaTabError {
        return new AlphaTabError(
            AlphaTabErrorType.Format,
            `The rendering worker received a score from another alphaTab build (${found}, expected format ${SerializerSchema.fingerprint}). The main thread and the worker script must come from the same alphaTab build.`
        );
    }
}
