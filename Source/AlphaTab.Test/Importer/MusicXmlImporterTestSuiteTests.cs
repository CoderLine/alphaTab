using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class MusicXmlImporterTestSuiteTests : MusicXmlImporterTestBase
    {
        [TestMethod, AsyncTestMethod]
        public void Test_01a_Pitches_Pitches()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/01a-Pitches-Pitches.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_01b_Pitches_Intervals()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/01b-Pitches-Intervals.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_01c_Pitches_NoVoiceElement()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/01c-Pitches-NoVoiceElement.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_01d_Pitches_Microtones()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/01d-Pitches-Microtones.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_01e_Pitches_ParenthesizedAccidentals()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/01e-Pitches-ParenthesizedAccidentals.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_01f_Pitches_ParenthesizedMicrotoneAccidentals()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/01f-Pitches-ParenthesizedMicrotoneAccidentals.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_02a_Rests_Durations()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/02a-Rests-Durations.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_02b_Rests_PitchedRests()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/02b-Rests-PitchedRests.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_02c_Rests_MultiMeasureRests()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/02c-Rests-MultiMeasureRests.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_02d_Rests_Multimeasure_TimeSignatures()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/02d-Rests-Multimeasure-TimeSignatures.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_02e_Rests_NoType()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/02e-Rests-NoType.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_03a_Rhythm_Durations()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/03a-Rhythm-Durations.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_03b_Rhythm_Backup()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/03b-Rhythm-Backup.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_03c_Rhythm_DivisionChange()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/03c-Rhythm-DivisionChange.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_03d_Rhythm_DottedDurations_Factors()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/03d-Rhythm-DottedDurations-Factors.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11a_TimeSignatures()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11a-TimeSignatures.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11b_TimeSignatures_NoTime()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11b-TimeSignatures-NoTime.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11c_TimeSignatures_CompoundSimple()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11c-TimeSignatures-CompoundSimple.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11d_TimeSignatures_CompoundMultiple()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11d-TimeSignatures-CompoundMultiple.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11e_TimeSignatures_CompoundMixed()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11e-TimeSignatures-CompoundMixed.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11f_TimeSignatures_SymbolMeaning()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11f-TimeSignatures-SymbolMeaning.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11g_TimeSignatures_SingleNumber()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11g-TimeSignatures-SingleNumber.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_11h_TimeSignatures_SenzaMisura()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/11h-TimeSignatures-SenzaMisura.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_12a_Clefs()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/12a-Clefs.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_12b_Clefs_NoKeyOrClef()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/12b-Clefs-NoKeyOrClef.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_13a_KeySignatures()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/13a-KeySignatures.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_13b_KeySignatures_ChurchModes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/13b-KeySignatures-ChurchModes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_13c_KeySignatures_NonTraditional()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/13c-KeySignatures-NonTraditional.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_13d_KeySignatures_Microtones()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/13d-KeySignatures-Microtones.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_14a_StaffDetails_LineChanges()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/14a-StaffDetails-LineChanges.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_21a_Chord_Basic()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/21a-Chord-Basic.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_21b_Chords_TwoNotes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/21b-Chords-TwoNotes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_21c_Chords_ThreeNotesDuration()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/21c-Chords-ThreeNotesDuration.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_21d_Chords_SchubertStabatMater()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/21d-Chords-SchubertStabatMater.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_21e_Chords_PickupMeasures()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/21e-Chords-PickupMeasures.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_21f_Chord_ElementInBetween()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/21f-Chord-ElementInBetween.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_22a_Noteheads()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/22a-Noteheads.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_22b_Staff_Notestyles()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/22b-Staff-Notestyles.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_22c_Noteheads_Chords()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/22c-Noteheads-Chords.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_22d_Parenthesized_Noteheads()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/22d-Parenthesized-Noteheads.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_23a_Tuplets()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/23a-Tuplets.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_23b_Tuplets_Styles()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/23b-Tuplets-Styles.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_23c_Tuplet_Display_NonStandard()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/23c-Tuplet-Display-NonStandard.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_23d_Tuplets_Nested()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/23d-Tuplets-Nested.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_23e_Tuplets_Tremolo()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/23e-Tuplets-Tremolo.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_23f_Tuplets_DurationButNoBracket()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/23f-Tuplets-DurationButNoBracket.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_24a_GraceNotes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/24a-GraceNotes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_24b_ChordAsGraceNote()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/24b-ChordAsGraceNote.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_24c_GraceNote_MeasureEnd()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/24c-GraceNote-MeasureEnd.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_24d_AfterGrace()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/24d-AfterGrace.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_24e_GraceNote_StaffChange()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/24e-GraceNote-StaffChange.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_24f_GraceNote_Slur()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/24f-GraceNote-Slur.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_31a_Directions()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/31a-Directions.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_31c_MetronomeMarks()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/31c-MetronomeMarks.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_32a_Notations()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/32a-Notations.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_32b_Articulations_Texts()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/32b-Articulations-Texts.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_32c_MultipleNotationChildren()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/32c-MultipleNotationChildren.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_32d_Arpeggio()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/32d-Arpeggio.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33a_Spanners()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33a-Spanners.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33b_Spanners_Tie()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33b-Spanners-Tie.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33c_Spanners_Slurs()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33c-Spanners-Slurs.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33d_Spanners_OctaveShifts()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33d-Spanners-OctaveShifts.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33e_Spanners_OctaveShifts_InvalidSize()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33e-Spanners-OctaveShifts-InvalidSize.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33f_Trill_EndingOnGraceNote()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33f-Trill-EndingOnGraceNote.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33g_Slur_ChordedNotes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33g-Slur-ChordedNotes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33h_Spanners_Glissando()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33h-Spanners-Glissando.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_33i_Ties_NotEnded()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/33i-Ties-NotEnded.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41a_MultiParts_Partorder()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41a-MultiParts-Partorder.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41b_MultiParts_MoreThan10()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41b-MultiParts-MoreThan10.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41c_StaffGroups()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41c-StaffGroups.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41d_StaffGroups_Nested()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41d-StaffGroups-Nested.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41e_StaffGroups_InstrumentNames_Linebroken()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41e-StaffGroups-InstrumentNames-Linebroken.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41f_StaffGroups_Overlapping()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41f-StaffGroups-Overlapping.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41g_PartNoId()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41g-PartNoId.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41h_TooManyParts()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41h-TooManyParts.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_41i_PartNameDisplay_Override()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/41i-PartNameDisplay-Override.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/42a-MultiVoice-TwoVoicesOnStaff-Lyrics.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_42b_MultiVoice_MidMeasureClefChange()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/42b-MultiVoice-MidMeasureClefChange.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_43a_PianoStaff()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/43a-PianoStaff.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_43b_MultiStaff_DifferentKeys()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/43b-MultiStaff-DifferentKeys.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_43c_MultiStaff_DifferentKeysAfterBackup()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/43c-MultiStaff-DifferentKeysAfterBackup.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_43d_MultiStaff_StaffChange()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/43d-MultiStaff-StaffChange.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_43e_Multistaff_ClefDynamics()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/43e-Multistaff-ClefDynamics.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45a_SimpleRepeat()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45a-SimpleRepeat.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45b_RepeatWithAlternatives()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45b-RepeatWithAlternatives.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45c_RepeatMultipleTimes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45c-RepeatMultipleTimes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45d_Repeats_Nested_Alternatives()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45d-Repeats-Nested-Alternatives.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45e_Repeats_Nested_Alternatives()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45e-Repeats-Nested-Alternatives.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45f_Repeats_InvalidEndings()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45f-Repeats-InvalidEndings.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_45g_Repeats_NotEnded()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/45g-Repeats-NotEnded.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46a_Barlines()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46a-Barlines.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46b_MidmeasureBarline()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46b-MidmeasureBarline.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46c_Midmeasure_Clef()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46c-Midmeasure-Clef.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46d_PickupMeasure_ImplicitMeasures()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46d-PickupMeasure-ImplicitMeasures.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46e_PickupMeasure_SecondVoiceStartsLater()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46e-PickupMeasure-SecondVoiceStartsLater.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46f_IncompleteMeasures()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46f-IncompleteMeasures.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_46g_PickupMeasure_Chordnames_FiguredBass()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/46g-PickupMeasure-Chordnames-FiguredBass.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_51b_Header_Quotes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/51b-Header-Quotes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_51c_MultipleRights()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/51c-MultipleRights.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_51d_EmptyTitle()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/51d-EmptyTitle.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_52a_PageLayout()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/52a-PageLayout.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_52b_Breaks()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/52b-Breaks.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61a_Lyrics()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61a-Lyrics.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61b_MultipleLyrics()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61b-MultipleLyrics.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61c_Lyrics_Pianostaff()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61c-Lyrics-Pianostaff.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61d_Lyrics_Melisma()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61d-Lyrics-Melisma.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61e_Lyrics_Chords()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61e-Lyrics-Chords.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61f_Lyrics_GracedNotes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61f-Lyrics-GracedNotes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61g_Lyrics_NameNumber()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61g-Lyrics-NameNumber.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61h_Lyrics_BeamsMelismata()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61h-Lyrics-BeamsMelismata.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61i_Lyrics_Chords()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61i-Lyrics-Chords.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61j_Lyrics_Elisions()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61j-Lyrics-Elisions.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_61k_Lyrics_SpannersExtenders()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/61k-Lyrics-SpannersExtenders.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_71a_Chordnames()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/71a-Chordnames.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_71c_ChordsFrets()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/71c-ChordsFrets.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_71d_ChordsFrets_Multistaff()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/71d-ChordsFrets-Multistaff.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_71e_TabStaves()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/71e-TabStaves.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_71f_AllChordTypes()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/71f-AllChordTypes.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_71g_MultipleChordnames()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/71g-MultipleChordnames.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_72a_TransposingInstruments()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/72a-TransposingInstruments.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_72b_TransposingInstruments_Full()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/72b-TransposingInstruments-Full.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_72c_TransposingInstruments_Change()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/72c-TransposingInstruments-Change.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_73a_Percussion()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/73a-Percussion.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_74a_FiguredBass()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/74a-FiguredBass.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_75a_AccordionRegistrations()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/75a-AccordionRegistrations.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_99a_Sibelius5_IgnoreBeaming()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/99a-Sibelius5-IgnoreBeaming.xml");
        }

        [TestMethod, AsyncTestMethod]
        public void Test_99b_Lyrics_BeamsMelismata_IgnoreBeams()
        {
            TestReferenceFile("TestFiles/MusicXmlTestSuite/99b-Lyrics-BeamsMelismata-IgnoreBeams.xml");
        }

    }
}
