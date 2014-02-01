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

import alphatab.model.AccentuationType;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.GraceType;
import alphatab.model.HarmonicType;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.ScoreBarRenderer;
import alphatab.rendering.utils.BeamingHelper;

class ScoreBeatGlyph extends BeatGlyphBase
                    implements ISupportsFinalize
{
    private var _ties:Array<Glyph>;

    public var noteHeads : ScoreNoteChordGlyph;
    public var restGlyph : RestGlyph;

    public var beamingHelper:BeamingHelper;

    public function new() 
    {
        super();
    }
    
    public function finalizeGlyph(layout:ScoreLayout)
    {
        if (!container.beat.isRest()) 
        {
            noteHeads.updateBeamingHelper(container.x + x);
        }
    }
    
    public override function applyGlyphSpacing(spacing:Int):Void 
    {
        super.applyGlyphSpacing(spacing);
        // TODO: we need to tell the beaming helper the position of rest beats
        if (!container.beat.isRest()) 
        {
            noteHeads.updateBeamingHelper(container.x + x);
        }
    }
        
    public override function doLayout():Void 
    {
        // create glyphs
        if (!container.beat.isEmpty)
        {
            if (!container.beat.isRest())
            {        
                //
                // Note heads
                //
                noteHeads = new ScoreNoteChordGlyph();
                noteHeads.beat = container.beat;
                noteHeads.beamingHelper = beamingHelper;
                noteLoop( function(n) {
                    createNoteGlyph(n);
                });
                addGlyph(noteHeads);            
                
                //
                // Note dots
                //
                if (container.beat.dots > 0)
                {
                    addGlyph(new SpacingGlyph(0, 0, Std.int(5 * getScale()), false));
                    for (i in 0 ... container.beat.dots)
                    {
                        var group = new GlyphGroup();
                        noteLoop( function (n) {
                            createBeatDot(n, group);                    
                        });
                        addGlyph(group);
                    }
                }
            }
            else
            {
                var line = 0;
                var offset = 0;
            
                switch(container.beat.duration)
                {
                    case Whole:         
                        line = 4;
                    case Half:          
                        line = 5;
                    case Quarter:       
                        line = 7;
                        offset = -2;
                    case Eighth:        
                        line = 8;
                    case Sixteenth:     
                        line = 8;
                    case ThirtySecond:  
                        line = 8;
                    case SixtyFourth:   
                        line = 8;
                }
                
                var sr = cast(renderer, ScoreBarRenderer);
                var y = sr.getScoreY(line, offset);

                addGlyph(new RestGlyph(0, y, container.beat.duration));
            }
        }
        
        super.doLayout();
        if (noteHeads != null)
        {
            noteHeads.updateBeamingHelper(x);
        }
    }
    
    private function createBeatDot(n:Note, group:GlyphGroup)
    {            
        var sr = cast(renderer, ScoreBarRenderer);
        group.addGlyph(new CircleGlyph(0, sr.getScoreY(sr.getNoteLine(n), Std.int(2*getScale())), 1.5 * getScale()));
    }
    
    private function createNoteHeadGlyph(n:Note) : Glyph
    {
        var isGrace = container.beat.graceType != GraceType.None;
        if (n.beat.voice.bar.track.isPercussion)
        {
            var normalKeys:Array<Int> = [32,34,35,36,38,39,40,41,43,45,47,48,50,55,56,58,60,61];
            var xKeys:Array<Int> = [31,33,37,42,44,54,62,63,64,65,66];
            var value = n.realValue();                             
             
            if (value <= 30 || value >= 67 || Lambda.has(normalKeys, value) ) 
            {
                return new NoteHeadGlyph(0, 0, Duration.Quarter, isGrace);
            }
            else if (Lambda.has(xKeys, value)) 
            {
                return new DrumSticksGlyph(0, 0, isGrace);
            }
            else if (value == 46) 
            {
                return new HiHatGlyph(0, 0, isGrace);
            }
            else if (value == 49 || value == 57) 
            {
                return new DiamondNoteHeadGlyph(0, 0, isGrace);
            }
            else if (value == 52) 
            {
                return new ChineseCymbalGlyph(0, 0, isGrace);
            }
            else if (value == 51 || value == 53 || value == 59) 
            {
                return new RideCymbalGlyph(0, 0, isGrace);
            } 
            else
            {
                return new NoteHeadGlyph(0, 0, Duration.Quarter, isGrace);
            }
        }
        if (n.isDead) 
        {
            return new DeadNoteHeadGlyph(0, 0, isGrace);
        }
        else if (n.harmonicType == HarmonicType.None)
        {
            return new NoteHeadGlyph(0, 0, n.beat.duration, isGrace);
        }
        else
        {
            return new DiamondNoteHeadGlyph(0, 0, isGrace);
        }
    }

    private function createNoteGlyph(n:Note) 
    {
        var sr = cast(renderer, ScoreBarRenderer);
        var noteHeadGlyph:Glyph = createNoteHeadGlyph(n);
        
        // calculate y position
        var line = sr.getNoteLine(n);
        
        noteHeadGlyph.y = sr.getScoreY(line, -1);
        noteHeads.addNoteGlyph(noteHeadGlyph, n, line);
        
        if (n.isStaccato && !noteHeads.beatEffects.exists("Staccato"))
        {
            noteHeads.beatEffects.set("Staccato",  new CircleGlyph(0, 0, 1.5));
        }
        
        if (n.accentuated == AccentuationType.Normal && !noteHeads.beatEffects.exists("Accent"))
        {
            noteHeads.beatEffects.set("Accent",  new AccentuationGlyph(0, 0, AccentuationType.Normal));
        }
        if (n.accentuated == AccentuationType.Heavy && !noteHeads.beatEffects.exists("HAccent"))
        {
            noteHeads.beatEffects.set("HAccent",  new AccentuationGlyph(0, 0, AccentuationType.Heavy));
        }
    }
}