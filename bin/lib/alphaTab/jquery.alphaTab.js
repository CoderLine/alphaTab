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

        var defaults =
        {
            // core,
            factory: new net.alphatab.tablature.model.SongFactoryImpl(),

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
            playerPath: 'alphaTab.jar',
            playerTickCallback: null,
            createControls: true,
            caret: true,
            measureCaretColor: '#FFF200',
            beatCaretColor: '#4040FF',
            autoScroll: true,
            language: {play: "Play", pause: "Pause", stop: "Stop"}
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

				reader.initialize(data);
				parser.init(reader, options.factory);

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
				net.alphatab.file.SongLoader.loadSong(url, options.factory, songLoaded);
			}
			catch(e)
			{
                updateError(e);
			}
        }

        // player
        if(options.player)
        {
            this.updatePlayer = function(song)
            {
                var songData = net.alphatab.midi.MidiDataProvider.getSongMidiData(song, options.factory);
                if(self.player.updateSongData)
                {
                    self.player.updateSongData(songData);
                    $(self.playerControls).find('input').attr('disabled', false);
                }
                self.updateCaret(0);
            }

            this.updateCaret = function(tickPos)
            {
                setTimeout(function(){
                    self.tablature.notifyTickPosition(tickPos);
                }, 1);
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
                msg = e.message;

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

        // create canvas
        this.canvas = $('<canvas width="'+options.width+'" height="'+options.height+'" class="alphaTabSurface"></canvas>');
		el.append(this.canvas);
		this.canvas = this.canvas[0];
		if($.browser.msie && G_vmlCanvasManager)
        {
			this.canvas = $(G_vmlCanvasManager.fixDynamicElement(this.canvas));
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
			var applet = $('<applet height="0" width="0"  archive="'+options.playerPath+'" code="net.alphatab.midi.MidiPlayer.class">'+param+'</applet>');
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
                playerControls.append($('<span>Metronome</span>'));

                // hook up events
                playButton.click(function() 
                {
                    self.player.play();
                });
                pauseButton.click(function() 
                {
                    self.player.pause();
                });
                stopButton.click(function() 
                {
                    self.player.stop();
                });
                metronomeCheck.change(function() 
                {
                    var enabled = metronomeCheck.attr('checked') ? true : false;
                    self.player.setMetronomeEnabled(enabled);
                });
            }

            // create carets
            if(options.caret)
            {
				var measureCaret = $('<div class="measureCaret"></div>');
				var beatCaret = $('<div class="beatCaret"></div>');
                // set styles
                measureCaret.css({ 'opacity' : 0.25, 'position' : 'absolute' });
                beatCaret.css({ 'opacity' : 0.75, 'position' : 'absolute' });
                measureCaret.width(0);
                beatCaret.width(0);
                measureCaret.height(0);
                beatCaret.height(0);
				el.append(measureCaret);
				el.append(beatCaret);
            }

            this.tablature.onCaretChanged = function(beat)
            {
                var x = $(self.canvas).offset().left;
                var y = $(self.canvas).offset().top;

                y += beat.measureImpl().posY;


                measureCaret.offset({ top: y, left: x + beat.measureImpl().posX});
                measureCaret.width(beat.measureImpl().width + beat.measureImpl().spacing);
                measureCaret.height(beat.measureImpl().height());

                beatCaret.offset({top: y, left: x + beat.getRealPosX(self.tablature.viewLayout) + 7});
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