/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
                context = new AlphaTab.Platform.JavaScript.JsApi(element[0], options);
                element.data('alphaTab', context);
                
                for(var i = 0; i < api._initListeners.length; i++) {
                    api._initListeners[i](element, context, options);
                }
            }
        },
        
        destroy: function(element, context, tex) {
            element.removeData('alphaTab');
            context.Destroy();
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
        
        print: function(element, context, width) {
            context.Print(width);
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
        if (method == 'destroy' && !context) { 
            return;
        }
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
    
})(typeof jQuery !== 'undefined' ? jQuery : null);