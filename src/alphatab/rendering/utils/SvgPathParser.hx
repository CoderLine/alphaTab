/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
package alphatab.rendering.utils;

/**
 * A utility which can parse and deliver single tokens from a svg pathdata string
 */
class SvgPathParser 
{
    public var svg:String;
    public var lastCommand:String;
    public var currentToken:String;
    
    private var _currentIndex:Int;
    
    public function new(svg:String) 
    {
        this.svg = svg;
    }
    
    public function reset()
    {
        _currentIndex = 0;
        nextToken();
    }

    public function eof() : Bool
    {
        return _currentIndex >= svg.length;
    }
        
    public function getString() : String
    {
        var t = currentToken;
        nextToken();
        return t;
    }
    
    public function getNumber() : Int
    {
        return Std.parseInt(getString());
    }
    
    public inline function currentTokenIsNumber()  : Bool
    {
        return isNumber(currentToken);
    }

    public function nextChar() : String
    {
        if (eof()) return "";
        return svg.charAt(_currentIndex++);
    }    
    
    public function peekChar() : String
    {
        if (eof()) return "";
        return svg.charAt(_currentIndex);
    }
    
    public function nextToken(): Void
    {
        var token = new StringBuf();
        
        var c:String;
        var skipChar:Bool;
        
        // skip leading spaces and separators
        do
        {
            c = nextChar();
            skipChar = isWhiteSpace(c) ||  c == ",";
        } while (!eof() && skipChar);
        
        // read token itself 
        if (!eof() || !skipChar)
        {
            token.add(c);        
            if (isNumber(c)) // do we have a number?
            {
                c = peekChar(); // get first upcoming character
                while (!eof() && (isNumber(c, false) || c == "." )) // while we have number characters add them 
                {
                    token.add(nextChar());
                    // peek next character for check
                    c = peekChar();
                }
            }
            else
            {
                lastCommand = token.toString();
            }
        }
        
        currentToken = token.toString();
    }

    
    private static function isNumber(s:String, allowSign:Bool = true)  : Bool
    {
        if (s.length == 0) return false;
        var c = StringTools.fastCodeAt(s, 0);
        return (allowSign && c == 0x2D) || (c >= 0x30 && c <= 0x39); 
    }
    
    private static function isWhiteSpace(s:String)  : Bool
    {
        if (s.length == 0) return false;
        var c = StringTools.fastCodeAt(s, 0);
        return c == " ".code || c == "\t".code || c == "\r".code || c == "\n".code;
    }

}