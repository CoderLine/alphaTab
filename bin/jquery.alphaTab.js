(function($) {
 
   $.fn.alphaTab = function(options) {
     var defaults = {
		 file: null,
		 loadCallback: null,
		 errorCallback: null,
		 error: "Load a file to display the tablature",
		 track: 0,
		 factory: new net.alphatab.tablature.model.GsSongFactoryImpl(),
		 
		 zoom: 1.1,
		 width:600,
		 height:200,
		 
		 editor: false,
		 
		 language: {play: "Play", pause: "Pause", stop: "Stop"},
		 player: false,
		 caret: true,
		 autoscroll: true,
		 playerPath: 'alphaTab.jar',
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
		
		// check for excanvas 
		if($.browser.msie) {
			canvas = $(G_vmlCanvasManager.fixDynamicElement(canvas[0]));
		}
		
		container.tablature = new net.alphatab.tablature.Tablature(canvas[0], options.error);
		container.tablature.UpdateScale(options.zoom);
				
		var setPlayerData = function(data) {
			if(!options.player)return;
			if(container.player.updateSongData) {
				container.player.updateSongData(data);
				$(container.playerControls).find('input').attr('disabled', false);
			}
			else {
				// disable buttons within playercontrols
				$(container.playerControls).find('input').attr('disabled', true);
				setTimeout(setPlayerData(data), 500);
			}
		}
		
		var loadTablature = function(data) {
			try
			{
				var parser = new net.alphatab.file.alphatab.AlphaTabParser();
				var reader = new net.alphatab.platform.BinaryReader();
				container.tablature.IsError = false;
				reader.initialize(data);
				parser.Init(reader, options.factory);
				var song = parser.ReadSong();
				if(options.loadCallback)
					options.loadCallback(song);
				container.tablature.SetTrack(song.Tracks[0]);
				
				if(container.player)  {
					var songData = net.alphatab.midi.MidiDataProvider.GetSongMidiData(song, options.factory);
					setPlayerData(songData);
					container.updateCaret(0);
				}
			}
			catch(e) 
			{
				var err;
				if(e instanceof net.alphatab.file.FileFormatException)
				{
					err = e.Message;
				}
				else
				{
					err = e;
				}
				container.tablature.IsError = true;
				container.tablature.UpdateDisplay = true;
				container.tablature.ErrorMessage = err;
				container.tablature.Invalidate();
			}
		}
		
				
		// create load function 
		container.loadFile = function(url) {
			try
			{
				if($.browser.msie) {
					alert("Warning: Internet Explorer doesn't support GuitarPro file loading. Please use a browser like Firefox or Chrome");
				}
				net.alphatab.file.SongLoader.LoadSong(url, options.factory, function(song) {
					container.tablature.SetTrack(song.Tracks[options.track]);
					if(container.player)  {
						var songData = net.alphatab.midi.MidiDataProvider.GetSongMidiData(song, options.factory);
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
					err = e.Message;
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
						container.tablature.NotifyTickPosition(tickPos);
					}, 1);
				}
				
				container.tablature.OnCaretChanged = function(beat)
				{
					var x = canvas.offset().left;
					var y = canvas.offset().top;

					y += beat.MeasureImpl().PosY;
					
					
					measureCaret.offset({ top: y, left: x + beat.MeasureImpl().PosX});
					measureCaret.width(beat.MeasureImpl().Width + beat.MeasureImpl().Spacing);
					measureCaret.height(beat.MeasureImpl().Height());
					
					beatCaret.offset({top: y, left: x + beat.GetRealPosX(container.tablature.ViewLayout) + 7});
					beatCaret.width(3);
					beatCaret.height(measureCaret.height());
					
					if(beat.MeasureImpl().IsFirstOfLine && options.autoscroll)
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
