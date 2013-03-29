package alphatab;
import alphatab.platform.ICanvas;
import alphatab.platform.IFileLoader;
import alphatab.rendering.BarRendererFactory;
import alphatab.rendering.EffectBarRendererFactory;
import alphatab.rendering.effects.BeatVibratoEffectInfo;
import alphatab.rendering.effects.DummyEffectInfo;
import alphatab.rendering.effects.NoteVibratoEffectInfo;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.layout.HorizontalScreenLayout;
import alphatab.rendering.layout.PageViewLayout;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.ScoreBarRendererFactory;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.TabBarRendererFactory;
import haxe.ds.StringMap;

/**
 * This class represents the global alphaTab environment where
 * alphaTab looks for information like available layout engines
 * staves etc.
 */
class Environment
{
    public static var renderEngines:StringMap < Dynamic->ICanvas > ;
    public static var fileLoaders:StringMap < Void->IFileLoader > ;
    public static var layoutEngines:StringMap < ScoreRenderer->ScoreLayout > ;
    public static var staveFactories:StringMap < ScoreLayout->BarRendererFactory > ;
    
    
    public static function __init__() 
    {
        renderEngines = new StringMap < Dynamic->ICanvas > ();
        fileLoaders = new StringMap < Void->IFileLoader > ();
        layoutEngines = new StringMap < ScoreRenderer -> ScoreLayout > ();
        staveFactories = new StringMap < ScoreLayout->BarRendererFactory > ();

        // default render engines
        renderEngines.set("default", function(d) { 
            #if js
            return new alphatab.platform.js.Html5Canvas(d);
            #else
            return new alphatab.platform.svg.SvgCanvas();
            #end
        } );
        renderEngines.set("html5", function(d) { return new alphatab.platform.js.Html5Canvas(d); } );
        renderEngines.set("svg", function(d) { return new alphatab.platform.svg.SvgCanvas(); } );
        
        // default file loaders
        fileLoaders.set("default", function() { 
            #if (neko || cpp || cs)
            return new alphatab.platform.sys.SysFileLoader();
            #elseif js
            return new alphatab.platform.js.JsFileLoader();
            #else
            return null;
            #end
        });
        
        // default layout engines
        layoutEngines.set("default", function(r) { return new PageViewLayout(r); } );
        layoutEngines.set("page", function(r) { return new PageViewLayout(r); } );
        layoutEngines.set("horizontal", function(r) { return new HorizontalScreenLayout(r); } );
        
        // default staves 
        var dummy = function(l) { return new EffectBarRendererFactory(new DummyEffectInfo()); };
        staveFactories.set("marker", dummy);
        staveFactories.set("triplet-feel", dummy);
        staveFactories.set("tempo", dummy); 
        staveFactories.set("fermata", dummy); 
        staveFactories.set("text", dummy); 
        staveFactories.set("chords", dummy); 
        staveFactories.set("beat-vibrato", function(l) { return new EffectBarRendererFactory(new BeatVibratoEffectInfo()); } ); 
        staveFactories.set("note-vibrato", function(l) { return new EffectBarRendererFactory(new NoteVibratoEffectInfo()); } ); 
        staveFactories.set("tuplet", dummy); 
        staveFactories.set("score", function(l) { return new ScoreBarRendererFactory(); } ); 
        staveFactories.set("dynamics", dummy); 
        staveFactories.set("tap", dummy); 
        staveFactories.set("fade-in", dummy); 
        staveFactories.set("let-ring", dummy); 
        staveFactories.set("palm-mute", dummy); 
        staveFactories.set("tab", function(l) { return new TabBarRendererFactory(); } ); 
        staveFactories.set("fingering", dummy);   
    }
}