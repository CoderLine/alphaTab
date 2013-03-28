package alphatab.rendering;
import alphatab.model.Bar;

class EffectBarRendererFactory extends BarRendererFactory
{
    private var _info:IEffectBarRendererInfo;
	public function new(info:IEffectBarRendererInfo) 
	{
		super();
        isInAccolade = false;
        _info = info;
	}

	public override function create(bar:Bar):BarRendererBase 
	{
		return new EffectBarRenderer(bar, _info);
	}
}