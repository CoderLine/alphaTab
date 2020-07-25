import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { GraceType } from '@src/model/GraceType';
import { Voice } from '@src/model/Voice';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';

export class BarHelpers {
    public beamHelpers: BeamingHelper[][] = [];
    public beamHelperLookup: Map<number, BeamingHelper>[] = [];

    public constructor(bar: Bar) {
        let currentBeamHelper: BeamingHelper | null = null;
        let currentGraceBeamHelper: BeamingHelper | null = null;
        if (bar) {
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
                    if (!b.isRest) {
                        // try to fit beam to current beamhelper
                        if (!helperForBeat || !helperForBeat.checkBeat(b)) {
                            if (helperForBeat) {
                                helperForBeat.finish();
                            }
                            // if not possible, create the next beaming helper
                            helperForBeat = new BeamingHelper(bar.staff);
                            helperForBeat.checkBeat(b);
                            if (b.graceType !== GraceType.None) {
                                currentGraceBeamHelper = helperForBeat;
                            } else {
                                currentBeamHelper = helperForBeat;
                            }
                            this.beamHelpers[v.index].push(helperForBeat);
                        }
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
    }

    public getBeamingHelperForBeat(beat: Beat): BeamingHelper {
        return this.beamHelperLookup[beat.voice.index].get(beat.index)!;
    }
}
