(function($) {
 
   $.fn.alphaTab = function(options) {
     var defaults = {
		 file: null,
		 loadCallback: null,
		 errorCallback: null,
		 error: "Load a file to display the tablature",
		 track: 0,
		 factory: new net.alphatab.tablature.model.SongFactoryImpl(),
		 
		 zoom: 1.1,
		 width:600,
		 height:200,
		 autoSize: true,
		 
		 editor: false,
		 
		 language: {play: "Play", pause: "Pause", stop: "Stop"},
		 player: false,
		 caret: true,
		 autoscroll: true,
		 playerPath: 'alphaTab.jar',
		 flashLoaderPath: 'flashLoader.swf',
		 playerTickCallback: null
	};
 
	var options = $.extend(defaults, options); 
	
 
	var apis = new Array();
	this.each(function() {
		var container = $(this);
		
		var contents = $.trim(container.text());
		container.text("");
		apis.push(container);
		// create tablature
		var canvas = $('<canvas width="'+options.width+'" height="'+options.height+'" class="alphaTabSurface"></canvas>');
		container.append(canvas);
		container.canvas = canvas;
		
		// check for IE 
		if($.browser.msie) {
			canvas = $(G_vmlCanvasManager.fixDynamicElement(canvas[0]));
		}
		
		// create hidden flashloader
		/*if($('#alphaTabFlashLoaderContainer').length == 0)
		{
		var flashLoader = $('<div id="alphaTabFlashLoaderContainer"></div>');
		container.append(flashLoader);
		var flashvars = {
		};
		var params = {
		menu: "false",
		scale: "noScale",
		allowFullscreen: "false",
		allowScriptAccess: "always",
		bgcolor: "#FFFFFF",
		swliveconnect: "true"
		};
		var attributes = {
		id:"alphaTabFlashLoader"
		};
		swfobject.embedSWF(options.flashLoaderPath, "alphaTabFlashLoaderContainer", "50px", "50px", "9.0.0", "expressInstall.swf", flashvars, params, attributes);
		}*/

		container.options = options;
		container.tablature = new net.alphatab.tablature.Tablature(canvas[0], options.error);
		container.tablature.autoSizeWidth = options.autoSize;
		container.tablature.updateScale(options.zoom);
				
		var setPlayerData = function(data) {
			if(!options.player)return;
			if(container.player.updateSongData) {
				container.player.updateSongData(data);
				$(container.playerControls).find('input').attr('disabled', false);
			}
			else {
				// disable buttons within playercontrols
				$(container.playerControls).find('input').attr('disabled', true);
				// TODO: this doesn't work.
				setTimeout("setPlayerData('"+data+"')", 500);
			}
		}
		
		var loadTablature = function(data) {
			try
			{
				var parser = new net.alphatab.file.alphatex.AlphaTexParser();
				var reader = new net.alphatab.platform.BinaryReader();
				container.tablature.isError = false;
				reader.initialize(data);
				parser.init(reader, options.factory);
				var song = parser.readSong();
				if(options.loadCallback)
					options.loadCallback(song);
				container.tablature.setTrack(song.tracks[0]);
				
				if(container.player)  {
					var songData = net.alphatab.midi.MidiDataProvider.getSongMidiData(song, options.factory);
					setPlayerData(songData);
					container.updateCaret(0);
				}
			}
			catch(e) 
			{
				var err;
				if(e instanceof net.alphatab.file.FileFormatException)
				{
					err = e.message;
				}
				else
				{
					err = e;
				}
				container.tablature.isError = true;
				container.tablature.updateDisplay = true;
				container.tablature.errorMessage = err;
				container.tablature.invalidate();
			}
		}
		
				
		// create load function 
		container.loadFile = function(url) {
			try
			{
				net.alphatab.file.SongLoader.loadSong(url, options.factory, function(song) {
					container.tablature.setTrack(song.tracks[options.track]);
					if(container.player)  {
						var songData = net.alphatab.midi.MidiDataProvider.getSongMidiData(song, options.factory);
						setPlayerData(songData);
						container.updateCaret(0);
					}
					
					if(options.loadCallback)
						options.loadCallback(song);
				});
			}
			catch(e)
			{
				var err;
				if(e instanceof net.alphatab.file.FileFormatException)
				{
					err = e.message;
				}
				else
				{
					err = e;
				}
				if(options.errorCallback)
					options.errorCallback(err);
			}	
		}
		
		// create editor
		if(options.editor) 
		{
			var editorArea = $('<textarea class="codeEditor">' + contents + '</textarea>');
			container.append($('<br />'));
			container.append(editorArea);
			// size textarea
			var str = editorArea.html(); // val() will remove newlines on IE
			var cols = editorArea[0].cols;
			var linecount = 0;
			$( str.split( "\n" ) ).each( function( i, l ) {
				linecount ++; // take into account long lines
			} );
			editorArea[0].rows = linecount;

			container.editor = editorArea;
			editorArea.keyup(function() {
				loadTablature(editorArea.val());
			});
			editorArea.keyup();
		}
		else if(contents != "")
		{
			loadTablature(contents);	
		}
		
		
		// create player
		if(options.player)
		{
			var playerControls = $('<div class="playerControls"></div>');
			var playButton = $('<input type="button" class="play" value="'+options.language.play+'" />');
			var pauseButton = $('<input type="button" class="pause" value="'+options.language.pause+'" />');
			var stopButton = $('<input type="button" class="stop" value="'+options.language.stop+'" />');
			var metronomeCheck = $('<input type="checkbox" class="metronome" checked="checked" />');
			var param = options.playerTickCallback ? '<param name="onTickChanged" value="' + options.playerTickCallback + '" />' : ''; 
			var applet = $('<applet height="0" width="0"  archive="'+options.playerPath+'" code="net.alphatab.midi.MidiPlayer.class">'+param+'</applet>');
			container.player = applet[0];
			container.playerControls = playerControls[0];
			playerControls.append(playButton);
			playerControls.append(pauseButton);
			playerControls.append(stopButton);			
			playerControls.append(metronomeCheck);			
			playerControls.append($('<span>Metronome</span>'));			
			playerControls.append(applet);			
			container.append(playerControls);
			$(playerControls).find('input').attr('disabled', true);

			
			// hook up events
			playButton.click(function() {
				container.player.play();
			});
			pauseButton.click(function() {
				container.player.pause();
			});
			stopButton.click(function() {
				container.player.stop();
			});
			metronomeCheck.change(function() {
				var enabled = metronomeCheck.attr('checked') ? true : false;
				container.player.setMetronomeEnabled(enabled);
			});
			
					
			// create caret
			if(options.caret) {
				var measureCaret = $('<div class="measureCaret"></div>');
				container.append(measureCaret);
				var beatCaret = $('<div class="beatCaret"></div>');
				container.append(beatCaret);
				
				container.updateCaret = function(tickPos) {
					setTimeout(function(){
						container.tablature.notifyTickPosition(tickPos);
					}, 1);
				}
				
				container.tablature.onCaretChanged = function(beat)
				{
					var x = canvas.offset().left;
					var y = canvas.offset().top;

					y += beat.measureImpl().posY;
					
					
					measureCaret.offset({ top: y, left: x + beat.measureImpl().posX});
					measureCaret.width(beat.measureImpl().width + beat.measureImpl().spacing);
					measureCaret.height(beat.measureImpl().height());
					
					beatCaret.offset({top: y, left: x + beat.getRealPosX(container.tablature.viewLayout) + 7});
					beatCaret.width(3);
					beatCaret.height(measureCaret.height());
					
					if(beat.measureImpl().isFirstOfLine && options.autoscroll)
					{
						window.scrollTo(0, y - 30);
					}
				}
			}
		}
		// load file
		if(options.file) {
			container.loadFile(options.file);
		}
    });
	return apis;
   };
 
 })(jQuery);
