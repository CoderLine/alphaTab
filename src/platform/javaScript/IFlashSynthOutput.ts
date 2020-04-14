// NOTE: we prefix all ISynthOutput methods with "AlphaSynth" to ensure
// the ExternalInterface callbacks are called (play, stop etc. might control. the main movie)
export interface IFlashSynthOutput {
    alphaSynthSequencerFinished(): void;
    alphaSynthPlay(): void;
    alphaSynthPause(): void;
    alphaSynthResetSamples(): void;
    alphaSynthAddSamples(base64Samples: string): void;
}
