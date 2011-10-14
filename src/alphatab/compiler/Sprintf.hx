/*
 * Copyright (c) 2009, The Caffeine-hx project contributors
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE CAFFEINE-HX PROJECT CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE CAFFEINE-HX PROJECT CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */
package alphatab.compiler;

/*
    Sprintf, v2.0
    February 24, 2004
    (c) 2003 Nate Cook

    Get (sparse) documentation and version updates at:
    http://www.natecook.com/downloads/

    This is an Actionscript version of the sprintf function, as based
    mostly on documentation in the printf(3) man page on OS X - another
    version is found at:
    http://developer.apple.com/documentation/Darwin/Reference/ManPages/html/printf.3.html

    Support for all elements is not entirely in place, mostly because
    the translation from C to a scripting language like Actionscript
    loses some pieces by default, like pointer references and all the
    AltiVec stuff mentioned on the above page. If you think there's
    something that could be added that isn't supported, let me know.

    This file may be distributed and used in any projects (commercial or
    not) as long as it is unaltered and this notice is intact. I'd love
    to hear from you with feedback, about bugs, ideas for further
    features, etc. Thanks!

    USAGE:
    Sprintf.format(format, [args...])
        implementation of c-style string formatting
    Sprintf.trace(format, [args...])
        shortcut to trace a formatted string

    ERRORS:
    By default all errors are silently ignored (since that's what makes sense to me).
    To see error messages in trace output, use this line:
        Sprintf.TRACE = true;
    To see error messages in the result output, use this line:
        Sprintf.DEBUG = true;


    VERSION HISTORY
    v2.0    Wrapped into an AS2.0 class by Patrick Mineault (thanks!)
            http://www.5etdemi.com/
            http://www.5etdemi.com/blog/
    v1.1    Changed file name, other changes for AS2.0 compatibility
    v1.0    Initial release.

*/

/**
* This is an Haxe version of the sprintf function, as based
* mostly on documentation in the printf(3) man page
* http://developer.apple.com/documentation/Darwin/Reference/ManPages/html/printf.3.html
*
* Support for all elements is not entirely in place, mostly because
* the translation from C to a Haxe
* loses some pieces by default, like pointer references and all the
* AltiVec mentioned on the above page.
*
* @author Nate Cook
* @author Russell Weir - Haxe port
**/
class Sprintf
{
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
    // "constants"
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
    static inline var kPAD_ZEROES       = 0x01;
    static inline var kLEFT_ALIGN       = 0x02;
    static inline var kSHOW_SIGN        = 0x04;
    static inline var kPAD_POS          = 0x08;
    static inline var kALT_FORM         = 0x10;
    static inline var kLONG_VALUE       = 0x20;
    static inline var kUSE_SEPARATOR    = 0x40;

    public static var DEBUG:Bool    = false;
    public static var TRACE:Bool    = false;

    public static function format(format:String, args:Array<Dynamic>=null):String
    {
        if (format == null) return '';
        if (args == null) args = [];

        var destString  = '';
        var argIndex:Int    = 0;        // our place in args[]
        var formatIndex:Int = 0;        // our place in the format string
        var percentIndex:Int=0;         // the location of the next '%' delimiter
        var ch:Int=0;

        // -=-=-=-=-=-=-=-=-=-=-=-=-=- vars for dealing with each field
        var value:Dynamic=null;
        var length:Int=0;
        var precision:Int=0;
        var properties:Int=0;       // options: left justified, zero padding, etc...
        var fieldCount:Int = 0;     // tracks number of sections in field
        var fieldOutcome:Dynamic;   // when set to true, field parsed successfully
                                    // when set to a string, error resulted

        while (formatIndex < format.length) {
            percentIndex = format.indexOf('%',formatIndex);
            if (percentIndex == -1) {
                destString += format.substr(formatIndex);
                formatIndex = format.length;
            } else {
                destString += format.substr(formatIndex,percentIndex);

                fieldOutcome = '** sprintf: invalid format at ' + argIndex + ' **';
                length = properties = fieldCount = 0;
                precision = -1;
                formatIndex = percentIndex + 1;
                value = args[argIndex++];

                while ( Std.is(fieldOutcome, String) && (formatIndex < format.length)) {
                    ch = format.charCodeAt(formatIndex++);

                    switch (ch) {
                    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
                    // pre-processing items
                    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
                    case '#'.code:
                        if (fieldCount == 0) {
                            properties |= kALT_FORM;
                        } else {
                            fieldOutcome = '** sprintf: "#" came too late **';
                        }
                    case '-'.code:
                        if (fieldCount == 0) {
                            properties |= kLEFT_ALIGN;
                        } else {
                            fieldOutcome = '** sprintf: "-" came too late **';
                        }
                    case '+'.code:
                        if (fieldCount == 0) {
                            properties |= kSHOW_SIGN;
                        } else {
                            fieldOutcome = '** sprintf: "+" came too late **';
                        }
                    case ' '.code:
                        if (fieldCount == 0) {
                            properties |= kPAD_POS;
                        } else {
                            fieldOutcome = '** sprintf: " " came too late **';
                        }
                    case '.'.code:
                        if (fieldCount < 2) {
                            fieldCount = 2;
                            precision = 0;
                        } else {
                            fieldOutcome = '** sprintf: "." came too late **';
                        }
                    /*
                    case 'h'.code:
                        if (fieldCount < 3) {
                            fieldCount = 3;
                        } else {
                            fieldOutcome = '** sprintf: must have only one of h,l,L **';
                        }
                    case 'l'.code, 'L'.code:
                        if (fieldCount < 3) {
                            fieldCount = 3;
                            properties |= kLONG_VALUE;
                        } else {
                            fieldOutcome = '** sprintf: must have only one of h,l,L **';
                        }
                    */
                    case '0'.code,'1'.code,'2'.code,'3'.code,'4'.code,'5'.code,'6'.code,'7'.code,'8'.code,'9'.code:
                        if(ch == '0'.code && fieldCount == 0) {
                            properties |= kPAD_ZEROES;
                        }
                        else {
                            if (fieldCount == 3) {
                                fieldOutcome = '** sprintf: shouldn\'t have a digit after h,l,L **';
                            } else if (fieldCount < 2) {
                                fieldCount = 1;
                                length = (length * 10) + (ch - "0".code);
                            } else {
                                precision = (precision * 10) + (ch - "0".code);
                            }
                        }
                    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
                    // conversion specifiers
                    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
                    case 'd'.code, 'i'.code:
                        fieldOutcome = true;
                        destString += Sprintf.formatD(value,properties,length,precision);
                    case 'o'.code:
                        fieldOutcome = true;
                        destString += Sprintf.formatO(value,properties,length,precision);
                    case 'x'.code, 'X'.code:
                        fieldOutcome = true;
                        destString += Sprintf.formatX(value,properties,length,precision,(ch == 'X'.code));
                    case 'e'.code, 'E'.code:
                        fieldOutcome = true;
                        destString += Sprintf.formatE(value,properties,length,precision,(ch == 'E'.code));
                    case 'f'.code:
                        fieldOutcome = true;
                        destString += Sprintf.formatF(value,properties,length,precision);
                    case 'g'.code, 'G'.code:
                        fieldOutcome = true;
                        destString += Sprintf.formatG(value,properties,length,precision,(ch == 'G'.code));
                    case 'c'.code, 'C'.code, 's'.code, 'S'.code:
                        if(ch == "c".code || ch == "C".code)
                            precision = 1;
                        fieldOutcome = true;
                        destString += Sprintf.formatS(value,properties,length,precision);
                    case '%'.code:
                        fieldOutcome = true;
                        destString += '%';
                        // we don't need a value for this, so back up
                        argIndex--;
                    default:
                        fieldOutcome = '** sprintf: ' + Std.string(ch - "0".code) + ' not supported **';
                    }
                }

                if (fieldOutcome != true) {
                    if (Sprintf.DEBUG) destString += fieldOutcome;
                    if (Sprintf.TRACE) trace(fieldOutcome);
                }
            }
        }

        return destString;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
    // formatting functions
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-
    static function finish(output:String,value:Float,properties:Int,length:Int,precision:Int,prefix:String="") : String
    {
        if (prefix == null) prefix = '';

        // add sign to prefix
        if (value < 0) {
            prefix = '-' + prefix;
        } else if (properties & kSHOW_SIGN != 0) {
            prefix = '+' + prefix;
        } else if (properties & kPAD_POS != 0) {
            prefix = ' ' + prefix;
        }

        if ((length == 0) && (precision > -1)) {
            length = precision;
            properties |= kPAD_ZEROES;
        }

        // add padding
        while (output.length + prefix.length < length) {
            if (properties & kLEFT_ALIGN != 0) {
                output = output + ' ';
            } else if (properties & kPAD_ZEROES != 0) {
                output = '0' + output;
            } else {
                prefix = ' ' + prefix;
            }
        }

        return prefix + output;
    }

    static function number(v:Dynamic) : Float {
        if(v == null)
            return 0.;
        if(Std.is(v, String)) {
            if(v == "")
                return 0.0;
            return Std.parseFloat(v);
        }
        if(Std.is(v, Float)) {
            if(Math.isNaN(v))
                return v;
            return v;
        }
        if(Std.is(v, Int))
            return v * 1.0;
        if(Std.is(v,Bool))
            return v ? 1.0 : 0.0;
        return Math.NaN;
    }

    // integer
    static function formatD(value:Dynamic,properties,length,precision)
    {
        var output = '';
        value = number(value);

        if ((precision != 0) || (value != 0)) {
            output = Std.string(Math.floor(Math.abs(value)));
        }

        while (output.length < precision)
        {
            output = '0' + output;
        }

        return Sprintf.finish(output,value,properties,length,precision);
    }

    // octal
    static function formatO(value:Dynamic,properties,length,precision)
    {
        var output = '';
        var prefix = '';
        value = number(value);

        if ((precision != 0) && (value != 0)) {
            output = value.toString(8);
        }

        if (properties & kALT_FORM != 0) {
            prefix = '0';
        }

        while (output.length < precision) {
            output = '0' + output;
        }

        return Sprintf.finish(output,value,properties,length,precision,prefix);
    }

    // hexidecimal
    static function formatX(value:Dynamic,properties,length,precision,upper) {
        var output = '';
        var prefix = '';
        value = number(value);

        if ((precision != 0) && (value != 0)) {
            output = value.toString(16);
        }

        if (properties & kALT_FORM != 0) {
            prefix = '0x';
        }

        while (output.length < precision) {
            output = '0' + output;
        }

        if (upper) {
            prefix = prefix.toUpperCase();
            output = output.toUpperCase();
        } else {
            output = output.toLowerCase();
            // Flash documentation isn't clear about what case the Number.toString() method uses
        }

        return Sprintf.finish(output,value,properties,length,precision,prefix);
    }

    // scientific notation
    static function formatE(value:Dynamic,properties,length,precision,upper:Bool)
    {
        var output = '';
        var expCount = 0;
        value = number(value);

        if (Math.abs(value) > 1) {
            while (Math.abs(value) > 10) {
                value /= 10;
                expCount++;
            }
        } else {
            while (Math.abs(value) < 1) {
                value *= 10;
                expCount--;
            }
        }

        var expCountStr = Sprintf.format("%c%+.2d",
            [(upper ? 'E' : 'e'),expCount]);

        if (properties & kLEFT_ALIGN != 0) {
            // give small length
            output = Sprintf.formatF(value,properties,1,precision) + expCountStr;
            while (output.length < length) {
                output += ' ';
            }
        } else {
            output = Sprintf.formatF(value,properties,Std.int(Math.max(length - expCountStr.length,0)),precision) + expCount;
        }

        return output;
    }

    // float (or real)
    static function formatF(value:Dynamic,properties:Int,length:Int,precision:Int)
    {
        var output:String = '';
        var intPortion:String = '';
        var decPortion:String = '';

        // unspecified precision defaults to 6
        if (precision == -1) {
            precision = 6;
        }

        var valStr = Std.string(value);
        if (valStr.indexOf('.') == -1) {
            intPortion = Std.string((Math.abs(number(valStr))));
            decPortion = "0";
        } else {
            intPortion = Std.string((Math.abs(number(valStr.substr(0,valStr.indexOf('.'))))));
            decPortion = valStr.substr(valStr.indexOf('.') + 1);
        }

        // create decimal portion
        if (number(decPortion) == 0) {
            decPortion = "";
            while (decPortion.length < precision) decPortion += '0';
        } else {

            if (decPortion.length > precision) {
                var dec = Math.round(Math.pow(10,precision) * number('0.' + decPortion));
                if (((Std.string(dec)).length > precision) && (dec != 0)) {
                    decPortion = '0';
                    intPortion = Std.string(((Math.abs(number(intPortion)) + 1) * (number(intPortion) >= 0 ? 1 : -1)));
                } else {
                    decPortion = Std.string(dec);
                }
            }

            if (decPortion.length < precision) {
                decPortion = new String(decPortion);
                while (decPortion.length < precision) decPortion += '0';
            }
        }

        // combine pieces
        if (precision == 0) {
            output = intPortion;
            if (properties & kALT_FORM != 0) {
                output += '.';
            }
        } else {
            output = intPortion + '.' + decPortion;
        }

        return Sprintf.finish(output,Std.parseFloat(valStr),properties,length,precision,'');
    }

    // shorter of float or scientific
    static function formatG(value:Dynamic,properties,length,precision,upper:Bool)
    {

        // use 1 as the length for the test because the
        // padded value will be the same -> not useful
        var out1 = Sprintf.formatE(value,properties,1,precision,upper);
        var out2 = Sprintf.formatF(value,properties,1,precision);

        if (out1.length < out2.length) {
            return Sprintf.formatE(value,properties,length,precision,upper);
        } else {
            return Sprintf.formatF(value,properties,length,precision);
        }
    }

    // string
    static function formatS(value:Dynamic,properties:Int,length,precision)
    {
        var output = Std.string(value);

        if ((precision > 0) && (precision < output.length)) {
            output = output.substr(0,precision);
        }

        // ignore unneeded flags
        // HACK: haxe interpreter does not support unary operators
        // kPAD_ZEROES | kSHOW_SIGN | kPAD_POS | kALT_FORM => 29
        // ~(29) = -30
        properties = properties & (-30);

        return Sprintf.finish(output,value,properties,length,precision,'');
    }
}