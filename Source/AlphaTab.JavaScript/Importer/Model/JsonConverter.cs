/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;
using AlphaTab.Haxe;
using Haxe.Js.Html;
using Phase;

namespace AlphaTab.Model
{
    /// <summary>
    /// This class can convert a full <see cref="Score"/> instance to a simple JavaScript object and back for further
    /// JSON serialization. 
    /// </summary>
    class JsonConverter
    {
        /// <summary>
        /// Converts the given score into a JSON encoded string. 
        /// </summary>
        /// <param name="score">The score to serialize. </param>
        /// <returns>A JSON encoded string that can be used togehter with <see cref="JSONToScore"/> for conversion.</returns>
        public static string ScoreToJson(Score score)
        {
            var obj = ScoreToJsObject(score);
            return Json.Stringify(obj, (k, v) =>
            {
                if (ArrayBuffer.IsView(v))
                {
                    return Script.Write<object>("untyped __js__(\"Array.apply([], {0})\", v)");
                }
                return v;
            });
        }

        /// <summary>
        /// Converts the given JSON string back to a <see cref="Score"/> object. 
        /// </summary>
        /// <param name="json">The JSON string that was created via <see cref="ScoreToJSON"/></param>
        /// <param name="settings">The settings to use during conversion.</param>
        /// <returns>The converted score object.</returns>
        public static Score JsonToScore(string json, Settings settings = null)
        {
            return JsObjectToScore(JsObjectToScore(Json.Parse(json), settings));
        }

        /// <summary>
        /// Converts the score into a JavaScript object without circular dependencies. 
        /// </summary>
        /// <param name="score">The score object to serialize</param>
        /// <returns>A serialized score object without ciruclar dependencies that can be used for further serializations.</returns>
        public static object ScoreToJsObject(Score score)
        {
            Score score2 = Platform.Platform.NewObject();
            Score.CopyTo(score, score2);
            score2.MasterBars = new FastList<MasterBar>();
            score2.Tracks = new FastList<Track>();

            score2.Stylesheet = Platform.Platform.NewObject();
            RenderStylesheet.CopyTo(score.Stylesheet, score2.Stylesheet);

            #region MasterBars

            for (var i = 0; i < score.MasterBars.Count; i++)
            {
                MasterBar masterBar = score.MasterBars[i];
                MasterBar masterBar2 = Platform.Platform.NewObject();
                MasterBar.CopyTo(masterBar, masterBar2);
                if (masterBar.TempoAutomation != null)
                {
                    masterBar2.TempoAutomation = Platform.Platform.NewObject();
                    Automation.CopyTo(masterBar.TempoAutomation, masterBar2.TempoAutomation);
                }
                if (masterBar.Section != null)
                {
                    masterBar2.Section = Platform.Platform.NewObject();
                    Section.CopyTo(masterBar.Section, masterBar2.Section);
                }

                masterBar2.Fermata = Platform.Platform.NewObject();
                foreach (var offset in masterBar.Fermata)
                {
                    var fermata = masterBar.Fermata[offset];
                    var fermata2 = masterBar2.Fermata[offset] = Platform.Platform.NewObject();
                    Fermata.CopyTo(fermata, fermata2);
                }

                score2.MasterBars.Add(masterBar2);
            }

            #endregion

            #region Tracks

            for (int t = 0; t < score.Tracks.Count; t++)
            {
                var track = score.Tracks[t];
                Track track2 = Platform.Platform.NewObject();
                track2.Color = Platform.Platform.NewObject();
                Track.CopyTo(track, track2);

                track2.PlaybackInfo = Platform.Platform.NewObject();
                PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);


                #region Staves
                track2.Staves = new FastList<Staff>();

                for (int s = 0; s < track.Staves.Count; s++)
                {
                    var staff = track.Staves[s];
                    Staff staff2 = Platform.Platform.NewObject();
                    Staff.CopyTo(staff, staff2);

                    staff2.Chords = new FastDictionary<string, Chord>();
                    foreach (var key in staff.Chords)
                    {
                        var chord = staff.Chords[key];
                        Chord chord2 = Platform.Platform.NewObject();
                        Chord.CopyTo(chord, chord2);
                        staff2.Chords[key] = chord;
                    }

                    #region Bars

                    staff2.Bars = new FastList<Bar>();
                    for (int b = 0; b < staff.Bars.Count; b++)
                    {
                        var bar = staff.Bars[b];
                        Bar bar2 = Platform.Platform.NewObject();
                        Bar.CopyTo(bar, bar2);

                        #region Voices

                        bar2.Voices = new FastList<Voice>();
                        for (int v = 0; v < bar.Voices.Count; v++)
                        {
                            var voice = bar.Voices[v];
                            Voice voice2 = Platform.Platform.NewObject();
                            Voice.CopyTo(voice, voice2);

                            #region Beats

                            voice2.Beats = new FastList<Beat>();
                            for (int bb = 0; bb < voice.Beats.Count; bb++)
                            {
                                var beat = voice.Beats[bb];
                                Beat beat2 = Platform.Platform.NewObject();
                                Beat.CopyTo(beat, beat2);

                                beat2.Automations = new FastList<Automation>();
                                for (int a = 0; a < beat.Automations.Count; a++)
                                {
                                    Automation automation = Platform.Platform.NewObject();
                                    Automation.CopyTo(beat.Automations[a], automation);
                                    beat2.Automations.Add(automation);
                                }

                                beat2.WhammyBarPoints = new FastList<BendPoint>();
                                for (int i = 0; i < beat.WhammyBarPoints.Count; i++)
                                {
                                    BendPoint point = Platform.Platform.NewObject();
                                    BendPoint.CopyTo(beat.WhammyBarPoints[i], point);
                                    beat2.WhammyBarPoints.Add(point);
                                }

                                #region Notes

                                beat2.Notes = new FastList<Note>();
                                for (int n = 0; n < beat.Notes.Count; n++)
                                {
                                    var note = beat.Notes[n];
                                    Note note2 = Platform.Platform.NewObject();
                                    Note.CopyTo(note, note2);

                                    note2.BendPoints = new FastList<BendPoint>();
                                    for (int i = 0; i < note.BendPoints.Count; i++)
                                    {
                                        BendPoint point = Platform.Platform.NewObject();
                                        BendPoint.CopyTo(note.BendPoints[i], point);
                                        note2.BendPoints.Add(point);
                                    }

                                    beat2.Notes.Add(note2);
                                }

                                #endregion

                                voice2.Beats.Add(beat2);
                            }

                            #endregion

                            bar2.Voices.Add(voice2);
                        }

                        #endregion

                        staff2.Bars.Add(bar2);
                    }

                    #endregion
                    track2.Staves.Add(staff2);
                }

                #endregion

                score2.Tracks.Add(track2);
            }

            #endregion

            return score2;
        }

        /// <summary>
        /// Converts the given JavaScript object into a score object. 
        /// </summary>
        /// <param name="jsObject">The javascript object created via <see cref="ScoreToJsObject"/></param>
        /// <param name="settings">The settings to use during conversion.</param>
        /// <returns>The converted score object.</returns>
        public static Score JsObjectToScore(object jsObject, Settings settings = null)
        {
            Score score = jsObject.As<Score>();
            var score2 = new Score();
            Score.CopyTo(score, score2);
            RenderStylesheet.CopyTo(score.Stylesheet, score2.Stylesheet);

            #region MasterBars

            for (var i = 0; i < score.MasterBars.Count; i++)
            {
                var masterBar = score.MasterBars[i];
                var masterBar2 = new MasterBar();
                MasterBar.CopyTo(masterBar, masterBar2);
                if (masterBar.TempoAutomation != null)
                {
                    masterBar2.TempoAutomation = new Automation();
                    Automation.CopyTo(masterBar.TempoAutomation, masterBar2.TempoAutomation);
                }
                if (masterBar.Section != null)
                {
                    masterBar2.Section = new Section();
                    Section.CopyTo(masterBar.Section, masterBar2.Section);
                }

                foreach (var offset in masterBar.Fermata)
                {
                    var fermata = masterBar.Fermata[offset];
                    var fermata2 = new Fermata();
                    Fermata.CopyTo(fermata, fermata2);
                    masterBar2.AddFermata(offset, fermata2);
                }


                score2.AddMasterBar(masterBar2);
            }

            #endregion

            #region Tracks

            for (int t = 0; t < score.Tracks.Count; t++)
            {
                var track = score.Tracks[t];
                var track2 = new Track(track.Staves.Count);
                Track.CopyTo(track, track2);
                score2.AddTrack(track2);

                PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);


                #region Staves

                for (var s = 0; s < track.Staves.Count; s++)
                {
                    var staff = track.Staves[s];
                    var staff2 = track2.Staves[s];
                    Staff.CopyTo(staff, staff2);


                    foreach (var key in staff.Chords)
                    {
                        var chord = staff.Chords[key];
                        var chord2 = new Chord();
                        Chord.CopyTo(chord, chord2);
                        staff2.Chords[key] = chord2;
                    }
                    #region Bars

                    for (int b = 0; b < staff.Bars.Count; b++)
                    {
                        var bar = staff.Bars[b];
                        var bar2 = new Bar();
                        Bar.CopyTo(bar, bar2);
                        staff2.AddBar(bar2);

                        #region Voices

                        for (int v = 0; v < bar.Voices.Count; v++)
                        {
                            var voice = bar.Voices[v];
                            var voice2 = new Voice();
                            Voice.CopyTo(voice, voice2);
                            bar2.AddVoice(voice2);

                            #region Beats

                            for (int bb = 0; bb < voice.Beats.Count; bb++)
                            {
                                var beat = voice.Beats[bb];
                                var beat2 = new Beat();
                                Beat.CopyTo(beat, beat2);
                                voice2.AddBeat(beat2);

                                for (int a = 0; a < beat.Automations.Count; a++)
                                {
                                    var automation = new Automation();
                                    Automation.CopyTo(beat.Automations[a], automation);
                                    beat2.Automations.Add(automation);
                                }

                                for (int i = 0; i < beat.WhammyBarPoints.Count; i++)
                                {
                                    var point = new BendPoint();
                                    BendPoint.CopyTo(beat.WhammyBarPoints[i], point);
                                    beat2.AddWhammyBarPoint(point);
                                }

                                #region Notes

                                for (int n = 0; n < beat.Notes.Count; n++)
                                {
                                    var note = beat.Notes[n];
                                    var note2 = new Note();
                                    Note.CopyTo(note, note2);
                                    beat2.AddNote(note2);

                                    for (int i = 0; i < note.BendPoints.Count; i++)
                                    {
                                        var point = new BendPoint();
                                        BendPoint.CopyTo(note.BendPoints[i], point);
                                        note2.AddBendPoint(point);
                                    }
                                }

                                #endregion
                            }

                            #endregion
                        }

                        #endregion
                    }

                    #endregion

                }
                #endregion
            }

            #endregion

            score2.Finish(settings);
            return score2;
        }

        internal static MidiFile JsObjectToMidiFile(dynamic midi)
        {
            var midi2 = new MidiFile();
            midi2.Division = midi.Division;

            FastList<dynamic> midiEvents = midi.Events;
            foreach (var midiEvent in midiEvents)
            {
                int tick = midiEvent.Tick;
                int message = midiEvent.Message;
                MidiEvent midiEvent2;
                switch (midiEvent.Type)
                {
                    case "alphaTab.audio.synth.midi.event.SystemExclusiveEvent":
                        midiEvent2 = new SystemExclusiveEvent(tick, 0, 0, midiEvent.Data);
                        midiEvent2.Message = message;
                        break;
                    case "alphaTab.audio.synth.midi.event.MetaDataEvent":
                        midiEvent2 = new MetaDataEvent(tick, 0, 0, midiEvent.Data);
                        midiEvent2.Message = message;
                        break;
                    case "alphaTab.audio.synth.midi.event.MetaNumberEvent":
                        midiEvent2 = new MetaNumberEvent(tick, 0, 0, midiEvent.Value);
                        midiEvent2.Message = message;
                        break;
                    default:
                        midiEvent2 = new MidiEvent(tick, 0, 0, 0);
                        midiEvent2.Message = message;
                        break;
                }
                midi2.Events.Add(midiEvent2);
            }

            return midi2;
        }

        internal static object MidiFileToJsObject(MidiFile midi)
        {
            var midi2 = Platform.Platform.NewObject();
            midi2.Division = midi.Division;
            var midiEvents = new FastList<object>();
            midi2.Events = midiEvents;
            foreach (var midiEvent in midi.Events)
            {
                var midiEvent2 = Platform.Platform.NewObject();
                midiEvents.Add(midiEvent2);
                midiEvent2.Type = Platform.Platform.GetTypeName(midiEvent);
                midiEvent2.Tick = midiEvent.Tick;
                midiEvent2.Message = midiEvent.Message;
                switch (midiEvent2.Type)
                {
                    case "alphaTab.audio.synth.midi.event.SystemExclusiveEvent":
                        SystemExclusiveEvent sysex = (SystemExclusiveEvent)midiEvent;
                        midiEvent2.Data = sysex.Data;
                        break;
                    case "alphaTab.audio.synth.midi.event.MetaDataEvent":
                        MetaDataEvent metadata = (MetaDataEvent)midiEvent;
                        midiEvent2.Data = metadata.Data;
                        break;
                    case "alphaTab.audio.synth.midi.event.MetaNumberEvent":
                        MetaNumberEvent metanumber = (MetaNumberEvent)midiEvent;
                        midiEvent2.Value = metanumber.Value;
                        break;
                }
            }

            return midi2;
        }
    }
}
