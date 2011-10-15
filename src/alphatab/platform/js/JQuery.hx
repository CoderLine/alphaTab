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
package alphatab.platform.js;

// Note: we don't use the haxe internal JQuery class because this one is more lightweight
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