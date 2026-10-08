import { Logger } from '@coderline/alphatab/Logger';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';

/**
 * @internal
 */
export enum MusicXmlNoteLinkType {
    Tie = 0,
    Slur = 1,
    Slide = 2,
    Glissando = 3,
    /**
     * A trill or vibrato line from the origin to the destination note within the voice.
     * The value is the trill step, -1 for a vibrato line (wavy line without trill mark).
     */
    WavyLine = 4
}

/**
 * @internal
 * @record
 */
export interface MusicXmlNoteLink {
    type: MusicXmlNoteLinkType;
    /**
     * Identifies concurrent links of the same type: the MusicXML number-level, the pitch for ties.
     */
    key: string;
    voice: string;
    value: number;
    origin: Note;
    destination: Note | null;
}

/**
 * Pairs the MusicXML elements linking notes of a part (e.g. `<tied>`, `<slur>`, `<wavy-line>`) and applies them.
 * Links are within a staff, the model resolves the origin of a link before its destination.
 * @internal
 */
export class MusicXmlNoteLinks {
    private _open: MusicXmlNoteLink[] = [];
    private _links: MusicXmlNoteLink[] = [];

    /**
     * @param voice The raw MusicXML voice of the note.
     */
    public start(type: MusicXmlNoteLinkType, key: string, origin: Note, voice: string, value: number) {
        // the same link started again without stop (notes of the same chord can start multiple links)
        for (let i = 0; i < this._open.length; i++) {
            const open = this._open[i];
            if (
                open.type === type &&
                open.key === key &&
                open.voice === voice &&
                open.origin.beat.voice.bar.staff === origin.beat.voice.bar.staff &&
                open.origin.beat !== origin.beat
            ) {
                this._open.splice(i, 1);
                this._unclosed(open);
                break;
            }
        }
        this._open.push({ type: type, key: key, voice: voice, value: value, origin: origin, destination: null });
    }

    /**
     * A continuation (e.g. across system breaks), starts the link if it was not started.
     */
    public continue(type: MusicXmlNoteLinkType, key: string, note: Note, voice: string, value: number) {
        for (const open of this._open) {
            if (
                open.type === type &&
                open.key === key &&
                open.origin.beat.voice.bar.staff === note.beat.voice.bar.staff
            ) {
                return;
            }
        }
        this.start(type, key, note, voice, value);
    }

    public stop(type: MusicXmlNoteLinkType, key: string, destination: Note, voice: string) {
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < this._open.length; i++) {
            const open = this._open[i];
            if (
                open.type !== type ||
                open.key !== key ||
                open.origin.beat.voice.bar.staff !== destination.beat.voice.bar.staff
            ) {
                continue;
            }
            // unisons on different strings
            const score = (open.voice === voice ? 2 : 0) + (open.origin.string === destination.string ? 1 : 0);
            // ties pair in order (e.g. chords), others with the most recent start
            if (score > bestScore || (score === bestScore && type !== MusicXmlNoteLinkType.Tie)) {
                best = i;
                bestScore = score;
            }
        }
        if (best !== -1) {
            const link = this._open[best];
            this._open.splice(best, 1);
            link.destination = destination;
            this._links.push(link);
        }
    }

    /**
     * Adds a link on a single note (e.g. a trill mark without line).
     */
    public single(type: MusicXmlNoteLinkType, note: Note, value: number) {
        this._links.push({ type: type, key: '', voice: '', value: value, origin: note, destination: note });
    }

    public apply() {
        for (const open of this._open) {
            this._unclosed(open);
        }
        this._open = [];

        for (const link of this._links) {
            const origin = link.origin;
            switch (link.type) {
                case MusicXmlNoteLinkType.Tie:
                    const destination = MusicXmlNoteLinks._tieDestination(origin, link.destination);
                    if (destination !== null && MusicXmlNoteLinks._isLinkable(origin, destination!)) {
                        destination!.isTieDestination = true;
                        destination!.tieOrigin = origin;
                    }
                    break;
                case MusicXmlNoteLinkType.Slur:
                    if (MusicXmlNoteLinks._isLinkable(origin, link.destination!)) {
                        MusicXmlNoteLinks._applySlur(origin, link.destination!);
                    }
                    break;
                case MusicXmlNoteLinkType.Slide:
                case MusicXmlNoteLinkType.Glissando:
                    // glissandos are shift slides, wavy lines are not supported
                    if (MusicXmlNoteLinks._isLinkable(origin, link.destination!)) {
                        origin.slideTarget = link.destination!;
                        link.destination!.slideOrigin = origin;
                        origin.slideOutType = SlideOutType.Shift;
                    }
                    break;
                case MusicXmlNoteLinkType.WavyLine:
                    MusicXmlNoteLinks._applyLine(link);
                    break;
            }
        }
        this._links = [];
    }

    private _unclosed(link: MusicXmlNoteLink) {
        switch (link.type) {
            // a tie without end is tied to the next note (resolved when applied, e.g. MuseScore import)
            case MusicXmlNoteLinkType.Tie:
                this._links.push(link);
                break;
            // a line without end covers its start note
            case MusicXmlNoteLinkType.WavyLine:
                link.destination = link.origin;
                this._links.push(link);
                break;
            // other links without end have no meaning
        }
    }

    private static _applySlur(origin: Note, destination: Note) {
        // hammer-ons and pull-offs are drawn with their own slur, exporters write both (e.g. MuseScore)
        if (
            origin.isHammerPullOrigin &&
            destination.string === origin.string &&
            MusicXmlNoteLinks._nextBeat(origin.beat, true) === destination.beat
        ) {
            return;
        }
        destination.isSlurDestination = true;
        origin.slurDestination = destination;
        destination.slurOrigin = origin;
    }

    /**
     * Applies a line to all notes from the origin to the destination within the voice.
     */
    private static _applyLine(link: MusicXmlNoteLink) {
        // a line ending in another voice covers its start note
        const last =
            link.destination!.beat.voice.index === link.origin.beat.voice.index
                ? link.destination!.beat
                : link.origin.beat;
        let beat: Beat | null = link.origin.beat;
        while (beat !== null && beat!.voice.bar.index <= last.voice.bar.index) {
            for (const note of beat!.notes) {
                if (note.isPercussion) {
                    continue;
                }
                if (link.value >= 0) {
                    note.trillValue = note.calculateRealValue(false, false) + link.value;
                } else if (note.vibrato === VibratoType.None) {
                    note.vibrato = VibratoType.Slight;
                }
            }
            beat = beat === last ? null : MusicXmlNoteLinks._nextBeat(beat!, false);
        }
    }

    /**
     * A tie connects a note with the same pitch on the next beat of the voice.
     * Ties without (or with an invalid) end are tied to that note if it exists.
     */
    private static _tieDestination(origin: Note, destination: Note | null): Note | null {
        const next = MusicXmlNoteLinks._nextBeat(origin.beat, origin.beat.graceType === GraceType.None);
        if (destination !== null) {
            // ties across voices are kept as written
            if (destination!.beat.voice.index !== origin.beat.voice.index || destination!.beat === next) {
                return destination;
            }
        }
        if (next === null) {
            return null;
        }

        let candidate: Note | null = null;
        for (const note of next!.notes) {
            if (!note.isTieDestination && note.octave === origin.octave && note.tone === origin.tone) {
                if (note.string === origin.string) {
                    return note;
                }
                if (candidate === null) {
                    candidate = note;
                }
            }
        }
        return candidate;
    }

    /**
     * The next beat in the voice, also across bars.
     */
    private static _nextBeat(beat: Beat, skipGrace: boolean): Beat | null {
        const voice = beat.voice;
        let bar = voice.bar;
        let beats = voice.beats;
        let index = beats.indexOf(beat) + 1;
        while (true) {
            while (index < beats.length) {
                if (!skipGrace || beats[index].graceType === GraceType.None) {
                    return beats[index];
                }
                index++;
            }
            const staff = bar.staff;
            if (bar.index + 1 >= staff.bars.length || voice.index >= staff.bars[bar.index + 1].voices.length) {
                return null;
            }
            bar = staff.bars[bar.index + 1];
            beats = bar.voices[voice.index].beats;
            index = 0;
        }
    }

    /**
     * The model resolves the origin of a link before its destination (bar by bar, voice by voice).
     */
    private static _isLinkable(origin: Note, destination: Note): boolean {
        const originBeat = origin.beat;
        const destinationBeat = destination.beat;
        let isLinkable: boolean;
        if (originBeat.voice.bar.index !== destinationBeat.voice.bar.index) {
            isLinkable = originBeat.voice.bar.index < destinationBeat.voice.bar.index;
        } else if (originBeat.voice.index !== destinationBeat.voice.index) {
            isLinkable = originBeat.voice.index < destinationBeat.voice.index;
        } else {
            const beats = originBeat.voice.beats;
            isLinkable = beats.indexOf(originBeat) < beats.indexOf(destinationBeat);
        }
        if (!isLinkable) {
            Logger.warning('MusicXML', 'Ignoring link to a note before its origin');
        }
        return isLinkable;
    }
}
