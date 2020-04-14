import { IContainer } from '@src/platform/IContainer';

/**
 * This wrapper holds all cursor related elements.
 */
export class Cursors {
    /**
     * Gets the element that spans across the whole music sheet and holds the other cursor elements.
     */
    public readonly cursorWrapper: IContainer;

    /**
     * Gets the element that is positioned above the bar that is currently played.
     */
    public readonly barCursor: IContainer;

    /**
     * Gets the element that is positioned above the beat that is currently played.
     */
    public readonly beatCursor: IContainer;

    /**
     * Gets the element that spans across the whole music sheet and will hold any selection related elements.
     */
    public readonly selectionWrapper: IContainer;

    /**
     * Initializes a new instance of the {@link Cursors} class.
     * @param cursorWrapper
     * @param barCursor
     * @param beatCursor
     * @param selectionWrapper
     */
    public constructor(
        cursorWrapper: IContainer,
        barCursor: IContainer,
        beatCursor: IContainer,
        selectionWrapper: IContainer
    ) {
        this.cursorWrapper = cursorWrapper;
        this.barCursor = barCursor;
        this.beatCursor = beatCursor;
        this.selectionWrapper = selectionWrapper;
    }
}
