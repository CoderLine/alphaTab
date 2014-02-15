(function($) 
{
    function loadMidi(score) 
    {
        // invalid score
        if(score == null) return;
        // alphaSynth not readyState yet
        if(!as.AlphaSynth.isReady) 
        {
            $(document).on('alphaSynthReady', function() {
                setTimeout(function() {
                    loadMidi(score);
                }, 0); // enqueue call for later
            });            
            return;
        }        
        
        var midi = alphatab.audio.generator.MidiFileGenerator.generateMidiFile(score);
        var output = new haxe.io.BytesOutput();
        midi.writeTo(output);
        var bytes = output.getBytes();
        console.log(as.AlphaSynth.loadMidi(bytes.b));
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
        
        var barCursor = $(this).data('barCursor');
        var beatCursor = $(this).data('beatCursor');
        
        var barBoundings = cache.bars[beat.voice.bar.index];
        var beatBoundings = barBoundings.beats[beat.index];
        barCursor.css({
            top: barBoundings.y + 'px', 
            left: barBoundings.x + 'px',
            width: barBoundings.w + 'px',
            height: barBoundings.h + 'px'
        });
        beatCursor.css({
            top: beatBoundings.y + 'px', 
            left: beatBoundings.x + 'px',
            width: context.cursorOptions.beatCursorWidth + 'px',
            height: beatBoundings.h + 'px'
        });
    };
    
    api.playerCursor = function(options) 
    {
        var context = $(this).data('alphaTab');
        if(!context) { return; }
        
        if($(this).data('alphaSynthCursor')) { return; }
        $(this).data('alphaSynthCursor', true);
                
        var defaults = {
            autoScroll: true,
            scrollElement: 'html, body',
            scrollAdjustment: 0,
            beatCursorWidth: 3
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
        as.AlphaSynth.addPositionChangedListener(function(pos) {
            setTimeout(function() {
                api.playerCursorUpdateTick.apply(self, [pos.currentTick]);
            }, 0); // enqueue cursor update for later to return ExternalInterface call
        });
    };

})(jQuery);


