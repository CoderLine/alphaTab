package alphaTab.test.importer;

using system.HaxeExtensions;
class MusicXmlImporterTestBase
{
    private function PrepareImporterWithBytes(buffer : system.ByteArray) : alphaTab.importer.MusicXmlImporter 
    {
        var readerBase : alphaTab.importer.MusicXmlImporter = new alphaTab.importer.MusicXmlImporter();
        readerBase.Init(alphaTab.io.ByteBuffer.FromBuffer(buffer), null);
        return readerBase;

    }

    private function TestReferenceFile(file : system.CsString, renderLayout : system.CsString = "page", renderAllTracks : system.Boolean = false) : alphaTab.model.Score 
    {
        var gpxImporter : alphaTab.importer.GpxImporter = new alphaTab.importer.GpxImporter();
        try
        {
            var buffer : system.ByteArray = alphaTab.test.TestPlatform.LoadFile(file);
            var importer : alphaTab.importer.MusicXmlImporter = PrepareImporterWithBytes(buffer);
            var score : alphaTab.model.Score = importer.ReadScore();
            var reference : system.CsString = alphaTab.test.TestPlatform.ChangeExtension(file, ".gpx");
            gpxImporter.Init(alphaTab.io.ByteBuffer.FromBuffer(alphaTab.test.TestPlatform.LoadFile(reference)), null);
            var referenceScore : alphaTab.model.Score = gpxImporter.ReadScore();
            AreEqual_Score_Score(referenceScore, score);
            return score;

        }
        catch(e: alphaTab.importer.UnsupportedFormatException)
        {
            alphaTab.test.Assert.Fail_CsString_ObjectArray("Failed to load file {0}: {1}", [file, e]);
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Album, actual.Album, "Mismatch on Album");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Artist, actual.Artist, "Mismatch on Artist");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Copyright, actual.Copyright, "Mismatch on Copyright");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Instructions, actual.Instructions, "Mismatch on Instructions");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Music, actual.Music, "Mismatch on Music");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Notices, actual.Notices, "Mismatch on Notices");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.SubTitle, actual.SubTitle, "Mismatch on SubTitle");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Title, actual.Title, "Mismatch on Title");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Words, actual.Words, "Mismatch on Words");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Tab, actual.Tab, "Mismatch on Tab");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Tempo, actual.Tempo, "Mismatch on Tempo");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TempoLabel, actual.TempoLabel, "Mismatch on TempoLabel");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.MasterBars.Count, actual.MasterBars.Count, "Mismatch on MasterBars.Count");
        {
            var i: system.Int32 = 0;
            while (i < expected.MasterBars.Count)
            {
                AreEqual_MasterBar_MasterBar(expected.MasterBars.get_Item(i), actual.MasterBars.get_Item(i));
                i++;
            }
        }
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Tracks.Count, actual.Tracks.Count, "Mismatch on Tracks.Count");
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Name, actual.Name, "Mismatch on Name");
        //Assert.AreEqual(expected.ShortName, actual.ShortName, "Mismatch on ShortName");
        //Assert.AreEqual(expected.Color.Raw, actual.Color.Raw, "Mismatch on Color.Raw");
        AreEqual_PlaybackInformation_PlaybackInformation(expected.PlaybackInfo, actual.PlaybackInfo);
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Staves.Count, actual.Staves.Count, "Mismatch on Staves.Count");
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Capo, actual.Capo, "Mismatch on Capo");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.StaffKind, actual.StaffKind, "Mismatch on StaffKind");
        alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_IEnumerable_T1(",", expected.Tuning), system.CsString.Join_CsString_IEnumerable_T1(",", actual.Tuning));
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Tuning.Length, actual.Tuning.Length, "Mismatch on Tuning.Length");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Bars.Count, actual.Bars.Count, "Mismatch on Bars.Count");
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Clef, actual.Clef, "Mismatch on Clef");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.ClefOttava, actual.ClefOttava, "Mismatch on ClefOttavia");
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Beats.Count, actual.Beats.Count, "Mismatch on Beats.Count");
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsEmpty, actual.IsEmpty, "Mismatch on IsEmpty");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsRest, actual.IsRest, "Mismatch on IsRest");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Dots, actual.Dots, "Mismatch on Dots");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.FadeIn, actual.FadeIn, "Mismatch on FadeIn");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsLegatoOrigin, actual.IsLegatoOrigin, "Mismatch on IsLegatoOrigin");
        if (expected.Lyrics == null)
        {
            alphaTab.test.Assert.IsNull(actual.Lyrics);
        }
        else         {
            alphaTab.test.Assert.AreEqual_T1_T22(system.CsString.Join_CsString_CsStringArray(" ", expected.Lyrics), system.CsString.Join_CsString_CsStringArray(" ", actual.Lyrics));
        }
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Pop, actual.Pop, "Mismatch on Pop");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.HasChord, actual.HasChord, "Mismatch on HasChord");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.HasRasgueado, actual.HasRasgueado, "Mismatch on HasRasgueado");
        alphaTab.test.Assert.AreEqual_T1_T22(expected.Slap, actual.Tap);
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Text, actual.Text, "Mismatch on Text");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.BrushType, actual.BrushType, "Mismatch on BrushType");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.BrushDuration, actual.BrushDuration, "Mismatch on BrushDuration");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TupletDenominator, actual.TupletDenominator, "Mismatch on TupletDenominator");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TupletNumerator, actual.TupletNumerator, "Mismatch on TupletNumerator");
        AreEqual_FastList_BendPoint_FastList_BendPoint(expected.WhammyBarPoints, actual.WhammyBarPoints);
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Vibrato, actual.Vibrato, "Mismatch on Vibrato");
        if (expected.HasChord)
        {
            AreEqual_Chord_Chord(expected.Chord, actual.Chord);
        }
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.GraceType, actual.GraceType, "Mismatch on GraceType");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.PickStroke, actual.PickStroke, "Mismatch on PickStroke");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TremoloSpeed, actual.TremoloSpeed, "Mismatch on TremoloSpeed");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Crescendo, actual.Crescendo, "Mismatch on Crescendo");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.PlaybackStart, actual.PlaybackStart, "Mismatch on Start");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.DisplayStart, actual.DisplayStart, "Mismatch on Start");
        //Assert.AreEqual(expected.Dynamic, actual.Dynamic, "Mismatch on Dynamic");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.InvertBeamDirection, actual.InvertBeamDirection, "Mismatch on InvertBeamDirection");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Notes.Count, actual.Notes.Count, "Mismatch on Notes.Count");
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
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Accentuated, actual.Accentuated, "Mismatch on Accentuated");
        AreEqual_FastList_BendPoint_FastList_BendPoint(expected.BendPoints, actual.BendPoints);
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsStringed, actual.IsStringed, "Mismatch on IsStringed");
        if (actual.IsStringed)
        {
            alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Fret, actual.Fret, "Mismatch on Fret");
            alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.String, actual.String, "Mismatch on String");
        }
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsPiano, actual.IsPiano, "Mismatch on IsPiano");
        if (actual.IsPiano)
        {
            alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Octave, actual.Octave, "Mismatch on Octave");
            alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Tone, actual.Tone, "Mismatch on Tone");
        }
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Variation, actual.Variation, "Mismatch on Variation");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Element, actual.Element, "Mismatch on Element");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsHammerPullOrigin, actual.IsHammerPullOrigin, "Mismatch on IsHammerPullOrigin");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.HarmonicType, actual.HarmonicType, "Mismatch on HarmonicType");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.HarmonicValue, actual.HarmonicValue, "Mismatch on HarmonicValue");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsGhost, actual.IsGhost, "Mismatch on IsGhost");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsLetRing, actual.IsLetRing, "Mismatch on IsLetRing");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsPalmMute, actual.IsPalmMute, "Mismatch on IsPalmMute");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsDead, actual.IsDead, "Mismatch on IsDead");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsStaccato, actual.IsStaccato, "Mismatch on IsStaccato");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.SlideType, actual.SlideType, "Mismatch on SlideType");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Vibrato, actual.Vibrato, "Mismatch on Vibrato");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsTieDestination, actual.IsTieDestination, "Mismatch on IsTieDestination");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsTieOrigin, actual.IsTieOrigin, "Mismatch on IsTieOrigin");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.LeftHandFinger, actual.LeftHandFinger, "Mismatch on LeftHandFinger");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsFingering, actual.IsFingering, "Mismatch on IsFingering");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TrillValue, actual.TrillValue, "Mismatch on TrillValue");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TrillSpeed, actual.TrillSpeed, "Mismatch on TrillSpeed");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.DurationPercent, actual.DurationPercent, "Mismatch on DurationPercent");
        //Assert.AreEqual(expected.AccidentalMode, actual.AccidentalMode, "Mismatch on AccidentalMode");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Dynamic, actual.Dynamic, "Mismatch on Dynamic");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.RealValue, actual.RealValue, "Mismatch on RealValue");
    }

    private function AreEqual_Chord_Chord(expected : alphaTab.model.Chord, actual : alphaTab.model.Chord) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(expected == null, actual == null);
        if (expected != null)
        {
        }
    }

    private function AreEqual_FastList_BendPoint_FastList_BendPoint(expected : alphaTab.collections.FastList<alphaTab.model.BendPoint>, actual : alphaTab.collections.FastList<alphaTab.model.BendPoint>) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Count, actual.Count, "Mismatch on Count");
        {
            var i: system.Int32 = 0;
            while (i < expected.Count)
            {
                alphaTab.test.Assert.AreEqual_T1_T22(expected.get_Item(i).Value, actual.get_Item(i).Value);
                alphaTab.test.Assert.AreEqual_T1_T22(expected.get_Item(i).Offset, actual.get_Item(i).Offset);
                i++;
            }
        }
    }

    private function AreEqual_PlaybackInformation_PlaybackInformation(expected : alphaTab.model.PlaybackInformation, actual : alphaTab.model.PlaybackInformation) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Volume, actual.Volume, "Mismatch on Volume");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Balance, actual.Balance, "Mismatch on Balance");
        //Assert.AreEqual(expected.Port, actual.Port, "Mismatch on Port");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Program, actual.Program, "Mismatch on Program");
        //Assert.AreEqual(expected.PrimaryChannel, actual.PrimaryChannel, "Mismatch on PrimaryChannel");
        //Assert.AreEqual(expected.SecondaryChannel, actual.SecondaryChannel, "Mismatch on SecondaryChannel");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsMute, actual.IsMute, "Mismatch on IsMute");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsSolo, actual.IsSolo, "Mismatch on IsSolo");
    }

    private function AreEqual_MasterBar_MasterBar(expected : alphaTab.model.MasterBar, actual : alphaTab.model.MasterBar) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.AlternateEndings, actual.AlternateEndings, "Mismatch on AlternateEndings");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Index, actual.Index, "Mismatch on Index");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.KeySignature, actual.KeySignature, "Mismatch on KeySignature");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.KeySignatureType, actual.KeySignatureType, "Mismatch on KeySignatureType");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsDoubleBar, actual.IsDoubleBar, "Mismatch on IsDoubleBar");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.IsRepeatStart, actual.IsRepeatStart, "Mismatch on IsRepeatStart");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.RepeatCount, actual.RepeatCount, "Mismatch on RepeatCount");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TimeSignatureNumerator, actual.TimeSignatureNumerator, "Mismatch on TimeSignatureNumerator");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TimeSignatureDenominator, actual.TimeSignatureDenominator, "Mismatch on TimeSignatureDenominator");
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.TripletFeel, actual.TripletFeel, "Mismatch on TripletFeel");
        AreEqual_Section_Section(expected.Section, actual.Section);
        alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Start, actual.Start, "Mismatch on Start");
    }

    private function AreEqual_Section_Section(expected : alphaTab.model.Section, actual : alphaTab.model.Section) : Void 
    {
        alphaTab.test.Assert.AreEqual_T1_T22(expected == null, actual == null);
        if (expected != null)
        {
            alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Text, actual.Text, "Mismatch on Text");
            alphaTab.test.Assert.AreEqual_T1_T2_CsString2(expected.Marker, actual.Marker, "Mismatch on Marker");
        }
    }

    public function new() 
    {
    }

}
