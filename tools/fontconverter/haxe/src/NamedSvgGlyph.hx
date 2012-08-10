package ;
import alphatab.rendering.glyphs.SvgGlyph;

class NamedSvgGlyph extends SvgGlyph
{
	public var name:String;
	public function new(name:String, svg:String, zoom:Float)
	{
		super(0, 0, svg, zoom, zoom);
		this.name = name;
	}
}