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
    if(!$) { return }

    var api = {
        init: function(element, context, options) {
            if (!context) {
                var useWorker = !(options && options.useWorker == false);
                if(useWorker && !!window.Worker) {
                    context = new AlphaTab.Platform.JavaScript.JsWorkerApi(element[0], options);
                }
                else {
                    context = new AlphaTab.Platform.JavaScript.JsApi(element[0], options);
                }
                element.data('alphaTab', context);
                
                for(var i = 0; i < api._initListeners.length; i++) {
                    api._initListeners[i](element, context, options);
                }
            }
        },
        
        tex: function(element, context, tex) {
            context.Tex(tex);
        },
         
        load: function(element, context, file) {
            context.Load(file);
        },
       
        tracks: function(element, context, tracks) {
            if(tracks) {
                context.SetTracks(tracks, true);
            }
            else {
                return context.get_Tracks();
            }
        },
        
        api: function(element, context) {
            return context;
        },
        
        score: function(element, context, score) {
            if(score) {
                context.ScoreLoaded(score);
            }
            else {
                return context.Score;
            }
        },
        
        renderer: function(element, context) {
            return context.Renderer;
        },
        
        layout: function(element, context, value) {
            if(typeof value === 'undefined') {
                return context.Settings.Layout;
            } 
            else {
                context.UpdateLayout(value);
            }            
        },
               
        _initListeners: [],
        _oninit: function(handler) {
            api._initListeners.push(handler);
        },
    };
        
    var apiExec = function(element, method, args) {
        if(typeof(method) != "string") {
            args = [method];
            method = 'init';
        }
        
        if(method.charAt(0) === '_') {
            return;           
        }
        
        var $element = $(element);
        var context = $(element).data('alphaTab');
        if (method != 'init' && !context) { 
            throw new Error('alphaTab not initialized!'); 
        }
                
        if (api[method]) {
            var realArgs = [ $element, context ].concat(args);
            return api[method].apply(this, realArgs);
        }
        else {
            console.error('Method ' + method + ' does not exist on jQuery.alphaTab');
        }
    };
       
    $.fn.alphaTab = function (method) {        
        // if only a single element is affected, we use this
        if(this.length == 1) {
            return apiExec(this[0], method, Array.prototype.slice.call(arguments, 1));
        }
        // if multiple elements are affected we provide chaining
        else {
            return this.each(function() {
                apiExec(this, method, Array.prototype.slice.call(arguments, 1));
            });
        }
    };
    $.alphaTab = {
        restore: function(selector) {
            $(selector).empty().removeData('alphaTab');
        }
    };
    // allow plugins to add methods
    $.fn.alphaTab.fn = api;
        
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
    
})(typeof jQuery !== 'undefined' ? jQuery : null);