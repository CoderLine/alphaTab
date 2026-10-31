import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Voice } from '@coderline/alphatab/model/Voice';
import { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarCollisionHelper } from '@coderline/alphatab/rendering/utils/BarCollisionHelper';
import type { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { Duration } from '@coderline/alphatab/model/Duration';
import { BeamingRules, type MasterBar } from '@coderline/alphatab/model/MasterBar';
import { BeamingRuleLookup } from '@coderline/alphatab/rendering/utils/BeamingRuleLookup';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';

/**
 * @internal
 */
export class BarHelpers {
    private static readonly _noHelpers: BeamingHelper[][] = [];
    private _renderer: BarRendererBase;
    /**
     * The beaming helper per voice index and beat index.
     */
    private _beamHelperLookup: BeamingHelper[][] = BarHelpers._noHelpers;
    public beamHelpers: BeamingHelper[][] = BarHelpers._noHelpers;
    public collisionHelper: BarCollisionHelper;
    public preferredBeamDirection: BeamDirection | null = null;

    public constructor(renderer: BarRendererBase) {
        this._renderer = renderer;
        this.collisionHelper = new BarCollisionHelper();
    }

    public initialize() {
        const barRenderer = this._renderer;
        const bar = this._renderer.bar;
        if (!barRenderer.drawsRhythm) {
            this._beamHelperLookup = BarHelpers._noHelpers;
            this.beamHelpers = BarHelpers._noHelpers;
            return;
        }

        const masterBar = bar.masterBar;
        const beamingRules = masterBar.actualBeamingRules ?? BarHelpers._findOrBuildDefaultBeamingRules(masterBar);
        const rule = beamingRules.findRule(bar.shortestDuration);
        const ruleDuration = rule[0];

        const beamingRuleLookups = this._renderer.scoreRenderer.layout!.beamingRuleLookups;
        let lookupsByDuration = beamingRuleLookups.has(beamingRules.uniqueId)
            ? beamingRuleLookups.get(beamingRules.uniqueId)!
            : undefined;
        if (!lookupsByDuration) {
            lookupsByDuration = new Map<Duration, BeamingRuleLookup>();
            beamingRuleLookups.set(beamingRules.uniqueId, lookupsByDuration);
        }
        let beamingRuleLookup = lookupsByDuration.has(ruleDuration) ? lookupsByDuration.get(ruleDuration)! : undefined;
        if (!beamingRuleLookup) {
            beamingRuleLookup = BeamingRuleLookup.build(masterBar, ruleDuration, rule[1]);
            lookupsByDuration.set(ruleDuration, beamingRuleLookup);
        }

        let currentBeamHelper: BeamingHelper | null = null;
        let currentGraceBeamHelper: BeamingHelper | null = null;
        const beamHelperLookup = new Array<BeamingHelper[]>(bar.voices.length);
        this._beamHelperLookup = beamHelperLookup;
        const beamHelpers = new Array<BeamingHelper[]>(bar.voices.length);
        for (let i: number = 0, j: number = bar.voices.length; i < j; i++) {
            const v: Voice = bar.voices[i];
            let voiceHelpers: BeamingHelper[] | null = null;
            const helperByBeat = new Array<BeamingHelper>(v.beats.length);
            beamHelperLookup[i] = helperByBeat;
            for (let k: number = 0, l: number = v.beats.length; k < l; k++) {
                const b: Beat = v.beats[k];
                let helperForBeat: BeamingHelper | null;
                if (b.graceType !== GraceType.None) {
                    helperForBeat = currentGraceBeamHelper;
                } else {
                    helperForBeat = currentBeamHelper;
                    if (currentGraceBeamHelper) {
                        currentGraceBeamHelper.finish();
                    }
                    currentGraceBeamHelper = null;
                }
                // if a new beaming helper was started, we close our tuplet grouping as well
                // try to fit beam to current beamhelper
                if (!helperForBeat || !helperForBeat.checkBeat(b)) {
                    if (helperForBeat) {
                        helperForBeat.finish();
                    }
                    // if not possible, create the next beaming helper
                    helperForBeat = new BeamingHelper(bar.staff, barRenderer, beamingRuleLookup);
                    helperForBeat.preferredBeamDirection = this.preferredBeamDirection;
                    helperForBeat.checkBeat(b);
                    if (b.graceType !== GraceType.None) {
                        currentGraceBeamHelper = helperForBeat;
                    } else {
                        currentBeamHelper = helperForBeat;
                    }
                    if (voiceHelpers) {
                        voiceHelpers.push(helperForBeat);
                    } else {
                        voiceHelpers = [helperForBeat];
                    }
                }
                helperByBeat[k] = helperForBeat!;
            }
            if (currentBeamHelper) {
                currentBeamHelper.finish();
            }
            if (currentGraceBeamHelper) {
                currentGraceBeamHelper.finish();
            }
            currentBeamHelper = null;
            currentGraceBeamHelper = null;
            beamHelpers[i] = voiceHelpers ? voiceHelpers : [];
        }
        this.beamHelpers = beamHelpers;
    }

    private static _defaultBeamingRules: Map<string, BeamingRules> | undefined;
    private static _findOrBuildDefaultBeamingRules(masterBar: MasterBar): BeamingRules {
        let defaultBeamingRules = BarHelpers._defaultBeamingRules;
        if (!defaultBeamingRules) {
            defaultBeamingRules = new Map<string, BeamingRules>(
                [
                    BeamingRules.createSimple(2, 16, Duration.Sixteenth, [1, 1]),
                    BeamingRules.createSimple(1, 8, Duration.Eighth, [1]),
                    BeamingRules.createSimple(1, 4, Duration.Quarter, [1]),

                    BeamingRules.createSimple(3, 16, Duration.Sixteenth, [3]),

                    BeamingRules.createSimple(4, 16, Duration.Sixteenth, [2, 2]),
                    BeamingRules.createSimple(2, 8, Duration.Eighth, [1, 1]),

                    BeamingRules.createSimple(5, 16, Duration.Sixteenth, [3, 2]),

                    BeamingRules.createSimple(6, 16, Duration.Sixteenth, [3, 3]),
                    BeamingRules.createSimple(3, 8, Duration.Eighth, [3]),

                    BeamingRules.createSimple(4, 8, Duration.Eighth, [2, 2]),
                    BeamingRules.createSimple(2, 4, Duration.Quarter, [1, 1]),

                    BeamingRules.createSimple(9, 16, Duration.Sixteenth, [3, 3, 3]),

                    BeamingRules.createSimple(5, 8, Duration.Eighth, [3, 2]),

                    BeamingRules.createSimple(12, 16, Duration.Sixteenth, [3, 3, 3, 3]),
                    BeamingRules.createSimple(6, 8, Duration.Eighth, [3, 3, 3]),
                    BeamingRules.createSimple(3, 4, Duration.Quarter, [1, 1, 1]),

                    BeamingRules.createSimple(7, 8, Duration.Eighth, [4, 3]),

                    BeamingRules.createSimple(8, 8, Duration.Eighth, [3, 3, 2]),
                    BeamingRules.createSimple(4, 4, Duration.Quarter, [1, 1, 1, 1]),

                    BeamingRules.createSimple(9, 8, Duration.Eighth, [3, 3, 3]),

                    BeamingRules.createSimple(10, 8, Duration.Eighth, [4, 3, 3]),
                    BeamingRules.createSimple(5, 4, Duration.Quarter, [1, 1, 1, 1, 1]),

                    BeamingRules.createSimple(12, 8, Duration.Eighth, [3, 3, 3, 3]),
                    BeamingRules.createSimple(6, 4, Duration.Quarter, [1, 1, 1, 1, 1, 1]),

                    BeamingRules.createSimple(15, 8, Duration.Eighth, [3, 3, 3, 3, 3, 3]),

                    BeamingRules.createSimple(8, 4, Duration.Quarter, [1, 1, 1, 1, 1, 1, 1, 1]),
                    BeamingRules.createSimple(18, 8, Duration.Eighth, [3, 3, 3, 3, 3, 3])
                ].map(r => [`${r.timeSignatureNumerator}_${r.timeSignatureDenominator}`, r] as [string, BeamingRules])
            );

            BarHelpers._defaultBeamingRules = defaultBeamingRules;
        }

        const key = `${masterBar.timeSignatureNumerator}_${masterBar.timeSignatureDenominator}`;
        if (defaultBeamingRules.has(key)) {
            return defaultBeamingRules.get(key)!;
        }

        // NOTE: this is the old alphaTab logic how we used to beamed bars.
        // we either group in quarters, or in 3x8ths depending on the key signature

        let divisionLength: number = MidiUtils.QuarterTime;
        switch (masterBar.timeSignatureDenominator) {
            case 8:
                if (masterBar.timeSignatureNumerator % 3 === 0) {
                    divisionLength += (MidiUtils.QuarterTime / 2) | 0;
                }
                break;
        }

        const numberOfDivisions = Math.ceil(masterBar.calculateDuration(false) / divisionLength);
        const notesPerDivision = (divisionLength / MidiUtils.QuarterTime) * 2;

        const fallback = new BeamingRules();
        const groups: number[] = [];

        for (let i = 0; i < numberOfDivisions; i++) {
            groups.push(notesPerDivision);
        }

        fallback.groups.set(Duration.Eighth, groups);
        fallback.timeSignatureNumerator = masterBar.timeSignatureNumerator;
        fallback.timeSignatureDenominator = masterBar.timeSignatureDenominator;
        fallback.finish();
        defaultBeamingRules.set(key, fallback);
        return fallback;
    }

    public getBeamingHelperForBeat(beat: Beat): BeamingHelper | undefined {
        const voice = beat.voice;
        const lookup = this._beamHelperLookup;
        if (voice.bar !== this._renderer.bar || voice.index >= lookup.length) {
            return undefined;
        }
        const helperByBeat = lookup[voice.index];
        return beat.index < helperByBeat.length ? helperByBeat[beat.index] : undefined;
    }
}
