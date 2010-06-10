/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsNote
{
	public var Duration:Int;
	public var Triplet:Int;
	public var Value:Int;
	public var Velocity:Int;
	public var String:Int;
	public var IsTiedNote:Bool;
	public var Effect:GsNoteEffect;
	public var Voice:GsVoice;
	public var LeftHandFinger:Int;
	public var RightHandFinger:Int;
	public var IsFingering:Bool;
	public var DurationPercent:Float;
	
	public function RealValue() : Int
	{
		return this.Value + this.Voice.Beat.Measure.Track.Strings[this.String - 1].Value;
	}
	
	public function new(factory:GsSongFactory)
	{
		this.Value = 0;
		this.Velocity = GsVelocities.Default;
		this.String = 1;
		this.IsTiedNote = false;
		this.Effect = factory.NewEffect();
	}

}