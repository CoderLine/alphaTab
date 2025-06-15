import '@src/alphaTab.polyfills';

export { CoreSettings, FontFileFormat } from '@src/CoreSettings';
export { DisplaySettings, SystemsLayoutMode } from '@src/DisplaySettings';
export { LayoutMode } from '@src/LayoutMode';
export { StaveProfile } from '@src/StaveProfile';
export { ImporterSettings } from '@src/ImporterSettings';
export { FingeringMode, NotationMode, NotationSettings, TabRhythmMode, NotationElement } from '@src/NotationSettings';
export {
    PlayerSettings,
    ScrollMode,
    SlidePlaybackSettings,
    VibratoPlaybackSettings,
    PlayerOutputMode,
    PlayerMode
} from '@src/PlayerSettings';
export { ProgressEventArgs } from '@src/ProgressEventArgs';
export { RenderingResources } from '@src/RenderingResources';
export { ResizeEventArgs } from '@src/ResizeEventArgs';
export { Settings } from '@src/Settings';
export { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
export { FormatError } from '@src/FormatError';
export { LogLevel } from '@src/LogLevel';
export { Logger, ConsoleLogger } from '@src/Logger';
export type { ILogger } from '@src/Logger';
export { FileLoadError } from '@src/FileLoadError';
export { Environment, RenderEngineFactory } from '@src/Environment';
export type { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';

export { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';
export { AlphaTabApiBase } from '@src/AlphaTabApiBase';
export { WebPlatform } from '@src/platform/javascript/WebPlatform';

export { VersionInfo as meta } from '@src/generated/VersionInfo';

// alphaTab2.0: We should reliminate the big bundles but ship individual 
// modules which can be imported. e.g. import { Track } from '@coderline/alphatab/model/Track'
// for this generally some reoganization is likely needed to void circular dependencies better
export * as importer from '@src/importer/_barrel';
export * as io from '@src/io/_barrel';
export * as exporter from '@src/exporter/_barrel';
export * as midi from '@src/midi/_barrel';
export * as model from '@src/model/_barrel';
export * as rendering from '@src/rendering/_barrel';
export * as platform from '@src/platform/_barrel';
export * as synth from '@src/synth/_barrel';
export * as json from '@src/generated/_jsonbarrel';
