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

using System;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    /// <summary>
    /// This small utilty public class allows the assignment of accidentals within a 
    /// desired scope. 
    /// </summary>
    class AccidentalHelper
    {
        private readonly Bar _bar;

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
        private readonly FastDictionary<int, int> _appliedScoreLinesByValue;
        private readonly FastDictionary<int, Note> _notesByValue;

        public Beat MaxNoteValueBeat { get; set; }
        public Beat MinNoteValueBeat { get; set; }
        public int MaxNoteValue { get; set; }
        public int MinNoteValue { get; set; }

        public AccidentalHelper(Bar bar)
        {
            _bar = bar;
            _registeredAccidentals = new FastDictionary<int, bool>();
            _appliedScoreLines = new FastDictionary<int, int>();
            _appliedScoreLinesByValue = new FastDictionary<int, int>();
            _notesByValue = new FastDictionary<int, Note>();

            MaxNoteValue = -1;
            MinNoteValue = -1;
        }

        /// <summary>
        /// Calculates the accidental for the given note and assignes the value to it. 
        /// The new accidental type is also registered within the current scope
        /// </summary>
        /// <param name="note"></param>
        /// <returns></returns>
        public AccidentalType ApplyAccidental(Note note)
        {
            var noteValue = note.DisplayValue;
            bool quarterBend = note.HasQuarterToneOffset;
            var line = RegisterNoteLine(note, noteValue);
            if (MinNoteValue == -1 || noteValue < MinNoteValue)
            {
                MinNoteValue = noteValue;
                MinNoteValueBeat = note.Beat;
            }
            if (MaxNoteValue == -1 || noteValue > MaxNoteValue)
            {
                MaxNoteValue = noteValue;
                MaxNoteValueBeat = note.Beat;
            }
            return GetAccidental(line, noteValue, quarterBend);
        }

        /// <summary>
        /// Calculates the accidental for the given note value and assignes the value to it. 
        /// The new accidental type is also registered within the current scope
        /// </summary>
        /// <param name="note"></param>
        /// <returns></returns>
        public AccidentalType ApplyAccidentalForValue(Beat relatedBeat, int noteValue, bool quarterBend)
        {
            var line = RegisterNoteValueLine(noteValue);
            if (MinNoteValue == -1 || noteValue < MinNoteValue)
            {
                MinNoteValue = noteValue;
                MinNoteValueBeat = relatedBeat;
            }
            if (MaxNoteValue == -1 || noteValue > MaxNoteValue)
            {
                MaxNoteValue = noteValue;
                MaxNoteValueBeat = relatedBeat;
            }
            return GetAccidental(line, noteValue, quarterBend);
        }

        private AccidentalType GetAccidental(int line, int noteValue, bool quarterBend)
        { 
            var accidentalToSet = AccidentalType.None;
            if (_bar.Staff.StaffKind != StaffKind.Percussion)
            {
                var ks = _bar.MasterBar.KeySignature;
                var ksi = (ks + 7);
                var index = (noteValue % 12);

                // the key signature symbol required according to 
                var keySignatureAccidental = ksi < 7 ? AccidentalType.Flat : AccidentalType.Sharp;

                // determine whether the current note requires an accidental according to the key signature
                var hasNoteAccidentalForKeySignature = KeySignatureLookup[ksi][index];
                var isAccidentalNote = AccidentalNotes[index];

                if (quarterBend)
                {
                    accidentalToSet = isAccidentalNote ? keySignatureAccidental : AccidentalType.Natural;
                }
                else
                {
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
            }

            // TODO: change accidentalToSet according to note.AccidentalMode

            if (quarterBend)
            {
                switch (accidentalToSet)
                {
                    case AccidentalType.Natural:
                        return AccidentalType.NaturalQuarterNoteUp;
                    case AccidentalType.Sharp:
                        return AccidentalType.SharpQuarterNoteUp;
                    case AccidentalType.Flat:
                        return AccidentalType.FlatQuarterNoteUp;
                }
            }

            return accidentalToSet;
        }

        private int RegisterNoteLine(Note n, int noteValue)
        {
            var steps = CalculateNoteLine(noteValue, n.AccidentalMode);
            _appliedScoreLines[n.Id] = steps;
            _notesByValue[noteValue] = n;
            return steps;
        }

        private int RegisterNoteValueLine(int noteValue)
        {
            var steps = CalculateNoteLine(noteValue, NoteAccidentalMode.Default);
            _appliedScoreLinesByValue[noteValue] = steps;
            return steps;
        }

        private int CalculateNoteLine(int noteValue, NoteAccidentalMode mode)
        {
            var staff = _bar.Staff;
            var value = staff.StaffKind == StaffKind.Percussion 
                ? PercussionMapper.MapNoteForDisplay(noteValue) 
                : noteValue;
            var ks = _bar.MasterBar.KeySignature;
            var clef = _bar.Clef;

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
            switch (mode)
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

            return steps;
        }


        public int GetNoteLine(Note n)
        {
            return _appliedScoreLines[n.Id];
        }

        public int GetNoteLineForValue(int rawValue, bool searchForNote = false)
        {
            if (_appliedScoreLinesByValue.ContainsKey(rawValue))
            {
                return _appliedScoreLinesByValue[rawValue];
            }

            if (searchForNote && _notesByValue.ContainsKey(rawValue))
            {
                return GetNoteLine(_notesByValue[rawValue]);
            }
            else
            {
                return 0;
            }
        }
    }

}
