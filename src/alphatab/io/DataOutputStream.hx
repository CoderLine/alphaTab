package alphatab.io;
import haxe.Int64;

/**
 * This utility allows writing of datatypes to a stream instance. 
 * writeFloat and writeDouble are based on jeash
 *   Copyright (c) 2010, Jeash contributors.
 *    writeFloat: http://mercurial.intuxication.org/hg/jeash/file/a4255cd99f9c/jeash/utils/ByteArray.hx#l27 (29.12.2011)
 *    writeDouble http://mercurial.intuxication.org/hg/jeash/file/a4255cd99f9c/jeash/utils/ByteArray.hx#l199 (29.12.2011)
 */
class DataOutputStream extends OutputStream
{
    // the main type handling logic is implemented as big endian,
    // but the bytes get reversed on writing if little endian is requested
    private static var LN2 = Math.log(2);


    public var bigEndian:Bool;
    private var _stream:OutputStream;
    
    public function new(stream:OutputStream, bigEndian:Bool = true) 
    {
        super();
        _stream = stream;
        this.bigEndian = bigEndian;
    }
    
    private function writeEndianAware(value:Array<Byte>)
    {
        if (!bigEndian)
        {
            value.reverse();
        }
        writeBytes(value);
    }
    
    public function writeBool(value:Bool) 
    { 
        if (value)
            writeByte(1);
        else
            writeByte(0);
    }
    
    public function writeShort(value:Int)
    { 
        writeEndianAware([ (value >> 8) & 0xFF, value & 0xFF]);
    }
    
    public function writeInt(value:Int) 
    { 
        writeEndianAware([(value >> 24) & 0xFF, (value >> 16) & 0xFF,  (value >> 8) & 0xFF, value & 0xFF ]);
    }
    
    public function writeFloat(value:Float) 
    {
        if (value == 0.0) 
        {
            writeBytes([0, 0, 0, 0]);
        }
        
        var exp = Math.floor(Math.log(Math.abs(value)) / LN2);
        var sig = (Math.floor(Math.abs(value) / Math.pow(2, exp) * Math.pow(2, 23)) & 0x7FFFFF);
        var b1 = (exp + 0x7F) >> 1 | (exp>0 ? ((value<0) ? 1<<7 : 1<<6) : ((value<0) ? 1<<7 : 0)),
            b2 = (exp + 0x7F) << 7 & 0xFF | (sig >> 16 & 0x7F),
            b3 = (sig >> 8) & 0xFF,
            b4 = sig & 0xFF;
            
        writeEndianAware([b1, b2, b3, b4]);
    }
    
    public function writeDouble(value:Float) 
    {
        if (value == 0.0) 
        {
            writeBytes([0, 0, 0, 0, 0, 0, 0, 0]);
        }
        
        var exp = Math.floor(Math.log(Math.abs(value)) / LN2);
        var sig : Int = Math.floor(Math.abs(value) / Math.pow(2, exp) * Math.pow(2, 52));
		var mask = (7 << 32) | (255 << 24) | (255 << 8) | 255;
        var sig_h = (sig & mask);
        var sig_l = Math.floor((sig / Math.pow(2,32)));
        var b1 = (exp + 0x3FF) >> 4 | (exp>0 ? ((value<0) ? 1<<7 : 1<<6) : ((value<0) ? 1<<7 : 0)),
            b2 = (exp + 0x3FF) << 4 & 0xFF | (sig_l >> 16 & 0xF),
            b3 = (sig_l >> 8) & 0xFF,
            b4 = sig_l & 0xFF,
            b5 = (sig_h >> 24) & 0xFF,
            b6 = (sig_h >> 16) & 0xFF,
            b7 = (sig_h >> 8) & 0xFF,
            b8 = sig_h & 0xFF;    
            
        writeEndianAware([b1, b2, b3, b4, b5, b6, b7, b8]);
    } 
    
    public override function writeByte(data:Byte) 
    {
        _stream.writeByte(data);
    }
    
    public override function writeBytes(data:Array<Byte>) 
    {
        _stream.writeBytes(data);
    }
    
    public override function flush()
    {
        _stream.flush();
    }
}