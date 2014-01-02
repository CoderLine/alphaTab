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

import alphatab.importer.ScoreLoader;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.LazySvg.SvgCommand;
import alphatab.rendering.utils.SvgPathParser;

class SvgGlyph extends Glyph
{
    private var _svg:LazySvg;
    private var _lastCmd:String;
    
    private var _currentX:Float;
    private var _currentY:Float;
    private var _xScale:Float;
    private var _yScale:Float;
    
    private var _xGlyphScale:Float;
    private var _yGlyphScale:Float;
    
    private var _lastControlX:Float;
    private var _lastControlY:Float;
    
    // Minor tweaks for the new generated font
    public function new(x:Int = 0, y:Int = 0, svg:LazySvg, 
                        xScale:Float, yScale:Float)
    {
        super(x, y);
        _svg = svg;
        _xGlyphScale = xScale * 0.0099;
        _yGlyphScale = yScale * 0.0099;
    }
        
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        if (_svg == null) return;
        _xScale = _xGlyphScale * getScale();
        _yScale = _yGlyphScale * getScale();
        
        var res = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        
        var startX = x + cx;
        var startY = y + cy;
        _currentX = startX;
        _currentY = startY;
        canvas.setColor(new Color(0,0,0)); // todo: Resources
        canvas.beginPath();
        
        for (c in _svg.get())
        {
            parseCommand(startX, startY, canvas, c);
        }
        canvas.fill();
    }    
    
    private function parseCommand(cx:Int, cy:Int, canvas:ICanvas, cmd:SvgCommand) 
    {
        var canContinue:Bool; // reusable flag for shorthand curves
        var i:Int;
        switch (cmd.cmd) 
        { 
            //
            // Moving
            // 
            case "M": // absolute moveto
                _currentX = (cx + cmd.numbers[0] * _xScale);
                _currentY = (cy + cmd.numbers[1] * _yScale); 
                canvas.moveTo(_currentX, _currentY);
            case "m": // relative moveto
                _currentX += (cmd.numbers[0] * _xScale);
                _currentY += (cmd.numbers[1] * _yScale); 
                canvas.moveTo(_currentX, _currentY);
                
            //
            // Closing
            // 
            case "Z", "z":
                canvas.closePath();
                
            //
            // Lines
            //                 
            case "L": // absolute lineTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    _currentX = (cx + cmd.numbers[i++] * _xScale); 
                    _currentY = (cy + cmd.numbers[i++] * _yScale); 
                    canvas.lineTo(_currentX, _currentY);
                } 
            case "l": // relative lineTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    _currentX += (cmd.numbers[i++] * _xScale); 
                    _currentY += (cmd.numbers[i++] * _yScale); 
                    canvas.lineTo(_currentX, _currentY);
                } 
                
            case "V": // absolute verticalTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    _currentY = (cy + cmd.numbers[i++] * _yScale);
                    canvas.lineTo(_currentX, _currentY);
                } 
            case "v": // relative verticalTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    _currentY += (cmd.numbers[i++] * _yScale);
                    canvas.lineTo(_currentX, _currentY);
                } 
                
            case "H": // absolute horizontalTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    _currentX = (cx + cmd.numbers[i++] * _xScale);
                    canvas.lineTo(_currentX, _currentY);
                } 
            case "h": // relative horizontalTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    _currentX += (cmd.numbers[i++] * _xScale);
                    canvas.lineTo(_currentX, _currentY);
                } 
                
            //
            // cubic bezier curves
            // 
            case "C": // absolute cubicTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    var x1:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y1:Float = (cy + cmd.numbers[i++] * _yScale);
                    var x2:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y2:Float = (cy + cmd.numbers[i++] * _yScale);
                    var x3:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y3:Float = (cy + cmd.numbers[i++] * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
                    _currentX = x3;
                    _currentY = y3;
                    canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                } 
            case "c": // relative cubicTo
                i = 0;
                while (i < cmd.numbers.length)
                {
                    var x1:Float=  (_currentX + cmd.numbers[i++] * _xScale);
                    var y1:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    var x2:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y2:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    var x3:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y3:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
                    _currentX = x3;
                    _currentY = y3;
                    canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                } 
                
            case "S": // absolute shorthand cubicTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    var x1:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y1:Float = (cy + cmd.numbers[i++] * _yScale);
                    canContinue = _lastCmd == "c" || _lastCmd == "C" || _lastCmd == "S" || _lastCmd == "s" ;
                    var x2:Float = canContinue 
                                        ? _currentX + (_currentX - _lastControlX)
                                        : _currentX;
                    var y2:Float = canContinue
                                        ? _currentY + (_currentY - _lastControlY)
                                        : _currentY;
                    var x3:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y3:Float = (cy + cmd.numbers[i++] * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
                    _currentX = x3;
                    _currentY = y3;
                    canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                } 
            case "s": // relative shorthand cubicTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    var x1:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y1:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    canContinue = _lastCmd == "c" || _lastCmd == "C" || _lastCmd == "S" || _lastCmd == "s" ;
                    var x2:Float = canContinue 
                                        ? _currentX + (_currentX - _lastControlX)
                                        : _currentX;
                    var y2:Float = canContinue
                                        ? _currentY + (_currentY - _lastControlY)
                                        : _currentY;
                    var x3:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y3:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
                    _currentX = x3;
                    _currentY = y3;
                    canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                } 
            
            //
            // quadratic bezier curves
            //
            case "Q": // absolute quadraticTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    var x1:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y1:Float = (cy + cmd.numbers[i++] * _yScale);
                    var x2:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y2:Float = (cy + cmd.numbers[i++] * _yScale);
                    _lastControlX = x1;
                    _lastControlY = y1;
                    _currentX = x2;
                    _currentY = y2;
                    canvas.quadraticCurveTo(x1, y1, x2, y2);
                } 
            case "q": // relative quadraticTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    var x1:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y1:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    var x2:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y2:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    _lastControlX = x1;
                    _lastControlY = y1;
                    _currentX = x2;
                    _currentY = y2;
                    canvas.quadraticCurveTo(x1, y1, x2, y2);
                } 
                
            case "T": // absolute shorthand quadraticTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                    var x1:Float = (cx + cmd.numbers[i++] * _xScale);
                    var y1:Float = (cy + cmd.numbers[i++] * _yScale);
                    canContinue = _lastCmd == "q" || _lastCmd == "Q" || _lastCmd == "t" || _lastCmd == "T" ;
                    var cpx:Float = canContinue 
                                        ? _currentX + (_currentX - _lastControlX)
                                        : _currentX;
                    var cpy:Float = canContinue
                                        ? _currentY + (_currentY - _lastControlY)
                                        : _currentY;
                    _currentX = x1;
                    _currentY = y1;                    
                    _lastControlX = cpx;
                    _lastControlY = cpy;
                    canvas.quadraticCurveTo(cpx, cpy, x1, y1);
                } 
            case "t": // relative shorthand quadraticTo
                i = 0;
                while(i < cmd.numbers.length)
                {
                // TODO: buggy/incomplete
                    var x1:Float = (_currentX + cmd.numbers[i++] * _xScale);
                    var y1:Float = (_currentY + cmd.numbers[i++] * _yScale);
                    var cpx = _currentX + (_currentX - _lastControlX);
                    var cpy = _currentY + (_currentY - _lastControlY);
                    canContinue = _lastCmd == "q" || _lastCmd == "Q" || _lastCmd == "t" || _lastCmd == "T" ;
                    var cpx:Float = canContinue 
                                        ? _currentX + (_currentX - _lastControlX)
                                        : _currentX;
                    var cpy:Float = canContinue
                                        ? _currentY + (_currentY - _lastControlY)
                                        : _currentY;
                    _lastControlX = cpx;
                    _lastControlY = cpy;
                    canvas.quadraticCurveTo(cpx, cpy, x1, y1);
                } 
        }
        _lastCmd = cmd.cmd;
    }
}