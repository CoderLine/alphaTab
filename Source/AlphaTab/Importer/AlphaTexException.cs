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

namespace AlphaTab.Importer
{
    public class AlphaTexException : AlphaTabException
    {
        public int Position { get; set; }
        public string NonTerm { get; set; }
        public AlphaTexSymbols Expected { get; set; }
        public AlphaTexSymbols Symbol { get; set; }
        public object SymbolData { get; set; }

        public AlphaTexException(int position, string nonTerm, AlphaTexSymbols expected, AlphaTexSymbols symbol, object symbolData = null)
            : base("")
        {
            Position = position;
            NonTerm = nonTerm;
            Expected = expected;
            Symbol = symbol;
            SymbolData = symbolData;

            if (SymbolData == null)
            {
                Description = "MalFormed AlphaTex: @" + Position + ": Error on block " + NonTerm +
                              ", expected a " + Expected + " found a " + Symbol;
            }
            else
            {
                Description =  "MalFormed AlphaTex: @" + Position + ": Error on block " + NonTerm +
                       ", invalid value: " + SymbolData;
            }
        }
    }
}