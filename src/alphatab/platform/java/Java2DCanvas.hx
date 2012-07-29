package alphatab.platform.java;

#if jvm
import alphatab.platform.Canvas;

class Java2DCanvas implements Canvas
{
	public function new() 
	{
		
	}
	
	public var width(getWidth, setWidth):Int;
    public var height(getHeight, setHeight):Int;
	
	private function getWidth():Int 
    {
		throw "java_todo";
		return 0;
	}
    
    private function getHeight():Int 
    {
		throw "java_todo";
		return 0;
    }
    
    private function setWidth(width:Int):Int 
    {
		throw "java_todo";
		return 0;
    }
    
    private function setHeight(height:Int):Int 
    {
		throw "java_todo";
		return 0;
	} 
    
        
    // colors and styles
    public var strokeStyle(getStrokeStyle, setStrokeStyle):String;
    public var fillStyle(getFillStyle, setFillStyle):String;
	
	private function getStrokeStyle() : String
    {
		throw "java_todo";
		return "";
    } 
    private function setStrokeStyle(value:String) : String
    {
		throw "java_todo";
		return "";
    }
    
    private function getFillStyle() : String
    {
		throw "java_todo";
		return "";
    }
    private function setFillStyle(value:String) : String
    {
		throw "java_todo";
		return "";
    }

        
    // line caps/joins
    public var lineWidth(getLineWidth, setLineWidth):Float;
        
	private function getLineWidth() : Float
    {
		throw "java_todo";
		return 0;
    }
    private function setLineWidth(value:Float) : Float
    {
		throw "java_todo";
		return 0;
    }

    // rects
    public function clear():Void { throw "java_todo"; }
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void{ throw "java_todo"; }
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void{ throw "java_todo"; }

    // path API
    public function beginPath():Void{ throw "java_todo"; }
    public function closePath():Void{ throw "java_todo"; }
    public function moveTo(x:Float, y:Float):Void{ throw "java_todo"; }
    public function lineTo(x:Float, y:Float):Void{ throw "java_todo"; }
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void{ throw "java_todo"; }
    public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void{ throw "java_todo"; }
    public function rect(x:Float, y:Float, w:Float, h:Float):Void{ throw "java_todo"; }
    public function circle(x:Float, y:Float, radius:Float):Void{ throw "java_todo"; }
    public function fill():Void{ throw "java_todo"; }
    public function stroke():Void{ throw "java_todo"; }

    // text
    public var font(getFont, setFont):String;
	    
	private function getFont() : String
    {
		throw "java_todo";
		return "";
    }
    private function setFont(value:String) : String
    {
		throw "java_todo";
		return "";
    }

	
    public var textBaseline(getTextBaseline, setTextBaseline):String;
	    
	private function getTextBaseline() : String
    {
		throw "java_todo";
		return "";
    }
    private function setTextBaseline(value:String) : String
    {
		throw "java_todo";
		return "";
    }
	
    public var textAlign(getTextAlign, setTextAlign):String;
	    
	private function getTextAlign() : String
    {
		throw "java_todo";
		return "";
    }
    private function setTextAlign(value:String) : String
    {
		throw "java_todo";
 		return "";
   }

	
    public function fillText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void{ throw "java_todo"; }
    public function strokeText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void{ throw "java_todo"; }
    public function measureText(text:String):Float { throw "java_todo"; return 0; }
}
#end