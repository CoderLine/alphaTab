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
     * the masterbars which opens the group.
     */
    public opening!: MasterBar;

    /**
     * a list of masterbars which open the group.
     * @deprecated There can only be one opening, use the opening property instead
     */
    public get openings(): MasterBar[] {
        return [this.opening] ;
    }

    /**
     * a list of masterbars which close the group.
     */
    public closings: MasterBar[] = [];

    /**
     * always true
     * @deprecated Groups are always opened unless fully empty (which should never be the case)
     */
    public get isOpened() { return true }

    /**
     * true if the repeat group was closed well
     */
    public isClosed: boolean = false;

    public addMasterBar(masterBar: MasterBar): void {
        if (this.opening == null) {
            this.opening = masterBar;
        }
        this.masterBars.push(masterBar);
        masterBar.repeatGroup = this;
        if (masterBar.isRepeatEnd) {
            this.closings.push(masterBar);
            this.isClosed = true;
        }
    }
}
