if (!('WorkerGlobalScope' in self)) {
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            (Element.prototype as any).msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s: string) {
            let el: any = this;
            do {
                if (Element.prototype.matches.call(el, s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    if (window.NodeList && !NodeList.prototype.forEach) {
        (NodeList.prototype as any).forEach = Array.prototype.forEach;
    }
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate: any) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            let o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            let len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            let thisArg = arguments[1];

            // 5. Let k be 0.
            let k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                let kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return undefined.
            return undefined;
        },
        configurable: true,
        writable: true
    });
}

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

import { ScoreImporter } from '@src/importer/ScoreImporter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';

export const importer = {
    ScoreImporter,
    ScoreLoader,
    UnsupportedFormatError
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
import { JsonConverter } from '@src/model/JsonConverter';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
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
    JsonConverter,
    KeySignature,
    KeySignatureType,
    Lyrics,
    MasterBar,
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

export const synth = {
    AlphaSynth,
    PlaybackRange,
    PlayerState,
    PlayerStateChangedEventArgs,
    PositionChangedEventArgs
};
