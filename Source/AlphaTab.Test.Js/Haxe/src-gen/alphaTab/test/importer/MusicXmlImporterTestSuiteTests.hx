package alphaTab.test.importer;

using system.HaxeExtensions;
@:testClass
@:testIgnore
class MusicXmlImporterTestSuiteTests extends alphaTab.test.importer.MusicXmlImporterTestBase
{
    @:testMethod
    public function Test_01a_Pitches_Pitches() : Void 
    {
        TestReference("Test_01a_Pitches_Pitches", "page");
    }

    @:testMethod
    public function Test_01b_Pitches_Intervals() : Void 
    {
        TestReference("Test_01b_Pitches_Intervals", "horizontal");
    }

    @:testMethod
    public function Test_01c_Pitches_NoVoiceElement() : Void 
    {
        TestReference("Test_01c_Pitches_NoVoiceElement", "page");
    }

    @:testMethod
    public function Test_01d_Pitches_Microtones() : Void 
    {
        TestReference("Test_01d_Pitches_Microtones", "page");
    }

    @:testMethod
    public function Test_01e_Pitches_ParenthesizedAccidentals() : Void 
    {
        TestReference("Test_01e_Pitches_ParenthesizedAccidentals", "page");
    }

    @:testMethod
    public function Test_01f_Pitches_ParenthesizedMicrotoneAccidentals() : Void 
    {
        TestReference("Test_01f_Pitches_ParenthesizedMicrotoneAccidentals", "page");
    }

    @:testMethod
    public function Test_02a_Rests_Durations() : Void 
    {
        TestReference("Test_02a_Rests_Durations", "page");
    }

    @:testMethod
    public function Test_02b_Rests_PitchedRests() : Void 
    {
        TestReference("Test_02b_Rests_PitchedRests", "page");
    }

    @:testMethod
    public function Test_02c_Rests_MultiMeasureRests() : Void 
    {
        TestReference("Test_02c_Rests_MultiMeasureRests", "page");
    }

    @:testMethod
    public function Test_02d_Rests_Multimeasure_TimeSignatures() : Void 
    {
        TestReference("Test_02d_Rests_Multimeasure_TimeSignatures", "page");
    }

    @:testMethod
    public function Test_02e_Rests_NoType() : Void 
    {
        TestReference("Test_02e_Rests_NoType", "page");
    }

    @:testMethod
    public function Test_03a_Rhythm_Durations() : Void 
    {
        TestReference("Test_03a_Rhythm_Durations", "page");
    }

    @:testMethod
    public function Test_03b_Rhythm_Backup() : Void 
    {
        TestReference("Test_03b_Rhythm_Backup", "page");
    }

    @:testMethod
    public function Test_03c_Rhythm_DivisionChange() : Void 
    {
        TestReference("Test_03c_Rhythm_DivisionChange", "page");
    }

    @:testMethod
    public function Test_03d_Rhythm_DottedDurations_Factors() : Void 
    {
        TestReference("Test_03d_Rhythm_DottedDurations_Factors", "page");
    }

    @:testMethod
    public function Test_11a_TimeSignatures() : Void 
    {
        var score : alphaTab.model.Score = TestReference("Test_11a_TimeSignatures", "page");
        alphaTab.test.Assert.IsTrue(score.MasterBars.get_Item(0).TimeSignatureCommon);
        alphaTab.test.Assert.IsTrue(score.MasterBars.get_Item(1).TimeSignatureCommon);
    }

    @:testMethod
    public function Test_11b_TimeSignatures_NoTime() : Void 
    {
        TestReference("Test_11b_TimeSignatures_NoTime", "page");
    }

    @:testMethod
    public function Test_11c_TimeSignatures_CompoundSimple() : Void 
    {
        TestReference("Test_11c_TimeSignatures_CompoundSimple", "page");
    }

    @:testMethod
    public function Test_11d_TimeSignatures_CompoundMultiple() : Void 
    {
        TestReference("Test_11d_TimeSignatures_CompoundMultiple", "page");
    }

    @:testMethod
    public function Test_11e_TimeSignatures_CompoundMixed() : Void 
    {
        TestReference("Test_11e_TimeSignatures_CompoundMixed", "page");
    }

    @:testMethod
    public function Test_11f_TimeSignatures_SymbolMeaning() : Void 
    {
        TestReference("Test_11f_TimeSignatures_SymbolMeaning", "page");
    }

    @:testMethod
    public function Test_11g_TimeSignatures_SingleNumber() : Void 
    {
        TestReference("Test_11g_TimeSignatures_SingleNumber", "page");
    }

    @:testMethod
    public function Test_11h_TimeSignatures_SenzaMisura() : Void 
    {
        TestReference("Test_11h_TimeSignatures_SenzaMisura", "page");
    }

    @:testMethod
    public function Test_12a_Clefs() : Void 
    {
        TestReference("Test_12a_Clefs", "page");
    }

    @:testMethod
    public function Test_12b_Clefs_NoKeyOrClef() : Void 
    {
        TestReference("Test_12b_Clefs_NoKeyOrClef", "page");
    }

    @:testMethod
    public function Test_13a_KeySignatures() : Void 
    {
        TestReference("Test_13a_KeySignatures", "page");
    }

    @:testMethod
    public function Test_13b_KeySignatures_ChurchModes() : Void 
    {
        TestReference("Test_13b_KeySignatures_ChurchModes", "page");
    }

    @:testMethod
    public function Test_13c_KeySignatures_NonTraditional() : Void 
    {
        TestReference("Test_13c_KeySignatures_NonTraditional", "page");
    }

    @:testMethod
    public function Test_13d_KeySignatures_Microtones() : Void 
    {
        TestReference("Test_13d_KeySignatures_Microtones", "page");
    }

    @:testMethod
    public function Test_14a_StaffDetails_LineChanges() : Void 
    {
        TestReference("Test_14a_StaffDetails_LineChanges", "page");
    }

    @:testMethod
    public function Test_21a_Chord_Basic() : Void 
    {
        TestReference("Test_21a_Chord_Basic", "page");
    }

    @:testMethod
    public function Test_21b_Chords_TwoNotes() : Void 
    {
        TestReference("Test_21b_Chords_TwoNotes", "page");
    }

    @:testMethod
    public function Test_21c_Chords_ThreeNotesDuration() : Void 
    {
        TestReference("Test_21c_Chords_ThreeNotesDuration", "page");
    }

    @:testMethod
    public function Test_21d_Chords_SchubertStabatMater() : Void 
    {
        TestReference("Test_21d_Chords_SchubertStabatMater", "page");
    }

    @:testMethod
    public function Test_21e_Chords_PickupMeasures() : Void 
    {
        TestReference("Test_21e_Chords_PickupMeasures", "page");
    }

    @:testMethod
    public function Test_21f_Chord_ElementInBetween() : Void 
    {
        TestReference("Test_21f_Chord_ElementInBetween", "page");
    }

    @:testMethod
    public function Test_22a_Noteheads() : Void 
    {
        TestReference("Test_22a_Noteheads", "page");
    }

    @:testMethod
    public function Test_22b_Staff_Notestyles() : Void 
    {
        TestReference("Test_22b_Staff_Notestyles", "page");
    }

    @:testMethod
    public function Test_22c_Noteheads_Chords() : Void 
    {
        TestReference("Test_22c_Noteheads_Chords", "page");
    }

    @:testMethod
    public function Test_22d_Parenthesized_Noteheads() : Void 
    {
        TestReference("Test_22d_Parenthesized_Noteheads", "page");
    }

    @:testMethod
    public function Test_23a_Tuplets() : Void 
    {
        TestReference("Test_23a_Tuplets", "page");
    }

    @:testMethod
    public function Test_23b_Tuplets_Styles() : Void 
    {
        TestReference("Test_23b_Tuplets_Styles", "page");
    }

    @:testMethod
    public function Test_23c_Tuplet_Display_NonStandard() : Void 
    {
        TestReference("Test_23c_Tuplet_Display_NonStandard", "page");
    }

    @:testMethod
    public function Test_23d_Tuplets_Nested() : Void 
    {
        TestReference("Test_23d_Tuplets_Nested", "page");
    }

    @:testMethod
    public function Test_23e_Tuplets_Tremolo() : Void 
    {
        TestReference("Test_23e_Tuplets_Tremolo", "page");
    }

    @:testMethod
    public function Test_23f_Tuplets_DurationButNoBracket() : Void 
    {
        TestReference("Test_23f_Tuplets_DurationButNoBracket", "page");
    }

    @:testMethod
    public function Test_24a_GraceNotes() : Void 
    {
        TestReference("Test_24a_GraceNotes", "page");
    }

    @:testMethod
    public function Test_24b_ChordAsGraceNote() : Void 
    {
        TestReference("Test_24b_ChordAsGraceNote", "page");
    }

    @:testMethod
    public function Test_24c_GraceNote_MeasureEnd() : Void 
    {
        TestReference("Test_24c_GraceNote_MeasureEnd", "page");
    }

    @:testMethod
    public function Test_24d_AfterGrace() : Void 
    {
        TestReference("Test_24d_AfterGrace", "page");
    }

    @:testMethod
    public function Test_24e_GraceNote_StaffChange() : Void 
    {
        TestReference("Test_24e_GraceNote_StaffChange", "page");
    }

    @:testMethod
    public function Test_24f_GraceNote_Slur() : Void 
    {
        TestReference("Test_24f_GraceNote_Slur", "page");
    }

    @:testMethod
    public function Test_31a_Directions() : Void 
    {
        TestReference("Test_31a_Directions", "page");
    }

    @:testMethod
    public function Test_31c_MetronomeMarks() : Void 
    {
        TestReference("Test_31c_MetronomeMarks", "page");
    }

    @:testMethod
    public function Test_32a_Notations() : Void 
    {
        TestReference("Test_32a_Notations", "page");
    }

    @:testMethod
    public function Test_32b_Articulations_Texts() : Void 
    {
        TestReference("Test_32b_Articulations_Texts", "page");
    }

    @:testMethod
    public function Test_32c_MultipleNotationChildren() : Void 
    {
        TestReference("Test_32c_MultipleNotationChildren", "page");
    }

    @:testMethod
    public function Test_32d_Arpeggio() : Void 
    {
        TestReference("Test_32d_Arpeggio", "page");
    }

    @:testMethod
    public function Test_33a_Spanners() : Void 
    {
        TestReference("Test_33a_Spanners", "page");
    }

    @:testMethod
    public function Test_33b_Spanners_Tie() : Void 
    {
        TestReference("Test_33b_Spanners_Tie", "page");
    }

    @:testMethod
    public function Test_33c_Spanners_Slurs() : Void 
    {
        TestReference("Test_33c_Spanners_Slurs", "page");
    }

    @:testMethod
    public function Test_33d_Spanners_OctaveShifts() : Void 
    {
        TestReference("Test_33d_Spanners_OctaveShifts", "page");
    }

    @:testMethod
    public function Test_33e_Spanners_OctaveShifts_InvalidSize() : Void 
    {
        TestReference("Test_33e_Spanners_OctaveShifts_InvalidSize", "page");
    }

    @:testMethod
    public function Test_33f_Trill_EndingOnGraceNote() : Void 
    {
        TestReference("Test_33f_Trill_EndingOnGraceNote", "page");
    }

    @:testMethod
    public function Test_33g_Slur_ChordedNotes() : Void 
    {
        TestReference("Test_33g_Slur_ChordedNotes", "page");
    }

    @:testMethod
    public function Test_33h_Spanners_Glissando() : Void 
    {
        TestReference("Test_33h_Spanners_Glissando", "page");
    }

    @:testMethod
    public function Test_33i_Ties_NotEnded() : Void 
    {
        TestReference("Test_33i_Ties_NotEnded", "page");
    }

    @:testMethod
    public function Test_41a_MultiParts_Partorder() : Void 
    {
        TestReference("Test_41a_MultiParts_Partorder", "page");
    }

    @:testMethod
    public function Test_41b_MultiParts_MoreThan10() : Void 
    {
        TestReference("Test_41b_MultiParts_MoreThan10", "page");
    }

    @:testMethod
    public function Test_41c_StaffGroups() : Void 
    {
        TestReference("Test_41c_StaffGroups", "page");
    }

    @:testMethod
    public function Test_41d_StaffGroups_Nested() : Void 
    {
        TestReference("Test_41d_StaffGroups_Nested", "page");
    }

    @:testMethod
    public function Test_41e_StaffGroups_InstrumentNames_Linebroken() : Void 
    {
        TestReference("Test_41e_StaffGroups_InstrumentNames_Linebroken", "page");
    }

    @:testMethod
    public function Test_41f_StaffGroups_Overlapping() : Void 
    {
        TestReference("Test_41f_StaffGroups_Overlapping", "page");
    }

    @:testMethod
    public function Test_41g_PartNoId() : Void 
    {
        TestReference("Test_41g_PartNoId", "page");
    }

    @:testMethod
    public function Test_41h_TooManyParts() : Void 
    {
        TestReference("Test_41h_TooManyParts", "page");
    }

    @:testMethod
    public function Test_41i_PartNameDisplay_Override() : Void 
    {
        TestReference("Test_41i_PartNameDisplay_Override", "page");
    }

    @:testMethod
    public function Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics() : Void 
    {
        TestReference("Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics", "page");
    }

    @:testMethod
    public function Test_42b_MultiVoice_MidMeasureClefChange() : Void 
    {
        TestReference("Test_42b_MultiVoice_MidMeasureClefChange", "page");
    }

    @:testMethod
    public function Test_43a_PianoStaff() : Void 
    {
        TestReference("Test_43a_PianoStaff", "page");
    }

    @:testMethod
    public function Test_43b_MultiStaff_DifferentKeys() : Void 
    {
        TestReference("Test_43b_MultiStaff_DifferentKeys", "page");
    }

    @:testMethod
    public function Test_43c_MultiStaff_DifferentKeysAfterBackup() : Void 
    {
        TestReference("Test_43c_MultiStaff_DifferentKeysAfterBackup", "page");
    }

    @:testMethod
    public function Test_43d_MultiStaff_StaffChange() : Void 
    {
        TestReference("Test_43d_MultiStaff_StaffChange", "page");
    }

    @:testMethod
    public function Test_43e_Multistaff_ClefDynamics() : Void 
    {
        TestReference("Test_43e_Multistaff_ClefDynamics", "page");
    }

    @:testMethod
    public function Test_45a_SimpleRepeat() : Void 
    {
        TestReference("Test_45a_SimpleRepeat", "page");
    }

    @:testMethod
    public function Test_45b_RepeatWithAlternatives() : Void 
    {
        TestReference("Test_45b_RepeatWithAlternatives", "page");
    }

    @:testMethod
    public function Test_45c_RepeatMultipleTimes() : Void 
    {
        TestReference("Test_45c_RepeatMultipleTimes", "page");
    }

    @:testMethod
    public function Test_45d_Repeats_Nested_Alternatives() : Void 
    {
        TestReference("Test_45d_Repeats_Nested_Alternatives", "page");
    }

    @:testMethod
    public function Test_45e_Repeats_Nested_Alternatives() : Void 
    {
        TestReference("Test_45e_Repeats_Nested_Alternatives", "page");
    }

    @:testMethod
    public function Test_45f_Repeats_InvalidEndings() : Void 
    {
        TestReference("Test_45f_Repeats_InvalidEndings", "page");
    }

    @:testMethod
    public function Test_45g_Repeats_NotEnded() : Void 
    {
        TestReference("Test_45g_Repeats_NotEnded", "page");
    }

    @:testMethod
    public function Test_46a_Barlines() : Void 
    {
        TestReference("Test_46a_Barlines", "page");
    }

    @:testMethod
    public function Test_46b_MidmeasureBarline() : Void 
    {
        TestReference("Test_46b_MidmeasureBarline", "page");
    }

    @:testMethod
    public function Test_46c_Midmeasure_Clef() : Void 
    {
        TestReference("Test_46c_Midmeasure_Clef", "page");
    }

    @:testMethod
    public function Test_46d_PickupMeasure_ImplicitMeasures() : Void 
    {
        TestReference("Test_46d_PickupMeasure_ImplicitMeasures", "page");
    }

    @:testMethod
    public function Test_46e_PickupMeasure_SecondVoiceStartsLater() : Void 
    {
        TestReference("Test_46e_PickupMeasure_SecondVoiceStartsLater", "page");
    }

    @:testMethod
    public function Test_46f_IncompleteMeasures() : Void 
    {
        TestReference("Test_46f_IncompleteMeasures", "page");
    }

    @:testMethod
    public function Test_46g_PickupMeasure_Chordnames_FiguredBass() : Void 
    {
        TestReference("Test_46g_PickupMeasure_Chordnames_FiguredBass", "page");
    }

    @:testMethod
    public function Test_51b_Header_Quotes() : Void 
    {
        TestReference("Test_51b_Header_Quotes", "page");
    }

    @:testMethod
    public function Test_51c_MultipleRights() : Void 
    {
        TestReference("Test_51c_MultipleRights", "page");
    }

    @:testMethod
    public function Test_51d_EmptyTitle() : Void 
    {
        TestReference("Test_51d_EmptyTitle", "page");
    }

    @:testMethod
    public function Test_52a_PageLayout() : Void 
    {
        TestReference("Test_52a_PageLayout", "page");
    }

    @:testMethod
    public function Test_52b_Breaks() : Void 
    {
        TestReference("Test_52b_Breaks", "page");
    }

    @:testMethod
    public function Test_61a_Lyrics() : Void 
    {
        TestReference("Test_61a_Lyrics", "page");
    }

    @:testMethod
    public function Test_61b_MultipleLyrics() : Void 
    {
        TestReference("Test_61b_MultipleLyrics", "page");
    }

    @:testMethod
    public function Test_61c_Lyrics_Pianostaff() : Void 
    {
        TestReference("Test_61c_Lyrics_Pianostaff", "page");
    }

    @:testMethod
    public function Test_61d_Lyrics_Melisma() : Void 
    {
        TestReference("Test_61d_Lyrics_Melisma", "page");
    }

    @:testMethod
    public function Test_61e_Lyrics_Chords() : Void 
    {
        TestReference("Test_61e_Lyrics_Chords", "page");
    }

    @:testMethod
    public function Test_61f_Lyrics_GracedNotes() : Void 
    {
        TestReference("Test_61f_Lyrics_GracedNotes", "page");
    }

    @:testMethod
    public function Test_61g_Lyrics_NameNumber() : Void 
    {
        TestReference("Test_61g_Lyrics_NameNumber", "page");
    }

    @:testMethod
    public function Test_61h_Lyrics_BeamsMelismata() : Void 
    {
        TestReference("Test_61h_Lyrics_BeamsMelismata", "page");
    }

    @:testMethod
    public function Test_61i_Lyrics_Chords() : Void 
    {
        TestReference("Test_61i_Lyrics_Chords", "page");
    }

    @:testMethod
    public function Test_61j_Lyrics_Elisions() : Void 
    {
        TestReference("Test_61j_Lyrics_Elisions", "page");
    }

    @:testMethod
    public function Test_61k_Lyrics_SpannersExtenders() : Void 
    {
        TestReference("Test_61k_Lyrics_SpannersExtenders", "page");
    }

    @:testMethod
    public function Test_71a_Chordnames() : Void 
    {
        TestReference("Test_71a_Chordnames", "page");
    }

    @:testMethod
    public function Test_71c_ChordsFrets() : Void 
    {
        TestReference("Test_71c_ChordsFrets", "page");
    }

    @:testMethod
    public function Test_71d_ChordsFrets_Multistaff() : Void 
    {
        TestReference("Test_71d_ChordsFrets_Multistaff", "page");
    }

    @:testMethod
    public function Test_71e_TabStaves() : Void 
    {
        TestReference("Test_71e_TabStaves", "page");
    }

    @:testMethod
    public function Test_71f_AllChordTypes() : Void 
    {
        TestReference("Test_71f_AllChordTypes", "page");
    }

    @:testMethod
    public function Test_71g_MultipleChordnames() : Void 
    {
        TestReference("Test_71g_MultipleChordnames", "page");
    }

    @:testMethod
    public function Test_72a_TransposingInstruments() : Void 
    {
        TestReference("Test_72a_TransposingInstruments", "page");
    }

    @:testMethod
    public function Test_72b_TransposingInstruments_Full() : Void 
    {
        TestReference("Test_72b_TransposingInstruments_Full", "page");
    }

    @:testMethod
    public function Test_72c_TransposingInstruments_Change() : Void 
    {
        TestReference("Test_72c_TransposingInstruments_Change", "page");
    }

    @:testMethod
    public function Test_73a_Percussion() : Void 
    {
        TestReference("Test_73a_Percussion", "page");
    }

    @:testMethod
    public function Test_74a_FiguredBass() : Void 
    {
        TestReference("Test_74a_FiguredBass", "page");
    }

    @:testMethod
    public function Test_75a_AccordionRegistrations() : Void 
    {
        TestReference("Test_75a_AccordionRegistrations", "page");
    }

    @:testMethod
    public function Test_99a_Sibelius5_IgnoreBeaming() : Void 
    {
        TestReference("Test_99a_Sibelius5_IgnoreBeaming", "page");
    }

    @:testMethod
    public function Test_99b_Lyrics_BeamsMelismata_IgnoreBeams() : Void 
    {
        TestReference("Test_99b_Lyrics_BeamsMelismata_IgnoreBeams", "page");
    }

    private function TestReference(caller : system.CsString = null, renderLayout : system.CsString = "page") : alphaTab.model.Score 
    {
        return null;

        // TODO: how to find testfile on JS
    }

    public function new() 
    {
        super();
    }

}
