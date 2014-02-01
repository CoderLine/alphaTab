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
import alphatab.model.GraceType;
import alphatab.model.Note;
import alphatab.model.VibratoType;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BeamGlyph;
import alphatab.rendering.glyphs.BeatContainerGlyph;
import alphatab.rendering.glyphs.BeatGlyphBase;
import alphatab.rendering.glyphs.IMultiBeatEffectGlyph;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.utils.BarHelpersGroup.BarHelpers;
import alphatab.rendering.utils.BeamingHelper;
import alphatab.rendering.utils.BeamingHelper.BeamDirection;
import haxe.ds.IntMap;
import haxe.ds.ObjectMap;
import haxe.ds.StringMap;

using alphatab.model.ModelUtils;

class RhythmBarRenderer extends GroupedBarRenderer
{
    private var _direction:BeamDirection;
    private var _helpers:BarHelpers;
    
    public function new(bar:Bar, direction:BeamDirection) 
    {
        super(bar);
        _direction = direction;
    }
    
    public override function doLayout()
    {
        _helpers = stave.staveGroup.helpers.helpers.get(bar.track.index).get(bar.index);
        super.doLayout();
        height = Std.int(24 * getScale());
        isEmpty = false;
    }
    
    private override function createBeatGlyphs()
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
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new BeatContainerGlyph(b);
            container.preNotes = new BeatGlyphBase();
            container.onNotes = new BeatGlyphBase();
            container.postNotes = new BeatGlyphBase();
            addBeatGlyph(container);
        }
    }    
        
    public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
    {
        
    }
    
    
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        super.paint(cx, cy, canvas);

        for (v in _helpers.beamHelpers)
        {
            for (h in v)
            {
                paintBeamHelper(cx + getBeatGlyphsStart(), cy, canvas, h);
            }
        }        
    }
    
    private function paintBeamHelper(cx:Int, cy:Int, canvas:ICanvas, h:BeamingHelper):Void
    {
        // check if we need to paint simple footer
        if (h.beats.length == 1)
        {
            paintFooter(cx, cy, canvas, h);
        }
        else
        {
            paintBar(cx, cy, canvas, h);
        }
    }
    
    
    private function paintBar(cx:Int, cy:Int, canvas:ICanvas, h:BeamingHelper)
    {
        for (i in 0 ... h.beats.length)
        {
            var beat = h.beats[i];
            
            if (h.hasBeatLineX(beat))
            {
                //
                // draw line 
                //
                var beatLineX = Std.int(h.getBeatLineX(beat) + getScale());

                var y1 = cy + y;
                var y2 = cy + y + height;
                
                canvas.setColor(getLayout().renderer.renderingResources.mainGlyphColor);
                canvas.beginPath();
                canvas.moveTo(Std.int(cx + x + beatLineX), y1);
                canvas.lineTo(Std.int(cx + x + beatLineX), y2);
                canvas.stroke();
                            
                var brokenBarOffset = Std.int(6 * getScale());
                var barSpacing = Std.int(6 * getScale());
                var barSize = Std.int(3 * getScale());
                var barCount = beat.duration.getDurationIndex() - 2;
                var barStart = cy + y;
                if (_direction == Up)
                {
                    barSpacing = -barSpacing;
                    barStart += height;
                }
                
                for (barIndex in 0 ... barCount)
                {
                    var barStartX:Int;
                    var barEndX:Int;
                    
                    var barStartY:Int;
                    var barEndY:Int;
                    
                    var barY = barStart + (barIndex * barSpacing);
                    
                    // 
                    // Bar to Next?
                    //
                    if (i < h.beats.length - 1)
                    {
                        // full bar?
                        if (isFullBarJoin(beat, h.beats[i + 1], barIndex))
                        {
                            barStartX = beatLineX;
                            barEndX = Std.int(h.getBeatLineX(h.beats[i+1]) + getScale());
                        }
                        // broken bar?
                        else if(i == 0 || !isFullBarJoin(h.beats[i-1], beat, barIndex))
                        {
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        }
                        else
                        {
                            continue;
                        }
                        barStartY = Std.int(barY);
                        barEndY = Std.int(barY);
                        paintSingleBar(canvas, cx + x + barStartX, barStartY, cx + x + barEndX, barEndY, barSize);
                    }
                    // 
                    // Broken Bar to Previous?
                    //
                    else if (i > 0 && !isFullBarJoin(beat, h.beats[i - 1], barIndex))
                    {
                        barStartX = beatLineX - brokenBarOffset;
                        barEndX = beatLineX;
                        
                        barStartY = Std.int(barY);
                        barEndY = Std.int(barY);
                        
                        paintSingleBar(canvas, cx + x + barStartX, barStartY, cx + x + barEndX, barEndY, barSize);
                    }                
                }
            }
        }
    }
    
    private function paintFooter(cx:Int, cy:Int, canvas:ICanvas, h:BeamingHelper)
    {
        var beat = h.beats[0];
        
        if (beat.duration == Duration.Whole)
        {
            return;
        }
        
        //
        // draw line 
        //
        
        var beatLineX = Std.int(h.getBeatLineX(beat) + getScale());
        var direction = h.getDirection();
        
        var topY = 0;
        var bottomY = height;

        var beamY:Int;
        if (direction == Down)
        {
           beamY = bottomY;
        }
        else
        {
           beamY = topY;
        }

        canvas.setColor(getLayout().renderer.renderingResources.mainGlyphColor);
        canvas.beginPath();
        canvas.moveTo(Std.int(cx + x + beatLineX), cy + y + topY);
        canvas.lineTo(Std.int(cx + x + beatLineX), cy + y + bottomY);
        canvas.stroke();
        
        
        //
        // Draw beam 
        //
        var gx = Std.int(beatLineX);
        var glyph = new BeamGlyph(gx, beamY, beat.duration, direction, false);
        glyph.renderer = this;
        glyph.doLayout();
        glyph.paint(cx + x, cy + y, canvas);
    }    
    
    private function isFullBarJoin(a:Beat, b:Beat, barIndex:Int)
    {
        return (a.duration.getDurationIndex() - 2 - barIndex > 0) 
            && (b.duration.getDurationIndex() - 2 - barIndex > 0);
    }   
    
    private static function paintSingleBar(canvas:ICanvas, x1:Int, y1:Int, x2:Int, y2:Int, size:Int ) : Void
    {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 - size);
        canvas.lineTo(x1, y1 - size);
        canvas.closePath();
        canvas.fill();
    }    
}   