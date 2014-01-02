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
package alphatab.rendering.glyphs;
import alphatab.rendering.glyphs.LazySvg.SvgCommand;
import alphatab.rendering.utils.SvgPathParser;

class SvgCommand
{
    public var cmd:String;
    public var numbers:Array<Int>;
    public function new() {}
}

/**
 * This class parses svg path when accessing it. 
 * This ensures the SVG path data only needs to be parsed once. 
 */
class LazySvg
{
    private var _raw:String;
    private var _parsed:Array<SvgCommand>;
    
    public function new(raw:String) 
    {
        _raw = raw;
        _parsed = null;
    }
    
    public function get()
    {
        if (_parsed == null) parse();
        return _parsed;    
    }
    
    private function parse()
    {
        var parser = new SvgPathParser(_raw);
        parser.reset();
        _parsed = new Array<SvgCommand>();
        
        while (!parser.eof())
        {
            var command = new SvgCommand();
            _parsed.push(command);
            
            command.cmd = parser.getString();
            switch (command.cmd) 
            { 
                //
                // Moving
                // 
                case "M": // absolute moveto
                    command.numbers = [parser.getNumber(), parser.getNumber()];
                case "m": // relative moveto
                    command.numbers = [parser.getNumber(), parser.getNumber()];
                //
                // Closing
                // 
                case "Z", "z":
                    
                //
                // Lines
                //                 
                case "L": // absolute lineTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                case "l": // relative lineTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber()); 
                        command.numbers.push(parser.getNumber()); 
                    } while (parser.currentTokenIsNumber());
                    
                case "V": // absolute verticalTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                case "v": // relative verticalTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                    
                case "H": // absolute horizontalTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                case "h": // relative horizontalTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                    
                //
                // cubic bezier curves
                // 
                case "C": // absolute cubicTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                case "c": // relative cubicTo
                    command.numbers = new Array<Int>();
                    do {
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                       command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());            
                    
                case "S": // absolute shorthand cubicTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());            
                case "s": // relative shorthand cubicTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                
                //
                // quadratic bezier curves
                //
                case "Q": // absolute quadraticTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                case "q": // relative quadraticTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                    
                case "T": // absolute shorthand quadraticTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
                case "t": // relative shorthand quadraticTo
                    command.numbers = new Array<Int>();
                    do 
                    {
                        command.numbers.push(parser.getNumber());
                        command.numbers.push(parser.getNumber());
                    } while (parser.currentTokenIsNumber());
            }
        }
        _raw = null; // not needed anymore.
    }
    
}