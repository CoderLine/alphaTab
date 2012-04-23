package alphatab.rendering;
import alphatab.model.Score;
import alphatab.model.Track;
import alphatab.platform.Canvas;
import alphatab.platform.PlatformFactory;
import alphatab.rendering.layout.PageViewLayout;
import alphatab.rendering.layout.ScoreLayout;

/**
 * This is the main wrapper of the rendering engine which 
 * can render a single track of a score object into a notation sheet.
 */
class ScoreRenderer 
{
    public var canvas : Canvas;
    public var score(getScore, null) : Score;
    public var track : Track;
    public var scale : Float;
    
    public var layout : ScoreLayout;
    
    public var renderingResources : RenderingResources;
	
	public var settings:Hash<Dynamic>;

        
    public function new(source:Dynamic) 
    {
		updateScale(1.0);
		settings = new Hash<Dynamic>();
        canvas = PlatformFactory.getCanvas(source);
        layout = new PageViewLayout(this);
    }
	
	public function updateScale(scale:Float)
	{
		this.scale = scale;
		this.renderingResources = new RenderingResources(scale);
	}
    
    public function render(track:Track)
    {
        this.track = track;
        doLayout();
        paintScore();
    }
    
    public function getScore() : Score
    {
        if (track == null)
        {
            return null;
        }
        return track.score;
    }
    
    private function doLayout()
    {
        layout.doLayout();
		canvas.height = layout.height;
		canvas.width = layout.width;
    }
    
    private function paintScore()
    {
        paintBackground();
		layout.paintScore();
    }
    
    public function paintBackground() 
    {
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
        canvas.fillStyle = "#4e4e4e";
        canvas.font = renderingResources.copyrightFont;
        canvas.textBaseline = "top";
        var x:Float = (canvas.width - canvas.measureText(msg)) / 2;
        canvas.fillText(msg, x, canvas.height - 18);
    }
	
	//
	// Settings
	//
	
	public function setStaveSetting(staveId:String, setting:String, value:Dynamic)
    {   
        settings.set(staveId + "." + setting, value);
    }
    
    public function getStaveSetting(staveId:String, setting:String, defaultValue:Dynamic = null) : Dynamic
    {
        var value:Dynamic = settings.get(staveId + "." + setting);
        return value != null ? value : defaultValue;
    }
     
    public function setLayoutSetting(setting:String, value:Dynamic)
    {   
        settings.set("layout." + setting, value);
    }
    
    public function getLayoutSetting(setting:String, defaultValue:Dynamic = null) : Dynamic
    {
        var value:Dynamic = settings.get("layout." + setting);
        return value != null ? value : defaultValue;
    }

}