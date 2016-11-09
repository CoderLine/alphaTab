using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Exporter;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class MusicXml2ImporterTest
    {
        internal MusicXml2Importer PrepareImporterWithFile(string name)
        {
            const string path = "TestFiles/MusicXml";
            var buffer = Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
            return PrepareImporterWithBytes(buffer);
        }

        internal MusicXml2Importer PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new MusicXml2Importer();
            readerBase.Init(new StreamWrapper(new MemoryStream(buffer)));
            return readerBase;
        }

        [TestMethod]
        public void Test_01a_Pitches_Pitches()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_01b_Pitches_Intervals()
        {
            TestReference(renderLayout: "horizontal");
        }

        [TestMethod]
        public void Test_01c_Pitches_NoVoiceElement()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_01d_Pitches_Microtones()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_01e_Pitches_ParenthesizedAccidentals()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_01f_Pitches_ParenthesizedMicrotoneAccidentals()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_02a_Rests_Durations()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_02b_Rests_PitchedRests()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_02c_Rests_MultiMeasureRests()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_02d_Rests_Multimeasure_TimeSignatures()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_02e_Rests_NoType()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_03a_Rhythm_Durations()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_03b_Rhythm_Backup()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_03c_Rhythm_DivisionChange()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_03d_Rhythm_DottedDurations_Factors()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11a_TimeSignatures()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11b_TimeSignatures_NoTime()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11c_TimeSignatures_CompoundSimple()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11d_TimeSignatures_CompoundMultiple()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11e_TimeSignatures_CompoundMixed()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11f_TimeSignatures_SymbolMeaning()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11g_TimeSignatures_SingleNumber()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_11h_TimeSignatures_SenzaMisura()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_12a_Clefs()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_12b_Clefs_NoKeyOrClef()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_13a_KeySignatures()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_13b_KeySignatures_ChurchModes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_13c_KeySignatures_NonTraditional()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_13d_KeySignatures_Microtones()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_14a_StaffDetails_LineChanges()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_21a_Chord_Basic()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_21b_Chords_TwoNotes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_21c_Chords_ThreeNotesDuration()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_21d_Chords_SchubertStabatMater()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_21e_Chords_PickupMeasures()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_21f_Chord_ElementInBetween()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_22a_Noteheads()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_22b_Staff_Notestyles()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_22c_Noteheads_Chords()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_22d_Parenthesized_Noteheads()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_23a_Tuplets()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_23b_Tuplets_Styles()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_23c_Tuplet_Display_NonStandard()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_23d_Tuplets_Nested()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_23e_Tuplets_Tremolo()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_23f_Tuplets_DurationButNoBracket()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_24a_GraceNotes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_24b_ChordAsGraceNote()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_24c_GraceNote_MeasureEnd()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_24d_AfterGrace()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_24e_GraceNote_StaffChange()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_24f_GraceNote_Slur()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_31a_Directions()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_31c_MetronomeMarks()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_32a_Notations()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_32b_Articulations_Texts()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_32c_MultipleNotationChildren()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_32d_Arpeggio()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33a_Spanners()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33b_Spanners_Tie()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33c_Spanners_Slurs()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33d_Spanners_OctaveShifts()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33e_Spanners_OctaveShifts_InvalidSize()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33f_Trill_EndingOnGraceNote()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33g_Slur_ChordedNotes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33h_Spanners_Glissando()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_33i_Ties_NotEnded()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41a_MultiParts_Partorder()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41b_MultiParts_MoreThan10()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41c_StaffGroups()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41d_StaffGroups_Nested()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41e_StaffGroups_InstrumentNames_Linebroken()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41f_StaffGroups_Overlapping()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41g_PartNoId()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41h_TooManyParts()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_41i_PartNameDisplay_Override()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_42a_MultiVoice_TwoVoicesOnStaff_Lyrics()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_42b_MultiVoice_MidMeasureClefChange()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_43a_PianoStaff()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_43b_MultiStaff_DifferentKeys()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_43c_MultiStaff_DifferentKeysAfterBackup()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_43d_MultiStaff_StaffChange()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_43e_Multistaff_ClefDynamics()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45a_SimpleRepeat()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45b_RepeatWithAlternatives()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45c_RepeatMultipleTimes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45d_Repeats_Nested_Alternatives()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45e_Repeats_Nested_Alternatives()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45f_Repeats_InvalidEndings()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_45g_Repeats_NotEnded()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46a_Barlines()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46b_MidmeasureBarline()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46c_Midmeasure_Clef()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46d_PickupMeasure_ImplicitMeasures()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46e_PickupMeasure_SecondVoiceStartsLater()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46f_IncompleteMeasures()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_46g_PickupMeasure_Chordnames_FiguredBass()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_51b_Header_Quotes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_51c_MultipleRights()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_51d_EmptyTitle()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_52a_PageLayout()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_52b_Breaks()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61a_Lyrics()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61b_MultipleLyrics()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61c_Lyrics_Pianostaff()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61d_Lyrics_Melisma()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61e_Lyrics_Chords()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61f_Lyrics_GracedNotes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61g_Lyrics_NameNumber()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61h_Lyrics_BeamsMelismata()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61i_Lyrics_Chords()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61j_Lyrics_Elisions()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_61k_Lyrics_SpannersExtenders()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_71a_Chordnames()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_71c_ChordsFrets()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_71d_ChordsFrets_Multistaff()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_71e_TabStaves()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_71f_AllChordTypes()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_71g_MultipleChordnames()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_72a_TransposingInstruments()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_72b_TransposingInstruments_Full()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_72c_TransposingInstruments_Change()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_73a_Percussion()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_74a_FiguredBass()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_75a_AccordionRegistrations()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_99a_Sibelius5_IgnoreBeaming()
        {
            TestReference();
        }

        [TestMethod]
        public void Test_99b_Lyrics_BeamsMelismata_IgnoreBeams()
        {
            TestReference();
        }

        private void TestReference([CallerMemberName] string caller = null, string renderLayout = "page")
        {
            var fileId = caller.Split('_')[1];

            const string path = "TestFiles/MusicXml";
            var file = Directory.EnumerateFiles(path, "*.xml").FirstOrDefault(f => f.Contains(fileId));
            Console.WriteLine(Path.GetFullPath(path));
            var gpxImporter = new GpxImporter();
            var sw = new Stopwatch();

            try
            {
                var reference = Path.ChangeExtension(file, ".gpx");
                Score referenceScore;
                if (!File.Exists(reference))
                {
                    Assert.Inconclusive();
                }

                gpxImporter.Init(ByteBuffer.FromBuffer(File.ReadAllBytes(reference)));
                referenceScore = gpxImporter.ReadScore();

                sw.Restart();
                var buffer = Environment.FileLoaders["default"]().LoadBinary(file);
                var importer = PrepareImporterWithBytes(buffer);
                var score = importer.ReadScore();
                sw.Stop();

                AreEqual(referenceScore, score);

                foreach (var track in score.Tracks)
                {
                    Render(track, Path.ChangeExtension(file, "." + track.Index + ".png"), renderLayout);
                }
            }
            catch (UnsupportedFormatException e)
            {
                Assert.Fail("Failed to load file {0}: {1}", file, e);
            }
        }

        [DebuggerStepThrough]
        private void AreEqual<T>(T expected, T actual, Expression<Func<T, object>> member)
        {
            var accessor = member.Compile();
            var expectedValue = accessor(expected);
            var actualValue = accessor(actual);
            var memberExpr = member.Body as MemberExpression;
            string propertyName = "";
            if (memberExpr != null)
            {
                propertyName = memberExpr.Member.Name;
            }
            else
            {
                var unary = member.Body as UnaryExpression;
                if (unary != null)
                {
                    memberExpr = unary.Operand as MemberExpression;
                    if (memberExpr != null)
                    {
                        propertyName = memberExpr.Member.Name;
                    }
                }
            }

            if (!Equals(expectedValue, actualValue))
            {
                var hierarchy = GetHierarchy(actual);
                Assert.Fail($"{propertyName} value differs on {hierarchy}. Actual<{actualValue}> Expected<{expectedValue}>");
            }
        }

        private string GetHierarchy(object node)
        {
            var note = node as Note;
            if (note != null)
            {
                return GetHierarchy(note.Beat) + "Note[" + note.Index + "]";
            }

            var beat = node as Beat;
            if (beat != null)
            {
                return GetHierarchy(beat.Voice) + "Beat[" + beat.Index + "]";
            }

            var voice = node as Voice;
            if (voice != null)
            {
                return GetHierarchy(voice.Bar) + "Voice[" + voice.Index + "]";
            }

            var bar = node as Bar;
            if (bar != null)
            {
                return GetHierarchy(bar.Staff) + "Bar[" + bar.Index + "]";
            }

            var staff = node as Staff;
            if (staff != null)
            {
                return GetHierarchy(staff.Track) + "Staff[" + staff.Index + "]";
            }

            var track = node as Track;
            if (track != null)
            {
                return "Track[" + track.Index + "]";
            }

            var mb = node as MasterBar;
            if (mb != null)
            {
                return "MasterBar[" + mb.Index + "]";
            }

            return node.GetType().Name;
        }

        private void AreEqual(Score expected, Score actual)
        {
            AreEqual(expected, actual, t => t.Album);
            AreEqual(expected, actual, t => t.Artist);
            AreEqual(expected, actual, t => t.Copyright);
            AreEqual(expected, actual, t => t.Instructions);
            AreEqual(expected, actual, t => t.Music);
            AreEqual(expected, actual, t => t.Notices);
            AreEqual(expected, actual, t => t.SubTitle);
            AreEqual(expected, actual, t => t.Title);
            AreEqual(expected, actual, t => t.Words);
            AreEqual(expected, actual, t => t.Tab);
            AreEqual(expected, actual, t => t.Tempo);
            AreEqual(expected, actual, t => t.TempoLabel);
            AreEqual(expected, actual, t => t.MasterBars.Count);
            for (int i = 0; i < expected.MasterBars.Count; i++)
            {
                AreEqual(expected.MasterBars[i], actual.MasterBars[i]);
            }

            AreEqual(expected, actual, t => t.Tracks.Count);
            for (int i = 0; i < expected.Tracks.Count; i++)
            {
                AreEqual(expected.Tracks[i], actual.Tracks[i]);
            }

        }

        private void AreEqual(Track expected, Track actual)
        {
            AreEqual(expected, actual, t => t.Capo);
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Name);
            //AreEqual(expected, actual, t => t.ShortName);
            AreEqual(expected, actual, t => t.Tuning.Length);
            Assert.AreEqual(string.Join(",", expected.Tuning), string.Join(",", actual.Tuning));
            AreEqual(expected, actual, t => t.Color.Raw);
            AreEqual(expected.PlaybackInfo, actual.PlaybackInfo);
            AreEqual(expected, actual, t => t.IsPercussion);
            AreEqual(expected, actual, t => t.Staves.Count);
            for (int i = 0; i < expected.Staves.Count; i++)
            {
                AreEqual(expected.Staves[i], actual.Staves[i]);
            }
        }

        private void AreEqual(Staff expected, Staff actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Bars.Count);
            for (int i = 0; i < expected.Bars.Count; i++)
            {
                AreEqual(expected.Bars[i], actual.Bars[i]);
            }
        }

        private void AreEqual(Bar expected, Bar actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Clef);
            //AreEqual(expected, actual, t => t.Voices.Count);
            for (int i = 0; i < Math.Min(expected.Voices.Count, actual.Voices.Count); i++)
            {
                AreEqual(expected.Voices[i], actual.Voices[i]);
            }
        }

        private void AreEqual(Voice expected, Voice actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Beats.Count);
            for (int i = 0; i < expected.Beats.Count; i++)
            {
                AreEqual(expected.Beats[i], actual.Beats[i]);
            }
        }

        private void AreEqual(Beat expected, Beat actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.IsEmpty);
            AreEqual(expected, actual, t => t.IsRest);
            AreEqual(expected, actual, t => t.Dots);
            AreEqual(expected, actual, t => t.FadeIn);
            Assert.AreEqual(string.Join(" ", expected.Lyrics), string.Join(" ", actual.Lyrics));
            AreEqual(expected, actual, t => t.Pop);
            AreEqual(expected, actual, t => t.HasChord);
            AreEqual(expected, actual, t => t.HasRasgueado);
            Assert.AreEqual(expected.Slap, actual.Tap);
            AreEqual(expected, actual, t => t.Text);
            AreEqual(expected, actual, t => t.BrushType);
            AreEqual(expected, actual, t => t.BrushDuration);
            AreEqual(expected, actual, t => t.TupletDenominator);
            AreEqual(expected, actual, t => t.TupletNumerator);
            AreEqual(expected.WhammyBarPoints, actual.WhammyBarPoints);
            AreEqual(expected, actual, t => t.Vibrato);
            if (expected.HasChord)
            {
                AreEqual(expected.Chord, actual.Chord);
            }
            AreEqual(expected, actual, t => t.GraceType);
            AreEqual(expected, actual, t => t.PickStroke);
            AreEqual(expected, actual, t => t.TremoloSpeed);
            AreEqual(expected, actual, t => t.Crescendo);
            AreEqual(expected, actual, t => t.Start);
            //AreEqual(expected, actual, t => t.Dynamic);
            AreEqual(expected, actual, t => t.InvertBeamDirection);

            AreEqual(expected, actual, t => t.Notes.Count);
            for (int i = 0; i < expected.Notes.Count; i++)
            {
                AreEqual(expected.Notes[i], actual.Notes[i]);
            }
        }

        private void AreEqual(Note expected, Note actual)
        {
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.Accentuated);
            AreEqual(expected.BendPoints, actual.BendPoints);
            AreEqual(expected, actual, t => t.IsStringed);
            if (actual.IsStringed)
            {
                AreEqual(expected, actual, t => t.Fret);
                AreEqual(expected, actual, t => t.String);
            }
            AreEqual(expected, actual, t => t.IsPiano);
            if (actual.IsPiano)
            {
                AreEqual(expected, actual, t => t.Octave);
                AreEqual(expected, actual, t => t.Tone);
            }
            AreEqual(expected, actual, t => t.Variation);
            AreEqual(expected, actual, t => t.Element);
            AreEqual(expected, actual, t => t.IsHammerPullOrigin);
            AreEqual(expected, actual, t => t.HarmonicType);
            AreEqual(expected, actual, t => t.HarmonicValue);
            AreEqual(expected, actual, t => t.IsGhost);
            AreEqual(expected, actual, t => t.IsLetRing);
            AreEqual(expected, actual, t => t.IsPalmMute);
            AreEqual(expected, actual, t => t.IsDead);
            AreEqual(expected, actual, t => t.IsStaccato);
            AreEqual(expected, actual, t => t.SlideType);
            AreEqual(expected, actual, t => t.Vibrato);
            AreEqual(expected, actual, t => t.IsTieDestination);
            AreEqual(expected, actual, t => t.IsTieOrigin);
            AreEqual(expected, actual, t => t.LeftHandFinger);
            AreEqual(expected, actual, t => t.IsFingering);
            AreEqual(expected, actual, t => t.TrillValue);
            AreEqual(expected, actual, t => t.TrillSpeed);
            AreEqual(expected, actual, t => t.DurationPercent);
            //AreEqual(expected, actual, t => t.AccidentalMode);
            AreEqual(expected, actual, t => t.Dynamic);
            AreEqual(expected, actual, t => t.RealValue);
        }

        private void AreEqual(Chord expected, Chord actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                //AreEqual(expected, actual, t => t.Name);
            }
        }

        private void AreEqual(FastList<BendPoint> expected, FastList<BendPoint> actual)
        {
            AreEqual(expected, actual, t => t.Count);
            for (int i = 0; i < expected.Count; i++)
            {
                Assert.AreEqual(expected[i].Value, actual[i].Value);
                Assert.AreEqual(expected[i].Offset, actual[i].Offset);
            }
        }

        private void AreEqual(PlaybackInformation expected, PlaybackInformation actual)
        {
            AreEqual(expected, actual, t => t.Volume);
            AreEqual(expected, actual, t => t.Balance);
            //AreEqual(expected, actual, t => t.Port);
            AreEqual(expected, actual, t => t.Program);
            //AreEqual(expected, actual, t => t.PrimaryChannel);
            //AreEqual(expected, actual, t => t.SecondaryChannel);
            AreEqual(expected, actual, t => t.IsMute);
            AreEqual(expected, actual, t => t.IsSolo);
        }

        private void AreEqual(MasterBar expected, MasterBar actual)
        {
            AreEqual(expected, actual, t => t.AlternateEndings);
            AreEqual(expected, actual, t => t.Index);
            AreEqual(expected, actual, t => t.KeySignature);
            AreEqual(expected, actual, t => t.KeySignatureType);
            AreEqual(expected, actual, t => t.IsDoubleBar);
            AreEqual(expected, actual, t => t.IsRepeatStart);
            AreEqual(expected, actual, t => t.RepeatCount);
            AreEqual(expected, actual, t => t.TimeSignatureNumerator);
            AreEqual(expected, actual, t => t.TimeSignatureDenominator);
            AreEqual(expected, actual, t => t.TripletFeel);
            AreEqual(expected.Section, actual.Section);
            AreEqual(expected, actual, t => t.Start);
        }

        private void AreEqual(Section expected, Section actual)
        {
            Assert.AreEqual(expected == null, actual == null);
            if (expected != null)
            {
                AreEqual(expected, actual, t => t.Text);
                AreEqual(expected, actual, t => t.Marker);
            }
        }

        private void Render(Track track, string path, string renderLayout)
        {
            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            settings.Layout = new LayoutSettings
            {
                Mode = renderLayout
            };
            var renderer = new ScoreRenderer(settings);
            var images = new List<Image>();
            var totalWidth = 0;
            var totalHeight = 0;
            renderer.PartialRenderFinished += r =>
            {
                images.Add((Image)r.RenderResult);
            };
            renderer.RenderFinished += r =>
            {
                totalWidth = (int)r.TotalWidth;
                totalHeight = (int)r.TotalHeight;
            };
            renderer.Render(track);
            using (var bmp = new Bitmap(totalWidth, totalHeight))
            {
                int y = 0;
                using (var g = Graphics.FromImage(bmp))
                {
                    g.Clear(Color.White);
                    foreach (var image in images)
                    {
                        g.DrawImage(image, new Rectangle(0, y, image.Width, image.Height),
                            new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                        y += image.Height;
                    }
                }
                bmp.Save(path, ImageFormat.Png);
            }
        }
    }
}
