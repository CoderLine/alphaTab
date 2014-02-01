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
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BarNumberGlyph;
import alphatab.rendering.glyphs.BarSeperatorGlyph;
import alphatab.rendering.glyphs.BeatContainerGlyph;
import alphatab.rendering.glyphs.RepeatCloseGlyph;
import alphatab.rendering.glyphs.RepeatCountGlyph;
import alphatab.rendering.glyphs.RepeatOpenGlyph;
import alphatab.rendering.glyphs.SpacingGlyph;
import alphatab.rendering.glyphs.TabBeatContainerGlyph;
import alphatab.rendering.glyphs.TabBeatGlyph;
import alphatab.rendering.glyphs.TabBeatPreNotesGlyph;
import alphatab.rendering.glyphs.TabBeatPostNotesGlyph;
import alphatab.rendering.glyphs.TabClefGlyph;
import alphatab.rendering.utils.BarHelpersGroup.BarHelpers;
import haxe.ds.IntMap;

/**
 * This BarRenderer renders a bar using guitar tablature notation. 
 */
class TabBarRenderer extends GroupedBarRenderer
{
    public static inline var LineSpacing = 10;
    
    private var _helpers:BarHelpers;

    public function new(bar:Bar) 
    {
        super(bar);
    }
    
    private inline function getLineOffset()
    {
        return ((LineSpacing + 1) * getScale());
    }
    
    public function getNoteX(note:Note, onEnd:Bool=true) 
    {
        var beat:TabBeatGlyph = cast getOnNotesPosition(note.beat.voice.index, note.beat.index);
        if (beat != null) 
        {
            return beat.container.x +  beat.x + beat.noteNumbers.getNoteX(note, onEnd);
        }
        return getPostBeatGlyphsStart();
    }    
        
    public function getBeatX(beat:Beat) 
    {
        var bg:TabBeatGlyph = cast getPreNotesPosition(beat.voice.index, beat.index);
        if (bg != null) 
        {
            return bg.container.x + bg.x;
        }
        return 0;
    }    

    public function getNoteY(note:Note) 
    {
        var beat:TabBeatGlyph = cast getOnNotesPosition(note.beat.voice.index, note.beat.index);
        if (beat != null) 
        {
            return beat.noteNumbers.getNoteY(note);
        }
        return 0;
    }
    
    public override function doLayout()
    {
        _helpers = stave.staveGroup.helpers.helpers.get(bar.track.index).get(bar.index);        
        super.doLayout();
        height = Std.int(getLineOffset() * (bar.track.tuning.length - 1)) + (getNumberOverflow() * 2);
        if (index == 0)
        {
            stave.registerStaveTop(getNumberOverflow());
            stave.registerStaveBottom(height - getNumberOverflow());
        }
    }
    
    private override function createPreBeatGlyphs():Void 
    {
        if (bar.getMasterBar().isRepeatStart)
        {
            addPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        
        // Clef
        if (isFirstOfLine())
        {
            addPreBeatGlyph(new TabClefGlyph());
        }
         
        addPreBeatGlyph(new BarNumberGlyph(0, getTabY( -1, -3), bar.index + 1, !stave.isFirstInAccolade));
        
        if (bar.isEmpty())
        {
            addPreBeatGlyph(new SpacingGlyph(0, 0, Std.int(30 * getScale()), false));
        }
    }

    private override function createBeatGlyphs():Void 
    {
#if MULTIVOICE_SUPPORT
        for (v in bar.voices)
        {
            createVoiceGlyphs(v);
        }
#else
        createVoiceGlyphs(bar.voices[0]);
#end
    }
    
    private function createVoiceGlyphs(v:Voice)
    {
        for (b in v.beats)
        {
            var container = new TabBeatContainerGlyph(b);
            container.preNotes = new TabBeatPreNotesGlyph();
            container.onNotes = new TabBeatGlyph();
            cast(container.onNotes, TabBeatGlyph).beamingHelper = _helpers.beamHelperLookup[v.index].get(b.index);
            container.postNotes = new TabBeatPostNotesGlyph();
            addBeatGlyph(container);
        }
    }    
    
    private override function createPostBeatGlyphs():Void 
    {
        if (bar.getMasterBar().isRepeatEnd())
        {
            addPostBeatGlyph(new RepeatCloseGlyph(x, 0));
            if (bar.getMasterBar().repeatCount > 2)
            {
                var line = isLast() || isLastOfLine() ? -1 : -4;
                addPostBeatGlyph(new RepeatCountGlyph(0, getTabY(line, -3), bar.getMasterBar().repeatCount));
            }
        }
        else if (bar.getMasterBar().isDoubleBar)
        {
            addPostBeatGlyph(new BarSeperatorGlyph());
            addPostBeatGlyph(new SpacingGlyph(0, 0, Std.int(3 * getScale()), false));
            addPostBeatGlyph(new BarSeperatorGlyph());
        }        
        else if(bar.nextBar == null || !bar.nextBar.getMasterBar().isRepeatStart)
        {
            addPostBeatGlyph(new BarSeperatorGlyph(0,0,isLast()));
        }
    }
    
    public override function getTopPadding():Int 
    {
        return getNumberOverflow();
    }    
    
    public override function getBottomPadding():Int 
    {
        return getNumberOverflow();
    }
    
    /**
     * Gets the relative y position of the given steps relative to first line. 
     * @param steps the amount of steps while 2 steps are one line
     */
    public function getTabY(line:Int, correction:Int = 0) : Int
    {
        return Std.int((getLineOffset() * line) + (correction * getScale()));
    }
    
    /**
     * gets the padding needed to place numbers within the bounding box
     */
    private function getNumberOverflow()
    {
        var res = getResources();
        return Std.int((res.tablatureFont.getSize() / 2) + (res.tablatureFont.getSize() * 0.2));
    }

    
    public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
    {
        var res = getResources();
        
        //
        // draw string lines
        //
        canvas.setColor(res.staveLineColor);
        var lineY = cy + y + getNumberOverflow();
        
        var startY = lineY;
        for (i in 0 ... bar.track.tuning.length)
        {
            if (i > 0) lineY += Std.int(getLineOffset());
            canvas.beginPath();
            canvas.moveTo(cx + x, lineY);
            canvas.lineTo(cx + x + width, lineY);
            canvas.stroke();
        }
        
        // Info guides for debugging

        // drawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
        // drawInfoGuide(canvas, cx, cy, stave.staveTop, new Color(0, 255, 0)); // stavetop
        // drawInfoGuide(canvas, cx, cy, stave.staveBottom, new Color(0,255,0)); // stavebottom
        // drawInfoGuide(canvas, cx, cy, height, new Color(255, 0, 0)); // bottom
    }
    
    private function drawInfoGuide(canvas:ICanvas, cx:Int, cy:Int, y:Int, c:Color)
    {
        canvas.setColor(c);
        canvas.beginPath();
        canvas.moveTo(cx + x, cy + this.y + y);
        canvas.lineTo(cx + x + width, cy + this.y + y);
        canvas.stroke();
    }
}