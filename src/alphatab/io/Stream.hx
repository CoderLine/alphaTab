package alphatab.io;

/**
 * A base class for creating streams on multiple platforms.
 */
class Stream 
{
    /**
     * Reads a 8bit unsigned integer from the stream and returns it value 
     * in the range of 0 to 255
     */
    public function readByte() : Int
    {
        return 0;
    }
    
    /**
     * Reads a 8bit signed integer from the stream and returns it value in the
     * range of -128 to 127
     */
    public function readSignedByte()  : Int
    {
        // convert to signed byte
        var data = readByte() & 0xFF;
        return data > 127 ? -256 + data : data;
    }
    
    public function readBytes(count:Int, bigEndian:Bool = false) : Array<Int>
    {
        var bytes = new Array<Int>();
        for (i in 0 ... count) 
        {
           bytes.push(readByte());
        }
        
        if(bigEndian) {
            bytes.reverse();
        }
        
        return bytes;
    }
    
    public function eof() : Bool
    {
        return position() >= length();
    }
    
    public function length() : Int
    {
        return 0;
    }
    
    public function position() : Int
    {
        return 0; // not implemented
    }
    
    public function canSeek() : Bool
    {
        return false;
    }
    
    public function seek(position:Int) : Void
    {
    }
    
    public function skip(count:Int) 
    {
        for (i in 0 ... count)
        {
            readByte();
        }
    }
    
    
}