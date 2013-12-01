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
package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.VibratoGlyph;

class NoteVibratoEffectInfo extends NoteEffectInfoBase
{
    public function new() 
    {
        super();
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return note.vibrato != VibratoType.None ||(note.isTieDestination && note.tieOrigin.vibrato != VibratoType.None);
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    }
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(15 * renderer.getScale());
    }
    
    public override function createNewGlyph(renderer:EffectBarRenderer, beat:Beat):Glyph 
    {
        return new VibratoGlyph(0, Std.int(5*renderer.getScale()));
    }
}