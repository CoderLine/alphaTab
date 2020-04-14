/**
 * Lists all midi controllers.
 */
export enum ControllerType {
    /**
     * Bank Select. MSB
     */
    BankSelectCoarse = 0,

    /**
     * Modulation wheel or lever MSB
     */
    ModulationCoarse = 1,

    // BreathControllerCoarse = 0x02,
    // FootControllerCoarse = 0x04,
    // PortamentoTimeCoarse = 0x05,

    /**
     * Data entry MSB
     */
    DataEntryCoarse = 6,

    /**
     * Channel Volume MSB
     */
    VolumeCoarse = 7,

    // BalanceCoarse = 0x08,

    /**
     * Pan MSB
     */
    PanCoarse = 10,

    /**
     * Expression Controller MSB
     */
    ExpressionControllerCoarse = 11,

    // EffectControl1Coarse = 0x0C,
    // EffectControl2Coarse = 0x0D,
    // GeneralPurposeSlider1 = 0x10,
    // GeneralPurposeSlider2 = 0x11,
    // GeneralPurposeSlider3 = 0x12,
    // GeneralPurposeSlider4 = 0x13,
    // BankSelectFine = 0x20,

    /**
     * Modulation wheel or level LSB
     */
    ModulationFine = 33,

    // BreathControllerFine = 0x22,
    // FootControllerFine = 0x24,
    // PortamentoTimeFine = 0x25,

    /**
     * Data Entry LSB
     */
    DataEntryFine = 38,

    /**
     * Channel Volume LSB
     */
    VolumeFine = 39,

    // BalanceFine = 0x28,

    /**
     * Pan LSB
     */
    PanFine = 42,

    /**
     * Expression controller LSB
     */
    ExpressionControllerFine = 43,

    // EffectControl1Fine = 0x2C,
    // EffectControl2Fine = 0x2D,

    /**
     * Damper pedal (sustain)
     */
    HoldPedal = 64,

    // Portamento = 0x41,
    // SostenutoPedal = 0x42,
    // SoftPedal = 0x43,

    /**
     * Legato Footswitch
     */
    LegatoPedal = 68,

    // Hold2Pedal = 0x45,
    // SoundVariation = 0x46,
    // SoundTimbre = 0x47,
    // SoundReleaseTime = 0x48,
    // SoundAttackTime = 0x49,
    // SoundBrightness = 0x4A,
    // SoundControl6 = 0x4B,
    // SoundControl7 = 0x4C,
    // SoundControl8 = 0x4D,
    // SoundControl9 = 0x4E,
    // SoundControl10 = 0x4F,
    // GeneralPurposeButton1 = 0x50,
    // GeneralPurposeButton2 = 0x51,
    // GeneralPurposeButton3 = 0x52,
    // GeneralPurposeButton4 = 0x53,
    // EffectsLevel = 0x5B,
    // TremuloLevel = 0x5C,
    // ChorusLevel = 0x5D,
    // CelesteLevel = 0x5E,
    // PhaseLevel = 0x5F,
    // DataButtonIncrement = 0x60,
    // DataButtonDecrement = 0x61,

    /**
     * Non-Registered Parameter Number LSB
     */
    NonRegisteredParameterFine = 98,

    /**
     * Non-Registered Parameter Number MSB
     */
    NonRegisteredParameterCourse = 99,

    /**
     * Registered Parameter Number LSB
     */
    RegisteredParameterFine = 100,

    /**
     * Registered Parameter Number MSB
     */
    RegisteredParameterCourse = 101,

    // AllSoundOff = 0x78,

    /**
     * Reset all controllers
     */
    ResetControllers = 121,

    // LocalKeyboard = 0x7A,

    /**
     * All notes of.
     */
    AllNotesOff = 123
}
