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
import alphatab.tablature.ViewLayout;
import alphatab.model.Point;

/**
 * This class contains all font settings for drawing. 
 */
class DrawingResources 
{
    public static var defaultFontHeight(default,default):Int;
    public static var defaultFont(default,default):String;
    public static var chordFont(default,default):String;
    public static var timeSignatureFont(default,default):String;
    public static var clefFont(default,default):String;
    public static var clefFontHeight(default,default):Int;
    public static var musicFont(default,default):String;
    public static var tempoFont(default,default):String;
    public static var graceFontHeight(default,default):Int;
    public static var graceFont(default,default):String;
    public static var noteFont(default,default):String;
    public static var noteFontHeight(default,default):Int;
    public static var effectFont(default,default):String;
    public static var effectFontHeight(default,default):Int;
    
    public static var titleFont(default,default):String;
    public static var subtitleFont(default,default):String;
    public static var wordsFont(default,default):String;
    public static var copyrightFont(default,default):String;

    public static function init(scale:Float) : Void
    { 
        var sansFont = "'Arial'";
        var serifFont = "'Times New Roman'";
        
        defaultFontHeight = Math.round(9*scale);
        defaultFont = formatFontSize(defaultFontHeight) + " " + sansFont;
        chordFont = formatFontSize(9*scale) + " " + sansFont;
        timeSignatureFont = formatFontSize(20*scale) + " " + sansFont;
        clefFontHeight = Math.round(16 * scale);
        clefFont = formatFontSize(clefFontHeight) + " " + serifFont;
        musicFont = formatFontSize(13*scale) + " " + sansFont;
        tempoFont = formatFontSize(11*scale) + " " + sansFont;
        graceFontHeight = Math.round(9*scale);
        graceFont = formatFontSize(graceFontHeight) + " " + sansFont;
        noteFontHeight = Math.round(11 * scale);
        noteFont = formatFontSize(noteFontHeight) + " " + sansFont;
        effectFontHeight = Math.round(11 * scale);
        effectFont = "italic " + formatFontSize(effectFontHeight) + " " + serifFont;
        
        titleFont =  formatFontSize(30*scale) + " " + serifFont;
        subtitleFont = formatFontSize(19 * scale) + " " + serifFont;
        wordsFont =  formatFontSize(13 * scale) + " " + serifFont;
        copyrightFont =  "bold " + formatFontSize(11 * scale) + " " + sansFont;
    }
    
    private static function formatFontSize(size:Float) 
    {
        var num = size;
        num = num * Math.pow(10, 2);
        num = Math.round( num ) / Math.pow(10, 2);
        return Std.string(num) + "px";
    }
    
    public static function getScoreNoteSize(layout:ViewLayout, full:Bool) : Point
    {
        var scale:Float = (full ? layout.scoreLineSpacing + 1 : layout.scoreLineSpacing) - 2;
        return new Point(Math.round(scale * 1.3), Math.round(scale * 1.0));
    }
}