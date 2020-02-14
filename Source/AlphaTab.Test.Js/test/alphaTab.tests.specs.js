/// <reference path="alphaTab.tests.js" />
describe("alphaTab.test.audio.AlphaSynthTests", function() {
    var __instance = new alphaTab.test.audio.AlphaSynthTests();
    it("testPcmGeneration", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testPcmGeneration();
    });
});
describe("alphaTab.test.audio.MidiFileGeneratorTest", function() {
    var __instance = new alphaTab.test.audio.MidiFileGeneratorTest();
    it("testFullSong", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFullSong();
    });
    it("testCorrectMidiOrder", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testCorrectMidiOrder();
        done();
    });
    it("testBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBend();
        done();
    });
    it("testGraceBeatGeneration", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGraceBeatGeneration();
    });
    it("testBendMultiPoint", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBendMultiPoint();
        done();
    });
    it("testTripletFeel", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTripletFeel();
        done();
    });
});
describe("alphaTab.test.audio.MidiPlaybackControllerTest", function() {
    var __instance = new alphaTab.test.audio.MidiPlaybackControllerTest();
    it("testRepeatClose", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRepeatClose();
    });
    it("testRepeatCloseMulti", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRepeatCloseMulti();
    });
    it("testRepeatCloseWithoutStartAtBeginning", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRepeatCloseWithoutStartAtBeginning();
    });
    it("testRepeatCloseAlternateEndings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRepeatCloseAlternateEndings();
    });
    it("testRepeatWithAlphaTex", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRepeatWithAlphaTex();
        done();
    });
});
describe("alphaTab.test.importer.AlphaTexImporterTest", function() {
    var __instance = new alphaTab.test.importer.AlphaTexImporterTest();
    it("ensureMetadataParsing_Issue73", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.ensureMetadataParsing_Issue73();
        done();
    });
    it("testTuning", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTuning();
        done();
    });
    it("deadNotes1_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.deadNotes1_Issue79();
        done();
    });
    it("deadNotes2_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.deadNotes2_Issue79();
        done();
    });
    it("trill_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.trill_Issue79();
        done();
    });
    it("tremolo_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.tremolo_Issue79();
        done();
    });
    it("tremoloPicking_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.tremoloPicking_Issue79();
        done();
    });
    it("hamonics_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.hamonics_Issue79();
        done();
    });
    it("hamonicsRenderingText_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.hamonicsRenderingText_Issue79();
        done();
    });
    it("grace_Issue79", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.grace_Issue79();
        done();
    });
    it("testLeftHandFingerSingleNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testLeftHandFingerSingleNote();
        done();
    });
    it("testRightHandFingerSingleNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRightHandFingerSingleNote();
        done();
    });
    it("testLeftHandFingerChord", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testLeftHandFingerChord();
        done();
    });
    it("testRightHandFingerChord", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRightHandFingerChord();
        done();
    });
    it("testUnstringed", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testUnstringed();
        done();
    });
    it("testMultiStaffDefaultSettings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiStaffDefaultSettings();
        done();
    });
    it("testMultiStaffDefaultSettingsBraces", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiStaffDefaultSettingsBraces();
        done();
    });
    it("testSingleStaffWithSetting", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSingleStaffWithSetting();
        done();
    });
    it("testMultiStaffWithSettings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiStaffWithSettings();
        done();
    });
    it("testMultiTrack", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiTrack();
        done();
    });
    it("testMultiTrackNames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiTrackNames();
        done();
    });
    it("testMultiTrackMultiStaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiTrackMultiStaff();
        done();
    });
    it("testMultiTrackMultiStaffInconsistentBars", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiTrackMultiStaffInconsistentBars();
        done();
    });
    it("testSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSlides();
        done();
    });
    it("testSection", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSection();
        done();
    });
    it("testPopSlapTap", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testPopSlapTap();
        done();
    });
    it("testTripletFeelNumeric", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTripletFeelNumeric();
        done();
    });
    it("testTripletFeelLongNames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTripletFeelLongNames();
        done();
    });
    it("testTripletFeelShortNames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTripletFeelShortNames();
        done();
    });
    it("testTripletFeelMultiBar", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTripletFeelMultiBar();
        done();
    });
    it("testTupletRepeat", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTupletRepeat();
        done();
    });
    it("testSimpleAnacrusis", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSimpleAnacrusis();
        done();
    });
    it("testMultiBarAnacrusis", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testMultiBarAnacrusis();
        done();
    });
    it("testRandomAnacrusis", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRandomAnacrusis();
        done();
    });
    it("testRepeat", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRepeat();
        done();
    });
    it("testDefaultTranspositionOnInstruments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDefaultTranspositionOnInstruments();
        done();
    });
    it("testDynamics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDynamics();
        done();
    });
});
describe("alphaTab.test.importer.Gp3ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp3ImporterTest();
    it("testScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testScoreInfo();
    });
    it("testNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNotes();
    });
    it("testTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTimeSignatures();
    });
    it("testDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDead();
    });
    it("testAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testAccentuation();
    });
    it("testGuitarPro3Harmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGuitarPro3Harmonics();
        done();
    });
    it("testHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHammer();
    });
    it("testBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBend();
    });
    it("testSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSlides();
    });
    it("testGuitarPro3Vibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGuitarPro3Vibrato();
    });
    it("testOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testOtherEffects();
    });
    it("testStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStroke();
    });
    it("testTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTuplets();
    });
    it("testRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRanges();
    });
    it("testEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testEffects();
    });
    it("testStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStrings();
    });
});
describe("alphaTab.test.importer.Gp4ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp4ImporterTest();
    it("testScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testScoreInfo();
    });
    it("testNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNotes();
    });
    it("testTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTimeSignatures();
    });
    it("testDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDead();
    });
    it("testGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGrace();
    });
    it("testAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testAccentuation();
    });
    it("testHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHarmonics();
    });
    it("testHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHammer();
    });
    it("testBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBend();
    });
    it("testTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTremolo();
    });
    it("testSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSlides();
    });
    it("testVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testVibrato();
    });
    it("testTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTrills();
    });
    it("testOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testOtherEffects();
    });
    it("testFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFingering();
    });
    it("testStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStroke();
    });
    it("testTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTuplets();
    });
    it("testRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRanges();
    });
    it("testEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testEffects();
    });
    it("testStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStrings();
    });
    it("testColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testColors();
    });
});
describe("alphaTab.test.importer.Gp5ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp5ImporterTest();
    it("testScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testScoreInfo();
    });
    it("testNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNotes();
    });
    it("testTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTimeSignatures();
    });
    it("testDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDead();
    });
    it("testGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGrace();
    });
    it("testAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testAccentuation();
    });
    it("testHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHarmonics();
    });
    it("testHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHammer();
    });
    it("testBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBend();
    });
    it("testTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTremolo();
    });
    it("testSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSlides();
    });
    it("testVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testVibrato();
    });
    it("testTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTrills();
    });
    it("testOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testOtherEffects();
    });
    it("testFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFingering();
    });
    it("testStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStroke();
    });
    it("testTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTuplets();
    });
    it("testRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRanges();
    });
    it("testEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testEffects();
    });
    it("testSerenade", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSerenade();
    });
    it("testStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStrings();
    });
    it("testKeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testKeySignatures();
    });
    it("testChords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testChords();
    });
    it("testColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testColors();
    });
    it("testCanon", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testCanon();
    });
});
describe("alphaTab.test.importer.Gp7ImporterTest", function() {
    var __instance = new alphaTab.test.importer.Gp7ImporterTest();
    it("testScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testScoreInfo();
    });
    it("testNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNotes();
    });
    it("testTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTimeSignatures();
    });
    it("testDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDead();
    });
    it("testGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGrace();
    });
    it("testAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testAccentuation();
    });
    it("testHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHarmonics();
    });
    it("testHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHammer();
    });
    it("testNumber", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNumber();
        done();
    });
    it("testBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBend();
    });
    it("testBendAdvanced", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBendAdvanced();
    });
    it("testWhammyAdvanced", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testWhammyAdvanced();
    });
    it("testTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTremolo();
    });
    it("testSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSlides();
    });
    it("testVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testVibrato();
    });
    it("testTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTrills();
    });
    it("testOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testOtherEffects();
    });
    it("testFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFingering();
    });
    it("testStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStroke();
    });
    it("testTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTuplets();
    });
    it("testRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRanges();
    });
    it("testEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testEffects();
    });
    it("testSerenade", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSerenade();
    });
    it("testStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStrings();
    });
    it("testKeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testKeySignatures();
    });
    it("testChords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testChords();
    });
    it("testColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testColors();
    });
    it("testTremoloVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTremoloVibrato();
    });
    it("testOttavia", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testOttavia();
    });
    it("testSimileMark", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSimileMark();
    });
    it("testAnacrusis", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testAnacrusis();
    });
    it("testFermata", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFermata();
    });
    it("testPickSlide", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testPickSlide();
    });
});
describe("alphaTab.test.importer.GpxImporterTest", function() {
    var __instance = new alphaTab.test.importer.GpxImporterTest();
    it("testFileSystemCompressed", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFileSystemCompressed();
    });
    it("testScoreInfo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testScoreInfo();
    });
    it("testNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNotes();
    });
    it("testTimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTimeSignatures();
    });
    it("testDead", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDead();
    });
    it("testGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testGrace();
    });
    it("testAccentuation", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testAccentuation();
    });
    it("testHarmonics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHarmonics();
    });
    it("testHammer", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testHammer();
    });
    it("testBend", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testBend();
    });
    it("testTremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTremolo();
    });
    it("testSlides", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSlides();
    });
    it("testVibrato", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testVibrato();
    });
    it("testTrills", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTrills();
    });
    it("testOtherEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testOtherEffects();
    });
    it("testFingering", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testFingering();
    });
    it("testStroke", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStroke();
    });
    it("testTuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testTuplets();
    });
    it("testRanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testRanges();
    });
    it("testEffects", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testEffects();
    });
    it("testSerenade", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSerenade();
    });
    it("testStrings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStrings();
    });
    it("testKeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testKeySignatures();
    });
    it("testChords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testChords();
    });
    it("testColors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testColors();
    });
});
describe("alphaTab.test.importer.MusicXmlImporterSamplesTests", function() {
    var __instance = new alphaTab.test.importer.MusicXmlImporterSamplesTests();
    it("test_BeetAnGeSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_BeetAnGeSample();
    });
    it("test_Binchois", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_Binchois();
    });
    it("test_BrahWiMeSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_BrahWiMeSample();
    });
    it("test_BrookeWestSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_BrookeWestSample();
    });
    it("test_Chant", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_Chant();
    });
    it("test_DebuMandSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_DebuMandSample();
    });
    it("test_Dichterliebe01", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_Dichterliebe01();
    });
    it("test_Echigo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_Echigo();
    });
    it("test_FaurReveSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_FaurReveSample();
    });
    it("test_MahlFaGe4Sample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_MahlFaGe4Sample();
    });
    it("test_MozaChloSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_MozaChloSample();
    });
    it("test_MozartPianoSonata", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_MozartPianoSonata();
    });
    it("test_MozartTrio", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_MozartTrio();
    });
    it("test_MozaVeilSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_MozaVeilSample();
    });
    it("test_Saltarello", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_Saltarello();
    });
    it("test_SchbAvMaSample", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_SchbAvMaSample();
    });
    it("test_Telemann", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_Telemann();
    });
});
describe("alphaTab.test.importer.MusicXmlImporterTestSuiteTests", function() {
    var __instance = new alphaTab.test.importer.MusicXmlImporterTestSuiteTests();
    it("test_01a_Pitches_Pitches", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_01a_Pitches_Pitches();
    });
    it("test_01b_Pitches_Intervals", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_01b_Pitches_Intervals();
    });
    it("test_01c_Pitches_NoVoiceElement", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_01c_Pitches_NoVoiceElement();
    });
    it("test_01d_Pitches_Microtones", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_01d_Pitches_Microtones();
    });
    it("test_01e_Pitches_ParenthesizedAccidentals", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_01e_Pitches_ParenthesizedAccidentals();
    });
    it("test_01f_Pitches_ParenthesizedMicrotoneAccidentals", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_01f_Pitches_ParenthesizedMicrotoneAccidentals();
    });
    it("test_02a_Rests_Durations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_02a_Rests_Durations();
    });
    it("test_02b_Rests_PitchedRests", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_02b_Rests_PitchedRests();
    });
    it("test_02c_Rests_MultiMeasureRests", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_02c_Rests_MultiMeasureRests();
    });
    it("test_02d_Rests_Multimeasure_TimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_02d_Rests_Multimeasure_TimeSignatures();
    });
    it("test_02e_Rests_NoType", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_02e_Rests_NoType();
    });
    it("test_03a_Rhythm_Durations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_03a_Rhythm_Durations();
    });
    it("test_03b_Rhythm_Backup", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_03b_Rhythm_Backup();
    });
    it("test_03c_Rhythm_DivisionChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_03c_Rhythm_DivisionChange();
    });
    it("test_03d_Rhythm_DottedDurations_Factors", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_03d_Rhythm_DottedDurations_Factors();
    });
    it("test_11a_TimeSignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11a_TimeSignatures();
    });
    it("test_11b_TimeSignatures_NoTime", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11b_TimeSignatures_NoTime();
    });
    it("test_11c_TimeSignatures_CompoundSimple", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11c_TimeSignatures_CompoundSimple();
    });
    it("test_11d_TimeSignatures_CompoundMultiple", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11d_TimeSignatures_CompoundMultiple();
    });
    it("test_11e_TimeSignatures_CompoundMixed", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11e_TimeSignatures_CompoundMixed();
    });
    it("test_11f_TimeSignatures_SymbolMeaning", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11f_TimeSignatures_SymbolMeaning();
    });
    it("test_11g_TimeSignatures_SingleNumber", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11g_TimeSignatures_SingleNumber();
    });
    it("test_11h_TimeSignatures_SenzaMisura", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_11h_TimeSignatures_SenzaMisura();
    });
    it("test_12a_Clefs", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_12a_Clefs();
    });
    it("test_12b_Clefs_NoKeyOrClef", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_12b_Clefs_NoKeyOrClef();
    });
    it("test_13a_KeySignatures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_13a_KeySignatures();
    });
    it("test_13b_KeySignatures_ChurchModes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_13b_KeySignatures_ChurchModes();
    });
    it("test_13c_KeySignatures_NonTraditional", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_13c_KeySignatures_NonTraditional();
    });
    it("test_13d_KeySignatures_Microtones", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_13d_KeySignatures_Microtones();
    });
    it("test_14a_StaffDetails_LineChanges", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_14a_StaffDetails_LineChanges();
    });
    it("test_21a_Chord_Basic", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_21a_Chord_Basic();
    });
    it("test_21b_Chords_TwoNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_21b_Chords_TwoNotes();
    });
    it("test_21c_Chords_ThreeNotesDuration", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_21c_Chords_ThreeNotesDuration();
    });
    it("test_21d_Chords_SchubertStabatMater", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_21d_Chords_SchubertStabatMater();
    });
    it("test_21e_Chords_PickupMeasures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_21e_Chords_PickupMeasures();
    });
    it("test_21f_Chord_ElementInBetween", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_21f_Chord_ElementInBetween();
    });
    it("test_22a_Noteheads", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_22a_Noteheads();
    });
    it("test_22b_Staff_Notestyles", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_22b_Staff_Notestyles();
    });
    it("test_22c_Noteheads_Chords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_22c_Noteheads_Chords();
    });
    it("test_22d_Parenthesized_Noteheads", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_22d_Parenthesized_Noteheads();
    });
    it("test_23a_Tuplets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_23a_Tuplets();
    });
    it("test_23b_Tuplets_Styles", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_23b_Tuplets_Styles();
    });
    it("test_23c_Tuplet_Display_NonStandard", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_23c_Tuplet_Display_NonStandard();
    });
    it("test_23d_Tuplets_Nested", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_23d_Tuplets_Nested();
    });
    it("test_23e_Tuplets_Tremolo", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_23e_Tuplets_Tremolo();
    });
    it("test_23f_Tuplets_DurationButNoBracket", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_23f_Tuplets_DurationButNoBracket();
    });
    it("test_24a_GraceNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_24a_GraceNotes();
    });
    it("test_24b_ChordAsGraceNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_24b_ChordAsGraceNote();
    });
    it("test_24c_GraceNote_MeasureEnd", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_24c_GraceNote_MeasureEnd();
    });
    it("test_24d_AfterGrace", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_24d_AfterGrace();
    });
    it("test_24e_GraceNote_StaffChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_24e_GraceNote_StaffChange();
    });
    it("test_24f_GraceNote_Slur", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_24f_GraceNote_Slur();
    });
    it("test_31a_Directions", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_31a_Directions();
    });
    it("test_31c_MetronomeMarks", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_31c_MetronomeMarks();
    });
    it("test_32a_Notations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_32a_Notations();
    });
    it("test_32b_Articulations_Texts", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_32b_Articulations_Texts();
    });
    it("test_32c_MultipleNotationChildren", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_32c_MultipleNotationChildren();
    });
    it("test_32d_Arpeggio", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_32d_Arpeggio();
    });
    it("test_33a_Spanners", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33a_Spanners();
    });
    it("test_33b_Spanners_Tie", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33b_Spanners_Tie();
    });
    it("test_33c_Spanners_Slurs", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33c_Spanners_Slurs();
    });
    it("test_33d_Spanners_OctaveShifts", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33d_Spanners_OctaveShifts();
    });
    it("test_33e_Spanners_OctaveShifts_InvalidSize", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33e_Spanners_OctaveShifts_InvalidSize();
    });
    it("test_33f_Trill_EndingOnGraceNote", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33f_Trill_EndingOnGraceNote();
    });
    it("test_33g_Slur_ChordedNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33g_Slur_ChordedNotes();
    });
    it("test_33h_Spanners_Glissando", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33h_Spanners_Glissando();
    });
    it("test_33i_Ties_NotEnded", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_33i_Ties_NotEnded();
    });
    it("test_41a_MultiParts_Partorder", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41a_MultiParts_Partorder();
    });
    it("test_41b_MultiParts_MoreThan10", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41b_MultiParts_MoreThan10();
    });
    it("test_41c_StaffGroups", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41c_StaffGroups();
    });
    it("test_41d_StaffGroups_Nested", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41d_StaffGroups_Nested();
    });
    it("test_41e_StaffGroups_InstrumentNames_Linebroken", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41e_StaffGroups_InstrumentNames_Linebroken();
    });
    it("test_41f_StaffGroups_Overlapping", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41f_StaffGroups_Overlapping();
    });
    it("test_41g_PartNoId", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41g_PartNoId();
    });
    it("test_41h_TooManyParts", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41h_TooManyParts();
    });
    it("test_41i_PartNameDisplay_Override", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_41i_PartNameDisplay_Override();
    });
    it("test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics();
    });
    it("test_42b_MultiVoice_MidMeasureClefChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_42b_MultiVoice_MidMeasureClefChange();
    });
    it("test_43a_PianoStaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_43a_PianoStaff();
    });
    it("test_43b_MultiStaff_DifferentKeys", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_43b_MultiStaff_DifferentKeys();
    });
    it("test_43c_MultiStaff_DifferentKeysAfterBackup", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_43c_MultiStaff_DifferentKeysAfterBackup();
    });
    it("test_43d_MultiStaff_StaffChange", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_43d_MultiStaff_StaffChange();
    });
    it("test_43e_Multistaff_ClefDynamics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_43e_Multistaff_ClefDynamics();
    });
    it("test_45a_SimpleRepeat", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45a_SimpleRepeat();
    });
    it("test_45b_RepeatWithAlternatives", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45b_RepeatWithAlternatives();
    });
    it("test_45c_RepeatMultipleTimes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45c_RepeatMultipleTimes();
    });
    it("test_45d_Repeats_Nested_Alternatives", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45d_Repeats_Nested_Alternatives();
    });
    it("test_45e_Repeats_Nested_Alternatives", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45e_Repeats_Nested_Alternatives();
    });
    it("test_45f_Repeats_InvalidEndings", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45f_Repeats_InvalidEndings();
    });
    it("test_45g_Repeats_NotEnded", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_45g_Repeats_NotEnded();
    });
    it("test_46a_Barlines", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46a_Barlines();
    });
    it("test_46b_MidmeasureBarline", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46b_MidmeasureBarline();
    });
    it("test_46c_Midmeasure_Clef", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46c_Midmeasure_Clef();
    });
    it("test_46d_PickupMeasure_ImplicitMeasures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46d_PickupMeasure_ImplicitMeasures();
    });
    it("test_46e_PickupMeasure_SecondVoiceStartsLater", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46e_PickupMeasure_SecondVoiceStartsLater();
    });
    it("test_46f_IncompleteMeasures", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46f_IncompleteMeasures();
    });
    it("test_46g_PickupMeasure_Chordnames_FiguredBass", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_46g_PickupMeasure_Chordnames_FiguredBass();
    });
    it("test_51b_Header_Quotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_51b_Header_Quotes();
    });
    it("test_51c_MultipleRights", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_51c_MultipleRights();
    });
    it("test_51d_EmptyTitle", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_51d_EmptyTitle();
    });
    it("test_52a_PageLayout", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_52a_PageLayout();
    });
    it("test_52b_Breaks", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_52b_Breaks();
    });
    it("test_61a_Lyrics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61a_Lyrics();
    });
    it("test_61b_MultipleLyrics", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61b_MultipleLyrics();
    });
    it("test_61c_Lyrics_Pianostaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61c_Lyrics_Pianostaff();
    });
    it("test_61d_Lyrics_Melisma", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61d_Lyrics_Melisma();
    });
    it("test_61e_Lyrics_Chords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61e_Lyrics_Chords();
    });
    it("test_61f_Lyrics_GracedNotes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61f_Lyrics_GracedNotes();
    });
    it("test_61g_Lyrics_NameNumber", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61g_Lyrics_NameNumber();
    });
    it("test_61h_Lyrics_BeamsMelismata", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61h_Lyrics_BeamsMelismata();
    });
    it("test_61i_Lyrics_Chords", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61i_Lyrics_Chords();
    });
    it("test_61j_Lyrics_Elisions", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61j_Lyrics_Elisions();
    });
    it("test_61k_Lyrics_SpannersExtenders", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_61k_Lyrics_SpannersExtenders();
    });
    it("test_71a_Chordnames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_71a_Chordnames();
    });
    it("test_71c_ChordsFrets", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_71c_ChordsFrets();
    });
    it("test_71d_ChordsFrets_Multistaff", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_71d_ChordsFrets_Multistaff();
    });
    it("test_71e_TabStaves", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_71e_TabStaves();
    });
    it("test_71f_AllChordTypes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_71f_AllChordTypes();
    });
    it("test_71g_MultipleChordnames", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_71g_MultipleChordnames();
    });
    it("test_72a_TransposingInstruments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_72a_TransposingInstruments();
    });
    it("test_72b_TransposingInstruments_Full", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_72b_TransposingInstruments_Full();
    });
    it("test_72c_TransposingInstruments_Change", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_72c_TransposingInstruments_Change();
    });
    it("test_73a_Percussion", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_73a_Percussion();
    });
    it("test_74a_FiguredBass", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_74a_FiguredBass();
    });
    it("test_75a_AccordionRegistrations", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_75a_AccordionRegistrations();
    });
    it("test_99a_Sibelius5_IgnoreBeaming", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_99a_Sibelius5_IgnoreBeaming();
    });
    it("test_99b_Lyrics_BeamsMelismata_IgnoreBeams", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.test_99b_Lyrics_BeamsMelismata_IgnoreBeams();
    });
});
describe("alphaTab.test.model.LyricsTest", function() {
    var __instance = new alphaTab.test.model.LyricsTest();
    it("testApplySingleLineFirstBar", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testApplySingleLineFirstBar();
    });
    it("testApplySingleLineBarOffset", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testApplySingleLineBarOffset();
    });
    it("testApplyMultiLineFirstBar", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testApplyMultiLineFirstBar();
    });
    it("testApplyMultiLineBarOffset", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testApplyMultiLineBarOffset();
    });
    it("testSpaces", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testSpaces();
        done();
    });
    it("testNewLines", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testNewLines();
        done();
    });
    it("testDash", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testDash();
        done();
    });
    it("testPlus", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testPlus();
        done();
    });
    it("testComments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testComments();
        done();
    });
});
describe("alphaTab.test.model.TuningParserTest", function() {
    var __instance = new alphaTab.test.model.TuningParserTest();
    it("testStandard", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.testStandard();
        done();
    });
});
describe("alphaTab.test.xml.XmlParseTest", function() {
    var __instance = new alphaTab.test.xml.XmlParseTest();
    it("parseSimple", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseSimple();
        done();
    });
    it("parseShorthand", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseShorthand();
        done();
    });
    it("parseSingleAttribute", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseSingleAttribute();
        done();
    });
    it("parseMultipleAttributes", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseMultipleAttributes();
        done();
    });
    it("parseSimpleText", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseSimpleText();
        done();
    });
    it("parseChild", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseChild();
        done();
    });
    it("parseMultiChild", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseMultiChild();
        done();
    });
    it("parseComments", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseComments();
        done();
    });
    it("parseDoctype", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseDoctype();
        done();
    });
    it("parseXmlHeadTest", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseXmlHeadTest();
        done();
    });
    it("parseFull", function(done) {
        alphaTab.test.TestPlatform.Done = done;
        __instance.parseFull();
        done();
    });
});
// End of test registration
