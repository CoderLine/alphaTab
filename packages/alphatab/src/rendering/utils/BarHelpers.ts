import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Voice } from '@coderline/alphatab/model/Voice';
import { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BarCollisionHelper } from '@coderline/alphatab/rendering/utils/BarCollisionHelper';
import type { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class BarHelpers {
    private _renderer: BarRendererBase;
    private _beamHelperLookup = new Map<number, BeamingHelper>();
    public beamHelpers: BeamingHelper[][] = [];
    public collisionHelper: BarCollisionHelper;
    public preferredBeamDirection: BeamDirection | null = null;

    public constructor(renderer: BarRendererBase) {
        this._renderer = renderer;
        this.collisionHelper = new BarCollisionHelper();
    }

    public initialize() {
        const barRenderer = this._renderer;
        const bar = this._renderer.bar;

        let currentBeamHelper: BeamingHelper | null = null;
        let currentGraceBeamHelper: BeamingHelper | null = null;
        for (let i: number = 0, j: number = bar.voices.length; i < j; i++) {
            const v: Voice = bar.voices[i];
            this.beamHelpers.push([]);
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
                    helperForBeat = new BeamingHelper(bar.staff, barRenderer);
                    helperForBeat.preferredBeamDirection = this.preferredBeamDirection;
                    helperForBeat.checkBeat(b);
                    if (b.graceType !== GraceType.None) {
                        currentGraceBeamHelper = helperForBeat;
                    } else {
                        currentBeamHelper = helperForBeat;
                    }
                    this.beamHelpers[v.index].push(helperForBeat);
                }
                this._beamHelperLookup.set(b.id, helperForBeat!);
            }
            if (currentBeamHelper) {
                currentBeamHelper.finish();
            }
            if (currentGraceBeamHelper) {
                currentGraceBeamHelper.finish();
            }
            currentBeamHelper = null;
            currentGraceBeamHelper = null;
        }
    }

    public getBeamingHelperForBeat(beat: Beat): BeamingHelper | undefined {
        return this._beamHelperLookup.has(beat.id) ? this._beamHelperLookup.get(beat.id)! : undefined;
    }
}
