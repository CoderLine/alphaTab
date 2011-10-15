package alphatab.platform.neko;

import alphatab.io.Stream;
import haxe.io.Bytes;
import neko.io.File;

/**
 * A stream implementation accessing a local file. 
 */
class FileStream extends Stream
{
    private var _input:Bytes;
    private var _pos:Int;
    
    public function new(path:String) 
    {
        _input = File.getBytes(path);
        _pos = 0;
    }
    
    public override function readByte() : Int
    {
        return _input.get(_pos++);
    }
    
    public override function length() : Int
    {
       return _input.length;
    }
    
    public override function position() : Int
    {   
        return _pos;
    }
    
    public override function seek(position:Int) : Void
    {
        _pos = position;
    }
}