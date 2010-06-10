/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsSongFactory;
import net.coderline.jsgs.model.GsTrack;
import net.coderline.jsgs.tablature.ViewLayout;

class GsTrackImpl extends GsTrack
{
	
	public var PreviousBeat:GsBeatImpl;

	public var TabHeight:Int;
	public var ScoreHeight:Int;

	public function new(factory:GsSongFactory) 
	{
		super(factory);
	}

	public function Update(layout:ViewLayout):Void
	{
		TabHeight = Math.round((StringCount() - 1) * layout.StringSpacing);
		ScoreHeight = Math.round(layout.ScoreLineSpacing * 4);
	}	
}