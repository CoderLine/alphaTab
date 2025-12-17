import type { Track } from '@coderline/alphatab/model/Track';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import type { StaffSystem, SystemBracket } from '@coderline/alphatab/rendering/staves/StaffSystem';

/**
 * Represents the group of rendered staves belonging to an individual track.
 * This includes staves like effects, notation representations (numbered, tabs,..) and multiple
 * staffs (grand staff).
 * @internal
 */
export class StaffTrackGroup {
    public track: Track;
    public staffSystem: StaffSystem;
    public staves: RenderStaff[] = [];
    public firstVisibleStaff?: RenderStaff;
    public lastVisibleStaff?: RenderStaff;
    public bracket: SystemBracket | null = null;

    public constructor(staffSystem: StaffSystem, track: Track) {
        this.staffSystem = staffSystem;
        this.track = track;
    }

    public addStaff(staff: RenderStaff): void {
        this.staves.push(staff);
    }
}
