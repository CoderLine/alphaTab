package alphatab.rendering.layout;
import alphatab.rendering.staves.StaveGroup;

/**
 * This layout arranges the bars all horizontally.
 */
class HorizontalScreenLayout extends ScoreLayout
{
	public static var SCORE_INFOS = "scoreInfos";
    // left top right bottom
    public static var PAGE_PADDING:Array<Int> = [20, 20, 20, 20];
	
	public static inline var GroupSpacing = 20;

	private var _group:StaveGroup;

    public function new(renderer:ScoreRenderer) 
    {
        super(renderer);
		renderer.setLayoutSetting(SCORE_INFOS, HeaderFooterElements.ALL);
    }

	public override function doLayout()
    {
        var currentBarIndex = 0;
        var endBarIndex = renderer.track.bars.length - 1;
        
        var x = PAGE_PADDING[0];
        var y = PAGE_PADDING[1];
		
		_group = createEmptyStaveGroup();
		
		for (i in 0 ... renderer.track.bars.length)
		{
			var bar = renderer.track.bars[i];
			_group.addBar(bar);
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