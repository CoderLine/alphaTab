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

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class can store the information about a group of measures which are repeated
    /// </summary>
    public class RepeatGroup
    {
        /// <summary>
        /// All masterbars repeated within this group
        /// </summary>
        public FastList<MasterBar> MasterBars { get; set; }

        /// <summary>
        /// a list of masterbars which open the group. 
        /// </summary>
        public FastList<MasterBar> Openings { get; set; }

        /// <summary>
        /// a list of masterbars which close the group. 
        /// </summary>
        public FastList<MasterBar> Closings { get; set; }

        /// <summary>
        ///  true if the repeat group was closed well
        /// </summary>
        public bool IsClosed { get; set; }

        public RepeatGroup()
        {
            MasterBars = new FastList<MasterBar>();
            Openings = new FastList<MasterBar>();
            Closings = new FastList<MasterBar>();
            IsClosed = false;
        }

        public void AddMasterBar(MasterBar masterBar)
        {
            if (Openings.Count == 0)
            {
                Openings.Add(masterBar);
            }

            MasterBars.Add(masterBar);
            masterBar.RepeatGroup = this;

            if (masterBar.IsRepeatEnd)
            {
                Closings.Add(masterBar);
                IsClosed = true;
            }
            // a new item after the header was closed? -> repeat alternative reopens the group
            else if (IsClosed)
            {
                IsClosed = false;
                Openings.Add(masterBar);
            }
        }
    }
}