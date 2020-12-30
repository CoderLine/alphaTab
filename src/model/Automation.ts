/**
 * This public enumeration lists all types of automations.
 */
export enum AutomationType {
    /**
     * Tempo change.
     */
    Tempo,
    /**
     * Colume change.
     */
    Volume,
    /**
     * Instrument change.
     */
    Instrument,
    /**
     * Balance change.
     */
    Balance
}

/**
 * Automations are used to change the behaviour of a song.
 * @cloneable
 * @json
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
        let references: Float32Array = new Float32Array([1, 0.5, 1.0, 1.5, 2.0, 3.0]);
        let automation: Automation = new Automation();
        automation.type = AutomationType.Tempo;
        automation.isLinear = isLinear;
        automation.ratioPosition = ratioPosition;
        automation.value = value * references[reference];
        return automation;
    }


    public static buildInstrumentAutomation(
        isLinear: boolean,
        ratioPosition: number,
        value: number
    ): Automation {
        let automation: Automation = new Automation();
        automation.type = AutomationType.Instrument;
        automation.isLinear = isLinear;
        automation.ratioPosition = ratioPosition;
        automation.value = value;
        return automation;
    }
}
