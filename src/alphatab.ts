export { CoreSettings } from '@src/CoreSettings';
export { DisplaySettings } from '@src/DisplaySettings';
export { LayoutMode } from '@src/LayoutMode';
export { StaveProfile } from '@src/StaveProfile';
export { ImporterSettings } from '@src/ImporterSettings';
export { FingeringMode, NotationMode, NotationSettings, TabRhythmMode } from '@src/NotationSettings';
export { PlayerSettings, ScrollMode, VibratoPlaybackSettings } from '@src/PlayerSettings';
export { ProgressEventArgs } from '@src/ProgressEventArgs';
export { RenderingResources } from '@src/RenderingResources';
export { ResizeEventArgs } from '@src/ResizeEventArgs';
export { Settings } from '@src/Settings';
export { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
export { FormatError } from '@src/FormatError';
export { LogLevel } from '@src/LogLevel';
export { Logger } from '@src/Logger';
export { FileLoadError } from '@src/FileLoadError';

export { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';

export { VersionInfo as meta } from '@src/generated/VersionInfo';

export * as importer from "./importer";
export * as exporter from "./exporter";
export * as midi from "./midi";
export * as model from "./model";
export * as rendering from "./rendering";
export * as synth from "./synth";