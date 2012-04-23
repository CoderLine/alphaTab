package alphatab.rendering.staves;
import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.BarRendererBase;
import alphatab.rendering.layout.ScoreLayout;

class StaveGroup 
{
	public var x:Int;
    public var y:Int;

	/**
     * Indicates whether this line is full or not. If the line is full the
     * bars can be aligned to the maximum width. If the line is not full 
     * the bars will not get stretched.
     */
    public var isFull:Bool;
    /**
     * The width that the content bars actually need
     */
    public var width:Int;

	public var bars:Array<Bar>;
	public var staves:Array<Stave>;
	
	public var layout:ScoreLayout;
	
    
    public function new() 
    {
		bars = new Array<Bar>();
		staves = new Array<Stave>();
		width = 0;
    }
    
    public inline function getLastBarIndex() : Int
    {
        return bars[bars.length - 1].index;
    }
    
    public function addBar(bar:Bar) : Void
    {
        bars.push(bar);
		
		// add renderers
		var maxW:Int = 0;
		for (s in staves)
		{
			s.addBar(bar);
			if (s.barRenderers[s.barRenderers.length - 1].width > maxW)
			{
				maxW = s.barRenderers[s.barRenderers.length - 1].width;
			}
		}
		
		// ensure same width of new renderer
		for (s in staves)
		{
			var diff = maxW - s.barRenderers[s.barRenderers.length - 1].width;
			if (diff > 0)
			{
				s.barRenderers[s.barRenderers.length - 1].applyBarSpacing(diff);
			}
		}
		
		width += maxW;
    }

	public function addStave(stave:Stave) 
	{
		stave.staveGroup = this;
		staves.push(stave);
	}
	
	public function calculateHeight() : Int
	{
		return staves[staves.length - 1].y + staves[staves.length - 1].height; 
	}
	
	public function revertLastBar() : Void
	{
		bars.pop();
		var w = 0;
		for (s in staves)
		{
			w = Std.int(Math.max(w, s.barRenderers[s.barRenderers.length - 1].width));
			s.revertLastBar();
		}
		width -= w;
	}
	
	public function applyBarSpacing(spacing:Int)
	{
		for (s in staves)
		{
			s.applyBarSpacing(spacing);
		}
		width += bars.length * spacing;
	}
	
	public function paint(cx:Int, cy:Int,  canvas:ICanvas)
	{
		for (s in staves)
		{
			s.paint(cx + x, cy + y, canvas);
		}
	}
	
	public static inline var StaveSpacing = 10;
	public function finalizeGroup(scoreLayout:ScoreLayout)
	{
		var currentY:Float = 0;
		for (i in 0 ... staves.length)
		{
			if (i > 0)
			{
				currentY += (StaveSpacing * scoreLayout.renderer.scale);
			}
			
			staves[i].x = 0;
			staves[i].y = Std.int(currentY);
			staves[i].finalizeStave(scoreLayout);
			currentY += staves[i].height;
		}
	}
}