import flash.events.SampleDataEvent;
import flash.external.ExternalInterface;
import flash.media.Sound;
import flash.media.SoundChannel;
import flash.Lib;
import flash.utils.Endian;

class FlashOutputDevice
{
    private static inline var BufferSize = 8192;
    private static inline var BufferCount = 10;

    private static var Instance:FlashOutputDevice;
    public static function main() : Void
    {
        Instance = new FlashOutputDevice(Lib.current.loaderInfo.parameters.id);
    }
    
    private var _id:String;
    private var _sound:Sound;
    private var _soundChannel:SoundChannel;
    private var _circularBuffer:CircularSampleBuffer;
    private var _finished:Bool;
    
    public function new(id:String)
    {
        _id = id;
        logDebug('Initializing Flash Output');
        
        _finished = false;
        _circularBuffer = new CircularSampleBuffer(BufferSize * BufferCount);
        _sound = new Sound();
        _sound.addEventListener(SampleDataEvent.SAMPLE_DATA, generateSound);

        ExternalInterface.addCallback("AlphaSynthSequencerFinished", sequencerFinished); 
        ExternalInterface.addCallback("AlphaSynthResetSamples", resetSamples);         
        ExternalInterface.addCallback("AlphaSynthAddSamples", addSamples);         
        ExternalInterface.addCallback("AlphaSynthPlay", play);         
        ExternalInterface.addCallback("AlphaSynthPause", pause);

        ready();
        
        logDebug('Flash Output initialized');
    }
    
    // API for JavaScript    
    private function sequencerFinished()
    {
        _finished = true;
    }
    
    private function addSamples(b64:String)
    {
        var decoded = haxe.crypto.Base64.decode(b64);
        var bytes = decoded.getData();
        bytes.endian = Endian.LITTLE_ENDIAN;
        var sampleArray = cast(decoded.getData(), SampleArray);
        _circularBuffer.write(sampleArray, 0, sampleArray.length);
    }
    
    private function resetSamples()
    {
        _circularBuffer.clear();
    }
    
    private function play()
    {
        logDebug('FlashOutput: Play');
        try 
        {
            sampleRequest();
            _finished = false;
            _soundChannel = _sound.play(0);
        }
        catch(e:Dynamic)
        {
            logError('FlashOutput: Play Error: ' + Std.string(e));
        }
    }
    
    private function pause()
    {
        logDebug('FlashOutput: Pause');
        try 
        {
            if(_soundChannel != null) 
            {
                _soundChannel.stop();
                _soundChannel = null;
            }
        }
        catch(e:Dynamic)
        {
            logError('FlashOutput: Pause Error: ' + Std.string(e));
        }
    }
    
    // API to JavaScript
    private function sampleRequest()
    {
        // if we fall under the half of buffers
        // we request one half
        var count = (BufferCount / 2) * BufferSize;
        if (_circularBuffer.count < count)
        {
            for (i in 0 ... Std.int(BufferCount/2))
            {
               ExternalInterface.call("AlphaSynth.Main.AlphaSynthFlashOutput.OnSampleRequest", _id);
            }
        }
    }
    
    private function finished()
    {
        ExternalInterface.call("AlphaSynth.Main.AlphaSynthFlashOutput.OnFinished", _id);
    }
    
    private function ready()
    {
        ExternalInterface.call("AlphaSynth.Main.AlphaSynthFlashOutput.OnReady", _id);
    }
    
    private function samplesPlayed(samplesPlayed:Int)
    {
       ExternalInterface.call("AlphaSynth.Main.AlphaSynthFlashOutput.OnSamplesPlayed", _id, samplesPlayed);
    }
    
    private function logDebug(msg:String)
    {
        ExternalInterface.call("AlphaSynth.Util.Logger.Debug", msg);
    }
    
    private function logError(msg:String)
    {
        ExternalInterface.call("AlphaSynth.Util.Logger.Error", msg);
    }
    
    // play logic
    private function generateSound(e:SampleDataEvent)
    {
        try 
        {
            if (_circularBuffer.count < BufferSize)
            {
                if (_finished)
                {
                    finished();
                }
                else
                {
                    for (i in 0 ... BufferSize)
                    {
                        e.data.writeFloat(0);
                    }
                }                
            }
            else
            {
                var buffer = new SampleArray(BufferSize);
                var samplesRead = _circularBuffer.read(buffer, 0, buffer.length);
                
                var raw = buffer.toData();
                raw.position = 0;
                
                for (i in 0 ... BufferSize)
                {
                    e.data.writeFloat(raw.readFloat());
                }
                
                samplesPlayed(Std.int(samplesRead / 2));
            }
                        
            if (!_finished)
            {
                sampleRequest();
            }
        }
        catch(e:Dynamic)
        {   
            var stack = haxe.CallStack.toString(haxe.CallStack.exceptionStack());
            logError('FlashOutput: Generate Error: ' + Std.string(e) + '\r\n' + stack);
        }
    }          
}