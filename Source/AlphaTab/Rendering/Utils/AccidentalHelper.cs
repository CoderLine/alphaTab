using System.Collections.Generic;
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
        /// this int-hash stores the registered accidentals for
        /// all octaves and notes within an octave. 
        /// </summary>
        private readonly Dictionary<int, AccidentalType> _registeredAccidentals;

        public AccidentalHelper()
        {
            _registeredAccidentals = new Dictionary<int, AccidentalType>();
        }

        /// <summary>
        /// Calculates the accidental for the given note and assignes the value to it. 
        /// The new accidental type is also registered within the current scope
        /// </summary>
        /// <param name="note"></param>
        /// <param name="noteLine"></param>
        /// <returns></returns>
        public AccidentalType ApplyAccidental(Note note, int noteLine)
        {
            // TODO: we need to check for note.swapAccidentals 
            var noteValue = note.RealValue;
            var ks = note.Beat.Voice.Bar.MasterBar.KeySignature;
            var ksi = (ks + 7);
            var index = (noteValue % 12);
            //var octave = (noteValue / 12);

            AccidentalType accidentalToSet = AccidentalNotes[ksi][index];

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
    }

}
