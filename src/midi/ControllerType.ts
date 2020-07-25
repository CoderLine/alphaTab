/**
 * Lists all midi controllers.
 */
export enum ControllerType {
    /**
     * Bank Select. MSB
     */
    BankSelectCoarse = 0x00,

    /**
     * Modulation wheel or lever MSB
     */
    ModulationCoarse = 0x01,

    //BreathControllerCoarse = 0x02,
    //FootControllerCoarse = 0x04,
    //PortamentoTimeCoarse = 0x05,
    /**
     * Data entry MSB
     */
    DataEntryCoarse = 0x06,

    /**
     * Channel Volume MSB
     */
    VolumeCoarse = 0x07,

    //BalanceCoarse = 0x08,
    /**
     * Pan MSB
     */
    PanCoarse = 0x0A,

    /**
     * Expression Controller MSB
     */
    ExpressionControllerCoarse = 0x0B,

    //EffectControl1Coarse = 0x0C,
    //EffectControl2Coarse = 0x0D,
    //GeneralPurposeSlider1 = 0x10,
    //GeneralPurposeSlider2 = 0x11,
    //GeneralPurposeSlider3 = 0x12,
    //GeneralPurposeSlider4 = 0x13,
    //BankSelectFine = 0x20,
    /**
     * Modulation wheel or level LSB
     */
    ModulationFine = 0x21,

    //BreathControllerFine = 0x22,
    //FootControllerFine = 0x24,
    //PortamentoTimeFine = 0x25,
    /**
     * Data Entry LSB
     */
    DataEntryFine = 0x26,

    /**
     * Channel Volume LSB
     */
    VolumeFine = 0x27,

    //BalanceFine = 0x28,
    /**
     * Pan LSB
     */
    PanFine = 0x2A,

    /**
     * Expression controller LSB
     */
    ExpressionControllerFine = 0x2B,

    //EffectControl1Fine = 0x2C,
    //EffectControl2Fine = 0x2D,
    /**
     * Damper pedal (sustain)
     */
    HoldPedal = 0x40,

    //Portamento = 0x41,
    //SostenutoPedal = 0x42,
    //SoftPedal = 0x43,
    /**
     * Legato Footswitch
     */
    LegatoPedal = 0x44,

    //Hold2Pedal = 0x45,
    //SoundVariation = 0x46,
    //SoundTimbre = 0x47,
    //SoundReleaseTime = 0x48,
    //SoundAttackTime = 0x49,
    //SoundBrightness = 0x4A,
    //SoundControl6 = 0x4B,
    //SoundControl7 = 0x4C,
    //SoundControl8 = 0x4D,
    //SoundControl9 = 0x4E,
    //SoundControl10 = 0x4F,
    //GeneralPurposeButton1 = 0x50,
    //GeneralPurposeButton2 = 0x51,
    //GeneralPurposeButton3 = 0x52,
    //GeneralPurposeButton4 = 0x53,
    //EffectsLevel = 0x5B,
    //TremuloLevel = 0x5C,
    //ChorusLevel = 0x5D,
    //CelesteLevel = 0x5E,
    //PhaseLevel = 0x5F,
    //DataButtonIncrement = 0x60,
    //DataButtonDecrement = 0x61,
    /**
     * Non-Registered Parameter Number LSB
     */
    NonRegisteredParameterFine = 0x62,

    /**
     * Non-Registered Parameter Number MSB
     */
    NonRegisteredParameterCourse = 0x63,

    /**
     * Registered Parameter Number LSB
     */
    RegisteredParameterFine = 0x64,

    /**
     * Registered Parameter Number MSB
     */
    RegisteredParameterCourse = 0x65,

    //AllSoundOff = 0x78,
    /**
     * Reset all controllers
     */
    ResetControllers = 0x79,

    //LocalKeyboard = 0x7A,
    /**
     * All notes of.
     */
    AllNotesOff = 0x7B

    //OmniModeOff = 0x7C,
    //OmniModeOn = 0x7D,
    //MonoMode = 0x7E,
    //PolyMode = 0x7F
}
