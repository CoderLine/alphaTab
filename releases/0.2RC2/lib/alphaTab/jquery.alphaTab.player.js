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
(function(alphaTabWrapper)
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
            beatCaretColor: '#4040FF',
            beatCaretOpacity: 0.75,
            autoScroll: true,
            language: {play: "Play", pause: "Pause", stop: "Stop", metronome: "Metronome"}
        };

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
            var songData = alphatab.midi.MidiDataProvider.getSongMidiData(song, self.factory);
            if(self.midiPlayer.updateSongData)
            {
                self.midiPlayer.updateSongData(songData);
                $(self.playerControls).find('input').attr('disabled', false);
                self.updateCaret(0);
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

        this.updateCaret = function(tickPos)
        {
            setTimeout(function(){
                    self.tablature.notifyTickPosition(tickPos);
                }, 1);
        }
        
        
        // 
        // Create UI
        //
        // create applet
        var playerControls = $('<div class="player"></div>');
        var param = playerOptions.playerTickCallback ? '<param name="onTickChanged" value="' + playerOptions.playerTickCallback + '" />' : '';
        var applet = $('<applet height="0" width="0"  archive="' + this.options.base + "/" + playerJar + '" code="net.alphatab.midi.MidiPlayer.class">'+param+'</applet>');
        this.playerControls = playerControls[0];
        this.midiPlayer = applet[0];
        playerControls.append(applet);
        this.el.append(playerControls);

        // create controls
        if(playerOptions.createControls)
        {
            var playButton = $('<input type="button" class="play" value="'+playerOptions.language.play+'" />');
            var pauseButton = $('<input type="button" class="pause" value="'+playerOptions.language.pause+'" />');
            var stopButton = $('<input type="button" class="stop" value="'+playerOptions.language.stop+'" />');
            var metronomeCheck = $('<input type="checkbox" class="metronome" checked="checked" />');

            playerControls.append(playButton);
            playerControls.append(pauseButton);
            playerControls.append(stopButton);
            playerControls.append(metronomeCheck);
            playerControls.append($('<span>'+playerOptions.language.metronome+'</span>'));

            // hook up events
            playButton.click(function() 
            {
                if(self.midiPlayer.play)
                    self.midiPlayer.play();
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
            stopButton.click(function() 
            {
                if(self.midiPlayer.stop)
                    self.midiPlayer.stop();
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

            if(beat.measureImpl().isFirstOfLine && playerOptions.autoScroll)
            {
                window.scrollTo(0, y - 30);
            }
        }
        
        // load current song 
        if(this.tablature.track != null)
        {
            this.updatePlayer(this.tablature.track.song);
        }   
        
        
        return this;
    }

})(alphaTabWrapper);