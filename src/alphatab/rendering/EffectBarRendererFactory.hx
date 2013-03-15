package alphatab.rendering;
import alphatab.model.Bar;

class EffectBarRendererFactory extends BarRendererFactory
{
	public function new() 
	{
		super();
        isInAccolade = false;
	}

	public override function create(bar:Bar):BarRendererBase 
	{
		return new EffectBarRenderer(bar);
	}
}