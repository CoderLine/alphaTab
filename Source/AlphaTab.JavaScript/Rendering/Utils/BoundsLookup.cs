﻿using AlphaTab.Collections;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Utils
{
    partial class BoundsLookup
    {
        public object ToJson()
        {
            var json = Platform.Platform.NewObject();

            var staveGroups = new FastList<StaveGroupBounds>();
            json.StaveGroups = staveGroups;

            foreach (var group in StaveGroups)
            {
                StaveGroupBounds g = Platform.Platform.NewObject();
                g.VisualBounds = BoundsToJson(group.VisualBounds);
                g.RealBounds = BoundsToJson(group.RealBounds);
                g.Bars = new FastList<MasterBarBounds>();

                foreach (var masterBar in group.Bars)
                {
                    MasterBarBounds mb = Platform.Platform.NewObject();
                    mb.LineAlignedBounds = BoundsToJson(masterBar.LineAlignedBounds);
                    mb.VisualBounds = BoundsToJson(masterBar.VisualBounds);
                    mb.RealBounds = BoundsToJson(masterBar.RealBounds);
                    mb.Index = masterBar.Index;
                    mb.Bars = new FastList<BarBounds>();

                    foreach (var bar in masterBar.Bars)
                    {
                        BarBounds b = Platform.Platform.NewObject();
                        b.VisualBounds = BoundsToJson(bar.VisualBounds);
                        b.RealBounds = BoundsToJson(bar.RealBounds);

                        b.Beats = new FastList<BeatBounds>();

                        foreach (var beat in bar.Beats)
                        {
                            BeatBounds bb = Platform.Platform.NewObject();

                            bb.VisualBounds = BoundsToJson(beat.VisualBounds);
                            bb.RealBounds = BoundsToJson(beat.RealBounds);

                            dynamic bbd = bb;
                            bbd.BeatIndex = beat.Beat.Index;
                            bbd.VoiceIndex = beat.Beat.Voice.Index;
                            bbd.BarIndex = beat.Beat.Voice.Bar.Index;
                            bbd.StaffIndex = beat.Beat.Voice.Bar.Staff.Index;
                            bbd.TrackIndex = beat.Beat.Voice.Bar.Staff.Track.Index;

                            if (beat.Notes != null)
                            {
                                FastList<NoteBounds> notes = bb.Notes = new FastList<NoteBounds>();

                                foreach (var note in beat.Notes)
                                {
                                    NoteBounds n = Platform.Platform.NewObject();
                                    dynamic nd = n;
                                    nd.Index = note.Note.Index;
                                    n.NoteHeadBounds = BoundsToJson(note.NoteHeadBounds);
                                    notes.Add(n);
                                }
                            }

                            b.Beats.Add(bb);
                        }

                        mb.Bars.Add(b);
                    }

                    g.Bars.Add(mb);
                }

                staveGroups.Add(g);
            }

            return json;
        }

        public static BoundsLookup FromJson(object json, Score score)
        {
            var lookup = new BoundsLookup();
            var staveGroups = json.Member<FastList<StaveGroupBounds>>("staveGroups");
            foreach (var staveGroup in staveGroups)
            {
                var sg = new StaveGroupBounds();
                sg.VisualBounds = staveGroup.VisualBounds;
                sg.RealBounds = staveGroup.RealBounds;
                lookup.AddStaveGroup(sg);

                foreach (var masterBar in staveGroup.Bars)
                {
                    var mb = new MasterBarBounds();
                    mb.Index = masterBar.Index;
                    mb.IsFirstOfLine = masterBar.IsFirstOfLine;
                    mb.LineAlignedBounds = masterBar.LineAlignedBounds;
                    mb.VisualBounds = masterBar.VisualBounds;
                    mb.RealBounds = masterBar.RealBounds;
                    sg.AddBar(mb);

                    foreach (var bar in masterBar.Bars)
                    {
                        var b = new BarBounds();
                        b.VisualBounds = bar.VisualBounds;
                        b.RealBounds = bar.RealBounds;
                        mb.AddBar(b);

                        foreach (var beat in bar.Beats)
                        {
                            var bb = new BeatBounds();
                            bb.VisualBounds = beat.VisualBounds;
                            bb.RealBounds = beat.RealBounds;

                            dynamic bd = beat;
                            bb.Beat = score
                                .Tracks[bd.TrackIndex]
                                .Staves[bd.StaffIndex]
                                .Bars[bd.BarIndex]
                                .Voices[bd.VoiceIndex]
                                .Beats[bd.BeatIndex];

                            if (beat.Notes != null)
                            {
                                bb.Notes = new FastList<NoteBounds>();
                                foreach (var note in beat.Notes)
                                {
                                    var n = new NoteBounds();
                                    dynamic nd = note;
                                    n.Note = bb.Beat.Notes[nd.Index];

                                    n.NoteHeadBounds = note.NoteHeadBounds;
                                    bb.AddNote(n);
                                }
                            }

                            b.AddBeat(bb);
                        }
                    }
                }
            }

            return lookup;
        }

        private Bounds BoundsToJson(Bounds bounds)
        {
            Bounds json = Platform.Platform.NewObject();
            json.X = bounds.X;
            json.Y = bounds.Y;
            json.W = bounds.W;
            json.H = bounds.H;
            return json;
        }
    }
}
