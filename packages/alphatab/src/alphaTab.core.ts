import '@coderline/alphatab/alphaTab.polyfills';

export { CoreSettings, FontFileFormat } from '@coderline/alphatab/CoreSettings';
export { DisplaySettings, SystemsLayoutMode } from '@coderline/alphatab/DisplaySettings';
export { LayoutMode } from '@coderline/alphatab/LayoutMode';
export { StaveProfile } from '@coderline/alphatab/StaveProfile';
export { ImporterSettings } from '@coderline/alphatab/ImporterSettings';
export { ExporterSettings } from '@coderline/alphatab/ExporterSettings';
export { FingeringMode, NotationMode, NotationSettings, TabRhythmMode, NotationElement } from '@coderline/alphatab/NotationSettings';
export {
    PlayerSettings,
    ScrollMode,
    SlidePlaybackSettings,
    VibratoPlaybackSettings,
    PlayerOutputMode,
    PlayerMode
} from '@coderline/alphatab/PlayerSettings';
export { ProgressEventArgs } from '@coderline/alphatab/ProgressEventArgs';
export { RenderingResources } from '@coderline/alphatab/RenderingResources';
export type {
    SmuflEngravingDefaults,
    SmuflGlyphBoundingBox,
    SmuflGlyphWithAnchor,
    SmuflMetadata,
} from '@coderline/alphatab/SmuflMetadata';
export {
    EngravingSettings,
    EngravingStemInfo
} from '@coderline/alphatab/EngravingSettings';
export { ResizeEventArgs } from '@coderline/alphatab/ResizeEventArgs';
export { Settings } from '@coderline/alphatab/Settings';
export { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
export { FormatError } from '@coderline/alphatab/FormatError';
export { LogLevel } from '@coderline/alphatab/LogLevel';
export { Logger, ConsoleLogger } from '@coderline/alphatab/Logger';
export type { ILogger } from '@coderline/alphatab/Logger';
export { FileLoadError } from '@coderline/alphatab/FileLoadError';
export { Environment, RenderEngineFactory } from '@coderline/alphatab/Environment';
export type { IEventEmitter, IEventEmitterOfT } from '@coderline/alphatab/EventEmitter';

export { AlphaTabApi } from '@coderline/alphatab/platform/javascript/AlphaTabApi';
export { AlphaTabApiBase, type PlaybackHighlightChangeEventArgs } from '@coderline/alphatab/AlphaTabApiBase';
export type { IScrollHandler } from '@coderline/alphatab/ScrollHandlers';
export { WebPlatform } from '@coderline/alphatab/platform/javascript/WebPlatform';

export { VersionInfo as meta } from '@coderline/alphatab/generated/VersionInfo';

// alphaTab2.0: We should reliminate the big bundles but ship individual
// modules which can be imported. e.g. import { Track } from '@coderline/alphatab/model/Track'
// for this generally some reoganization is likely needed to void circular dependencies better
export * as importer from '@coderline/alphatab/importer/_barrel';
export * as io from '@coderline/alphatab/io/_barrel';
export * as exporter from '@coderline/alphatab/exporter/_barrel';
export * as midi from '@coderline/alphatab/midi/_barrel';
export * as model from '@coderline/alphatab/model/_barrel';
export * as rendering from '@coderline/alphatab/rendering/_barrel';
export * as platform from '@coderline/alphatab/platform/_barrel';
export * as synth from '@coderline/alphatab/synth/_barrel';
export * as json from '@coderline/alphatab/generated/_jsonbarrel';
