import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Note } from '@coderline/alphatab/model/Note';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import type { NoteNumberGlyph } from '@coderline/alphatab/rendering/glyphs/NoteNumberGlyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';

/**
 * Places the notes of a transposed tab on playable strings, beat by beat while the tab is laid out.
 * A note keeps its string when its shifted fret is playable there. Tied, slid and hammered notes
 * stay on the string of their origin. Other notes take the free string closest to the frets of the beat
 * or the previous beat, or keep their string marked as unplayable.
 * @internal
 */
export class TabFingering {
    private static readonly _maxFret: number = 24;

    // natural harmonic nodes and the semitones they sound above the open string
    private static readonly _nodeValues: number[] = [
        12, 7, 19, 5, 24, 4, 9, 16, 3.2, 2.7, 5.8, 9.6, 14.7, 2.4, 8.2, 17, 21.7
    ];
    private static readonly _nodeIntervals: number[] = [
        12, 19, 19, 24, 24, 28, 28, 28, 31, 34, 34, 34, 34, 36, 36, 36, 36
    ];

    public static isActive(staff: Staff): boolean {
        return staff.transpositionPitch !== 0 && !staff.isPercussion && staff.tuning.length > 0;
    }

    /**
     * Sets the displayed string and fret of the note glyphs of one beat.
     */
    public static assign(renderer: TabBarRenderer, glyphs: NoteNumberGlyph[]): void {
        if (glyphs.length === 0) {
            return;
        }
        const staff = glyphs[0].note.beat.voice.bar.staff;
        if (!TabFingering.isActive(staff)) {
            for (let i = 0; i < glyphs.length; i++) {
                const g = glyphs[i];
                const n = g.note;
                g.setDisplay(n.string, TabFingering._modelFret(n), false, false);
            }
            return;
        }

        let usedStrings = 0;
        // continuations of ties, slides and hammer-ons/pull-offs follow their origin
        for (let i = 0; i < glyphs.length; i++) {
            const g = glyphs[i];
            const n = g.note;
            const origin = TabFingering._origin(n);
            if (origin !== null) {
                let str = renderer.getDisplayString(origin) + n.string - origin.string;
                if (str < 1 || str > staff.tuning.length) {
                    str = n.string;
                }
                TabFingering._place(g, str, n.string);
                usedStrings |= 1 << (str - 1);
            }
        }
        // notes playable on their own string keep it
        for (let i = 0; i < glyphs.length; i++) {
            const g = glyphs[i];
            const n = g.note;
            const bit = 1 << (n.string - 1);
            if (
                g.displayString === 0 &&
                (usedStrings & bit) === 0 &&
                !Number.isNaN(TabFingering._fretOn(n, n.string)) &&
                TabFingering._chainFits(n, 0)
            ) {
                TabFingering._place(g, n.string, n.string);
                usedStrings |= bit;
            }
        }
        // the remaining notes, highest first, take the free string closest to the hand
        while (true) {
            let next: NoteNumberGlyph | null = null;
            for (let i = 0; i < glyphs.length; i++) {
                const g = glyphs[i];
                if (g.displayString === 0 && (next === null || g.note.realValue > next.note.realValue)) {
                    next = g;
                }
            }
            if (next === null) {
                break;
            }
            const n = next.note;
            const hand = TabFingering._handPosition(renderer, glyphs);
            let bestString = n.string;
            let bestCost = Number.POSITIVE_INFINITY;
            for (let str = 1; str <= staff.tuning.length; str++) {
                const fret = TabFingering._fretOn(n, str);
                if (
                    (usedStrings & (1 << (str - 1))) !== 0 ||
                    Number.isNaN(fret) ||
                    !TabFingering._chainFits(n, str - n.string)
                ) {
                    continue;
                }
                const cost = hand > 0 ? Math.abs(fret - hand) : fret;
                if (cost < bestCost) {
                    bestCost = cost;
                    bestString = str;
                }
            }
            if (bestCost === Number.POSITIVE_INFINITY) {
                bestString = TabFingering._unplayableString(n, usedStrings);
            }
            TabFingering._place(next, bestString, n.string);
            usedStrings |= 1 << (bestString - 1);
        }
    }

    /**
     * The string for a note no string can play: its own string if free, otherwise the free string
     * where its fret is closest to the frets of the neck.
     */
    private static _unplayableString(n: Note, usedStrings: number): number {
        if ((usedStrings & (1 << (n.string - 1))) === 0) {
            return n.string;
        }
        const staff = n.beat.voice.bar.staff;
        const maxFret = Math.max(TabFingering._maxFret - staff.capo, n.fret);
        let bestString = n.string;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let str = 1; str <= staff.tuning.length; str++) {
            if ((usedStrings & (1 << (str - 1))) !== 0) {
                continue;
            }
            const fret = TabFingering._unplayableFret(n, str);
            const distance = fret < 0 ? -fret : Math.max(0, fret - maxFret);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestString = str;
            }
        }
        return bestString;
    }

    private static _place(g: NoteNumberGlyph, str: number, modelString: number): void {
        const fret = TabFingering._fretOn(g.note, str);
        if (Number.isNaN(fret)) {
            g.setDisplay(str, TabFingering._unplayableFret(g.note, str), str !== modelString, true);
        } else {
            g.setDisplay(str, fret, str !== modelString, false);
        }
    }

    /**
     * The out-of-range fret shown for a note which cannot be played on the given string.
     */
    private static _unplayableFret(n: Note, str: number): number {
        if (str === n.string || TabFingering._isNaturalHarmonic(n)) {
            return TabFingering._modelFret(n);
        }
        const staff = n.beat.voice.bar.staff;
        return n.realValueWithoutHarmonic - staff.capo - Note.getStringTuning(staff, str);
    }

    /**
     * The model fret shifted by the transposition, shown for untransposed staves and unplayable notes.
     */
    private static _modelFret(n: Note): number {
        const shown = TabFingering._isNaturalHarmonic(n) ? n.harmonicValue : n.fret;
        return shown - n.beat.voice.bar.staff.transpositionPitch;
    }

    private static _isNaturalHarmonic(n: Note): boolean {
        return n.harmonicType === HarmonicType.Natural && !ModelUtils.isAlmostEqualTo(n.harmonicValue, 0);
    }

    /**
     * The fret (natural harmonics: the node) playing the note on the given string, NaN if it cannot be played there.
     */
    private static _fretOn(n: Note, str: number): number {
        const staff = n.beat.voice.bar.staff;
        if (str < 1 || str > staff.tuning.length) {
            return Number.NaN;
        }
        const stringPitch = staff.capo + Note.getStringTuning(staff, str);
        if (TabFingering._isNaturalHarmonic(n)) {
            const interval = n.realValue - stringPitch;
            let node = Number.NaN;
            for (let i = 0; i < TabFingering._nodeIntervals.length; i++) {
                const value = TabFingering._nodeValues[i];
                if (
                    TabFingering._nodeIntervals[i] === interval &&
                    (Number.isNaN(node) || Math.abs(value - n.harmonicValue) < Math.abs(node - n.harmonicValue))
                ) {
                    node = value;
                }
            }
            return node;
        }
        const fret = n.realValueWithoutHarmonic - stringPitch;
        if (n.isDead) {
            return fret;
        }
        const maxFret = Math.max(TabFingering._maxFret - staff.capo, n.fret);
        if (fret < 0 || fret > maxFret || (fret === 0 && TabFingering._needsFrettedString(n))) {
            return Number.NaN;
        }
        if (n.isTrill) {
            const trillFret = n.trillValue - staff.transpositionPitch - stringPitch;
            if (trillFret < 0 || trillFret > maxFret) {
                return Number.NaN;
            }
        }
        return fret;
    }

    private static _needsFrettedString(n: Note): boolean {
        return (
            n.hasBend ||
            n.isContinuedBend ||
            n.vibrato !== VibratoType.None ||
            n.isLeftHandTapped ||
            n.slideInType !== SlideInType.None ||
            n.slideOutType === SlideOutType.Shift ||
            n.slideOutType === SlideOutType.Legato ||
            n.slideOutType === SlideOutType.OutUp ||
            n.slideOutType === SlideOutType.OutDown ||
            n.slideOrigin !== null ||
            // a hammer-on cannot end on an open string, a pull-off can
            (n.hammerPullOrigin !== null && n.hammerPullOrigin.realValue < n.realValue)
        );
    }

    /**
     * The note which this note continues on the same string.
     */
    private static _origin(n: Note): Note | null {
        if (n.isTieDestination && n.tieOrigin !== null) {
            return n.tieOrigin;
        }
        return n.slideOrigin ?? n.hammerPullOrigin;
    }

    /**
     * Whether all notes continuing the given one are playable when moved by the given number of strings.
     */
    private static _chainFits(n: Note, stringDelta: number): boolean {
        const tie = n.tieDestination;
        const slide =
            n.slideOutType === SlideOutType.Shift || n.slideOutType === SlideOutType.Legato ? n.slideTarget : null;
        const hammer = n.isHammerPullOrigin ? n.hammerPullDestination : null;
        return (
            TabFingering._fits(tie, stringDelta) &&
            TabFingering._fits(slide, stringDelta) &&
            TabFingering._fits(hammer, stringDelta)
        );
    }

    private static _fits(n: Note | null, stringDelta: number): boolean {
        return (
            n === null ||
            (!Number.isNaN(TabFingering._fretOn(n, n.string + stringDelta)) && TabFingering._chainFits(n, stringDelta))
        );
    }

    /**
     * The average fret of the notes placed in this beat, or of the previous beat in the voice, 0 if unknown.
     */
    private static _handPosition(renderer: TabBarRenderer, glyphs: NoteNumberGlyph[]): number {
        let sum = 0;
        let count = 0;
        for (let i = 0; i < glyphs.length; i++) {
            const g = glyphs[i];
            if (g.displayString > 0 && !g.note.isDead && g.displayFret > 0) {
                sum += g.displayFret;
                count++;
            }
        }
        const previous = glyphs[0].note.beat.previousBeat;
        if (count === 0 && previous !== null) {
            for (let i = 0; i < previous.notes.length; i++) {
                const p = previous.notes[i];
                const fret = renderer.getDisplayFret(p);
                if (p.isStringed && !p.isDead && fret > 0) {
                    sum += fret;
                    count++;
                }
            }
        }
        return count > 0 ? sum / count : 0;
    }

    /**
     * The first bar whose tab may change when the given bar changes: notes continued in it are
     * placed together with their origin.
     */
    public static firstAffectedBarIndex(tracks: Track[], barIndex: number): number {
        let first = barIndex;
        for (const track of tracks) {
            for (const staff of track.staves) {
                if (!staff.showTablature || !TabFingering.isActive(staff) || barIndex >= staff.bars.length) {
                    continue;
                }
                for (const voice of staff.bars[barIndex].voices) {
                    for (const beat of voice.beats) {
                        for (const note of beat.notes) {
                            let origin = TabFingering._origin(note);
                            while (origin !== null) {
                                first = Math.min(first, origin.beat.voice.bar.index);
                                origin = TabFingering._origin(origin);
                            }
                        }
                    }
                }
            }
        }
        return first;
    }
}
