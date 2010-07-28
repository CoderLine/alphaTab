/**
 * ...
 * @author Zenas
 */

package net.alphatab.model;
import net.alphatab.model.effects.GsTremoloBarEffect;

class GsBeatEffect 
{
	public var Stroke:GsBeatStroke;
	public var HasRasgueado:Bool;

	public var PickStroke:Int;
	public var HasPickStroke:Bool;
	public var Chord:GsChord;
	
	public var FadeIn:Bool;
	public var Vibrato:Bool;
	
	public var TremoloBar:GsTremoloBarEffect;
	public function IsTremoloBar() : Bool
	{
		return this.TremoloBar != null;
	}
	

	public var MixTableChange:GsMixTableChange;
	
	public var Tapping: Bool;
	public var Slapping: Bool;
	public var Popping: Bool;

	public function new(factory:GsSongFactory) 
	{
		this.Tapping = false;
		this.Slapping = false;
		this.Popping = false;
		this.FadeIn = false;		
		this.Stroke = factory.NewStroke();
	}
	
}