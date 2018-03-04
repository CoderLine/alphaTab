/// <reference path="alphaTab.tests.js" />
describe("alphaTab.test.audio.AlphaSynthTests", function() {
    var __instance = new alphaTab.test.audio.AlphaSynthTests();
    it("TestLoadSf2PatchBank", function() {
        __instance.TestLoadSf2PatchBank();
    });
    it("TestPcmGeneration", function() {
        __instance.TestPcmGeneration();
    });
});
describe("alphaTab.test.audio.MidiFileGeneratorTest", function() {
    var __instance = new alphaTab.test.audio.MidiFileGeneratorTest();
    it("TestCorrectMidiOrder", function() {
        __instance.TestCorrectMidiOrder();
    });
    it("TestBend", function() {
        __instance.TestBend();
    });
    it("TestBendMultiPoint", function() {
        __instance.TestBendMultiPoint();
    });
});
describe("alphaTab.test.audio.MidiPlaybackControllerTest", function() {
    var __instance = new alphaTab.test.audio.MidiPlaybackControllerTest();
    it("TestRepeatClose", function() {
        __instance.TestRepeatClose();
    });
    it("TestRepeatCloseMulti", function() {
        __instance.TestRepeatCloseMulti();
    });
    it("TestRepeatCloseWithoutStartAtBeginning", function() {
        __instance.TestRepeatCloseWithoutStartAtBeginning();
    });
    it("TestRepeatCloseAlternateEndings", function() {
        __instance.TestRepeatCloseAlternateEndings();
    });
});
describe("alphaTab.test.importer.AlphaTexImporterTest", function() {
    var __instance = new alphaTab.test.importer.AlphaTexImporterTest();
    it("EnsureMetadataParsing_Issue73", function() {
        __instance.EnsureMetadataParsing_Issue73();
    });
    it("TestTuning", function() {
        __instance.TestTuning();
    });
    it("DeadNotes1_Issue79", function() {
        __instance.DeadNotes1_Issue79();
    });
    it("DeadNotes2_Issue79", function() {
        __instance.DeadNotes2_Issue79();
    });
    it("Trill_Issue79", function() {
        __instance.Trill_Issue79();
    });
    it("Tremolo_Issue79", function() {
        __instance.Tremolo_Issue79();
    });
    it("TremoloPicking_Issue79", function() {
        __instance.TremoloPicking_Issue79();
    });
    it("Hamonics_Issue79", function() {
        __instance.Hamonics_Issue79();
    });
    it("HamonicsRenderingText_Issue79", function() {
        __instance.HamonicsRenderingText_Issue79();
    });
    it("Grace_Issue79", function() {
        __instance.Grace_Issue79();
    });
    it("BendRendering_Issue79", function() {
        __instance.BendRendering_Issue79();
    });
    it("TestLeftHandFingerSingleNote", function() {
        __instance.TestLeftHandFingerSingleNote();
    });
    it("TestRightHandFingerSingleNote", function() {
        __instance.TestRightHandFingerSingleNote();
    });
    it("TestLeftHandFingerChord", function() {
        __instance.TestLeftHandFingerChord();
    });
    it("TestRightHandFingerChord", function() {
        __instance.TestRightHandFingerChord();
    });
    it("TestUnstringed", function() {
        __instance.TestUnstringed();
    });
});
describe("alphaTab.test.importer.Gp3ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp3ImporterTest();
    it("TestScoreInfo", function() {
        __instance.TestScoreInfo();
    });
    it("TestNotes", function() {
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function() {
        __instance.TestTimeSignatures();
    });
    it("TestDead", function() {
        __instance.TestDead();
    });
    it("TestAccentuation", function() {
        __instance.TestAccentuation();
    });
    it("TestGuitarPro3Harmonics", function() {
        __instance.TestGuitarPro3Harmonics();
    });
    it("TestHammer", function() {
        __instance.TestHammer();
    });
    it("TestBend", function() {
        __instance.TestBend();
    });
    it("TestSlides", function() {
        __instance.TestSlides();
    });
    it("TestGuitarPro3Vibrato", function() {
        __instance.TestGuitarPro3Vibrato();
    });
    it("TestOtherEffects", function() {
        __instance.TestOtherEffects();
    });
    it("TestStroke", function() {
        __instance.TestStroke();
    });
    it("TestTuplets", function() {
        __instance.TestTuplets();
    });
    it("TestRanges", function() {
        __instance.TestRanges();
    });
    it("TestEffects", function() {
        __instance.TestEffects();
    });
    it("TestStrings", function() {
        __instance.TestStrings();
    });
});
describe("alphaTab.test.importer.Gp4ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp4ImporterTest();
    it("TestScoreInfo", function() {
        __instance.TestScoreInfo();
    });
    it("TestNotes", function() {
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function() {
        __instance.TestTimeSignatures();
    });
    it("TestDead", function() {
        __instance.TestDead();
    });
    it("TestGrace", function() {
        __instance.TestGrace();
    });
    it("TestAccentuation", function() {
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function() {
        __instance.TestHarmonics();
    });
    it("TestHammer", function() {
        __instance.TestHammer();
    });
    it("TestBend", function() {
        __instance.TestBend();
    });
    it("TestTremolo", function() {
        __instance.TestTremolo();
    });
    it("TestSlides", function() {
        __instance.TestSlides();
    });
    it("TestVibrato", function() {
        __instance.TestVibrato();
    });
    it("TestTrills", function() {
        __instance.TestTrills();
    });
    it("TestOtherEffects", function() {
        __instance.TestOtherEffects();
    });
    it("TestFingering", function() {
        __instance.TestFingering();
    });
    it("TestStroke", function() {
        __instance.TestStroke();
    });
    it("TestTuplets", function() {
        __instance.TestTuplets();
    });
    it("TestRanges", function() {
        __instance.TestRanges();
    });
    it("TestEffects", function() {
        __instance.TestEffects();
    });
    it("TestStrings", function() {
        __instance.TestStrings();
    });
    it("TestColors", function() {
        __instance.TestColors();
    });
});
describe("alphaTab.test.importer.Gp5ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp5ImporterTest();
    it("TestScoreInfo", function() {
        __instance.TestScoreInfo();
    });
    it("TestNotes", function() {
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function() {
        __instance.TestTimeSignatures();
    });
    it("TestDead", function() {
        __instance.TestDead();
    });
    it("TestGrace", function() {
        __instance.TestGrace();
    });
    it("TestAccentuation", function() {
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function() {
        __instance.TestHarmonics();
    });
    it("TestHammer", function() {
        __instance.TestHammer();
    });
    it("TestBend", function() {
        __instance.TestBend();
    });
    it("TestTremolo", function() {
        __instance.TestTremolo();
    });
    it("TestSlides", function() {
        __instance.TestSlides();
    });
    it("TestVibrato", function() {
        __instance.TestVibrato();
    });
    it("TestTrills", function() {
        __instance.TestTrills();
    });
    it("TestOtherEffects", function() {
        __instance.TestOtherEffects();
    });
    it("TestFingering", function() {
        __instance.TestFingering();
    });
    it("TestStroke", function() {
        __instance.TestStroke();
    });
    it("TestTuplets", function() {
        __instance.TestTuplets();
    });
    it("TestRanges", function() {
        __instance.TestRanges();
    });
    it("TestEffects", function() {
        __instance.TestEffects();
    });
    it("TestSerenade", function() {
        __instance.TestSerenade();
    });
    it("TestStrings", function() {
        __instance.TestStrings();
    });
    it("TestKeySignatures", function() {
        __instance.TestKeySignatures();
    });
    it("TestChords", function() {
        __instance.TestChords();
    });
    it("TestColors", function() {
        __instance.TestColors();
    });
    it("TestCanon", function() {
        __instance.TestCanon();
    });
});
describe("alphaTab.test.importer.GpxImporterTest", function() {
    var __instance = new alphaTab.test.importer.GpxImporterTest();
    it("TestFileSystemCompressed", function() {
        __instance.TestFileSystemCompressed();
    });
    it("TestScoreInfo", function() {
        __instance.TestScoreInfo();
    });
    it("TestNotes", function() {
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function() {
        __instance.TestTimeSignatures();
    });
    it("TestDead", function() {
        __instance.TestDead();
    });
    it("TestGrace", function() {
        __instance.TestGrace();
    });
    it("TestAccentuation", function() {
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function() {
        __instance.TestHarmonics();
    });
    it("TestHammer", function() {
        __instance.TestHammer();
    });
    it("TestBend", function() {
         pending("appveyor fails for some reason, locally everything is fine?");
        __instance.TestBend();
    });
    it("TestTremolo", function() {
         pending("Test ignored");
        __instance.TestTremolo();
    });
    it("TestSlides", function() {
        __instance.TestSlides();
    });
    it("TestVibrato", function() {
        __instance.TestVibrato();
    });
    it("TestTrills", function() {
        __instance.TestTrills();
    });
    it("TestOtherEffects", function() {
        __instance.TestOtherEffects();
    });
    it("TestFingering", function() {
        __instance.TestFingering();
    });
    it("TestStroke", function() {
        __instance.TestStroke();
    });
    it("TestTuplets", function() {
        __instance.TestTuplets();
    });
    it("TestRanges", function() {
        __instance.TestRanges();
    });
    it("TestEffects", function() {
        __instance.TestEffects();
    });
    it("TestSerenade", function() {
        __instance.TestSerenade();
    });
    it("TestStrings", function() {
        __instance.TestStrings();
    });
    it("TestKeySignatures", function() {
        __instance.TestKeySignatures();
    });
    it("TestChords", function() {
        __instance.TestChords();
    });
    it("TestColors", function() {
        __instance.TestColors();
    });
});
xdescribe("alphaTab.test.importer.MusicXmlImporterSamplesTests", function() {
    var __instance = new alphaTab.test.importer.MusicXmlImporterSamplesTests();
    it("Test_ActorPreludeSample", function() {
        __instance.Test_ActorPreludeSample();
    });
    it("Test_BeetAnGeSample", function() {
        __instance.Test_BeetAnGeSample();
    });
    it("Test_Binchois", function() {
        __instance.Test_Binchois();
    });
    it("Test_BrahWiMeSample", function() {
        __instance.Test_BrahWiMeSample();
    });
    it("Test_BrookeWestSample", function() {
        __instance.Test_BrookeWestSample();
    });
    it("Test_Chant", function() {
        __instance.Test_Chant();
    });
    it("Test_DebuMandSample", function() {
        __instance.Test_DebuMandSample();
    });
    it("Test_Dichterliebe01", function() {
        __instance.Test_Dichterliebe01();
    });
    it("Test_Echigo", function() {
        __instance.Test_Echigo();
    });
    it("Test_FaurReveSample", function() {
        __instance.Test_FaurReveSample();
    });
    it("Test_MahlFaGe4Sample", function() {
        __instance.Test_MahlFaGe4Sample();
    });
    it("Test_MozaChloSample", function() {
        __instance.Test_MozaChloSample();
    });
    it("Test_MozartPianoSonata", function() {
        __instance.Test_MozartPianoSonata();
    });
    it("Test_MozartTrio", function() {
        __instance.Test_MozartTrio();
    });
    it("Test_MozaVeilSample", function() {
        __instance.Test_MozaVeilSample();
    });
    it("Test_Saltarello", function() {
        __instance.Test_Saltarello();
    });
    it("Test_SchbAvMaSample", function() {
        __instance.Test_SchbAvMaSample();
    });
    it("Test_Telemann", function() {
        __instance.Test_Telemann();
    });
});
xdescribe("alphaTab.test.importer.MusicXmlImporterTestSuiteTests", function() {
    var __instance = new alphaTab.test.importer.MusicXmlImporterTestSuiteTests();
    it("Test_01a_Pitches_Pitches", function() {
        __instance.Test_01a_Pitches_Pitches();
    });
    it("Test_01b_Pitches_Intervals", function() {
        __instance.Test_01b_Pitches_Intervals();
    });
    it("Test_01c_Pitches_NoVoiceElement", function() {
        __instance.Test_01c_Pitches_NoVoiceElement();
    });
    it("Test_01d_Pitches_Microtones", function() {
        __instance.Test_01d_Pitches_Microtones();
    });
    it("Test_01e_Pitches_ParenthesizedAccidentals", function() {
        __instance.Test_01e_Pitches_ParenthesizedAccidentals();
    });
    it("Test_01f_Pitches_ParenthesizedMicrotoneAccidentals", function() {
        __instance.Test_01f_Pitches_ParenthesizedMicrotoneAccidentals();
    });
    it("Test_02a_Rests_Durations", function() {
        __instance.Test_02a_Rests_Durations();
    });
    it("Test_02b_Rests_PitchedRests", function() {
        __instance.Test_02b_Rests_PitchedRests();
    });
    it("Test_02c_Rests_MultiMeasureRests", function() {
        __instance.Test_02c_Rests_MultiMeasureRests();
    });
    it("Test_02d_Rests_Multimeasure_TimeSignatures", function() {
        __instance.Test_02d_Rests_Multimeasure_TimeSignatures();
    });
    it("Test_02e_Rests_NoType", function() {
        __instance.Test_02e_Rests_NoType();
    });
    it("Test_03a_Rhythm_Durations", function() {
        __instance.Test_03a_Rhythm_Durations();
    });
    it("Test_03b_Rhythm_Backup", function() {
        __instance.Test_03b_Rhythm_Backup();
    });
    it("Test_03c_Rhythm_DivisionChange", function() {
        __instance.Test_03c_Rhythm_DivisionChange();
    });
    it("Test_03d_Rhythm_DottedDurations_Factors", function() {
        __instance.Test_03d_Rhythm_DottedDurations_Factors();
    });
    it("Test_11a_TimeSignatures", function() {
        __instance.Test_11a_TimeSignatures();
    });
    it("Test_11b_TimeSignatures_NoTime", function() {
        __instance.Test_11b_TimeSignatures_NoTime();
    });
    it("Test_11c_TimeSignatures_CompoundSimple", function() {
        __instance.Test_11c_TimeSignatures_CompoundSimple();
    });
    it("Test_11d_TimeSignatures_CompoundMultiple", function() {
        __instance.Test_11d_TimeSignatures_CompoundMultiple();
    });
    it("Test_11e_TimeSignatures_CompoundMixed", function() {
        __instance.Test_11e_TimeSignatures_CompoundMixed();
    });
    it("Test_11f_TimeSignatures_SymbolMeaning", function() {
        __instance.Test_11f_TimeSignatures_SymbolMeaning();
    });
    it("Test_11g_TimeSignatures_SingleNumber", function() {
        __instance.Test_11g_TimeSignatures_SingleNumber();
    });
    it("Test_11h_TimeSignatures_SenzaMisura", function() {
        __instance.Test_11h_TimeSignatures_SenzaMisura();
    });
    it("Test_12a_Clefs", function() {
        __instance.Test_12a_Clefs();
    });
    it("Test_12b_Clefs_NoKeyOrClef", function() {
        __instance.Test_12b_Clefs_NoKeyOrClef();
    });
    it("Test_13a_KeySignatures", function() {
        __instance.Test_13a_KeySignatures();
    });
    it("Test_13b_KeySignatures_ChurchModes", function() {
        __instance.Test_13b_KeySignatures_ChurchModes();
    });
    it("Test_13c_KeySignatures_NonTraditional", function() {
        __instance.Test_13c_KeySignatures_NonTraditional();
    });
    it("Test_13d_KeySignatures_Microtones", function() {
        __instance.Test_13d_KeySignatures_Microtones();
    });
    it("Test_14a_StaffDetails_LineChanges", function() {
        __instance.Test_14a_StaffDetails_LineChanges();
    });
    it("Test_21a_Chord_Basic", function() {
        __instance.Test_21a_Chord_Basic();
    });
    it("Test_21b_Chords_TwoNotes", function() {
        __instance.Test_21b_Chords_TwoNotes();
    });
    it("Test_21c_Chords_ThreeNotesDuration", function() {
        __instance.Test_21c_Chords_ThreeNotesDuration();
    });
    it("Test_21d_Chords_SchubertStabatMater", function() {
        __instance.Test_21d_Chords_SchubertStabatMater();
    });
    it("Test_21e_Chords_PickupMeasures", function() {
        __instance.Test_21e_Chords_PickupMeasures();
    });
    it("Test_21f_Chord_ElementInBetween", function() {
        __instance.Test_21f_Chord_ElementInBetween();
    });
    it("Test_22a_Noteheads", function() {
        __instance.Test_22a_Noteheads();
    });
    it("Test_22b_Staff_Notestyles", function() {
        __instance.Test_22b_Staff_Notestyles();
    });
    it("Test_22c_Noteheads_Chords", function() {
        __instance.Test_22c_Noteheads_Chords();
    });
    it("Test_22d_Parenthesized_Noteheads", function() {
        __instance.Test_22d_Parenthesized_Noteheads();
    });
    it("Test_23a_Tuplets", function() {
        __instance.Test_23a_Tuplets();
    });
    it("Test_23b_Tuplets_Styles", function() {
        __instance.Test_23b_Tuplets_Styles();
    });
    it("Test_23c_Tuplet_Display_NonStandard", function() {
        __instance.Test_23c_Tuplet_Display_NonStandard();
    });
    it("Test_23d_Tuplets_Nested", function() {
        __instance.Test_23d_Tuplets_Nested();
    });
    it("Test_23e_Tuplets_Tremolo", function() {
        __instance.Test_23e_Tuplets_Tremolo();
    });
    it("Test_23f_Tuplets_DurationButNoBracket", function() {
        __instance.Test_23f_Tuplets_DurationButNoBracket();
    });
    it("Test_24a_GraceNotes", function() {
        __instance.Test_24a_GraceNotes();
    });
    it("Test_24b_ChordAsGraceNote", function() {
        __instance.Test_24b_ChordAsGraceNote();
    });
    it("Test_24c_GraceNote_MeasureEnd", function() {
        __instance.Test_24c_GraceNote_MeasureEnd();
    });
    it("Test_24d_AfterGrace", function() {
        __instance.Test_24d_AfterGrace();
    });
    it("Test_24e_GraceNote_StaffChange", function() {
        __instance.Test_24e_GraceNote_StaffChange();
    });
    it("Test_24f_GraceNote_Slur", function() {
        __instance.Test_24f_GraceNote_Slur();
    });
    it("Test_31a_Directions", function() {
        __instance.Test_31a_Directions();
    });
    it("Test_31c_MetronomeMarks", function() {
        __instance.Test_31c_MetronomeMarks();
    });
    it("Test_32a_Notations", function() {
        __instance.Test_32a_Notations();
    });
    it("Test_32b_Articulations_Texts", function() {
        __instance.Test_32b_Articulations_Texts();
    });
    it("Test_32c_MultipleNotationChildren", function() {
        __instance.Test_32c_MultipleNotationChildren();
    });
    it("Test_32d_Arpeggio", function() {
        __instance.Test_32d_Arpeggio();
    });
    it("Test_33a_Spanners", function() {
        __instance.Test_33a_Spanners();
    });
    it("Test_33b_Spanners_Tie", function() {
        __instance.Test_33b_Spanners_Tie();
    });
    it("Test_33c_Spanners_Slurs", function() {
        __instance.Test_33c_Spanners_Slurs();
    });
    it("Test_33d_Spanners_OctaveShifts", function() {
        __instance.Test_33d_Spanners_OctaveShifts();
    });
    it("Test_33e_Spanners_OctaveShifts_InvalidSize", function() {
        __instance.Test_33e_Spanners_OctaveShifts_InvalidSize();
    });
    it("Test_33f_Trill_EndingOnGraceNote", function() {
        __instance.Test_33f_Trill_EndingOnGraceNote();
    });
    it("Test_33g_Slur_ChordedNotes", function() {
        __instance.Test_33g_Slur_ChordedNotes();
    });
    it("Test_33h_Spanners_Glissando", function() {
        __instance.Test_33h_Spanners_Glissando();
    });
    it("Test_33i_Ties_NotEnded", function() {
        __instance.Test_33i_Ties_NotEnded();
    });
    it("Test_41a_MultiParts_Partorder", function() {
        __instance.Test_41a_MultiParts_Partorder();
    });
    it("Test_41b_MultiParts_MoreThan10", function() {
        __instance.Test_41b_MultiParts_MoreThan10();
    });
    it("Test_41c_StaffGroups", function() {
        __instance.Test_41c_StaffGroups();
    });
    it("Test_41d_StaffGroups_Nested", function() {
        __instance.Test_41d_StaffGroups_Nested();
    });
    it("Test_41e_StaffGroups_InstrumentNames_Linebroken", function() {
        __instance.Test_41e_StaffGroups_InstrumentNames_Linebroken();
    });
    it("Test_41f_StaffGroups_Overlapping", function() {
        __instance.Test_41f_StaffGroups_Overlapping();
    });
    it("Test_41g_PartNoId", function() {
        __instance.Test_41g_PartNoId();
    });
    it("Test_41h_TooManyParts", function() {
        __instance.Test_41h_TooManyParts();
    });
    it("Test_41i_PartNameDisplay_Override", function() {
        __instance.Test_41i_PartNameDisplay_Override();
    });
    it("Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics", function() {
        __instance.Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics();
    });
    it("Test_42b_MultiVoice_MidMeasureClefChange", function() {
        __instance.Test_42b_MultiVoice_MidMeasureClefChange();
    });
    it("Test_43a_PianoStaff", function() {
        __instance.Test_43a_PianoStaff();
    });
    it("Test_43b_MultiStaff_DifferentKeys", function() {
        __instance.Test_43b_MultiStaff_DifferentKeys();
    });
    it("Test_43c_MultiStaff_DifferentKeysAfterBackup", function() {
        __instance.Test_43c_MultiStaff_DifferentKeysAfterBackup();
    });
    it("Test_43d_MultiStaff_StaffChange", function() {
        __instance.Test_43d_MultiStaff_StaffChange();
    });
    it("Test_43e_Multistaff_ClefDynamics", function() {
        __instance.Test_43e_Multistaff_ClefDynamics();
    });
    it("Test_45a_SimpleRepeat", function() {
        __instance.Test_45a_SimpleRepeat();
    });
    it("Test_45b_RepeatWithAlternatives", function() {
        __instance.Test_45b_RepeatWithAlternatives();
    });
    it("Test_45c_RepeatMultipleTimes", function() {
        __instance.Test_45c_RepeatMultipleTimes();
    });
    it("Test_45d_Repeats_Nested_Alternatives", function() {
        __instance.Test_45d_Repeats_Nested_Alternatives();
    });
    it("Test_45e_Repeats_Nested_Alternatives", function() {
        __instance.Test_45e_Repeats_Nested_Alternatives();
    });
    it("Test_45f_Repeats_InvalidEndings", function() {
        __instance.Test_45f_Repeats_InvalidEndings();
    });
    it("Test_45g_Repeats_NotEnded", function() {
        __instance.Test_45g_Repeats_NotEnded();
    });
    it("Test_46a_Barlines", function() {
        __instance.Test_46a_Barlines();
    });
    it("Test_46b_MidmeasureBarline", function() {
        __instance.Test_46b_MidmeasureBarline();
    });
    it("Test_46c_Midmeasure_Clef", function() {
        __instance.Test_46c_Midmeasure_Clef();
    });
    it("Test_46d_PickupMeasure_ImplicitMeasures", function() {
        __instance.Test_46d_PickupMeasure_ImplicitMeasures();
    });
    it("Test_46e_PickupMeasure_SecondVoiceStartsLater", function() {
        __instance.Test_46e_PickupMeasure_SecondVoiceStartsLater();
    });
    it("Test_46f_IncompleteMeasures", function() {
        __instance.Test_46f_IncompleteMeasures();
    });
    it("Test_46g_PickupMeasure_Chordnames_FiguredBass", function() {
        __instance.Test_46g_PickupMeasure_Chordnames_FiguredBass();
    });
    it("Test_51b_Header_Quotes", function() {
        __instance.Test_51b_Header_Quotes();
    });
    it("Test_51c_MultipleRights", function() {
        __instance.Test_51c_MultipleRights();
    });
    it("Test_51d_EmptyTitle", function() {
        __instance.Test_51d_EmptyTitle();
    });
    it("Test_52a_PageLayout", function() {
        __instance.Test_52a_PageLayout();
    });
    it("Test_52b_Breaks", function() {
        __instance.Test_52b_Breaks();
    });
    it("Test_61a_Lyrics", function() {
        __instance.Test_61a_Lyrics();
    });
    it("Test_61b_MultipleLyrics", function() {
        __instance.Test_61b_MultipleLyrics();
    });
    it("Test_61c_Lyrics_Pianostaff", function() {
        __instance.Test_61c_Lyrics_Pianostaff();
    });
    it("Test_61d_Lyrics_Melisma", function() {
        __instance.Test_61d_Lyrics_Melisma();
    });
    it("Test_61e_Lyrics_Chords", function() {
        __instance.Test_61e_Lyrics_Chords();
    });
    it("Test_61f_Lyrics_GracedNotes", function() {
        __instance.Test_61f_Lyrics_GracedNotes();
    });
    it("Test_61g_Lyrics_NameNumber", function() {
        __instance.Test_61g_Lyrics_NameNumber();
    });
    it("Test_61h_Lyrics_BeamsMelismata", function() {
        __instance.Test_61h_Lyrics_BeamsMelismata();
    });
    it("Test_61i_Lyrics_Chords", function() {
        __instance.Test_61i_Lyrics_Chords();
    });
    it("Test_61j_Lyrics_Elisions", function() {
        __instance.Test_61j_Lyrics_Elisions();
    });
    it("Test_61k_Lyrics_SpannersExtenders", function() {
        __instance.Test_61k_Lyrics_SpannersExtenders();
    });
    it("Test_71a_Chordnames", function() {
        __instance.Test_71a_Chordnames();
    });
    it("Test_71c_ChordsFrets", function() {
        __instance.Test_71c_ChordsFrets();
    });
    it("Test_71d_ChordsFrets_Multistaff", function() {
        __instance.Test_71d_ChordsFrets_Multistaff();
    });
    it("Test_71e_TabStaves", function() {
        __instance.Test_71e_TabStaves();
    });
    it("Test_71f_AllChordTypes", function() {
        __instance.Test_71f_AllChordTypes();
    });
    it("Test_71g_MultipleChordnames", function() {
        __instance.Test_71g_MultipleChordnames();
    });
    it("Test_72a_TransposingInstruments", function() {
        __instance.Test_72a_TransposingInstruments();
    });
    it("Test_72b_TransposingInstruments_Full", function() {
        __instance.Test_72b_TransposingInstruments_Full();
    });
    it("Test_72c_TransposingInstruments_Change", function() {
        __instance.Test_72c_TransposingInstruments_Change();
    });
    it("Test_73a_Percussion", function() {
        __instance.Test_73a_Percussion();
    });
    it("Test_74a_FiguredBass", function() {
        __instance.Test_74a_FiguredBass();
    });
    it("Test_75a_AccordionRegistrations", function() {
        __instance.Test_75a_AccordionRegistrations();
    });
    it("Test_99a_Sibelius5_IgnoreBeaming", function() {
        __instance.Test_99a_Sibelius5_IgnoreBeaming();
    });
    it("Test_99b_Lyrics_BeamsMelismata_IgnoreBeams", function() {
        __instance.Test_99b_Lyrics_BeamsMelismata_IgnoreBeams();
    });
});
describe("alphaTab.test.model.LyricsTest", function() {
    var __instance = new alphaTab.test.model.LyricsTest();
    it("TestApplySingleLineFirstBar", function() {
        __instance.TestApplySingleLineFirstBar();
    });
    it("TestApplySingleLineBarOffset", function() {
        __instance.TestApplySingleLineBarOffset();
    });
    it("TestApplyMultiLineFirstBar", function() {
        __instance.TestApplyMultiLineFirstBar();
    });
    it("TestApplyMultiLineBarOffset", function() {
        __instance.TestApplyMultiLineBarOffset();
    });
    it("TestSpaces", function() {
        __instance.TestSpaces();
    });
    it("TestNewLines", function() {
        __instance.TestNewLines();
    });
    it("TestDash", function() {
        __instance.TestDash();
    });
    it("TestPlus", function() {
        __instance.TestPlus();
    });
    it("TestComments", function() {
        __instance.TestComments();
    });
});
describe("alphaTab.test.model.TuningParserTest", function() {
    var __instance = new alphaTab.test.model.TuningParserTest();
    it("TestStandard", function() {
        __instance.TestStandard();
    });
});
describe("alphaTab.test.xml.XmlParseTest", function() {
    var __instance = new alphaTab.test.xml.XmlParseTest();
    it("ParseSimple", function() {
        __instance.ParseSimple();
    });
    it("ParseShorthand", function() {
        __instance.ParseShorthand();
    });
    it("ParseSingleAttribute", function() {
        __instance.ParseSingleAttribute();
    });
    it("ParseMultipleAttributes", function() {
        __instance.ParseMultipleAttributes();
    });
    it("ParseSimpleText", function() {
        __instance.ParseSimpleText();
    });
    it("ParseChild", function() {
        __instance.ParseChild();
    });
    it("ParseMultiChild", function() {
        __instance.ParseMultiChild();
    });
    it("ParseComments", function() {
        __instance.ParseComments();
    });
    it("ParseDoctype", function() {
        __instance.ParseDoctype();
    });
    it("ParseXmlHeadTest", function() {
        __instance.ParseXmlHeadTest();
    });
    it("ParseFull", function() {
        __instance.ParseFull();
    });
});
// End of test registration
