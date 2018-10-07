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

namespace AlphaTab.Importer
{
    class AlphaTexException : AlphaTabException
    {
        public int Position { get; set; }
        public string NonTerm { get; set; }
        public AlphaTexSymbols Expected { get; set; }
        public AlphaTexSymbols Symbol { get; set; }
        public object SymbolData { get; set; }

        public static AlphaTexException SymbolError(int position, string nonTerm, AlphaTexSymbols expected, AlphaTexSymbols symbol, object symbolData = null)
        {
            string message;
            if (symbolData == null)
            {
                message = "MalFormed AlphaTex: @" + position + ": Error on block " + nonTerm +
                       ", expected a " + expected + " found a " + symbol;
            }
            else
            {
                message = "MalFormed AlphaTex: @" + position + ": Error on block " + nonTerm +
                       ", invalid value: " + symbolData;
            }

            var exception = new AlphaTexException(message);
            exception.Position = position;
            exception.NonTerm = nonTerm;
            exception.Expected = expected;
            exception.Symbol = symbol;
            exception.SymbolData = symbolData;
            return exception;
        }

        public AlphaTexException(string message)
            : base(message)
        {
        }

        public static AlphaTexException ErrorMessage(int position, string message)
        {
            message = "MalFormed AlphaTex: @" + position + ": " + message;
            var exception = new AlphaTexException(message);
            exception.Position = position;
            return exception;
        }
    }
}