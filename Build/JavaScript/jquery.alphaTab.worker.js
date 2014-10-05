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
window=this;
isWorker = window.document === undefined;

// 
// Worker API
if(!isWorker) {
    (function ($) {
        var api = {
            init: function(options) {
                var $this = $(this);
                var context = $this.data('alphaTab');
                if (!context) {
                    var ctx = new Worker('jquery.alphaTab.worker.js');
                    ctx.addEventListener('message', function(e) {
                        var msg = e.data;
                        switch(msg.cmd) {
                            case 'tracks':
                                ctx.tracksCallback(cmd.tracks);
                                delete ctx.tracksCallback;
                            break;
                            case 'score':
                                ctx.scoreCallback(AlphaTab.Model.JsObjectToScore(cmd.score));
                                delete ctx.scoreCallback;
                            break;
                            case 'rendered':
                                ctx.scoreCallback(AlphaTab.Model.JsObjectToScore(cmd.score));
                                delete ctx.scoreCallback;
                            break;
                        }
                    });
                    ctx.postMessage();
                    $this.data('alphaTab', ctx);
                }
            }, 
            
            tex: function(contents) {
                var context = $(this).data('alphaTab');
                if (!context) { console.error('alphaTab not initialized!'); }
                context.postMessage({
                    cmd: 'tex',
                    tex: contents
                });
            },
             
            load: function(data) {
                var context = $(this).data('alphaTab');
                if (!context) { console.error('alphaTab not initialized!'); }
                context.postMessage({
                    cmd: 'load',
                    tex: data
                });
            },
           
            tracks: function(tracks) {
                var context = $(this).data('alphaTab');
                if (!context) { console.error('alphaTab not initialized!'); }
                if(typeof(tracks) == 'function') {
                    context.tracksCallback = tracks;
                    context.postMessage({
                        cmd: 'tracks'
                    });
                }
                else {
                    context.postMessage({
                        cmd: 'tracks',
                        tracks: tracks
                    });
                }
            },
            
            score: function(score) {
                var context = $(this).data('alphaTab');
                if (!context) { console.error('alphaTab not initialized!'); }
                if(typeof(score) == 'function') {
                    context.scoreCallback = score;
                    context.postMessage({
                        cmd: 'score'
                    });
                }
                else {
                    context.postMessage({
                        cmd: 'score',
                        score: AlphaTab.Model.JsonConverter.ScoreToJsObject(score)
                    });
                }
            },
            
            renderer: function(e) {
                var context = $(this).data('alphaTab');
                if (!context) { console.error('alphaTab not initialized!'); }
                return context.renderer;
            }
        };
            
        var apiExec = function(method, args) {
            method = method || 'init';
            if (api[method]) {
                return api[method].apply(this, args);
            }
            else {
                console.error('Method ' + method + ' does not exist on jQuery.alphaTab');
            }
        };
           
        $.fn.alphaTab = function (method) {        
            // if only a single element is affected, we use this
            if(this.length == 1) {
                return apiExec.call(this[0], method, Array.prototype.slice.call(arguments, 1));
            }
            // if multiple elements are affected we provide chaining
            else {
                return this.each(function() {
                    apiExec.call(this, method, Array.prototype.slice.call(arguments, 1));
                });
            }
        };
        
        // allow plugins to add methods
        $.fn.alphaTab.fn = api;
        
    })(jQuery);
}
//
// Worker Logic 
else {
    // setup a renderer 
    var api = new AlphaTab.Platform.JavaScript.JsApi(null, {engine: 'svg'});
    api.renderer.add_renderFinished(function() {
        var svg = api.renderer.canvas.toSvg(true, 'alphaTabSurfaceSvg');
        self.postMessage({
            cmd: 'rendered',
            svg: svg
        });
    });
    api.logError = function(error) {
        self.postMessage({
            cmd: 'error',
            error: error
        });
    }

    self.addEventListener('message', function(e) {
        var msg = e.data;
        
        switch(msg.cmd) {
            case 'tex':
                api.tex(msg.tex);
            break;
            
            case 'load':
                api.load(msg.data);
            break;
            
            case 'tracks':
                if(msg.tracks) {
                    api.setTracks(msg.tracks, true);
                }
                else {
                    self.postMessage({
                        cmd: 'tracks',
                        error: api.get_tracks()
                    });
                }            
            break;
            
            case 'score':
                if(msg.score) {
                    api.scoreLoaded(AlphaTab.Model.JsonConverter.JsObjectToScore(msg.score));
                }
                else {
                    self.postMessage({
                        cmd: 'score',
                        error: AlphaTab.Model.JsonConverter.ScoreToJsObject(api.score)
                    });
                }            
            break;      
        }
        
    }, false);
}