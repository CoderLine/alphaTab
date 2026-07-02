export interface RhythmConfig {
    timeSignatureNumerator: number;
    timeSignatureDenominator: number;
    /** Grid slots inside one beat (quarter). */
    subdivisionsPerBeat: number;
    /** Length = numerator * subdivisionsPerBeat. Values are display weights (4=quarter, 8=eighth, 16=16th, 32=32nd). */
    beatMask: number[];
    /** Slots whose weight exceeds this threshold are not drawn in the overlay. */
    displayWeightThreshold: number;
}

export const RHYTHM_4_4_STRAIGHT: RhythmConfig = {
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    subdivisionsPerBeat: 4,
    beatMask: Array.from({ length: 4 }, () => [4, 16, 8, 16]).flat(),
    displayWeightThreshold: 16
};
