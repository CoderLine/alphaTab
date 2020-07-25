import { MasterBar } from '@src/model/MasterBar';

/**
 * This public class can store the information about a group of measures which are repeated
 */
export class RepeatGroup {
    /**
     * All masterbars repeated within this group
     */
    public masterBars: MasterBar[] = [];

    /**
     * a list of masterbars which open the group.
     */
    public openings: MasterBar[] = [];

    /**
     * a list of masterbars which close the group.
     */
    public closings: MasterBar[] = [];

    /**
     * true if the repeat group was opened well
     */
    public isOpened: boolean = false;

    /**
     * true if the repeat group was closed well
     */
    public isClosed: boolean = false;

    public addMasterBar(masterBar: MasterBar): void {
        if (this.openings.length === 0) {
            this.openings.push(masterBar);
        }
        this.masterBars.push(masterBar);
        masterBar.repeatGroup = this;
        if (masterBar.isRepeatEnd) {
            this.closings.push(masterBar);
            this.isClosed = true;
            if (!this.isOpened) {
                this.masterBars[0].isRepeatStart = true;
                this.isOpened = true;
            }
        } else if (this.isClosed) {
            this.isClosed = false;
            this.openings.push(masterBar);
        }
    }
}
