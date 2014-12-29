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

using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// The score is the root node of the complete 
    /// model. It stores the basic information of 
    /// a song and stores the sub components. 
    /// </summary>
    public class Score
    {
        private RepeatGroup _currentRepeatGroup;

        /// <summary>
        /// The album of this song. 
        /// </summary>
        public string Album { get; set; }

        /// <summary>
        /// The artist who performs this song.
        /// </summary>
        public string Artist { get; set; }

        /// <summary>
        /// The owner of the copyright of this song. 
        /// </summary>
        public string Copyright { get; set; }

        /// <summary>
        /// Additional instructions
        /// </summary>
        public string Instructions { get; set; }

        /// <summary>
        /// The author of the music. 
        /// </summary>
        public string Music { get; set; }

        /// <summary>
        /// Some additional notes about the song. 
        /// </summary>
        public string Notices { get; set; }

        /// <summary>
        /// The subtitle of the song. 
        /// </summary>
        public string SubTitle { get; set; }

        /// <summary>
        /// The title of the song. 
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// The author of the song lyrics
        /// </summary>
        public string Words { get; set; }

        /// <summary>
        /// The author of this tablature.
        /// </summary>
        public string Tab { get; set; }

        public int Tempo { get; set; }
        public string TempoLabel { get; set; }

        public FastList<MasterBar> MasterBars { get; set; }
        public FastList<Track> Tracks { get; set; }

        public Score()
        {
            MasterBars = new FastList<MasterBar>();
            Tracks = new FastList<Track>();
            _currentRepeatGroup = new RepeatGroup();
        }

        public static void CopyTo(Score src, Score dst)
        {
            dst.Album = src.Album;
            dst.Artist = src.Artist;
            dst.Copyright = src.Copyright;
            dst.Instructions = src.Instructions;
            dst.Music = src.Music;
            dst.Notices = src.Notices;
            dst.SubTitle = src.SubTitle;
            dst.Title = src.Title;
            dst.Words = src.Words;
            dst.Tab = src.Tab;
            dst.Tempo = src.Tempo;
            dst.TempoLabel = src.TempoLabel;
        }

        public void AddMasterBar(MasterBar bar)
        {
            bar.Score = this;
            bar.Index = MasterBars.Count;
            if (MasterBars.Count != 0)
            {
                bar.PreviousMasterBar = MasterBars[MasterBars.Count - 1];
                bar.PreviousMasterBar.NextMasterBar = bar;
                bar.Start = bar.PreviousMasterBar.Start + bar.PreviousMasterBar.CalculateDuration();
            }

            // if the group is closed only the next upcoming header can
            // reopen the group in case of a repeat alternative, so we 
            // remove the current group 
            if (bar.IsRepeatStart || (_currentRepeatGroup.IsClosed && bar.AlternateEndings <= 0))
            {
                _currentRepeatGroup = new RepeatGroup();
            }
            _currentRepeatGroup.AddMasterBar(bar);
            MasterBars.Add(bar);
        }


        public void AddTrack(Track track)
        {
            track.Score = this;
            track.Index = Tracks.Count;
            Tracks.Add(track);
        }

        public void Finish()
        {
            for (int i = 0, j = Tracks.Count; i < j; i++)
            {
                Tracks[i].Finish();
            }
        }

    }
}