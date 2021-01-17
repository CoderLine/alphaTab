import { Beat } from '@src/model/Beat';
import { GraceType } from '@src/model/GraceType';
import { Voice } from '@src/model/Voice';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { BarRendererBase } from '../BarRendererBase';
import { BarCollisionHelper } from './BarCollisionHelper';

export class BarHelpers {
    private _renderer: BarRendererBase;
    public beamHelpers: BeamingHelper[][] = [];
    public beamHelperLookup: Map<number, BeamingHelper>[] = [];
    public collisionHelper: BarCollisionHelper;

    public constructor(renderer: BarRendererBase) {
        this._renderer = renderer;
        this.collisionHelper = new BarCollisionHelper();
    }

    public initialize() {
        var barRenderer = this._renderer;
        var bar = this._renderer.bar;

        let currentBeamHelper: BeamingHelper | null = null;
        let currentGraceBeamHelper: BeamingHelper | null = null;
        for (let i: number = 0, j: number = bar.voices.length; i < j; i++) {
            let v: Voice = bar.voices[i];
            this.beamHelpers.push([]);
            this.beamHelperLookup.push(new Map<number, BeamingHelper>());
            for (let k: number = 0, l: number = v.beats.length; k < l; k++) {
                let b: Beat = v.beats[k];
                let helperForBeat: BeamingHelper | null;
                if (b.graceType !== GraceType.None) {
                    helperForBeat = currentGraceBeamHelper;
                } else {
                    helperForBeat = currentBeamHelper;
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
                    helperForBeat.checkBeat(b);
                    if (b.graceType !== GraceType.None) {
                        currentGraceBeamHelper = helperForBeat;
                    } else {
                        currentBeamHelper = helperForBeat;
                    }
                    this.beamHelpers[v.index].push(helperForBeat);
                }
                this.beamHelperLookup[v.index].set(b.index, helperForBeat!);
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

    public getBeamingHelperForBeat(beat: Beat): BeamingHelper {
        return this.beamHelperLookup[beat.voice.index].get(beat.index)!;
    }
}
