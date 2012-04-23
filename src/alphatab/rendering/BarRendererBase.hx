package alphatab.rendering;
import alphatab.platform.ICanvas;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.Stave;

/**
 * ...
 * @author 
 */

class BarRendererBase 
{
	public var stave:Stave;
	public var x:Int;
	public var y:Int;
	public var width:Int;
	public var height:Int;
	public var index:Int;
	
	private function new() 
	{
		
	}
	
	public function applyBarSpacing(spacing:Int) : Void
	{
	}
	
	public inline function getLayout() : ScoreLayout
	{
		return stave.staveGroup.layout;
	}	
	public inline function getResources() : RenderingResources
	{
		return getLayout().renderer.renderingResources;
	}
	
	public inline function isFirstOfLine() : Bool
	{
		return index == 0;
	}
	
	public inline function isLastOfLine() : Bool
	{
		return index == stave.barRenderers.length - 1;
	}
	
	
	public function doLayout()
	{
		
	}
	
	public function paint(cx:Int, cy:Int, canvas:ICanvas)
	{
	}
}