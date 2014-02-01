package alphatab.rendering.utils;
import alphatab.model.Bar;
import alphatab.model.Track;
import alphatab.rendering.utils.BarHelpersGroup.BarHelpers;
import haxe.ds.IntMap.IntMap;

class BarHelpers
{
    public var beamHelpers:Array<Array<BeamingHelper>>;
    public var beamHelperLookup:Array<IntMap<BeamingHelper>>;
    public var tupletHelpers:Array<Array<TupletHelper>>;
    
    
    public function new(bar:Bar)
    {
        beamHelpers = new Array<Array<BeamingHelper>>();
        beamHelperLookup = new Array<IntMap<BeamingHelper>>();
        tupletHelpers = new Array<Array<TupletHelper>>();
        
        var currentBeamHelper:BeamingHelper = null;
        var currentTupletHelper:TupletHelper = null;
        
        for (v in bar.voices)
        {
            beamHelpers.push(new Array<BeamingHelper>());
            beamHelperLookup.push(new IntMap<BeamingHelper>());
            tupletHelpers.push(new Array<TupletHelper>());
            
            for (b in v.beats)
            {
                var newBeamingHelper = false;
                
                if (!b.isRest())
                {
                    // try to fit beam to current beamhelper
                    if (currentBeamHelper == null || !currentBeamHelper.checkBeat(b))
                    {
                        // if not possible, create the next beaming helper
                        currentBeamHelper = new BeamingHelper(bar.track);
                        currentBeamHelper.checkBeat(b);
                        beamHelpers[v.index].push(currentBeamHelper);
                        newBeamingHelper = true;
                    }
                }
                
                if (b.hasTuplet())
                {
                    // try to fit tuplet to current tuplethelper
                    // TODO: register tuplet overflow
                    var previousBeat = b.previousBeat;
                    
                    // don't group if the previous beat isn't in the same voice
                    if (previousBeat != null && previousBeat.voice != b.voice) previousBeat = null;
                    
                    // if a new beaming helper was started, we close our tuplet grouping as well
                    if (newBeamingHelper && currentTupletHelper != null)
                    {
                        currentTupletHelper.finish();
                    }
                    
                    if (previousBeat == null || currentTupletHelper == null || !currentTupletHelper.check(b))
                    {
                        currentTupletHelper = new TupletHelper(v.index);
                        currentTupletHelper.check(b);
                        tupletHelpers[v.index].push(currentTupletHelper);
                    }
                }
                
                beamHelperLookup[v.index].set(b.index, currentBeamHelper);
            }
            
            currentBeamHelper = null;
            currentTupletHelper = null;
        }
    }
}

/**
 * This helpers group creates beaming and tuplet helpers
 * upon request.
 */
class BarHelpersGroup
{
    public var helpers:IntMap<IntMap<BarHelpers>>;
    
    public function new()
    {
        helpers = new IntMap<IntMap<BarHelpers>>();
    }
    
    public function buildHelpers(tracks:Array<Track>, barIndex:Int)
    {
        for (t in tracks)
        {
            var h:IntMap<BarHelpers> = helpers.get(t.index);
            if(h == null)
            {
                h = new IntMap<BarHelpers>();
                helpers.set(t.index, h);
            }
            
            if (h.get(barIndex) == null)
            {
                h.set(barIndex, new BarHelpers(t.bars[barIndex]));
            }
        }
    }
}