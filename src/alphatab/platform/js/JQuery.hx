package alphatab.platform.js;
#if js
import js.XMLHttpRequest;

/**
 * A JQuery Wrapper for haxe containing the needed functions
 */
// Note: Some methods don't meet the usual coding guidelines because this would cause compile errors. 
class JQuery 
{
    static public inline function elements(e: Dynamic): JQuery { return untyped (jQuery(e)); }
    
    public inline function Height(): Int { return untyped this.height(); }
    public inline function setHeight(value: Int): JQuery { return untyped this.height(value); }
    public inline function Width(): Int { return untyped this.width(); }
    public inline function setWidth(value: Int): JQuery { return untyped this.width(value); }
 
    public static inline function ajax(options: Dynamic): XMLHttpRequest { return untyped jQuery.ajax(options); }
    public static inline function isIE(): Bool { return untyped jQuery.browser.msie; }        
}
#end