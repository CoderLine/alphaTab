/**
 * ...
 * @author Zenas
 */

package net.alphatab.platform.php;
#if php
class GdWrapper 
{
    public static inline function imageCreateTrueColor(width:Int, height:Int) 
	{
		var img = untyped __call__("imagecreatetruecolor", width, height);
		untyped __call__("imagealphablending", img,true);
		untyped __call__("imageantialias", img, true);
		return img;
	}   
	
	public static inline function imageSx(image:Dynamic) :Int
	{
		return untyped __call__("imagesx", image);
	}	
	
	public static inline function imageSy(image:Dynamic) :Int
	{
		return untyped __call__("imagesy", image);
	}
	
	public static inline function imageCopy(dst_im:Dynamic, src_im:Dynamic, dst_x:Int, dst_y:Int, src_x:Int, src_y:Int, src_w:Int, src_h:Int) 
	{
		untyped __call__("imagecopy", dst_im, src_im, dst_x, dst_y, src_x, src_y, src_w, src_h);
	}	
	
	public static inline function imageSetThickness(image:Dynamic, thickness:Int) 
	{
		untyped __call__("imagesetthickness", image, thickness);
	}
	
	public static inline function imageColorAllocate(image:Dynamic, r:Int, g:Int, b:Int) 
	{
		return untyped __call__("imagecolorallocate", image, r, g, b);
	}	
	
	public static inline function imageFilledRectangle(image:Dynamic, x1:Int, y1:Int, x2:Int, y2:Int, col:Dynamic) 
	{
		return untyped __call__("imagefilledrectangle", image, x1, y1, x2, y2, col);
	}	
	
	public static inline function imageRectangle(image:Dynamic, x1:Int, y1:Int, x2:Int, y2:Int, col:Dynamic) 
	{
		return untyped __call__("imagerectangle", image, x1, y1, x2, y2, col);
	}	
}
#end