import type { Track } from '@src/model/Track';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';
import type { StaffSystem, SystemBracket } from '@src/rendering/staves/StaffSystem';

/**
 * Represents the group of rendered staves belonging to an individual track.
 * This includes staves like effects, notation representations (numbered, tabs,..) and multiple
 * staffs (grand staff).
 */
export class StaffTrackGroup {
    public track: Track;
    public staffSystem: StaffSystem;
    public staves: RenderStaff[] = [];
    public stavesRelevantForBoundsLookup: RenderStaff[] = [];
    public firstStaffInBracket: RenderStaff | null = null;
    public lastStaffInBracket: RenderStaff | null = null;
    public bracket: SystemBracket | null = null;

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
