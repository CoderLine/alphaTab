package alphatab.platform.cs;
import alphatab.io.Byte;
import alphatab.io.InputStream;

#if cs

class ByteArrayInputStream extends InputStream
{
    private var _pos:Int;
    private var _buffer:cs.NativeArray<Byte>;
    
    public function new(buffer:cs.NativeArray<Byte>) 
    {
        _buffer = buffer;
        _pos = 0;
    }
    
    public override function readByte() : Byte
    {
        if (_pos >= _buffer.Length)
        {
            return -1;
        }
        return _buffer[_pos++] & 0xFF;
    }
    
    public override function length() : Int
    {
       return _buffer.Length;
    }
    
    public override function position() : Int
    {   
        return _pos;
    }
    
    public override function seek(position:Int) : Void
    {
        _pos = position;
    }
    
    public override function canSeek():Bool 
    {
        return true;
    }
    
    public override function skip(count:Int):Void 
    {
        _pos += count;
    }
}

#end