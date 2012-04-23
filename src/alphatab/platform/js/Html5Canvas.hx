package alphatab.platform.js;

#if js
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;

/**
 * A canvas implementation for HTML5 canvas
 */
class Html5Canvas implements ICanvas 
{
    private var _canvas:Dynamic;
    private var _context:Dynamic;
    
    public function new(dom:Dynamic) 
    {  
        this._canvas = dom;
        this._context = dom.getContext("2d");
		this._context.textBaseline = "top";
    }
    
    public function getWidth():Int 
    {
        return _canvas.offsetWidth; 
    }
    
    public function getHeight():Int 
    {
        return _canvas.offsetHeight;
    }
    
    public function setWidth(width:Int):Void 
    {
        this._canvas.width = width;
        this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
    }
    
    public function setHeight(height:Int):Void 
    {
        this._canvas.height = height;
        this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
    } 
    
    // colors and styles
	public function setColor(color : Color) : Void
	{
		this._context.strokeStyle = color.toHexString();
		this._context.fillStyle = color.toHexString();
	}

    // line caps/joins
    public function setLineWidth(value:Float) : Void
    {
        this._context.lineWidth = value;
    }
    
    // rects
    public function clear():Void
    {
        this._context.clearRect(0,0, getWidth(), getHeight());
    }
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        this._context.fillRect(x, y, w, h);
    }
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        this._context.strokeRect(x, y, w, h);
    }

    // path API
    public function beginPath():Void
    {
        this._context.beginPath();
    }
    public function closePath():Void
    {
        this._context.closePath();
    }
    public function moveTo(x:Float, y:Float):Void
    {
        this._context.moveTo(x, y);
    }
    public function lineTo(x:Float, y:Float):Void
    {
        this._context.lineTo(x, y);
    }
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
    {
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    }
    public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
    {
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    }
    public function circle(x:Float, y:Float, radius:Float):Void
    {
        this._context.arc(x,y, radius, 0, Math.PI*2,true);
    }
    public function rect(x:Float, y:Float, w:Float, h:Float):Void
    {
        this._context.rect(x, y, w, h);
    }
    public function fill():Void
    {
        this._context.fill();
    }
    public function stroke():Void
    {
        this._context.stroke();
    }

    // text
    public function setFont(font:Font) : Void
    {
        this._context.font = font.toCssString();
    }
     
    public function setTextAlign(value:TextAlign) : Void
    {
		switch(value)
		{
			case Left:
				this._context.textAlign = "left";
			case Center:
				this._context.textAlign = "center";
			case Right:
				this._context.textAlign = "right";
		}
    }
    
    public function fillText(text:String, x:Float, y:Float):Void
    {
		this._context.fillText(text, x, y);
    }
    public function strokeText(text:String, x:Float, y:Float):Void
    {
		this._context.strokeText(text, x, y);
    }
    public function measureText(text:String):Float
    {
        return this._context.measureText(text).width;
    }
}
#end
