import { Track } from '@src/model/Track';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaffSystem } from '@src/rendering/staves/StaffSystem';

export class StaffTrackGroup {
    public track: Track;
    public staffSystem: StaffSystem;
    public staves: RenderStaff[] = [];
    public stavesRelevantForBoundsLookup: RenderStaff[] = [];
    public firstStaffInAccolade: RenderStaff | null = null;
    public lastStaffInAccolade: RenderStaff | null = null;

    public constructor(staffSystem: StaffSystem, track: Track) {
        this.staffSystem = staffSystem;
        this.track = track;
    }

    public addStaff(staff: RenderStaff): void {
        this.staves.push(staff);
        if (staff.isRelevantForBoundsLookup) {
            this.stavesRelevantForBoundsLookup.push(staff);
        }
    }
}
