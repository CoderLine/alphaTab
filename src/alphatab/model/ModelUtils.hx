package alphatab.model;
import alphatab.rendering.glyphs.NaturalizeGlyph;

/**
 * This class contains some utilities for working with model classes
 */
class ModelUtils 
{
    public static function getDurationValue(duration:Duration)
    {
        switch(duration)
        {
            case Whole: return 1;
            case Half: return 2;
            case Quarter: return 4;
            case Eighth: return 8;
            case Sixteenth: return 16;
            case ThirtySecond: return 32;
            case SixtyFourth: return 64;
            default: return 1;
        }  
    }

    public static function getDurationIndex(duration:Duration) : Int
    {
        var index:Int = 0;
        var value:Int = getDurationValue(duration);
        while((value = (value >> 1)) > 0)
        {
            index++;
        }    
        return index;
    }
    

    
    // TODO: Externalize this into some model class
    public inline static function keySignatureIsFlat(ks:Int)
    {
        return ks < 0;
    }    
    
    public inline static function keySignatureIsNatural(ks:Int)
    {
        return ks == 0;
    }    
    
    public inline static function keySignatureIsSharp(ks:Int)
    {
        return ks > 0;
    }    
    
    public static function getClefIndex(clef:Clef)
    {
        switch(clef)
        {
            case C3: return 0;
            case C4: return 1;
            case F4: return 2;
            case G2: return 3;
            default: return 0;
        }
    }
}
