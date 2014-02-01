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
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.DynamicsGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class DynamicsEffectInfo implements IEffectBarRendererInfo
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
        return beat.voice.index == 0 && 
                ((beat.index == 0 && beat.voice.bar.index == 0) || (beat.previousBeat != null && beat.dynamicValue != beat.previousBeat.dynamicValue));
    }
    
    public function canExpand(renderer : EffectBarRenderer, from:Beat, to:Beat): Bool
    {
        return true;
    }    
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(15 * renderer.getScale());
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatOnly;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new DynamicsGlyph(0,0, beat.dynamicValue);
    }
}