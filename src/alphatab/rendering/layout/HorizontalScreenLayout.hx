package alphatab.rendering.layout;
import alphatab.rendering.staves.StaveGroup;

/**
 * This layout arranges the bars all horizontally.
 */
class HorizontalScreenLayout extends ScoreLayout
{
    // left top right bottom
    public static var PAGE_PADDING:Array<Int> = [20, 20, 20, 20];
	
	public static inline var GroupSpacing = 20;

	private var _group:StaveGroup;

    public function new(renderer:ScoreRenderer) 
    {
        super(renderer);
    }

	public override function doLayout()
    {
        if (renderer.settings.staves.length == 0) return;
        
        var startIndex = renderer.settings.layout.get('start', 1);
        startIndex--; // map to array index
        startIndex = Std.int(Math.min(renderer.track.bars.length - 1, Math.max(0, startIndex)));
        var currentBarIndex = startIndex;
 
        var endBarIndex = renderer.settings.layout.get('count', renderer.track.bars.length);
        endBarIndex = startIndex + endBarIndex - 1; // map count to array index
        endBarIndex = Std.int(Math.min(renderer.track.bars.length - 1, Math.max(0, endBarIndex)));

        var x = PAGE_PADDING[0];
        var y = PAGE_PADDING[1];
		
		_group = createEmptyStaveGroup();
		
		while (currentBarIndex <= endBarIndex)
		{
			var bar = renderer.track.bars[currentBarIndex];
			_group.addBar(bar);
            
            currentBarIndex++;
		}		
		
		_group.x = x;
		_group.y = y;
		
		_group.finalizeGroup(this);
		
		y += _group.calculateHeight() + Std.int(GroupSpacing * renderer.scale);
		height = y + PAGE_PADDING[3];
		width = _group.x + _group.width + PAGE_PADDING[2];
    }

	public override function paintScore():Void 
	{
		_group.paint(0, 0, renderer.canvas);
	}

}