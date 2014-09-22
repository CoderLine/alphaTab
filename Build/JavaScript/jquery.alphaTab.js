/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
(function ($) {

    var api = {
        init: function(options) {
            var $this = $(this);
            var context = $this.data('alphaTab');
            if (!context) {
                var ctx = new AlphaTab.Platform.JavaScript.JsApi(this, options);
                $this.data('alphaTab', ctx);
            }
        }, 
        
        tex: function(contents) {
            var context = $(this).data('alphaTab');
            if (!context) { console.error('alphaTab not initialized!'); }
            context.tex(contents);
        },
         
        load: function(data) {
            var context = $(this).data('alphaTab');
            if (!context) { console.error('alphaTab not initialized!'); }
            context.load(data);
        },
       
        tracks: function(tracks) {
            var context = $(this).data('alphaTab');
            if (!context) { console.error('alphaTab not initialized!'); }
            if(tracks) {
                context.setTracks(tracks, true);
            }
            else {
                return context.get_tracks();
            }
        },
        
        score: function(score) {
            var context = $(this).data('alphaTab');
            if (!context) { console.error('alphaTab not initialized!'); }
            if(tracks) {
                context.scoreLoaded(score);
            }
            else {
                return context.score;
            }
        },
        
        renderer: function(e) {
            var context = $(this).data('alphaTab');
            if (!context) { console.error('alphaTab not initialized!'); }
            return context.renderer;
        }
    };
        
    var apiExec = function(method, args) {
        method = method || 'init';
        if (api[method]) {
            return api[method].apply(this, args);
        }
        else {
            console.error('Method ' + method + ' does not exist on jQuery.alphaTab');
        }
    };
       
    $.fn.alphaTab = function (method) {        
        // if only a single element is affected, we use this
        if(this.length == 1) {
            return apiExec.call(this[0], method, Array.prototype.slice.call(arguments, 1));
        }
        // if multiple elements are affected we provide chaining
        else {
            return this.each(function() {
                apiExec.call(this, method, Array.prototype.slice.call(arguments, 1));
            });
        }
    };
    
    // allow plugins to add methods
    $.fn.alphaTab.fn = api;
    
})(jQuery);

/**
 * VB Loader For IE 
 * This code is based on the code of 
 *     http://nagoon97.com/reading-binary-files-using-ajax/
 *     Copyright (c) 2008 Andy G.P. Na <nagoon97@naver.com>
 *     The source code is freely distributable under the terms of an MIT-style license.
 */
document.write('<script type="text/vbscript">\n\
Function VbAjaxLoader(method, fileName)\n\
	Dim xhr\n\
	Set xhr = CreateObject("Microsoft.XMLHTTP")\n\
\n\
	xhr.Open method, fileName, False\n\
\n\
	xhr.setRequestHeader "Accept-Charset", "x-user-defined"\n\
	xhr.send\n\
\n\
	Dim byteArray()\n\
\n\
	if xhr.Status = 200 Then\n\
		Dim byteString\n\
		Dim i\n\
\n\
		byteString=xhr.responseBody\n\
\n\
		ReDim byteArray(LenB(byteString))\n\
\n\
		For i = 1 To LenB(byteString)\n\
			byteArray(i-1) = AscB(MidB(byteString, i, 1))\n\
		Next\n\
	End If\n\
\n\
	VbAjaxLoader=byteArray\n\
End Function\n\
</script>');