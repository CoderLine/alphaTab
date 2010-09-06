var alphaTab;

(function($)
{
    alphaTab = function(el, options)
    {
        //
        // Setup
        //
        var self = this;
        var el = $(el);
        var factory = new net.alphatab.tablature.model.SongFactoryImpl();
		var playerJar = 'alphaTab.jar';
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
            autoSize: true,
			

            // additional feature - editor
            editor: false,

            // additional feature - player
            player: false,
            playerTickCallback: null,
            createControls: true,
            caret: true,
            measureCaretColor: '#FFF200',
            measureCaretOpacity: 0.25,
            beatCaretColor: '#4040FF',
            beatCaretOpacity: 0.75,
            autoScroll: true,
            language: {play: "Play", pause: "Pause", stop: "Stop", metronome: "Metronome"}
        };

        var options = $.extend(defaults, options);

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
				parser.init(reader, factory);

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
				net.alphatab.file.SongLoader.loadSong(url, factory, songLoaded);
			}
			catch(e)
			{
                updateError(e);
			}
        }

        // player
        if(options.player)
        {
            if(!navigator.javaEnabled()) {
                alert('Java is not supported by your browser. The player is not available');
                options.player = false;
            }
            else
            {            
                this.updatePlayer = function(song)
                {
                    var songData = net.alphatab.midi.MidiDataProvider.getSongMidiData(song, factory);
                    if(self.player.updateSongData)
                    {
                        self.player.updateSongData(songData);
                        $(self.playerControls).find('input').attr('disabled', false);
                        self.updateCaret(0);
                    }
                    else
                    {
                        // TODO: repeat loading 3 times and then show a loading error. 
                    }
                }

                this.updateCaret = function(tickPos)
                {
                    setTimeout(function(){
                        self.tablature.notifyTickPosition(tickPos);
                    }, 1);
                }
            }            
        }

        //
        // private operations
        //

        var songLoaded = function(song)
        {
            // fire callback
            if(options.loadCallback)
                options.loadCallback(song);
            // update tablature
            self.tablature.setTrack(song.tracks[options.track]);
            // update player
            if(options.player)
            {
                self.updatePlayer(song);
            }
        }

        var updateError = function(msg)
        {
            if(msg instanceof net.alphatab.file.FileFormatException)
                msg = msg.message;

            // use error callback if available, otherwise: render in tablature
            if(options.errorCallback)
            {
                options.errorCallback(msg);
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
        
        var contents = $.trim(el.text());
		el.html('');
        // create canvas
		// HACK: call createElement('canvas') once before. this ensures that the browser knows the element
		document.createElement('canvas'); 
        this.canvas = $('<canvas width="'+options.width+'" height="'+options.height+'" class="alphaTabSurface"></canvas>');
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
				swfobject.embedSWF(options.base + '/' + loaderSwf, 'alphaTabFlashLoader', '0', '0', '9.0', '#FFFFFF');
			}
		}

        // create tablature
        this.tablature = new net.alphatab.tablature.Tablature(this.canvas, options.error);
        this.tablature.autoSizeWidth = options.autoSize;
        this.tablature.updateScale(options.zoom);
        
        // editor
        if(options.editor)
        {
			var editorArea = $('<textarea class="alphaTexEditor">' + contents + '</textarea>');
			el.append($('<br />'));
			el.append(editorArea);

            // size textarea
			var str = editorArea.html();
			var cols = editorArea[0].cols;
			var linecount = 0;
			$( str.split( "\n" ) ).each( function( i, l ) 
            {
				linecount++; // take into account long lines
			});
			editorArea[0].rows = linecount;
            this.editor = editorArea;
			editorArea.keyup(function() 
            {
				self.loadAlphaTex(editorArea.val());
			});
        }
        
        // player
        if(options.player)
        {
            // create applet
            var playerControls = $('<div class="player"></div>');
			var param = options.playerTickCallback ? '<param name="onTickChanged" value="' + options.playerTickCallback + '" />' : '';
			var applet = $('<applet height="0" width="0"  archive="' + options.base + "/" + playerJar + '" code="net.alphatab.midi.MidiPlayer.class">'+param+'</applet>');
			this.playerControls = playerControls[0];
			this.player = applet[0];
			playerControls.append(applet);
            el.append(playerControls);

            // create controls
            if(options.createControls)
            {
                var playButton = $('<input type="button" class="play" value="'+options.language.play+'" />');
                var pauseButton = $('<input type="button" class="pause" value="'+options.language.pause+'" />');
                var stopButton = $('<input type="button" class="stop" value="'+options.language.stop+'" />');
                var metronomeCheck = $('<input type="checkbox" class="metronome" checked="checked" />');

                playerControls.append(playButton);
                playerControls.append(pauseButton);
                playerControls.append(stopButton);
                playerControls.append(metronomeCheck);
                playerControls.append($('<span>'+options.language.metronome+'</span>'));

                // hook up events
                playButton.click(function() 
                {
                    if(self.player.play)
                        self.player.play();
                    else
                        alert("The player has not loaded yet.");
                });
                pauseButton.click(function() 
                {
                    if(self.player.pause)
                        self.player.pause();
                    else
                        alert("The player has not loaded yet.");
                });
                stopButton.click(function() 
                {
                    if(self.player.stop)
                        self.player.stop();
                    else
                        alert("The player has not loaded yet.");
                });
                metronomeCheck.change(function() 
                {
                    if(self.player.setMetronomeEnabled)
                    {
                        var enabled = metronomeCheck.attr('checked') ? true : false;
                        self.player.setMetronomeEnabled(enabled);
                    }
                    else
                    {
                        alert("The player has not loaded yet.");
                    }
                });
            }

            // create carets
            if(options.caret)
            {
				var measureCaret = $('<div class="measureCaret"></div>');
				var beatCaret = $('<div class="beatCaret"></div>');
                // set styles
                measureCaret.css({ 'opacity' : options.measureCaretOpacity, 'position' : 'absolute', background: options.measureCaretColor });
                beatCaret.css({ 'opacity' : options.beatCaretOpacity, 'position' : 'absolute', background: options.beatCaretColor });
                measureCaret.width(0);
                beatCaret.width(0);
                measureCaret.height(0);
                beatCaret.height(0);
				el.append(measureCaret);
				el.append(beatCaret);
            }

            this.tablature.onCaretChanged = function(beat)
            {
                var x = $(self.canvas).offset().left + parseInt($(self.canvas).css("borderLeftWidth"), 10) ;
                var y = $(self.canvas).offset().top;

                y += beat.measureImpl().posY;


                measureCaret.offset({ top: y, left: x + beat.measureImpl().posX});
                measureCaret.width(beat.measureImpl().width + beat.measureImpl().spacing);
                measureCaret.height(beat.measureImpl().height());

                beatCaret.offset({top: y, left: x + beat.getRealPosX(self.tablature.viewLayout)});
                beatCaret.width(3);
                beatCaret.height(measureCaret.height());

                if(beat.measureImpl().isFirstOfLine && options.autoScroll)
                {
                    window.scrollTo(0, y - 30);
                }
            }
        }
        
        // load data
        if(options.file)
        {
			this.loadFile(options.file);
		}
        else if(contents != "")
        {
            this.loadAlphaTex(contents);
        }
    }

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