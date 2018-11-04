/// <reference path="alphaTab.tests.js" />
describe("alphaTab.test.audio.AlphaSynthTests", function() {
    var __instance = new alphaTab.test.audio.AlphaSynthTests();
    it("TestLoadSf2PatchBank", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestLoadSf2PatchBank();
    });
    it("TestPcmGeneration", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestPcmGeneration();
    });
});
describe("alphaTab.test.audio.MidiFileGeneratorTest", function() {
    var __instance = new alphaTab.test.audio.MidiFileGeneratorTest();
    it("TestCorrectMidiOrder", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestCorrectMidiOrder();
        done();
    });
    it("TestBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBend();
        done();
    });
    it("TestGraceBeatGeneration", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGraceBeatGeneration();
    });
    it("TestBendMultiPoint", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBendMultiPoint();
        done();
    });
});
describe("alphaTab.test.audio.MidiPlaybackControllerTest", function() {
    var __instance = new alphaTab.test.audio.MidiPlaybackControllerTest();
    it("TestRepeatClose", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRepeatClose();
    });
    it("TestRepeatCloseMulti", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRepeatCloseMulti();
    });
    it("TestRepeatCloseWithoutStartAtBeginning", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRepeatCloseWithoutStartAtBeginning();
    });
    it("TestRepeatCloseAlternateEndings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRepeatCloseAlternateEndings();
    });
});
describe("alphaTab.test.importer.AlphaTexImporterTest", function() {
    var __instance = new alphaTab.test.importer.AlphaTexImporterTest();
    it("EnsureMetadataParsing_Issue73", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.EnsureMetadataParsing_Issue73();
        done();
    });
    it("TestTuning", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTuning();
        done();
    });
    it("DeadNotes1_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.DeadNotes1_Issue79();
        done();
    });
    it("DeadNotes2_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.DeadNotes2_Issue79();
        done();
    });
    it("Trill_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Trill_Issue79();
        done();
    });
    it("Tremolo_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Tremolo_Issue79();
        done();
    });
    it("TremoloPicking_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TremoloPicking_Issue79();
        done();
    });
    it("Hamonics_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Hamonics_Issue79();
        done();
    });
    it("HamonicsRenderingText_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.HamonicsRenderingText_Issue79();
        done();
    });
    it("Grace_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Grace_Issue79();
        done();
    });
    it("BendRendering_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.BendRendering_Issue79();
        done();
    });
    it("TestLeftHandFingerSingleNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestLeftHandFingerSingleNote();
        done();
    });
    it("TestRightHandFingerSingleNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRightHandFingerSingleNote();
        done();
    });
    it("TestLeftHandFingerChord", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestLeftHandFingerChord();
        done();
    });
    it("TestRightHandFingerChord", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRightHandFingerChord();
        done();
    });
    it("TestUnstringed", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestUnstringed();
        done();
    });
    it("TestMultiStaffDefaultSettings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiStaffDefaultSettings();
        done();
    });
    it("TestMultiStaffDefaultSettingsBraces", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiStaffDefaultSettingsBraces();
        done();
    });
    it("TestSingleStaffWithSetting", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSingleStaffWithSetting();
        done();
    });
    it("TestMultiStaffWithSettings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiStaffWithSettings();
        done();
    });
    it("TestMultiTrack", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiTrack();
        done();
    });
    it("TestMultiTrackNames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiTrackNames();
        done();
    });
    it("TestMultiTrackMultiStaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiTrackMultiStaff();
        done();
    });
    it("TestMultiTrackMultiStaffInconsistentBars", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestMultiTrackMultiStaffInconsistentBars();
        done();
    });
});
describe("alphaTab.test.importer.Gp3ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp3ImporterTest();
    it("TestScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestScoreInfo();
    });
    it("TestNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTimeSignatures();
    });
    it("TestDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestDead();
    });
    it("TestAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestAccentuation();
    });
    it("TestGuitarPro3Harmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGuitarPro3Harmonics();
        done();
    });
    it("TestHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHammer();
    });
    it("TestBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBend();
    });
    it("TestSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSlides();
    });
    it("TestGuitarPro3Vibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGuitarPro3Vibrato();
    });
    it("TestOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestOtherEffects();
    });
    it("TestStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStroke();
    });
    it("TestTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTuplets();
    });
    it("TestRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRanges();
    });
    it("TestEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestEffects();
    });
    it("TestStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStrings();
    });
});
describe("alphaTab.test.importer.Gp4ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp4ImporterTest();
    it("TestScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestScoreInfo();
    });
    it("TestNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTimeSignatures();
    });
    it("TestDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestDead();
    });
    it("TestGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGrace();
    });
    it("TestAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHarmonics();
    });
    it("TestHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHammer();
    });
    it("TestBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBend();
    });
    it("TestTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTremolo();
    });
    it("TestSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSlides();
    });
    it("TestVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestVibrato();
    });
    it("TestTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTrills();
    });
    it("TestOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestOtherEffects();
    });
    it("TestFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestFingering();
    });
    it("TestStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStroke();
    });
    it("TestTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTuplets();
    });
    it("TestRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRanges();
    });
    it("TestEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestEffects();
    });
    it("TestStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStrings();
    });
    it("TestColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestColors();
    });
});
describe("alphaTab.test.importer.Gp5ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp5ImporterTest();
    it("TestScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestScoreInfo();
    });
    it("TestNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTimeSignatures();
    });
    it("TestDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestDead();
    });
    it("TestGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGrace();
    });
    it("TestAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHarmonics();
    });
    it("TestHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHammer();
    });
    it("TestBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBend();
    });
    it("TestTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTremolo();
    });
    it("TestSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSlides();
    });
    it("TestVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestVibrato();
    });
    it("TestTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTrills();
    });
    it("TestOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestOtherEffects();
    });
    it("TestFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestFingering();
    });
    it("TestStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStroke();
    });
    it("TestTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTuplets();
    });
    it("TestRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRanges();
    });
    it("TestEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestEffects();
    });
    it("TestSerenade", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSerenade();
    });
    it("TestStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStrings();
    });
    it("TestKeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestKeySignatures();
    });
    it("TestChords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestChords();
    });
    it("TestColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestColors();
    });
    it("TestCanon", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestCanon();
    });
});
describe("alphaTab.test.importer.Gp7ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp7ImporterTest();
    it("TestScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestScoreInfo();
    });
    it("TestNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTimeSignatures();
    });
    it("TestDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestDead();
    });
    it("TestGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGrace();
    });
    it("TestAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHarmonics();
    });
    it("TestHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHammer();
    });
    it("TestNumber", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNumber();
        done();
    });
    it("TestBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBend();
    });
    it("TestBendAdvanced", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBendAdvanced();
    });
    it("TestWhammyAdvanced", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestWhammyAdvanced();
    });
    it("TestTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTremolo();
    });
    it("TestSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSlides();
    });
    it("TestVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestVibrato();
    });
    it("TestTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTrills();
    });
    it("TestOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestOtherEffects();
    });
    it("TestFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestFingering();
    });
    it("TestStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStroke();
    });
    it("TestTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTuplets();
    });
    it("TestRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRanges();
    });
    it("TestEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestEffects();
    });
    it("TestSerenade", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSerenade();
    });
    it("TestStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStrings();
    });
    it("TestKeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestKeySignatures();
    });
    it("TestChords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestChords();
    });
    it("TestColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestColors();
    });
    it("TestTremoloVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTremoloVibrato();
    });
    it("TestOttavia", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestOttavia();
    });
    it("TestSimileMark", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSimileMark();
    });
    it("TestFermata", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestFermata();
    });
    it("TestPickSlide", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestPickSlide();
    });
});
describe("alphaTab.test.importer.GpxImporterTest", function() {
    var __instance = new alphaTab.test.importer.GpxImporterTest();
    it("TestFileSystemCompressed", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestFileSystemCompressed();
    });
    it("TestScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestScoreInfo();
    });
    it("TestNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNotes();
    });
    it("TestTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTimeSignatures();
    });
    it("TestDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestDead();
    });
    it("TestGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestGrace();
    });
    it("TestAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestAccentuation();
    });
    it("TestHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHarmonics();
    });
    it("TestHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestHammer();
    });
    it("TestBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestBend();
    });
    it("TestTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTremolo();
    });
    it("TestSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSlides();
    });
    it("TestVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestVibrato();
    });
    it("TestTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTrills();
    });
    it("TestOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestOtherEffects();
    });
    it("TestFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestFingering();
    });
    it("TestStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStroke();
    });
    it("TestTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestTuplets();
    });
    it("TestRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestRanges();
    });
    it("TestEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestEffects();
    });
    it("TestSerenade", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSerenade();
    });
    it("TestStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStrings();
    });
    it("TestKeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestKeySignatures();
    });
    it("TestChords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestChords();
    });
    it("TestColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestColors();
    });
});
xdescribe("alphaTab.test.importer.MusicXmlImporterSamplesTests", function() {
    var __instance = new alphaTab.test.importer.MusicXmlImporterSamplesTests();
    it("Test_ActorPreludeSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_ActorPreludeSample();
    });
    it("Test_BeetAnGeSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_BeetAnGeSample();
    });
    it("Test_Binchois", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_Binchois();
    });
    it("Test_BrahWiMeSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_BrahWiMeSample();
    });
    it("Test_BrookeWestSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_BrookeWestSample();
    });
    it("Test_Chant", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_Chant();
    });
    it("Test_DebuMandSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_DebuMandSample();
    });
    it("Test_Dichterliebe01", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_Dichterliebe01();
    });
    it("Test_Echigo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_Echigo();
    });
    it("Test_FaurReveSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_FaurReveSample();
    });
    it("Test_MahlFaGe4Sample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_MahlFaGe4Sample();
    });
    it("Test_MozaChloSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_MozaChloSample();
    });
    it("Test_MozartPianoSonata", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_MozartPianoSonata();
    });
    it("Test_MozartTrio", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_MozartTrio();
    });
    it("Test_MozaVeilSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_MozaVeilSample();
    });
    it("Test_Saltarello", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_Saltarello();
    });
    it("Test_SchbAvMaSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_SchbAvMaSample();
    });
    it("Test_Telemann", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_Telemann();
    });
});
xdescribe("alphaTab.test.importer.MusicXmlImporterTestSuiteTests", function() {
    var __instance = new alphaTab.test.importer.MusicXmlImporterTestSuiteTests();
    it("Test_01a_Pitches_Pitches", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_01a_Pitches_Pitches();
    });
    it("Test_01b_Pitches_Intervals", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_01b_Pitches_Intervals();
    });
    it("Test_01c_Pitches_NoVoiceElement", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_01c_Pitches_NoVoiceElement();
    });
    it("Test_01d_Pitches_Microtones", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_01d_Pitches_Microtones();
    });
    it("Test_01e_Pitches_ParenthesizedAccidentals", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_01e_Pitches_ParenthesizedAccidentals();
    });
    it("Test_01f_Pitches_ParenthesizedMicrotoneAccidentals", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_01f_Pitches_ParenthesizedMicrotoneAccidentals();
    });
    it("Test_02a_Rests_Durations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_02a_Rests_Durations();
    });
    it("Test_02b_Rests_PitchedRests", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_02b_Rests_PitchedRests();
    });
    it("Test_02c_Rests_MultiMeasureRests", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_02c_Rests_MultiMeasureRests();
    });
    it("Test_02d_Rests_Multimeasure_TimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_02d_Rests_Multimeasure_TimeSignatures();
    });
    it("Test_02e_Rests_NoType", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_02e_Rests_NoType();
    });
    it("Test_03a_Rhythm_Durations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_03a_Rhythm_Durations();
    });
    it("Test_03b_Rhythm_Backup", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_03b_Rhythm_Backup();
    });
    it("Test_03c_Rhythm_DivisionChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_03c_Rhythm_DivisionChange();
    });
    it("Test_03d_Rhythm_DottedDurations_Factors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_03d_Rhythm_DottedDurations_Factors();
    });
    it("Test_11a_TimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11a_TimeSignatures();
    });
    it("Test_11b_TimeSignatures_NoTime", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11b_TimeSignatures_NoTime();
    });
    it("Test_11c_TimeSignatures_CompoundSimple", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11c_TimeSignatures_CompoundSimple();
    });
    it("Test_11d_TimeSignatures_CompoundMultiple", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11d_TimeSignatures_CompoundMultiple();
    });
    it("Test_11e_TimeSignatures_CompoundMixed", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11e_TimeSignatures_CompoundMixed();
    });
    it("Test_11f_TimeSignatures_SymbolMeaning", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11f_TimeSignatures_SymbolMeaning();
    });
    it("Test_11g_TimeSignatures_SingleNumber", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11g_TimeSignatures_SingleNumber();
    });
    it("Test_11h_TimeSignatures_SenzaMisura", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_11h_TimeSignatures_SenzaMisura();
    });
    it("Test_12a_Clefs", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_12a_Clefs();
    });
    it("Test_12b_Clefs_NoKeyOrClef", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_12b_Clefs_NoKeyOrClef();
    });
    it("Test_13a_KeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_13a_KeySignatures();
    });
    it("Test_13b_KeySignatures_ChurchModes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_13b_KeySignatures_ChurchModes();
    });
    it("Test_13c_KeySignatures_NonTraditional", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_13c_KeySignatures_NonTraditional();
    });
    it("Test_13d_KeySignatures_Microtones", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_13d_KeySignatures_Microtones();
    });
    it("Test_14a_StaffDetails_LineChanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_14a_StaffDetails_LineChanges();
    });
    it("Test_21a_Chord_Basic", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_21a_Chord_Basic();
    });
    it("Test_21b_Chords_TwoNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_21b_Chords_TwoNotes();
    });
    it("Test_21c_Chords_ThreeNotesDuration", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_21c_Chords_ThreeNotesDuration();
    });
    it("Test_21d_Chords_SchubertStabatMater", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_21d_Chords_SchubertStabatMater();
    });
    it("Test_21e_Chords_PickupMeasures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_21e_Chords_PickupMeasures();
    });
    it("Test_21f_Chord_ElementInBetween", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_21f_Chord_ElementInBetween();
    });
    it("Test_22a_Noteheads", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_22a_Noteheads();
    });
    it("Test_22b_Staff_Notestyles", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_22b_Staff_Notestyles();
    });
    it("Test_22c_Noteheads_Chords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_22c_Noteheads_Chords();
    });
    it("Test_22d_Parenthesized_Noteheads", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_22d_Parenthesized_Noteheads();
    });
    it("Test_23a_Tuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_23a_Tuplets();
    });
    it("Test_23b_Tuplets_Styles", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_23b_Tuplets_Styles();
    });
    it("Test_23c_Tuplet_Display_NonStandard", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_23c_Tuplet_Display_NonStandard();
    });
    it("Test_23d_Tuplets_Nested", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_23d_Tuplets_Nested();
    });
    it("Test_23e_Tuplets_Tremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_23e_Tuplets_Tremolo();
    });
    it("Test_23f_Tuplets_DurationButNoBracket", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_23f_Tuplets_DurationButNoBracket();
    });
    it("Test_24a_GraceNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_24a_GraceNotes();
    });
    it("Test_24b_ChordAsGraceNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_24b_ChordAsGraceNote();
    });
    it("Test_24c_GraceNote_MeasureEnd", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_24c_GraceNote_MeasureEnd();
    });
    it("Test_24d_AfterGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_24d_AfterGrace();
    });
    it("Test_24e_GraceNote_StaffChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_24e_GraceNote_StaffChange();
    });
    it("Test_24f_GraceNote_Slur", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_24f_GraceNote_Slur();
    });
    it("Test_31a_Directions", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_31a_Directions();
    });
    it("Test_31c_MetronomeMarks", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_31c_MetronomeMarks();
    });
    it("Test_32a_Notations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_32a_Notations();
    });
    it("Test_32b_Articulations_Texts", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_32b_Articulations_Texts();
    });
    it("Test_32c_MultipleNotationChildren", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_32c_MultipleNotationChildren();
    });
    it("Test_32d_Arpeggio", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_32d_Arpeggio();
    });
    it("Test_33a_Spanners", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33a_Spanners();
    });
    it("Test_33b_Spanners_Tie", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33b_Spanners_Tie();
    });
    it("Test_33c_Spanners_Slurs", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33c_Spanners_Slurs();
    });
    it("Test_33d_Spanners_OctaveShifts", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33d_Spanners_OctaveShifts();
    });
    it("Test_33e_Spanners_OctaveShifts_InvalidSize", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33e_Spanners_OctaveShifts_InvalidSize();
    });
    it("Test_33f_Trill_EndingOnGraceNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33f_Trill_EndingOnGraceNote();
    });
    it("Test_33g_Slur_ChordedNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33g_Slur_ChordedNotes();
    });
    it("Test_33h_Spanners_Glissando", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33h_Spanners_Glissando();
    });
    it("Test_33i_Ties_NotEnded", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_33i_Ties_NotEnded();
    });
    it("Test_41a_MultiParts_Partorder", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41a_MultiParts_Partorder();
    });
    it("Test_41b_MultiParts_MoreThan10", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41b_MultiParts_MoreThan10();
    });
    it("Test_41c_StaffGroups", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41c_StaffGroups();
    });
    it("Test_41d_StaffGroups_Nested", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41d_StaffGroups_Nested();
    });
    it("Test_41e_StaffGroups_InstrumentNames_Linebroken", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41e_StaffGroups_InstrumentNames_Linebroken();
    });
    it("Test_41f_StaffGroups_Overlapping", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41f_StaffGroups_Overlapping();
    });
    it("Test_41g_PartNoId", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41g_PartNoId();
    });
    it("Test_41h_TooManyParts", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41h_TooManyParts();
    });
    it("Test_41i_PartNameDisplay_Override", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_41i_PartNameDisplay_Override();
    });
    it("Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics();
    });
    it("Test_42b_MultiVoice_MidMeasureClefChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_42b_MultiVoice_MidMeasureClefChange();
    });
    it("Test_43a_PianoStaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_43a_PianoStaff();
    });
    it("Test_43b_MultiStaff_DifferentKeys", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_43b_MultiStaff_DifferentKeys();
    });
    it("Test_43c_MultiStaff_DifferentKeysAfterBackup", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_43c_MultiStaff_DifferentKeysAfterBackup();
    });
    it("Test_43d_MultiStaff_StaffChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_43d_MultiStaff_StaffChange();
    });
    it("Test_43e_Multistaff_ClefDynamics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_43e_Multistaff_ClefDynamics();
    });
    it("Test_45a_SimpleRepeat", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45a_SimpleRepeat();
    });
    it("Test_45b_RepeatWithAlternatives", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45b_RepeatWithAlternatives();
    });
    it("Test_45c_RepeatMultipleTimes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45c_RepeatMultipleTimes();
    });
    it("Test_45d_Repeats_Nested_Alternatives", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45d_Repeats_Nested_Alternatives();
    });
    it("Test_45e_Repeats_Nested_Alternatives", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45e_Repeats_Nested_Alternatives();
    });
    it("Test_45f_Repeats_InvalidEndings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45f_Repeats_InvalidEndings();
    });
    it("Test_45g_Repeats_NotEnded", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_45g_Repeats_NotEnded();
    });
    it("Test_46a_Barlines", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46a_Barlines();
    });
    it("Test_46b_MidmeasureBarline", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46b_MidmeasureBarline();
    });
    it("Test_46c_Midmeasure_Clef", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46c_Midmeasure_Clef();
    });
    it("Test_46d_PickupMeasure_ImplicitMeasures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46d_PickupMeasure_ImplicitMeasures();
    });
    it("Test_46e_PickupMeasure_SecondVoiceStartsLater", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46e_PickupMeasure_SecondVoiceStartsLater();
    });
    it("Test_46f_IncompleteMeasures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46f_IncompleteMeasures();
    });
    it("Test_46g_PickupMeasure_Chordnames_FiguredBass", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_46g_PickupMeasure_Chordnames_FiguredBass();
    });
    it("Test_51b_Header_Quotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_51b_Header_Quotes();
    });
    it("Test_51c_MultipleRights", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_51c_MultipleRights();
    });
    it("Test_51d_EmptyTitle", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_51d_EmptyTitle();
    });
    it("Test_52a_PageLayout", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_52a_PageLayout();
    });
    it("Test_52b_Breaks", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_52b_Breaks();
    });
    it("Test_61a_Lyrics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61a_Lyrics();
    });
    it("Test_61b_MultipleLyrics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61b_MultipleLyrics();
    });
    it("Test_61c_Lyrics_Pianostaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61c_Lyrics_Pianostaff();
    });
    it("Test_61d_Lyrics_Melisma", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61d_Lyrics_Melisma();
    });
    it("Test_61e_Lyrics_Chords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61e_Lyrics_Chords();
    });
    it("Test_61f_Lyrics_GracedNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61f_Lyrics_GracedNotes();
    });
    it("Test_61g_Lyrics_NameNumber", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61g_Lyrics_NameNumber();
    });
    it("Test_61h_Lyrics_BeamsMelismata", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61h_Lyrics_BeamsMelismata();
    });
    it("Test_61i_Lyrics_Chords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61i_Lyrics_Chords();
    });
    it("Test_61j_Lyrics_Elisions", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61j_Lyrics_Elisions();
    });
    it("Test_61k_Lyrics_SpannersExtenders", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_61k_Lyrics_SpannersExtenders();
    });
    it("Test_71a_Chordnames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_71a_Chordnames();
    });
    it("Test_71c_ChordsFrets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_71c_ChordsFrets();
    });
    it("Test_71d_ChordsFrets_Multistaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_71d_ChordsFrets_Multistaff();
    });
    it("Test_71e_TabStaves", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_71e_TabStaves();
    });
    it("Test_71f_AllChordTypes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_71f_AllChordTypes();
    });
    it("Test_71g_MultipleChordnames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_71g_MultipleChordnames();
    });
    it("Test_72a_TransposingInstruments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_72a_TransposingInstruments();
    });
    it("Test_72b_TransposingInstruments_Full", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_72b_TransposingInstruments_Full();
    });
    it("Test_72c_TransposingInstruments_Change", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_72c_TransposingInstruments_Change();
    });
    it("Test_73a_Percussion", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_73a_Percussion();
    });
    it("Test_74a_FiguredBass", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_74a_FiguredBass();
    });
    it("Test_75a_AccordionRegistrations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_75a_AccordionRegistrations();
    });
    it("Test_99a_Sibelius5_IgnoreBeaming", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_99a_Sibelius5_IgnoreBeaming();
    });
    it("Test_99b_Lyrics_BeamsMelismata_IgnoreBeams", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.Test_99b_Lyrics_BeamsMelismata_IgnoreBeams();
    });
});
describe("alphaTab.test.model.LyricsTest", function() {
    var __instance = new alphaTab.test.model.LyricsTest();
    it("TestApplySingleLineFirstBar", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestApplySingleLineFirstBar();
    });
    it("TestApplySingleLineBarOffset", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestApplySingleLineBarOffset();
    });
    it("TestApplyMultiLineFirstBar", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestApplyMultiLineFirstBar();
    });
    it("TestApplyMultiLineBarOffset", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestApplyMultiLineBarOffset();
    });
    it("TestSpaces", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestSpaces();
        done();
    });
    it("TestNewLines", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestNewLines();
        done();
    });
    it("TestDash", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestDash();
        done();
    });
    it("TestPlus", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestPlus();
        done();
    });
    it("TestComments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestComments();
        done();
    });
});
describe("alphaTab.test.model.TuningParserTest", function() {
    var __instance = new alphaTab.test.model.TuningParserTest();
    it("TestStandard", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.TestStandard();
        done();
    });
});
describe("alphaTab.test.xml.XmlParseTest", function() {
    var __instance = new alphaTab.test.xml.XmlParseTest();
    it("ParseSimple", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseSimple();
        done();
    });
    it("ParseShorthand", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseShorthand();
        done();
    });
    it("ParseSingleAttribute", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseSingleAttribute();
        done();
    });
    it("ParseMultipleAttributes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseMultipleAttributes();
        done();
    });
    it("ParseSimpleText", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseSimpleText();
        done();
    });
    it("ParseChild", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseChild();
        done();
    });
    it("ParseMultiChild", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseMultiChild();
        done();
    });
    it("ParseComments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseComments();
        done();
    });
    it("ParseDoctype", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseDoctype();
        done();
    });
    it("ParseXmlHeadTest", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseXmlHeadTest();
        done();
    });
    it("ParseFull", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ParseFull();
        done();
    });
});
// End of test registration
