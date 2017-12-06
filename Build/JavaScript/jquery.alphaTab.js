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

	function Widget(element, options) {
		this._element = element;
		this._options = options;
		this._preHook();
		this._at = new AlphaTab.Platform.JavaScript.JsApi(element[0], options);
		this._postHook();
	}

	Widget.prototype = {
		_element: null,
		_options: null,
		_at: null,

		_preHook: $.noop,
		_postHook: $.noop,

        destroy: function () {
            this._element.removeData('alphaTab');
            this._at.Destroy();
        },
        
        tex: function (tex) {
            this._at.Tex(tex);
        },
        
        load: function (file) {
            this._at.Load(file);
        },

        tracks: function (tracks) {
            if (tracks === undefined) {
				return this._at.get_Tracks();
			} else {
                this._at.SetTracks(tracks, true);
            }
        },
        
        api: function () {
            return this._at;
        },
        
        score: function (score) {
            if (score === undefined) {
				return this._at.Score;
			} else {
                this._at.ScoreLoaded(score);
            }
        },
        
        renderer: function () {
            return this._at.Renderer;
        },
        
        layout: function (value) {
            if (value === undefined) {
                return this._at.Settings.Layout;
            } else {
                this._at.UpdateLayout(value);
            }
        },
        
        print: function (width) {
            this._at.Print(width);
        }
    };
       
	$.fn.alphaTab = function () {
		var element = $(this[0]);
		var args = Array.prototype.slice.call(arguments);
		var method = null;

		if (typeof args[0] !== 'string') {
			method = 'init';
		} else {
			method = args.shift();
		}
        
		if (method === 'init') {
			var options = args.shift();
			if (options === undefined) {
				options = {};
			}
			return element.data('alphaTab', new Widget(element, options));
		} else {
			var widget = element.data('alphaTab');
			if (widget === undefined) {
				if (method !== 'destroy') {
					throw new Error('alphaTab not initialized!');
				}
			} else if (method.charAt(0) === '_' || widget[method] === undefined) {
				throw new Error('Method ' + method + ' does not exist on jQuery.alphaTab');
			} else {
				return widget[method].apply(widget, args);
			}
		}
    };

    $.fn.alphaTab.fn = Widget.prototype;
    
}(jQuery));