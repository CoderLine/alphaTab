/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    /// <summary>
    /// This small utilty public class allows the assignment of accidentals within a 
    /// desired scope. 
    /// </summary>
    public class AccidentalHelper
    {
        /// <summary>
        /// a lookup list containing an info whether the notes within an octave 
        /// need an accidental rendered. the accidental symbol is determined based on the type of key signature. 
        /// </summary>
        private static readonly bool[][] KeySignatureLookup =
        {
            // Flats (where the value is true, a flat accidental is required for the notes)
            new[] { true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true, true},
            new[] { true,  true,  true,  true,  true,  false, true,  true,  true,  true,  true, true},
            new[] { false, true,  true,  true,  true,  false, true,  true,  true,  true,  true, true},
            new[] { false, true,  true,  true,  true,  false, false, false, true,  true,  true, true},
            new[] { false, false, false, true,  true,  false, false, false, true,  true,  true, true},
            new[] { false, false, false, true,  true,  false, false, false, false, false, true, true},
            new[] { false, false, false, false, false, false, false, false, false, false, true, true},
            // natural
            new[] { false, false, false, false, false, false, false, false, false, false, false, false },
            // sharps  (where the value is true, a flat accidental is required for the notes)
            new[] {false, false, false, false, false, true, true, false, false, false, false, false},
            new[] {true,  true,  false, false, false, true, true, false, false, false, false, false},
            new[] {true,  true,  false, false, false, true, true, true,  true,  false, false, false},
            new[] {true,  true,  true,  true,  false, true, true, true,  true,  false, false, false},
            new[] {true,  true,  true,  true,  false, true, true, true,  true,  true,  true,  false},
            new[] {true,  true,  true,  true,  true,  true, true, true,  true,  true,  true,  false},
            new[] {true,  true,  true,  true,  true,  true, true, true,  true,  true,  true,  true }
       };

        /// <summary>
        /// Contains the list of notes within an octave have accidentals set.
        /// </summary>
        private static readonly bool[] AccidentalNotes =
        {
            false, true, false, true, false, false, true, false, true, false, true, false
        };

        /// <summary>
        /// We always have 7 steps per octave. 
        /// (by a step the offsets inbetween score lines is meant, 
        ///      0 steps is on the first line (counting from top)
        ///      1 steps is on the space inbetween the first and the second line
        /// </summary>
        private const int StepsPerOctave = 7;

        /// <summary>
        /// Those are the amount of steps for the different clefs in case of a note value 0    
        /// [Neutral, C3, C4, F4, G2]
        /// </summary>
        private static readonly int[] OctaveSteps = { 40, 34, 32, 28, 40 };

        /// <summary>
        /// The step offsets of the notes within an octave in case of for sharp keysignatures
        /// </summary>
        private static readonly int[] SharpNoteSteps = { 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 };

        /// <summary>
        /// The step offsets of the notes within an octave in case of for flat keysignatures
        /// </summary>
        private static readonly int[] FlatNoteSteps = { 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6 };

        private readonly FastDictionary<int, bool> _registeredAccidentals;

        private readonly FastDictionary<int, int> _appliedScoreLines;

        public AccidentalHelper()
        {
            _registeredAccidentals = new FastDictionary<int, bool>();
            _appliedScoreLines = new FastDictionary<int, int>();
        }

        /// <summary>
        /// Calculates the accidental for the given note and assignes the value to it. 
        /// The new accidental type is also registered within the current scope
        /// </summary>
        /// <param name="note"></param>
        /// <returns></returns>
        public AccidentalType ApplyAccidental(Note note)
        {
            var noteValue = note.RealValue;
            var ks = note.Beat.Voice.Bar.MasterBar.KeySignature;
            var ksi = (ks + 7);
            var index = (noteValue % 12);

            var accidentalToSet = AccidentalType.None;

            var line = RegisterNoteLine(note);

            if (!note.Beat.Voice.Bar.Staff.Track.IsPercussion)
            {
                // the key signature symbol required according to 
                var keySignatureAccidental = ksi < 7 ? AccidentalType.Flat : AccidentalType.Sharp;

                // determine whether the current note requires an accidental according to the key signature
                var hasNoteAccidentalForKeySignature = KeySignatureLookup[ksi][index];
                var isAccidentalNote = AccidentalNotes[index];

                var isAccidentalRegistered = _registeredAccidentals.ContainsKey(line);
                if (hasNoteAccidentalForKeySignature != isAccidentalNote && !isAccidentalRegistered)
                {
                    _registeredAccidentals[line] = true;
                    accidentalToSet = isAccidentalNote ? keySignatureAccidental : AccidentalType.Natural;
                }
                else if (hasNoteAccidentalForKeySignature == isAccidentalNote && isAccidentalRegistered)
                {
                    _registeredAccidentals.Remove(line);
                    accidentalToSet = isAccidentalNote ? keySignatureAccidental : AccidentalType.Natural;
                }
            }

            // TODO: change accidentalToSet according to note.AccidentalMode

            return accidentalToSet;
        }

        private int RegisterNoteLine(Note n)
        {
            var track = n.Beat.Voice.Bar.Staff.Track;
            var value = track.IsPercussion ? PercussionMapper.MapNoteForDisplay(n) : n.RealValue - track.DisplayTranspositionPitch;
            var ks = n.Beat.Voice.Bar.MasterBar.KeySignature;
            var clef = n.Beat.Voice.Bar.Clef;

            var index = value % 12;
            var octave = (value / 12) - 1;

            // Initial Position
            var steps = OctaveSteps[(int)clef];

            // Move to Octave
            steps -= (octave * StepsPerOctave);

            // get the step list for the current keySignature
            var stepList = ModelUtils.KeySignatureIsSharp(ks) || ModelUtils.KeySignatureIsNatural(ks)
                ? SharpNoteSteps
                : FlatNoteSteps;

            //Add offset for note itself
            int offset = 0;
            switch (n.AccidentalMode)
            {
                // TODO: provide line according to accidentalMode
                case NoteAccidentalMode.Default:
                case NoteAccidentalMode.SwapAccidentals:
                case NoteAccidentalMode.ForceNatural:
                case NoteAccidentalMode.ForceFlat:
                case NoteAccidentalMode.ForceSharp:
                default:
                    // normal behavior: simply use the position where 
                    // the keysignature defines the position 
                    offset = stepList[index];
                    break;
            }
            steps -= stepList[index];

            _appliedScoreLines[n.Id] = steps;

            return steps;
        }


        public int GetNoteLine(Note n)
        {
            return _appliedScoreLines[n.Id];
        }
    }

}
