import alphatab.model.Bar;
import alphatab.platform.js.Html5Canvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.rendering.BarRendererFactory;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.DiamondNoteHeadGlyph;
import alphatab.rendering.glyphs.SvgGlyph;
import alphatab.rendering.ScoreBarRenderer;
import alphatab.rendering.ScoreBarRendererFactory;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.Stave;
import alphatab.rendering.staves.StaveGroup;
import alphatab.rendering.utils.SvgPathParser;
import haxe.Resource;
import haxe.xml.Fast;
import js.JQuery;
import js.Lib;

/**
 * This small utiltiy application allows the rendering of single glyphs
 */
class Main 
{
	public static var glyphs:Array<NamedSvgGlyph>;
	
	public static var currentGlyph:NamedSvgGlyph;
	private static inline var CoordinateScale:Int = 100; // we will adjust the original coordinates by this to get rid of decimals
	
    public static function main() 
    {
        new JQuery(Lib.document).ready(function (_) {
            
			glyphs = new Array<NamedSvgGlyph>();
			
			// some initial offset that we really can see the controls
			var initialX = 100;
			var initialY = 100;
			// a zoom level for more detailed positioning 
			var zoom = 2; 
			// this point will be our "zero point". we need this because we dont want to align the glyphs outside the canvas 
			var zeroX = 150;
			var zeroY = 150;
			
            // load the controls
            var glyphCanvas = new JQuery("#glyphCanvas");
            var list = new JQuery("#glyphList");
            var button = new JQuery('#render');
            var preview = new JQuery('#preview');
            var glyphName = new JQuery('#glyphName');
            var generateButton = new JQuery('#generateButton');
            var code = new JQuery('#code');
			
            // create the structure for rendering
            var renderer = new ScoreRenderer(Lib.document.getElementById("glyphCanvas"));
                        
            var staveGroup = new StaveGroup();
            staveGroup.layout = renderer.layout;
            
            var stave = new Stave(new ScoreBarRendererFactory());
            stave.staveGroup = staveGroup;
            
            var barRenderer = new ScoreBarRenderer(new Bar());
            barRenderer.stave = stave;
            
			loadGlyphs(zoom);
			
			var repaint = function() {
				renderer.canvas.clear();
				
				// zero line
				renderer.canvas.setColor(new Color(0, 0, 250));
				
				renderer.canvas.beginPath();
				renderer.canvas.moveTo(zeroX, 0);
				renderer.canvas.lineTo(zeroX, renderer.canvas.getHeight());
				
				renderer.canvas.moveTo(0, zeroY);
				renderer.canvas.lineTo(renderer.canvas.getWidth(), zeroY);
				
				renderer.canvas.stroke();
				
				//glyph lines
				var glx:Float;
				var gly:Float;
				if (untyped(preview.attr("checked")))
				{
					glx = zeroX;
					gly = zeroY;
				}
				else
				{
					glx = currentGlyph.x;
					gly = currentGlyph.y;
				}
				renderer.canvas.setColor(new Color(0, 250, 0));
				
				renderer.canvas.beginPath();
				renderer.canvas.moveTo(glx, 0);
				renderer.canvas.lineTo(glx, renderer.canvas.getHeight());
				
				renderer.canvas.moveTo(0, gly);
				renderer.canvas.lineTo(renderer.canvas.getWidth(), gly);
				
				renderer.canvas.stroke();

				// info text that we know the translation we will apply
				var s = "x: " + calculateTranslation(currentGlyph.x, zoom, zeroX) + " y: " + calculateTranslation(currentGlyph.y, zoom, zeroY);
				renderer.canvas.setFont(new Font("Arial", 12));
				renderer.canvas.fillText(s, Math.max(10, currentGlyph.x), Math.max(20, currentGlyph.y));
				
				var renderGlyph:Glyph;
				if (untyped(preview.attr("checked")))
				{
					renderGlyph = new SvgGlyph(zeroX, zeroY, rewritePathData(currentGlyph, zeroX, zeroY, zoom), zoom / CoordinateScale, zoom / CoordinateScale);
				}
				else
				{
					renderGlyph = currentGlyph;
				}
				renderGlyph.renderer = barRenderer;
                renderGlyph.doLayout();
                renderGlyph.paint(0, 0, renderer.canvas);
			};
			
            // initialize UI 
			
			var i = 0;
            for (g in glyphs)
            {
                var option = new JQuery("<option></option>");
                option.val(Std.string(i++));
                option.text(g.name);
                list.append(option);
            }
			
			var dragging = false;
			var startX:Float;
			var startY:Float;
			
			glyphCanvas.mousedown(function(e) {
				dragging = true;
				startX = e.pageX;
				startY = e.pageY;
				untyped __js__("return false;");
			});			
			glyphCanvas.mousemove(function(e) {
				if (dragging)
				{
					var dx = e.pageX - startX;
					var dy = e.pageY - startY;
					startX = e.pageX;
					startY = e.pageY;

					currentGlyph.x += Std.int(dx);
					currentGlyph.y += Std.int(dy);
					repaint();
				}
			});
			
			new JQuery(Lib.document).bind('mouseup', function(_) {
				dragging = false;
			});
            
            list.change(function(_) {
				var index = Std.parseInt(list.val());
				currentGlyph = glyphs[index];
				
				glyphName.val(currentGlyph.name);

				repaint();
            });
			
			glyphName.keyup(function(_) {
				currentGlyph.name = glyphName.val();
				new JQuery("#glyphList option:selected").text(glyphName.val());
			});
			
			generateButton.click(function(_) {
				code.text(generateClass(zeroX, zeroY, zoom));
			});
			
			preview.change(function(_) {
				repaint();
			});
            
            // render first glyph            
            list.val("0");
            list.change();
        });
    }
	
	private static function generateClass(zeroX:Float, zeroY:Float, zoom:Float) 
	{
		var buf = new StringBuf();
		
		buf.add("package alphatab.rendering.glyphs;\r\n");
		buf.add("\r\n");
		buf.add("/**\r\n");
		buf.add(" * This class contains SVG path data for musical symbols\r\n");
		buf.add(" * which can be rendered using the SvgPainter\r\n");
		buf.add(" */\r\n");
		buf.add("class MusicFont\r\n");
		buf.add("{\r\n");
			
		for (g in glyphs)
		{
			buf.add("    public static var ");
			buf.add(g.name);
			buf.add(" = \"");
			buf.add(rewritePathData(g, zeroX, zeroY, zoom));
			buf.add("\";\r\n");
		}
		
		buf.add("}");
		
		return buf.toString();
	}
	
	private static function rewritePathData(g:NamedSvgGlyph, zeroX:Float, zeroY:Float, zoom:Float) : String
	{
		var buf = new StringBuf();
		var p = new SvgPathParser(g.getSvgData());
		p.reset();
		var isX:Bool = true;
		while (!p.eof())
		{
			if (!p.currentTokenIsNumber())
			{
				buf.add(p.currentToken);
				isX = true;
			}
			else
			{
				buf.add(" ");
				var newValue = Std.int(Std.parseFloat(p.currentToken) * CoordinateScale);
				switch(p.lastCommand)
				{
					case "m", "z", "l", "v", "h", "c", "s", "q", "t": // relative paths can remain
						buf.add(newValue); // TODO: reduce decimals by scaling
					case "M", "Z", "L", "V", "H", "C", "S", "Q", "T":
						if (isX) 
						{
							buf.add(newValue + calculateTranslation(g.x, zoom / CoordinateScale, zeroX));
						}
						else
						{
							buf.add(newValue + calculateTranslation(g.y, zoom / CoordinateScale, zeroY));
						}
				}
				isX = !isX;
			}
			p.nextToken();
		}
		
		return buf.toString();
	}
	
	private static function calculateTranslation(glyph:Float, zoom:Float, zero:Float) : Int
	{
		return Std.int((glyph - zero) / zoom);
	}
    
	public static function loadGlyphs(zoom:Float)
	{
		var svg = Resource.getString("glyphs");
		var dom = Xml.parse(svg);
		
		processNode(dom.firstElement(), zoom);
	}   
	public static function processNode(node:Xml, zoom:Float)
	{
		if (node.nodeType == Xml.Element)
		{
			if (node.nodeName == "path") 
			{
				var f = new Fast(node);
				glyphs.push(new NamedSvgGlyph(f.att.id, f.att.d, zoom));
			}
			else
			{
				for (e in node)
				{
					processNode(e, zoom);
				}
			}
		}
	}
}