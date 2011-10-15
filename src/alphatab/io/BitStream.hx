package alphatab.io;

/**
 * This stream implementation allows bitwise reading from another stream.
 */
class BitStream extends Stream
{
    private static inline var BYTE_SIZE = 8; // size of byte in bits
    
    private var _stream:Stream;
    
    private var _currentByte:Int; // the currently read byte
    private var _position:Int; // the current bit position within the current byte
    
    public function new(stream:Stream) 
    {
        _stream = stream;
        _position = BYTE_SIZE; // mark end of byte to ensure a new byte is read
    }
    
    public override function readByte() : Int
    {
        return readBits(8);
    }
    
    public override function length() : Int
    {
        return _stream.length();
    }
    
    public override function position() : Int
    {
        return _stream.position();
    }
    
    public override function seek(position:Int) : Void
    {
        _position = BYTE_SIZE;
        _stream.seek(position);
    }

    public function readBits(count:Int) : Int
    {
        var bits = 0;
        var i = count - 1; 
        while ( i >= 0 ) 
        {
            bits |= (readBit() << i);
            i--;
        }
        return bits;
    }
    
    public function readBitsReversed(count:Int) : Int
    {
        var bits = 0;
        var i = 0; 
        while ( i < count) 
        {
            bits |= (readBit() << i);
            i++;
        }
        return bits;
    }
    
    public function readBit() : Int
    {
        var bit = -1;
        // need a new byte?
        if (_position >= BYTE_SIZE)
        {
            _currentByte = _stream.readByte();
            _position = 0;
        }
        
        // shift the desired byte to the least significant bit and  
        // get the value using masking
        var value = (_currentByte >> (BYTE_SIZE - _position - 1)) & 0x01;
        _position++;
        return value;
    }
}