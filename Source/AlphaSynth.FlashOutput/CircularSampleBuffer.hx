class CircularSampleBuffer
{
    private var _buffer:SampleArray;
    private var _writePosition:Int;
    private var _readPosition:Int;
    private var _sampleCount:Int;
    
    public function new(size:Int) 
    {
        _buffer = new SampleArray(size);
        _writePosition = 0;
        _readPosition = 0;
        _sampleCount = 0;
    }
    
    public var count(get, null):Int;
    private inline function get_count() 
    {
        return _sampleCount;
    }
    
    public function clear()
    {
        _readPosition = 0;
        _writePosition = 0;
        _sampleCount = 0;
        _buffer = new SampleArray(_buffer.length);
    }
    
    public function write(data:SampleArray, offset:Int, count:Int)
    {
        var samplesWritten = 0;
        if (count > _buffer.length - _sampleCount)
        {
            count = _buffer.length - _sampleCount;
        }
        
        var writeToEnd:Int = Std.int(Math.min(_buffer.length - _writePosition, count));
        SampleArray.blit(data, offset, _buffer, _writePosition, writeToEnd);
        _writePosition += writeToEnd;
        _writePosition %= _buffer.length;
        samplesWritten += writeToEnd;
        if (samplesWritten < count)
        {
            SampleArray.blit(data, offset + samplesWritten, _buffer, _writePosition,  count - samplesWritten);
            _writePosition += (count - samplesWritten);
            samplesWritten = count;
        }
        _sampleCount += samplesWritten;
        return samplesWritten;
    }
    
    public function read(data:SampleArray, offset:Int, count:Int)
    {
        if (count > _sampleCount)
        {
            count = _sampleCount;
        }
        var samplesRead = 0;
        var readToEnd = Std.int(Math.min(_buffer.length - _readPosition, count));
        SampleArray.blit(_buffer, _readPosition, data, offset, readToEnd);
        samplesRead += readToEnd;
        _readPosition += readToEnd;
        _readPosition %= _buffer.length;
        
        if (samplesRead < count)
        {
            SampleArray.blit(_buffer, _readPosition, data, offset + samplesRead, count - samplesRead);
            _readPosition += (count - samplesRead);
            samplesRead = count;
        }
        
        _sampleCount -= samplesRead;
        return samplesRead;
    }
}