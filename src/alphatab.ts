import { CoreSettings } from '@src/CoreSettings';

import { DisplaySettings, LayoutMode, StaveProfile } from '@src/DisplaySettings';

import { Environment } from '@src/Environment';
import { ScoreLoader } from '@src/importer/ScoreLoader';

import { ImporterSettings } from '@src/ImporterSettings';

import { FingeringMode, NotationMode, NotationSettings, TabRhythmMode } from '@src/NotationSettings';

import { AlphaTabApi } from '@src/platform/javaScript/AlphaTabApi';

import { PlayerSettings, ScrollMode, VibratoPlaybackSettings } from '@src/PlayerSettings';

import { ProgressEventArgs } from '@src/ProgressEventArgs';
import { RenderingResources } from '@src/RenderingResources';
import { ResizeEventArgs } from '@src/ResizeEventArgs';
import { SelectionInfo } from '@src/SelectionInfo';
import { Settings } from '@src/Settings';

export {
    CoreSettings,
    DisplaySettings,
    Environment,
    FingeringMode,
    ImporterSettings,
    LayoutMode,
    NotationMode,
    NotationSettings,
    PlayerSettings,
    ProgressEventArgs,
    RenderingResources,
    ResizeEventArgs,
    ScrollMode,
    SelectionInfo,
    Settings,
    StaveProfile,
    TabRhythmMode,
    VibratoPlaybackSettings
};

export const importer = {
    ScoreLoader
};

export const platform = {
    javaScript: {
        AlphaTabApi
    }
};
