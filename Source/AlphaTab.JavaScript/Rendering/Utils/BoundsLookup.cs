using AlphaTab.Collections;
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
                            var bb = Platform.Platform.NewObject();

                            bb.VisualBounds = BoundsToJson(beat.VisualBounds);
                            bb.RealBounds = BoundsToJson(beat.RealBounds);
                            bb.BeatIndex = beat.Beat.Index;
                            bb.VoiceIndex = beat.Beat.Voice.Index;
                            bb.BarIndex = beat.Beat.Voice.Bar.Index;
                            bb.StaffIndex = beat.Beat.Voice.Bar.Staff.Index;
                            bb.TrackIndex = beat.Beat.Voice.Bar.Staff.Track.Index;

                            if (beat.Notes != null)
                            {
                                FastList<NoteBounds> notes = bb.Notes = new FastList<NoteBounds>();

                                foreach (var note in beat.Notes)
                                {
                                    var n = Platform.Platform.NewObject();
                                    n.Index = note.Note.Index;
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

            var staveGroups = json.Member<FastList<StaveGroupBounds>>("StaveGroups");
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
                            bb.Beat = score
                                .Tracks[beat.Member<int>("TrackIndex")]
                                .Staves[beat.Member<int>("StaffIndex")]
                                .Bars[beat.Member<int>("BarIndex")]
                                .Voices[beat.Member<int>("VoiceIndex")]
                                .Beats[beat.Member<int>("BeatIndex")];

                            if (beat.Notes != null)
                            {
                                bb.Notes = new FastList<NoteBounds>();
                                foreach (var note in beat.Notes)
                                {
                                    var n = new NoteBounds();
                                    n.Note = bb.Beat.Notes[note.Member<int>("Index")];
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
            var json = Platform.Platform.NewObject();
            json.X = bounds.X;
            json.Y = bounds.Y;
            json.W = bounds.W;
            json.H = bounds.H;
            return json;
        }
    }
}
