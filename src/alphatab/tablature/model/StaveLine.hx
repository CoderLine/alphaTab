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

import alphatab.model.Track;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayer;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.Tablature;
import alphatab.tablature.ViewLayout;

class StaveLine 
{
    public static inline var TopPadding = 0;
    public static inline var BottomSpacing = 1;

    // a list of the measures in the line
    public var measures:Array<Int>;
    // a list of the staves to render 
    public var staves:Array<Stave>;
    
    // spacing definitions for a full staveline
    public var spacing:StaveSpacing;
    
    // the tablature in which the line is placed in 
    public var tablature:Tablature; 
    
    public var track:Track;
    
    // the last measure within this line
    public function lastIndex() : Int 
    {
        return measures[measures.length - 1];
    }    
    
    // calculates the height
    public function getHeight() : Int
    {
        var height:Int = 0;
        // default spacings of line
        height += spacing.getSize();
        // all stave heights
        for (stave in staves)
        {
            height += stave.spacing.getSize();
        }        
        return height;
    }
    
    // the top Y
    public var y:Int;    
    public var x:Int;    
    
    // is the line full, which means we need to stretch the measures
    public var fullLine:Bool;
    // the current width including all measures.
    public var width:Int;   
    
    public function new()
    {
        measures = new Array<Int>();
        staves = new Array<Stave>();
        
        spacing = new StaveSpacing(BottomSpacing + 1);
        
        y = 0;
        x = 0;        
        fullLine = false;
        width = 0;
    }
    
    public function addMeasure(index:Int)
    {
        measures.push(index);
    }
    
    public function addStave(stave:Stave)
    {
        stave.index = staves.length;
        staves.push(stave);
    }
    
    public function paint(layout:ViewLayout, track:Track, context:DrawingContext)
    {
        if (staves.length == 0) return;
        
        var posY = y + spacing.get(TopPadding);
        
        for (stave in staves)
        {
            // stave background
            stave.paintStave(layout, context, x, posY);
            // paint measures in this stave
            for (i in 0 ... measures.length) 
            {
                var index:Int = measures[i];
                var currentMeasure:MeasureDrawing = cast track.measures[index]; 
                
                stave.paintMeasure(layout, context, currentMeasure, x, posY);
            }
            
            posY += stave.spacing.getSize();
        }
        
        // group needed?
        if (staves.length > 1)
        {
            var firstStave = staves[0];
            var lastStave = staves[staves.length - 1];
            
            var firstStaveY = y + spacing.get(TopPadding);
            var lastStaveY = posY - lastStave.spacing.getSize();
            
            var fill = context.get(DrawingLayers.MainComponents);
            var draw = context.get(DrawingLayers.MainComponentsDraw);
            
            // Draw Bar for grouping
            var groupTopY = firstStaveY + firstStave.spacing.get(firstStave.getBarTopSpacing());
            var groupBottomY = lastStaveY + lastStave.spacing.get(lastStave.getBarBottomSpacing());
            
            var barSize:Int = Math.floor(3 * layout.scale);
            var barOffset:Int = barSize;
            
            
            fill.addRect(x - barOffset - barSize, groupTopY, barSize, groupBottomY - groupTopY);
            
            var spikeStartX = x - barOffset - barSize;
            var spikeEndX = x + barSize * 2;
            
            // top spike
            fill.startFigure();
            fill.moveTo(spikeStartX, groupTopY);
            fill.bezierTo(spikeStartX, groupTopY, x, groupTopY, spikeEndX, groupTopY - barSize);
            fill.bezierTo(x, groupTopY + barSize, spikeStartX, groupTopY + barSize, spikeStartX, groupTopY + barSize);
            fill.closeFigure();
            
            // bottom spike
            fill.startFigure();
            fill.moveTo(spikeStartX, groupBottomY);
            fill.bezierTo(spikeStartX, groupBottomY, x, groupBottomY, spikeEndX, groupBottomY + barSize);
            fill.bezierTo(x, groupBottomY - barSize, spikeStartX, groupBottomY - barSize, spikeStartX, groupBottomY - barSize);
            fill.closeFigure();
            
            
            // Draw Line for grouping
            var lineTopY = firstStaveY + firstStave.spacing.get(firstStave.getLineTopSpacing());
            var lineBottomY = lastStaveY + lastStave.spacing.get(lastStave.getLineBottomSpacing());
            
            draw.addLine(x, lineTopY, x, lineBottomY);
        }
    
        /*TODO: Lyrics Stave
         * if (track.song.lyrics != null && track.song.lyrics.trackChoice == track.number)
        {
            var ly:LyricsImpl = cast track.song.lyrics;
            ly.paintCurrentNoteBeats(context, this, currentMeasure, beatCount, currentMeasure.posX, currentMeasure.posY);
        }*/
        //beatCount += currentMeasure.beatCount();

    }
}