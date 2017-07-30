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
    if(!$) { return; }
    function loadMidi(element, context, as, score) {
        // invalid score
        if(score == null || !as.get_IsReady()) return;
       
        var midi = AlphaTab.Audio.Generator.MidiFileGenerator.GenerateMidiFile(score);
        element.data('alphaSynthTickCache', midi.TickLookup);
        
        var ms = new AlphaTab.IO.ByteBuffer();
        midi.WriteTo(ms);
        var bytes = ms.ToArray();
        as.LoadMidi(bytes);
    }
    
    function getAlphaSynth(element){
        var as = element.data('alphaSynth');
        if(!as) { 
            throw new Error('Initialize player before calling player related APIs');
        }
        return as;
    }
    
    // extend the api
    var api = $.fn.alphaTab.fn;
   
    
    // hook into init 
    api._oninit(function(element, context) {
        var soundFont = element.data('player');
        if(soundFont) {
            var as = api.playerInit(element, context);             
            if(element.data('cursor') != false) {
                api.playerCursor(element, context);
            }
        }        
    });
    
    //
    // Plugin 01: Player 
    
    var playerOptionsDefaults = {
        autoScroll: 'vertical',
        scrollSpeed: 300,
        scrollOffset: 0,
        scrollElement: 'html,body',
        scrollAdjustment: 0,
        beatCursorWidth: 3,
        handleClick: true
    };

    api.playerOptions = function(element, context, options) {
        if(options) {
            var defaults = $.extend({}, playerOptionsDefaults);
            context.player.options = $.extend(defaults, options);
        }
        else {
            return context.player.options;
        }
    };

    api.playerInit = function(element, context, options) {
        var as = element.data('alphaSynth');
        if(!as) {
            
            var defaults = $.extend({}, playerOptionsDefaults);                  
            context.player = {
                options: $.extend(defaults, options),
                elements: {},
                previousBeat: null,
                previousCache: null,
                previousState: null
            };

            // initialize alphaSynth
            as = AlphaSynth.Main.AlphaSynthApi.Create();
            as.On('ready', function() {
                var soundFont = element.data('player');
                if(soundFont) {
                    as.LoadSoundFont(soundFont);
                }
                loadMidi(element, context, as, api.score(element, context));
            });
            
            // hook into events and forward them
            as.On('readyForPlayback', function() {
                context.player.options.playbackSpeed = as.get_PlaybackSpeed();
                context.TriggerEvent('playerReady');
            });
            
            as.On('soundFontLoad', function(data) {
                context.TriggerEvent('soundFontLoad', data);
            });
            as.On('soundFontLoaded', function() {
                context.TriggerEvent('soundFontLoaded');
            });
            as.On('soundFontLoadFailed', function() {
                context.TriggerEvent('soundFontLoadFailed');
            });
            
            as.On('midiLoad', function(data) {
                context.TriggerEvent('midiLoad', data);
            });
            as.On('midiFileLoaded', function() {
                context.TriggerEvent('midiFileLoaded');
            });
            as.On('midiFileLoadFailed', function() {
                context.TriggerEvent('midiFileLoadFailed');
            });
            
            as.On('playerStateChanged', function(data) {
                context.TriggerEvent('playerStateChanged', data);
            });
            as.On('positionChanged', function(data) {
                context.TriggerEvent('positionChanged', data);
            });
            as.On('finished', function(data) {
                context.TriggerEvent('finished', data);
            });
                        
            element.data('alphaSynth', as);            
            
            element.on('alphaTab.loaded', function(e, score) {
                loadMidi(element, context, as, score);            
            });
        }    
        return as;        
    };
    
    api.player = function(element, context) {
        return element.data('alphaSynth');
    };
    
    //
    // api calls which are forwarded to alphaSynth
    
    // properties
    api.isReadyForPlayback = function(element, context) {
        var as = getAlphaSynth(element);
        return as.get_IsReadyForPlayback();        
    };
    
    api.playerState = function(element, context) {
        var as = getAlphaSynth(element);
        return as.get_State();        
    };
    
    api.masterVolume = function(element, context, value) {
        var as = getAlphaSynth(element);
        if(typeof value === 'undefined') {
            return as.get_MasterVolume();
        }
        else {
            as.set_MasterVolume(value);
        }
    };   
    
    api.playbackSpeed = function(element, context, value) {
        var as = getAlphaSynth(element);
        if(typeof value === 'undefined') {
            return as.get_PlaybackSpeed();
        }
        else {
            as.set_PlaybackSpeed(value);
            context.player.options.playbackSpeed = as.get_PlaybackSpeed();
        }
    };
    
    api.metronomeVolume = function(element, context, value) {
        var as = getAlphaSynth(element);
        if(typeof value === 'undefined') {
            return as.get_MetronomeVolume(value);
        }
        else {
            as.set_MetronomeVolume(value);
        }
    };
    
    api.tickPosition = function(element, context, value) {
        var as = getAlphaSynth(element);
        if(typeof value === 'undefined') {
            return as.get_TickPosition();
        }
        else {
            as.set_TickPosition(value);
        }
    };
    
    api.playbackRange = function(element, context, value) {
        var as = getAlphaSynth(element);
        if(typeof value === 'undefined') {
            return as.get_PlaybackRange();
        }
        else {
            as.set_PlaybackRange(value);
        }
    };
    
    api.loop = function(element, context, value) {
        var as = getAlphaSynth(element);
        if(typeof value === 'undefined') {
            return as.get_IsLooping();
        }
        else {
            as.set_IsLooping(value);
        }
    };
    
    // methods
    api.play = function(element, context) {
        var as = getAlphaSynth(element);
        as.Play();
    };
    api.pause = function(element, context) {
        var as = getAlphaSynth(element);
        as.Pause();
    };
    api.playPause = function(element, context) {
        var as = getAlphaSynth(element);
        as.PlayPause();
    };
    api.stop = function(element, context) {
        var as = getAlphaSynth(element);
        as.Stop();
        api.playerCursorUpdateTick(element, context, 0, true);
    };
    api.loadSoundFont = function(element, context, value) {
        var as = getAlphaSynth(element);
        as.LoadSoundFont(value);
    };
    api.loadMidi = function(element, context, value) {
        var as = getAlphaSynth(element);
        as.LoadMidi(value);
    };    
    api.muteTrack = function(element, context, tracks, mute) {
        var as = getAlphaSynth(element);
        tracks = context.TrackIndexesToTracks(context.ParseTracks(tracks));
        for(var t = 0; t < tracks.length; t++) {
            as.SetChannelMute(tracks[t].PlaybackInfo.PrimaryChannel, mute);
            as.SetChannelMute(tracks[t].PlaybackInfo.SecondaryChannel, mute);
        }        
    };
    api.soloTrack = function(element, context, tracks, solo) {
        var as = getAlphaSynth(element);
        tracks = context.TrackIndexesToTracks(context.ParseTracks(tracks));
        for(var t = 0; t < tracks.length; t++) {
            as.SetChannelSolo(tracks[t].PlaybackInfo.PrimaryChannel, solo);
            as.SetChannelSolo(tracks[t].PlaybackInfo.SecondaryChannel, solo);
        }        
    };
    api.trackVolume = function(element, context, tracks, volume) {
        var as = getAlphaSynth(element);
        tracks = context.TrackIndexesToTracks(context.ParseTracks(tracks));
        
        volume /= 16;
        
        for(var t = 0; t < tracks.length; t++) {
            as.SetChannelVolume(tracks[t].PlaybackInfo.PrimaryChannel, volume);
            as.SetChannelVolume(tracks[t].PlaybackInfo.SecondaryChannel, volume);
        }        
    };
    
    //
    // Plugin 02: Cursors
    
    var selectionEnd = null;
    var selecting = false;
    
    api.getTickCache = function(element) {
        return element.data('alphaSynthTickCache');
    }
    api.getCursorCache = function(element) {
        return element.data('alphaSynthCursorCache');
    }
    
    api.autoScroll = function(element, context, value) {
        if(typeof value === 'undefined') {
            return context.player.options.autoScroll;
        }
        else {
            context.player.options.autoScroll = value;
            api.playerCursorUpdateBeat(element, context, context.player.options.currentBeat);
        }
    },
    
    // updates the cursors to highlight the beat at the specified tick position
    api.playerCursorUpdateTick = function(element, context, tick, stop) {
        requestAnimationFrame(function() {
            var cache = api.getTickCache(element);
            if(cache) {
                var tracks = api.tracks(element, context);
                if(tracks.length > 0) {
                    var beat = cache.FindBeat(tracks, tick);
                    if(beat) {
                        api.playerCursorUpdateBeat(element, context, beat.CurrentBeat, beat.NextBeat, beat.Duration, stop);    
                    }                
                }
            }
        });
    };
    
    api.playerCursorSelectRange = function(element, context, startBeat, endBeat) {        
        var cache = api.getCursorCache(element);
        if(!cache) {
            return;
        }
        
        var selectionWrapper = context.player.elements.selectionWrapper;
        selectionWrapper.empty();
        
        if(startBeat == null || endBeat == null || startBeat.beat == endBeat.beat) {
            return;
        }
        
        if(!startBeat.bounds) {
            startBeat.bounds = cache.FindBeat(startBeat.beat);
        }
        
        if(!endBeat.bounds) {
            endBeat.bounds = cache.FindBeat(endBeat.beat);
        }
                        
        var startTick = startBeat.beat.get_AbsoluteStart();
        var endTick = endBeat.beat.get_AbsoluteStart();
        if(endTick < startTick) {
            var t = startBeat;
            startBeat = endBeat;
            endBeat = t;
        }

        var startX = startBeat.bounds.RealBounds.X;
        var endX = endBeat.bounds.RealBounds.X + endBeat.bounds.RealBounds.W;
        if(endBeat.beat.Index == endBeat.beat.Voice.Beats.length - 1) {
            endX = endBeat.bounds.BarBounds.MasterBarBounds.RealBounds.X + endBeat.bounds.BarBounds.MasterBarBounds.RealBounds.W;
        }

        // if the selection goes across multiple staves, we need a special selection highlighting
        if(startBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds != endBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds) {
            // from the startbeat to the end of the staff, 
            // then fill all staffs until the end-beat staff
            // then from staff-start to the end beat (or to end of bar if it's the last beat)

            var staffStartX = startBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X;
            var staffEndX = startBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.X + startBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.VisualBounds.W;
            
            var startSelection = $('<div></div>').css({
                position: 'absolute',
                top: startBeat.bounds.BarBounds.MasterBarBounds.VisualBounds.Y + 'px', 
                left: startX + 'px',
                width: (staffEndX - startX) + 'px',
                height: startBeat.bounds.BarBounds.MasterBarBounds.VisualBounds.H + 'px'
            });    
            selectionWrapper.append(startSelection);
            
            var staffStartIndex = startBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index + 1;
            var staffEndIndex = endBeat.bounds.BarBounds.MasterBarBounds.StaveGroupBounds.Index;
            for(var staffIndex = staffStartIndex; staffIndex < staffEndIndex; staffIndex++) {
                var staffBounds = cache.StaveGroups[staffIndex];
                
                var middleSelection = $('<div></div>').css({
                    position: 'absolute',
                    top: staffBounds.VisualBounds.Y + 'px', 
                    left: staffStartX + 'px',
                    width: (staffEndX - staffStartX) + 'px',
                    height: staffBounds.VisualBounds.H + 'px'
                });    
                selectionWrapper.append(middleSelection);
            }
            
            var endSelection = $('<div></div>').css({
                position: 'absolute',
                top: endBeat.bounds.BarBounds.MasterBarBounds.VisualBounds.Y + 'px', 
                left: staffStartX + 'px',
                width: (endX - staffStartX) + 'px',
                height: endBeat.bounds.BarBounds.MasterBarBounds.VisualBounds.H + 'px'
            });    
            selectionWrapper.append(endSelection);
        }
        else {
            // if the beats are on the same staff, we simply highlight from the startbeat to endbeat
            var selection = $('<div></div>');
            selection.css({
                position: 'absolute',
                top: startBeat.bounds.BarBounds.MasterBarBounds.VisualBounds.Y + 'px', 
                left: startX + 'px',
                width: (endX - startX) + 'px',
                height: startBeat.bounds.BarBounds.MasterBarBounds.VisualBounds.H + 'px'
            });    
            selectionWrapper.append(selection);
        }
    };
    
    // updates the cursors to highlight the specified beat
    api.playerCursorUpdateBeat = function(element, context, beat, nextBeat, duration, stop) {
        if(beat == null) return;
        
        var cache = api.getCursorCache(element);
        if(!cache) {
            return;
        }

        var previousBeat = context.player.currentBeat;
        var previousCache = context.player.cursorCache;
        var previousState = context.player.playerState;
        context.player.currentBeat = beat;
        context.player.cursorCache = cache;
        context.player.playerState = context.playerState;
        
        if(beat == previousBeat && cache == previousCache && previousState == context.playerState) {
            return;
        }
        
        var cursorWrapper = context.player.elements.wrapper;
        var barCursor = context.player.elements.barCursor;
        var beatCursor = context.player.elements.beatCursor;
        
        var beatBoundings = cache.FindBeat(beat);
        if(!beatBoundings) {
            return;
        }        
               
        var barBoundings = beatBoundings.BarBounds.MasterBarBounds;
        barCursor.css({
            top: barBoundings.VisualBounds.Y + 'px', 
            left: barBoundings.VisualBounds.X + 'px',
            width: barBoundings.VisualBounds.W + 'px',
            height: barBoundings.VisualBounds.H + 'px'
        });
        beatCursor
            .stop(true, false)    
            .css({
                top: barBoundings.VisualBounds.Y + 'px', 
                left: (beatBoundings.VisualBounds.X) + 'px',
                width: context.player.options.beatCursorWidth + 'px',
                height: barBoundings.VisualBounds.H + 'px'
            })
        ;
            
        // if playing, animate the cursor to the next beat
        $('.atHighlight', element).removeClass('atHighlight');
        if(context.playerState == 1 || stop) {
            duration /= context.player.options.playbackSpeed;
            
            if(!stop) {
                $('.b' + beat.Id, element).addClass('atHighlight');            
                var nextBeatX = barBoundings.VisualBounds.X + barBoundings.VisualBounds.W;
                
                // get position of next beat on same stavegroup
                if(nextBeat) {
                    var nextBeatBoundings = cache.FindBeat(nextBeat);
                    if(nextBeatBoundings.BarBounds.MasterBarBounds.StaveGroupBounds == barBoundings.StaveGroupBounds) {
                        nextBeatX = nextBeatBoundings.VisualBounds.X;
                    }
                }            
                beatCursor.animate({
                    left: nextBeatX + 'px'
                }, duration, 'linear');       
            }            
                
            if(!selecting) {
                                
                // calculate position of whole music wheet within the scroll parent
                var scrollElement = $(context.player.options.scrollElement);

                var elementOffset = element.offset();
                if(!scrollElement.is('html,body')) {
                    var scrollElementOffset = scrollElement.offset();
                    elementOffset = {
                        top: elementOffset.top + scrollElement.scrollTop() - scrollElementOffset.top,
                        left: elementOffset.left + scrollElement.scrollLeft() - scrollElementOffset.left,
                    };
                }
                
                
                if(context.player.options.autoScroll == 'vertical') {
                    var scrollTop = elementOffset.top + barBoundings.RealBounds.Y;

                    if(context.player.options.scrollOffset.length) {
                        scrollTop += context.player.options.scrollOffset[1];
                    }
                    else if(context.player.options.scrollOffset) {
                        scrollTop += context.player.options.scrollOffset;                        
                    }
                    if(scrollTop != context.player.options.lastScroll) {
                        context.player.options.lastScroll = scrollTop;
                        scrollElement.animate({
                            scrollTop:scrollTop + 'px'
                        });
                    }
                }
                else if(context.player.options.autoScroll == 'horizontal-bar') {
                    if(barBoundings.VisualBounds.X != context.player.options.lastScroll) {
                        var scrollLeft = barBoundings.RealBounds.X;
                        if(context.player.options.scrollOffset.length) {
                            scrollLeft += context.player.options.scrollOffset[0];
                        }
                        else if(context.player.options.scrollOffset) {
                            scrollLeft += context.player.options.scrollOffset;                        
                        }                        
                        context.player.options.lastScroll = barBoundings.VisualBounds.X;
                        scrollElement.animate({
                            scrollLeft:scrollLeft + 'px'
                        }, context.player.options.scrollSpeed);
                    }
                }
                else if(context.player.options.autoScroll == 'horizontal-offscreen') {
                    var elementRight = scrollElement.scrollLeft() + 
                                       scrollElement.width();
                    if( (barBoundings.VisualBounds.X + barBoundings.VisualBounds.W) >= elementRight || barBoundings.VisualBounds.X < scrollElement.scrollLeft() ) {
                        var scrollLeft = barBoundings.RealBounds.X;
                        if(context.player.options.scrollOffset.length) {
                            scrollLeft += context.player.options.scrollOffset[0];
                        }
                        else if(context.player.options.scrollOffset) {
                            scrollLeft += context.player.options.scrollOffset;                        
                        }                
                        context.player.options.lastScroll = barBoundings.VisualBounds.X;
                        scrollElement.animate({
                            scrollLeft:scrollLeft + 'px'
                        }, context.player.options.scrollSpeed);
                    }
                }
            }            
        }
        
        // trigger an event for others to indicate which beat/bar is played
        context.TriggerEvent('playedBeatChanged', beat);
    };
    
    api.cursorOptions = api.playerOptions
    
    api.playerCursor = function(element, context, options) {
        var as = element.data('alphaSynth');
        if(!as) { 
            throw new Error('Initialize player with "playerInit" before you init the cursors');
        }

        // prevent double initialization
        if(element.data('alphaSynthCursor')) { return; }
        element.data('alphaSynthCursor', true);
                
        var scrollOffset = element.data("player-offset");
        if(scrollOffset) {
            context.player.options.scrollOffset = scrollOffset;
        }
        
        //
        // Create cursors
        
        var cursorWrapper = $('<div class="cursors"></div>');
        var selectionWrapper = $('<div class="selectionWrapper"></div>');
        var barCursor = $('<div class="barCursor"></div>');
        var beatCursor = $('<div class="beatCursor"></div>');
        var surface = $('.alphaTabSurface', element);
                 
        // required css styles 
        element.css({position: 'relative'});
        element.css({'text-align': 'left'});
        cursorWrapper.css({position: 'absolute', "z-index": 1000, display: 'inline', 'pointer-events': 'none'});
        selectionWrapper.css({position: 'absolute'});
        barCursor.css({position: 'absolute'});
        beatCursor.css({position: 'absolute'});

        // store options and created elements for fast access
        context.player.elements.wrapper = cursorWrapper;
        context.player.elements.barCursor = barCursor;
        context.player.elements.beatCursor = beatCursor;
        context.player.elements.selectionWrapper = selectionWrapper;
        
        // add cursors to UI
        element.prepend(cursorWrapper);
        cursorWrapper.prepend(barCursor);
        cursorWrapper.prepend(beatCursor);
        cursorWrapper.prepend(selectionWrapper);
        
        //
        // Hook into events
        var previousTick = 0;
        
        // we need to update our position caches if we render a tablature
        element.on('alphaTab.postRendered', function(e) {
            var renderer = api.renderer(element, context);
            element.data('alphaSynthCursorCache', renderer.BoundsLookup);
            api.playerCursorUpdateTick(element, context, previousTick);
            cursorWrapper.css({position: 'absolute', "z-index": 1000, 
                width: surface.width(), height: surface.height()});
        });
               
        // cursor updating
        as.On('positionChanged', function(data) {
            previousTick = data.currentTick;
            setTimeout(function() {
                api.playerCursorUpdateTick(element, context, data.currentTick);
            }, 0); // enqueue cursor update for later to return ExternalInterface call in case of Flash
        });
        as.On('playerStateChanged', function(data) {
            context.playerState = data.state;
            setTimeout(function() {
                api.playerCursorUpdateTick(element, context, previousTick);
            }, 0); // enqueue cursor update for later to return ExternalInterface call in case of Flash
        });
        
        //
        // Click Handling
        
        if(context.player.options.handleClick) {
            $(context.CanvasElement).on('mousedown', function(e) {
                if(e.which != 1) {
                    return;
                }
                e.preventDefault();
                                
                var parentOffset = $(this).offset();
                var relX = e.pageX - parentOffset.left;
                var relY = e.pageY - parentOffset.top;
                var beat = api.getBeatAtPos(element, context, relX, relY);
                if(beat) {
                    context.selectionStart = {
                        beat: beat
                    };
                    selectionEnd = null;
                    selecting = true;
                }
            });
            $(context.CanvasElement).on('mousemove', function(e) {
                if(selecting) {
                    var parentOffset = $(this).offset();
                    var relX = e.pageX - parentOffset.left;
                    var relY = e.pageY - parentOffset.top;
                    var beat = api.getBeatAtPos(element, context, relX, relY);
                    if(beat && (selectionEnd == null || selectionEnd.beat != beat)) {
                        selectionEnd = {
                            beat: beat
                        };
                        
                        api.playerCursorSelectRange(element, context, context.selectionStart, selectionEnd);
                    }
                }
            });
            $(context.CanvasElement).on('mouseup', function(e) {
                e.preventDefault();
                                            
                var selectionStart = context.selectionStart;
                                            
                // for the selection ensure start < end
                if(selectionEnd) {
                    var startTick = selectionStart.beat.get_AbsoluteStart();
                    var endTick = selectionEnd.beat.get_AbsoluteStart();
                    if(endTick < startTick) {
                        var t = selectionStart;
                        selectionStart = selectionEnd;
                        selectionEnd = t;
                    }
                }
                
                if(selectionStart != null)
                {
                    // get the start and stop ticks (which consider properly repeats)
                    var tickCache = api.getTickCache(element);
                    var realMasterBarStart = tickCache.GetMasterBarStart(selectionStart.beat.Voice.Bar.get_MasterBar());
                            
                    // move to selection start
                    api.playerCursorUpdateBeat(element, context, selectionStart.beat);
                    as.set_TickPosition(realMasterBarStart + selectionStart.beat.Start);
                    
                    // set playback range 
                    if(selectionEnd && selectionStart.beat != selectionEnd.beat) {
                        var realMasterBarEnd = tickCache.GetMasterBarStart(selectionEnd.beat.Voice.Bar.get_MasterBar());
                        as.set_PlaybackRange({
                            StartTick: realMasterBarStart + selectionStart.beat.Start, 
                            EndTick: realMasterBarEnd + selectionEnd.beat.Start + selectionEnd.beat.CalculateDuration() - 50
                        });
                    }
                    else {
                        selectionStart = null;
                        as.set_PlaybackRange(null);
                    }
                    api.playerCursorSelectRange(element, context, selectionStart, selectionEnd);
                }
                selecting = false;
            });
            
            element.on('alphaTab.postRendered', function(e) {
                if(context.selectionStart) {
                    api.playerCursorSelectRange(element, context, context.selectionStart, selectionEnd);
                }
            });
            
        }        
    }

    api.getBeatAtPos = function(element, context, x, y) {
        var cache = api.getCursorCache(element);
        return cache.GetBeatAtPos(x, y);
    };
})(typeof jQuery !== 'undefined' ? jQuery : null);