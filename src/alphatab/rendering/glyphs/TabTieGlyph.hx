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
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;

class TabTieGlyph extends TieGlyph
{
    public function new(startNote:Note, endNote:Note, parent:Glyph)
    {
        super(startNote, endNote, parent);
    }

    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        if (_endNote == null || _startNote.beat.index != _endNote.beat.index) return;
        var r:TabBarRenderer = cast renderer;
        var parent:TabBeatContainerGlyph = cast _parent;
        var res = r.getResources();
        var startX = cx + r.getNoteX(_startNote);
        var endX = _endNote == null 
                    ? cx + parent.x + parent.postNotes.x + parent.postNotes.width  // end of beat container
                    : cx + r.getNoteX(_endNote, false); 
        
        var down = _startNote.string > 3;
        var offset = (res.tablatureFont.getSize() / 2);
        if (down) {
            offset *= -1;
        }
        
        var startY = cy + r.getNoteY(_startNote) + offset;
        var endY = _endNote == null ? startY : cy + r.getNoteY(_endNote) + offset;
        
        TieGlyph.paintTie(canvas, getScale(), startX, startY, endX, endY, _startNote.string > 3);
        
        canvas.setColor(renderer.getLayout().renderer.renderingResources.mainGlyphColor);
        canvas.fill();
    }
}