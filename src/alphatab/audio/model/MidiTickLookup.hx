package alphatab.audio.model;
import alphatab.audio.model.MidiTickLookup.BarTickLookup;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.MasterBar;
import alphatab.model.Score;
import alphatab.model.Track;

class BarTickLookup
{
    public var start:Int;
    public var end:Int;
    public var bar:MasterBar;
    
    public function new()
    {
        
    }
}

class MidiTickLookup
{
    public var bars:Array<BarTickLookup>;
    
    public function new() 
    {
        bars = new Array<BarTickLookup>();
    }
    
    private var _lastBeat:Beat;
    
    public function findBeat(track:Track, tick:Int) : Beat
    {
        //
        // some heuristics: try last found beat and it's next beat for lookup first
        
        // try last beat or next beat of last beat first
        if (_lastBeat != null && _lastBeat.nextBeat != null && _lastBeat.voice.bar.track == track)
        {
            // check if tick is between _lastBeat and _lastBeat.nextBeat (still _lastBeat)
            if (tick >= _lastBeat.start && tick < _lastBeat.nextBeat.start)
            {
                return _lastBeat;
            }
            
            // we need a upper-next beat to check the nextbeat range 
            if (_lastBeat.nextBeat.nextBeat != null && tick >= _lastBeat.nextBeat.start && tick < _lastBeat.nextBeat.nextBeat.start)
            {
                _lastBeat = _lastBeat.nextBeat;
                return _lastBeat;
            }
        }
        
        //
        // Global Search
        
        // binary search within lookup
        var lookup = findBar(tick);
        if (lookup == null) return null;
        
        var masterBar:MasterBar = lookup.bar;
        var bar = track.bars[masterBar.index];
        
        // remap tick to initial bar start
        tick = (tick - lookup.start + masterBar.start);
        
        // linear search beat within beats
        var beat:Beat = null;
        for (b in bar.voices[0].beats)
        {
            // we search for the first beat which 
            // starts after the tick. 
            if (beat == null || b.start <= tick)
            {
                beat = b;
            }
            else
            {
                break;
            }
        }
        
        _lastBeat = beat;
        
        return _lastBeat;
    }
    
    private function findBar(tick:Int) : BarTickLookup
    {
        var bottom = 0;
        var top = bars.length - 1;
        
        while (bottom <= top)
        {
            var middle = Std.int( (top + bottom) / 2);
            var bar = bars[middle];
            
            // found?
            if (tick >= bar.start && tick <= bar.end)
            {
                return bar;
            }            
            // search in lower half 
            else if (tick < bar.start)
            {
                top = middle - 1;
            }
            // search in upper half
            else
            {
                bottom = middle + 1;
            }
        }
        
        return null;
    }
    
}