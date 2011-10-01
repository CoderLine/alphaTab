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
package alphatab.tablature.drawing;
import alphatab.model.Duration;
import alphatab.model.Point;
import alphatab.model.Note;
import alphatab.tablature.ViewLayout;

/**
 * This painter draws musical notes and beams. 
 */
class NotePainter 
{
    public static function paintFooter(layer:DrawingLayer, x:Float, y:Float, dur:Int, dir:Int, layout:ViewLayout) : Void
    {
        var scale = layout.scale;
        if (dir == -1)
        {
            x += DrawingResources.getScoreNoteSize(layout, false).x;
        }
        var s:String = "";
        switch (dur)
        { 
            case Duration.SIXTY_FOURTH:
                s = (dir == -1) ? MusicFont.FooterUpSixtyFourth : MusicFont.FooterDownSixtyFourth;
            case Duration.THIRTY_SECOND:
                s = (dir == -1) ? MusicFont.FooterUpThirtySecond : MusicFont.FooterDownThirtySecond;
            case Duration.SIXTEENTH:
                s = (dir == -1) ? MusicFont.FooterUpSixteenth :  MusicFont.FooterDownSixteenth;
            case Duration.EIGHTH:
                s = (dir == -1) ? MusicFont.FooterUpEighth :  MusicFont.FooterDownEighth;
        }
        if (s != "")
            layer.addMusicSymbol(s, x, y, scale);

    }
    
    public static function paintBar(layer:DrawingLayer, x1:Float, y1:Float, x2:Float, y2:Float, count:Int, dir:Int, scale:Float ) : Void
    {
        var width:Float = Math.max(1.0, Math.round(3.0 * scale));
        for (i in 0 ... count) 
        {
            var realY1:Float = (y1 - ((i * (5.0 * scale)) * dir));
            var realY2:Float = (y2 - ((i * (5.0 * scale)) * dir));
            
            layer.startFigure();
            layer.addPolygon([new Point(x1, realY1), new Point(x2, realY2), 
                                new Point(x2, realY2 + width), 
                                new Point(x1, realY1 + width), new Point(x1, realY1), ]);
            layer.closeFigure();
        }
    }
    
    public static function paintHarmonic(layer:DrawingLayer, x:Int, y:Int, scale:Float)
    {
        layer.addMusicSymbol(MusicFont.Harmonic, x, y, scale);
    }
    
    public static function paintNote(layer:DrawingLayer, x:Int, y:Int, scale:Float, full:Bool)
    {
        var symbol = full ? MusicFont.NoteQuarter : MusicFont.NoteHalf;
        layer.addMusicSymbol(symbol, x, y, scale);
    }
    
    public static function paintDeadNote(layer:DrawingLayer, x:Int, y:Int, scale:Float)
    {
        layer.addMusicSymbol(MusicFont.DeadNote, x, y, scale);
    }    
    
    public static function paintPercussion(layer:DrawingLayer, note:Note, x:Int, y:Int, scale:Float)
    {
       var normalKeys:Array<Int> = [32,34,35,36,38,39,40,41,43,45,47,48,50,55,56,58,60,61];
       var xKeys:Array<Int> = [31,33,37,42,44,54,62,63,64,65,66];
       var value = note.value;                             
           
           
       if(value <= 30 || value >= 67 || Lambda.has(normalKeys, value) ) {
           layer.addMusicSymbol(MusicFont.NoteQuarter, x, y, scale);
       }
       else if(Lambda.has(xKeys, value)) {
           layer.addMusicSymbol(MusicFont.Sticks, x, y, scale);
       }
       else if(value == 46) {
           layer.addMusicSymbol(MusicFont.HiHat, x, y, scale);
       }
       else if(value == 49 || value == 57) {
           layer.addMusicSymbol(MusicFont.Harmonic, x, y, scale);
       }
       else if(value == 52) {
           layer.addMusicSymbol(MusicFont.ChineseCymbal, x, y, scale);
       }
       else if(value == 51 || value == 53 || value == 59) {
           layer.addMusicSymbol(MusicFont.RideCymbal, x, y, scale);
       } 
    }
    
}