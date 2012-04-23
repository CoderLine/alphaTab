/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.rendering;
import alphatab.platform.ICanvas;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.Stave;

/**
 * This is the base class for creating blocks which can render bars.
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