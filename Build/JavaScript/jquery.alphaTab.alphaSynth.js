(function($) {
    function loadMidi(element, context, as, score) {
        // invalid score
        if(score == null || !as.Ready) return;
       
        var midi = AlphaTab.Audio.Generator.MidiFileGenerator.GenerateMidiFile(score);
        var ms = new AlphaTab.IO.ByteBuffer();
        midi.WriteTo(ms);
        var bytes = ms.ToArray();
        as.LoadMidiBytes(bytes);
    }
    
    // extend the api
    var api = $.fn.alphaTab.fn;
    
    //
    // Plugin 01: Player 
    api.playerInit = function(element, context, args) {
        var as = element.data('alphaSynth');
        if(!as) {
            // initialize alphaSynth
            as = new AlphaSynth.Main.AlphaSynthApi(args.asRoot, args.swfObjectRoot);
            as.On('ready', function(r) {
                as.Ready = r;
                // initial loading 
                if(r) {
                    loadMidi(element, context, as, api.score(element, context));            
                }
            });
            element.data('alphaSynth', as);            
            
            element.on('loaded', function() {
                loadMidi(element, context, as, api.score(element, context));            
            });
        }    
        return as;        
    };
    
    api.player = function(element, context) {
        return element.data('alphaSynth');
    };
    
    //
    // Plugin 02: Cursors
    
    // rebuilds the cache which allows fast lookup of beats by tick positions
    function playerTickUpdateCache(element, context) {
        var score = api.score(element, context);
        if(score == null) {
            element.data('alphaSynthTickCache', null);
        }
        else {
            element.data('alphaSynthTickCache', AlphaTab.Audio.MidiUtils.BuildTickLookup(score));
        }
    }

    // rebuilds the cache which allows fast lookup of beats by visual positions
    function playerCursorUpdateCache(element, context) {
        var renderer = api.renderer(element, context);
        element.data('alphaSynthCursorCache', renderer.BuildBoundingsLookup());
    }

    // updates the cursors to highlight the beat at the specified tick position
    api.playerCursorUpdateTick = function(element, context, tick) {
        var cache = element.data('alphaSynthTickCache');
        if(!cache) {
            playerTickUpdateCache(element, context);
            cache = element.data('alphaSynthTickCache');
        }
        
        var tracks = api.tracks(element, context);
        if(tracks.length > 0) {
            var beat = cache.FindBeat(tracks[0], tick);
            api.playerCursorUpdateBeat(element, context, beat);
        }
    };
    
    // updates the cursors to highlight the specified beat
    api.playerCursorUpdateBeat = function(element, context, beat) {
        if(beat == null) return;
        context.cursorOptions.currentBeat = beat;
        
        var cache = element.data('alphaSynthCursorCache');
        if(!cache) {
            playerCursorUpdateCache(element, context);
            cache = element.data('alphaSynthCursorCache');
        }
        
        var cursorWrapper = context.cursorOptions.cursors;
        var barCursor = context.cursorOptions.barCursor;
        var beatCursor = context.cursorOptions.beatCursor;
        
        var barBoundings = cache.Bars[beat.Voice.Bar.Index];
        var beatBoundings = barBoundings.Beats[beat.Index];
        barCursor.css({
            top: barBoundings.VisualBounds.Y + 'px', 
            left: barBoundings.VisualBounds.X + 'px',
            width: barBoundings.VisualBounds.W + 'px',
            height: barBoundings.VisualBounds.H + 'px'
        });
        beatCursor.css({
            top: beatBoundings.VisualBounds.Y + 'px', 
            left: beatBoundings.VisualBounds.X + 'px',
            width: context.cursorOptions.beatCursorWidth + 'px',
            height: beatBoundings.VisualBounds.H + 'px'
        });
        
        if(context.cursorOptions.autoScroll == 'vertical') {
            var padding = beatCursor.offset().top - beatBoundings.VisualBounds.Y;
            var scrollTop = padding + beatBoundings.Bounds.Y + context.cursorOptions.scrollOffset;
            if(scrollTop != context.cursorOptions.lastScroll) {
                context.cursorOptions.lastScroll = scrollTop;
                $(context.cursorOptions.scrollElement).animate({
                    scrollTop:scrollTop + 'px'
                }, context.cursorOptions.scrollSpeed);
            }
        }
        else if(context.cursorOptions.autoScroll == 'horizontal-bar') {
            var padding = beatCursor.offset().left - beatBoundings.VisualBounds.X;
            if(barBoundings.VisualBounds.X != context.cursorOptions.lastScroll) {
                var scrollLeft = padding + beatBoundings.Bounds.X + context.cursorOptions.scrollOffset;
                context.cursorOptions.lastScroll = barBoundings.VisualBounds.X;
                $(context.cursorOptions.scrollElement).animate({
                    scrollLeft:scrollLeft + 'px'
                }, context.cursorOptions.scrollSpeed);
            }
        }
        else if(context.cursorOptions.autoScroll == 'horizontal-offscreen') {
            var padding = beatCursor.offset().left - beatBoundings.VisualBounds.X;
            var elementRight = $(context.cursorOptions.scrollElement).scrollLeft() + 
                               $(context.cursorOptions.scrollElement).width();
            if( (barBoundings.VisualBounds.X + barBoundings.VisualBounds.W) >= elementRight || 
                 barBoundings.VisualBounds.X < $(context.cursorOptions.scrollElement).scrollLeft()
            ) {
                var scrollLeft = padding + beatBoundings.Bounds.X + context.cursorOptions.scrollOffset;
                context.cursorOptions.lastScroll = barBoundings.VisualBounds.X;
                $(context.cursorOptions.scrollElement).animate({
                    scrollLeft:scrollLeft + 'px'
                }, context.cursorOptions.scrollSpeed);
            }
        }
    };

    api.playerCursor = function(element, context, options) {
        var as = element.data('alphaSynth');
        if(!as) { 
            throw new Error('Initialize player with "playerInit" before you init the cursors');
        }

        // prevent double initialization
        if(element.data('alphaSynthCursor')) { return; }
        element.data('alphaSynthCursor', true);
                
        var defaults = {
            autoScroll: 'vertical',
            scrollSpeed: 300,
            scrollOffset: -30,
            scrollElement: 'body',
            scrollAdjustment: 0,
            beatCursorWidth: 3,
            handleClick: true
        };
        
        context.cursorOptions = $.extend(defaults, options);
        
        //
        // Create cursors
        
        var cursorWrapper = $('<div class="cursors"></div>');
        var barCursor = $('<div class="barCursor"></div>');
        var beatCursor = $('<div class="beatCursor"></div>');
        var surface = $('.alphaTabSurface', element);
                 
        // required css styles 
        element.css({position: 'relative'});
        element.css({'text-align': 'left'});
        cursorWrapper.css({position: 'absolute', "z-index": 1000, display: 'inline', 'pointer-events': 'none'});
        barCursor.css({position: 'absolute'});
        beatCursor.css({position: 'absolute'});

        // store options and created elements for fast access
        context.cursorOptions.cursors = cursorWrapper;
        context.cursorOptions.barCursor = barCursor;
        context.cursorOptions.beatCursor = beatCursor;
        
        // add cursors to UI
        element.prepend(cursorWrapper);
        cursorWrapper.prepend(barCursor);
        cursorWrapper.prepend(beatCursor);
        
        //
        // Hook into events
        
        // we need to update our position caches if we render a tablature
        element.on('post-rendered', function(e, score) {
            playerCursorUpdateCache(element, context);
            cursorWrapper.css({position: 'absolute', "z-index": 1000, 
                width: surface.width(), height: surface.height()});
        });
        
        element.on('loaded', function(e, score) {
            playerTickUpdateCache(element, context);
        });
        
        // cursor updating
        as.On('positionChanged', function(currentTime, endTime, currentTick, endTick) {
            setTimeout(function() {
                api.playerCursorUpdateTick(element, context, currentTick);
            }, 0); // enqueue cursor update for later to return ExternalInterface call in case of Flash
        });
        
        //
        // Click Handling
        
        if(context.cursorOptions.handleClick) {
            $(context.CanvasElement).click(function(e) {
                var parentOffset = $(this).offset();
                var relX = e.pageX - parentOffset.left;
                var relY = e.pageY - parentOffset.top;
                var beat = api.getBeatAtPos(element, context, relX, relY);
                api.playerCursorUpdateBeat(element, context, beat);
                as.SetPositionTick(beat.Start);
            });
        }        
    }

    api.getBeatAtPos = function(element, context, x, y) {
        var cache = element.data('alphaSynthCursorCache');
        if(!cache) {
            api.playerCursorUpdateCache(element, context);
            cache = element.data('alphaSynthCursorCache');
        }
        
        return cache.GetBeatAtPos(x, y);
    };
    

})(jQuery);


