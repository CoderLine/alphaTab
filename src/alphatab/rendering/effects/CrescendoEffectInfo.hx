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
import alphatab.rendering.glyphs.CrescendoType;
import alphatab.rendering.glyphs.effects.CrescendoGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class CrescendoEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function hideOnMultiTrack():Bool
    {
        return false;
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.crescendo != CrescendoType.None;
    }
    
    public function canExpand(renderer : EffectBarRenderer, from:Beat, to:Beat): Bool
    {
        return from.crescendo == to.crescendo;
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedPreBeatToPostBeat;
    }
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(CrescendoGlyph.Height * renderer.getScale());
    }
    
    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new CrescendoGlyph(0, 0, beat.crescendo);
    }    
}