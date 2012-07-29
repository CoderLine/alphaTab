package alphatab.platform.cs;
import alphatab.io.Byte;

#if cs

@:native('System.IO.File') extern class FileApi 
{
    static function ReadAllBytes(path:String) : cs.NativeArray<Byte>;
}

#end