package net.alphatab;

/**
 * A custom trace implementation to customize the output.
 */
class MyTrace 
{
    public static function init() {
        haxe.Log.trace = trace;
    }

    private static function trace( v : Dynamic, ?i : haxe.PosInfos ) {
		// uncomment this part to enable logging. 
		/*untyped {
			var msg = if ( i != null ) i.fileName + ":" + i.lineNumber + ": " else "";
			msg += " " + time() + " - ";
			msg += __unhtml(Std.string(v))+"<br/>";
			var d = document.getElementById("haxe:trace");
			if( d != null )
				d.innerHTML += msg;
		}*/
    }
	
	private static function __unhtml(s : String) {
		return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	}
	
	public static function time() : String
	{
		return Std.string(Date.now().getTime());
	}
}