package alphatab.platform;

/**
 * This is a  binary file reader for JavaScript.
 * It uses an unencoded (raw 1byte for a character) string to handle binary data. 
 */
class BinaryReader 
{ 
    private var _buffer:String;
    private var _pos:Int;
    
    public function new() 
    {
    }
    
    public function initialize(data:String)
    {
        _buffer = data;
        _pos = 0;
    }
    
    public function readBool() : Bool
    { 
        return this.readByte() == 1; 
    }
        
    public function readByte() : Int
    {
        var data = getByte(_pos);
        this._pos++;
        return data;
    }
    
    public function getByte(index:Int) : Int
    {
        var data:Int = this._buffer.charCodeAt(index);
        data = data & 0xFF;
        return data;
    }

    public function readInt16() : Int
    { 
        return this.decodeInt(16, true);
    }
    
    public function readInt32() : Int
    { 
        return this.decodeInt(32, true);
    }

    public function readDouble(): Float 
    { 
        return this.decodeFloat(52, 11); 
    }
    
    public function seek(pos:Int) : Void 
    {
        this._pos = pos;
    }
    
    public function getPosition() : Int
    {
        return this._pos;
    }
    
    public function getSize() :Int 
    {
        return this._buffer.length;
    }    
    
    private function decodeInt(bits:Int, signed:Bool) : Int
    {
        var x:Int = this.readBits(0, bits, Math.floor(bits / 8));
        var max:Int = Math.floor(Math.pow(2, bits));
        var result:Int = (signed && x >= max / 2) ? x - max : x;

        this._pos += Math.floor(bits / 8);
        return result;
    }
    
    private function readBits(start, length, size) :Int
    {
        var offsetLeft:Int = (start + length) % 8;
        var offsetRight:Int = start % 8;
        var curByte:Int = size - (start >> 3) - 1;
        var lastByte:Int = size + (-(start + length) >> 3);
        var diff:Int = curByte - lastByte;

        var sum:Int = (this.readByteForBits(curByte, size) >> offsetRight) & ((1 << (diff != 0 ? 8 - offsetRight : length)) - 1);

        if (diff != 0 && offsetLeft != 0) 
        {
            sum += (this.readByteForBits(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight; 
        }

        while (diff != 0) 
        {
            sum += this.shl(this.readByteForBits(lastByte++, size), (diff-- << 3) - offsetRight);
        }

        return sum;
    }
    
    private function readByteForBits(i:Int, size:Int) : Int 
    {
        return this._buffer.charCodeAt(this._pos + size - i - 1) & 0xff;
    }
    
    private function shl1(a:Int) : Int 
    {
        a=a%0x80000000;
        if (a&0x40000000==0x40000000)
        {
            a-=0x40000000;
            a*=2;
            a+=0x80000000;
        } else
            a*=2;
        return a;
    }

    private function shl(a:Int, b:Int) : Int
    {
        for (i in 0 ... b)
        {
            a = shl1(a);
        }
        return a;
    }
    
    private function decodeFloat(precisionBits:Int, exponentBits:Int):Float
    {    
        var length:Int = precisionBits + exponentBits + 1;
        var size:Int = length >> 3;

        var bias:Int = Math.floor(Math.pow(2, exponentBits - 1) - 1);
        var signal:Int = this.readBits(precisionBits + exponentBits, 1, size);
        var exponent:Int = this.readBits(precisionBits, exponentBits, size);
        var significand:Float = 0;
        var divisor:Int = 2;
        var curByte:Int = length + ( -precisionBits >> 3) - 1;
        var startBit:Int;
        do 
        {
            var byteValue:Int = this.readByteForBits(++curByte, size);
            startBit = precisionBits % 8;
            if (startBit == 0)
                startBit = 8;
            var mask:Int = 1 << startBit;
            while ((mask >>= 1) != 0) 
            {
                if ((byteValue & mask) != 0) 
                {
                    significand += 1 / divisor;
                }
                divisor *= 2;
            }
        } while ((precisionBits -= startBit) != 0);

        this._pos += size;
        
        if (exponent == (bias << 1) + 1)
        {
            return 0;
        }
        else
        {
            if (exponent != 0 || significand != 0)
            {
                var ret:Float;
                if (exponent == 0)
                {
                    ret = Math.pow(2, -bias + 1) * significand;
                }
                else
                {
                    ret = (Math.pow(2, exponent - bias) * (1 + significand));
                }
                return ret * (1 + signal * -2) ;
            }
            else
            {
                return 0;
            }
        }
    }
}