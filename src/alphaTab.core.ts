export { CoreSettings } from '@src/CoreSettings';
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
    PlayerOutputMode
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

export * as importer from './importer';
export * as io from './io';
export * as exporter from './exporter';
export * as midi from './midi';
export * as model from './model';
export * as rendering from './rendering';
export * as platform from './platform';
export * as synth from './synth';
export * as json from './generated/json';
