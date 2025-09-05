import { MusicXmlImporterTestHelper } from '@test/importer/MusicXmlImporterTestHelper';

describe('MusicXmlImporterTestSuiteTests', () => {
    it('01a-Pitches-Pitches', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/01a-Pitches-Pitches.xml');
        // Forcing accidentals doesn't exist 100% in alphatab, its rather: "try to adjust the note to this accidental"
        // once we have really forced accidentals (even if repeated or not needed) this will slightly change.
    });

    it('01b-Pitches-Intervals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/01b-Pitches-Intervals.xml');
    });

    it('01c-Pitches-NoVoiceElement', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/01c-Pitches-NoVoiceElement.xml'
        );
    });

    it('01d-Pitches-Microtones', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/01d-Pitches-Microtones.xml');
        // not supported
    });

    it('01e-Pitches-ParenthesizedAccidentals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/01e-Pitches-ParenthesizedAccidentals.xml'
        );
        // not supported
    });

    it('01f-Pitches-ParenthesizedMicrotoneAccidentals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/01f-Pitches-ParenthesizedMicrotoneAccidentals.xml'
        );
        // not supported
    });

    it('02a-Rests-Durations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/02a-Rests-Durations.xml');
        // Multibar rests are automatic, no support for individual bars forcing it.
    });

    it('02b-Rests-PitchedRests', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/02b-Rests-PitchedRests.xml');
        // not supported
    });

    it('02c-Rests-MultiMeasureRests', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/02c-Rests-MultiMeasureRests.xml'
        );
        // not supported
    });

    it('02d-Rests-Multimeasure-TimeSignatures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/02d-Rests-Multimeasure-TimeSignatures.xml'
        );
        // not supported
    });

    it('02e-Rests-NoType', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/02e-Rests-NoType.xml');
    });

    it('03a-Rhythm-Durations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03a-Rhythm-Durations.xml');
    });

    it('03b-Rhythm-Backup', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03b-Rhythm-Backup.xml');
    });

    it('03c-Rhythm-DivisionChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/03c-Rhythm-DivisionChange.xml'
        );
    });

    it('03d-Rhythm-DottedDurations-Factors', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/03d-Rhythm-DottedDurations-Factors.xml'
        );
    });

    it('03e-Rhythm-No-Divisions', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03e-Rhythm-No-Divisions.xml');
    });

    it('03f-Rhythm-Forward', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/03f-Rhythm-Forward.xml');
    });

    it('11a-TimeSignatures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/11a-TimeSignatures.xml');
    });

    it('11b-TimeSignatures-NoTime', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11b-TimeSignatures-NoTime.xml'
        );
        // hiding of time signatures not supported
    });

    it('11c-TimeSignatures-CompoundSimple', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11c-TimeSignatures-CompoundSimple.xml'
        );
        // compound not supported, but we show the summed values
    });

    it('11d-TimeSignatures-CompoundMultiple', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11d-TimeSignatures-CompoundMultiple.xml'
        );
        // multiple time signatures not supported, initial one is shown as summed valued.
    });

    it('11e-TimeSignatures-CompoundMixed', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11e-TimeSignatures-CompoundMixed.xml'
        );
        // multiple time signatures not supported, initial one is shown as summed valued.
    });

    it('11f-TimeSignatures-SymbolMeaning', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11f-TimeSignatures-SymbolMeaning.xml'
        );
        // unclear expectation
    });

    it('11g-TimeSignatures-SingleNumber', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11g-TimeSignatures-SingleNumber.xml'
        );
        // single number time signature not supported
    });

    it('11h-TimeSignatures-SenzaMisura', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/11h-TimeSignatures-SenzaMisura.xml'
        );
        // not supported
    });

    it('12a-Clefs', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/12a-Clefs.xml');
        // mid-bar clef changes not supported
        // there are also some clef variations we don't support.
    });

    it('12b-Clefs-NoKeyOrClef', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/12b-Clefs-NoKeyOrClef.xml');
    });

    it('13a-KeySignatures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/13a-KeySignatures.xml');
        // only classical key signatures (no double flat, double sharp)
        // repeating time signatures hidden, no option to force display yet
    });

    it('13b-KeySignatures-ChurchModes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13b-KeySignatures-ChurchModes.xml'
        );
        // no mid-bar key signature changes.
    });

    it('13c-KeySignatures-NonTraditional', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13c-KeySignatures-NonTraditional.xml'
        );
        // not supported.
    });

    it('13d-KeySignatures-Microtones', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13d-KeySignatures-Microtones.xml'
        );
        // not supported.
    });

    it('13e-KeySignatures-Cancel', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/13e-KeySignatures-Cancel.xml');
        // not supported to force show cancellation
    });

    it('13f-KeySignatures-Visible', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/13f-KeySignatures-Visible.xml'
        );
        // not supported
    });

    it('14a-StaffDetails-LineChanges', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/14a-StaffDetails-LineChanges.xml'
        );
        // not supported.
    });

    it('21a-Chord-Basic', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21a-Chord-Basic.xml');
    });

    it('21b-Chords-TwoNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21b-Chords-TwoNotes.xml');
    });

    it('21c-Chords-ThreeNotesDuration', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21c-Chords-ThreeNotesDuration.xml'
        );
    });

    it('21d-Chords-SchubertStabatMater', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21d-Chords-SchubertStabatMater.xml'
        );
        // fp dynamics not yet supported
    });

    it('21e-Chords-PickupMeasures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21e-Chords-PickupMeasures.xml'
        );
    });

    it('21f-Chord-ElementInBetween', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/21f-Chord-ElementInBetween.xml'
        );
        // mid-bar segno not supported
    });

    it('21g-Chords-Tremolos', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21g-Chords-Tremolos.xml');
        // 4 bar tremolo (not supported)
    });

    it('21h-Chord-Accidentals', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/21h-Chord-Accidentals.xml');
        // natural not shown as not needed (forcing to show not available yet)
        // brackets and braces on accidentals not supported
    });

    it('22a-Noteheads', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/22a-Noteheads.xml');
        // some slight stem alignment problems as we do not respect note head position yet
        // part of https://github.com/CoderLine/alphaTab/issues/1949
    });

    it('22b-Staff-Notestyles', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/22b-Staff-Notestyles.xml');
        // hiding stem not supported
        // hiding staff line not supported
    });

    it('22c-Noteheads-Chords', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/22c-Noteheads-Chords.xml');
    });

    it('22d-Parenthesized-Noteheads', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/22d-Parenthesized-Noteheads.xml'
        );
    });

    it('23a-Tuplets', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23a-Tuplets.xml');
        // number is sometimes n:m
    });

    it('23b-Tuplets-Styles', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23b-Tuplets-Styles.xml');
        // not supported
    });

    it('23c-Tuplet-Display-NonStandard', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/23c-Tuplet-Display-NonStandard.xml'
        );
        // customizing display not supported
    });

    it('23d-Tuplets-Nested', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23d-Tuplets-Nested.xml');
        // not supported
    });

    it('23e-Tuplets-Tremolo', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/23e-Tuplets-Tremolo.xml');
    });

    it('23f-Tuplets-DurationButNoBracket', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/23f-Tuplets-DurationButNoBracket.xml'
        );
        // not supported
    });

    it('24a-GraceNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24a-GraceNotes.xml');
        // not all styles are correct
    });

    it('24b-ChordAsGraceNote', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24b-ChordAsGraceNote.xml');
    });

    it('24c-GraceNote-MeasureEnd', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24c-GraceNote-MeasureEnd.xml');
    });

    it('24d-AfterGrace', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24d-AfterGrace.xml');
    });

    it('24e-GraceNote-StaffChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/24e-GraceNote-StaffChange.xml'
        );
    });

    it('24f-GraceNote-Slur', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24f-GraceNote-Slur.xml');
    });

    it('24g-GraceNote-Dynamics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/24g-GraceNote-Dynamics.xml');
    });

    it('24h-GraceNote-Simultaneous', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/24h-GraceNote-Simultaneous.xml'
        );
    });

    it('31a-Directions', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/31a-Directions.xml');
        // many directions not supported yet.
    });

    it('31b-Directions-Order', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/31b-Directions-Order.xml');
        // not supported
    });

    it('31c-MetronomeMarks', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/31c-MetronomeMarks.xml');
        // only classical BPM tempo changes supported (no dots, brackets or combined annotations)
    });

    it('31d-Directions-Compounds', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/31d-Directions-Compounds.xml');
    });

    it('32a-Notations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/32a-Notations.xml');
        // various annotations not supported, the ones we support seem fine
    });

    it('32b-Articulations-Texts', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/32b-Articulations-Texts.xml');
        // no formatted text support
    });

    it('32c-MultipleNotationChildren', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/32c-MultipleNotationChildren.xml'
        );
    });

    it('32d-Arpeggio', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/32d-Arpeggio.xml');
        // no partial or brackets.
    });

    it('33a-Spanners', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33a-Spanners.xml');
        // no general spanners
        // pedal only with text
    });

    it('33b-Spanners-Tie', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33b-Spanners-Tie.xml');
        // only automatic placement
    });

    it('33c-Spanners-Slurs', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33c-Spanners-Slurs.xml');
    });

    it('33da-Spanners-OctaveShifts-before', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/33da-Spanners-OctaveShifts-before.xml'
        );
        // not supported
    });

    it('33db-Spanners-OctaveShifts-after', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/33db-Spanners-OctaveShifts-after.xml'
        );
        // not supported
    });

    it('33e-Spanners-OctaveShifts-InvalidSize', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/33e-Spanners-OctaveShifts-InvalidSize.xml'
        );
    });

    it('33f-Trill-EndingOnGraceNote', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/33f-Trill-EndingOnGraceNote.xml'
        );
        // not supported
    });

    it('33g-Slur-ChordedNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33g-Slur-ChordedNotes.xml');
        // slur starting on exact note.
    });

    it('33h-Spanners-Glissando', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33h-Spanners-Glissando.xml');
        // only normal slide
    });

    it('33i-Ties-NotEnded', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33i-Ties-NotEnded.xml');
    });

    it('33j-Beams-Tremolos', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/33j-Beams-Tremolos.xml');
        // not supported
    });

    it('34a-Print-Object-Spanners', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/34a-Print-Object-Spanners.xml'
        );
    });

    it('34b-Colors', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/34b-Colors.xml');
    });

    it('34c-Font-Size', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/34c-Font-Size.xml');
    });

    it('41a-MultiParts-Partorder', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41a-MultiParts-Partorder.xml');
    });

    it('41b-MultiParts-MoreThan10', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41b-MultiParts-MoreThan10.xml'
        );
    });

    it('41c-StaffGroups', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41c-StaffGroups.xml');
    });

    it('41d-StaffGroups-Nested', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41d-StaffGroups-Nested.xml');
    });

    it('41e-StaffGroups-InstrumentNames-Linebroken', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41e-StaffGroups-InstrumentNames-Linebroken.xml'
        );
    });

    it('41f-StaffGroups-Overlapping', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41f-StaffGroups-Overlapping.xml'
        );
    });

    it('41g-StaffGroups-NestingOrder', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41g-StaffGroups-NestingOrder.xml'
        );
    });

    it('41h-TooManyParts', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41h-TooManyParts.xml');
    });

    it('41i-PartNameDisplay-Override', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41i-PartNameDisplay-Override.xml'
        );
    });

    it('41j-PartNameDisplay-Multiple-DisplayText-Children', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41j-PartNameDisplay-Multiple-DisplayText-Children.xml'
        );
        // styling not supported
    });

    it('41k-PartName-Print', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/41k-PartName-Print.xml');
    });

    it('41l-GroupNameDisplay-Override', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/41l-GroupNameDisplay-Override.xml'
        );
    });

    it('42a-MultiVoice-TwoVoicesOnStaff-Lyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/42a-MultiVoice-TwoVoicesOnStaff-Lyrics.xml'
        );
    });

    it('42b-MultiVoice-MidMeasureClefChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/42b-MultiVoice-MidMeasureClefChange.xml'
        );
    });

    it('43a-PianoStaff', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/43a-PianoStaff.xml');
    });

    it('43b-MultiStaff-DifferentKeys', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43b-MultiStaff-DifferentKeys.xml'
        );
        // not supported
    });

    it('43c-MultiStaff-DifferentKeysAfterBackup', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43c-MultiStaff-DifferentKeysAfterBackup.xml'
        );
        // not supported
    });

    it('43d-MultiStaff-StaffChange', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43d-MultiStaff-StaffChange.xml'
        );
        // filling with rests where needed, cross staff beams not supported
    });

    it('43e-Multistaff-ClefDynamics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43e-Multistaff-ClefDynamics.xml'
        );
    });

    it('43f-MultiStaff-Lyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/43f-MultiStaff-Lyrics.xml');
    });

    it('43g-MultiStaff-PartSymbol', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/43g-MultiStaff-PartSymbol.xml'
        );
    });

    it('45a-SimpleRepeat', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45a-SimpleRepeat.xml');
    });

    it('45b-RepeatWithAlternatives', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45b-RepeatWithAlternatives.xml'
        );
    });

    it('45c-SimpleRepeat-Nested', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45c-SimpleRepeat-Nested.xml');
    });

    it('45d-Repeats-MultipleEndings', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45d-Repeats-MultipleEndings.xml'
        );
    });

    it('45e-Repeats-Combination', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45e-Repeats-Combination.xml');
    });

    it('45f-Repeats-InvalidEndings', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/45f-Repeats-InvalidEndings.xml'
        );
    });

    it('45g-Repeats-NotEnded', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45g-Repeats-NotEnded.xml');
    });

    it('45h-Repeats-Partial', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45h-Repeats-Partial.xml');
    });

    it('45i-Repeats-Nested', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/45i-Repeats-Nested.xml');
    });

    it('46a-Barlines', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46a-Barlines.xml');
        // only double bar
    });

    it('46b-MidmeasureBarline', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46b-MidmeasureBarline.xml');
        // not supported
    });

    it('46c-Midmeasure-Clef', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46c-Midmeasure-Clef.xml');
        // not supported
    });

    it('46d-PickupMeasure-ImplicitMeasures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/46d-PickupMeasure-ImplicitMeasures.xml'
        );
    });

    it('46e-PickupMeasure-SecondVoiceStartsLater', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/46e-PickupMeasure-SecondVoiceStartsLater.xml'
        );
    });

    it('46f-IncompleteMeasures', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/46f-IncompleteMeasures.xml');
    });

    it('46g-PickupMeasure-Chordnames-FiguredBass', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/46g-PickupMeasure-Chordnames-FiguredBass.xml'
        );
    });

    it('51b-Header-Quotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/51b-Header-Quotes.xml');
    });

    it('51c-MultipleRights', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/51c-MultipleRights.xml');
    });

    it('51d-EmptyTitle', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/51d-EmptyTitle.xml');
    });

    it('52a-PageLayout', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/52a-PageLayout.xml');
    });

    it('52b-Breaks', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/52b-Breaks.xml');
    });

    it('61a-Lyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61a-Lyrics.xml');
        // no syllables
    });

    it('61b-MultipleLyrics', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61b-MultipleLyrics.xml');
    });

    it('61c-Lyrics-Pianostaff', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61c-Lyrics-Pianostaff.xml');
    });

    it('61d-Lyrics-Melisma', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61d-Lyrics-Melisma.xml');
    });

    it('61e-Lyrics-Chords', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61e-Lyrics-Chords.xml');
    });

    it('61f-Lyrics-GracedNotes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61f-Lyrics-GracedNotes.xml');
    });

    it('61g-Lyrics-NameNumber', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61g-Lyrics-NameNumber.xml');
    });

    it('61h-Lyrics-BeamsMelismata', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/61h-Lyrics-BeamsMelismata.xml'
        );
    });

    it('61i-Lyrics-Chords', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61i-Lyrics-Chords.xml');
    });

    it('61j-Lyrics-Elisions', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/61j-Lyrics-Elisions.xml');
    });

    it('61k-Lyrics-SpannersExtenders', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/61k-Lyrics-SpannersExtenders.xml'
        );
    });

    it('71a-Chordnames', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71a-Chordnames.xml');
    });

    it('71c-ChordsFrets', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71c-ChordsFrets.xml');
    });

    it('71d-ChordsFrets-Multistaff', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/71d-ChordsFrets-Multistaff.xml'
        );
    });

    it('71e-TabStaves', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71e-TabStaves.xml');
    });

    it('71f-AllChordTypes', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71f-AllChordTypes.xml');
    });

    it('71g-MultipleChordnames', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/71g-MultipleChordnames.xml');
    });

    it('72a-TransposingInstruments', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/72a-TransposingInstruments.xml'
        );
    });

    it('72b-TransposingInstruments-Full', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/72b-TransposingInstruments-Full.xml'
        );
    });

    it('72c-TransposingInstruments-Change', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/72c-TransposingInstruments-Change.xml'
        );
        // broken
    });

    it('73a-Percussion', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/73a-Percussion.xml');
    });

    it('74a-FiguredBass', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/74a-FiguredBass.xml');
        // not supported
    });

    it('75a-AccordionRegistrations', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/75a-AccordionRegistrations.xml'
        );
        // not supported
    });

    it('90a-Compressed-MusicXML', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-testsuite/90a-Compressed-MusicXML.mxl');
    });

    it('99a-Sibelius5-IgnoreBeaming', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/99a-Sibelius5-IgnoreBeaming.xml'
        );
    });

    it('99b-Lyrics-BeamsMelismata-IgnoreBeams', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml-testsuite/99b-Lyrics-BeamsMelismata-IgnoreBeams.xml'
        );
    });
});
