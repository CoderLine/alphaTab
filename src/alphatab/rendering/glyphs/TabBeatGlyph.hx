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

import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.GraceType;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;

class TabBeatGlyph extends BeatGlyphBase
{
    public var noteNumbers : TabNoteChordGlyph;

    public function new() 
    {
        super();
    }
    
    public override function doLayout():Void 
    {
        // create glyphs
        if (!container.beat.isRest())
        {
            //
            // Note numbers
            noteNumbers = new TabNoteChordGlyph(0, 0, container.beat.graceType != GraceType.None);
            noteNumbers.beat = container.beat;
            noteLoop( function(n) {
                createNoteGlyph(n);
            });
            addGlyph(noteNumbers);    
            
            //
            // Whammy Bar
            if (container.beat.hasWhammyBar() && !noteNumbers.beatEffects.exists("Whammy"))
            {
                noteNumbers.beatEffects.set("Whammy",  new WhammyBarGlyph(container.beat, container));
            }
            
            //
            // Tremolo Picking
            if (container.beat.isTremolo() && !noteNumbers.beatEffects.exists("Tremolo"))
            {
                noteNumbers.beatEffects.set("Tremolo",  new TremoloPickingGlyph(0, 0, container.beat.tremoloSpeed));
            }
        }
        
        // left to right layout
        var w = 0;
        for (g in _glyphs)
        {
            g.x = w;
            g.renderer = renderer;
            g.doLayout();
            w += g.width;
        }    
        width = w;
    } 
    
    private function createNoteGlyph(n:Note) 
    {
        var isGrace = container.beat.graceType != GraceType.None;
        var tr = cast(renderer, TabBarRenderer);
        var noteNumberGlyph:NoteNumberGlyph = new NoteNumberGlyph(0, 0, n, isGrace);    
        var l = n.beat.voice.bar.track.tuning.length - n.string + 1;
        noteNumberGlyph.y = tr.getTabY(l, -2);
        noteNumbers.addNoteGlyph(noteNumberGlyph, n);
    }    
}