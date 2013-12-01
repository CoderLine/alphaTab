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
package alphatab.rendering;

import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BeatContainerGlyph;
import alphatab.rendering.glyphs.BeatGlyphBase;
import alphatab.rendering.glyphs.IMultiBeatEffectGlyph;
import alphatab.rendering.layout.ScoreLayout;
import haxe.ds.IntMap;
import haxe.ds.ObjectMap;
import haxe.ds.StringMap;

/**
 * This renderer is responsible for displaying effects above or below the other staves
 * like the vibrato. 
 */
class EffectBarRenderer extends GroupedBarRenderer
{
    private var _info:IEffectBarRendererInfo;
    private var _uniqueEffectGlyphs:Array<Array<Glyph>>;
    private var _effectGlyphs:Array<IntMap<Glyph>>;
    private var _lastBeat:Beat;
    
    public function new(bar:Bar, info:IEffectBarRendererInfo) 
    {
        super(bar);
        _info = info;
        _uniqueEffectGlyphs = new Array<Array<Glyph>>();
        _effectGlyphs = new Array<IntMap<Glyph>>();
    }
    
    public override function doLayout()
    {
        super.doLayout();
        if (index == 0)
        {
            stave.topSpacing = 5;
            stave.bottomSpacing = 5;
        }
        height = _info.getHeight(this);
    }
    
    public override function finalizeRenderer(layout:ScoreLayout):Void 
    {
        super.finalizeRenderer(layout);
        // after all layouting and sizing place and size the effect glyphs
        isEmpty = true;
        
#if MULTIVOICE_SUPPORT
        for (v in _bar.voices)
        {
            var prevGlyph:Glyph = null;
            if (index > 0)
            {
                // check if previous renderer had an effect on his last beat
                // and use this as merging element
                var prevRenderer:EffectBarRenderer = stave.barRenderers[index - 1];
                if (prevRenderer._lastBeat != null)
                {
                    prevGlyph = prevRenderer._effectGlyphs[v.index].get(prevRenderer._lastBeat.index);
                }
            }
            for (beatIndex in _effectGlyphs[v.index].keys())
            {
                var effect:Glyph = _effectGlyphs[v.index].get(beatIndex);
                
                alignGlyph(_info.getSizingMode(), beatIndex, 0, prevGlyph);
                
                prevGlyph = effect;
                isEmpty = false;
            }
            
        }
#else
        var prevGlyph:Glyph = null;
        if (index > 0)
        {
            // check if previous renderer had an effect on his last beat
            // and use this as merging element
            var prevRenderer:EffectBarRenderer = cast stave.barRenderers[index - 1];
            if (prevRenderer._lastBeat != null)
            {
                prevGlyph = prevRenderer._effectGlyphs[0].get(prevRenderer._lastBeat.index);
            }
        }
        for (beatIndex in _effectGlyphs[0].keys())
        {
            var effect:Glyph = _effectGlyphs[0].get(beatIndex);
            
            alignGlyph(_info.getSizingMode(), beatIndex, 0, prevGlyph);
            
            prevGlyph = effect;
            isEmpty = false;
        }
#end
    }
    
    private function alignGlyph(sizing:EffectBarGlyphSizing, beatIndex:Int, voiceIndex:Int, prevGlyph:Glyph)
    {
        var g:Glyph = _effectGlyphs[voiceIndex].get(beatIndex); 
        var pos:Glyph; 
        var container = getBeatContainer(voiceIndex, beatIndex);
        switch(sizing)
        {
            case SinglePreBeatOnly:
                pos = container.preNotes;
                g.x = pos.x + container.x;
                g.width = pos.width;
                
            case SinglePreBeatToOnBeat:
                pos = container.preNotes;
                g.x = pos.x + container.x;
                pos = container.onNotes;
                g.width = (pos.x + container.x + pos.width) - g.x;
                
            case SinglePreBeatToPostBeat:
                pos = container.preNotes;
                g.x = pos.x + container.x;
                pos = container.postNotes;
                g.width = (pos.x + container.x + pos.width) - g.x;
        
            case SingleOnBeatOnly:
                pos = container.onNotes;
                g.x = pos.x + container.x;
                g.width = pos.width;

            case SingleOnBeatToPostBeat:
                pos = container.onNotes;
                g.x = pos.x + container.x;
                pos = container.postNotes;
                g.width = (pos.x + container.x + pos.width) - g.x;

            case SinglePostBeatOnly:
                pos = container.postNotes;
                g.x = pos.x + container.x;
                g.width = pos.width;

            case GroupedPreBeatOnly:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = container.preNotes;
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + container.x + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(container.beat);
                }
                
            case GroupedPreBeatToOnBeat:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SinglePreBeatToOnBeat, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = container.onNotes;
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + container.x + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(container.beat);
                }
            
            case GroupedPreBeatToPostBeat:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SinglePreBeatToPostBeat, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = container.postNotes;
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + container.x + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(container.beat);
                }
                
            case GroupedOnBeatOnly:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SingleOnBeatOnly, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = container.onNotes;
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + container.x + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(container.beat);
                }
                
            case GroupedOnBeatToPostBeat:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.SingleOnBeatToPostBeat, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = container.postNotes;
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + container.x + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(container.beat);
                }
                
            case GroupedPostBeatOnly:
                if (g != prevGlyph) { alignGlyph(EffectBarGlyphSizing.GroupedPostBeatOnly, beatIndex, voiceIndex, prevGlyph); }
                else 
                {
                    pos = container.postNotes;
                    var posR = cast(pos.renderer, EffectBarRenderer);
                    var gR = cast(g.renderer, EffectBarRenderer);
                    g.width = (posR.x + posR.getBeatGlyphsStart() + container.x + pos.x + pos.width) - (gR.x + gR.getBeatGlyphsStart() + g.x);
                    if (Std.is(g, IMultiBeatEffectGlyph)) cast(g, IMultiBeatEffectGlyph).expandedTo(container.beat);
                }
        }
    }
    
    private override function createPreBeatGlyphs():Void 
    {
    }

    private override function createBeatGlyphs():Void 
    {
        _effectGlyphs.push(new IntMap<Glyph>());
        _uniqueEffectGlyphs.push(new Array<Glyph>());
#if MULTIVOICE_SUPPORT
        for (v in _bar.voices)
        {
            createVoiceGlyphs(v);
        }
#else
        createVoiceGlyphs(_bar.voices[0]);
#end

    }
    
    private function createVoiceGlyphs(v:Voice)
    {
        for (b in v.beats)
        {            
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new BeatContainerGlyph(b);
            container.preNotes = new BeatGlyphBase();
            container.onNotes = new BeatGlyphBase();
            container.postNotes = new BeatGlyphBase();
            addBeatGlyph(container);
            
            if (_info.shouldCreateGlyph(this, b))
            {
                createOrResizeGlyph(_info.getSizingMode(), b);
            }
            
            _lastBeat = b;
        }
    }    
    
    private function createOrResizeGlyph(sizing:EffectBarGlyphSizing, b:Beat)
    {
        switch(sizing)
        {
            case SinglePreBeatOnly, SinglePreBeatToOnBeat, SinglePreBeatToPostBeat, 
                 SingleOnBeatOnly, SingleOnBeatToPostBeat, SinglePostBeatOnly:
                var g = _info.createNewGlyph(this, b);
                g.renderer = this;
                g.doLayout();
                _effectGlyphs[b.voice.index].set(b.index, g);
                _uniqueEffectGlyphs[b.voice.index].push(g);
                
            case GroupedPreBeatOnly, GroupedPreBeatToOnBeat, GroupedPreBeatToPostBeat,
                 GroupedOnBeatOnly, GroupedOnBeatToPostBeat, GroupedPostBeatOnly:
                if (b.index > 0 || index > 0)
                {
                    // check if the previous beat also had this effect
                    var prevBeat:Beat = b.previousBeat; 
                    if (_info.shouldCreateGlyph(this, prevBeat))
                    {
                        // expand the previous effect
                        var prevEffect:Glyph;
                        if (b.index > 0)
                        {
                            prevEffect = _effectGlyphs[b.voice.index].get(prevBeat.index);
                        }
                        else 
                        {
                            prevEffect = cast(stave.barRenderers[index - 1], EffectBarRenderer)._effectGlyphs[b.voice.index].get(prevBeat.index);
                        }
                        
                        if (prevEffect == null || !_info.canExpand(this, prevBeat, b))
                        {
                            createOrResizeGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, b);
                        }
                        else
                        {
                            _effectGlyphs[b.voice.index].set(b.index, prevEffect);
                        }
                    }
                    else
                    {
                        createOrResizeGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, b);
                    }
                }
                else
                {
                    createOrResizeGlyph(EffectBarGlyphSizing.SinglePreBeatOnly, b);
                }
        }
    }
    
    private override function createPostBeatGlyphs():Void 
    {
    }
    
    public override function getTopPadding():Int 
    {
        return 0;
    }    
    
    public override function getBottomPadding():Int 
    {
        return 0;
    }
    
    public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
    {
        
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        super.paint(cx, cy, canvas);
        
        // canvas.setColor(new Color(0, 0, 200, 100));
        // canvas.fillRect(cx + x, cy + y, width, height);
        
        var glyphStart = getBeatGlyphsStart();
        
        for (v in _uniqueEffectGlyphs)
        {
            for (g in v)
            {
                if (g.renderer == this)
                {
                    g.paint(cx + x + glyphStart, cy + y, canvas);             
                }
            }
        }
    }
}   