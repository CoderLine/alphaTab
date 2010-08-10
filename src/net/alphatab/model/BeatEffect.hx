package net.alphatab.model;
import net.alphatab.model.effects.TremoloBarEffect;

/**
 * 	This class contains all beat effects.
 */
class BeatEffect 
{
	public var stroke:BeatStroke;
	public var hasRasgueado:Bool;

	public var pickStroke:Int;
	public var hasPickStroke:Bool;
	public var chord:Chord;
	
	public var fadeIn:Bool;
	public var vibrato:Bool;
	
	public var tremoloBar:TremoloBarEffect;	
	public function isTremoloBar() : Bool
	{
		return this.tremoloBar != null;
	}
	

	public var mixTableChange:MixTableChange;
	
	public var tapping: Bool;
	public var slapping: Bool;
	public var popping: Bool;

	public function new(factory:SongFactory) 
	{
		tapping = false;
		slapping = false;
		popping = false;
		fadeIn = false;		
		stroke = factory.newStroke();
	}
	
}