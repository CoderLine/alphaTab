package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.rendering.BarRendererBase;

class TabBarRendererFactory extends BarRendererFactory
{
	public function new() 
	{
		super();
	}
	
	
	public override function create(bar:Bar):BarRendererBase 
	{
		return new TabBarRenderer(bar);
	}
}