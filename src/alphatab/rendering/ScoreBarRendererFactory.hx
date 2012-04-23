package alphatab.rendering;
import alphatab.model.Bar;


class ScoreBarRendererFactory extends BarRendererFactory
{
	public function new() 
	{
		super();
	}
	
	public override function create(bar:Bar):BarRendererBase 
	{
		return new ScoreBarRenderer(bar);
	}
}