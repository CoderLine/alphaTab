package net.alphatab.tablature.model;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Track;
import net.alphatab.tablature.ViewLayout;

/**
 * This track implementation extends the default track with drawing and layouting features. 
 */
class TrackImpl extends Track
{	
	public var previousBeat:BeatImpl;
	public var tabHeight:Int;
	public var scoreHeight:Int;

	public function new(factory:SongFactory) 
	{
		super(factory);
	}

	public function update(layout:ViewLayout):Void
	{
		tabHeight = Math.round((stringCount() - 1) * layout.stringSpacing);
		scoreHeight = Math.round(layout.scoreLineSpacing * 4);
	}	
}