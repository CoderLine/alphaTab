import { CoreSettings } from '@src/CoreSettings';
import { DisplaySettings, LayoutMode, StaveProfile } from '@src/DisplaySettings';
import { ImporterSettings } from '@src/ImporterSettings';
import { FingeringMode, NotationMode, NotationSettings, TabRhythmMode } from '@src/NotationSettings';
import { PlayerSettings, ScrollMode, VibratoPlaybackSettings } from '@src/PlayerSettings';
import { ProgressEventArgs } from '@src/ProgressEventArgs';
import { RenderingResources } from '@src/RenderingResources';
import { ResizeEventArgs } from '@src/ResizeEventArgs';
import { Settings } from '@src/Settings';
import { AlphaTabError } from '@src/AlphaTabError';
import { FormatError } from '@src/FormatError';
import { LogLevel } from '@src/LogLevel';
import { FileLoadError } from '@src/FileLoadError';

import { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';

export {
    AlphaTabApi,
    AlphaTabError,
    FileLoadError,
    CoreSettings,
    StaveProfile,
    LayoutMode,
    DisplaySettings,
    FormatError,
    ImporterSettings,
    TabRhythmMode,
    FingeringMode,
    NotationMode,
    NotationSettings,
    ScrollMode,
    VibratoPlaybackSettings,
    PlayerSettings,
    ProgressEventArgs,
    RenderingResources,
    ResizeEventArgs,
    Settings,
    LogLevel
};

export * as importer from '@src/importer'
export * as midi from '@src/midi'
export * as model from '@src/model'
export * as rendering from '@src/rendering'
export * as synth from '@src/synth'
