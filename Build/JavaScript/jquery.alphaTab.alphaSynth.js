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
    
    var api = $.fn.alphaTab.fn;

	api._playerDefaults = {
		autoScroll: 'vertical',
		scrollSpeed: 300,
		scrollOffset: 0,
		scrollElement: 'html,body',
		scrollAdjustment: 0,
		cursor: true,
		beatCursorWidth: 3,
		handleClick: true
	};

	api._as = null;
	api._midiTickLookup = null;
	api._boundsLookup = null;
	api._cursorWrapper = null;
	api._selectionWrapper = null;
	api._barCursor = null;
	api._beatCursor = null;
	api._surface = null;
	api._selecting = false;
	api._selectionStart = null;
	api._selectionEnd = null;
	api._animationComplete = true;
	api._beatTickLookup = null;
	api._beatBoundings = null;
	api._nextBeatBoundings = null;

	api._preHook = function () {
		var self = this;

		self._options = $.extend({}, self._playerDefaults, self._options);

		// handle data attributes
		if (self._element.data('player')) {
			self._options.soundFont = self._element.data('player');
		}
		if (self._element.data('player-offset')) {
			self._options.scrollOffset = self._element.data('player-offset');
		}
		if (!self._options.soundFont) {
			return;
		}

		self._as = AlphaSynth.Main.AlphaSynthApi.Create();
        
		self._as.On('ready', function () {
			self._as.LoadSoundFont(self._options.soundFont);
		});

		self._as.On('readyForPlayback', function () {
            self._at.TriggerEvent('playerReady');
        });
            
        self._as.On('soundFontLoad', function (data) {
			self._at.TriggerEvent('soundFontLoad', data);
        });

        self._as.On('soundFontLoaded', function () {
            self._at.TriggerEvent('soundFontLoaded');
        });

        self._as.On('soundFontLoadFailed', function () {
            self._at.TriggerEvent('soundFontLoadFailed');
        });
            
        self._as.On('midiLoad', function (data) {
            self._at.TriggerEvent('midiLoad', data);
        });

        self._as.On('midiFileLoaded', function () {
            self._at.TriggerEvent('midiFileLoaded');
        });

        self._as.On('midiFileLoadFailed', function () {
            self._at.TriggerEvent('midiFileLoadFailed');
        });
            
        self._as.On('playerStateChanged', function (data) {
            self._at.TriggerEvent('playerStateChanged', data);
        });

        self._as.On('positionChanged', function (data) {
            self._at.TriggerEvent('positionChanged', data);
        });

        self._as.On('finished', function (data) {
            self._at.TriggerEvent('finished', data);
        });

		self._element.on('alphaTab.loaded', function (e, score) {
			var midi = AlphaTab.Audio.Generator.MidiFileGenerator.GenerateMidiFile(score);
			self._midiTickLookup = midi.TickLookup;
			var ms = new AlphaTab.IO.ByteBuffer();
			midi.WriteTo(ms);
			self._as.LoadMidi(ms.ToArray());
		});

		if (self._options.cursor) {
			self._element.on('alphaTab.postRendered', function () {
				self._boundsLookup = self._at.Renderer.BoundsLookup;
				self._beatTickLookup = null; // to force updating cursor position
				self._as.set_TickPosition(self._as.get_TickPosition()); // resync...
				if (self._as.get_State() === AlphaSynth.PlayerState.Paused) {
					self._playerCursorUpdateTick();
				}
			});
		}
	};

	api._postHook = function () {
		if (this._options.soundFont && this._options.cursor) {
			this._playerCursor();
		}
	};

	api._playerCursor = function () {
		var self = this;

		self._cursorWrapper = $('<div class="cursors"></div>');
		self._selectionWrapper = $('<div class="selectionWrapper"></div>');
		self._barCursor = $('<div class="barCursor"></div>');
		self._beatCursor = $('<div class="beatCursor"></div>');
		self._surface = $('.alphaTabSurface', self._element);

		// required css styles 
		self._element.css({ position: 'relative', textAlign: 'left' });
		self._cursorWrapper.css({ position: 'absolute', zIndex: 1000, display: 'inline', pointerEvents: 'none' });
		self._selectionWrapper.css({ position: 'absolute' });
		self._barCursor.css({ position: 'absolute' });
		self._beatCursor.css({ position: 'absolute' });

		// add cursors to UI
		self._element.prepend(self._cursorWrapper);
		self._cursorWrapper.prepend(self._barCursor);
		self._cursorWrapper.prepend(self._beatCursor);
		self._cursorWrapper.prepend(self._selectionWrapper);

		self._element.on('alphaTab.postRendered', function () {
			self._cursorWrapper.css({ position: 'absolute', zIndex: 1000, width: self._surface.width(), height: self._surface.height() });
		});

		self._as.On('positionChanged', function () {
			self._playerCursorUpdateTick();
		});

		self._as.On('playerStateChanged', function () {
			if (self._beatBoundings !== null) {
				self._animationComplete = false;
				self._playerCursorUpdateBeat(self._beatBoundings, self._nextBeatBoundings);
				self._animationComplete = true;
			}
		});
		
		if (self._options.handleClick) {
			$(self._at.CanvasElement).on('mousedown', function (e) {
				if (e.which !== 1) {
					return;
				}

				e.preventDefault();

				var parentOffset = $(this).offset();
				var relX = e.pageX - parentOffset.left;
				var relY = e.pageY - parentOffset.top;
				var beat = self._boundsLookup.GetBeatAtPos(relX, relY);

				if (beat) {
					self._selectionStart = { beat: beat };
					self._selectionEnd = null;
					self._selecting = true;
				}
			});

			$(self._at.CanvasElement).on('mousemove', function (e) {
				if (self._selecting) {
					var parentOffset = $(this).offset();
					var relX = e.pageX - parentOffset.left;
					var relY = e.pageY - parentOffset.top;
					var beat = self._boundsLookup.GetBeatAtPos(relX, relY);

					if (beat && (self._selectionEnd === null || self._selectionEnd.beat !== beat)) {
						self._selectionEnd = { beat: beat };
						self._playerCursorSelectRange();
					}
				}
			});

			$(self._at.CanvasElement).on('mouseup', function (e) {
				e.preventDefault();

				// for the selection ensure start < end
				if (self._selectionEnd !== null) {
					var startTick = self._selectionStart.beat.get_AbsoluteStart();
					var endTick = self._selectionEnd.beat.get_AbsoluteStart();
					if (endTick < startTick) {
						var t = self._selectionStart;
						self._selectionStart = self._selectionEnd;
						self._selectionEnd = t;
					}
				}

				if (self._selectionStart !== null) {
					// get the start and stop ticks (which consider properly repeats)
					var realMasterBarStart = self._midiTickLookup.GetMasterBarStart(self._selectionStart.beat.Voice.Bar.get_MasterBar());

					// move to selection start
					self._as.set_TickPosition(realMasterBarStart + self._selectionStart.beat.Start);

					if (self._as.get_State() === AlphaSynth.PlayerState.Paused) {
						self._playerCursorUpdateTick();
					}

					// set playback range 
					if (self._selectionEnd !== null && self._selectionStart.beat !== self._selectionEnd.beat) {
						var realMasterBarEnd = self._midiTickLookup.GetMasterBarStart(self._selectionEnd.beat.Voice.Bar.get_MasterBar());
						self._as.set_PlaybackRange({
							StartTick: realMasterBarStart + self._selectionStart.beat.Start,
							EndTick: realMasterBarEnd + self._selectionEnd.beat.Start + self._selectionEnd.beat.CalculateDuration() - 50
						});
					} else {
						self._selectionStart = null;
						self._as.set_PlaybackRange(null);
					}

					self._playerCursorSelectRange();
				}

				self._selecting = false;
			});

			self._element.on('alphaTab.postRendered', function () {
				if (self._selectionStart !== null) {
					self._playerCursorSelectRange();
				}
			});
		}
	};

	// updates the cursors to highlight the beat at the specified tick position
	api._playerCursorUpdateTick = function () {
		if (!this._animationComplete) {
			return;
		}
		if (this._boundsLookup === null) {
			return;
		}
		
		var self = this;

		requestAnimationFrame(function () {
			self._animationComplete = false;

			var tick = self._as.get_TickPosition();
				
			if (self._beatTickLookup === null
				|| tick < self._beatTickLookup.CurrentBeat.Start
				|| tick >= self._beatTickLookup.CurrentBeat.End) {

				self._beatTickLookup = self._midiTickLookup.FindBeat(self._at.get_Tracks(), tick);

				if (self._beatTickLookup !== null) {
					self._beatBoundings = self._boundsLookup.FindBeat(self._beatTickLookup.CurrentBeat.Beat);
					self._nextBeatBoundings = null;

					if (self._beatBoundings !== null) {
						if (self._beatTickLookup.NextBeat) {
							self._nextBeatBoundings = self._boundsLookup.FindBeat(self._beatTickLookup.NextBeat.Beat);
						}
						self._playerCursorUpdateBeat(self._beatBoundings, self._nextBeatBoundings);
					}
				}
			}

			self._animationComplete = true;
		});
	};

	// updates the cursors to highlight the specified beat
	api._playerCursorUpdateBeat = function (beatBoundings, nextBeatBoundings) {
		var self = this;

		var barBoundings = beatBoundings.BarBounds.MasterBarBounds;

		self._barCursor.css({
			top: barBoundings.VisualBounds.Y,
			left: barBoundings.VisualBounds.X,
			width: barBoundings.VisualBounds.W,
			height: barBoundings.VisualBounds.H
		});

		self._beatCursor.stop(true, false).css({
			top: barBoundings.VisualBounds.Y,
			left: beatBoundings.VisualBounds.X,
			width: self._options.beatCursorWidth,
			height: barBoundings.VisualBounds.H
		});

		// if playing, animate the cursor to the next beat
		$('.atHighlight', self._element).removeClass('atHighlight');

		$('.b' + self._beatTickLookup.CurrentBeat.Beat.Id, self._element).addClass('atHighlight');

		var nextBeatX = null;

		// get position of next beat on same stavegroup
		if (nextBeatBoundings !== null && nextBeatBoundings.BarBounds.MasterBarBounds.StaveGroupBounds == barBoundings.StaveGroupBounds) {
			nextBeatX = nextBeatBoundings.VisualBounds.X;
		} else {
			nextBeatX = barBoundings.VisualBounds.X + barBoundings.VisualBounds.W;
		}
		
		if (self._as.get_State() === AlphaSynth.PlayerState.Playing) {
			self._beatCursor.animate({ left: nextBeatX }, self._beatTickLookup.Duration / self._as.get_PlaybackSpeed(), 'linear');
		}

		if (!self._selecting) {

			// calculate position of whole music wheet within the scroll parent
			var scrollElement = $(self._options.scrollElement);
			var elementOffset = self._element.offset();

			if (!scrollElement.is('html,body')) {
				var scrollElementOffset = scrollElement.offset();
				elementOffset = {
					top: elementOffset.top + scrollElement.scrollTop() - scrollElementOffset.top,
					left: elementOffset.left + scrollElement.scrollLeft() - scrollElementOffset.left,
				};
			}

			switch (self._options.autoScroll) {
				case 'vertical':
					var scrollTop = elementOffset.top + barBoundings.RealBounds.Y;
					if (self._options.scrollOffset.length) {
						scrollTop += self._options.scrollOffset[1];
					} else if (self._options.scrollOffset) {
						scrollTop += self._options.scrollOffset;
					}
					if (scrollTop !== self._options.lastScroll) {
						self._options.lastScroll = scrollTop;
						scrollElement.scrollTop(scrollTop);
					}
					break;
				case 'horizontal-bar':
					if (barBoundings.VisualBounds.X !== self._options.lastScroll) {
						var scrollLeft = barBoundings.RealBounds.X;
						if (self._options.scrollOffset.length) {
							scrollLeft += self._options.scrollOffset[0];
						} else if (self._options.scrollOffset) {
							scrollLeft += self._options.scrollOffset;
						}
						self._options.lastScroll = barBoundings.VisualBounds.X;
						scrollElement.scrollLeft(scrollLeft);
					}
					break;
				case 'horizontal-offscreen':
					var elementRight = scrollElement.scrollLeft() + scrollElement.width();
					if ((barBoundings.VisualBounds.X + barBoundings.VisualBounds.W) >= elementRight || barBoundings.VisualBounds.X < scrollElement.scrollLeft()) {
						var scrollLeft = barBoundings.RealBounds.X;
						if (self._options.scrollOffset.length) {
							scrollLeft += self._options.scrollOffset[0];
						} else if (self._options.scrollOffset) {
							scrollLeft += self._options.scrollOffset;
						}
						self._options.lastScroll = barBoundings.VisualBounds.X;
						scrollElement.scrollLeft(scrollLeft);
					}
					break;
			}
		}

		// trigger an event for others to indicate which beat/bar is played
		self._at.TriggerEvent('playedBeatChanged', self._beatTickLookup.CurrentBeat.Beat);
	};

	api._playerCursorSelectRange = function () {
		var self = this;

		self._selectionWrapper.empty();

		if (self._selectionStart === null || self._selectionEnd === null || self._selectionStart.beat === self._selectionEnd.beat) {
			return;
		}

		if (self._selectionStart.bounds === undefined) {
			self._selectionStart.bounds = self._boundsLookup.FindBeat(self._selectionStart.beat);
		}

		if (self._selectionEnd.bounds === undefined) {
			self._selectionEnd.bounds = self._boundsLookup.FindBeat(self._selectionEnd.beat);
		}

		var startTick = self._selectionStart.beat.get_AbsoluteStart();
		var endTick = self._selectionEnd.beat.get_AbsoluteStart();

		if (endTick < startTick) {
			var t = self._selectionStart;
			self._selectionStart = self._selectionEnd;
			self._selectionEnd = t;
		}

		var startX = self._selectionStart.bounds.RealBounds.X;
		var endX = self._selectionEnd.bounds.RealBounds.X + self._selectionEnd.bounds.RealBounds.W;

		if (self._selectionEnd.beat.Index === (self._selectionEnd.beat.Voice.Beats.length - 1)) {
			endX = self._selectionEnd.bounds.BarBounds.MasterBarBounds.RealBounds.X + self._selectionEnd.bounds.BarBounds.MasterBarBounds.RealBounds.W;
		}

		// if the selection goes across multiple staves, we need a special selection highlighting
		if (self._selectionStart.bounds.BarBounds.MasterBarBounds.StaveGroupBounds !== self._selectionEnd.bounds.BarBounds.MasterBarBounds.StaveGroupBounds) {
			// from the startbeat to the end of the staff, 
			// then fill all staffs until the end-beat staff
			// then from staff-start to the end beat (or to end of bar if it's the last beat)

			var staffStartX = self._selectionStart.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X;
			var staffEndX = self._selectionStart.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X + self._selectionStart.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.W;

			var startSelection = $('<div></div>').css({
				position: 'absolute',
				top: self._selectionStart.bounds.BarBounds.MasterBarBounds.VisualBounds.Y + 'px',
				left: startX + 'px',
				width: (staffEndX - startX) + 'px',
				height: self._selectionStart.bounds.BarBounds.MasterBarBounds.VisualBounds.H + 'px'
			});

			self._selectionWrapper.append(startSelection);

			var staffStartIndex = self._selectionStart.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index + 1;
			var staffEndIndex = self._selectionEnd.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index;

			for (var staffIndex = staffStartIndex; staffIndex < staffEndIndex; staffIndex++) {
				var staffBounds = self._boundsLookup.StaveGroups[staffIndex];

				var middleSelection = $('<div></div>').css({
					position: 'absolute',
					top: staffBounds.VisualBounds.Y + 'px',
					left: staffStartX + 'px',
					width: (staffEndX - staffStartX) + 'px',
					height: staffBounds.VisualBounds.H + 'px'
				});

				self._selectionWrapper.append(middleSelection);
			}

			var endSelection = $('<div></div>').css({
				position: 'absolute',
				top: self._selectionEnd.bounds.BarBounds.MasterBarBounds.VisualBounds.Y + 'px',
				left: staffStartX + 'px',
				width: (endX - staffStartX) + 'px',
				height: self._selectionEnd.bounds.BarBounds.MasterBarBounds.VisualBounds.H + 'px'
			});

			self._selectionWrapper.append(endSelection);
		} else {
			// if the beats are on the same staff, we simply highlight from the startbeat to endbeat
			var selection = $('<div></div>').css({
				position: 'absolute',
				top: self._selectionStart.bounds.BarBounds.MasterBarBounds.VisualBounds.Y + 'px',
				left: startX + 'px',
				width: (endX - startX) + 'px',
				height: self._selectionStart.bounds.BarBounds.MasterBarBounds.VisualBounds.H + 'px'
			});

			self._selectionWrapper.append(selection);
		}
	};

	api.autoScroll = function (value) {
		if (value === undefined) {
			return this._options.autoScroll;
		} else {
			this._options.autoScroll = value;
			if (this._beatBoundings !== null) {
				this._animationComplete = false;
				this._playerCursorUpdateBeat(this._beatBoundings, this._nextBeatBoundings);
				this._animationComplete = true;
			}
		}
	};
    
    api.isReadyForPlayback = function () {
        return this._as.get_IsReadyForPlayback();        
    };
    
    api.playerState = function () {
        return this._as.get_State();
    };
    
    api.masterVolume = function (value) {
        if (value === undefined) {
            return this._as.get_MasterVolume();
        } else {
            this._as.set_MasterVolume(value);
        }
    };
    
    api.playbackSpeed = function (value) {
        if (value === undefined) {
            return this._as.get_PlaybackSpeed();
        } else {
            this._as.set_PlaybackSpeed(value);
        }
    };
    
    api.metronomeVolume = function (value) {
        if (value === undefined) {
            return this._as.get_MetronomeVolume(value);
        } else {
            this._as.set_MetronomeVolume(value);
        }
    };
    
    api.tickPosition = function (value) {
        if (value === undefined) {
            return this._as.get_TickPosition();
        } else {
            this._as.set_TickPosition(value);
        }
    };
    
    api.playbackRange = function (value) {
        if (value === undefined) {
            return this._as.get_PlaybackRange();
        } else {
            this._as.set_PlaybackRange(value);
        }
    };
    
    api.loop = function (value) {
        if (value === undefined) {
            return this._as.get_IsLooping();
        } else {
            this._as.set_IsLooping(value);
        }
    };
    
    api.play = function () {
        this._as.Play();
    };

    api.pause = function () {
        this._as.Pause();
    };

    api.playPause = function () {
        this._as.PlayPause();
    };

    api.stop = function () {
        this._as.Stop();
    };

    api.loadSoundFont = function (value) {
        this._as.LoadSoundFont(value);
    };

    api.loadMidi = function (value) {
        this._as.LoadMidi(value);
    };

    api.muteTrack = function (tracks, mute) {
        tracks = this._at.TrackIndexesToTracks(this._at.ParseTracks(tracks));
        for (var t = 0; t < tracks.length; t++) {
            this._as.SetChannelMute(tracks[t].PlaybackInfo.PrimaryChannel, mute);
            this._as.SetChannelMute(tracks[t].PlaybackInfo.SecondaryChannel, mute);
        }
    };

    api.soloTrack = function (tracks, solo) {
        tracks = this._at.TrackIndexesToTracks(this._at.ParseTracks(tracks));
        for (var t = 0; t < tracks.length; t++) {
            this._as.SetChannelSolo(tracks[t].PlaybackInfo.PrimaryChannel, solo);
            this._as.SetChannelSolo(tracks[t].PlaybackInfo.SecondaryChannel, solo);
        }
    };

    api.trackVolume = function (tracks, volume) {
        tracks = this._at.TrackIndexesToTracks(this._at.ParseTracks(tracks));
        for (var t = 0; t < tracks.length; t++) {
            this._as.SetChannelVolume(tracks[t].PlaybackInfo.PrimaryChannel, volume);
            this._as.SetChannelVolume(tracks[t].PlaybackInfo.SecondaryChannel, volume);
        }
    };

	api.trackPan = function (tracks, pan) {
		pan = pan * 2 - 1;
        tracks = this._at.TrackIndexesToTracks(this._at.ParseTracks(tracks));
        for (var t = 0; t < tracks.length; t++) {
            this._as.SetChannelPan(tracks[t].PlaybackInfo.PrimaryChannel, pan);
            this._as.SetChannelPan(tracks[t].PlaybackInfo.SecondaryChannel, pan);
        }
	};

}(jQuery));