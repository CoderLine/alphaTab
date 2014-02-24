(function($) 
{
    var synth = as.AlphaSynth.instance;
    
    function loadMidi(score) 
    {
        // invalid score
        if(score == null) return;
        
        // alphaSynth not readyState yet
        if(!synth.ready) 
        {
            synth.on('ready', function() {
                setTimeout(function() {
                    loadMidi(score);
                }, 0);
            });            
            return;
        }        
        
        var midi = alphatab.audio.generator.MidiFileGenerator.generateMidiFile(score);
        var output = new haxe.io.BytesOutput();
        midi.writeTo(output);
        var bytes = output.getBytes();
        synth.loadMidiBytes(bytes.b);
    }
    
    // extend the api
    var api = $.fn.alphaTab.fn;
    
    api.autoPlayer = function() 
    {
        var context = $(this).data('alphaTab');
        if(!context) { $.error('alphaTab not initialized!'); }
        
        $(this).on('loaded', function(e, score) {
            loadMidi(score);
        });
        
        // initial load
        loadMidi(api.score.apply(this));
    };
    
    api.playerLoad = function() 
    {
        var context = $(this).data('alphaTab');
        if(!context) { $.error('alphaTab not initialized!'); }
        loadMidi(api.score.apply(this));
    };
    
    api.playerTickUpdateCache = function() {
        var context = $(this).data('alphaTab');
        if(!context) { return; }
        if(!$(this).data('alphaSynthCursor')) { return; }
        
        var score = api.score.apply(this);
        if(score == null)
            $(this).data('alphaSynthTickCache', null);
        else
            $(this).data('alphaSynthTickCache', alphatab.audio.MidiUtils.buildTickLookup(score));
    };
    
    api.playerCursorUpdateCache = function() {
        var context = $(this).data('alphaTab');
        if(!context) { return; }
        if(!$(this).data('alphaSynthCursor')) { return; }
        
        var renderer = api.renderer.apply(this);
        $(this).data('alphaSynthCursorCache', renderer.buildBoundingsLookup());
    };
    
    api.getBeatAtPos = function(x, y) {
        var cache = $(this).data('alphaSynthCursorCache');
        if(!cache)
        {
            api.playerCursorUpdateCache.apply(this);
            cache = $(this).data('alphaSynthCursorCache');
        }
        
        return cache.getBeatAtPos(x, y);
    };
    
    api.playerCursorUpdateTick = function(tick) {
        var context = $(this).data('alphaTab');
        if(!context) { return; }
        if(!$(this).data('alphaSynthCursor')) { return; }
        
        var cache = $(this).data('alphaSynthTickCache');
        if(!cache)
        {
            api.playerTickUpdateCache.apply(this);
            cache = $(this).data('alphaSynthTickCache');
        }
        
        var tracks = api.tracks.apply(this);
        if(tracks.length > 0)
        {
            var beat = cache.findBeat(tracks[0], tick);
            api.playerCursorUpdateBeat.apply(this, [beat]);
        }
    };
    
    api.playerCursorUpdateBeat = function(beat) {
        if(beat == null) return;
        var context = $(this).data('alphaTab');
        if(!context) { return; }
        if(!$(this).data('alphaSynthCursor')) { return; }
        
        var cache = $(this).data('alphaSynthCursorCache');
        if(!cache)
        {
            api.playerCursorUpdateCache.apply(this);
            cache = $(this).data('alphaSynthCursorCache');
        }
        
        var cursorWrapper = $(this).data('cursors');
        var barCursor = $(this).data('barCursor');
        var beatCursor = $(this).data('beatCursor');
        
        var barBoundings = cache.bars[beat.voice.bar.index];
        var beatBoundings = barBoundings.beats[beat.index];
        barCursor.css({
            top: barBoundings.visualBounds.y + 'px', 
            left: barBoundings.visualBounds.x + 'px',
            width: barBoundings.visualBounds.w + 'px',
            height: barBoundings.visualBounds.h + 'px'
        });
        beatCursor.css({
            top: beatBoundings.visualBounds.y + 'px', 
            left: beatBoundings.visualBounds.x + 'px',
            width: context.cursorOptions.beatCursorWidth + 'px',
            height: beatBoundings.visualBounds.h + 'px'
        });
        
        if(context.cursorOptions.autoScroll)
        {
            var padding = beatCursor.offset().top - beatBoundings.visualBounds.y;
            var scrollTop = padding + beatBoundings.bounds.y + context.cursorOptions.scrollOffset;
            if(scrollTop != context.cursorOptions.lastScroll)
            {
                context.cursorOptions.lastScroll = scrollTop;
                $(context.cursorOptions.scrollElement).animate({
                    scrollTop:scrollTop + 'px'
                }, context.cursorOptions.scrollSpeed);
            }
        }
    };
    
    api.playerCursor = function(options) 
    {
        var context = $(this).data('alphaTab');
        if(!context) { return; }
        
        if($(this).data('alphaSynthCursor')) { return; }
        $(this).data('alphaSynthCursor', true);
                
        var defaults = {
            autoScroll: true,
            scrollSpeed: 300,
            scrollOffset: -30,
            scrollElement: 'html, body',
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
        var surface = $('.alphaTabSurface', this);
                 
        // required css styles
        $(this).css({position: 'relative'});
        $(this).data('cursorOptions', options);
        $(this).data('cursors', cursorWrapper);
        $(this).data('barCursor', barCursor);
        $(this).data('beatCursor', beatCursor);
        cursorWrapper.css({position: 'absolute', "z-index": 1000, display: 'inline'});
        barCursor.css({position: 'absolute'});
        beatCursor.css({position: 'absolute'});
        
        $(this).prepend(cursorWrapper);
        cursorWrapper.prepend(barCursor);
        cursorWrapper.prepend(beatCursor);
        
        //
        // Hook into events
        
        // we need to update our position caches if we render a tablature
        $(this).on('rendered', function(e, score) {
            api.playerCursorUpdateCache.apply(this);
            cursorWrapper.css({position: 'absolute', "z-index": 1000, 
                width: surface.width(), height: surface.height()});
        });
        
        $(this).on('loaded', function(e, score) {
            api.playerTickUpdateCache.apply(this);
        });
        
        // cursor updating
        var self = this;
        synth.on('positionChanged', function(e, currentTime, endTime, currentTick, endTick) {
            setTimeout(function() {
                api.playerCursorUpdateTick.apply(self, [currentTick]);
            }, 0); // enqueue cursor update for later to return ExternalInterface call
        });
        
        // click handling
        if(context.cursorOptions.handleClick) {
            $(cursorWrapper).click(function(e) {
                var parentOffset = $(this).offset(); 
                var relX = e.pageX - parentOffset.left;
                var relY = e.pageY - parentOffset.top;
                var beat = api.getBeatAtPos.apply(self, [relX, relY]);
                api.playerCursorUpdateBeat.apply(self, [beat]);
                synth.setPositionTick(beat.start);
            });
        }
    };

})(jQuery);


