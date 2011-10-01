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
import alphatab.model.Duration;
import alphatab.model.effects.GraceEffectTransition;
import alphatab.model.MeasureClef;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.model.TripletFeel;
import alphatab.model.Tuplet;
import alphatab.model.VoiceDirection;
import alphatab.tablature.drawing.ClefPainter;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayer;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.drawing.KeySignaturePainter;
import alphatab.tablature.drawing.MusicFont;
import alphatab.tablature.drawing.NotePainter;
import alphatab.tablature.drawing.SilencePainter;
import alphatab.tablature.drawing.TempoPainter;
import alphatab.tablature.drawing.TripletFeelPainter;
import alphatab.tablature.ViewLayout;

/**
 * This stave implementation renders standard notation elements.
 * In this stave renders following elements 
 *  - Text 
 *  - Section Markers
 *  - Chord Names
 *  - TripletFeel 
 *  - Tempo Indicators
 *  - Triplet Groups
 *  - Repeat indicators
 */
class ScoreStave extends Stave
{
    private static var SCORE_KEYSHARP_POSITIONS:Array<Int> = [ 0, 3, -1, 2, 5, 1, 4 ];
    private static var SCORE_KEYFLAT_POSITIONS:Array<Int> = [ 4, 1, 5, 2, 6, 3, 7 ];
    
    private static var SCORE_SHARP_POSITIONS:Array<Int> = [7, 7, 6, 6, 5, 4, 4, 3, 3, 2, 2, 1 ];
    private static var SCORE_FLAT_POSITIONS:Array<Int> = [ 7, 6, 6, 5, 5, 4, 3, 3, 2, 2, 1, 1 ];
        
    private static var SCORE_CLEF_OFFSETS:Array<Int> = [ 30, 18, 22, 24 ];
    
    private static inline var UP_OFFSET:Int = 28; 
    private static inline var DOWN_OFFSET:Int = 28;
    
    private static inline var TS_NUMBER_SIZE:Int = 10;
    
    public static inline var STAVE_ID = "score";
    
    // spacings
    private static inline var TopPadding = 0;
    private static inline var Text = 1;
    private static inline var Marker = 2;
    private static inline var Chord = 3;    
    private static inline var TripletFeels = 4;
    private static inline var Tempo = 5;
    private static inline var Triplet = 6;
    private static inline var RepeatEnding = 7;
    private static inline var ScoreTopPadding = 8;
    private static inline var ScoreTopLines = 9; // additional space for extra lines above the stave
    private static inline var ScoreMiddleLines = 10; // the default 5 lines visible by the score stave
    private static inline var ScoreBottomLines = 11; // additional space for extra lines below the stave
    private static inline var BottomPadding = 12;
    
    public function new(line:StaveLine, layout:ViewLayout)
    {
        super(line, layout);        
        spacing = new StaveSpacing(BottomPadding + 1);
        spacing.set(TopPadding, Math.floor(15 * layout.scale));
        spacing.set(ScoreTopPadding, Math.floor(15 * layout.scale));
        spacing.set(ScoreMiddleLines, Math.floor(layout.scoreLineSpacing * 4));
        spacing.set(BottomPadding, Math.floor(15 * layout.scale));
    }
   
    // gets the spacing index used for grouping staves with a bar
    public override function getBarTopSpacing() : Int
    {
        return ScoreTopPadding;
    }
    
    // gets the spacing index used for grouping staves with a bar
    public override function getBarBottomSpacing() : Int
    {
        return ScoreBottomLines;
    }
    
    // gets the spacing index used for grouping staves with a line
    public override function getLineTopSpacing() : Int
    {
        return ScoreMiddleLines;
    }
    
    // gets the spacing index used for grouping staves with a line
    public override function getLineBottomSpacing() : Int
    {
        return ScoreBottomLines;
    }    
    

    public override function prepare(measure:MeasureDrawing)
    {
        if (measure.effectsCache.text)
        {
            spacing.set(Text, layout.effectSpacing);
        }
        if (measure.effectsCache.tempo)
        {
            spacing.set(Tempo, 20 * layout.scale);
        }
        if (measure.effectsCache.tripletFeel)
        {
            spacing.set(TripletFeels, 30 * layout.scale);
        }        
        if (measure.effectsCache.triplet)
        {
            spacing.set(Triplet, 5*layout.scale);
        }
        if (measure.effectsCache.marker)
        {
            spacing.set(Marker, layout.effectSpacing);
        }
        if (measure.effectsCache.chord)
        {
            spacing.set(Chord, layout.effectSpacing);
        }
        if (measure.header.repeatAlternative > 0)
        {
            spacing.set(RepeatEnding, Math.floor(15 * layout.scale));
        }
        
        var currentTopSpacing = spacing.spacing[ScoreTopLines];
        var middleLinesStart = spacing.get(ScoreMiddleLines);
        var middleLinesEnd = spacing.get(ScoreMiddleLines + 1);
        
        // calculate overflow of min note in relation to middle score  
        var minNote = measure.minDownGroup == null ? null : measure.minDownGroup.minNote;
        if (minNote != null)
        {
            // get the space from top to start of lines
            // (take care not to mention the current offset)
            var currentSpaceToLines = middleLinesStart - currentTopSpacing;
            // calculate the real score position
            var minScoreY = getNoteScorePosY(layout, minNote) + currentSpaceToLines;
            
            // take care of note beam
            /*if(minNote.voice.value >= Duration.HALF) 
            {
                var beamHeight = 0;
                // TODO: Calculate the height of the beam 
                minScoreY -= beamHeight;
            } */         
            
            // calculate the overflow of the note 
            var minNoteOverflow = currentSpaceToLines - minScoreY;
            
            // a bigger offset?
            if (spacing.spacing[ScoreTopLines] < minNoteOverflow)
                spacing.set(ScoreTopLines, minNoteOverflow);
        }
        var maxNote = measure.maxUpGroup == null ? null : measure.maxUpGroup.maxNote;
        if (maxNote != null)
        {
            // get the space from top to bottom of lines
            // (take care not to mention the current offset)
            var maxScoreY = getNoteScorePosY(layout, maxNote) + middleLinesStart;
           
           // take care of note beam
            /*if(maxNote.voice.value >= Duration.HALF) 
            {
                var beamHeight = 0;
                // TODO: Calculate the height of the beam 
                maxScoreY -= beamHeight;
            }*/           
            
            var maxNoteOverflow = maxScoreY - middleLinesEnd;
            
            // a bigger offset?
            if (spacing.spacing[ScoreBottomLines] < maxNoteOverflow)
                spacing.set(ScoreBottomLines, maxNoteOverflow);     
        }
    }
    
    public override function paintStave(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
    {
        // paint lines        
        var lineY:Int = y + spacing.get(ScoreMiddleLines);
        for (i in 1 ... 6) 
        {
            context.get(DrawingLayers.Lines).startFigure();
            context.get(DrawingLayers.Lines).addLine(x, lineY, x + line.width, lineY);
            lineY += Math.round(layout.scoreLineSpacing);
        }
    }
    
    public override function paintMeasure(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        var realX:Int = x + measure.x;
        var realY:Int = y + spacing.get(TopPadding);
        var w:Int = measure.width + measure.spacing;
        
        paintDivisions(layout, context, measure, realX, y, 3, spacing.get(ScoreMiddleLines), spacing.spacing[ScoreMiddleLines]);
        paintClef(layout, context, measure, realX, y);
        paintKeySignature(layout, context, measure, realX, y);
        paintTimeSignature(layout, context, measure, realX, y);
        
        paintRepeatEndings(layout, context, measure, realX, y); 
        
        realX += measure.getDefaultSpacings(layout);
        paintText(layout, context, measure, realX, y);
        paintTempo(layout, context, measure, realX, y);
        paintTripletFeel(layout, context, measure, realX, y);
        paintMarker(layout, context, measure, realX, y);
        
        paintBeats(layout, context, measure, realX, y);
    }
    
    private function paintClef(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.shouldPaintClef()) return;
        x += Math.round(14 * layout.scale); 
        y += spacing.get(ScoreMiddleLines);
        if (measure.clef == MeasureClef.Treble)
        {
            ClefPainter.paintTreble(context, x, y, layout);
        }
        else if (measure.clef == MeasureClef.Bass)
        {
            ClefPainter.paintBass(context, x, y, layout);
        }
        else if (measure.clef == MeasureClef.Tenor)
        {
            ClefPainter.paintTenor(context, x, y, layout);
        }
        else if (measure.clef == MeasureClef.Alto)
        {
            ClefPainter.paintAlto(context, x, y, layout);
        }
    }
    
    private function paintKeySignature(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.headerDrawing().shouldPaintKeySignature(measure)) return;
        
        // TODO: try to only naturalize required strings, not all previous set ones
                
        x += measure.calculateClefSpacing(layout) + Math.floor(10*layout.scale);
        y += spacing.get(ScoreMiddleLines);

        var scale:Float = layout.scoreLineSpacing;
        var currentKey:Int  = measure.keySignature();
        var previousKey:Int  = measure.getPreviousMeasure() != null ? measure.getPreviousMeasure().keySignature() : 0;
        var offsetClef:Int  = 0;
        switch (measure.clef)
        {
            case MeasureClef.Treble:
                offsetClef = 0;
            case MeasureClef.Bass:
                offsetClef = 2;
            case MeasureClef.Tenor:
                offsetClef = -1;
            case MeasureClef.Alto:
                offsetClef = 1;
        }

        // naturalize previous key
        var naturalizeSymbols:Int = (previousKey <= 7) ? previousKey : previousKey - 7;        
        var previousKeyPositions = (previousKey <= 7) ? SCORE_KEYSHARP_POSITIONS : SCORE_KEYFLAT_POSITIONS;
        var step = layout.scoreLineSpacing / 2;
        for (i in 0 ... naturalizeSymbols)
        {
            var keyY:Int = 0;
            var offset:Int = Math.round(((previousKeyPositions[i] + offsetClef) * step) + (6*layout.scale));
            
            KeySignaturePainter.paintNatural(context, x, cast (y + offset), layout);
            x += Math.floor (8*layout.scale);
        }
                
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        var offsetSymbols:Int = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (currentKey <= 7)
        {  
            for (i in 0 ... offsetSymbols)
            {
                var keyY:Int = 0;
                var offset:Int =  Math.round(((SCORE_KEYSHARP_POSITIONS[i] + offsetClef) * step) + (2 * layout.scale));
                
                KeySignaturePainter.paintSharp(context, x, cast (y + offset), layout);
                x += Math.floor (8*layout.scale);
            }
        }
        // a flat signature
        else 
        {
            for (i in 0 ... offsetSymbols)
            {
                var keyY:Int = 0;
                var offset:Int =  Math.round(((SCORE_KEYFLAT_POSITIONS[i] + offsetClef) * step) + (1 * layout.scale));
                
                KeySignaturePainter.paintFlat(context, x, cast (y + offset), layout);
                x += Math.floor (8*layout.scale);
            }
        }            
    }
    
    private function paintTimeSignature(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.headerDrawing().shouldPaintTimeSignature(measure)) return;
        
        y += spacing.get(ScoreMiddleLines);
        var x1:Int = x + measure.calculateClefSpacing(layout) + measure.calculateKeySignatureSpacing(layout) + Math.floor(15*layout.scale);
        var x2:Int = x1;
        var y1:Int = 0;
        var y2:Int = Math.round(2 * layout.scoreLineSpacing);
        
        if(measure.header.timeSignature.numerator > 9 && measure.header.timeSignature.denominator.value < 10)
        {
            x2 += Math.round((TS_NUMBER_SIZE * layout.scale) / 2);
        }
        if(measure.header.timeSignature.numerator < 10 && measure.header.timeSignature.denominator.value > 9)
        {
            x1 += Math.round((TS_NUMBER_SIZE * layout.scale) / 2);
        }

        // numerator
        paintTimeSignatureNumber(layout, context, measure.header.timeSignature.numerator, x1, y+y1);
        // denominator
        paintTimeSignatureNumber(layout, context, measure.header.timeSignature.denominator.value, x2, y+y2);
    }
    
    private function paintTimeSignatureNumber(layout:ViewLayout, context:DrawingContext, number:Int, x:Int, y:Int)
    {
        if(number < 10)
        {
            var symbol = this.getTimeSignatureSymbol(number);
            if (symbol != null) 
                context.get(DrawingLayers.MainComponents).addMusicSymbol(symbol, x, y, layout.scale);
        }
        else
        {
            var firstDigit = Math.floor(number / 10);
            var secondDigit = number - (firstDigit * 10); 
            
            var symbol = this.getTimeSignatureSymbol(firstDigit);
            if (symbol != null) 
                context.get(DrawingLayers.MainComponents).addMusicSymbol(symbol, x, y, layout.scale);
            symbol = this.getTimeSignatureSymbol(secondDigit);
            if (symbol != null) 
                context.get(DrawingLayers.MainComponents).addMusicSymbol(symbol, x + TS_NUMBER_SIZE * layout.scale, y, layout.scale);
            
        }
    }
    
    private function getTimeSignatureSymbol(number:Int)
    {
        switch(number) {
            case 0:  
                return MusicFont.Num0;
            case 1:  
                return MusicFont.Num1;
            case 2: 
                return MusicFont.Num2;
            case 3: 
                return MusicFont.Num3;
            case 4: 
                return MusicFont.Num4;
            case 5: 
                return MusicFont.Num5;
            case 6: 
                return MusicFont.Num6;
            case 7: 
                return MusicFont.Num7;
            case 8: 
                return MusicFont.Num8;
            case 9: 
                return MusicFont.Num9;
        }
        return null;
    }

    private function paintText(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.effectsCache.text) return;
        
        y += spacing.get(Text);
        
        for (beat in measure.beats)
        {
            if (beat.text != null)
            {
                var bd:BeatDrawing = cast beat;
                var str = beat.text.value;
                context.get(DrawingLayers.Voice1).addString(str, DrawingResources.defaultFont, x + bd.x, y + Math.floor(DrawingResources.defaultFontHeight/2));
            }
        }
    }
    
    private function paintTempo(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.effectsCache.tempo) return;
        
        y += spacing.get(Tempo);

        TempoPainter.paintTempo(context, x, y, layout.scale); 
            
        x += Math.round(8 * layout.scale);
        var value:String = (" = " + measure.header.tempo.value);
        context.get(DrawingLayers.MainComponents).addString(value, DrawingResources.defaultFont, x, y + DrawingResources.defaultFontHeight);
    }
   
    private function paintTripletFeel(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.effectsCache.tripletFeel) return;
        
        y += spacing.get(TripletFeels);
        
        // Resetting 
        if (measure.header.tripletFeel == TripletFeel.None && measure.getPreviousMeasure() != null)
        {
            var previous:Int = measure.getPreviousMeasure().tripletFeel();
            if (previous == TripletFeel.Eighth)
            {
                TripletFeelPainter.paintTripletFeelNone8(context, x, y, layout.scale);
            }
            else if (previous == TripletFeel.Sixteenth)
            {
                TripletFeelPainter.paintTripletFeelNone16(context, x, y, layout.scale);
            }
        }
        // Setting
        else if (measure.header.tripletFeel == TripletFeel.Eighth)
        {
            TripletFeelPainter.paintTripletFeel8(context, x, y, layout.scale);
        }
        else if (measure.header.tripletFeel == TripletFeel.Sixteenth)
        {
            TripletFeelPainter.paintTripletFeel16(context, x, y, layout.scale);
        }
    }
    
    private function paintMarker(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (!measure.effectsCache.marker) return;
        
        y += spacing.get(Marker);
        
        context.get(DrawingLayers.Voice1).addString(measure.header.marker.title, DrawingResources.defaultFont, x, y+ Math.floor(DrawingResources.defaultFontHeight/2));
    }

    private function paintRepeatEndings(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        if (measure.header.repeatAlternative <= 0) return;
        
        
        y += spacing.get(RepeatEnding);
        var h = spacing.spacing[RepeatEnding];
        var offset:Int = Math.floor(3 * layout.scale);

        // Line Above measure
        var draw:DrawingLayer  = context.get(DrawingLayers.MainComponentsDraw);
        draw.startFigure();
        draw.addLine(x, y + h, x, y);
        draw.addLine(x, y, x + measure.width + measure.spacing - offset*2, y);
        
        // repeat numbers,
        var txt:String = "";
        for (i in 0 ... 8)
        {
            if ((measure.header.repeatAlternative & (1 << i)) != 0)
            {
                txt += (txt.length > 0) ? ", " + (i + 1) : Std.string(i + 1);
            }
        }
        
        
        context.get(DrawingLayers.MainComponents).addString(txt, DrawingResources.defaultFont, x + offset, y + offset + DrawingResources.defaultFontHeight/2);
        
    }
        
    private function paintBeats(layout:ViewLayout, context:DrawingContext, measure:MeasureDrawing, x:Int, y:Int)
    {
        for (beat in measure.beats)
        {
            var bd:BeatDrawing = cast beat;
            paintBeat(layout, context, bd, x + bd.x, y);
            //x += bd.fullWidth();
        }
    }
    
    private function paintBeat(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        // paint extra lines
        paintExtraLines(layout, context, beat, x, y);
        
        // paint voices
        for (voice in beat.voices)
        {
            paintVoice(layout, context, cast voice, x, y);
        }
        
        // effects
        paintBeatEffects(layout, context, beat, x, y);
    }
    
    private function paintExtraLines(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        if (!beat.isRestBeat())
        {
            var scoreY:Int = y + spacing.get(ScoreMiddleLines);
            paintExtraLines2(context, layout, beat.minNote, x, scoreY);
            paintExtraLines2(context, layout, beat.maxNote, x, scoreY);
        }
    }
    
    private function paintExtraLines2(context:DrawingContext, layout:ViewLayout, note:NoteDrawing, x:Int, y:Int) : Void
    {
        var realY:Int = y + getNoteScorePosY(layout, note);
        var x1:Float = x - 3 * layout.scale;
        var x2:Float = x + 12 * layout.scale;

        var scorelineSpacing:Int = cast layout.scoreLineSpacing;

        if (realY < y)
        {
            var i = y;
            while (i > realY)
            { 
                context.get(DrawingLayers.Lines).startFigure();
                context.get(DrawingLayers.Lines).addLine(cast x1, i, cast x2, i);
                i -= scorelineSpacing;
            }
        }
        else if (realY > (y + (scorelineSpacing * 4)))
        {
            var i = (y + (scorelineSpacing * 5));
            while (i < (realY + scorelineSpacing))
            {
                context.get(DrawingLayers.Lines).startFigure();
                context.get(DrawingLayers.Lines).addLine(cast x1, cast i, cast x2, cast i);
                i += scorelineSpacing;
            }
        }
    }
    
    private function paintVoice(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {       
        if (!voice.isEmpty)
        {
            if (voice.isRestVoice())
            {
                paintSilence(layout, context, voice, x, y);
            }
            else
            {
                // paint notes
                for (note in voice.notes)
                {
                    paintNote(layout, context, cast note, x, y);
                }
            }
            
            paintBeam(layout, context, voice, x, y);        
            paintTriplet(layout, context, voice, x, y);
        }
    }
    
    private function paintSilence(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        x += Math.round(3 * layout.scale);
        y += spacing.get(ScoreMiddleLines);

        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);

        switch (voice.duration.value)
        {  
            case Duration.WHOLE:
                SilencePainter.paintWhole(fill, x, y, layout);
            case Duration.HALF:
                SilencePainter.paintHalf(fill, x, y, layout);
            case Duration.QUARTER:
                SilencePainter.paintQuarter(fill, x, y, layout);
            case Duration.EIGHTH:
                SilencePainter.paintEighth(fill, x, y, layout);
            case Duration.SIXTEENTH:
                SilencePainter.paintSixteenth(fill, x, y, layout);
            case Duration.THIRTY_SECOND:
                SilencePainter.paintThirtySecond(fill, x, y, layout);
            case Duration.SIXTY_FOURTH:
                SilencePainter.paintSixtyFourth(fill, x, y, layout);
        }

    }
        
    private function paintBeam(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (voice.isRestVoice()) return;
        
        y += spacing.get(ScoreMiddleLines);

        
        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        var draw:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceDraw1) : context.get(DrawingLayers.VoiceDraw2);
        
        if (voice.duration.value >= Duration.HALF)
        {
            var direction:Int = voice.beatGroup.getDirection();
            var key:Int = voice.beat.measure.keySignature();
            var clef:Int = voice.beat.measure.clef;
            
            var xMove:Float = direction == VoiceDirection.Up ? 
                            DrawingResources.getScoreNoteSize(layout, false).x : 0;
            var yMove:Float = direction == VoiceDirection.Up ?
                            Math.round(layout.scoreLineSpacing / 3) + 1 :
                            Math.round(layout.scoreLineSpacing / 3) * 2;
            
            var y1:Int = y + (direction == VoiceDirection.Up 
                                ? getNoteScorePosY(layout, voice.minNote)
                                : getNoteScorePosY(layout, voice.maxNote));
            var y2:Int = Math.round(y + calculateBeamY(layout, voice.beatGroup, direction, Math.round(x + xMove), key, clef));
            
            // paint the line
            draw.addLine(x + xMove, y1 + yMove, x + xMove, y2 + yMove);
            
            // need to paint a bar?
            if (voice.duration.value >= Duration.EIGHTH)
            {
                var index:Int = voice.duration.index() - 2;
                if (index > 0)
                {
                    var rotation:Int = direction == VoiceDirection.Down ? 1 : -1; 
                    
                    // if there's no join left and right, paint normal footer
                    if ((voice.joinedType == JoinedType.NoneRight || voice.joinedType == JoinedType.NoneLeft)
                        && !voice.isJoinedGreaterThanQuarter)
                    {
                        NotePainter.paintFooter(
                            fill, x, y2, voice.duration.value, rotation, layout);
                    }
                    else
                    {
                        var startX:Int;
                        var endX:Int;

                        // These two variables have to be set for the calculation of our y position
                        var startXforCalculation:Int;
                        var endXforCalculation:Int;

                        if (voice.joinedType == JoinedType.NoneRight)
                        {
                            startX = Math.floor(x + xMove);
                            endX = Math.floor(x + (6*layout.scale) + xMove);
                            startXforCalculation = voice.beatDrawing().fullX();
                            endXforCalculation = Math.floor(voice.beatDrawing().fullX() + (6*layout.scale));
                        }
                        else if (voice.joinedType == JoinedType.NoneLeft)
                        {
                            startX = Math.floor(x - (6*layout.scale) + xMove);
                            endX = Math.floor(x + xMove);
                            startXforCalculation = Math.floor(voice.beatDrawing().fullX() - (6*layout.scale));
                            endXforCalculation = voice.beatDrawing().fullX();
                        }
                        else
                        {
                            startX = Math.floor(voice.leftJoin.beatDrawing().fullX() + xMove);
                            endX = Math.ceil(voice.rightJoin.beatDrawing().fullX() + xMove);
                            startXforCalculation = voice.leftJoin.beatDrawing().fullX();
                            endXforCalculation = voice.rightJoin.beatDrawing().fullX();
                        }
                        
                        var hY1:Int = Math.floor(y + yMove + calculateBeamY(layout, voice.beatGroup, direction, startXforCalculation, key, clef));
                        var hY2:Int = Math.floor(y + yMove + calculateBeamY(layout, voice.beatGroup, direction, endXforCalculation, key, clef));
                        
                        NotePainter.paintBar(fill, startX, hY1, endX, hY2, index, rotation, layout.scale);
                    }
                }
            }
        }
    }
    
    private inline function getOffset(offset:Int)
    {
        return offset * (layout.scoreLineSpacing / 8.0);
    }
    
      
    private function calculateBeamY(layout:ViewLayout, beatGroup:BeatGroup, direction:Int, x:Float, key:Float, clef:Int)
    {
        // we use the min/max notes to place the beam along their real position        
        // we only want a maximum of 10 offset for their gradient
        var maxDistance:Int = Math.round(10 * layout.scale);
        
        // the offsets for the min/max note to the beam
        var upOffset:Float = getOffset(UP_OFFSET);
        var downOffset:Float = getOffset(DOWN_OFFSET);
        
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
                return getNoteScorePosY(layout, beatGroup.minNote) + downOffset;
            }
            
            // calculate the two points where to place the beam trough
            y = 0;
            x1 = beatGroup.firstMinNote.beatDrawing().fullX();
            x2 = beatGroup.lastMinNote.beatDrawing().fullX();
            y1 = Math.round(getNoteScorePosY(layout, beatGroup.firstMinNote) + downOffset);
            y2 = Math.round(getNoteScorePosY(layout, beatGroup.lastMinNote) + downOffset);
            
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
                return getNoteScorePosY(layout, beatGroup.maxNote) - upOffset;
            }
            
            // calculate the two points where to place the beam trough
            y = 0;
            x1 = beatGroup.firstMaxNote.beatDrawing().fullX();
            x2 = beatGroup.lastMaxNote.beatDrawing().fullX();
            y1 = Math.round(getNoteScorePosY(layout, beatGroup.firstMaxNote) - upOffset);
            y2 = Math.round(getNoteScorePosY(layout, beatGroup.lastMaxNote) - upOffset);
            
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
    
    
   
    
    private function paintTriplet(layout:ViewLayout, context:DrawingContext, voice:VoiceDrawing, x:Int, y:Int)
    {
        if (voice.duration.tuplet.equals(Tuplet.NORMAL)) return;

        var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        var draw:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceDraw1) : context.get(DrawingLayers.VoiceDraw2);
        
        y += spacing.get(Triplet);
        
        // paint group if group is full and is first of group
        //  otherwise only a number
        var previousVoice = voice.getPreviousVoice();
        if (voice.tripletGroup.isFull() && 
            (previousVoice == null || previousVoice.tripletGroup == null || previousVoice.tripletGroup != voice.tripletGroup) )
        {
            var firstVoice = voice.tripletGroup.voices[0];
            var lastVoice = voice.tripletGroup.voices[voice.tripletGroup.voices.length -1];
            
            var startX = firstVoice.beatDrawing().fullX();
            var endX = lastVoice.beatDrawing().fullX();
            
            var direction:Int = voice.isRestVoice() ? VoiceDirection.Up : voice.beatGroup.getDirection();
            
            if (direction == VoiceDirection.Up)
            {
                var offset = Math.floor(DrawingResources.getScoreNoteSize(layout, false).x);
                startX += offset;
                endX += offset;
            }
                    
            var lineW = endX - startX;
            
            var h = spacing.spacing[Triplet];
            
            var s:String = Std.string(voice.tripletGroup.triplet);
            context.graphics.font = DrawingResources.effectFont;
            var w:Float = context.graphics.measureText(s);
                        
            draw.addLine(startX, y + h, startX, y);
            draw.addLine(startX, y, startX + (lineW / 2) - w , y);
            draw.addString(s, DrawingResources.effectFont,  startX + ((lineW - w)/ 2), y);
            draw.addLine(startX + (lineW/2) + w , y, endX, y);
            draw.addLine(endX, y + h, endX, y);
        }
        else if(!voice.tripletGroup.isFull())
        {
            fill.addString(Std.string(voice.duration.tuplet.enters), DrawingResources.defaultFont, x, y);
        }
    }
     
    private function paintNote(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {   
        var noteHeadY = y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, note);
        var noteHeadX = x;
        
        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        var effectLayer:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);

        // TODO: better accidental placement
        var direction = note.voiceDrawing().beatGroup.getDirection();

        var displaceOffset:Int = Math.floor(DrawingResources.getScoreNoteSize(layout, false).x); 
        if (note.displaced)
        {
            if (direction == VoiceDirection.Up)
            {
                noteHeadX += displaceOffset;
            }
            else
            {
                noteHeadX -= displaceOffset;
            }
        }
        
        
        // draw accidental
        // TODO: validate accidentals 
        // TODO: try to place accidentals side-by-side if there is not enough space 
        if(!note.measureDrawing().track.isPercussionTrack)
        {
            var accidentalX:Int = x - Math.floor(7 * layout.scale);
            if (note.voiceDrawing().anyDisplaced && direction == VoiceDirection.Down)
            {
                accidentalX -= displaceOffset;
            }
            var accidentalY:Int = cast (noteHeadY + 3 * layout.scale);
            
            if (note.getAccitental() == MeasureDrawing.NATURAL)
            { 
                KeySignaturePainter.paintSmallNatural(fill, accidentalX, accidentalY , layout);
            }
            else if (note.getAccitental() == MeasureDrawing.SHARP)
            {
                KeySignaturePainter.paintSmallSharp(fill, accidentalX, accidentalY, layout);
            }
            else if (note.getAccitental() == MeasureDrawing.FLAT)
            {
                KeySignaturePainter.paintSmallFlat(fill, accidentalX, accidentalY, layout);
            }
        }

        if(note.measureDrawing().track.isPercussionTrack)
        {
            NotePainter.paintPercussion(fill, note, x, noteHeadY, layout.scale);
        }
        else if (note.effect.isHarmonic())
        { 
            var full:Bool = note.voice.duration.value >= Duration.QUARTER;
            var layer:DrawingLayer = full ? fill : effectLayer;
            NotePainter.paintHarmonic(layer, noteHeadX, noteHeadY, layout.scale);
        }
        else if (note.effect.deadNote)
        {
            NotePainter.paintDeadNote(fill, noteHeadX, noteHeadY, layout.scale);
        }
        else
        {
            var full:Bool = note.voice.duration.value >= Duration.QUARTER;
            NotePainter.paintNote(fill, noteHeadX, noteHeadY, layout.scale, full);
        }
                
        paintEffects(layout, context, note, noteHeadX, y, noteHeadY);
    }
    
    private function getNoteScorePosY(layout:ViewLayout, note:NoteDrawing) : Int
    {
        if (note.scorePosY <= 0) 
        {
            // the keysignature and clef to mention
            var keySignature = note.measureDrawing().keySignature();
            var clef = note.measureDrawing().clef;
            
            // move half a scoreline per step 
            var step:Float = (layout.scoreLineSpacing / 2.00);
            
            // what's the real note value (mention percussion notes)
            var noteValue = note.measureDrawing().track.isPercussionTrack ? PercussionMapper.getValue(note) : note.realValue();
            
            // which note within a octave?
            var index:Int = noteValue % 12;
            
            // on which octave are we?
            var octave:Int = Math.floor(noteValue / 12);
            
            // calculate position for the current octave
            var offset:Float = (7 * octave) * step;
            
            // get the position within an octave for the note and move it this amount of steps
            // afterwards we need to move the offset upwards to reach the correct octave
            var scoreLineY:Int= keySignature <= 7
                                 ? Math.floor((SCORE_SHARP_POSITIONS[index]*step) - offset)
                                 : Math.floor((SCORE_FLAT_POSITIONS[index]*step) - offset);

            // make corrections for the current clef
            scoreLineY += Math.floor(SCORE_CLEF_OFFSETS[clef] * step) + Math.round(1 * layout.scale);

            // done!
            note.scorePosY = scoreLineY;
        }
        return note.scorePosY;
    }
    
    private function paintEffects(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int, noteY:Int)
    {
        paintDottedNote(layout, context, note, x, noteY);
        paintStaccato(layout, context, note, x, y);
        paintGraceNote(layout, context, note, x, noteY);
        paintTremoloPicking(layout, context, note, x, noteY);
        paintHammerOn(layout, context, note, x, y);
        paintSlide(layout, context, note, x, y);
        paintTiedNote(layout, context, note, x, y);
    }
    
    private function paintTiedNote(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        var nextBeat:BeatDrawing = note.beatDrawing().getNextBeat();
        var nextNote:NoteDrawing = nextBeat == null ? null : cast nextBeat.getNote(note.voice.index, note.string);
        
        if (nextNote != null && nextNote.isTiedNote)
        {                
            var fill:DrawingLayer = note.voice.index == 0
                                ? context.get(DrawingLayers.VoiceEffects1)
                                : context.get(DrawingLayers.VoiceEffects2);
                
            var down:Bool = (note.voiceDrawing().beatGroup.getDirection() == VoiceDirection.Down);
            
            var noteSize = Math.round(DrawingResources.getScoreNoteSize(layout, false).x);
            var noteOffset = Math.round( (4 + layout.scale) * ((!down) ? 1 : -1));
                                
            var startY = y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, note) + noteOffset;
            var startX = x + (noteSize/2);
            
            var endX:Float = nextNote != null ? x + (note.beatDrawing().fullWidth() + noteSize / 2)
                                                : startX + 15 * layout.scale;
            var endY = nextNote != null ? y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, nextNote) + noteOffset
                                : startY;
                                                
            TablatureStave.paintTie(layout, fill, startX, startY, endX, endY, !down);
        }
    }
    
    private function paintSlide(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.slide) return;
        
        var nextBeat:BeatDrawing = note.beatDrawing().getNextBeat();
        var nextNote:NoteDrawing = nextBeat == null ? null : cast nextBeat.getNote(note.voice.index, note.string);
        
        if (nextNote != null && (note.effect.slideType == SlideType.SlowSlideTo || note.effect.slideType == SlideType.FastSlideTo))
        {
            // draw a line
            var down:Bool = (note.voiceDrawing().beatGroup.getDirection() == VoiceDirection.Down);
            var noteXOffset = Math.round( 4 * layout.scale );
            var noteYOffset = noteXOffset * ((!down) ? 1 : -1);
            var noteSize = Math.round(DrawingResources.getScoreNoteSize(layout, false).x);
            
            var startY:Float = y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, note) - noteYOffset;
            var startX:Float = x + noteSize + noteXOffset;
            
                            
            var endX:Float = nextNote != null ? x + note.beatDrawing().fullWidth() - noteYOffset - noteXOffset
                                : startX + 15 * layout.scale;
            var endY:Float = nextNote != null ? y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, nextNote)
                                : startY;

            var draw:DrawingLayer = note.voice.index == 0
                    ? context.get(DrawingLayers.VoiceEffectsDraw1)
                    : context.get(DrawingLayers.VoiceEffectsDraw2);

            draw.addLine(startX, startY, endX, endY);
            
            // draw a tie
            if (note.effect.slideType == SlideType.SlowSlideTo)
            {
                var fill:DrawingLayer = note.voice.index == 0
                                    ? context.get(DrawingLayers.VoiceEffects1)
                                    : context.get(DrawingLayers.VoiceEffects2);
                    
                
                startY = y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, note) + noteYOffset;
                startX = x + (noteSize/2);
                
                endX = nextNote != null ? x + (note.beatDrawing().fullWidth() + noteSize / 2)
                                                    : startX + 15 * layout.scale;
                endY = nextNote != null ? y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, nextNote) + noteYOffset
                                    : startY;
                                                    
                TablatureStave.paintTie(layout, fill, startX, startY, endX, endY, !down);
            }
        }
    }
    
    private function paintHammerOn(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.hammer) return;
        
        var nextBeat:BeatDrawing = note.beatDrawing().getNextBeat();
        var nextNote:NoteDrawing = nextBeat == null ? null : cast nextBeat.getNote(note.voice.index, note.string);
                
        var fill:DrawingLayer = note.voice.index == 0
                            ? context.get(DrawingLayers.VoiceEffects1)
                            : context.get(DrawingLayers.VoiceEffects2);
        var draw:DrawingLayer = note.voice.index == 0
                            ? context.get(DrawingLayers.VoiceEffectsDraw1)
                            : context.get(DrawingLayers.VoiceEffectsDraw2);
            
        var down:Bool = (note.voiceDrawing().beatGroup.getDirection() == VoiceDirection.Down);
        
        var noteSize = Math.round(DrawingResources.getScoreNoteSize(layout, false).x);
        var noteOffset = Math.round( (4 + layout.scale) * ((!down) ? 1 : -1));
                            
        var startY = y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, note) + noteOffset;
        var startX = x + (noteSize/2);
        
        var endX:Float = nextNote != null ? x + (note.beatDrawing().fullWidth() + noteSize / 2)
                                            : startX + 15 * layout.scale;
        var endY = nextNote != null ? y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, nextNote) + noteOffset
                            : startY;
                                            
        TablatureStave.paintTie(layout, fill, startX, startY, endX, endY, !down);
    }
    
    private function paintStaccato(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.staccato) return;
        
        var note = (note.voiceDrawing().beatGroup.getDirection() == VoiceDirection.Up ? note.voiceDrawing().minNote : note.voiceDrawing().maxNote);
        var dotSize:Float = 2.0 * layout.scale;

        y = y + spacing.get(ScoreMiddleLines) + getNoteScorePosY(layout, note);
        y += Math.round( (4 + layout.scale) * ((note.voiceDrawing().beatGroup.getDirection() == VoiceDirection.Up) ? 1 : -1));
        x += Math.round( (DrawingResources.getScoreNoteSize(layout, false).x / 1.5) - dotSize );

        

        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        fill.addCircle(x, y, dotSize);
    }
    private function paintDottedNote(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.voice.duration.isDotted && !note.voice.duration.isDoubleDotted) return;
        
        var displaceOffset:Int = Math.floor(DrawingResources.getScoreNoteSize(layout, false).x); 
        if (note.voiceDrawing().anyDisplaced && !note.displaced)
        {
            x += displaceOffset;
        }
        
        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
        var dotSize:Float = 3.0 * layout.scale;
        
        x += Math.round(DrawingResources.getScoreNoteSize(layout, false).x + (4*layout.scale));
        y += Math.round(4 * layout.scale);
        fill.addCircle(Math.round(x - (dotSize / 2.0)), Math.round(y - (dotSize / 2.0)), dotSize);

        if (note.voice.duration.isDoubleDotted)
        {
            fill.addCircle(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)), Math.round(y - (dotSize / 2.0)), dotSize);
        }
        
    }
    private function paintGraceNote(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.isGrace()) return;
        
        var scale:Float = layout.scoreLineSpacing / 2.25;
        var realX:Float = x - (10 * layout.scale);
        var realY:Float = y - (9 * layout.scale);
        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        
        if (note.effect.deadNote)
        {
            realY += layout.scoreLineSpacing;
        }

        var s:String = note.effect.deadNote ? MusicFont.GraceDeadNote : MusicFont.GraceNote;
        fill.addMusicSymbol(s, cast (realX - scale * 1.33), cast realY, layout.scale);
        if (note.effect.grace.transition == GraceEffectTransition.Hammer || note.effect.grace.transition == GraceEffectTransition.Slide)
        {
            var startX = x - (10*layout.scale);
            var tieY = y + (10*layout.scale);
            
            TablatureStave.paintTie(layout, fill, startX, tieY, x, tieY, true);
        }
    }
    
    private function paintTremoloPicking(layout:ViewLayout, context:DrawingContext, note:NoteDrawing, x:Int, y:Int)
    {
        if (!note.effect.isTremoloPicking()) return;
        
        var direction = note.voiceDrawing().beatGroup.getDirection();
        
        var trillY = direction != VoiceDirection.Up ? y + Math.floor(8 * layout.scale) : y - Math.floor(16 * layout.scale);
        var trillX = direction != VoiceDirection.Up ? x -  Math.floor(5 * layout.scale) : x + Math.floor(3*layout.scale); 
        
        var s:String = "";
        switch (note.effect.tremoloPicking.duration.value)
        {
            case Duration.EIGHTH:
                s = MusicFont.TrillUpEigth;
                if (direction == VoiceDirection.Down)
                    trillY += Math.floor(8 * layout.scale);
            case Duration.SIXTEENTH:
                s = MusicFont.TrillUpSixteenth;
                if (direction == VoiceDirection.Down)
                    trillY += Math.floor(4 * layout.scale);
            case Duration.THIRTY_SECOND:
                s = MusicFont.TrillUpThirtySecond;
        }
        
        var fill:DrawingLayer = note.voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
        if (s != "")
            fill.addMusicSymbol(s, trillX, trillY, layout.scale);
    }
    
    private function paintBeatEffects(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        paintChord(layout, context, beat, x, y);
    }
    
    private function paintChord(layout:ViewLayout, context:DrawingContext, beat:BeatDrawing, x:Int, y:Int)
    {
        if (!beat.effect.isChord()) return;
        
        y += spacing.get(Chord);
        
        context.get(DrawingLayers.Voice1).addString(beat.effect.chord.name, DrawingResources.defaultFont, x, y+ Math.floor(DrawingResources.defaultFontHeight/2));
    }
    
    public static function isDisplaced(previous:NoteDrawing, current:NoteDrawing) : Bool
    {
        if (previous == null) return false;
        
        var prevVal = previous.realValue();
        var curVal = current.realValue();
        
        var keySignature = current.measureDrawing().keySignature();
        
        // on different octaves?
        var prevOctave:Int = Math.floor(prevVal / 12);
        var currentOctave:Int = Math.floor(curVal / 12);

        if (prevOctave != currentOctave) return false;
        
        // get note indexes
        var positions = keySignature <= 7 ? SCORE_SHARP_POSITIONS : SCORE_FLAT_POSITIONS;
        
        var prevPosition:Int = positions[prevVal % 12];
        var curPosition:Int = positions[curVal % 12];  
        
        // is there less than 2 half-lines space?
        // if previous is displaced, don't displace
        return (Math.abs(curPosition - prevPosition) <= 1) && !previous.displaced;
    }
}