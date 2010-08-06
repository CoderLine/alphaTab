/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.platform.js;
#if js
import js.XMLHttpRequest;

class JQuery 
{
	static public inline function Elements(e: Dynamic): JQuery { return untyped (jQuery(e)); }
	
	public inline function Children(): JQuery { return untyped this.children(); }
	public inline function Length(): Int { return untyped this.length; }
	public inline function Get(index:Int): Dynamic { return untyped this.get(index); }
	public inline function Height(): Int { return untyped this.height(); }
	public inline function SetHeight(value: Int): JQuery { return untyped this.height(value); }
	public inline function Width(): Int { return untyped this.width(); }
	public inline function SetWidth(value: Int): JQuery { return untyped this.width(value); }

	public static inline function Ajax(options: Dynamic): XMLHttpRequest { return untyped jQuery.ajax(options); }
	public static inline function IsIE(): Bool { return untyped jQuery.browser.msie; }
	
		
}

#end 
