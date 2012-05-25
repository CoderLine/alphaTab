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
var alphaTabWrapper;

/** 
 * This is a jQuery plugin for embedding alphaTab in your websites. 
 */
(function($)
{
	
	
    alphaTabWrapper = function(el, options)
    {
        //
        // Setup
        //
        var self = this;
        var el = $(el);
        this.el = el;
		
		// resolve absolute script path
		var alphaTabTag = $('script[src*="/alphaTab.js"]');
		if(alphaTabTag.length == 0) // also try min-version
			alphaTabTag = $('script[src*="/alphaTab.min.js"]');

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
            zoom: 1.1,
            width:600,
            height:200,
            autoSize: true,
            staves: null,
            layout: null,
			context: "canvas"
        };

        this.options = $.extend(defaults, options);
        if(this.options.autoSize == "maxWidth") 
		{
            this.options.width = el.width();
        }

        //
        // public operations (API)
        //

        this.loadAlphaTex = function(tex)
        {
			try
			{
				var parser = new alphatab.importer.AlphaTexImporter();
				var data = new haxe.io.BytesInput(haxe.io.Bytes.ofString(tex));
				parser.init(data);
                var score = parser.readScore();
				scoreLoaded(score);
			}
			catch(e)
			{
                scoreError(e);
			}
        }		

        this.loadFile = function(url)
        {
            try
			{
				alphatab.importer.ScoreLoader.loadScoreAsync(url, scoreLoaded, scoreError);
			}
			catch(e)
			{
                scoreError(e);
			}
        }

        // plugin callbacks on load
        this.loadCallbacks = []; 
        
        //
        // private operations
        //
        var scoreLoaded = function(score)
        {
            // fire callback
            if(self.options.loadCallback)
            {
				self.options.loadCallback(score);
			}
            // update tablature
			try
			{
				self.renderer.render(score.tracks[self.options.track]);
			}
			catch( e )
			{
				scoreError(e);
			}
            // additional plugin callbacks
            for(var i = 0; i < self.loadCallbacks.length; i++)
            {
                self.loadCallbacks[i](score);
            }
        }
        
        
        var scoreError = function(msg)
        {
            // use error callback if available, otherwise: render in tablature
            if(self.options.errorCallback)
            {
                self.options.errorCallback(msg);
            }
            else
            {
                console.error(msg);
            }
        }


		var createCanvas = function() 
		{
			// create canvas
			// HACK: call createElement('canvas') once before. this ensures that the browser knows the element
			document.createElement('canvas'); 
			self.canvas = $('<canvas width="'+self.options.width+'" height="'+self.options.height+'" class="alphaTabSurface"></canvas>');
			self.el.append(self.canvas);
			self.canvas = self.canvas[0];
			if($.browser.msie) 
			{
				// Excanvas initialization
				if($.browser.version < 9)
				{
					var fixElement_ = function(el) 
					{
					   // in IE before version 5.5 we would need to add HTML: to the tag name
					   // but we do not care about IE before version 6
					   var outerHTML = el.outerHTML;
					 
					   var newEl = el.ownerDocument.createElement(outerHTML);
					   // if the tag is still open IE has created the children as siblings and
					   // it has also created a tag with the name "/FOO"
					   if (outerHTML.slice(-2) != "/>") 
					   {
							 var tagName = "/" + el.tagName;
							 var ns;
							 // remove content
							 while ((ns = el.nextSibling) && ns.tagName != tagName) 
							 {
							   ns.removeNode();
							 }
							 // remove the incorrect closing tag
							 if (ns) 
							 {
							   ns.removeNode();
							 }
					   }
					   el.parentNode.replaceChild(newEl, el);
					   return newEl;
					};
					
					self.canvas = G_vmlCanvasManager.initElement(fixElement_(self.canvas));
				}
			}
			
            self.canvasWrapper = self.canvas;
			return self.canvas;
		}
        
        var createCanvasWrapper = function() 
		{
            self.canvasWrapper = $('<div class="alphaTabCanvasWrapper"></div>');
            self.canvas = self.canvasWrapper;
            self.el.append(self.canvasWrapper);               
        }
		
        //
        // startup
        //
        
        this.contents = $.trim(el.text());
		el.html('');
		
		// create context
		var contextObject = null;
 		if(this.options.context == "canvas") 
		{
			contextObject = createCanvas();
		}
		else 
		{
            createCanvasWrapper();
			contextObject = this.options.context;
		}	
        
        // create renderer
        this.renderer = new alphatab.rendering.ScoreRenderer(contextObject);

		if(this.options.context == alphatab.platform.PlatformFactory.SVG_CANVAS) 
		{
			this.renderer.onFinished = function() 
			{
				self.canvasWrapper.children().remove(); // remove old svg 
				var canvas = self.renderer.canvas;
				var svgElement = $(canvas.toSvg(true, "alphaTabSurface"));
                self.canvas = svgElement;
				self.canvasWrapper.append(svgElement);
			}
		}
        
        // load data
        if(this.options.file)
        {
			this.loadFile(this.options.file);
		}
        else if(this.contents != "")
        {
            this.loadAlphaTex(this.contents);
        }
        else if(this.options.context == alphatab.platform.PlatformFactory.SVG_CANVAS)
        {
            // ensure notify of error message
            var canvas = this.renderer.canvas;
            canvas.setWidth(this.options.width);
            canvas.setHeight(this.options.height);
            this.renderer.onFinished();
        }
    }
    
    // Plugin Support    
    alphaTabWrapper.fn = alphaTabWrapper.prototype;
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
				this[i].alphaTab = new alphaTabWrapper(this[i], options);
			}
			ret.push(this[i].alphaTab);
		}
		return ret.length > 1 ? ret : ret[0];
    }
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