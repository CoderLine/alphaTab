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

/**
 * This is a plugin which extends alphaTab with a java midi player.
 */
(function($, alphaTabWrapper)
{
    alphaTabWrapper.fn.player = function(playerOptions) {
        var playerJar = 'alphaTab.jar';
        var self = this;
        var defaults = {
            player: false,
            playerTickCallback: null,
            createControls: true,
            caret: true,
            measureCaretColor: '#FFF200',
            measureCaretOpacity: 0.25,
            caretOffset: {x: 0, y: 0},
            beatCaretColor: '#4040FF',
            beatCaretOpacity: 0.75,
            autoScroll: true,
            scrollElement: 'html, body',
            scrollAdjustment: 0,
            language: {play: "Play", pause: "Pause", stop: "Stop", metronome: "Metronome", scrollToTop: "Scroll To Top ^", tablatureLoading: "Loading..."}
        };
		self.lastTickPos = 0;
		
        var playerOptions = $.extend(defaults, playerOptions);
        
        if(!navigator.javaEnabled()) {
            alert('Java is not supported by your browser. The player is not available');
            return this;
        } 
          
        //
        // API Functions
        //        
        this.updatePlayer = function(song)
        {
            var songData = alphatab.midi.MidiDataProvider.getSongMidiData(song, self.factory, self.tablature.viewLayout._map);
            if(self.midiPlayer.updateSongData)
            {
                self.midiPlayer.updateSongData(songData);
                $(self.playerControls).find('input').attr('disabled', false);
                self.updateCaret(0);
                var tracks = $('#tracks');
    			tracks.find('option').remove();
    			for(var i = 0; i < song.tracks.length; i++) 
    			{
    				var name = song.tracks[i].name == "" ? "Track " + i : song.tracks[i].name;
    				var elm = $('<option value="'+i+'">'+name+'</option>');
    				if(i == 0)
    				{
    					elm.attr("selected", "selected");
    				}	
    				tracks.append(elm);
    			}
            }
            else
            {
                // TODO: repeat loading only 3 times and then show a loading error. 
                setTimeout(function() {
                    self.updatePlayer(song);
                }, 1000);
            }
        }
        
        this.loadCallbacks.push(this.updatePlayer);

        this.updateCaret = function(tickPos,forced,scroll)
        {
        	self.lastTickPos=tickPos;
        	forced=forced===true;
        	scroll=!(scroll===false);
            setTimeout(function(){
                    self.tablature.notifyTickPosition(tickPos,forced,scroll);
                }, 1);
        }
        
        // 
        // Create UI
        //
        // create applet
        
        var param = playerOptions.playerTickCallback ? '<param name="onTickChanged" value="' + playerOptions.playerTickCallback + '" />' : '';
        var applet = $('<applet height="0" width="0"  archive="' + this.options.base + "/" + playerJar + '" code="net.alphatab.midi.MidiPlayer.class">'+param+'</applet>');
        this.midiPlayer = applet[0];
        
        // Sets the player to the start of the measure clicked
        $(this.canvas).click(function(e)
        	{
        		var offsets=$(this).offset();
			    var x = e.pageX - offsets.left;
			    var y = e.pageY - offsets.top;
				var measure=self.tablature.viewLayout.getMeasureAt(x,y);
				if(measure!=null) {
					var tick = 960 + measure.start();
					self.midiPlayer.goTo(tick);
					self.updateCaret(tick,true,false);
				}
        	}
        );
        
        this.el.append(applet);
        
        // create controls
        if(playerOptions.createControls)
        {
        	var playerControls = $('<div class="player"></div>');
        	this.el.append(playerControls);
             
            var playButton = $('<button class="play">'+playerOptions.language.play+'</button>');
            var pauseButton = $('<button class="pause">'+playerOptions.language.pause+'</button>');
            var metronomeCheck = $('<input type="checkbox" class="metronome" />');
            var returnToTop = $('<button class="to-top">'+playerOptions.language.scrollToTop + '</button>');
            
            var trackSelect = $('<select id="tracks"><option value="">'+playerOptions.language.tablatureLoading+'</option></select>');
            
            playerControls.append(trackSelect);
            
            playerControls.append(playButton);
            playerControls.append(pauseButton);
            playerControls.append(returnToTop);
            
            playerControls.append($('<span>'+playerOptions.language.metronome+'</span>'));
            playerControls.append(metronomeCheck);
            
            // hook up events
            returnToTop.click(function(){
				$(playerOptions.scrollElement).animate({scrollTop:0}, 'slow');
			});
            
            playButton.click(function() 
            {
                if(self.midiPlayer.play) {
					metronomeCheck.change();
					self.midiPlayer.play();
                }
                else
                    alert("The player has not loaded yet.");
                    
                    
            });
            pauseButton.click(function() 
            {
                if(self.midiPlayer.pause)
                    self.midiPlayer.pause();
                else
                    alert("The player has not loaded yet.");
            });
            metronomeCheck.change(function() 
            {
                if(self.midiPlayer.setMetronomeEnabled)
                {
                    var enabled = metronomeCheck.attr('checked') ? true : false;
                    self.midiPlayer.setMetronomeEnabled(enabled);
                }
                else
                {
                    alert("The player has not loaded yet.");
                }
            });
        	trackSelect.change(function() { 
        		var index = parseInt($('#tracks :selected').val());
        		self.tablature.setTrack(api.tablature.track.song.tracks[index]);
        		self.updateCaret(self.lastTickPos,true);
        	});
        }
        
        // create carets
        if(playerOptions.caret)
        {
            var measureCaret = $('<div class="measureCaret"></div>');
            var beatCaret = $('<div class="beatCaret"></div>');
            // set styles
            measureCaret.css({ 'opacity' : playerOptions.measureCaretOpacity, 'position' : 'absolute', background: playerOptions.measureCaretColor });
            beatCaret.css({ 'opacity' : playerOptions.beatCaretOpacity, 'position' : 'absolute', background: playerOptions.beatCaretColor });
            measureCaret.width(0);
            beatCaret.width(0);
            measureCaret.height(0);
            beatCaret.height(0);
            this.el.append(measureCaret);
            this.el.append(beatCaret);
        }

        this.tablature.onCaretChanged = function(beat,scroll)
        {
            var x = $(self.canvasWrapper).offset().left + parseInt($(self.canvas).css("borderLeftWidth"), 10) + playerOptions.caretOffset.x;
            var y = $(self.canvasWrapper).offset().top + playerOptions.caretOffset.y;
            y += beat.measure.staveLine.y;

            var measureX = x + beat.measure.staveLine.x + beat.measure.x;
            measureCaret.offset({ top: y, left: measureX});
            measureCaret.width(beat.measure.width + beat.measure.spacing);
            measureCaret.height(beat.measure.staveLine.getHeight());


            var noteSize = alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(self.tablature.viewLayout, false);
            var beatX = x + beat.fullX() + noteSize.x/2;
            beatCaret.offset({top: y, left: beatX});
            beatCaret.width(3);
            beatCaret.height(measureCaret.height());

            if(scroll && beat.isFirstOfLine()  && playerOptions.autoScroll)
            {
            	var scrollTop = $(playerOptions.scrollElement).offset().top + playerOptions.scrollAdjustment;      
            	$(playerOptions.scrollElement).animate({scrollTop:y+scrollTop-30}, 300);
            }
        }
        
        // load current song 
        if(this.tablature.track != null)
        {
            this.updatePlayer(this.tablature.track.song);
        }   
        
        
        return this;
    }

})(jQuery, alphaTabWrapper);