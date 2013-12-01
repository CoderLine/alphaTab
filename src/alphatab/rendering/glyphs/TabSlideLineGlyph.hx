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

import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;

class TabSlideLineGlyph extends Glyph
{
    private var _startNote:Note;
    private var _type:SlideType;
    private var _parent:BeatContainerGlyph;
    public function new(type:SlideType,startNote:Note, parent:BeatContainerGlyph) 
    {
        super(0,0);
        _type = type;
        _startNote = startNote;
        _parent = parent;
    }
    
    public override function doLayout():Void 
    {
        width = 0;
    }
    
    public override function canScale():Bool 
    {
        return false;
    }    
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var r:TabBarRenderer = cast renderer;
        
        var sizeX = Std.int(12 * getScale());
        var sizeY = Std.int(3 * getScale());
        var startX:Int;
        var startY:Int;
        var endX:Int;
        var endY:Int;
        switch(_type)
        {
            case Shift, Legato:
                var startOffsetY:Int;
                var endOffsetY:Int;
                
                if (_startNote.slideTarget == null)
                {
                    startOffsetY = 0;
                    endOffsetY = 0;
                }
                else if (_startNote.slideTarget.fret > _startNote.fret) 
                {
                    startOffsetY = sizeY;
                    endOffsetY = sizeY * -1;
                }
                else
                {
                    startOffsetY = sizeY * -1;
                    endOffsetY = sizeY;
                }
                
                startX = cx + r.getNoteX(_startNote, true);
                startY = cy + r.getNoteY(_startNote) + startOffsetY;
                if (_startNote.slideTarget != null) 
                {
                    endX = cx + r.getNoteX(_startNote.slideTarget, false) ;
                    endY = cy + r.getNoteY(_startNote.slideTarget) + endOffsetY;                    
                }
                else
                {
                    endX = cx + _parent.x + _parent.postNotes.x + _parent.postNotes.width;
                    endY = startY;                
                }

            case IntoFromBelow:
                endX = cx + r.getNoteX(_startNote, false) ;
                endY = cy + r.getNoteY(_startNote);

                startX = endX - sizeX;
                startY = cy + r.getNoteY(_startNote) + sizeY;
            case IntoFromAbove:
                endX = cx + r.getNoteX(_startNote, false) ;
                endY = cy + r.getNoteY(_startNote);

                startX = endX - sizeX;
                startY = cy + r.getNoteY(_startNote) - sizeY;
            case OutUp:
                startX = cx + r.getNoteX(_startNote, true);
                startY = cy + r.getNoteY(_startNote);

                endX = startX + sizeX;
                endY = cy + r.getNoteY(_startNote)- sizeY;

            case OutDown:
                startX = cx + r.getNoteX(_startNote, true);
                startY = cy + r.getNoteY(_startNote);

                endX = startX + sizeX;
                endY = cy + r.getNoteY(_startNote) + sizeY;
            default:
                return;
        }

        canvas.setColor(renderer.getLayout().renderer.renderingResources.mainGlyphColor);
        canvas.beginPath();
        canvas.moveTo(startX, startY);
        canvas.lineTo(endX, endY);
        canvas.stroke();
    }
    
}