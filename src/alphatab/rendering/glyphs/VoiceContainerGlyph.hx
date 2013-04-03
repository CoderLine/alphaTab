package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.BarSizeInfo;


/**
 * This glyph acts as container for handling
 * multiple voice rendering
 */
class VoiceContainerGlyph extends GlyphGroup implements ISupportsFinalize
{
    public static inline var KEY_SIZE_BEAT = "BEAT";

    public var beatGlyphs:Array<BeatGlyphBase>;
	public var beatScaleGlyphs:Array<BeatGlyphBase>;
    
    public var voiceIndex:Int;

	public function new(x:Int = 0, y:Int = 0, voiceIndex:Int)
	{
		super(x, y);
	    beatGlyphs = new Array<BeatGlyphBase>();
	    beatScaleGlyphs = new Array<BeatGlyphBase>();
        this.voiceIndex = voiceIndex;
	}

    public override function applyGlyphSpacing(spacing:Int):Void 
    {
        var glyphSpacing = Std.int(spacing / beatScaleGlyphs.length);
        for (i in 0 ... beatScaleGlyphs.length)
        {
            var g = beatGlyphs[i];
            // default behavior: simply replace glyph to new position
            if (i == 0)
            {
                g.x = 0;
            }
            else
            {
                g.x = beatGlyphs[i - 1].x + beatGlyphs[i - 1].width;
            }
             
			if (g.canScale())
			{
				if (g == beatGlyphs[beatGlyphs.length - 1])
				{
					g.applyGlyphSpacing(glyphSpacing + (spacing - (glyphSpacing * beatGlyphs.length)));
				}
				else
				{
					g.applyGlyphSpacing(glyphSpacing);
				}
			}
        }
    }
    
    public function registerMaxSizes(sizes:BarSizeInfo)
    {
        for (b in beatGlyphs)
		{
			if (sizes.getIndexedSize(KEY_SIZE_BEAT, b.index) < b.width)
			{
				sizes.setIndexedSize(KEY_SIZE_BEAT, b.index, b.width);
			}
		}
    }
    
    public function applySizes(sizes:BarSizeInfo)
    {
        for (i in 0 ... beatGlyphs.length)
		{
			beatGlyphs[i].x = (i == 0) ? 0 : beatGlyphs[i - 1].x + beatGlyphs[i - 1].width;
			
			var beatSize = sizes.getIndexedSize(KEY_SIZE_BEAT, i);
			var beatDiff = beatSize - beatGlyphs[i].width;
			
			if (beatDiff > 0)
			{
				beatGlyphs[i].applyGlyphSpacing(beatDiff);
			}
		}
    }
    
    public override function addGlyph(g:Glyph):Void 
    {
        g.x = beatGlyphs.length == 0 ? 0 : (beatGlyphs[beatGlyphs.length - 1].x + beatGlyphs[beatGlyphs.length - 1].width);
		g.index = beatGlyphs.length;
		g.renderer = renderer;
		g.doLayout();
		beatGlyphs.push(cast g);
		if (g.canScale())
		{
			beatScaleGlyphs.push(cast g);
		}
    }
    
    public function finalizeGlyph(layout:ScoreLayout) : Void
    {
        for (i in 0 ... beatGlyphs.length)
        {
            var g = beatGlyphs[i];
			if (Std.is(g, ISupportsFinalize))
			{
				cast(g, ISupportsFinalize).finalizeGlyph(layout);
			}
        }
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        for (g in beatGlyphs)
		{
			g.paint(cx + x, cy + y, canvas);
		}	
    }
}