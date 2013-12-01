/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
package alphatab;

import alphatab.platform.ICanvas;
import alphatab.platform.IFileLoader;
import alphatab.rendering.AlternateEndingsBarRendererFactory;
import alphatab.rendering.BarRendererFactory;
import alphatab.rendering.EffectBarRendererFactory;
import alphatab.rendering.effects.BeatVibratoEffectInfo;
import alphatab.rendering.effects.ChordsEffectInfo;
import alphatab.rendering.effects.CrescendoEffectInfo;
import alphatab.rendering.effects.DynamicsEffectInfo;
import alphatab.rendering.effects.FadeInEffectInfo;
import alphatab.rendering.effects.FingeringEffectInfo;
import alphatab.rendering.effects.LetRingEffectInfo;
import alphatab.rendering.effects.MarkerEffectInfo;
import alphatab.rendering.effects.NoteVibratoEffectInfo;
import alphatab.rendering.effects.PalmMuteEffectInfo;
import alphatab.rendering.effects.PickStrokeEffectInfo;
import alphatab.rendering.effects.TapEffectInfo;
import alphatab.rendering.effects.TempoEffectInfo;
import alphatab.rendering.effects.TextEffectInfo;
import alphatab.rendering.effects.TrillEffectInfo;
import alphatab.rendering.effects.TripletFeelEffectInfo;
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
            #elseif (cs && gdi)
            return new alphatab.platform.cs.GdiCanvas();
            #elseif (cs && wpf)
            return new alphatab.platform.cs.WpfCanvas(d);
            #else
            return new alphatab.platform.svg.SvgCanvas();
            #end
        } );
        #if js
        renderEngines.set("html5", function(d) { return new alphatab.platform.js.Html5Canvas(d); } );
        #elseif cs 
        renderEngines.set("gdi", function(d) { return new alphatab.platform.cs.GdiCanvas(); } );
        renderEngines.set("wpf", function(d) { return new alphatab.platform.cs.WpfCanvas(d); } );
        #end
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
        staveFactories.set("marker", function(l) { return new EffectBarRendererFactory(new MarkerEffectInfo()); } );
        staveFactories.set("triplet-feel", function(l) { return new EffectBarRendererFactory(new TripletFeelEffectInfo()); });
        staveFactories.set("tempo", function(l) { return new EffectBarRendererFactory(new TempoEffectInfo()); }); 
        staveFactories.set("text", function(l) { return new EffectBarRendererFactory(new TextEffectInfo()); }); 
        staveFactories.set("chords", function(l) { return new EffectBarRendererFactory(new ChordsEffectInfo()); }); 
        staveFactories.set("trill", function(l) { return new EffectBarRendererFactory(new TrillEffectInfo()); } ); 
        staveFactories.set("beat-vibrato", function(l) { return new EffectBarRendererFactory(new BeatVibratoEffectInfo()); } ); 
        staveFactories.set("note-vibrato", function(l) { return new EffectBarRendererFactory(new NoteVibratoEffectInfo()); } ); 
        staveFactories.set("alternate-endings", function(l) { return new AlternateEndingsBarRendererFactory(); } ); 
        staveFactories.set("score", function(l) { return new ScoreBarRendererFactory(); } ); 
        staveFactories.set("crescendo", function(l) { return new EffectBarRendererFactory(new CrescendoEffectInfo()); }); 
        staveFactories.set("dynamics", function(l) { return new EffectBarRendererFactory(new DynamicsEffectInfo()); }); 
        staveFactories.set("tap", function(l) { return new EffectBarRendererFactory(new TapEffectInfo()); }); 
        staveFactories.set("fade-in", function(l) { return new EffectBarRendererFactory(new FadeInEffectInfo()); }); 
        staveFactories.set("let-ring", function(l) { return new EffectBarRendererFactory(new LetRingEffectInfo()); }); 
        staveFactories.set("palm-mute", function(l) { return new EffectBarRendererFactory(new PalmMuteEffectInfo()); }); 
        staveFactories.set("tab", function(l) { return new TabBarRendererFactory(); } ); 
        staveFactories.set("pick-stroke", function(l) { return new EffectBarRendererFactory(new PickStrokeEffectInfo()); }); 
        // staveFactories.set("fingering", function(l) { return new EffectBarRendererFactory(new FingeringEffectInfo()); });   
    }
}