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
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    enum BeamDirection
    {
        Up,
        Down
    }

    /// <summary>
    /// Lists all types how two voices can be joined with bars.
    /// </summary>
    enum BeamBarType
    {
        /// <summary>
        /// Full Bar from current to next
        /// </summary>
        Full,
        /// <summary>
        /// A small Bar from current to previous
        /// </summary>
        PartLeft,
        /// <summary>
        /// A small bar from current to next
        /// </summary>
        PartRight
    }

    interface IBeamYCalculator
    {
        float GetYPositionForNoteValue(int noteValue);
    }

    class BeatLinePositions
    {
        public string StaffId { get; set; }
        public float Up { get; set; }
        public float Down { get; set; }

        public int MinNoteValue { get; set; }
        public int MaxNoteValue { get; set; }

        public BeatLinePositions()
        {
        }
    }

    /// <summary>
    /// This public class helps drawing beams and bars for notes.
    /// </summary>
    class BeamingHelper
    {
        private static readonly int[] ScoreMiddleKeys = { 60, 60, 57, 50, 71 };

        private readonly Staff _staff;

        /// <summary>
        /// stores the X-positions for beat indices
        /// </summary>
        private readonly FastDictionary<int, BeatLinePositions> _beatLineXPositions;

        public Voice Voice { get; set; }
        public FastList<Beat> Beats { get; set; }
        public Duration ShortestDuration { get; set; }

        /// <summary>
        /// the number of fingering indicators that will be drawn
        /// </summary>
        public int FingeringCount { get; set; }

        /// <summary>
        /// an indicator whether any beat has a tuplet on it. 
        /// </summary>
        public bool HasTuplet { get; set; }

        /// <summary>
        /// the first min note within this group
        /// </summary>
        public int FirstMinNoteValue { get; set; }

        /// <summary>
        /// the first max note within this group
        /// </summary>
        public int FirstMaxNoteValue { get; set; }

        /// <summary>
        /// the last min note within this group
        /// </summary>
        public int LastMinNoteValue { get; set; }

        /// <summary>
        /// the last max note within this group
        /// </summary>
        public int LastMaxNoteValue { get; set; }

        /// <summary>
        /// the overall min note value within this group. 
        /// This includes values caused by bends. 
        /// </summary>
        public int MinNoteValue { get; set; }

        public Beat MinNoteBeat { get; set; }

        /// <summary>
        /// the overall max note value within this group
        /// This includes values caused by bends. 
        /// </summary>
        public int MaxNoteValue { get; set; }

        public Beat MaxNoteBeat { get; set; }

        public bool InvertBeamDirection { get; set; }

        public bool IsGrace { get; set; }

        public BeamingHelper(Staff staff)
        {
            _staff = staff;

            Beats = new FastList<Beat>();
            _beatLineXPositions = new FastDictionary<int, BeatLinePositions>();
            ShortestDuration = Duration.QuadrupleWhole;
            MaxNoteValue = int.MinValue;
            MinNoteValue = int.MinValue;
            FirstMinNoteValue = int.MinValue;
            FirstMaxNoteValue = int.MinValue;
            LastMinNoteValue = int.MinValue;
            LastMaxNoteValue = int.MinValue;
        }

        private int GetValue(Note n)
        {
            if (_staff.StaffKind == StaffKind.Percussion)
            {
                return PercussionMapper.MapNoteForDisplay(n.RealValue);
            }
            else
            {
                return n.DisplayValue;
            }
        }

        private int GetMaxValue(Note n)
        {
            int value = GetValue(n);
            if (n.HarmonicType != HarmonicType.None && n.HarmonicType != HarmonicType.Natural)
            {
                value = n.RealValue - _staff.DisplayTranspositionPitch;
            }

            return value;
        }

        private int GetMinValue(Note n)
        {
            int value = GetValue(n);
            return value;
        }


        public float GetBeatLineX(Beat beat)
        {
            if (HasBeatLineX(beat))
            {
                if (Direction == BeamDirection.Up)
                {
                    return (int)_beatLineXPositions[beat.Index].Up;
                }
                return (int)_beatLineXPositions[beat.Index].Down;
            }
            return 0;
        }

        public bool HasBeatLineX(Beat beat)
        {
            return _beatLineXPositions.ContainsKey(beat.Index);
        }

        public void RegisterBeatLineX(string staffId, Beat beat, float up, float down)
        {
            var positions = GetOrCreateBeatPositions(beat);
            positions.StaffId = staffId;
            positions.Up = up;
            positions.Down = down;
        }

        private BeatLinePositions GetOrCreateBeatPositions(Beat beat)
        {
            return _beatLineXPositions.ContainsKey(beat.Index)
                ? _beatLineXPositions[beat.Index]
                : (_beatLineXPositions[beat.Index] = new BeatLinePositions());
        }

        public BeamDirection Direction { get; private set; }

        public void Finish()
        {
            Direction = CalculateDirection();
        }

        private BeamDirection CalculateDirection()
        {
            // multivoice handling
            if (Voice.Index > 0)
            {
                return Invert(BeamDirection.Down);
            }
            if (Voice.Bar.Voices.Count > 1)
            {
                for (int v = 1; v < Voice.Bar.Voices.Count; v++)
                {
                    if (!Voice.Bar.Voices[v].IsEmpty)
                    {
                        return Invert(BeamDirection.Up);
                    }
                }
            }

            if (Beats[0].GraceType != GraceType.None)
            {
                return Invert(BeamDirection.Up);
            }

            // the average key is used for determination
            //      key lowerequal than middle line -> up
            //      key higher than middle line -> down
            var avg = (MaxNoteValue + MinNoteValue) / 2;
            return Invert(avg < ScoreMiddleKeys[(int)Beats[Beats.Count - 1].Voice.Bar.Clef] ? BeamDirection.Up : BeamDirection.Down);
        }

        private BeamDirection Invert(BeamDirection direction)
        {
            if (!InvertBeamDirection) return direction;
            switch (direction)
            {
                case BeamDirection.Down:
                    return BeamDirection.Up;
                case BeamDirection.Up:
                    return BeamDirection.Down;
            }
            return BeamDirection.Up;
        }


        public bool CheckBeat(Beat beat)
        {
            if (beat.InvertBeamDirection)
            {
                InvertBeamDirection = true;
            }

            if (Voice == null)
            {
                Voice = beat.Voice;
            }
            // allow adding if there are no beats yet
            var add = false;
            var lastBeat = Beats[Beats.Count - 1];
            if (Beats.Count == 0)
            {
                add = true;
            }
            else if (CanJoin(lastBeat, beat))
            {
                add = true;
            }

            if (add)
            {
                Beats.Add(beat);
                if (beat.GraceType != GraceType.None)
                {
                    IsGrace = true;
                }

                var positions = GetOrCreateBeatPositions(beat);

                if (beat.HasTuplet)
                {
                    HasTuplet = true;
                }

                int fingeringCount = 0;
                for (var n = 0; n < beat.Notes.Count; n++)
                {
                    var note = beat.Notes[n];
                    if (note.LeftHandFinger != Fingers.Unknown || note.RightHandFinger != Fingers.Unknown)
                    {
                        fingeringCount++;
                    }
                }

                if (fingeringCount > FingeringCount)
                {
                    FingeringCount = fingeringCount;
                }

                LastMinNoteValue = int.MinValue;
                LastMaxNoteValue = int.MinValue;

                CheckNote(beat.MinNote);
                CheckNote(beat.MaxNote);

                positions.MinNoteValue = LastMinNoteValue;
                positions.MaxNoteValue = LastMaxNoteValue;

                if (ShortestDuration < beat.Duration)
                {
                    ShortestDuration = beat.Duration;
                }

                if (beat.HasTuplet)
                {
                    HasTuplet = true;
                }
            }

            return add;
        }

        private void CheckNote(Note note)
        {
            var value = GetValue(note);

            if (Beats.Count == 1 && Beats[0] == note.Beat)
            {
                if (FirstMinNoteValue == int.MinValue || value < FirstMinNoteValue)
                {
                    FirstMinNoteValue = value;
                }
                if (FirstMaxNoteValue == int.MinValue || value > FirstMaxNoteValue)
                {
                    FirstMaxNoteValue = value;
                }
            }

            if (LastMinNoteValue == int.MinValue || value < LastMinNoteValue)
            {
                LastMinNoteValue = value;
            }
            if (LastMaxNoteValue == int.MinValue || value > LastMaxNoteValue)
            {
                LastMaxNoteValue = value;
            }

            var minValue = GetMinValue(note);
            if (MinNoteValue == int.MinValue || MinNoteValue > minValue)
            {
                MinNoteValue = minValue;
                MinNoteBeat = note.Beat;
            }

            var maxValue = GetMaxValue(note);
            if (MaxNoteValue == int.MinValue || MaxNoteValue < maxValue)
            {
                MaxNoteValue = maxValue;
                MaxNoteBeat= note.Beat;
            }
        }

        public float CalculateBeamY(float stemSize, float xCorrection, float xPosition, float scale, IBeamYCalculator yPosition)
        {
            return CalculateBeamYWithDirection(stemSize, xCorrection, xPosition, scale, yPosition, Direction);
        }

        public float CalculateBeamYWithDirection(float stemSize, float xCorrection, float xPosition, float scale, IBeamYCalculator yPosition, BeamDirection direction)
        {
            // create a line between the min and max note of the group
            if (Beats.Count == 1)
            {
                if (direction == BeamDirection.Up)
                {
                    return yPosition.GetYPositionForNoteValue(MaxNoteValue) - stemSize;
                }
                return yPosition.GetYPositionForNoteValue(MinNoteValue) + stemSize;
            }

            // we use the min/max notes to place the beam along their real position        
            // we only want a maximum of 10 offset for their gradient
            var maxDistance = (10 * scale);


            // if the min note is not first or last, we can align notes directly to the position
            // of the min note
            if (direction == BeamDirection.Down && MinNoteBeat != Beats[0] && MinNoteBeat != Beats[Beats.Count - 1])
            {
                return yPosition.GetYPositionForNoteValue(MinNoteValue) + stemSize;
            }
            if (direction == BeamDirection.Up && MaxNoteBeat != Beats[0] && MinNoteBeat != Beats[Beats.Count - 1])
            {
                return yPosition.GetYPositionForNoteValue(MaxNoteValue) - stemSize;
            }

            float startX = GetBeatLineX(Beats[0]) + xCorrection;
            float startY = direction == BeamDirection.Up
                            ? yPosition.GetYPositionForNoteValue(FirstMaxNoteValue) - stemSize
                            : yPosition.GetYPositionForNoteValue(FirstMinNoteValue) + stemSize;

            float endX = GetBeatLineX(Beats[Beats.Count - 1]) + xCorrection;
            float endY = direction == BeamDirection.Up
                            ? yPosition.GetYPositionForNoteValue(LastMaxNoteValue) - stemSize
                            : yPosition.GetYPositionForNoteValue(LastMinNoteValue) + stemSize;

            // ensure the maxDistance
            if (direction == BeamDirection.Down && startY > endY && (startY - endY) > maxDistance) endY = (startY - maxDistance);
            if (direction == BeamDirection.Down && endY > startY && (endY - startY) > maxDistance) startY = (endY - maxDistance);

            if (direction == BeamDirection.Up && startY < endY && (endY - startY) > maxDistance) endY = (startY + maxDistance);
            if (direction == BeamDirection.Up && endY < startY && (startY - endY) > maxDistance) startY = (endY + maxDistance);

            // get the y position of the given beat on this curve

            if (startX == endX) return startY;

            // y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
            return ((endY - startY) / (endX - startX)) * (xPosition - startX) + startY;
        }

        // TODO: Check if this beaming is really correct, I'm not sure if we are connecting beats correctly
        private static bool CanJoin(Beat b1, Beat b2)
        {
            // is this a voice we can join with?
            if (b1 == null || b2 == null || b1.IsRest || b2.IsRest || b1.GraceType != b2.GraceType || b1.GraceType == GraceType.BendGrace || b2.GraceType == GraceType.BendGrace)
            {
                return false;
            }

            var m1 = b1.Voice.Bar;
            var m2 = b1.Voice.Bar;
            // only join on same measure
            if (m1 != m2) return false;

            // get times of those voices and check if the times 
            // are in the same division
            var start1 = b1.PlaybackStart;
            var start2 = b2.PlaybackStart;

            // we can only join 8th, 16th, 32th and 64th voices
            if (!CanJoinDuration(b1.Duration) || !CanJoinDuration(b2.Duration))
            {
                return start1 == start2;
            }

            // TODO: create more rules for automatic beaming
            var divisionLength = MidiUtils.QuarterTime;
            switch (m1.MasterBar.TimeSignatureDenominator)
            {
                case 8:
                    if (m1.MasterBar.TimeSignatureNumerator % 3 == 0)
                    {
                        divisionLength += MidiUtils.QuarterTime / 2;
                    }
                    break;
            }

            // check if they are on the same division 
            var division1 = ((divisionLength + start1) / divisionLength) | 0;
            var division2 = ((divisionLength + start2) / divisionLength) | 0;

            return division1 == division2;
        }

        private static bool CanJoinDuration(Duration d)
        {
            switch (d)
            {
                case Duration.Whole:
                case Duration.Half:
                case Duration.Quarter:
                    return false;
                default:
                    return true;
            }
        }

        public static bool IsFullBarJoin(Beat a, Beat b, int barIndex)
        {
            // TODO: this getindex call seems expensive since we call this method very often. 
            return (a.Duration.GetIndex() - 2 - barIndex > 0)
                && (b.Duration.GetIndex() - 2 - barIndex > 0);
        }

        /// <summary>
        /// Returns whether the the position of the given beat, was registered by the staff of the given ID
        /// </summary>
        /// <param name="staffId"></param>
        /// <param name="beat"></param>
        /// <returns></returns>
        public bool IsPositionFrom(string staffId, Beat beat)
        {
            if (!_beatLineXPositions.ContainsKey(beat.Index))
            {
                return true;
            }
            return _beatLineXPositions[beat.Index].StaffId == staffId;
        }


        public int GetBeatMinValue(Beat beat)
        {
            if (!_beatLineXPositions.ContainsKey(beat.Index))
            {
                return beat.MinNote.DisplayValue;
            }
            return _beatLineXPositions[beat.Index].MinNoteValue;
        }

        public int GetBeatMaxValue(Beat beat)
        {
            if (!_beatLineXPositions.ContainsKey(beat.Index))
            {
                return beat.MaxNote.DisplayValue;
            }
            return _beatLineXPositions[beat.Index].MaxNoteValue;
        }
    }
}
