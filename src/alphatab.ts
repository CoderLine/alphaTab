import { CoreSettings } from '@src/CoreSettings';
import { DisplaySettings, LayoutMode, StaveProfile } from '@src/DisplaySettings';
import { ImporterSettings } from '@src/ImporterSettings';
import { FingeringMode, NotationMode, NotationSettings, TabRhythmMode } from '@src/NotationSettings';
import { PlayerSettings, ScrollMode, VibratoPlaybackSettings } from '@src/PlayerSettings';
import { ProgressEventArgs } from '@src/ProgressEventArgs';
import { RenderingResources } from '@src/RenderingResources';
import { ResizeEventArgs } from '@src/ResizeEventArgs';
import { Settings } from '@src/Settings';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { FormatError } from '@src/FormatError';
import { LogLevel } from '@src/LogLevel';
import { Logger } from '@src/Logger';
import { FileLoadError } from '@src/FileLoadError';

import { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';

export {
    AlphaTabApi,
    AlphaTabError,
    AlphaTabErrorType,
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
    LogLevel,
    Logger
};

import { VersionInfo } from '@src/generated/VersionInfo';
export const meta = VersionInfo;

import { ScoreImporter } from '@src/importer/ScoreImporter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';

export const importer = {
    ScoreImporter,
    ScoreLoader,
    UnsupportedFormatError
};

import { ScoreExporter } from '@src/exporter/ScoreExporter';
import { Gp7Exporter } from '@src/exporter/Gp7Exporter';

export const exporter = {
    ScoreExporter,
    Gp7Exporter
};

import { BeatTickLookup } from '@src/midi/BeatTickLookup';
import { MasterBarTickLookup } from '@src/midi/MasterBarTickLookup';
import { MidiTickLookup, MidiTickLookupFindBeatResult } from '@src/midi/MidiTickLookup';
import { MidiFile } from '@src/midi/MidiFile';
import { ControllerType } from '@src/midi/ControllerType';
import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { MetaEvent, MetaEventType } from '@src/midi/MetaEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import { Midi20PerNotePitchBendEvent } from '@src/midi/Midi20PerNotePitchBendEvent';
import { SystemCommonEvent, SystemCommonType } from '@src/midi/SystemCommonEvent';
import { SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';

export const midi = {
    BeatTickLookup,
    MasterBarTickLookup,
    MidiTickLookup,
    MidiTickLookupFindBeatResult,
    MidiFile,
    ControllerType,
    MetaDataEvent,
    MetaEvent,
    MetaEventType,
    MetaNumberEvent,
    MidiEvent,
    MidiEventType,
    Midi20PerNotePitchBendEvent,
    SystemCommonEvent,
    SystemCommonType,
    SystemExclusiveEvent,
    MidiFileGenerator,
    AlphaSynthMidiFileHandler
};

import { AccentuationType } from '@src/model/AccentuationType';
import { AccidentalType } from '@src/model/AccidentalType';
import { AutomationType, Automation } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { FermataType, Fermata } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { FontStyle, Font } from '@src/model/Font';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { InstrumentArticulation } from '@src/model/InstrumentArticulation';
import { JsonConverter } from '@src/model/JsonConverter';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { Ottavia } from '@src/model/Ottavia';
import { PickStroke } from '@src/model/PickStroke';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { RenderStylesheet } from '@src/model/RenderStylesheet';
import { RepeatGroup } from '@src/model/RepeatGroup';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { TupletGroup } from '@src/model/TupletGroup';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { WhammyType } from '@src/model/WhammyType';

export const model = {
    AccentuationType,
    AccidentalType,
    AutomationType,
    Automation,
    Bar,
    Beat,
    BendPoint,
    BendStyle,
    BendType,
    BrushType,
    Chord,
    Clef,
    Color,
    CrescendoType,
    Duration,
    DynamicValue,
    FermataType,
    Fermata,
    Fingers,
    FontStyle,
    Font,
    GraceType,
    HarmonicType,
    InstrumentArticulation,
    JsonConverter,
    KeySignature,
    KeySignatureType,
    Lyrics,
    MasterBar,
    MusicFontSymbol,
    Note,
    NoteAccidentalMode,
    Ottavia,
    PickStroke,
    PlaybackInformation,
    RenderStylesheet,
    RepeatGroup,
    Score,
    Section,
    SimileMark,
    SlideInType,
    SlideOutType,
    Staff,
    Track,
    TripletFeel,
    Tuning,
    TupletGroup,
    VibratoType,
    Voice,
    WhammyType
};

import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';

import { BarBounds } from '@src/rendering/utils/BarBounds';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { StaveGroupBounds } from '@src/rendering/utils/StaveGroupBounds';

export const rendering = {
    ScoreRenderer,
    RenderFinishedEventArgs,
    BarBounds,
    BeatBounds,
    Bounds,
    BoundsLookup,
    MasterBarBounds,
    NoteBounds,
    StaveGroupBounds
};

import { AlphaSynth } from '@src/synth/AlphaSynth';
import { PlaybackRange } from '@src/synth/PlaybackRange';
import { PlayerState } from '@src/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@src/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@src/synth/PositionChangedEventArgs';
import { AlphaSynthWebWorkerApi } from '@src/platform/javascript/AlphaSynthWebWorkerApi'

export const synth = {
    AlphaSynth,
    PlaybackRange,
    PlayerState,
    PlayerStateChangedEventArgs,
    PositionChangedEventArgs,
    AlphaSynthWebWorkerApi
};
