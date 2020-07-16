import { Track } from '@src/model/Track';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaveGroup } from '@src/rendering/staves/StaveGroup';

export class StaveTrackGroup {
    public track: Track;
    public staveGroup: StaveGroup;
    public staves: RenderStaff[] = [];
    public stavesRelevantForBoundsLookup: RenderStaff[] = [];
    public firstStaffInAccolade: RenderStaff | null = null;
    public lastStaffInAccolade: RenderStaff | null = null;

    public constructor(staveGroup: StaveGroup, track: Track) {
        this.staveGroup = staveGroup;
        this.track = track;
    }

    public addStaff(staff: RenderStaff): void {
        this.staves.push(staff);
        if (staff.isRelevantForBoundsLookup) {
            this.stavesRelevantForBoundsLookup.push(staff);
        }
    }
}
