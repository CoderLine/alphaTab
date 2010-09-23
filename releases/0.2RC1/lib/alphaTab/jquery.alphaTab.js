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
var alphaTab;

/**
 * This is a jQuery plugin for embedding alphaTab in your websites. 
 */
(function($)
{
    alphaTab = function(el, options)
    {
        //
        // Setup
        //
        var self = this;
        var el = $(el);
        this.el = el;
        this.factory = new net.alphatab.tablature.model.SongFactoryImpl();
		var loaderSwf = 'alphaTab.flashloader.swf';
		
		// resolve absolute script path
		var alphaTabTag = $('script[src$=/alphaTab.js]');
		if(alphaTabTag.length == 0) // also try min-version
			alphaTabTag = $('script[src$=/alphaTab.min.js]');

		var alphaTabBase = "";
		if(alphaTabTag.length)
		{
			var toAbsURL = function(s) 
			{
				var l = location, h, p, f, i;
				if (/^\w+:/.test(s)) 
				{
					return s;
				}

				h = l.protocol + '//' + l.host;
				if (s.indexOf('/') == 0) 
				{
					return h + s;
				}

				p = l.pathname.replace(/\/[^\/]*$/, '');
				f = s.match(/\.\.\//g);
				if (f) 
				{
					s = s.substring(f.length * 3);
					for (i = f.length; i--;)
					{
						p = p.substring(0, p.lastIndexOf('/'));
					}
				}

				return h + p + '/' + s;
			}
			alphaTabBase = toAbsURL(alphaTabTag.attr('src'));
			alphaTabBase = alphaTabBase.substr(0, alphaTabBase.lastIndexOf('/'));
		}
		
        var defaults =
        {
			// core
			base: alphaTabBase,
			
            // initial file loading
            file: null,
            track: 0,

            // callbacks
            loadCallback: null,
            errorCallback: null,

            // display settings
            error: "Load a file to display the tablature",
            zoom: 1.1,
            width:600,
            height:200,
            autoSize: true
        };

        this.options = $.extend(defaults, options);

        //
        // public operations (API)
        //

        // loading
        this.loadAlphaTex = function(tex)
        {
			try
			{
                self.tablature.isError = false;

                // create parser and reader
				var parser = new net.alphatab.file.alphatex.AlphaTexParser();
				var reader = new net.alphatab.platform.BinaryReader();

				reader.initialize(tex);
				parser.init(reader, self.factory);

                // read song
				songLoaded(parser.readSong());
			}
			catch(e)
			{
                updateError(e);
			}
        }

        this.loadFile = function(url)
        {
            try
			{
				net.alphatab.file.SongLoader.loadSong(url, self.factory, songLoaded);
			}
			catch(e)
			{
                updateError(e);
			}
        }

        // plugin callbacks on load
        this.loadCallbacks = []; 
        
        //
        // private operations
        //
        var songLoaded = function(song)
        {
            // fire callback
            if(self.options.loadCallback)
                self.options.loadCallback(song);
            // update tablature
            self.tablature.setTrack(song.tracks[self.options.track]);
            // additional plugin callbacks
            for(var i = 0; i < self.loadCallbacks.length; i++)
            {
                self.loadCallbacks[i](song);
            }
        }

        var updateError = function(msg)
        {
            if(msg instanceof net.alphatab.file.FileFormatException)
                msg = msg.message;

            // use error callback if available, otherwise: render in tablature
            if(self.options.errorCallback)
            {
                self.options.errorCallback(msg);
            }
            else
            {
                self.tablature.isError = true;
                self.tablature.updateDisplay = true;
                self.tablature.errorMessage = msg;
                self.tablature.invalidate();
            }
        }

        //
        // startup
        //
        
        this.contents = $.trim(el.text());
		el.html('');
        // create canvas
		// HACK: call createElement('canvas') once before. this ensures that the browser knows the element
		document.createElement('canvas'); 
        this.canvas = $('<canvas width="'+this.options.width+'" height="'+this.options.height+'" class="alphaTabSurface"></canvas>');
		el.append(this.canvas);
		this.canvas = this.canvas[0];
		if($.browser.msie) 
		{
			// Excanvas initialization
			var fixElement_ = function(el) 
			{
			   // in IE before version 5.5 we would need to add HTML: to the tag name
			   // but we do not care about IE before version 6
			   var outerHTML = el.outerHTML;
			 
			   var newEl = el.ownerDocument.createElement(outerHTML);
			   // if the tag is still open IE has created the children as siblings and
			   // it has also created a tag with the name "/FOO"
			   if (outerHTML.slice(-2) != "/>") {
					 var tagName = "/" + el.tagName;
					 var ns;
					 // remove content
					 while ((ns = el.nextSibling) && ns.tagName != tagName) {
					   ns.removeNode();
					 }
					 // remove the incorrect closing tag
					 if (ns) {
					   ns.removeNode();
					 }
			   }
			   el.parentNode.replaceChild(newEl, el);
			   return newEl;
			};
			
			this.canvas = G_vmlCanvasManager.initElement(fixElement_(this.canvas));
			
			// create flash loader for IE
			if($('#alphaTabFlashLoaderContainer').length == 0)
			{
				$('<div id="alphaTabFlashLoader"></div>').appendTo('body');
				swfobject.embedSWF(this.options.base + '/' + loaderSwf, 'alphaTabFlashLoader', '0', '0', '9.0', '#FFFFFF');
			}
		}

        // create tablature
        this.tablature = new net.alphatab.tablature.Tablature(this.canvas, this.options.error);
        this.tablature.autoSizeWidth = this.options.autoSize;
        this.tablature.updateScale(this.options.zoom);

        // load data
        if(this.options.file)
        {
			this.loadFile(this.options.file);
		}
        else if(this.contents != "")
        {
            this.loadAlphaTex(this.contents);
        }
    }
    
    // Plugin Support    
    alphaTab.fn = alphaTab.prototype;
    //
    // Plugin
    //
    $.fn.alphaTab = function(options)
    {
		var ret = [];
		for(var i=0; i<this.length; i++)
        {
			if(!this[i].alphaTab)
            {
				this[i].alphaTab = new alphaTab(this[i], options);
			}
			ret.push(this[i].alphaTab);
		}
		return ret.length > 1 ? ret : ret[0];
    }
})(jQuery);