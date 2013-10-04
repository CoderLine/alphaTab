package alphatab.rendering.utils;
import alphatab.model.Note;

class PercussionMapper
{
    public static function mapValue(n:Note)
    {
        var value = n.realValue();
        if ( value == 61 || value == 66)
        {
            return 50;
        }
        else if ( value == 60 || value == 65)
        {
            return 52;
        }
        else if ( (value >= 35 && value <= 36) || value == 44)
        {
            return 53;
        }
        else if ( value == 41 || value == 64 )
        {
            return 55;
        }
        else if ( value == 43 || value == 62 )
        {
            return 57;
        }
        else if ( value == 45 || value == 63)
        {
            return 59;
        }
        else if ( value == 47 || value == 54)
        {
            return 62;
        }
        else if ( value == 48 || value == 56 )
        {
            return 64;
        }
        else if ( value == 50 )
        {
            return 65;
        }
        else if ( value == 42 || value == 46 || (value >= 49 && value <= 53) || value == 57 || value == 59)
        {
            return 67;
        }
        return 60;
    }
}