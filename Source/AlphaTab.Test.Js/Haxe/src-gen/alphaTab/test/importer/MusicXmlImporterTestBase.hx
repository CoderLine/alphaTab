package alphaTab.test.importer;

using system.HaxeExtensions;
class MusicXmlImporterTestBase
{
    private function PrepareImporterWithBytes(buffer : system.FixedArray<system.Byte>) : alphaTab.importer.MusicXmlImporter 
    {
        var readerBase : alphaTab.importer.MusicXmlImporter = new alphaTab.importer.MusicXmlImporter();
        readerBase.Init(alphaTab.io.ByteBuffer.FromBuffer(buffer));
        return readerBase;

    }

    private function TestReferenceFile(file : system.CsString, renderLayout : system.CsString = "page", renderAllTracks : system.Boolean = false) : alphaTab.model.Score 
    {
        var gpxImporter : alphaTab.importer.GpxImporter = new alphaTab.importer.GpxImporter();
        try
        {
            var buffer : system.FixedArray<system.Byte> = alphaTab.test.TestPlatform.LoadFile(file);
            var importer : alphaTab.importer.MusicXmlImporter = PrepareImporterWithBytes(buffer);
            var score : alphaTab.model.Score = importer.ReadScore();
            var reference : system.CsString = alphaTab.test.TestPlatform.ChangeExtension(file, ".gpx");
            gpxImporter.Init(alphaTab.io.ByteBuffer.FromBuffer(alphaTab.test.TestPlatform.LoadFile(reference)));
            var referenceScore : alphaTab.model.Score = gpxImporter.ReadScore();
            AreEqual_Score_Score(referenceScore, score);
            return score;

        }
        catch(e: alphaTab.importer.UnsupportedFormatException)
        {
            massive.munit.Assert.fail(system.CsString.Format("Failed to load file {0}: {1}", [file, file]).ToHaxeString());
            throw e;
        }
    }

    private function GetHierarchy(node : system.Object) : system.CsString 
    {
        var note : alphaTab.model.Note = (Std.is(node,alphaTab.model.Note)? cast node: null);
        if (note != null)
        {
            return GetHierarchy(note.Beat) + "Note[" + note.Index + "]";

        }
        var beat : alphaTab.model.Beat = (Std.is(node,alphaTab.model.Beat)? cast node: null);
        if (beat != null)
        {
            return GetHierarchy(beat.Voice) + "Beat[" + beat.Index + "]";

        }
        var voice : alphaTab.model.Voice = (Std.is(node,alphaTab.model.Voice)? cast node: null);
        if (voice != null)
        {
            return GetHierarchy(voice.Bar) + "Voice[" + voice.Index + "]";

        }
        var bar : alphaTab.model.Bar = (Std.is(node,alphaTab.model.Bar)? cast node: null);
        if (bar != null)
        {
            return GetHierarchy(bar.Staff) + "Bar[" + bar.Index + "]";

        }
        var staff : alphaTab.model.Staff = (Std.is(node,alphaTab.model.Staff)? cast node: null);
        if (staff != null)
        {
            return GetHierarchy(staff.Track) + "Staff[" + staff.Index + "]";

        }
        var track : alphaTab.model.Track = (Std.is(node,alphaTab.model.Track)? cast node: null);
        if (track != null)
        {
            return "Track[" + track.Index + "]";

        }
        var mb : alphaTab.model.MasterBar = (Std.is(node,alphaTab.model.MasterBar)? cast node: null);
        if (mb != null)
        {
            return "MasterBar[" + mb.Index + "]";

        }
        return system.ObjectExtensions.GetType(node).Name;

    }

    private function AreEqual_Score_Score(expected : alphaTab.model.Score, actual : alphaTab.model.Score) : Void 
    {
        massive.munit.Assert.areEqual(expected.Album, actual.Album);
        massive.munit.Assert.areEqual(expected.Artist, actual.Artist);
        massive.munit.Assert.areEqual(expected.Copyright, actual.Copyright);
        massive.munit.Assert.areEqual(expected.Instructions, actual.Instructions);
        massive.munit.Assert.areEqual(expected.Music, actual.Music);
        massive.munit.Assert.areEqual(expected.Notices, actual.Notices);
        massive.munit.Assert.areEqual(expected.SubTitle, actual.SubTitle);
        massive.munit.Assert.areEqual(expected.Title, actual.Title);
        massive.munit.Assert.areEqual(expected.Words, actual.Words);
        massive.munit.Assert.areEqual(expected.Tab, actual.Tab);
        massive.munit.Assert.areEqual(expected.Tempo, actual.Tempo);
        massive.munit.Assert.areEqual(expected.TempoLabel, actual.TempoLabel);
        massive.munit.Assert.areEqual(expected.MasterBars.Count, actual.MasterBars.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.MasterBars.Count)
            {
                AreEqual_MasterBar_MasterBar(expected.MasterBars.get_Item(i), actual.MasterBars.get_Item(i));
                i++;
            }
        }
        massive.munit.Assert.areEqual(expected.Tracks.Count, actual.Tracks.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.Tracks.Count)
            {
                AreEqual_Track_Track(expected.Tracks.get_Item(i), actual.Tracks.get_Item(i));
                i++;
            }
        }
    }

    private function AreEqual_Track_Track(expected : alphaTab.model.Track, actual : alphaTab.model.Track) : Void 
    {
        massive.munit.Assert.areEqual(expected.Capo, actual.Capo);
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.Name, actual.Name);
        //Assert.AreEqual(expected.ShortName, actual.ShortName, "Mismatch on ShortName");
        massive.munit.Assert.areEqual(expected.Tuning.Length, actual.Tuning.Length);
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_IEnumerable_T1(",", expected.Tuning.ToEnumerable()), system.CsString.Join_CsString_IEnumerable_T1(",", actual.Tuning.ToEnumerable()));
        //Assert.AreEqual(expected.Color.Raw, actual.Color.Raw, "Mismatch on Color.Raw");
        AreEqual_PlaybackInformation_PlaybackInformation(expected.PlaybackInfo, actual.PlaybackInfo);
        massive.munit.Assert.areEqual(expected.IsPercussion, actual.IsPercussion);
        massive.munit.Assert.areEqual(expected.Staves.Count, actual.Staves.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.Staves.Count)
            {
                AreEqual_Staff_Staff(expected.Staves.get_Item(i), actual.Staves.get_Item(i));
                i++;
            }
        }
    }

    private function AreEqual_Staff_Staff(expected : alphaTab.model.Staff, actual : alphaTab.model.Staff) : Void 
    {
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.Bars.Count, actual.Bars.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.Bars.Count)
            {
                AreEqual_Bar_Bar(expected.Bars.get_Item(i), actual.Bars.get_Item(i));
                i++;
            }
        }
    }

    private function AreEqual_Bar_Bar(expected : alphaTab.model.Bar, actual : alphaTab.model.Bar) : Void 
    {
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.Clef, actual.Clef);
        massive.munit.Assert.areEqual(expected.ClefOttavia, actual.ClefOttavia);
        //Assert.AreEqual(expected.Voices.Count, actual.Voices.Count, "Mismatch on Voices.Count");
        {
            var i: system.Int32 = 0;
            while (i < system.CsMath.Min_Int32_Int32(expected.Voices.Count, actual.Voices.Count))
            {
                AreEqual_Voice_Voice(expected.Voices.get_Item(i), actual.Voices.get_Item(i));
                i++;
            }
        }
    }

    private function AreEqual_Voice_Voice(expected : alphaTab.model.Voice, actual : alphaTab.model.Voice) : Void 
    {
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.Beats.Count, actual.Beats.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.Beats.Count)
            {
                AreEqual_Beat_Beat(expected.Beats.get_Item(i), actual.Beats.get_Item(i));
                i++;
            }
        }
    }

    private function AreEqual_Beat_Beat(expected : alphaTab.model.Beat, actual : alphaTab.model.Beat) : Void 
    {
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.IsEmpty, actual.IsEmpty);
        massive.munit.Assert.areEqual(expected.IsRest, actual.IsRest);
        massive.munit.Assert.areEqual(expected.Dots, actual.Dots);
        massive.munit.Assert.areEqual(expected.FadeIn, actual.FadeIn);
        massive.munit.Assert.areEqual(expected.IsLegatoOrigin, actual.IsLegatoOrigin);
        massive.munit.Assert.areEqual(system.CsString.Join_CsString_CsStringArray(" ", expected.Lyrics), system.CsString.Join_CsString_CsStringArray(" ", actual.Lyrics));
        massive.munit.Assert.areEqual(expected.Pop, actual.Pop);
        massive.munit.Assert.areEqual(expected.HasChord, actual.HasChord);
        massive.munit.Assert.areEqual(expected.HasRasgueado, actual.HasRasgueado);
        massive.munit.Assert.areEqual(expected.Slap, actual.Tap);
        massive.munit.Assert.areEqual(expected.Text, actual.Text);
        massive.munit.Assert.areEqual(expected.BrushType, actual.BrushType);
        massive.munit.Assert.areEqual(expected.BrushDuration, actual.BrushDuration);
        massive.munit.Assert.areEqual(expected.TupletDenominator, actual.TupletDenominator);
        massive.munit.Assert.areEqual(expected.TupletNumerator, actual.TupletNumerator);
        AreEqual_FastList_BendPoint_FastList_BendPoint(expected.WhammyBarPoints, actual.WhammyBarPoints);
        massive.munit.Assert.areEqual(expected.Vibrato, actual.Vibrato);
        if (expected.HasChord)
        {
            AreEqual_Chord_Chord(expected.Chord, actual.Chord);
        }
        massive.munit.Assert.areEqual(expected.GraceType, actual.GraceType);
        massive.munit.Assert.areEqual(expected.PickStroke, actual.PickStroke);
        massive.munit.Assert.areEqual(expected.TremoloSpeed, actual.TremoloSpeed);
        massive.munit.Assert.areEqual(expected.Crescendo, actual.Crescendo);
        massive.munit.Assert.areEqual(expected.Start, actual.Start);
        //Assert.AreEqual(expected.Dynamic, actual.Dynamic, "Mismatch on Dynamic");
        massive.munit.Assert.areEqual(expected.InvertBeamDirection, actual.InvertBeamDirection);
        massive.munit.Assert.areEqual(expected.Notes.Count, actual.Notes.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.Notes.Count)
            {
                AreEqual_Note_Note(expected.Notes.get_Item(i), actual.Notes.get_Item(i));
                i++;
            }
        }
    }

    private function AreEqual_Note_Note(expected : alphaTab.model.Note, actual : alphaTab.model.Note) : Void 
    {
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.Accentuated, actual.Accentuated);
        AreEqual_FastList_BendPoint_FastList_BendPoint(expected.BendPoints, actual.BendPoints);
        massive.munit.Assert.areEqual(expected.IsStringed, actual.IsStringed);
        if (actual.IsStringed)
        {
            massive.munit.Assert.areEqual(expected.Fret, actual.Fret);
            massive.munit.Assert.areEqual(expected.String, actual.String);
        }
        massive.munit.Assert.areEqual(expected.IsPiano, actual.IsPiano);
        if (actual.IsPiano)
        {
            massive.munit.Assert.areEqual(expected.Octave, actual.Octave);
            massive.munit.Assert.areEqual(expected.Tone, actual.Tone);
        }
        massive.munit.Assert.areEqual(expected.Variation, actual.Variation);
        massive.munit.Assert.areEqual(expected.Element, actual.Element);
        massive.munit.Assert.areEqual(expected.IsHammerPullOrigin, actual.IsHammerPullOrigin);
        massive.munit.Assert.areEqual(expected.HarmonicType, actual.HarmonicType);
        massive.munit.Assert.areEqual(expected.HarmonicValue, actual.HarmonicValue);
        massive.munit.Assert.areEqual(expected.IsGhost, actual.IsGhost);
        massive.munit.Assert.areEqual(expected.IsLetRing, actual.IsLetRing);
        massive.munit.Assert.areEqual(expected.IsPalmMute, actual.IsPalmMute);
        massive.munit.Assert.areEqual(expected.IsDead, actual.IsDead);
        massive.munit.Assert.areEqual(expected.IsStaccato, actual.IsStaccato);
        massive.munit.Assert.areEqual(expected.SlideType, actual.SlideType);
        massive.munit.Assert.areEqual(expected.Vibrato, actual.Vibrato);
        massive.munit.Assert.areEqual(expected.IsTieDestination, actual.IsTieDestination);
        massive.munit.Assert.areEqual(expected.IsTieOrigin, actual.IsTieOrigin);
        massive.munit.Assert.areEqual(expected.LeftHandFinger, actual.LeftHandFinger);
        massive.munit.Assert.areEqual(expected.IsFingering, actual.IsFingering);
        massive.munit.Assert.areEqual(expected.TrillValue, actual.TrillValue);
        massive.munit.Assert.areEqual(expected.TrillSpeed, actual.TrillSpeed);
        massive.munit.Assert.areEqual(expected.DurationPercent, actual.DurationPercent);
        //Assert.AreEqual(expected.AccidentalMode, actual.AccidentalMode, "Mismatch on AccidentalMode");
        massive.munit.Assert.areEqual(expected.Dynamic, actual.Dynamic);
        massive.munit.Assert.areEqual(expected.RealValue, actual.RealValue);
    }

    private function AreEqual_Chord_Chord(expected : alphaTab.model.Chord, actual : alphaTab.model.Chord) : Void 
    {
        massive.munit.Assert.areEqual(expected == null, actual == null);
        if (expected != null)
        {
        }
    }

    private function AreEqual_FastList_BendPoint_FastList_BendPoint(expected : alphaTab.collections.FastList<alphaTab.model.BendPoint>, actual : alphaTab.collections.FastList<alphaTab.model.BendPoint>) : Void 
    {
        massive.munit.Assert.areEqual(expected.Count, actual.Count);
        {
            var i: system.Int32 = 0;
            while (i < expected.Count)
            {
                massive.munit.Assert.areEqual(expected.get_Item(i).Value, actual.get_Item(i).Value);
                massive.munit.Assert.areEqual(expected.get_Item(i).Offset, actual.get_Item(i).Offset);
                i++;
            }
        }
    }

    private function AreEqual_PlaybackInformation_PlaybackInformation(expected : alphaTab.model.PlaybackInformation, actual : alphaTab.model.PlaybackInformation) : Void 
    {
        massive.munit.Assert.areEqual(expected.Volume, actual.Volume);
        massive.munit.Assert.areEqual(expected.Balance, actual.Balance);
        //Assert.AreEqual(expected.Port, actual.Port, "Mismatch on Port");
        massive.munit.Assert.areEqual(expected.Program, actual.Program);
        //Assert.AreEqual(expected.PrimaryChannel, actual.PrimaryChannel, "Mismatch on PrimaryChannel");
        //Assert.AreEqual(expected.SecondaryChannel, actual.SecondaryChannel, "Mismatch on SecondaryChannel");
        massive.munit.Assert.areEqual(expected.IsMute, actual.IsMute);
        massive.munit.Assert.areEqual(expected.IsSolo, actual.IsSolo);
    }

    private function AreEqual_MasterBar_MasterBar(expected : alphaTab.model.MasterBar, actual : alphaTab.model.MasterBar) : Void 
    {
        massive.munit.Assert.areEqual(expected.AlternateEndings, actual.AlternateEndings);
        massive.munit.Assert.areEqual(expected.Index, actual.Index);
        massive.munit.Assert.areEqual(expected.KeySignature, actual.KeySignature);
        massive.munit.Assert.areEqual(expected.KeySignatureType, actual.KeySignatureType);
        massive.munit.Assert.areEqual(expected.IsDoubleBar, actual.IsDoubleBar);
        massive.munit.Assert.areEqual(expected.IsRepeatStart, actual.IsRepeatStart);
        massive.munit.Assert.areEqual(expected.RepeatCount, actual.RepeatCount);
        massive.munit.Assert.areEqual(expected.TimeSignatureNumerator, actual.TimeSignatureNumerator);
        massive.munit.Assert.areEqual(expected.TimeSignatureDenominator, actual.TimeSignatureDenominator);
        massive.munit.Assert.areEqual(expected.TripletFeel, actual.TripletFeel);
        AreEqual_Section_Section(expected.Section, actual.Section);
        massive.munit.Assert.areEqual(expected.Start, actual.Start);
    }

    private function AreEqual_Section_Section(expected : alphaTab.model.Section, actual : alphaTab.model.Section) : Void 
    {
        massive.munit.Assert.areEqual(expected == null, actual == null);
        if (expected != null)
        {
            massive.munit.Assert.areEqual(expected.Text, actual.Text);
            massive.munit.Assert.areEqual(expected.Marker, actual.Marker);
        }
    }

    public function new() 
    {
    }

}
