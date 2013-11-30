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
package alphatab;

import alphatab.rendering.glyphs.TremoloPickingGlyph;
import haxe.ds.StringMap;

/**
 * This class contains instance specific settings for alphaTab
 */
class Settings
{
    /**
     * Sets the zoom level of the rendered notation
     */    
    public var scale:Float;
    
    /**
     * Sets whether the width of the canvas should be automatically determined by the used layout.
     */
    public var autoSize:Bool;
        
    /**
     * The initial size of the canvas during loading or the width when {@see autoSize} set to false
     */
    public var width:Int;
    
    /**
     * The initial size of the canvas during loading or the fixed height on some layouts. 
     */ 
    public var height:Int;
    
    /**
     * The engine which should be used to render the the tablature. 
     * <ul>
     *  <li><strong>default</strong> - Platform specific default engine</li>
     *  <li><strong>html5</strong> - Canvas with VRML Fallback</li>
     *  <li><strong>svg</strong> -  SVG </li>
     * </ul>
     */
    public var engine:String;
    
    /**
     * The layout specific settings
     */
    public var layout:LayoutSettings;
    
    /**
     * The staves to create for each row.
     */
    public var staves:Array<StaveSettings>;
    
    public function new()
    {
        
    }    
    
    public static function defaults() : Settings
    {
        var settings = new Settings();
        
        settings.scale = 1.0;
        settings.autoSize = true;
        settings.width = 600;
        settings.height = 200;
        settings.engine = "default";
        
        settings.layout = LayoutSettings.defaults();

        settings.staves = new Array<StaveSettings>();
        
        settings.staves.push(new StaveSettings("marker"));
        settings.staves.push(new StaveSettings("triplet-feel"));
        settings.staves.push(new StaveSettings("tempo"));
        settings.staves.push(new StaveSettings("text"));
        settings.staves.push(new StaveSettings("chords"));
        settings.staves.push(new StaveSettings("trill"));
        settings.staves.push(new StaveSettings("beat-vibrato"));
        settings.staves.push(new StaveSettings("note-vibrato"));
        settings.staves.push(new StaveSettings("alternate-endings"));
        
        settings.staves.push(new StaveSettings("score"));
        
        settings.staves.push(new StaveSettings("crescendo"));
        settings.staves.push(new StaveSettings("dynamics"));
        settings.staves.push(new StaveSettings("trill"));
        settings.staves.push(new StaveSettings("beat-vibrato"));
        settings.staves.push(new StaveSettings("note-vibrato"));
        settings.staves.push(new StaveSettings("tap"));
        settings.staves.push(new StaveSettings("fade-in"));
        settings.staves.push(new StaveSettings("let-ring"));
        settings.staves.push(new StaveSettings("palm-mute"));
        
        settings.staves.push(new StaveSettings("tab"));
        
        settings.staves.push(new StaveSettings("pick-stroke"));
        settings.staves.push(new StaveSettings("fingering"));

        return settings;
    }
    
#if js
    public static function fromJson(json:Dynamic) : Settings
    {
        var settings = defaults();
        
        if (!json) return settings;        
        if(json.scale) settings.scale = json.scale;
        if(json.autoSize) settings.autoSize = json.autoSize;
        if(json.width) settings.width = json.width;
        if(json.height) settings.height = json.height;
        if(json.engine) settings.engine = json.engine;

        if (json.layout) 
        {
            if (Std.is(json.layout, String))
            {
                settings.layout.mode = json.layout;
            }
            else
            {
                if (json.layout.mode) settings.layout.mode = json.layout.mode;
                if (json.layout.additionalSettings)
                {
                    for (key in Reflect.fields(json.layout.additionalSettings))
                    {
                        settings.layout.additionalSettings.set(key, Reflect.field(json.layout.additionalSettings, key));
                    }
                }            
            }
        }
        
        if (json.staves)
        {
            settings.staves = new Array<StaveSettings>();
            for (key in Reflect.fields(json.staves))
            {
                var val:Dynamic = Reflect.field(json.staves, key);
                if (Std.is(val, String))
                {
                    settings.staves.push(new StaveSettings(val));
                }
                else
                {   
                    if (val.id)
                    {
                        var staveSettings = new StaveSettings(val.id);
                        if (val.additionalSettings)
                        {
                            for (key in Reflect.fields(val.additionalSettings))
                            {
                                staveSettings.additionalSettings.set(key, Reflect.field(val.additionalSettings, key));
                            }
                        }                            
                    }
                }
            }
        }
        
        return settings;        
    }
#end
}


class LayoutSettings
{
    /**
     * The layouting mode used to arrange the the notation.
     * <ul>
     *  <li><strong>page</strong> - Bars are aligned in rows using a fixed width</li>
     *  <li><strong>horizontal</strong> - Bars are aligned horizontally in one row</li>
     * </ul>
     */
    public var mode:String;
    
    /**
     * Additional layout mode specific settings.
     * <strong>mode=page</strong>
     * <ul>
     *  <li><strong>barsPerRow</strong> - Limit the displayed bars per row, <em>-1 for sized based limit<em> (integer, default:-1)</li>
     *  <li><strong>start</strong> - The bar start index to start layouting with (integer: default: 0)</li>
     *  <li><strong>count</strong> - The amount of bars to render overall, <em>-1 for all till the end</em>  (integer, default:-1)</li>
     *  <li><strong>hideInfo</strong> - Render the song information or not (boolean, default:true)</li>
     * </ul>
     * <strong>mode=horizontal</strong>
     * <ul>
     *  <li><strong>start</strong> - The bar start index to start layouting with (integer: default: 0)</li>
     *  <li><strong>count</strong> - The amount of bars to render overall, <em>-1 for all till the end</em>  (integer, default:-1)</li>
     * </ul>
     */
    public var additionalSettings:StringMap<Dynamic>;
    
    public function get<T>(key:String, def:T) : T
    {
        if (additionalSettings.exists(key))
        {
            return cast(additionalSettings.get(key));
        }
        return def;
    }
    
    public function new()
    {
        additionalSettings = new StringMap<Dynamic>();
    }
    
    public static function defaults() : LayoutSettings
    {
        var settings = new LayoutSettings();
        
        settings.mode = "page";

        return settings;
    }    
}

class StaveSettings 
{
    /**
     * The stave identifier.
     * Default Staves: 
     * <ul>
     *  <li><strong>marker</strong> - Renders section markers</li>
     *  <li><strong>triplet-feel</strong> - Renders triplet feel indicators</li>
     *  <li><strong>tempo</strong> - Renders a tempo identifier</li>
     *  <li><strong>text</strong> - Renders custom text annotations</li>
     *  <li><strong>chords</strong> - Renders chord names</li>
     *  <li><strong>beat-vibrato</strong> - Renders beat vibrato symbols</li>
     *  <li><strong>note-vibrato</strong> - Renders note vibrato symbols</li>
     *  <li><strong>tuplet</strong> - Renders tuplet indicators</li>
     *  <li><strong>score</strong> - Renders default music notation</li>
     *  <li><strong>crescendo</strong> - Renders crescendo and decresencod</li>
     *  <li><strong>dynamics</strong> - Renders dynamics markers</li>
     *  <li><strong>tap</strong> - Renders tap/slap/pop indicators</li>
     *  <li><strong>fade-in</strong> - Renders fade-in indicators</li>
     *  <li><strong>let-ring</strong> - Renders let-ring indicators</li>
     *  <li><strong>palm-mute</strong> - Renders palm-mute indicators</li>
     *  <li><strong>tab</strong> - Renders guitar tablature</li>
     *  <li><strong>fingering</strong> - Renders finger indicators</li>
     * </ul>
     */
    public var id:String;    
    
    /**
     * Additional stave specific settings
     * <strong>id=tab</strong>
     * <ul>
     *  <li><strong>rhythm</strong> - Renders rhythm beams to tablature notes</li>
     * </ul>
     */
    public var additionalSettings:StringMap<Dynamic>;
    
    public function new(id:String)
    {
        this.id = id;
        additionalSettings = new StringMap<Dynamic>();
    }
}