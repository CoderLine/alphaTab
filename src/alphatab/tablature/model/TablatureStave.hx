/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.tablature.model;
import alphatab.model.BeatStrokeDirection;
import alphatab.model.Color;
import alphatab.model.Duration;
import alphatab.model.effects.BendEffect;
import alphatab.model.effects.BendPoint;
import alphatab.model.effects.FingeringType;
import alphatab.model.effects.HarmonicType;
import alphatab.model.Measure;
import alphatab.model.Point;
import alphatab.model.SlideType;
import alphatab.model.Voice;
import alphatab.model.VoiceDirection;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayer;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.drawing.MusicFont;
import alphatab.tablature.drawing.NotePainter;
import alphatab.tablature.ViewLayout;

/**
 * This Stave renders the guitar tablature and this effects:
 *  - (Heavy) Accentuated Note  
 *  - Tapping/Slapping/Popping
 *  - LetRing
 *  - PalmMute
 *  - Beat Vibrato
 *  - Note Vibrato
 *  - FadeIn
 *  - Bends 
 *  - TremoloBar 
 *  - Harmonics 
 *  - Tapping
 *  - Dead Notes
 *  - Grace Notes
 *  - Slides
 *  - Hammer Ons
 */
class TablatureStave extends Stave
{
    
    public static inline var STAVE_ID = "tablature";
    
    // space before the tablature stave starts
    private static inline var TopPadding = 0;
    // line for accentuated note symbols
    private static inline var AccentuatedNote = 1;
    // line for Tapping/Slapping/Popping and line
    private static inline var TapingEffect = 2;
    // line for let ring symbol and line
    private static inline var LetRing = 3;
    // line for palm mute symbol and line
    private static inline var PalmMute = 4;
    // line for beat vibrato symbol
    private static inline var BeatVibrato = 5;
    // line for note vibrato symbol
    private static inline var NoteVibrato = 6;
    // line for fade in symbol
    private static inline var FadeIn = 7;
    // line for harmonic symbols
    private static inline var Harmonics = 8;
    // offset to make space for bend lines
    private static inline var Bends = 9;
    // offset to make space for tremolo bar lines (to upper tremolos)
    private static inline var TremoloBarTop = 10;
    // the offset before the tablature lines start
    private static inline var TablatureTopSeparator = 11;
    // the size of the tablature notes
    private static inline var Tablature = 12;
    // the offset after the tablature lines end
    private static inline var TablatureBottomSeparator = 13;
    // offset to make space for tremolo bar lines (to lower tremolos)
    private static inline var TremoloBarBottom = 14;
    // the offset for ryhtm lines
    private static inline var Rhythm = 15;
    // Fingering Indicators
    private static inline var Fingering = 16;
    // bottom spacing
    private static inline var BottomPadding = 17;
    
    private var _rangeIndices:Array<Int>;
    
    public function new(line:StaveLine, layout:ViewLayout)
    {
        super(line, layout);        
        spacing = new StaveSpacing(BottomPadding + 1);
        spacing.set(TopPadding, Math.floor(15 * layout.scale));
        spacing.set(TablatureTopSeparator, Math.floor(10 * layout.scale));
        spacing.set(Tablature, ((line.track.stringCount() - 1) * layout.stringSpacing));
        spacing.set(TablatureBottomSeparator, Math.floor(10 * layout.scale));
        spacing.set(BottomPadding, Math.floor(15 * layout.scale));
        
        _rangeIndices = [0, 0];
    }
    
    public override function getStaveId() : String
    {
        return "tablature";
    }
    
    // gets the spacing index used for grouping staves
    public override function getBarTopSpacing() : Int
    {
        return TablatureTopSeparator;
    }
    
    // gets the spacing index used for grouping staves
    public override function getBarBottomSpacing() : Int
    {
        return TremoloBarBottom;
    }
    
    // gets the spacing index used for grouping staves with a line
    public override function getLineTopSpacing() : Int
    {
        return Tablature;
    }
    
    // gets the spacing index used for grouping staves with a line
    public override function getLineBottomSpacing() : Int
    {
        return TablatureBottomSeparator;
    }    
    
    public override function prepare(measure:MeasureDrawing)
    {
        // register spacings for given measure          
        if(measure.effectsCache.accentuatedNote)
            spacing.set(AccentuatedNote, layout.effectSpacing);
        if(measure.effectsCache.letRing)
            spacing.set(LetRing, layout.effectSpacing);
        if(measure.effectsCache.tapSlapPop)
            spacing.set(TapingEffect, layout.effectSpacing);
        if(measure.effectsCache.palmMute)
            spacing.set(PalmMute, layout.effectSpacing);
        if(measure.effectsCache.harmonic)
            spacing.set(Harmonics, layout.effectSpacing);
        if(measure.effectsCache.beatVibrato)
            spacing.set(BeatVibrato, layout.effectSpacing);
        if(measure.effectsCache.vibrato)
            spacing.set(NoteVibrato, layout.effectSpacing);
        if(measure.effectsCache.fadeIn)
            spacing.set(FadeIn, layout.effectSpacing);
        
        if (line.tablature.getStaveSetting(STAVE_ID, "rhythm", false) == true)
        {
            spacing.set(Rhythm, 20 * layout.scale);
        }
            
        if(measure.effectsCache.bend)
        {
            if(spacing.spacing[Bends] < measure.effectsCache.bendOverflow)
                spacing.set(Bends, measure.effectsCache.bendOverflow);
        }
        
        if (measure.effectsCache.fingering > 0)
        {
            var fingeringSpacing = measure.effectsCache.fingering * layout.effectSpacing;
            
            if (spacing.spacing[Fingering] < fingeringSpacing)
                spacing.set(Fingering, fingeringSpacing);
        }
      
        if (measure.effectsCache.tremoloBar)
        {
            if(spacing.spacing[TremoloBarTop] < measure.effectsCache.tremoloBarTopOverflow)
                spacing.set(TremoloBarTop, measure.effectsCache.tremoloBarTopOverflow);

            if(spacing.spacing[TremoloBarBottom] < measure.effectsCache.tremoloBarBottomOverflow)
                spacing.set(TremoloBarBottom, measure.effectsCache.tremoloBarBottomOverflow);
        }        
    }
    
    public override function paintStave(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
    {
        // paint lines        
        var lineY:Int = y + spacing.get(Tablature);
        for (i in 0 ... line.track.stringCount()) 
        {
            context.get(DrawingLayers.Lines).startFigure();
            context.get(DrawingLayers.Lines).addLine(x, lineY, x + line.width, lineY);
            lineY += layout.stringSpacing; 
        }
    }
    
    public override function paintMeasure(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {        
        var realX:Int = x + measure.x;
        var w:Int = measure.width + measure.spacing;
        
        paintDivisions(layout, context, measure, realX, y, 5, spacing.get(Tablature), spacing.spacing[Tablature]);
        paintClef(layout, context, measure, realX, y);
        
        realX += measure.getDefaultSpacings(layout);
        paintBeats(layout, context, measure, realX, y);
    }
    
    // Paint a "tab" text on first measure
    private function paintClef(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.isFirstOfLine()) return;
        
        // TODO: Doesn't work for other string counts
        /*y += spacing.get(Tablature);
        x += Math.floor(20 * layout.scale);
        var fill:DrawingLayer = context.get(DrawingLayers.MainComponents);

        // T
        fill.addString("T", DrawingResources.clefFont, x, y, "top");
        y += DrawingResources.clefFontHeight;
        fill.addString("A", DrawingResources.clefFont, x, y, "top");
        y += DrawingResources.clefFontHeight;
        fill.addString("B", DrawingResources.clefFont, x, y, "top"); */       
    }
    
    
    
    
    private function paintBeats(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {        
        for (beat in measure.beats)
        {
            var bd:BeatDrawing = cast beat;
            paintBeat(layout, context, bd, x + bd.x, y);
        }
    }
    
    private function paintBeat(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        #if DEBUG_DRAWING
        var debugLayer = context.get(DrawingLayers.Overlays);
        var c:Color = (beat.index % 2 == 0) 
                            ? new Color(255, 0, 0, 0.5) 
                            : new Color(0, 255, 0, 0.5);
        debugLayer.setColor(c);
        var top = y;
        var bottom = y + spacing.get(BottomPadding);
        debugLayer.addRect(x, top, beat.width, bottom-top);
        debugLayer.startFigure();
        #end
    
        // paint voices
        for (voice in beat.voices)
        {
            paintVoice(layout, context, cast voice, x, y);
        }
        
        // effects
        paintBeatEffects(layout, context, beat, x, y);
    }
    
    private function paintVoice(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {       
        if (!voice.isEmpty)
        {
            // paint notes
            for (note in voice.notes)
            {
                paintNote(layout, context, cast note, x, y);
            }
            
            paintBeam(layout, context, voice, x, y);
            // paint note effects 
            // (only paint effects which are placed above the tablature once per voice)
            paintVoiceEffects(layout, context, voice, x, y);
        }
    }
    
    private function paintBeam(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (voice.isRestVoice() || line.tablature.getStaveSetting(STAVE_ID, "rhythm", false) == false) return;
        
        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        var draw:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceDraw1) : context.get(DrawingLayers.VoiceDraw2);
        
        if (voice.duration.value >= Duration.HALF)
        {
            var key:Int = voice.beat.measure.keySignature();
            var clef:Int = voice.beat.measure.clef;
            
            var xMove:Float = voice.maxStringNote.noteSize.x / 2;
            
            var y1:Int = Math.floor(y + getNoteTablaturePosY(layout, voice.maxStringNote) + (layout.stringSpacing/1.5));
            var y2:Int = y + spacing.get(Rhythm + 1);
            
            // paint the line
            draw.addLine(x + xMove, y1, x + xMove, y2);
            
            // need to paint a bar?
            if (voice.duration.value >= Duration.QUARTER)
            {
                var index:Int = voice.duration.index() - 2;
                if (index > 0)
                {
                    var startX:Int;
                    var endX:Int;

                    if (voice.joinedType == JoinedType.NoneRight)
                    {
                        startX = Math.round(x + xMove);
                        endX = Math.round(x + (6*layout.scale) + xMove);
                    }
                    else if (voice.joinedType == JoinedType.NoneLeft)
                    {
                        startX = Math.round(x - (6*layout.scale) + xMove);
                        endX = Math.round(x + xMove);
                    }
                    else
                    {
                        startX = Math.round(voice.leftJoin.beatDrawing().fullX() + xMove);
                        endX = Math.round(voice.rightJoin.beatDrawing().fullX() + (voice.rightJoin.maxStringNote.noteSize.x / 2));
                    }
                    
                    NotePainter.paintBar(fill, startX, y2, endX, y2, index, 1, layout.scale);
                    
                }
            }
        }
    }
    
    
    
    private function calculateBeamY(layout:ViewLayout, beatGroup:BeatGroup, direction:Int, x:Float, key:Float, clef:Int)
    {
        // we use the min/max notes to place the beam along their real position        
        // we only want a maximum of 10 offset for their gradient
        var maxDistance:Int = Math.round(10 * layout.scale);
        
        // the offsets for the min/max note to the beam
        var upOffset:Float = 0;
        var downOffset:Float = 0;
        
        // some variables for calculation
        var y:Int;
        var x1:Int;
        var x2:Int;
        var y1:Int;
        var y2:Int;      
        
        // below all notes
        if (direction == VoiceDirection.Down)
        {
            // if the min note is not first or last, we can align notes directly to the position
            // of the min note
            if (beatGroup.minNote != beatGroup.firstMinNote && beatGroup.minNote != beatGroup.lastMinNote)
            {
                return getNoteTablaturePosY(layout, beatGroup.minNote) + downOffset;
            }
            
            // calculate the two points where to place the beam trough
            y = 0;
            x1 = beatGroup.firstMinNote.beatDrawing().fullX();
            x2 = beatGroup.lastMinNote.beatDrawing().fullX();
            y1 = Math.round(getNoteTablaturePosY(layout, beatGroup.firstMinNote) + downOffset);
            y2 = Math.round(getNoteTablaturePosY(layout, beatGroup.lastMinNote) + downOffset);
            
            // ensure the maxDistance
            if (y1 > y2 && (y1 - y2) > maxDistance) y2 = (y1 - maxDistance);
            if (y2 > y1 && (y2 - y1) > maxDistance) y1 = (y2 - maxDistance);
            
            // calculate real y             
            if ((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0)
            {
                y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
            }
            return y1 - y;
        }
        // below all notes
        else
        {
            // do the same operation like above, only use max notes to ensure correct positioning
            
            if (beatGroup.maxNote != beatGroup.firstMaxNote && beatGroup.maxNote != beatGroup.lastMaxNote)
            {
                return getNoteTablaturePosY(layout, beatGroup.maxNote) - upOffset;
            }
            
            // calculate the two points where to place the beam trough
            y = 0;
            x1 = beatGroup.firstMaxNote.beatDrawing().fullX();
            x2 = beatGroup.lastMaxNote.beatDrawing().fullX();
            y1 = Math.round(getNoteTablaturePosY(layout, beatGroup.firstMaxNote) - upOffset);
            y2 = Math.round(getNoteTablaturePosY(layout, beatGroup.lastMaxNote) - upOffset);
            
            // ensure the maxDistance
            if (y1 < y2 && (y2 - y1) > maxDistance) y2 = (y1 + maxDistance);
            if (y2 < y1 && (y1 - y2) > maxDistance) y1 = (y2 + maxDistance);
            
            // calculate real y             
            if ((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0)
            {
                y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
            }
            return y1 - y;
        }        
    }
        
    private function paintNote(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        var tabX:Int = cast (note.noteSize.x / 2);
        var realX:Int = x;
        var realY:Int = y + getNoteTablaturePosY(layout, note);

        // paint number for note
        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        if (!note.isTiedNote)
        { 
            var visualNote:String = note.effect.deadNote ? "X" : Std.string(note.value);
            visualNote = note.effect.ghostNote ? "(" + visualNote + ")" : visualNote;

            fill.addString(visualNote, DrawingResources.noteFont, realX, realY);
        }
        
        // paint effects
        paintEffects(layout, context, note, x, y, realY);
    }
    
    private function getNoteTablaturePosY(layout:ViewLayout, note:NoteDrawing)
    {
        return spacing.get(Tablature) + Math.round((note.string - 1) * layout.stringSpacing);
    }
    
    private function paintVoiceEffects(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (voice.isEmpty || voice.isRestVoice()) return;
        
        paintAccentuatedNote(layout, context, voice, x, y);
        paintLetRing(layout, context, voice, x, y);
        paintPalmMute(layout, context, voice, x, y);    
        paintNoteVibrato(layout, context, voice, x, y);
        paintHarmonics(layout, context, voice, x, y);
        paintFingering(layout, context, voice, x, y);
        paintTrillBeat(layout, context, voice, x, y);
    }
    
    private function paintEffects(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int, noteY:Int)
    {
        // effects above/blow tablature        
        // Now painted once per voice
        /*paintAccentuatedNote(layout, context, note, x, y);
        paintLetRing(layout, context, note, x, y);
        paintPalmMute(layout, context, note, x, y);    
        paintNoteVibrato(layout, context, note, x, y);
        paintHarmonics(layout, context, note, x, y);
        paintFingering(layout, context, note, x, y);
        paintTrill(layout, context, note, x, y, noteY);*/
        
        // effects on tablature number
        paintGrace(layout, context, note, x, noteY);
        paintHammerOn(layout, context, note, x, noteY);
        paintBend(layout, context, note, x, noteY);
        paintSlides(layout, context, note, x, noteY);
        paintTrillNote(layout, context, note, x, noteY);
    }
    
    // paint a small number before real note
    private function paintGrace(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.isGrace()) return;
        
        var fill:DrawingLayer = note.voice.index == 0
                                 ? context.get(DrawingLayers.VoiceEffects1)
                                 : context.get(DrawingLayers.VoiceEffects2);
                                 
        var value:String = note.effect.grace.isDead ? "X" : Std.string(note.effect.grace.fret);
        
        fill.addString(value, DrawingResources.graceFont, x - Math.round(7 * layout.scale), y);
    }
    
    // paints a symbol for accentuated or heavy accentuated notes.
    private function paintAccentuatedNote(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (!voice.effectsCache.accentuatedNote && !voice.effectsCache.heavyAccentuatedNote) return;
        
        var realX:Int = cast (x + (voice.minNote.noteSize.x / 2));
        var realY:Int = y + spacing.get(AccentuatedNote);
        
        var layer:DrawingLayer = voice.index == 0
                                 ? context.get(DrawingLayers.Voice1)
                                 : context.get(DrawingLayers.Voice2);
        var symbol = voice.effectsCache.accentuatedNote ? MusicFont.AccentuatedNote : MusicFont.HeavyAccentuatedNote;              
         
                                 
        layer.addMusicSymbol(symbol, realX, realY, layout.scale);
    }
    
    
    // paints the ring----| mark above beats
    private function paintLetRing(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (!voice.effectsCache.letRing) return;
        var realY:Int = y + spacing.get(LetRing);
        
        // get states of previous and next voice
        var nextVoice:VoiceDrawing = voice.getNextVoice();
        var previousVoice:VoiceDrawing = voice.getPreviousVoice();
        
        var nextVoiceRing = nextVoice != null && nextVoice.effectsCache.letRing;
        var previousVoiceRing = previousVoice != null && previousVoice.effectsCache.letRing;
        
        paintRange(layout, context, voice, x, realY, "ring", nextVoice, nextVoiceRing, previousVoice, previousVoiceRing, 0); 
    }
    
    // paints the P.M.----| mark above beats
    private function paintPalmMute(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (!voice.effectsCache.palmMute) return;
        var realY:Int = y + spacing.get(PalmMute);
        
        // get states of previous and next voice
        var nextVoice:VoiceDrawing = voice.getNextVoice();
        var previousVoice:VoiceDrawing = voice.getPreviousVoice();
        
        var nextVoicePm = nextVoice != null && nextVoice.effectsCache.palmMute;
        var previousVoicePm= previousVoice != null && previousVoice.effectsCache.palmMute;
        
        paintRange(layout, context, voice, x, realY, "P.M.", nextVoice, nextVoicePm, previousVoice, previousVoicePm, 1); 
    }
    
    // paints a ranged effect:
    //   ring --------|
    //   P.M. --------|
    private function paintRange(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, startX:Int, y:Int, 
                                label:String, nextVoice:VoiceDrawing, nextVoiceEffect:Bool, previousVoice:VoiceDrawing, previousVoiceEffect:Bool,
                                startOffsetIndex:Int)
    {
        // end line on end of current beat
        var endX:Float = startX + voice.beatDrawing().fullWidth();
        var prevOnSameStaveLine = previousVoice != null && previousVoice.measureDrawing().staveLine == voice.measureDrawing().staveLine;
        var nextOnSameStaveLine = nextVoice != null && nextVoice.measureDrawing().staveLine == voice.beatDrawing().measureDrawing().staveLine;
                
        var fill:DrawingLayer = voice.index == 0
                         ? context.get(DrawingLayers.Voice1)
                         : context.get(DrawingLayers.Voice2);

        var draw:DrawingLayer = voice.index == 0
                         ? context.get(DrawingLayers.VoiceDraw1)
                         : context.get(DrawingLayers.VoiceDraw2);

        draw.startFigure();
        
        y += DrawingResources.effectFontHeight;
        
        // if the next beat is on the same line and 
        // has the effect set, we stop our line there
        var isEnd = (!nextVoiceEffect || !nextOnSameStaveLine);
        if (isEnd)
        {
            var offset:Int = cast (8*layout.scale);
            endX -= offset;
        }
        
        // draw the label if the previous 
        // beat isnt on the same line or if it hasn't the effect set
        if (!prevOnSameStaveLine || !previousVoiceEffect)
        {
            fill.addString(label, DrawingResources.effectFont, startX, y);
            // offset the startX for the line
            context.graphics.font = DrawingResources.effectFont;
            var offset:Int = cast (context.graphics.measureText(label) + 4*layout.scale);
            startX += offset;
            _rangeIndices[startOffsetIndex] = startX;
        }
        // start at the measure start, if we are on the first beat
        else if (prevOnSameStaveLine && voice.beatDrawing() == voice.beatDrawing().measure.beats[0])
        {
            startX -= previousVoice.measureDrawing().getDefaultSpacings(layout);
        }
        
        // draw the line
        // draw.startFigure();
        // draw.addLine(startX, y, endX, y);
        
        // draw end segment if needed
        if (isEnd) 
        {
            draw.startFigure();
            draw.addDashedLine(_rangeIndices[startOffsetIndex], y, endX, y);
            
            var size:Int = cast (8 * layout.scale);
            draw.startFigure();
            draw.addLine(endX, y - size/2 , endX, y + size/2);
        }
    }
    
    // paints a vibrato symbol with a scale of 0.75 above the full beat
    private function paintNoteVibrato(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (!voice.effectsCache.vibrato) return;
        
        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        var width = voice.beatDrawing().fullWidth();
        paintVibrato(layout, fill, x, y + spacing.get(NoteVibrato), width, 0.75);
    }
    
    // paints vibrato symbols within the specified range using the given symbol scale
    private function paintVibrato(layout:ViewLayout, layer:DrawingLayer, x:Int, y:Int, w:Int, symbolScale:Float = 1)
    {           
        var step:Float = 18 * layout.scale * symbolScale;        
        var loops:Int = Math.floor(Math.max(1, (w / step)));
        
        for (i in 0 ... loops)
        {
            layer.addMusicSymbol(MusicFont.VibratoLeftRight, x, y, layout.scale * symbolScale);
            x += Math.floor(step);
        }
    }
    
    // paints a Tr text above the note, a small number beneath the original note
    private function paintTrillNote(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.isTrill()) return;
        
        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        var str = "(" + note.effect.trill.fret + ")";
        fill.addString(str, DrawingResources.graceFont, x + (2*note.noteSize.x), y);
    }
    
    // paints a Tr text above the note, a small number beneath the original note
    private function paintTrillBeat(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (!voice.effectsCache.trill) return;
        
        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        fill.addString("Tr", DrawingResources.effectFont, x, y + spacing.get(NoteVibrato));
    }
    
    // paints a A.H, N.H,... above the note
    private function paintHarmonics(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (!voice.effectsCache.harmonic) return;
        
        var key:String = "";
        switch (voice.effectsCache.harmonicType)
        {
            case HarmonicType.Natural:
                key = "Harm";
            case HarmonicType.Artificial:
                key = "A.H";
            case HarmonicType.Tapped:
                key = "T.H";
            case HarmonicType.Pinch:
                key = "P.H";
            case HarmonicType.Semi:
                key = "S.H";
        }
        
        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        fill.addString(key, DrawingResources.effectFont, x, y + spacing.get(Harmonics));
        
    }
    
    // paints fingering indicators below the tablature
    private function paintFingering(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (voice.effectsCache.fingering == 0) return;
        
        y += Math.round(DrawingResources.effectFontHeight / 2);
        
        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        
        var y2 = y + spacing.get(Fingering);

        for (fingering in voice.effectsCache.leftHandFingering)
        {
            if (fingering != FingeringType.Unknown && fingering != FingeringType.NoOrDead)
            {
                var str = "";
                switch(fingering)
                {
                    case FingeringType.Thumb:
                        str = "T";
                    case FingeringType.IndexFinger:
                        str = "1";
                    case FingeringType.MiddleFinger:
                        str = "2";
                    case FingeringType.AnnularFinger:
                        str = "3";
                    case FingeringType.LittleFinger:
                        str = "4";
                }
                fill.addString(str, DrawingResources.effectFont, x, y2);
            }
            y2 += Math.floor(layout.effectSpacing);
        }
        
        for (fingering in voice.effectsCache.rightHandFingering)
        {
            if (fingering != FingeringType.Unknown && fingering != FingeringType.NoOrDead)
            {
                var str = "";
                switch(fingering)
                {
                    case FingeringType.Thumb:
                        str = "p";
                    case FingeringType.IndexFinger:
                        str = "i";
                    case FingeringType.MiddleFinger:
                        str = "m";
                    case FingeringType.AnnularFinger:
                        str = "a";
                    case FingeringType.LittleFinger:
                        str = "c";
                }
                fill.addString(str, DrawingResources.effectFont, x, y2);
            }
            y2 += Math.floor(layout.effectSpacing);
        }
    }
    
    
    // paints a tie between the current note, and the note on the same string and the next beat
    private function paintHammerOn(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.hammer) return;
        
        // TODO: Create groups for ties. (one tie per group)
        
        var nextBeat:BeatDrawing = note.beatDrawing().getNextBeat();
        var nextNote:NoteDrawing = nextBeat == null ? null : cast nextBeat.getNote(note.voice.index, note.string);
        
        var down:Bool = note.string > 3 || nextNote == null;
        
        var fill:DrawingLayer = note.voice.index == 0
                            ? context.get(DrawingLayers.VoiceEffects1)
                            : context.get(DrawingLayers.VoiceEffects2);
                            
        var realX = x + (note.noteSize.x/2);
        var realY = down ? y + DrawingResources.noteFontHeight/2
                         : y - DrawingResources.noteFontHeight/2;
        var endX:Float = nextNote != null ? x + note.beatDrawing().fullWidth() + (nextNote.noteSize.x / 2)
                                            : realX + 15*layout.scale;
                    
        paintTie(layout, fill, realX, realY, endX, realY, down);
    }
    
    // paints a tie between the two given points
    public static function paintTie(layout:ViewLayout, layer:DrawingLayer, x1:Float, y1:Float, x2:Float, y2:Float, down:Bool=false) : Void
    {
        //
        // calculate control points 
        //
        var offset = 15*layout.scale;
        var size = 4*layout.scale;
        // normal vector
        var normalVector = {
            x: (y2 - y1),
            y: (x2 - x1)
        }
        var length = Math.sqrt((normalVector.x*normalVector.x) + (normalVector.y * normalVector.y));
        if(down) 
            normalVector.x *= -1;
        else
            normalVector.y *= -1;
        
        // make to unit vector
        normalVector.x /= length;
        normalVector.y /= length;
        
        // center of connection
        var center = {
            x: (x2 + x1)/2,
            y: (y2 + y1)/2
        };
       
        // control points
        var cp1 = {
            x: center.x + (offset*normalVector.x),
            y: center.y + (offset*normalVector.y),
        }; 
        var cp2 = {
            x: center.x + ((offset-size)*normalVector.x),
            y: center.y + ((offset-size)*normalVector.y),
        };
        layer.startFigure();
        layer.moveTo(x1, y1);
        layer.quadraticCurveTo(cp1.x, cp1.y, x2, y2);
        layer.quadraticCurveTo(cp2.x, cp2.y, x1, y1);
        layer.closeFigure();
    }
        
    // paints arrowed lines and labels for all bendpoints
    private function paintBend(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.isBend()) return;
        var scale:Float = layout.scale;
       
        // HACK: html5 canvas seems to ignore left alignment of 
        // the text. therefore we need to add the textsize twice
        // to be left of the text
        x += Math.floor(note.noteSize.x);
        var endX:Float = x + note.beatDrawing().fullWidth();
        // the top offset for bends
        var minY:Float = y - 60 * scale;
      
        var fill:DrawingLayer = note.voice.index == 0
                     ? context.get(DrawingLayers.VoiceEffects1)
                     : context.get(DrawingLayers.VoiceEffects2);

        var draw:DrawingLayer = note.voice.index == 0
                     ? context.get(DrawingLayers.VoiceEffectsDraw1)
                     : context.get(DrawingLayers.VoiceEffectsDraw2);

        if (note.effect.bend.points.length >= 2)
        {
            // calculate offsets per step
            var dX:Float = (endX - x) / BendEffect.MAX_POSITION;
            var dY:Float = (y - minY) / BendEffect.MAX_VALUE;

            draw.startFigure();
            for (i in 0 ... note.effect.bend.points.length - 1)
            {
                var firstPt:BendPoint = note.effect.bend.points[i];
                var secondPt:BendPoint = note.effect.bend.points[i + 1];

                // don't draw a line if there's no offset
                if (firstPt.value == secondPt.value && i == note.effect.bend.points.length - 2) continue;

                // draw bezier lien from first to second point
                var firstLoc:Point = new Point(cast (x + (dX * firstPt.position)), cast (y - dY * firstPt.value));
                var secondLoc:Point = new Point(cast (x + (dX * secondPt.position)), cast (y - dY * secondPt.value));
                var firstHelper:Point = new Point(firstLoc.x + ((secondLoc.x - firstLoc.x)), cast (y - dY * firstPt.value));
                draw.addBezier(firstLoc.x, firstLoc.y, firstHelper.x, firstHelper.y, secondLoc.x, secondLoc.y, secondLoc.x, secondLoc.y);

                // what type of arrow? (up/down)
                var arrowSize:Float = 3 * scale;
                if (secondPt.value > firstPt.value)
                {
                    draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x - arrowSize - 0.5, secondLoc.y + arrowSize); 
                    draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x + arrowSize - 0.5, secondLoc.y + arrowSize); 
                }
                else if (secondPt.value != firstPt.value)
                {
                    draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x - arrowSize - 0.5, secondLoc.y - arrowSize); 
                    draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x + arrowSize - 0.5, secondLoc.y - arrowSize); 
                }
                                
                if (secondPt.value != 0)
                {
                    var dV:Float = (secondPt.value - firstPt.value) * 0.25; // dv * 1/4 
                    var up:Bool = dV > 0;
                    dV = Math.abs(dV);
                    
                    // calculate label
                    var s:String = "";
                    // Full Steps 
                    if (dV == 1)
                        s = "full";
                    else if (dV > 1)
                    {
                        s += Std.string(Math.floor(dV)) + " ";
                        // Quaters
                        dV -= Math.floor(dV);
                    }

                    if (dV == 0.25)
                        s += "1/4";
                    else if (dV == 0.5)
                        s += "1/2";
                    else if (dV == 0.75)
                        s += "3/4";

                    // draw label
                    context.graphics.font = DrawingResources.defaultFont;
                    var size:Float = context.graphics.measureText(s);
                    var y:Float = up ? secondLoc.y - DrawingResources.defaultFontHeight + (2 * scale) : secondLoc.y + DrawingResources.defaultFontHeight/2 + (2 * scale);
                    var x:Float = secondLoc.x - size / 2;

                    fill.addString(s, DrawingResources.defaultFont, cast x, cast y);
                }
            }
        }    
    }

    // paints slide lines and ties 
    private function paintSlides(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {        
        if (!note.effect.slide) return;
        
        var xOffset:Float = note.noteSize.x * 2;
        
        var xMove:Float = 15.0 * layout.scale;
        var yMove:Float = 3.0 * layout.scale;
        
       
        var draw:DrawingLayer = note.voice.index == 0
                                ? context.get(DrawingLayers.VoiceEffectsDraw1)
                                : context.get(DrawingLayers.VoiceEffectsDraw2);
        draw.startFigure();

        if (note.effect.slideType == SlideType.IntoFromBelow)
        {
            draw.addLine(x - xMove, y + yMove, x, y - yMove);
        }
        else if (note.effect.slideType == SlideType.IntoFromAbove)
        {
            draw.addLine(x - xMove, y - yMove, x, y + yMove);
        }
        else if (note.effect.slideType == SlideType.OutDownWards)
        {
            draw.addLine(x + xOffset, y - yMove, x + xOffset + xMove, y + yMove);
        }
        else if (note.effect.slideType == SlideType.OutUpWards)
        {
            draw.addLine(x + xOffset, y + yMove, x + xOffset + xMove, y - yMove);
        }
        else 
        {            
            var nextBeat:BeatDrawing = note.beatDrawing().getNextBeat();            
            var nextNote:NoteDrawing = nextBeat == null ? null : cast nextBeat.getNote(note.voice.index, note.string);
            
            if (nextNote != null)
            {
                if (nextNote.value < note.value)
                {
                    draw.addLine(x + xOffset, y - yMove, x + note.beatDrawing().fullWidth(), y + yMove);
                }
                else if (nextNote.value > note.value)
                {
                    draw.addLine(x + xOffset, y + yMove, x + note.beatDrawing().fullWidth(), y - yMove);
                }
                else
                {
                    draw.addLine(x + xOffset, y, x + note.beatDrawing().fullWidth(), y);
                }
                
                if (note.effect.slideType == SlideType.SlowSlideTo)
                {
                    paintHammerOn(layout, context, note, x, y);
                    var down:Bool = note.string > 3;
        
                    var realX = x + (note.noteSize.x/2);
                    var realY = down ? y + DrawingResources.noteFontHeight/2
                                     : y - DrawingResources.noteFontHeight/2;
                    var endX:Float = nextNote != null ? x + note.beatDrawing().fullWidth() + (nextNote.noteSize.x / 2)
                                                        : realX + 15*layout.scale;
                                
                    var fill:DrawingLayer = note.voice.index == 0
                        ? context.get(DrawingLayers.VoiceEffects1)
                        : context.get(DrawingLayers.VoiceEffects2);                                    
                    
                    
                    paintTie(layout, fill, realX, realY, endX, realY, down);
                }
            }
            else
            {
                draw.addLine(x + xOffset, y, x + note.beatDrawing().fullWidth(), y);
            }
        }
    }

       
    // paints all beat effects
    private function paintBeatEffects(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        paintTremoloBar(layout, context, beat.getMinNote(), x, y);
        paintBeatVibrato(layout, context, beat, x, y);
        paintTabSlapPop(layout, context, beat, x, y);
        paintFadeIn(layout, context, beat, x, y);
        paintStroke(layout, context, beat, x, y);
    }
    
    // paints lines and labels for all points
    private function paintTremoloBar(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (note == null) return;
        var beat:BeatDrawing = note.beatDrawing();
        if (!beat.effect.isTremoloBar()) return;
        
        var scale:Float = layout.scale;
        
        y = cast (y + spacing.get(Tablature) + Math.round((note.string - 1) * layout.stringSpacing)); 
       
        x += Math.floor(note.noteSize.x);
        var endX:Float = x + beat.fullWidth();
        // the top offset for bends
        var minY:Float = y - 60 * scale;
      
        var fill:DrawingLayer = note.voice.index == 0
                     ? context.get(DrawingLayers.VoiceEffects1)
                     : context.get(DrawingLayers.VoiceEffects2);

        var draw:DrawingLayer = note.voice.index == 0
                     ? context.get(DrawingLayers.VoiceEffectsDraw1)
                     : context.get(DrawingLayers.VoiceEffectsDraw2);

        if (beat.effect.tremoloBar.points.length >= 2)
        {
            // calculate offsets per step
            var dX:Float = (endX - x) / BendEffect.MAX_POSITION;
            var dY:Float = (y - minY) / BendEffect.MAX_VALUE;

            draw.startFigure();
            for (i in 0 ... beat.effect.tremoloBar.points.length - 1)
            {
                var firstPt:BendPoint = beat.effect.tremoloBar.points[i];
                var secondPt:BendPoint = beat.effect.tremoloBar.points[i + 1];

                // don't draw a line if there's no offset
                if (firstPt.value == secondPt.value && i == beat.effect.tremoloBar.points.length - 2) continue;

                // draw bezier lien from first to second point
                var firstLoc:Point = new Point(cast (x + (dX * firstPt.position)), cast (y - dY * firstPt.value));
                var secondLoc:Point = new Point(cast (x + (dX * secondPt.position)), cast (y - dY * secondPt.value));
                draw.addLine(firstLoc.x, firstLoc.y, secondLoc.x, secondLoc.y);
                
                if (secondPt.value != 0)
                {
                    var dV:Float = (secondPt.value) * 0.5;
                    var up:Bool = (secondPt.value - firstPt.value) >= 0;
                    var s:String = "";
                    
                    if (dV < 0)
                        s += "-";
                    
                    if(dV >= 1 || dV <= -1)
                        s += Std.string(Math.floor(Math.abs(dV))) + " ";
                    else if (dV < 0)
                        s += "-";
                    // Quaters
                    dV -= Math.floor(dV);

                    if (dV == 0.25)
                        s += "1/4";
                    else if (dV == 0.5)
                        s += "1/2";
                    else if (dV == 0.75)
                        s += "3/4";


                    context.graphics.font = DrawingResources.defaultFont;
                    var size:Float = context.graphics.measureText(s);
                    var sY:Float = up ? secondLoc.y - DrawingResources.defaultFontHeight - (3 * scale) : secondLoc.y + (3 * scale);
                    var sX:Float = secondLoc.x - size / 2;

                    fill.addString(s, DrawingResources.defaultFont, cast sX, cast sY);
                }
            }
        }    
    }

    // paints a vibrato symbol with a scale of 1 above the full beat
    private function paintBeatVibrato(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        if (!beat.effect.vibrato) return;
        
        var width = beat.fullWidth();
        paintVibrato(layout, context.get(DrawingLayers.VoiceEffects1), x, y + spacing.get(BeatVibrato), width, 1);
    }
    
    // paints a T for tapping, S for Slapping, P for popping
    private function paintTabSlapPop(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        var fill:DrawingLayer = context.get(DrawingLayers.VoiceEffects1);
        var realY:Int = y + spacing.get(TapingEffect);
 
        if (beat.effect.tapping)
        {
            fill.addString("T", DrawingResources.defaultFont, x, realY);
        }
        else if (beat.effect.slapping)
        {
            fill.addString("S", DrawingResources.defaultFont, x, realY);
        }
        else if (beat.effect.popping)
        {
            fill.addString("P", DrawingResources.defaultFont, x, realY);
        }
    }
    
    // paints two beziers lines for the fade in
    private function paintFadeIn(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        if (!beat.effect.fadeIn) return;
        
        y += spacing.get(FadeIn);
        var size:Int = Math.round(4.0 * layout.scale);
        
        var width:Int = beat.fullWidth();
        var layer:DrawingLayer = context.get(DrawingLayers.VoiceDraw1);

        layer.startFigure();
        layer.addBezier(x, y, x, y, x + width, y, x + width, y - size);
        layer.startFigure();
        layer.addBezier(x, y, x, y, x + width, y, x + width, y + size);
    }
    
    // paints a arrowed line up or down
    private function paintStroke(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        if (beat.effect.stroke.direction == BeatStrokeDirection.None) return;
        
        x -= Math.floor(2 * layout.scale);
        
        var topY:Int = y + spacing.get(Tablature);
        var bottomY:Int = topY + Math.round((beat.measure.track.stringCount() - 1) * layout.stringSpacing);
        
        var layer:DrawingLayer = context.get(DrawingLayers.MainComponentsDraw);
        layer.startFigure();
        
        layer.startFigure();
        layer.addLine(x, topY, x, bottomY);
        
        if (beat.effect.stroke.direction == BeatStrokeDirection.Up)
        {
            layer.addLine(x, topY, x + 3, topY + 5);
            layer.addLine(x, topY, x - 3, topY + 5);
        }
        else
        {
            layer.addLine(x, bottomY, x + 3, bottomY - 5);
            layer.addLine(x, bottomY, x - 3, bottomY - 5);
        }
    }

}