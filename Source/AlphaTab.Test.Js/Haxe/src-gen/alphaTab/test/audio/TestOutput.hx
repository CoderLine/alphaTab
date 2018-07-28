package alphaTab.test.audio;

using system.HaxeExtensions;
class TestOutput implements alphaTab.audio.synth.ISynthOutput
{
    private var _finished : system.Boolean;
    public var SampleRate(get, null) : system.Int32;

    public function get_SampleRate() : system.Int32
    {
        return 44100;

    }

    public var Samples(default, default) : alphaTab.collections.FastList<system.Single>;

    public function Open() : Void 
    {
        Samples = new alphaTab.collections.FastList<system.Single>();
        Ready.Invoke();
    }

    public function SequencerFinished() : Void 
    {
        _finished = true;
    }

    public function Play() : Void 
    {
    }

    public function Continue() : Void 
    {
        if (_finished)
        {
            Finished.Invoke();
        }
        else         {
            SampleRequest.Invoke();
        }
    }

    public function Pause() : Void 
    {
    }

    public function AddSamples(f : alphaTab.audio.synth.ds.SampleArray) : Void 
    {
        {
            var i: system.Int32 = 0;
            while (i < f.Length)
            {
                Samples.Add(f.get_Item(i));
                i++;
            }
        }
        SamplesPlayed.Invoke(f.Length);
    }

    public function ResetSamples() : Void 
    {
    }

    public function add_Ready(value : system.Action) : system.EventAction
    {
        return (Ready += value);
    }

    public function remove_Ready(value : system.Action) : system.EventAction
    {
        return (Ready -= value);
    }

    public var Ready : system.EventAction;

    public function add_SamplesPlayed(value : system.Action1<system.Int32>) : system.EventAction1<system.Int32>
    {
        return (SamplesPlayed += value);
    }

    public function remove_SamplesPlayed(value : system.Action1<system.Int32>) : system.EventAction1<system.Int32>
    {
        return (SamplesPlayed -= value);
    }

    public var SamplesPlayed : system.EventAction1<system.Int32>;

    public function add_SampleRequest(value : system.Action) : system.EventAction
    {
        return (SampleRequest += value);
    }

    public function remove_SampleRequest(value : system.Action) : system.EventAction
    {
        return (SampleRequest -= value);
    }

    public var SampleRequest : system.EventAction;

    public function add_Finished(value : system.Action) : system.EventAction
    {
        return (Finished += value);
    }

    public function remove_Finished(value : system.Action) : system.EventAction
    {
        return (Finished -= value);
    }

    public var Finished : system.EventAction;

    public function new() 
    {
        _finished = false;
        Samples = null;
    }

}
