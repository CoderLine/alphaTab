/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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

using System;
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
        private static readonly AccidentalType[][] AccidentalNotes =
        {
            // Flats
            new[] {AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural }, // 7 AccidentalType.Flats
            new[] {AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural}, // 6 AccidentalType.Flats
            new[] {AccidentalType.None, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural}, // 5 AccidentalType.Flats
            new[] {AccidentalType.None, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural}, // 4 AccidentalType.Flats
            new[] {AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural}, // 3 AccidentalType.Flats
            new[] {AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural, AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural},  // 2 AccidentalType.Flats
            new[] {AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.Flat, AccidentalType.Natural, AccidentalType.None, AccidentalType.Natural},  // 1 AccidentalType.Flat
            // Natural
            new []{AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None},  
            // Sharps
            new []{AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None},  // 1 AccidentalType.Sharp
            new []{AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None},  // 2 AccidentalType.Sharps
            new []{AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None},  // 3 AccidentalType.Sharps
            new []{AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Sharp, AccidentalType.None},  // 4 AccidentalType.Sharps
            new []{AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None},  // 5 AccidentalType.Sharps
            new []{AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.None},  // 6 AccidentalType.Sharps
            new []{AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural, AccidentalType.Sharp, AccidentalType.Natural}  // 7 AccidentalType.Sharps
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
        private static readonly int[] OctaveSteps = { 38, 32, 30, 26, 38 };

        /// <summary>
        /// The step offsets of the notes within an octave in case of for sharp keysignatures
        /// </summary>
        private static readonly int[] SharpNoteSteps = { 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 };

        /// <summary>
        /// The step offsets of the notes within an octave in case of for flat keysignatures
        /// </summary>
        private static readonly int[] FlatNoteSteps = { 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6 };

        /// <summary>
        /// this int-hash stores the registered accidentals for
        /// all octaves and notes within an octave. 
        /// </summary>
        private readonly FastDictionary<int, AccidentalType> _registeredAccidentals;

        private const int NoteStepCorrection = 1;

        private readonly FastDictionary<string, int> _appliedScoreLines;

        public AccidentalHelper()
        {
            _registeredAccidentals = new FastDictionary<int, AccidentalType>();
            _appliedScoreLines = new FastDictionary<string, int>();
        }

        private string GetNoteId(Note n)
        {
            return n.Beat.Index + "-" + n.String;
        }

        /// <summary>
        /// Calculates the accidental for the given note and assignes the value to it. 
        /// The new accidental type is also registered within the current scope
        /// </summary>
        /// <param name="note"></param>
        /// <param name="noteLine"></param>
        /// <returns></returns>
        public AccidentalType ApplyAccidental(Note note)
        {
            var noteValue = note.RealValue;
            var ks = note.Beat.Voice.Bar.MasterBar.KeySignature;
            var ksi = (ks + 7);
            var index = (noteValue % 12);
            //var octave = (noteValue / 12);

            AccidentalType accidentalToSet = AccidentalNotes[ksi][index];

            // calculate the line where the note will be according to the accidental
            int noteLine = GetNoteLineWithAccidental(note, accidentalToSet);

            // TODO: change accidentalToSet according to note.AccidentalMode

            // if there is already an accidental registered, we check if we 
            // have a new accidental
            var updateAccidental = true;
            if (_registeredAccidentals.ContainsKey(noteLine))
            {
                var registeredAccidental = _registeredAccidentals[noteLine];

                // we only need to do anything if we are changing the accidental
                if (registeredAccidental == accidentalToSet)
                {
                    // we set the accidental to none, as the accidental is already set by a previous note
                    accidentalToSet = AccidentalType.None;
                    updateAccidental = false;
                }
                // check if we need naturalizing
                else if (accidentalToSet == AccidentalType.None)
                {
                    accidentalToSet = AccidentalType.Natural;
                }
            }

            if (updateAccidental)
            {
                if ((accidentalToSet == AccidentalType.None || accidentalToSet == AccidentalType.Natural))
                {
                    _registeredAccidentals.Remove(noteLine);
                }
                else
                {
                    _registeredAccidentals[noteLine] = accidentalToSet;
                }
            }

            return accidentalToSet;
        }

        private int GetNoteLineWithAccidental(Note n, AccidentalType accidentalToSet)
        {
            var value = n.Beat.Voice.Bar.Track.IsPercussion ? PercussionMapper.MapValue(n) : n.RealValue;
            var ks = n.Beat.Voice.Bar.MasterBar.KeySignature;
            var clef = n.Beat.Voice.Bar.Clef;

            var index = value % 12;
            var octave = (value / 12);

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

            // TODO: It seems note heads are always one step above the calculated line 
            // maybe the SVG paths are wrong, need to recheck where step=0 is really placed
            var line = steps + NoteStepCorrection;
            _appliedScoreLines[GetNoteId(n)] = line;
            return line;
        }


        public int GetNoteLine(Note n)
        {
            return _appliedScoreLines[GetNoteId(n)];
        }
    }

}
