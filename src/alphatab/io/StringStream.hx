package alphatab.io;

/**
 * A stream implementation using a string as backstore for data.
 * Each character represents a byte value. 
 */
class StringStream extends Stream
{
    private var _pos:Int;
    private var _buffer:String;
    
    public function new(buffer:String) 
    {
        _buffer = buffer;
        _pos = 0;
    }
    
    public override function readByte() : Int
    {
        return _buffer.charCodeAt(_pos++) & 0xFF;
    }
    
    public override function length() : Int
    {
       return _buffer.length;
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