package alphatab.util;

class Guid
{
    public static function generate(): String 
    {
        var result = new StringBuf();
        for (j in 0...32) 
        {
            if ( j == 8 || j == 12 || j == 16 || j == 20) 
            {
                result.add("-");
            }
            result.add(StringTools.hex(Math.floor(Math.random()*16)));
        }
        return result.toString().toUpperCase();
    }    
}