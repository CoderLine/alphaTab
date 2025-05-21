import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { BeatTickLookup } from '@src/midi/BeatTickLookup';
import type { Beat } from '@src/model/Beat';
import type { MasterBar } from '@src/model/MasterBar';

/**
 * Represents a single point in time defining the tempo of a {@link MasterBarTickLookup}.
 * This is typically the initial tempo of a master bar or a tempo change.
 */
export class MasterBarTickLookupTempoChange {
    /**
     * Gets or sets the tick position within the {@link MasterBarTickLookup.start} and  {@link MasterBarTickLookup.end} range.
     */
    public tick: number;

    /**
     * Gets or sets the tempo at the tick position.
     */
    public tempo: number;

    public constructor(tick: number, tempo: number) {
        this.tick = tick;
        this.tempo = tempo;
    }
}

/**
 * Represents the time period, for which all bars of a {@link MasterBar} are played.
 */
export class MasterBarTickLookup {
    /**
     * Gets or sets the start time in midi ticks at which the MasterBar is played.
     */
    public start: number = 0;

    /**
     * Gets or sets the end time in midi ticks at which the MasterBar is played.
     */
    public end: number = 0;

    /**
     * Gets or sets the current tempo when the MasterBar is played.
     * @deprecated use {@link tempoChanges}
     */
    public get tempo(): number {
        return this.tempoChanges[0].tempo;
    }

    /**
     * Gets the list of tempo changes within the tick lookup.
     */
    public readonly tempoChanges: MasterBarTickLookupTempoChange[] = [];

    /**
     * Gets or sets the MasterBar which is played.
     */
    public masterBar!: MasterBar;

    /**
     * The first beat in the bar. 
     */
    public firstBeat: BeatTickLookup | null = null;

    /**
     * The last beat in the bar. 
     */
    public lastBeat: BeatTickLookup | null = null;

    /**
     * Inserts `newNextBeat` after `currentBeat` in the linked list of items and updates.
     * the `firstBeat` and `lastBeat` respectively too.
     * @param currentBeat The item in which to insert the new item afterwards
     * @param newBeat The new item to insert
     */
    private insertAfter(currentBeat: BeatTickLookup | null, newBeat: BeatTickLookup) {
        if (this.firstBeat == null || currentBeat == null || this.lastBeat == null) {
            this.firstBeat = newBeat;
            this.lastBeat = newBeat;
        } else {
            // link new node into sequence
            newBeat.nextBeat = currentBeat.nextBeat;
            newBeat.previousBeat = currentBeat;

            // update this node accordinly
            if (currentBeat.nextBeat) {
                currentBeat.nextBeat.previousBeat = newBeat;
            }
            currentBeat.nextBeat = newBeat;

            if (currentBeat === this.lastBeat) {
                this.lastBeat = newBeat;
            }
        }
    }

    /**
     * Inserts `newNextBeat` before `currentBeat` in the linked list of items and updates.
     * the `firstBeat` and `lastBeat` respectively too.
     * @param currentBeat The item in which to insert the new item afterwards
     * @param newBeat The new item to insert
     */
    private insertBefore(currentBeat: BeatTickLookup | null, newBeat: BeatTickLookup) {
        if (this.firstBeat == null || currentBeat == null || this.lastBeat == null) {
            this.firstBeat = newBeat;
            this.lastBeat = newBeat;
        } else {
            // link new node into sequence
            newBeat.previousBeat = currentBeat.previousBeat;
            newBeat.nextBeat = currentBeat;

            // update this node accordingly
            if (currentBeat.previousBeat) {
                currentBeat.previousBeat.nextBeat = newBeat;
            }
            currentBeat.previousBeat = newBeat;
            if (currentBeat === this.firstBeat) {
                this.firstBeat = newBeat;
            }
        }
    }

    /**
     * Gets or sets the {@link MasterBarTickLookup} of the next masterbar in the {@link Score}
     */
    public nextMasterBar: MasterBarTickLookup | null = null;

    /**
     * Gets or sets the {@link MasterBarTickLookup} of the previous masterbar in the {@link Score}
     */
    public previousMasterBar: MasterBarTickLookup | null = null;

    /**
     * Adds a new beat to this masterbar following the slicing logic required by the MidiTickLookup.
     * @param beat The beat to add to this masterbat
     * @param beatPlaybackStart The original start of this beat. This time is relevant for highlighting.
     * @param sliceStart The slice start to which this beat should be added. This time is relevant for creating new slices.
     * @param sliceDuration The slice duration to which this beat should be added. This time is relevant for creating new slices.
     * @returns The first item of the chain which was affected.
     */
    public addBeat(beat: Beat, beatPlaybackStart: number, sliceStart: number, sliceDuration: number) {
        const end = sliceStart + sliceDuration;

        // We have following scenarios we cover overall on inserts
        // Technically it would be possible to merge some code paths and work with loops
        // to handle all scenarios in a shorter piece of code.
        // but this would make the core a lot harder to understand an less readable
        // and maintainable for the different scenarios.
        // we keep them separate here for that purpose and sacrifice some bytes of code for that.

        // Variant A (initial Insert)
        //              |    New     |
        // Result A
        //              |    New     |

        // Variant B (insert at end, start matches)
        //              |     L1     |    L2     |
        //                                       |   New   |
        // Result B
        //              |     L1     |    L2     |   N1    |

        // Variant C (insert at end, with gap)
        //              |     L1     |    L2     |
        //                                             |   New   |
        // Result C
        //              |     L1     |    L2     |       N1      |

        // Variant D (Starts before, ends exactly):
        //              |     L1     |    L2     |
        //      |  New  |
        // Result D:
        //      |  N1   |     L1     |    L2     |

        // Variant E (Starts before, with gap):
        //              |     L1     |    L2     |
        //    |  New  |
        // Result E:
        //    |  N1     |     L1     |    L2     |

        // Variant F (starts before, overlaps partially):
        //              |     L1     |    L2     |
        //      |      New      |
        // Result F:
        //      |  N1   | N2    | L1 |    L2     |

        // Variant G (starts before, ends the same):
        //              |     L1     |    L2     |
        //      |      New           |
        // Result G:
        //      |  N1   | L1         |    L2     |

        // Variant H (starts before, ends after L1):
        //              |     L1     |    L2     |
        //      |      New                  |
        // Result H:
        //      Step 1 (only slice L1):
        //      |  N1   | L1          |    L2     |
        //      Step 2 (call recursively with start time of 'new' adjusted):
        //                            | New  |
        //      |  N1   | L1          |  N2  | L2 |

        // Variant I (starts in the middle, ends exactly)
        //              |     L1     |    L2     |
        //                    | New  |
        // Result I
        //              | N1  |  L1  |    L2     |

        // Variant J (starts in the middle, ends before)
        //              |     L1     |    L2     |
        //                 | New |
        // Result J
        //              |N1| N2  |L1 |    L2     |

        // Variant K (starts in the middle, ends after L1)
        //              |     L1     |    L2     |
        //                     | New       |
        // Result K
        //      Step 1 (only slice L1):
        //              |  N1  | L1  |    L2     |
        //      Step 2 (call recursively with start time of 'new' adjusted):
        //                           | New  |
        //              |  N1  | L1  |    L2     |

        // Variant L (starts exactly, ends exactly)
        //              |     L1     |    L2     |
        //              |    New     |
        // Result L
        //              |     L1     |    L2     |

        // Variant M (starts exactly, ends before)
        //              |     L1     |    L2     |
        //              |  New |
        // Result M
        //              | N1   | L1  |    L2     |

        // Variant N (starts exactly, ends after L1)
        //              |     L1     |    L2     |
        //              | New              |
        // Result N
        //      Step 1 (only update L1):
        //              |      L1    |    L2     |
        //      Step 2 (call recursively with start time of 'new' adjusted):
        //                           | New |
        //              |     L 1    |    L2     |

        // Variant A
        if (this.firstBeat == null) {
            const n1 = new BeatTickLookup(sliceStart, end);
            n1.highlightBeat(beat, beatPlaybackStart);

            this.insertAfter(this.firstBeat, n1);
        }
        // Variant B
        // Variant C
        else if (sliceStart >= this.lastBeat!.end) {
            // using the end here allows merge of B & C
            const n1 = new BeatTickLookup(this.lastBeat!.end, end);
            n1.highlightBeat(beat, beatPlaybackStart);

            this.insertAfter(this.lastBeat, n1);
        } else {
            let l1: BeatTickLookup | null = null;
            if (sliceStart < this.firstBeat.start) {
                l1 = this.firstBeat!;
            } else {
                let current: BeatTickLookup | null = this.firstBeat;
                while (current != null) {
                    // find item where we fall into
                    if (sliceStart >= current.start && sliceStart < current.end) {
                        l1 = current;
                        break;
                    }
                    current = current.nextBeat;
                }

                if (l1 === null) {
                    // should not be possible
                    throw new AlphaTabError(AlphaTabErrorType.General, 'Error on building lookup, unknown variant');
                }
            }

            // those scenarios should only happen if we insert before the
            // first item (e.g. for grace notes starting < 0)
            if (sliceStart < l1.start) {
                // Variant D
                // Variant E
                if (end === l1.start) {
                    // using firstBeat.start here allows merge of D & E
                    const n1 = new BeatTickLookup(sliceStart, l1.start);
                    n1.highlightBeat(beat, beatPlaybackStart);

                    this.insertBefore(this.firstBeat, n1);
                }
                // Variant F
                else if (end < l1.end) {
                    const n1 = new BeatTickLookup(sliceStart, l1.start);
                    n1.highlightBeat(beat, beatPlaybackStart);
                    this.insertBefore(l1, n1);

                    const n2 = new BeatTickLookup(l1.start, end);
                    for (const b of l1.highlightedBeats) {
                        n2.highlightBeat(b.beat, b.playbackStart);
                    }
                    n2.highlightBeat(beat, beatPlaybackStart);
                    this.insertBefore(l1, n2);

                    l1.start = end;
                }
                // Variant G
                else if (end === l1.end) {
                    const n1 = new BeatTickLookup(sliceStart, l1.start);
                    n1.highlightBeat(beat, beatPlaybackStart);

                    l1.highlightBeat(beat, beatPlaybackStart);

                    this.insertBefore(l1, n1);
                } /* end > this.firstBeat.end */
                // Variant H
                else {
                    const n1 = new BeatTickLookup(sliceStart, l1.start);
                    n1.highlightBeat(beat, beatPlaybackStart);

                    l1.highlightBeat(beat, beatPlaybackStart);

                    this.insertBefore(l1, n1);

                    this.addBeat(beat, beatPlaybackStart, l1.end, end - l1.end);
                }
            } else if (sliceStart > l1.start) {
                // variant I
                if (end === l1.end) {
                    const n1 = new BeatTickLookup(l1.start, sliceStart);
                    for (const b of l1.highlightedBeats) {
                        n1.highlightBeat(b.beat, b.playbackStart);
                    }

                    l1.start = sliceStart;
                    l1.highlightBeat(beat, beatPlaybackStart);

                    this.insertBefore(l1, n1);
                }
                // Variant J
                else if (end < l1.end) {
                    const n1 = new BeatTickLookup(l1.start, sliceStart);
                    this.insertBefore(l1, n1);

                    const n2 = new BeatTickLookup(sliceStart, end);
                    this.insertBefore(l1, n2);

                    for (const b of l1.highlightedBeats) {
                        n1.highlightBeat(b.beat, b.playbackStart);
                        n2.highlightBeat(b.beat, b.playbackStart);
                    }
                    n2.highlightBeat(beat, beatPlaybackStart);

                    l1.start = end;
                } /* end > l1.end */
                // Variant K
                else {
                    const n1 = new BeatTickLookup(l1.start, sliceStart);
                    for (const b of l1.highlightedBeats) {
                        n1.highlightBeat(b.beat, b.playbackStart);
                    }

                    l1.start = sliceStart;
                    l1.highlightBeat(beat, beatPlaybackStart);

                    this.insertBefore(l1, n1);

                    this.addBeat(beat, beatPlaybackStart, l1.end, end - l1.end);
                }
            } /* start == l1.start */ else {
                // Variant L
                if (end === l1.end) {
                    l1.highlightBeat(beat, beatPlaybackStart);
                }
                // Variant M
                else if (end < l1.end) {
                    const n1 = new BeatTickLookup(l1.start, end);
                    for (const b of l1.highlightedBeats) {
                        n1.highlightBeat(b.beat, b.playbackStart);
                    }
                    n1.highlightBeat(beat, beatPlaybackStart);

                    l1.start = end;

                    this.insertBefore(l1, n1);
                } /* end > l1.end */
                // variant N
                else {
                    l1.highlightBeat(beat, beatPlaybackStart);
                    this.addBeat(beat, beatPlaybackStart, l1.end, end - l1.end);
                }
            }
        }
    }
}
