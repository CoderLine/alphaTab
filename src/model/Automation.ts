/**
 * This public enumeration lists all types of automations.
 */
export enum AutomationType {
    /**
     * Tempo change.
     */
    Tempo = 0,
    /**
     * Colume change.
     */
    Volume = 1,
    /**
     * Instrument change.
     */
    Instrument = 2,
    /**
     * Balance change.
     */
    Balance = 3,
    /**
     * A sync point for synchronizing the internal time axis with an external audio track.
     */
    SyncPoint = 4
}

/**
 * Represents the data of a sync point for synchronizing the internal time axis with
 * an external audio file.
 * @cloneable
 * @json
 * @json_strict
 */
export class SyncPointData {
    /**
     * Indicates for which repeat occurence this sync point is valid (e.g. 0 on the first time played, 1 on the second time played)
     */
    public barOccurence: number = 0;
    /**
     * The modified tempo at which the cursor should move (aka. the tempo played within the external audio track).
     * This information is used together with the {@link originalTempo} to calculate how much faster/slower the
     * cursor playback is performed to align with the audio track.
     */
    public modifiedTempo: number = 0;
    /**
     * The uadio offset marking the position within the audio track in milliseconds.
     * This information is used to regularly sync (or on seeking) to match a given external audio time axis with the internal time axis.
     */
    public millisecondOffset: number = 0;
}

/**
 * Automations are used to change the behaviour of a song.
 * @cloneable
 * @json
 * @json_strict
 */
export class Automation {
    /**
     * Gets or sets whether the automation is applied linear.
     */
    public isLinear: boolean = false;

    /**
     * Gets or sets the type of the automation.
     */
    public type: AutomationType = AutomationType.Tempo;

    /**
     * Gets or sets the target value of the automation.
     */
    public value: number = 0;

    /**
     * The sync point data in case of {@link AutomationType.SyncPoint}
     */
    public syncPointValue: SyncPointData | undefined;

    /**
     * Gets or sets the relative position of of the automation.
     */
    public ratioPosition: number = 0;

    /**
     * Gets or sets the additional text of the automation.
     */
    public text: string = '';

    public static buildTempoAutomation(
        isLinear: boolean,
        ratioPosition: number,
        value: number,
        reference: number
    ): Automation {
        if (reference < 1 || reference > 5) {
            reference = 2;
        }
        const references: Float32Array = new Float32Array([1, 0.5, 1.0, 1.5, 2.0, 3.0]);
        const automation: Automation = new Automation();
        automation.type = AutomationType.Tempo;
        automation.isLinear = isLinear;
        automation.ratioPosition = ratioPosition;
        automation.value = value * references[reference];
        return automation;
    }

    public static buildInstrumentAutomation(isLinear: boolean, ratioPosition: number, value: number): Automation {
        const automation: Automation = new Automation();
        automation.type = AutomationType.Instrument;
        automation.isLinear = isLinear;
        automation.ratioPosition = ratioPosition;
        automation.value = value;
        return automation;
    }
}
