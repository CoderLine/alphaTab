package alphatab.rendering.staves;
import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.BarRendererBase;
import alphatab.rendering.BarRendererFactory;
import alphatab.rendering.layout.ScoreLayout;

class Stave 
{
	public var staveGroup:StaveGroup;
	
	private var _factory:BarRendererFactory;
	public var barRenderers:Array<BarRendererBase>;
	
	public var x:Int;
	public var y:Int;
	public var height:Int;
	public var topSpacing:Int;
	public var bottomSpacing:Int;
	
	public function new(barRendererFactory:BarRendererFactory) 
	{
		barRenderers = new Array<BarRendererBase>();
		_factory = barRendererFactory;
		topSpacing = 20;
		bottomSpacing = 20;
	}
	
	public function addBar(bar:Bar)
	{
		var renderer:BarRendererBase = _factory.create(bar);
		renderer.stave = this;
		renderer.index = barRenderers.length;
		renderer.doLayout();
		barRenderers.push(renderer);
	}
	
	public function revertLastBar()
	{
		barRenderers.pop();
	}
	
	public function applyBarSpacing(spacing:Int)
	{
		for (b in barRenderers)
		{
			b.applyBarSpacing(spacing);
		}
	}
	
	public function finalizeStave(layout:ScoreLayout)
	{
		var x = 0; 
		height = 0;
		for (i in 0 ... barRenderers.length)
		{
			barRenderers[i].x = x;
			barRenderers[i].y = topSpacing; // TODO: mention registered spacing
			height = Std.int(Math.max(height, barRenderers[i].height));
			x += barRenderers[i].width;
		}
		height += topSpacing + bottomSpacing;
	}
	
		
	public function paint(cx:Int, cy:Int, canvas:ICanvas)
	{
		for (r in barRenderers)
		{
			r.paint(cx + x, cy + y, canvas);
		}
	}
}