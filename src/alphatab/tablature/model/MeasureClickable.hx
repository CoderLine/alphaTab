package alphatab.tablature.model;

class MeasureClickable {
	// The measure ID
	public var id:Int;
	
	// The dimensions
	public var xPos:Int;
	public var yPos:Int;
	public var width:Int;
	public var height:Int;
	public var firstTick:Int;
	
	public function new(init_mID:Int, init_xPos:Int, init_yPos:Int, init_width:Int, init_height:Int) {
		id=init_mID;
		xPos=init_xPos;
		yPos=init_yPos;
		width=init_width;
		height=init_height;
		firstTick=-1;
	}
	
	public function set(init_mID:Int, init_xPos:Int, init_yPos:Int, init_width:Int, init_height:Int) {
		id=init_mID;
		xPos=init_xPos;
		yPos=init_yPos;
		width=init_width;
		height=init_height;
	}
	
	// Returns whether or not the supplied coords are within the measure
	public function encompasses(find_xPos:Int, find_yPos:Int) {
		return (find_xPos>=xPos &&
				find_xPos<=xPos+width &&
				find_yPos>=yPos &&
				find_yPos<=yPos+height);
	}
}