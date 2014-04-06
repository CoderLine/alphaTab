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
    var api = {};

    function buildTracksArray(value, score) {
        var tracks = [];

        // custom array
        if ($.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                if (value[i] >= 0 && value[i] < score.tracks.length)
                    tracks.push(score.tracks[value[i]]);
            }
        }
            // single value
        else if ($.isNumeric(value) && value >= 0 && value < score.tracks.length) {
            tracks.push(score.tracks[value]);
        }
            // all tracks
        else if ($.isNumeric(value) && value == -1) {
            for (var i = 0; i < score.tracks.length; i++) {
                tracks.push(score.tracks[i]);
            }
        }
            // default
        else {
            tracks.push(score.tracks[0]);
        }
        return tracks;
    }

    function scoreLoaded(context, score) {
        try {
            if (context.trigger) context.trigger('loaded', score);
            else if (context.element) $(context.element).trigger('loaded', score);
            context.renderer.renderMultiple(buildTracksArray(context.settings.tracks, score));
        }
        catch (e) {
            $.error(e);
        }
    }

    /*
     * alphaTab initialization
     */
    function init(options) {
        return this.each(function () {
            // check for reinitialize
            var $this = $(this),
                data = $this.data('alphaTab');
            if (!data) {
                //
                // Settings
                var context = {};
                context.element = this;

                context.settings = AlphaTab.Settings.fromJson(options);
                if (options && options.tracks) context.settings.tracks = options.tracks;
                else if ($this.data('tracks')) {
                    try {
                        var data = $this.data('tracks');
                        if ($.isArray(data)) {
                            context.settings.tracks = data;
                        }
                        else {
                            context.settings.tracks = parseInt(data);
                        }
                    }
                    catch (e) {
                        context.settings.tracks = 0;
                    }
                }
                else {
                    context.settings.tracks = 0;
                }

                var contents = $.trim($this.text());
                $this.html('');

                //
                // Create context elements (wrapper, canvas etc)
                if (context.settings.engine == "html5" || context.settings.engine == "default") {
                    // HACK: call createElement('canvas') once before. this ensures that the browser knows the element
                    document.createElement('canvas');
                    context.canvas = $(document.createElement('canvas'));
                    $(context.canvas).attr("width", context.settings.width)
                     .attr("height", context.settings.height)
                     .addClass("alphaTabSurface");
                    $this.append(context.canvas);
                    context.canvas = context.canvas[0];

                    var ie = AlphaTab.Platform.JavaScript.JsFileLoader.getIEVersion();
                    if (ie >= 0 && ie < 9) {
                        var fixElement_ = function (el) {
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

                        context.canvas = G_vmlCanvasManager.initElement(fixElement_(context.canvas));
                    }
                }
                else {
                    context.canvas = $('<div class="alphaTabCanvasWrapper"></div>');
                    $this.append(context.canvas);
                }



                //
                // Renderer setup
                context.renderer = new AlphaTab.Rendering.ScoreRenderer(context.settings, context.canvas);
                context.renderer.add_renderFinished(function () {
                    $this.trigger('rendered');
                });
                // in case of SVG we hook into the renderer to create the svg element after rendering
                if (context.settings.engine == "svg") {
                    context.renderer.add_renderFinished(function () {
                        var canvas = context.renderer.canvas;
                        context.canvas[0].innerHTML = canvas.toSvg(true, "alphaTabSurface");
                    });
                }

                $this.data('alphaTab', context);

                //
                // Load default data
                if (contents != "") {
                    api.tex.apply(this, [contents]);
                }
                else if ($this.data('file') != '' && $this.data('file') != null) {
                    AlphaTab.Importer.ScoreLoader.loadScoreAsync($this.data('file'),
                    function (score) {
                        scoreLoaded(context, score);
                    },
                    function (error) {
                        $.error(error);
                    });
                }
            }
        });
    }

    /*
     * Open alphaTab file
     * @param {String} url the url to load the data via ajax
     * @param {Array} tracks the track indices to load initially 
     * @param {Function} success the callback function to call after successful track display
     * @param {Function} error the callback function to call after any error during loading or rendering
     */
    function load(url, tracks, success, error) {
        var context = $(this).data('alphaTab');
        if (!context) { $.error('alphaTab not initialized!'); }
        AlphaTab.Importer.ScoreLoader.loadScoreAsync(url,
        function (score) {
            scoreLoaded(context, score);
        },
        function (error) {
            $.error(error);
        });
    }

    /**
     * Load alphaTex source
     * @param {String} content the alphaTex source code to load
     * @param {Function} success the callback function to call after successful track display
     * @param {Function} error the callback function to call after any error during loading or rendering
     */
    function tex(content, success, error) {
        var context = $(this).data('alphaTab');
        if (!context) { $.error('alphaTab not initialized!'); }

        var score = null;
        try {
            var parser = new AlphaTab.Importer.AlphaTexImporter();
            var data = new AlphaTab.IO.StringStream(content);
            parser.init(data);
            score = parser.readScore();
        }
        catch (e) {
            $.error(e);
        }

        if (score != null) {a
            scoreLoaded(context, score);
        }
    }

    /**
     * Switches the displayed track of the currently loaded song
     * @param {Number} track the index of the track to display
     */
    function tracks(tracks) {
        var context = $(this).data('alphaTab');
        if (tracks) {
            if (context.renderer.tracks == null || context.renderer.tracks.length == 0)
                return;

            var score = context.renderer.tracks[0].score;
            var realTracks = buildTracksArray(tracks, score);

            try {
                context.renderer.renderMultiple(realTracks);
            }
            catch (e) {
                if (e instanceof Error) throw e;
                else $.error(e);
            }
        }
        else {
            return context.renderer.tracks;
        }
    }

    /**
     * Get the currently loaded score
     */
    function score() {
        var context = $(this).data('alphaTab');
        if (context.renderer.tracks == null || context.renderer.tracks.length == 0)
            return null;
        return context.renderer.tracks[0].score;
    }

    /**
     * Get the ScoreRenderer used for display
     */
    function renderer() {
        var context = $(this).data('alphaTab');
        return context.renderer;
    }

    // expose API
    api.init = init;
    api.load = load;
    api.tex = tex;
    api.tracks = tracks;
    api.score = score;
    api.renderer = renderer;

    $.fn.alphaTab = function (method) {
        if (api[method]) {
            return api[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return api.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.alphaTab');
        }
    };
    $.fn.alphaTab.fn = api;

    $.alphaTab = {
        restore: function (selector) {
            $(selector).empty().removeData('alphaTab');
        }
    };

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