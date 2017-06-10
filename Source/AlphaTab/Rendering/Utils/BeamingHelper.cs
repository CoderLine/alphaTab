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
using System;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public enum BeamDirection
    {
        Up,
        Down
    }

    /// <summary>
    /// Lists all types how two voices can be joined with bars.
    /// </summary>
    public enum BeamBarType
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

    public interface IBeamYCalculator
    {
        float GetYPositionForNote(Note note);
    }

    public class BeatLinePositions
    {
        public string StaffId { get; set; }
        public float Up { get; set; }
        public float Down { get; set; }

        public BeatLinePositions(string staffId, float up, float down)
        {
            StaffId = staffId;
            Up = up;
            Down = down;
        }
    }

    /// <summary>
    /// This public class helps drawing beams and bars for notes.
    /// </summary>
    public class BeamingHelper
    {
        private static readonly int[] ScoreMiddleKeys = { 60, 60, 57, 50, 71 };

        private Beat _lastBeat;
        private readonly Track _track;

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
        public Note FirstMinNote { get; set; }

        /// <summary>
        /// the first max note within this group
        /// </summary>
        public Note FirstMaxNote { get; set; }

        /// <summary>
        /// the last min note within this group
        /// </summary>
        public Note LastMinNote { get; set; }

        /// <summary>
        /// the last max note within this group
        /// </summary>
        public Note LastMaxNote { get; set; }

        /// <summary>
        /// the overall min note within this group
        /// </summary>
        public Note MinNote { get; set; }

        /// <summary>
        /// the overall max note within this group
        /// </summary>
        public Note MaxNote { get; set; }

        public bool InvertBeamDirection { get; set; }


        public BeamingHelper(Track track)
        {
            _track = track;

            Beats = new FastList<Beat>();
            _beatLineXPositions = new FastDictionary<int, BeatLinePositions>();
            ShortestDuration = Duration.QuadrupleWhole;
        }

        private int GetValue(Note n)
        {
            if (_track.IsPercussion)
            {
                return PercussionMapper.MapNoteForDisplay(n);
            }
            else
            {
                return n.RealValue - _track.DisplayTranspositionPitch;
            }
        }

        public float GetBeatLineX(Beat beat)
        {
            if (HasBeatLineX(beat))
            {
                if (Direction == BeamDirection.Up)
                {
                    return _beatLineXPositions[beat.Index].Up;
                }
                return _beatLineXPositions[beat.Index].Down;
            }
            return 0;
        }

        public bool HasBeatLineX(Beat beat)
        {
            return _beatLineXPositions.ContainsKey(beat.Index);
        }

        public void RegisterBeatLineX(string staffId, Beat beat, float up, float down)
        {
            _beatLineXPositions[beat.Index] = new BeatLinePositions(staffId, up, down);
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
            if (Beats.Count == 1 && (Beats[0].Duration == Duration.Whole || Beats[0].Duration == Duration.DoubleWhole))
            {
                return Invert(BeamDirection.Up);
            }

            if (Beats[0].GraceType != GraceType.None)
            {
                return Invert(BeamDirection.Up);
            }
            
            // the average key is used for determination
            //      key lowerequal than middle line -> up
            //      key higher than middle line -> down
            var avg = (GetValue(MaxNote) + GetValue(MinNote)) / 2;
            return Invert(avg < ScoreMiddleKeys[(int)_lastBeat.Voice.Bar.Clef] ? BeamDirection.Up : BeamDirection.Down);
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
            if (Beats.Count == 0)
            {
                add = true;
            }
            else if (CanJoin(_lastBeat, beat))
            {
                add = true;
            }

            if (add)
            {
                _lastBeat = beat;
                Beats.Add(beat);

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

                CheckNote(beat.MinNote);
                CheckNote(beat.MaxNote);
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

            // detect the smallest note which is at the beginning of this group
            if (FirstMinNote == null || note.Beat.Start < FirstMinNote.Beat.Start)
            {
                FirstMinNote = note;
            }
            else if (note.Beat.Start == FirstMinNote.Beat.Start)
            {
                if (value < GetValue(FirstMinNote))
                {
                    FirstMinNote = note;
                }
            }

            // detect the biggest note which is at the beginning of this group
            if (FirstMaxNote == null || note.Beat.Start < FirstMaxNote.Beat.Start)
            {
                FirstMaxNote = note;
            }
            else if (note.Beat.Start == FirstMaxNote.Beat.Start)
            {
                if (value > GetValue(FirstMaxNote))
                {
                    FirstMaxNote = note;
                }
            }

            // detect the smallest note which is at the end of this group
            if (LastMinNote == null || note.Beat.Start > LastMinNote.Beat.Start)
            {
                LastMinNote = note;
            }
            else if (note.Beat.Start == LastMinNote.Beat.Start)
            {
                if (value < GetValue(LastMinNote))
                {
                    LastMinNote = note;
                }
            }
            // detect the biggest note which is at the end of this group
            if (LastMaxNote == null || note.Beat.Start > LastMaxNote.Beat.Start)
            {
                LastMaxNote = note;
            }
            else if (note.Beat.Start == LastMaxNote.Beat.Start)
            {
                if (value > GetValue(LastMaxNote))
                {
                    LastMaxNote = note;
                }
            }

            if (MaxNote == null || value > GetValue(MaxNote))
            {
                MaxNote = note;
            }
            if (MinNote == null || value < GetValue(MinNote))
            {
                MinNote = note;
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
                    return yPosition.GetYPositionForNote(MaxNote) - stemSize;
                }
                return yPosition.GetYPositionForNote(MinNote) + stemSize;
            }

            // we use the min/max notes to place the beam along their real position        
            // we only want a maximum of 10 offset for their gradient
            var maxDistance = (10 * scale);


            // if the min note is not first or last, we can align notes directly to the position
            // of the min note
            if (direction == BeamDirection.Down && MinNote != FirstMinNote && MinNote != LastMinNote)
            {
                return yPosition.GetYPositionForNote(MinNote) + stemSize;
            }
            if (direction == BeamDirection.Up && MaxNote != FirstMaxNote && MaxNote != LastMaxNote)
            {
                return yPosition.GetYPositionForNote(MaxNote) - stemSize;
            }

            float startX = GetBeatLineX(FirstMinNote.Beat) + xCorrection;
            float startY = direction == BeamDirection.Up
                            ? yPosition.GetYPositionForNote(FirstMaxNote) - stemSize
                            : yPosition.GetYPositionForNote(FirstMinNote) + stemSize;

            float endX = GetBeatLineX(LastMaxNote.Beat) + xCorrection;
            float endY = direction == BeamDirection.Up
                            ? yPosition.GetYPositionForNote(LastMaxNote) - stemSize
                            : yPosition.GetYPositionForNote(LastMinNote) + stemSize;

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
            if (b1 == null || b2 == null || b1.IsRest || b2.IsRest || b1.GraceType != b2.GraceType)
            {
                return false;
            }

            var m1 = b1.Voice.Bar;
            var m2 = b1.Voice.Bar;
            // only join on same measure
            if (m1 != m2) return false;

            // get times of those voices and check if the times 
            // are in the same division
            var start1 = b1.Start;
            var start2 = b2.Start;

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
    }
}
