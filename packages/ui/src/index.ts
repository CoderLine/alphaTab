export {
    createUiEnvironment,
    type UiEnvironment,
    type UiEnvironmentOptions,
    UiEnvironmentProvider,
    type UiEnvironmentProviderProps,
    usePlaybackPreferences,
    useSoundFontLibrary,
    useUiEnvironment
} from './environment';

export { encodeWav, exportWav, type WavExportOptions } from './state/audio-export';
export { downloadBytes, downloadMidi, exportAlphaTex, exportGp7, withExtension } from './state/exports';
export {
    bindExternalMedia,
    type ExternalMediaTarget,
    type MediaElementLike,
    type MediaElementLikeEvent
} from './state/external-media';
export { attachFileDrop, type FileDropHandlers } from './state/file-drop';
export { formatMegabytes, formatPercent, formatTime } from './state/format';
export { type AudioPeaks, buildPeaks, decodeAudioPeaks, PEAK_BUCKET, peaksForWidth } from './state/peaks';
export * from './state/playback';
export { formatCapo, formatKey, formatTuning, TRACK_COLORS, trackColor } from './state/score-info';
export {
    applyBaseSettings,
    applyNotoFonts,
    applyThemeColors,
    type BaseSettingsOptions,
    type ScoreFonts,
    type UiTheme
} from './state/settings';
export { registerForSpacebar } from './state/spacebar-playback';
export {
    defaultPlayerView,
    defaultTrackMix,
    initialPlayerStoreState,
    type LayoutModeKey,
    type LoadSourceOptions,
    type LoadTexOptions,
    type LoopRangeBars,
    PlayerStore,
    type PlayerStoreOptions,
    type PlayerStoreState,
    type PlayerViewSettings,
    type StaveProfileKey,
    type TempoMarker,
    type TexDiagnostic,
    type TexDiagnosticSeverity,
    type TexLoadResult,
    type TrackMix
} from './state/store';

export { ExportMenu, type ExportMenuProps } from './player/controls/export-menu';
export { Scrubber, type ScrubberProps } from './player/controls/scrubber';
export { SelectionHandles } from './player/controls/selection-handles';
export { SettingsFlyout, type SettingsFlyoutHandlers, type SettingsFlyoutState } from './player/controls/settings-flyout';
export { SourceSwitch } from './player/controls/source-switch';
export { TrackPanel } from './player/controls/track-panel';
export { Transport } from './player/controls/transport';
export { BackingTrackWaveform } from './player/controls/waveform';
export * from './player/icons';
export {
    PlaybackSettingsPanel,
    PlaybackSourceToggle,
    PlaybackStatusLine,
    SoundFontList
} from './player/playback-settings';
export {
    PlayerHost,
    type PlayerHostProps,
    PlayerProvider,
    type PlayerProviderProps,
    PlayerScore,
    type PlayerScoreProps,
    usePlayerControls,
    usePlayerSelector,
    usePlayerState
} from './player/PlayerProvider';
export { Dialog } from './player/primitives/dialog';
export { FlyoutGroup, FlyoutRow, Slider, Toggle } from './player/primitives/flyout-controls';
export { IconButton } from './player/primitives/icon-button';
export { Menu, MenuItem, MenuLabel } from './player/primitives/menu';
export { Panel } from './player/primitives/panel';
export { ResizeHandle } from './player/primitives/resize-handle';
export { Segmented } from './player/primitives/segmented';
export { NOT_DESKTOP_QUERY, PHONE_QUERY, useMediaQuery } from './player/primitives/use-media-query';
export { FontField, NumberField, Select, Switch, TextField } from './player/settings/controls';
export { QuickSettingRow, SettingsPanel, type SettingsPanelProps } from './player/settings/settings-panel';
export {
    type SchemaSettings,
    type SchemaSettingsOptions,
    useSchemaSettings
} from './player/settings/use-schema-settings';
export { useFileDrop } from './player/use-file-drop';
export { usePersistedState } from './player/use-persisted-state';

export { AlphaTexEditor, type AlphaTexEditorHandle, type AlphaTexEditorProps } from './editor/AlphaTexEditor';
export { describeScore, formatDiagnostic, RenderStatus, type RenderStatusProps } from './editor/render-status';
export { TexEditorPane } from './editor/TexEditorPane';
export {
    type ScoreDocument,
    type ScoreDocumentAdapter,
    type ScoreDocumentState,
    type ScoreLinkTarget,
    type ScoreSample,
    type TrackSelection,
    useScoreDocument
} from './editor/use-score-document';
export { useNearViewport } from './editor/use-near-viewport';
