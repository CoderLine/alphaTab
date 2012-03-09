package alphatab.io;

import haxe.io.Output;

class OutputExtensions 
{
    public static function writeAsString(output:Output, value:Dynamic)
    {
        var text:String;
        if (Std.is(value, String))
        {
            text = cast(value, String);
        }
        else
        {
            text = Std.string(value);
        }
        output.writeString(text);
    }
}