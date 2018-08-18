abstract SampleArray(flash.utils.ByteArray)
{
    public inline function new(length:Int)
    {
        this = new flash.utils.ByteArray();
        this.endian = flash.utils.Endian.LITTLE_ENDIAN;
        this.length = length * 4;
    }
    
	public var length(get, never):Int;
	inline function get_length():Int 
    {
        return Std.int(this.length / 4);
	}
    
    public inline function toData() : flash.utils.ByteArray
    {
        return cast this;
    }
    
	public static inline function blit<T>(src:SampleArray, srcPos:Int, dest:SampleArray, destPos:Int, len:Int):Void
	{
        var destArray = dest.toData();
        var srcArray = src.toData();
        destArray.position = destPos * 4;
        destArray.writeBytes(srcArray, srcPos * 4, len * 4);
	}
}