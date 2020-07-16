import { MusicXmlImporterTestHelper } from '@test/importer/MusicXmlImporterTestHelper';

describe('MusicXmlImporterTestSuiteTests', () => {
    it('01a_Pitches_Pitches', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/01a-Pitches-Pitches.xml');
    });

    it('01b_Pitches_Intervals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/01b-Pitches-Intervals.xml');
    });

    it('01c_Pitches_NoVoiceElement', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/01c-Pitches-NoVoiceElement.xml'
        );
    });

    it('01d_Pitches_Microtones', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/01d-Pitches-Microtones.xml');
    });

    it('01e_Pitches_ParenthesizedAccidentals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/01e-Pitches-ParenthesizedAccidentals.xml'
        );
    });

    it('01f_Pitches_ParenthesizedMicrotoneAccidentals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/01f-Pitches-ParenthesizedMicrotoneAccidentals.xml'
        );
    });

    it('02a_Rests_Durations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/02a-Rests-Durations.xml');
    });

    it('02b_Rests_PitchedRests', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/02b-Rests-PitchedRests.xml');
    });

    it('02c_Rests_MultiMeasureRests', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/02c-Rests-MultiMeasureRests.xml'
        );
    });

    it('02d_Rests_Multimeasure_TimeSignatures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/02d-Rests-Multimeasure-TimeSignatures.xml'
        );
    });

    it('02e_Rests_NoType', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/02e-Rests-NoType.xml');
    });

    it('03a_Rhythm_Durations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03a-Rhythm-Durations.xml');
    });

    it('03b_Rhythm_Backup', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03b-Rhythm-Backup.xml');
    });

    it('03c_Rhythm_DivisionChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03c-Rhythm-DivisionChange.xml');
    });

    it('03d_Rhythm_DottedDurations_Factors', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/03d-Rhythm-DottedDurations-Factors.xml'
        );
    });

    it('11a_TimeSignatures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/11a-TimeSignatures.xml');
    });

    it('11b_TimeSignatures_NoTime', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/11b-TimeSignatures-NoTime.xml');
    });

    it('11c_TimeSignatures_CompoundSimple', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11c-TimeSignatures-CompoundSimple.xml'
        );
    });

    it('11d_TimeSignatures_CompoundMultiple', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11d-TimeSignatures-CompoundMultiple.xml'
        );
    });

    it('11e_TimeSignatures_CompoundMixed', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11e-TimeSignatures-CompoundMixed.xml'
        );
    });

    it('11f_TimeSignatures_SymbolMeaning', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11f-TimeSignatures-SymbolMeaning.xml'
        );
    });

    it('11g_TimeSignatures_SingleNumber', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11g-TimeSignatures-SingleNumber.xml'
        );
    });

    it('11h_TimeSignatures_SenzaMisura', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11h-TimeSignatures-SenzaMisura.xml'
        );
    });

    it('12a_Clefs', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/12a-Clefs.xml');
    });

    it('12b_Clefs_NoKeyOrClef', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/12b-Clefs-NoKeyOrClef.xml');
    });

    it('13a_KeySignatures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/13a-KeySignatures.xml');
    });

    it('13b_KeySignatures_ChurchModes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13b-KeySignatures-ChurchModes.xml'
        );
    });

    it('13c_KeySignatures_NonTraditional', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13c-KeySignatures-NonTraditional.xml'
        );
    });

    it('13d_KeySignatures_Microtones', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13d-KeySignatures-Microtones.xml'
        );
    });

    it('14a_StaffDetails_LineChanges', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/14a-StaffDetails-LineChanges.xml'
        );
    });

    it('21a_Chord_Basic', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21a-Chord-Basic.xml');
    });

    it('21b_Chords_TwoNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21b-Chords-TwoNotes.xml');
    });

    it('21c_Chords_ThreeNotesDuration', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21c-Chords-ThreeNotesDuration.xml'
        );
    });

    it('21d_Chords_SchubertStabatMater', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21d-Chords-SchubertStabatMater.xml'
        );
    });

    it('21e_Chords_PickupMeasures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21e-Chords-PickupMeasures.xml');
    });

    it('21f_Chord_ElementInBetween', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21f-Chord-ElementInBetween.xml'
        );
    });

    it('22a_Noteheads', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/22a-Noteheads.xml');
    });

    it('22b_Staff_Notestyles', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/22b-Staff-Notestyles.xml');
    });

    it('22c_Noteheads_Chords', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/22c-Noteheads-Chords.xml');
    });

    it('22d_Parenthesized_Noteheads', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/22d-Parenthesized-Noteheads.xml'
        );
    });

    it('23a_Tuplets', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23a-Tuplets.xml');
    });

    it('23b_Tuplets_Styles', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23b-Tuplets-Styles.xml');
    });

    it('23c_Tuplet_Display_NonStandard', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/23c-Tuplet-Display-NonStandard.xml'
        );
    });

    it('23d_Tuplets_Nested', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23d-Tuplets-Nested.xml');
    });

    it('23e_Tuplets_Tremolo', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23e-Tuplets-Tremolo.xml');
    });

    it('23f_Tuplets_DurationButNoBracket', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/23f-Tuplets-DurationButNoBracket.xml'
        );
    });

    it('24a_GraceNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24a-GraceNotes.xml');
    });

    it('24b_ChordAsGraceNote', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24b-ChordAsGraceNote.xml');
    });

    it('24c_GraceNote_MeasureEnd', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24c-GraceNote-MeasureEnd.xml');
    });

    it('24d_AfterGrace', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24d-AfterGrace.xml');
    });

    it('24e_GraceNote_StaffChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24e-GraceNote-StaffChange.xml');
    });

    it('24f_GraceNote_Slur', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24f-GraceNote-Slur.xml');
    });

    it('31a_Directions', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/31a-Directions.xml');
    });

    it('31c_MetronomeMarks', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/31c-MetronomeMarks.xml');
    });

    it('32a_Notations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/32a-Notations.xml');
    });

    it('32b_Articulations_Texts', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/32b-Articulations-Texts.xml');
    });

    it('32c_MultipleNotationChildren', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/32c-MultipleNotationChildren.xml'
        );
    });

    it('32d_Arpeggio', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/32d-Arpeggio.xml');
    });

    it('33a_Spanners', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33a-Spanners.xml');
    });

    it('33b_Spanners_Tie', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33b-Spanners-Tie.xml');
    });

    it('33c_Spanners_Slurs', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33c-Spanners-Slurs.xml');
    });

    it('33d_Spanners_OctaveShifts', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33d-Spanners-OctaveShifts.xml');
    });

    it('33e_Spanners_OctaveShifts_InvalidSize', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/33e-Spanners-OctaveShifts-InvalidSize.xml'
        );
    });

    it('33f_Trill_EndingOnGraceNote', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/33f-Trill-EndingOnGraceNote.xml'
        );
    });

    it('33g_Slur_ChordedNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33g-Slur-ChordedNotes.xml');
    });

    it('33h_Spanners_Glissando', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33h-Spanners-Glissando.xml');
    });

    it('33i_Ties_NotEnded', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33i-Ties-NotEnded.xml');
    });

    it('41a_MultiParts_Partorder', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41a-MultiParts-Partorder.xml');
    });

    it('41b_MultiParts_MoreThan10', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41b-MultiParts-MoreThan10.xml');
    });

    it('41c_StaffGroups', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41c-StaffGroups.xml');
    });

    it('41d_StaffGroups_Nested', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41d-StaffGroups-Nested.xml');
    });

    it('41e_StaffGroups_InstrumentNames_Linebroken', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41e-StaffGroups-InstrumentNames-Linebroken.xml'
        );
    });

    it('41f_StaffGroups_Overlapping', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41f-StaffGroups-Overlapping.xml'
        );
    });

    it('41g_PartNoId', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41g-PartNoId.xml');
    });

    it('41h_TooManyParts', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41h-TooManyParts.xml');
    });

    it('41i_PartNameDisplay_Override', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41i-PartNameDisplay-Override.xml'
        );
    });

    it('42a_MultiVoice_TwoVoicesOnStaff_Lyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/42a-MultiVoice-TwoVoicesOnStaff-Lyrics.xml'
        );
    });

    it('42b_MultiVoice_MidMeasureClefChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/42b-MultiVoice-MidMeasureClefChange.xml'
        );
    });

    it('43a_PianoStaff', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/43a-PianoStaff.xml');
    });

    it('43b_MultiStaff_DifferentKeys', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43b-MultiStaff-DifferentKeys.xml'
        );
    });

    it('43c_MultiStaff_DifferentKeysAfterBackup', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43c-MultiStaff-DifferentKeysAfterBackup.xml'
        );
    });

    it('43d_MultiStaff_StaffChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43d-MultiStaff-StaffChange.xml'
        );
    });

    it('43e_Multistaff_ClefDynamics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43e-Multistaff-ClefDynamics.xml'
        );
    });

    it('45a_SimpleRepeat', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45a-SimpleRepeat.xml');
    });

    it('45b_RepeatWithAlternatives', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45b-RepeatWithAlternatives.xml'
        );
    });

    it('45c_RepeatMultipleTimes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45c-RepeatMultipleTimes.xml');
    });

    it('45d_Repeats_Nested_Alternatives', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45d-Repeats-Nested-Alternatives.xml'
        );
    });

    it('45e_Repeats_Nested_Alternatives', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45e-Repeats-Nested-Alternatives.xml'
        );
    });

    it('45f_Repeats_InvalidEndings', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45f-Repeats-InvalidEndings.xml'
        );
    });

    it('45g_Repeats_NotEnded', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45g-Repeats-NotEnded.xml');
    });

    it('46a_Barlines', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46a-Barlines.xml');
    });

    it('46b_MidmeasureBarline', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46b-MidmeasureBarline.xml');
    });

    it('46c_Midmeasure_Clef', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46c-Midmeasure-Clef.xml');
    });

    it('46d_PickupMeasure_ImplicitMeasures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/46d-PickupMeasure-ImplicitMeasures.xml'
        );
    });

    it('46e_PickupMeasure_SecondVoiceStartsLater', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/46e-PickupMeasure-SecondVoiceStartsLater.xml'
        );
    });

    it('46f_IncompleteMeasures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46f-IncompleteMeasures.xml');
    });

    it('46g_PickupMeasure_Chordnames_FiguredBass', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/46g-PickupMeasure-Chordnames-FiguredBass.xml'
        );
    });

    it('51b_Header_Quotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/51b-Header-Quotes.xml');
    });

    it('51c_MultipleRights', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/51c-MultipleRights.xml');
    });

    it('51d_EmptyTitle', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/51d-EmptyTitle.xml');
    });

    it('52a_PageLayout', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/52a-PageLayout.xml');
    });

    it('52b_Breaks', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/52b-Breaks.xml');
    });

    it('61a_Lyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61a-Lyrics.xml');
    });

    it('61b_MultipleLyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61b-MultipleLyrics.xml');
    });

    it('61c_Lyrics_Pianostaff', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61c-Lyrics-Pianostaff.xml');
    });

    it('61d_Lyrics_Melisma', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61d-Lyrics-Melisma.xml');
    });

    it('61e_Lyrics_Chords', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61e-Lyrics-Chords.xml');
    });

    it('61f_Lyrics_GracedNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61f-Lyrics-GracedNotes.xml');
    });

    it('61g_Lyrics_NameNumber', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61g-Lyrics-NameNumber.xml');
    });

    it('61h_Lyrics_BeamsMelismata', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61h-Lyrics-BeamsMelismata.xml');
    });

    it('61i_Lyrics_Chords', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61i-Lyrics-Chords.xml');
    });

    it('61j_Lyrics_Elisions', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61j-Lyrics-Elisions.xml');
    });

    it('61k_Lyrics_SpannersExtenders', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/61k-Lyrics-SpannersExtenders.xml'
        );
    });

    it('71a_Chordnames', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71a-Chordnames.xml');
    });

    it('71c_ChordsFrets', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71c-ChordsFrets.xml');
    });

    it('71d_ChordsFrets_Multistaff', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/71d-ChordsFrets-Multistaff.xml'
        );
    });

    it('71e_TabStaves', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71e-TabStaves.xml');
    });

    it('71f_AllChordTypes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71f-AllChordTypes.xml');
    });

    it('71g_MultipleChordnames', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71g-MultipleChordnames.xml');
    });

    it('72a_TransposingInstruments', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/72a-TransposingInstruments.xml'
        );
    });

    it('72b_TransposingInstruments_Full', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/72b-TransposingInstruments-Full.xml'
        );
    });

    it('72c_TransposingInstruments_Change', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/72c-TransposingInstruments-Change.xml'
        );
    });

    it('73a_Percussion', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/73a-Percussion.xml');
    });

    it('74a_FiguredBass', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/74a-FiguredBass.xml');
    });

    it('75a_AccordionRegistrations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/75a-AccordionRegistrations.xml'
        );
    });

    it('99a_Sibelius5_IgnoreBeaming', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/99a-Sibelius5-IgnoreBeaming.xml'
        );
    });

    it('99b_Lyrics_BeamsMelismata_IgnoreBeams', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/99b-Lyrics-BeamsMelismata-IgnoreBeams.xml'
        );
    });
});
