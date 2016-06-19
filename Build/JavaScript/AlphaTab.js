var $StaticConstructors = [];
var $StaticConstructor = function(f) { 
    $StaticConstructors.push(f);  
};  

if (typeof ($Inherit) == 'undefined') {
	var $Inherit = function (ce, ce2) {

		if (typeof (Object.getOwnPropertyNames) == 'undefined') {

			for (var p in ce2.prototype)
				if (typeof (ce.prototype[p]) == 'undefined' || ce.prototype[p] == Object.prototype[p])
					ce.prototype[p] = ce2.prototype[p];
			for (var p in ce2)
				if (typeof (ce[p]) == 'undefined')
					ce[p] = ce2[p];
			ce.$baseCtor = ce2;

		} else {

			var props = Object.getOwnPropertyNames(ce2.prototype);
			for (var i = 0; i < props.length; i++)
				if (typeof (Object.getOwnPropertyDescriptor(ce.prototype, props[i])) == 'undefined')
					Object.defineProperty(ce.prototype, props[i], Object.getOwnPropertyDescriptor(ce2.prototype, props[i]));

			for (var p in ce2)
				if (typeof (ce[p]) == 'undefined')
					ce[p] = ce2[p];
			ce.$baseCtor = ce2;

		}

	}
};

if (typeof($CreateException)=='undefined') 
{
    var $CreateException = function(ex, error) 
    {
        if(error==null)
            error = new Error();
        if(ex==null)
            ex = new System.Exception.ctor();       
        error.message = ex.message;
        error.exception = ex;
        for (var p in ex)
           error[p] = ex[p];
        return error;
    }
}

if (typeof ($CreateAnonymousDelegate) == 'undefined') {
    var $CreateAnonymousDelegate = function (target, func) {
        if (target == null || func == null)
            return func;
        var delegate = function () {
            return func.apply(target, arguments);
        };
        delegate.func = func;
        delegate.target = target;
        delegate.isDelegate = true;
        return delegate;
    }
}

if (typeof($CreateDelegate)=='undefined'){
    if(typeof($iKey)=='undefined') var $iKey = 0;
    if(typeof($pKey)=='undefined') var $pKey = String.fromCharCode(1);
    var $CreateDelegate = function(target, func){
        if (target == null || func == null) 
            return func;
        if(func.target==target && func.func==func)
            return func;
        if (target.$delegateCache == null)
            target.$delegateCache = {};
        if (func.$key == null)
            func.$key = $pKey + String(++$iKey);
        var delegate;
        if(target.$delegateCache!=null)
            delegate = target.$delegateCache[func.$key];
        if (delegate == null){
            delegate = function(){
                return func.apply(target, arguments);
            };
            delegate.func = func;
            delegate.target = target;
            delegate.isDelegate = true;
            if(target.$delegateCache!=null)
                target.$delegateCache[func.$key] = delegate;
        }
        return delegate;
    }
}

var Int32Array = Int32Array || Array;
var Uint8Array = Uint8Array || Array;
var Float32Array = Float32Array || Array;
function $CombineDelegates(del1,del2)
{
    if(del1 == null)
        return del2;
    if(del2 == null)
        return del1;
    var del=$CreateMulticastDelegateFunction();
    del.delegates = [];
    if(del1.isMulticastDelegate)
    {
        for(var i=0;i < del1.delegates.length;i++)
            del.delegates.push(del1.delegates[i]);
    }
    else
    {
        del.delegates.push(del1);
    }
    if(del2.isMulticastDelegate)
    {
        for(var i=0;i < del2.delegates.length;i++)
            del.delegates.push(del2.delegates[i]);
    }
    else
    {
        del.delegates.push(del2);
    }
    return del;
};

function $CreateMulticastDelegateFunction()
{
    var del2 = null;
    
    var del=function()
    {
        var x=undefined;
        for(var i=0;i < del2.delegates.length;i++)
        {
            var del3=del2.delegates[i];
            x = del3.apply(null,arguments);
        }
        return x;
    };
    del.isMulticastDelegate = true;
    del2 = del;   
    
    return del;
};

function $RemoveDelegate(delOriginal,delToRemove)
{
    if(delToRemove == null || delOriginal == null)
        return delOriginal;
    if(delOriginal.isMulticastDelegate)
    {
        if(delToRemove.isMulticastDelegate)
            throw new Error("Multicast to multicast delegate removal is not implemented yet");
        var del=$CreateMulticastDelegateFunction();
        for(var i=0;i < delOriginal.delegates.length;i++)
        {
            var del2=delOriginal.delegates[i];
            if(del2 != delToRemove)
            {
                if(del.delegates == null)
                    del.delegates = [];
                del.delegates.push(del2);
            }
        }
        if(del.delegates == null)
            return null;
        if(del.delegates.length == 1)
            return del.delegates[0];
        return del;
    }
    else
    {
        if(delToRemove.isMulticastDelegate)
            throw new Error("single to multicast delegate removal is not supported");
        if(delOriginal == delToRemove)
            return null;
        return delOriginal;
    }
};


var AlphaTab = AlphaTab || {};
AlphaTab.Environment = function (){
};
AlphaTab.Environment.PlatformInit = function (){
    AlphaTab.Environment.RenderEngines["default"] = function (d){
        return new AlphaTab.Platform.Svg.SvgCanvas();
    };
    AlphaTab.Environment.RenderEngines["html5"] = function (d){
        return new AlphaTab.Platform.JavaScript.Html5Canvas();
    };
    AlphaTab.Environment.FileLoaders["default"] = function (){
        return new AlphaTab.Platform.JavaScript.JsFileLoader();
    };
};
$StaticConstructor(function (){
    AlphaTab.Environment.RenderEngines = null;
    AlphaTab.Environment.FileLoaders = null;
    AlphaTab.Environment.LayoutEngines = null;
    AlphaTab.Environment.StaveFactories = null;
    AlphaTab.Environment.RenderEngines = {};
    AlphaTab.Environment.FileLoaders = {};
    AlphaTab.Environment.LayoutEngines = {};
    AlphaTab.Environment.StaveFactories = {};
    AlphaTab.Environment.PlatformInit();
    AlphaTab.Environment.RenderEngines["svg"] = function (d){
        return new AlphaTab.Platform.Svg.SvgCanvas();
    };
    // default layout engines
    AlphaTab.Environment.LayoutEngines["default"] = function (r){
        return new AlphaTab.Rendering.Layout.PageViewLayout(r);
    };
    AlphaTab.Environment.LayoutEngines["page"] = function (r){
        return new AlphaTab.Rendering.Layout.PageViewLayout(r);
    };
    AlphaTab.Environment.LayoutEngines["horizontal"] = function (r){
        return new AlphaTab.Rendering.Layout.HorizontalScreenLayout(r);
    };
    // default staves 
    AlphaTab.Environment.StaveFactories["marker"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.MarkerEffectInfo());
    };
    //staveFactories.set("triplet-feel", functionl { return new EffectBarRendererFactory(new TripletFeelEffectInfo()); });
    AlphaTab.Environment.StaveFactories["tempo"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TempoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["text"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TextEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["chords"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.ChordsEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["trill"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TrillEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["beat-vibrato"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.BeatVibratoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["note-vibrato"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.NoteVibratoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["alternate-endings"] = function (l){
        return new AlphaTab.Rendering.AlternateEndingsBarRendererFactory();
    };
    AlphaTab.Environment.StaveFactories["score"] = function (l){
        return new AlphaTab.Rendering.ScoreBarRendererFactory();
    };
    AlphaTab.Environment.StaveFactories["crescendo"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.CrescendoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["dynamics"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.DynamicsEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["capo"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.CapoEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["tap"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.TapEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["fade-in"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.FadeInEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["harmonics"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.HarmonicsEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["let-ring"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.LetRingEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["palm-mute"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.PalmMuteEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["tab"] = function (l){
        return new AlphaTab.Rendering.TabBarRendererFactory();
    };
    AlphaTab.Environment.StaveFactories["pick-stroke"] = function (l){
        return new AlphaTab.Rendering.EffectBarRendererFactory(new AlphaTab.Rendering.Effects.PickStrokeEffectInfo());
    };
    AlphaTab.Environment.StaveFactories["rhythm-up"] = function (l){
        return new AlphaTab.Rendering.RhythmBarRendererFactory(AlphaTab.Rendering.Utils.BeamDirection.Down);
    };
    AlphaTab.Environment.StaveFactories["rhythm-down"] = function (l){
        return new AlphaTab.Rendering.RhythmBarRendererFactory(AlphaTab.Rendering.Utils.BeamDirection.Up);
    };
    // staveFactories.set("fingering", functionl { return new EffectBarRendererFactory(new FingeringEffectInfo()); });   
});
AlphaTab.Model = AlphaTab.Model || {};
AlphaTab.Model.JsonConverter = function (){
};
AlphaTab.Model.JsonConverter.prototype = {
    ScoreToJsObject: function (score){
        var score2 = {};
        AlphaTab.Model.Score.CopyTo(score, score2);
        score2.MasterBars = [];
        score2.Tracks = [];
        for (var i = 0; i < score.MasterBars.length; i++){
            var masterBar = score.MasterBars[i];
            var masterBar2 = {};
            AlphaTab.Model.MasterBar.CopyTo(masterBar, masterBar2);
            if (masterBar.TempoAutomation != null){
                masterBar2.TempoAutomation = {};
                AlphaTab.Model.Automation.CopyTo(masterBar.TempoAutomation, masterBar2.TempoAutomation);
            }
            if (masterBar.VolumeAutomation != null){
                masterBar2.VolumeAutomation = {};
                AlphaTab.Model.Automation.CopyTo(masterBar.VolumeAutomation, masterBar2.VolumeAutomation);
            }
            if (masterBar.Section != null){
                masterBar2.Section = {};
                AlphaTab.Model.Section.CopyTo(masterBar.Section, masterBar2.Section);
            }
            score2.MasterBars.push(masterBar2);
        }
        for (var t = 0; t < score.Tracks.length; t++){
            var track = score.Tracks[t];
            var track2 = {};
            track2.Color = {};
            AlphaTab.Model.Track.CopyTo(track, track2);
            track2.PlaybackInfo = {};
            AlphaTab.Model.PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);
            track2.Chords = {};
            for (var $i2 = 0,$t2 = Object.keys(track.Chords),$l2 = $t2.length,key = $t2[$i2]; $i2 < $l2; $i2++, key = $t2[$i2]){
                var chord = track.Chords[key];
                var chord2 = {};
                AlphaTab.Model.Chord.CopyTo(chord, chord2);
                track2.Chords[key] = chord;
            }
            track2.Bars = [];
            for (var b = 0; b < track.Bars.length; b++){
                var bar = track.Bars[b];
                var bar2 = {};
                AlphaTab.Model.Bar.CopyTo(bar, bar2);
                bar2.Voices = [];
                for (var v = 0; v < bar.Voices.length; v++){
                    var voice = bar.Voices[v];
                    var voice2 = {};
                    AlphaTab.Model.Voice.CopyTo(voice, voice2);
                    voice2.Beats = [];
                    for (var bb = 0; bb < voice.Beats.length; bb++){
                        var beat = voice.Beats[bb];
                        var beat2 = {};
                        AlphaTab.Model.Beat.CopyTo(beat, beat2);
                        beat2.Automations = [];
                        for (var a = 0; a < beat.Automations.length; a++){
                            var automation = {};
                            AlphaTab.Model.Automation.CopyTo(beat.Automations[a], automation);
                            beat2.Automations.push(automation);
                        }
                        beat2.WhammyBarPoints = [];
                        for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                            var point = {};
                            AlphaTab.Model.BendPoint.CopyTo(beat.WhammyBarPoints[i], point);
                            beat2.WhammyBarPoints.push(point);
                        }
                        beat2.Notes = [];
                        for (var n = 0; n < beat.Notes.length; n++){
                            var note = beat.Notes[n];
                            var note2 = {};
                            AlphaTab.Model.Note.CopyTo(note, note2);
                            note2.BendPoints = [];
                            for (var i = 0; i < note.BendPoints.length; i++){
                                var point = {};
                                AlphaTab.Model.BendPoint.CopyTo(note.BendPoints[i], point);
                                note2.BendPoints.push(point);
                            }
                            beat2.Notes.push(note2);
                        }
                        voice2.Beats.push(beat2);
                    }
                    bar2.Voices.push(voice2);
                }
                track2.Bars.push(bar2);
            }
            score2.Tracks.push(track2);
        }
        return score2;
    },
    JsObjectToScore: function (score){
        var score2 = new AlphaTab.Model.Score();
        AlphaTab.Model.Score.CopyTo(score, score2);
        for (var i = 0; i < score.MasterBars.length; i++){
            var masterBar = score.MasterBars[i];
            var masterBar2 = new AlphaTab.Model.MasterBar();
            AlphaTab.Model.MasterBar.CopyTo(masterBar, masterBar2);
            if (masterBar.TempoAutomation != null){
                masterBar2.TempoAutomation = new AlphaTab.Model.Automation();
                AlphaTab.Model.Automation.CopyTo(masterBar.TempoAutomation, masterBar2.TempoAutomation);
            }
            if (masterBar.VolumeAutomation != null){
                masterBar2.VolumeAutomation = new AlphaTab.Model.Automation();
                AlphaTab.Model.Automation.CopyTo(masterBar.VolumeAutomation, masterBar2.VolumeAutomation);
            }
            if (masterBar.Section != null){
                masterBar2.Section = new AlphaTab.Model.Section();
                AlphaTab.Model.Section.CopyTo(masterBar.Section, masterBar2.Section);
            }
            score2.AddMasterBar(masterBar2);
        }
        for (var t = 0; t < score.Tracks.length; t++){
            var track = score.Tracks[t];
            var track2 = new AlphaTab.Model.Track();
            AlphaTab.Model.Track.CopyTo(track, track2);
            score2.AddTrack(track2);
            AlphaTab.Model.PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);
            for (var $i3 = 0,$t3 = Object.keys(track.Chords),$l3 = $t3.length,key = $t3[$i3]; $i3 < $l3; $i3++, key = $t3[$i3]){
                var chord = track.Chords[key];
                var chord2 = new AlphaTab.Model.Chord();
                AlphaTab.Model.Chord.CopyTo(chord, chord2);
                track2.Chords[key] = chord2;
            }
            for (var b = 0; b < track.Bars.length; b++){
                var bar = track.Bars[b];
                var bar2 = new AlphaTab.Model.Bar();
                AlphaTab.Model.Bar.CopyTo(bar, bar2);
                track2.AddBar(bar2);
                for (var v = 0; v < bar.Voices.length; v++){
                    var voice = bar.Voices[v];
                    var voice2 = new AlphaTab.Model.Voice();
                    AlphaTab.Model.Voice.CopyTo(voice, voice2);
                    bar2.AddVoice(voice2);
                    for (var bb = 0; bb < voice.Beats.length; bb++){
                        var beat = voice.Beats[bb];
                        var beat2 = new AlphaTab.Model.Beat();
                        AlphaTab.Model.Beat.CopyTo(beat, beat2);
                        voice2.AddBeat(beat2);
                        for (var a = 0; a < beat.Automations.length; a++){
                            var automation = new AlphaTab.Model.Automation();
                            AlphaTab.Model.Automation.CopyTo(beat.Automations[a], automation);
                            beat2.Automations.push(automation);
                        }
                        for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                            var point = new AlphaTab.Model.BendPoint(0, 0);
                            AlphaTab.Model.BendPoint.CopyTo(beat.WhammyBarPoints[i], point);
                            beat2.WhammyBarPoints.push(point);
                        }
                        for (var n = 0; n < beat.Notes.length; n++){
                            var note = beat.Notes[n];
                            var note2 = new AlphaTab.Model.Note();
                            AlphaTab.Model.Note.CopyTo(note, note2);
                            beat2.AddNote(note2);
                            for (var i = 0; i < note.BendPoints.length; i++){
                                var point = new AlphaTab.Model.BendPoint(0, 0);
                                AlphaTab.Model.BendPoint.CopyTo(note.BendPoints[i], point);
                                note2.AddBendPoint(point);
                            }
                        }
                    }
                }
            }
        }
        score2.Finish();
        return score2;
    },
    NewObject: function (){
        return null;
    }
};
AlphaTab.Model.TuningParser = function (){
};
$StaticConstructor(function (){
    AlphaTab.Model.TuningParser.TuningRegex = new RegExp("([a-g]b?)([0-9])", "i");
});
AlphaTab.Model.TuningParser.IsTuning = function (name){
    return AlphaTab.Model.TuningParser.TuningRegex.exec(name) != null;
};
AlphaTab.Model.TuningParser.GetTuningForText = function (str){
    var b = 0;
    var note = null;
    var octave = 0;
    var m = AlphaTab.Model.TuningParser.TuningRegex.exec(str.toLowerCase());
    if (m != null){
        note = m[1];
        octave = AlphaTab.Platform.Std.ParseInt(m[2]);
    }
    if (!AlphaTab.Platform.Std.IsNullOrWhiteSpace(note)){
        switch (note){
            case "c":
                b = 0;
                break;
            case "db":
                b = 1;
                break;
            case "d":
                b = 2;
                break;
            case "eb":
                b = 3;
                break;
            case "e":
                b = 4;
                break;
            case "f":
                b = 5;
                break;
            case "gb":
                b = 6;
                break;
            case "g":
                b = 7;
                break;
            case "ab":
                b = 8;
                break;
            case "a":
                b = 9;
                break;
            case "bb":
                b = 10;
                break;
            case "b":
                b = 11;
                break;
            default:
                return -1;
        }
        // add octaves
        b += (octave * 12);
    }
    else {
        return -1;
    }
    return b;
};
AlphaTab.Platform = AlphaTab.Platform || {};
AlphaTab.Platform.JavaScript = AlphaTab.Platform.JavaScript || {};
AlphaTab.Platform.JavaScript.JsApiBase = function (element, options){
    this.Element = null;
    this.CanvasElement = null;
    this.TrackIndexes = null;
    this.Renderer = null;
    this.Score = null;
    this.Element = element;
    var dataset = this.Element.dataset;
    // load settings
    var settings = AlphaTab.Settings.FromJson(options);
    // get track data to parse
    var tracksData;
    if (options != null && options.tracks){
        tracksData = options.tracks;
    }
    else if (element != null && element.dataset != null && dataset["tracks"] != null){
        tracksData = dataset["tracks"];
    }
    else {
        tracksData = 0;
    }
    this.SetTracks(tracksData, false);
    var contents = "";
    if (element != null){
        // get load contents
        if (element.dataset != null && dataset["tex"] != null && element.innerText){
            contents = (element.innerHTML).trim();
            element.innerHTML = "";
        }
        this.CanvasElement = document.createElement("div");
        this.CanvasElement.className = "alphaTabSurface";
        this.CanvasElement.style.fontSize = "0";
        element.appendChild(this.CanvasElement);
    }
    this.Renderer = this.CreateScoreRenderer(settings, options, this.CanvasElement);
    this.Renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (o){
        this.TriggerEvent("rendered", null);
    }));
    this.Renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
        this.TriggerEvent("post-rendered", null);
    }));
    this.Renderer.add_PreRender($CreateAnonymousDelegate(this, function (){
        this.CanvasElement.innerHTML = "";
    }));
    this.Renderer.add_PartialRenderFinished($CreateAnonymousDelegate(this, function (result){
        var itemToAppend;
        if (typeof(result.RenderResult) == "string"){
            var partialResult = document.createElement("div");
            partialResult.innerHTML = result.RenderResult;
            itemToAppend = partialResult.firstChild;
        }
        else {
            itemToAppend = result.RenderResult;
        }
        this.CanvasElement.style.width = result.TotalWidth + "px";
        this.CanvasElement.style.height = result.TotalHeight + "px";
        this.CanvasElement.appendChild(itemToAppend);
    }));
    this.Renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (result){
        this.CanvasElement.style.width = result.TotalWidth + "px";
        this.CanvasElement.style.height = result.TotalHeight + "px";
    }));
    if (!((contents==null)||(contents.length==0))){
        this.Tex(contents);
    }
    else if (options && options.file){
        this.Load(options.file);
    }
    else if (this.Element != null && this.Element.dataset != null && !((dataset["file"]==null)||(dataset["file"].length==0))){
        this.Load(dataset["file"]);
    }
};
AlphaTab.Platform.JavaScript.JsApiBase.prototype = {
    SetTracks: function (tracksData, render){
        var tracks = [];
        // decode string
        if (typeof(tracksData) == "string"){
            try{
                tracksData = JSON.parse(tracksData);
            }
            catch($$e1){
                tracksData = new Int32Array([0]);
            }
        }
        // decode array
        if (typeof(tracksData) == "number"){
            tracks.push(tracksData);
        }
        else if (tracksData.length){
            for (var i = 0; i < tracksData.length; i++){
                var value;
                if (typeof(tracksData[i]) == "number"){
                    value = tracksData[i];
                }
                else {
                    value = AlphaTab.Platform.Std.ParseInt(tracksData[i].ToString());
                }
                if (value >= 0){
                    tracks.push(value);
                }
            }
        }
        this.TrackIndexes = tracks.slice(0);
        if (render){
            this.Render();
        }
    },
    ScoreLoaded: function (score){
        this.Score = score;
        this.TriggerEvent("loaded", score);
        this.Render();
    },
    TriggerEvent: function (name, details){
        if (this.Element != null){
            var e = document.createEvent("CustomEvent");
            e.initCustomEvent(name, false, false, details);
            this.Element.dispatchEvent(e);
        }
    }
};
AlphaTab.Platform.JavaScript.JsWorkerApi = function (element, options){
    AlphaTab.Platform.JavaScript.JsApiBase.call(this, element, options);
};
AlphaTab.Platform.JavaScript.JsWorkerApi.prototype = {
    CreateScoreRenderer: function (settings, rawSettings, canvasElement){
        var renderer = new AlphaTab.Platform.JavaScript.WorkerScoreRenderer(this, rawSettings);
        renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
            this.Element.className = this.Element.className.replace(" loading", "").replace(" rendering", "");
        }));
        return renderer;
    },
    Load: function (data){
        this.Element.className += " loading";
        this.Renderer.Load(data, this.TrackIndexes);
    },
    Render: function (){
        if (this.Renderer != null){
            this.Element.className += " rendering";
            this.Renderer.RenderMultiple(this.TrackIndexes);
        }
    },
    Tex: function (contents){
        this.Element.className += " loading";
        this.Renderer.Tex(contents);
    }
};
$Inherit(AlphaTab.Platform.JavaScript.JsWorkerApi, AlphaTab.Platform.JavaScript.JsApiBase);
AlphaTab.Platform.JavaScript.JsWorker = function (main, options){
    this._renderer = null;
    this._main = null;
    this._trackIndexes = null;
    this._includeScoreInLoadedEvent = false;
    this.Score = null;
    this._main = main;
    this._includeScoreInLoadedEvent = options["scoreInLoadedEvent"];
    this._main.addEventListener("message", $CreateDelegate(this, this.HandleMessage), false);
    var settings = AlphaTab.Settings.FromJson(options);
    this._renderer = new AlphaTab.Rendering.ScoreRenderer(settings, null);
    this._renderer.add_PartialRenderFinished($CreateAnonymousDelegate(this, function (result){
        this._main.postMessage({
    cmd: "partialRenderFinished",
    result: result
}
);
    }));
    this._renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (result){
        this._main.postMessage({
    cmd: "renderFinished",
    result: result
}
);
    }));
    this._renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
        this._main.postMessage({
    cmd: "postRenderFinished"
}
);
    }));
    this._renderer.add_PreRender($CreateAnonymousDelegate(this, function (){
        this._main.postMessage({
    cmd: "preRender"
}
);
    }));
};
AlphaTab.Platform.JavaScript.JsWorker.prototype = {
    get_Tracks: function (){
        var tracks = [];
        for (var $i4 = 0,$t4 = this._trackIndexes,$l4 = $t4.length,track = $t4[$i4]; $i4 < $l4; $i4++, track = $t4[$i4]){
            if (track >= 0 && track < this.Score.Tracks.length){
                tracks.push(this.Score.Tracks[track]);
            }
        }
        if (tracks.length == 0 && this.Score.Tracks.length > 0){
            tracks.push(this.Score.Tracks[0]);
        }
        return tracks.slice(0);
    },
    HandleMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "load":
                this.Load(data["data"], data["indexes"]);
                break;
            case "tex":
                this.Tex(data["data"]);
                break;
            case "renderMultiple":
                this.RenderMultiple(data["data"]);
                break;
        }
    },
    RenderMultiple: function (trackIndexes){
        this._trackIndexes = trackIndexes;
        this.Render();
    },
    Tex: function (contents){
        try{
            var parser = new AlphaTab.Importer.AlphaTexImporter();
            var data = AlphaTab.IO.ByteBuffer.FromBuffer(AlphaTab.Platform.Std.StringToByteArray(contents));
            parser.Init(data);
            this._trackIndexes = new Int32Array([0]);
            this.ScoreLoaded(parser.ReadScore());
        }
        catch(e){
            this.Error(e);
        }
    },
    Load: function (data, trackIndexes){
        try{
            this._trackIndexes = trackIndexes;
            if ((data instanceof ArrayBuffer)){
                this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(new Uint8Array(data)));
            }
            else if ((data instanceof Uint8Array)){
                this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data));
            }
            else if (typeof(data) == "string"){
                AlphaTab.Importer.ScoreLoader.LoadScoreAsync(data, $CreateDelegate(this, this.ScoreLoaded), $CreateDelegate(this, this.Error));
            }
        }
        catch(e){
            this.Error(e);
        }
    },
    Error: function (e){
        this._main.postMessage({
    cmd: "error",
    exception: e.toString()
}
);
    },
    ScoreLoaded: function (score){
        this.Score = score;
        if (this._includeScoreInLoadedEvent){
            var json = new AlphaTab.Model.JsonConverter();
            this._main.postMessage({
    cmd: "loaded",
    score: json.ScoreToJsObject(score)
}
);
        }
        else {
            this._main.postMessage({
    cmd: "loaded"
}
);
        }
        this.Render();
    },
    Render: function (){
        this._renderer.RenderMultiple(this.get_Tracks());
    }
};
AlphaTab.Platform.JavaScript.Html5Canvas = function (){
    this._canvas = null;
    this._context = null;
    this._color = null;
    this._font = null;
    this._Resources = null;
};
AlphaTab.Platform.JavaScript.Html5Canvas.prototype = {
    get_Resources: function (){
        return this._Resources;
    },
    set_Resources: function (value){
        this._Resources = value;
    },
    BeginRender: function (width, height){
        this._canvas = document.createElement("canvas");
        this._canvas.width = width | 0;
        this._canvas.height = height | 0;
        this._canvas.style.width = width + "px";
        this._canvas.style.height = height + "px";
        this._context = this._canvas.getContext("2d");
        this._context.textBaseline = "top";
    },
    EndRender: function (){
        var result = this._canvas;
        this._canvas = null;
        return result;
    },
    get_Color: function (){
        return this._color;
    },
    set_Color: function (value){
        this._color = value;
        this._context.strokeStyle = value.ToRgbaString();
        this._context.fillStyle = value.ToRgbaString();
    },
    get_LineWidth: function (){
        return this._context.lineWidth;
    },
    set_LineWidth: function (value){
        this._context.lineWidth = value;
    },
    FillRect: function (x, y, w, h){
        this._context.fillRect(x - 0.5, y - 0.5, w, h);
    },
    StrokeRect: function (x, y, w, h){
        this._context.strokeRect(x - 0.5, y - 0.5, w, h);
    },
    BeginPath: function (){
        this._context.beginPath();
    },
    ClosePath: function (){
        this._context.closePath();
    },
    MoveTo: function (x, y){
        this._context.moveTo(x - 0.5, y - 0.5);
    },
    LineTo: function (x, y){
        this._context.lineTo(x - 0.5, y - 0.5);
    },
    QuadraticCurveTo: function (cpx, cpy, x, y){
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    },
    BezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y){
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    },
    FillCircle: function (x, y, radius){
        this._context.arc(x, y, radius, 0, 6.28318530717959, true);
        this.Fill();
    },
    Fill: function (){
        this._context.fill();
    },
    Stroke: function (){
        this._context.stroke();
    },
    get_Font: function (){
        return this._font;
    },
    set_Font: function (value){
        this._font = value;
        this._context.font = value.ToCssString();
    },
    get_TextAlign: function (){
        switch (this._context.textAlign){
            case "left":
                return AlphaTab.Platform.Model.TextAlign.Left;
            case "center":
                return AlphaTab.Platform.Model.TextAlign.Center;
            case "right":
                return AlphaTab.Platform.Model.TextAlign.Right;
            default:
                return AlphaTab.Platform.Model.TextAlign.Left;
        }
    },
    set_TextAlign: function (value){
        switch (value){
            case AlphaTab.Platform.Model.TextAlign.Left:
                this._context.textAlign = "left";
                break;
            case AlphaTab.Platform.Model.TextAlign.Center:
                this._context.textAlign = "center";
                break;
            case AlphaTab.Platform.Model.TextAlign.Right:
                this._context.textAlign = "right";
                break;
        }
    },
    get_TextBaseline: function (){
        switch (this._context.textBaseline){
            case "top":
                return AlphaTab.Platform.Model.TextBaseline.Top;
            case "middel":
                return AlphaTab.Platform.Model.TextBaseline.Middle;
            case "bottom":
                return AlphaTab.Platform.Model.TextBaseline.Bottom;
            default:
                return AlphaTab.Platform.Model.TextBaseline.Top;
        }
    },
    set_TextBaseline: function (value){
        switch (value){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                this._context.textBaseline = "top";
                break;
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                this._context.textBaseline = "middle";
                break;
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                this._context.textBaseline = "bottom";
                break;
        }
    },
    FillText: function (text, x, y){
        this._context.fillText(text, x, y);
    },
    MeasureText: function (text){
        return this._context.measureText(text).width;
    },
    FillMusicFontSymbol: function (x, y, scale, symbol){
        if (symbol == AlphaTab.Rendering.Glyphs.MusicFontSymbol.None){
            return;
        }
        var glyph = new AlphaTab.Rendering.Utils.SvgRenderer(AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[symbol], scale, scale);
        glyph.Paint(x, y, this);
    }
};
AlphaTab.Platform.JavaScript.JsApi = function (element, options){
    AlphaTab.Platform.JavaScript.JsApiBase.call(this, element, options);
};
AlphaTab.Platform.JavaScript.JsApi.prototype = {
    get_Tracks: function (){
        var tracks = [];
        for (var $i5 = 0,$t5 = this.TrackIndexes,$l5 = $t5.length,track = $t5[$i5]; $i5 < $l5; $i5++, track = $t5[$i5]){
            if (track >= 0 && track < this.Score.Tracks.length){
                tracks.push(this.Score.Tracks[track]);
            }
        }
        if (tracks.length == 0 && this.Score.Tracks.length > 0){
            tracks.push(this.Score.Tracks[0]);
        }
        return tracks.slice(0);
    },
    CreateScoreRenderer: function (settings, rawSettings, canvasElement){
        return new AlphaTab.Rendering.ScoreRenderer(settings, canvasElement);
    },
    Load: function (data){
        if ((data instanceof ArrayBuffer)){
            this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(new Uint8Array(data)));
        }
        else if ((data instanceof Uint8Array)){
            this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data));
        }
        else if (typeof(data) == "string"){
            AlphaTab.Importer.ScoreLoader.LoadScoreAsync(data, $CreateDelegate(this, this.ScoreLoaded), $CreateAnonymousDelegate(this, function (e){
                console.error(e);
            }));
        }
    },
    Tex: function (contents){
        var parser = new AlphaTab.Importer.AlphaTexImporter();
        var data = AlphaTab.IO.ByteBuffer.FromBuffer(AlphaTab.Platform.Std.StringToByteArray(contents));
        parser.Init(data);
        this.ScoreLoaded(parser.ReadScore());
    },
    Render: function (){
        if (this.Renderer != null){
            this.Renderer.RenderMultiple(this.get_Tracks());
        }
    }
};
$Inherit(AlphaTab.Platform.JavaScript.JsApi, AlphaTab.Platform.JavaScript.JsApiBase);
AlphaTab.Platform.JavaScript.JsFileLoader = function (){
};
AlphaTab.Platform.JavaScript.JsFileLoader.prototype = {
    LoadBinary: function (path){
        var ie = AlphaTab.Platform.JavaScript.JsFileLoader.GetIEVersion();
        if (ie >= 0 && ie <= 9){
            // use VB Loader to load binary array
            var vbArr = VbAjaxLoader("GET",path);
            var fileContents = vbArr.toArray();
            // decode byte array to string
            var data = new Array();
            var i = 0;
            while (i < (fileContents.length - 1)){
                data.push(String.fromCharCode((fileContents[i])));
                i++;
            }
            var reader = AlphaTab.Platform.JavaScript.JsFileLoader.GetBytesFromString(data.join(''));
            return reader;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.responseType = "arraybuffer";
        xhr.send();
        if (xhr.status == 200){
            var reader = new Uint8Array(xhr.response);
            return reader;
        }
        // Error handling
        if (xhr.status == 0){
            throw $CreateException(new AlphaTab.IO.FileLoadException("You are offline!!\n Please Check Your Network."), new Error());
        }
        if (xhr.status == 404){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Requested URL not found."), new Error());
        }
        if (xhr.status == 500){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Internel Server Error."), new Error());
        }
        if (xhr.statusText == "parsererror"){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Error.\nParsing JSON Request failed."), new Error());
        }
        if (xhr.statusText == "timeout"){
            throw $CreateException(new AlphaTab.IO.FileLoadException("Request Time out."), new Error());
        }
        throw $CreateException(new AlphaTab.IO.FileLoadException("Unknow Error: " + xhr.responseText), new Error());
    },
    LoadBinaryAsync: function (path, success, error){
        var ie = AlphaTab.Platform.JavaScript.JsFileLoader.GetIEVersion();
        if (ie >= 0 && ie <= 9){
            // use VB Loader to load binary array
            var vbArr = VbAjaxLoader("GET",path);
            var fileContents = vbArr.toArray();
            // decode byte array to string
            var data = new Array();
            var i = 0;
            while (i < (fileContents.length - 1)){
                data.push((fileContents[i]));
                i++;
            }
            var reader = AlphaTab.Platform.JavaScript.JsFileLoader.GetBytesFromString(data.join(''));
            success(reader);
        }
        else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = $CreateAnonymousDelegate(this, function (e){
                if (xhr.readyState == 4){
                    if (xhr.status == 200){
                        var reader = new Uint8Array(xhr.response);
                        success(reader);
                    }
                    else if (xhr.status == 0){
                        error(new AlphaTab.IO.FileLoadException("You are offline!!\n Please Check Your Network."));
                    }
                    else if (xhr.status == 404){
                        error(new AlphaTab.IO.FileLoadException("Requested URL not found."));
                    }
                    else if (xhr.status == 500){
                        error(new AlphaTab.IO.FileLoadException("Internel Server Error."));
                    }
                    else if (xhr.statusText == "parsererror"){
                        error(new AlphaTab.IO.FileLoadException("Error.\nParsing JSON Request failed."));
                    }
                    else if (xhr.statusText == "timeout"){
                        error(new AlphaTab.IO.FileLoadException("Request Time out."));
                    }
                    else {
                        error(new AlphaTab.IO.FileLoadException("Unknow Error: " + xhr.responseText));
                    }
                }
            });
            xhr.open("GET", path, true);
            xhr.responseType = "arraybuffer";
            xhr.send();
        }
    }
};
AlphaTab.Platform.JavaScript.JsFileLoader.GetIEVersion = function (){
    var rv = -1;
    var appName = navigator.appName;
    var agent = navigator.userAgent;
    if (appName == "Microsoft Internet Explorer"){
        var r = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
        var m = r.exec(agent);
        if (m != null){
            rv = AlphaTab.Platform.Std.ParseFloat(m[1]);
        }
    }
    return rv;
};
AlphaTab.Platform.JavaScript.JsFileLoader.GetBytesFromString = function (s){
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++){
        b[i] = s.charCodeAt(i);
    }
    return b;
};
AlphaTab.Platform.JavaScript.WorkerScoreRenderer = function (workerApi, rawSettings){
    this._workerApi = null;
    this._atRoot = null;
    this._worker = null;
    this.PreRender = null;
    this.PartialRenderFinished = null;
    this.RenderFinished = null;
    this.PostRenderFinished = null;
    this._workerApi = workerApi;
    var atRoot = rawSettings.atRoot;
    if (atRoot != "" && !(atRoot.lastIndexOf("/")==(atRoot.length-"/".length))){
        atRoot += "/";
    }
    this._atRoot = atRoot;
    this._worker = new Worker(atRoot + "AlphaTab.worker.js");
    var root = new Array();
    root.push(window.location.protocol);
    root.push("//");
    root.push(window.location.hostname);
    if (window.location.port){
        root.push(":");
        root.push(window.location.port);
    }
    root.push(this._atRoot);
    this._worker.postMessage({
        cmd: "initialize",
        root: root.join(''),
        settings: rawSettings
    });
    this._worker.addEventListener("message", $CreateDelegate(this, this.HandleWorkerMessage), false);
};
AlphaTab.Platform.JavaScript.WorkerScoreRenderer.prototype = {
    get_IsSvg: function (){
        return true;
    },
    Load: function (data, trackIndexes){
        this._worker.postMessage({
            cmd: "load",
            data: data,
            indexes: trackIndexes
        });
    },
    HandleWorkerMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "preRender":
                this.OnPreRender();
                break;
            case "partialRenderFinished":
                this.OnPartialRenderFinished(data["result"]);
                break;
            case "renderFinished":
                this.OnRenderFinished(data["result"]);
                break;
            case "postRenderFinished":
                this.OnPostRenderFinished();
                break;
            case "error":
                console.error(data["exception"]);
                break;
            case "loaded":
                var score = data["score"];
                if (score){
                var jsonConverter = new AlphaTab.Model.JsonConverter();
                score = jsonConverter.JsObjectToScore(score);
            }
                this._workerApi.TriggerEvent("loaded", score);
                break;
        }
    },
    RenderMultiple: function (trackIndexes){
        this._worker.postMessage({
            cmd: "renderMultiple",
            data: trackIndexes
        });
    },
    add_PreRender: function (value){
        this.PreRender = $CombineDelegates(this.PreRender, value);
    },
    remove_PreRender: function (value){
        this.PreRender = $RemoveDelegate(this.PreRender, value);
    },
    OnPreRender: function (){
        var handler = this.PreRender;
        if (handler != null)
            handler();
    },
    add_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $CombineDelegates(this.PartialRenderFinished, value);
    },
    remove_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $RemoveDelegate(this.PartialRenderFinished, value);
    },
    OnPartialRenderFinished: function (obj){
        var handler = this.PartialRenderFinished;
        if (handler != null)
            handler(obj);
    },
    add_RenderFinished: function (value){
        this.RenderFinished = $CombineDelegates(this.RenderFinished, value);
    },
    remove_RenderFinished: function (value){
        this.RenderFinished = $RemoveDelegate(this.RenderFinished, value);
    },
    OnRenderFinished: function (obj){
        var handler = this.RenderFinished;
        if (handler != null)
            handler(obj);
    },
    add_PostRenderFinished: function (value){
        this.PostRenderFinished = $CombineDelegates(this.PostRenderFinished, value);
    },
    remove_PostRenderFinished: function (value){
        this.PostRenderFinished = $RemoveDelegate(this.PostRenderFinished, value);
    },
    OnPostRenderFinished: function (){
        var handler = this.PostRenderFinished;
        if (handler != null)
            handler();
    },
    Tex: function (contents){
        this._worker.postMessage({
            cmd: "tex",
            data: contents
        });
    }
};
AlphaTab.Platform.Std = function (){
};
$StaticConstructor(function (){
    AlphaTab.Platform.Std._parseXml = null;
});
AlphaTab.Platform.Std.ParseFloat = function (s){
    return parseFloat(s);
};
AlphaTab.Platform.Std.ParseInt = function (s){
    return parseInt(s);
};
AlphaTab.Platform.Std.CloneArray = function (array){
    return new Int32Array(0);
};
AlphaTab.Platform.Std.BlockCopy = function (src, srcOffset, dst, dstOffset, count){
};
AlphaTab.Platform.Std.IsNullOrWhiteSpace = function (s){
    return s == null || s.trim().length == 0;
};
AlphaTab.Platform.Std.StringFromCharCode = function (c){
    return "";
};
AlphaTab.Platform.Std.Foreach = function (T, e, c){
    for ( var t in e ) { c(e[t]); }
};
AlphaTab.Platform.Std.LoadXml = function (xml){
    if (AlphaTab.Platform.Std._parseXml == null){
        var parseXml = null;
         
                if (typeof window.DOMParser != "undefined")
                {
                    parseXml = function(xmlStr) {
                        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
                    };
                }
                else if (typeof window.ActiveXObject != "undefined" &&
                     new window.ActiveXObject("Microsoft.XMLDOM"))
                {
                    parseXml = function(xmlStr) {
                        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = "false";
                        xmlDoc.loadXML(xmlStr);
                        return xmlDoc;
                    };
                }
                else
                {
                    throw new Error("No XML parser found");
                }
                ;
        AlphaTab.Platform.Std._parseXml = parseXml;
    }
    return new AlphaTab.Xml.XmlDocumentWrapper(AlphaTab.Platform.Std._parseXml(xml));
};
AlphaTab.Platform.Std.ReadSignedByte = function (readable){
    var n = readable.ReadByte();
    if (n >= 128)
        return (n - 256);
    return n;
};
AlphaTab.Platform.Std.ToString = function (data){
    var s = new Array();
    var i = 0;
    while (i < data.length){
        var c = data[i++];
        if (c < 128){
            if (c == 0)
                break;
            s.push(String.fromCharCode(c));
        }
        else if (c < 224){
            s.push(String.fromCharCode(((c & 63) << 6) | (data[i++] & 127)));
        }
        else if (c < 240){
            s.push(String.fromCharCode(((c & 31) << 12) | ((data[i++] & 127) << 6) | (data[i++] & 127)));
        }
        else {
            var u = ((c & 15) << 18) | ((data[i++] & 127) << 12) | ((data[i++] & 127) << 6) | (data[i++] & 127);
            s.push(String.fromCharCode((u >> 18) + 55232));
            s.push(String.fromCharCode((u & 1023) | 56320));
        }
    }
    return s.join('');
};
AlphaTab.Platform.Std.StringToByteArray = function (contents){
    var byteArray = new Uint8Array(contents.length);
    for (var i = 0; i < contents.length; i++){
        byteArray[i] = contents.charCodeAt(i);
    }
    return byteArray;
};
AlphaTab.Platform.Std.S4 = function (){
    var num = Math.floor((1 + Math.random()) * 65536);
    return num.toString(16).substring(1);
};
AlphaTab.Platform.Std.NewGuid = function (){
    return AlphaTab.Platform.Std.S4() + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + "-" + AlphaTab.Platform.Std.S4() + AlphaTab.Platform.Std.S4() + AlphaTab.Platform.Std.S4();
};
AlphaTab.Platform.Std.IsException = function (T, e){
    return false;
};
AlphaTab.Platform.Std.Random = function (max){
    return Math.random() * max;
};
AlphaTab.Platform.Std.IsStringNumber = function (s, allowSign){
    if (s.length == 0)
        return false;
    var c = s.charCodeAt(0);
    return AlphaTab.Platform.Std.IsCharNumber(c, allowSign);
};
AlphaTab.Platform.Std.IsCharNumber = function (c, allowSign){
    return (allowSign && c == 45) || (c >= 48 && c <= 57);
};
AlphaTab.Platform.Std.IsWhiteSpace = function (c){
    return c == 32 || c == 11 || c == 13 || c == 10;
};
AlphaTab.Platform.Std.ToHexString = function (n){
    var s = "";
    var hexChars = "0123456789ABCDEF";
    do{
        s = String.fromCharCode(hexChars.charCodeAt((n & 15))) + s;
        n >>= 4;
    }
    while (n > 0)
    return s;
};
AlphaTab.Platform.Std.GetNodeValue = function (n){
    if (n.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element || n.get_NodeType() == AlphaTab.Xml.XmlNodeType.Document){
        var txt = new Array();
        AlphaTab.Platform.Std.IterateChildren(n, function (c){
            txt.push(AlphaTab.Platform.Std.GetNodeValue(c));
        });
        return txt.join('').trim();
    }
    return n.get_Value();
};
AlphaTab.Platform.Std.IterateChildren = function (n, action){
    for (var i = 0; i < n.get_ChildNodes().get_Count(); i++){
        action(n.get_ChildNodes().Get(i));
    }
};
AlphaTab.Settings = function (){
    this.Scale = 0;
    this.Width = 0;
    this.Height = 0;
    this.Engine = null;
    this.Layout = null;
    this.ForcePianoFingering = false;
    this.Staves = null;
};
AlphaTab.Settings.FromJson = function (json){
    if ((json instanceof AlphaTab.Settings)){
        return json;
    }
    var settings = AlphaTab.Settings.get_Defaults();
    if (!json)
        return settings;
    if ("scale"in json)
        settings.Scale = json.scale;
    if ("width"in json)
        settings.Width = json.width;
    if ("height"in json)
        settings.Height = json.height;
    if ("engine"in json)
        settings.Engine = json.engine;
    if ("forcePianoFingering"in json)
        settings.ForcePianoFingering = json.forcePianoFingering;
    if ("layout"in json){
        if (typeof(json.layout) == "string"){
            settings.Layout.Mode = json.layout;
        }
        else {
            if (json.layout.mode)
                settings.Layout.Mode = json.layout.mode;
            if (json.layout.additionalSettings){
                var keys = Object.keys(json.layout.additionalSettings);
                for (var $i6 = 0,$l6 = keys.length,key = keys[$i6]; $i6 < $l6; $i6++, key = keys[$i6]){
                    settings.Layout.AdditionalSettings[key] = json.layout.additionalSettings[key];
                }
            }
        }
    }
    if ("staves"in json){
        settings.Staves = [];
        var keys = Object.keys(json.staves);
        for (var $i7 = 0,$l7 = keys.length,key = keys[$i7]; $i7 < $l7; $i7++, key = keys[$i7]){
            var val = json.staves[key];
            if (typeof(val) == "string"){
                settings.Staves.push(new AlphaTab.StaveSettings(val));
            }
            else {
                if (val.id){
                    var staveSettings = new AlphaTab.StaveSettings(val.id);
                    if (val.additionalSettings){
                        var keys2 = Object.keys(val.additionalSettings);
                        for (var $i8 = 0,$l8 = keys2.length,key2 = keys2[$i8]; $i8 < $l8; $i8++, key2 = keys2[$i8]){
                            staveSettings.AdditionalSettings[key2] = val.additionalSettings[key2];
                        }
                    }
                    settings.Staves.push(staveSettings);
                }
            }
        }
    }
    return settings;
};
AlphaTab.Settings.get_Defaults = function (){
    var settings = new AlphaTab.Settings();
    settings.Scale = 1;
    settings.Width = 950;
    settings.Height = 200;
    settings.Engine = "default";
    settings.Layout = AlphaTab.LayoutSettings.get_Defaults();
    settings.Staves = [];
    settings.Staves.push(new AlphaTab.StaveSettings("marker"));
    //settings.staves.Add(new StaveSettings("triplet-feel"));
    settings.Staves.push(new AlphaTab.StaveSettings("tempo"));
    settings.Staves.push(new AlphaTab.StaveSettings("text"));
    settings.Staves.push(new AlphaTab.StaveSettings("chords"));
    settings.Staves.push(new AlphaTab.StaveSettings("trill"));
    settings.Staves.push(new AlphaTab.StaveSettings("beat-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("note-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("alternate-endings"));
    settings.Staves.push(new AlphaTab.StaveSettings("score"));
    settings.Staves.push(new AlphaTab.StaveSettings("crescendo"));
    settings.Staves.push(new AlphaTab.StaveSettings("dynamics"));
    settings.Staves.push(new AlphaTab.StaveSettings("capo"));
    settings.Staves.push(new AlphaTab.StaveSettings("trill"));
    settings.Staves.push(new AlphaTab.StaveSettings("beat-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("note-vibrato"));
    settings.Staves.push(new AlphaTab.StaveSettings("tap"));
    settings.Staves.push(new AlphaTab.StaveSettings("fade-in"));
    settings.Staves.push(new AlphaTab.StaveSettings("harmonics"));
    settings.Staves.push(new AlphaTab.StaveSettings("let-ring"));
    settings.Staves.push(new AlphaTab.StaveSettings("palm-mute"));
    settings.Staves.push(new AlphaTab.StaveSettings("tab"));
    settings.Staves.push(new AlphaTab.StaveSettings("pick-stroke"));
    //settings.staves.Add(new StaveSettings("fingering"));
    return settings;
};
AlphaTab.Xml = AlphaTab.Xml || {};
AlphaTab.Xml.XmlAttributeCollectionWrapper = function (attributes){
    this._attributes = null;
    this._attributes = attributes;
};
AlphaTab.Xml.XmlAttributeCollectionWrapper.prototype = {
    Get: function (key){
        return new AlphaTab.Xml.XmlNodeWrapper(this._attributes.getNamedItem(key));
    }
};
AlphaTab.Xml.XmlDocumentWrapper = function (document){
    this._document = null;
    this._document = document;
};
AlphaTab.Xml.XmlDocumentWrapper.prototype = {
    get_DocumentElement: function (){
        return new AlphaTab.Xml.XmlNodeWrapper(this._document.documentElement);
    }
};
AlphaTab.Xml.XmlNodeCollectionWrapper = function (xmlNodeList){
    this._xmlNodeList = null;
    this._xmlNodeList = xmlNodeList;
};
AlphaTab.Xml.XmlNodeCollectionWrapper.prototype = {
    get_Count: function (){
        return this._xmlNodeList.length;
    },
    Get: function (index){
        return new AlphaTab.Xml.XmlNodeWrapper(this._xmlNodeList[index]);
    }
};
AlphaTab.Xml.XmlNodeWrapper = function (node){
    this._node = null;
    this._node = node;
};
AlphaTab.Xml.XmlNodeWrapper.prototype = {
    get_NodeType: function (){
        return this._node.nodeType;
    },
    get_LocalName: function (){
        return this._node.localName;
    },
    get_Value: function (){
        return this._node.nodeValue;
    },
    get_ChildNodes: function (){
        return new AlphaTab.Xml.XmlNodeCollectionWrapper(this._node.childNodes);
    },
    get_FirstChild: function (){
        return new AlphaTab.Xml.XmlNodeWrapper(this._node.firstChild);
    },
    get_Attributes: function (){
        return new AlphaTab.Xml.XmlAttributeCollectionWrapper(this._node.attributes);
    },
    GetAttribute: function (name){
        return this._node.getAttribute(name);
    },
    GetElementsByTagName: function (nodeName){
        return new AlphaTab.Xml.XmlNodeCollectionWrapper(this._node.getElementsByTagName(nodeName));
    }
};
AlphaTab.Audio = AlphaTab.Audio || {};
AlphaTab.Audio.GeneralMidi = function (){
};
$StaticConstructor(function (){
    AlphaTab.Audio.GeneralMidi._values = null;
});
AlphaTab.Audio.GeneralMidi.GetValue = function (name){
    if (AlphaTab.Audio.GeneralMidi._values == null){
        AlphaTab.Audio.GeneralMidi._values = {};
        AlphaTab.Audio.GeneralMidi._values["acousticgrandpiano"] = 0;
        AlphaTab.Audio.GeneralMidi._values["brightacousticpiano"] = 1;
        AlphaTab.Audio.GeneralMidi._values["electricgrandpiano"] = 2;
        AlphaTab.Audio.GeneralMidi._values["honkytonkpiano"] = 3;
        AlphaTab.Audio.GeneralMidi._values["electricpiano1"] = 4;
        AlphaTab.Audio.GeneralMidi._values["electricpiano2"] = 5;
        AlphaTab.Audio.GeneralMidi._values["harpsichord"] = 6;
        AlphaTab.Audio.GeneralMidi._values["clavinet"] = 7;
        AlphaTab.Audio.GeneralMidi._values["celesta"] = 8;
        AlphaTab.Audio.GeneralMidi._values["glockenspiel"] = 9;
        AlphaTab.Audio.GeneralMidi._values["musicbox"] = 10;
        AlphaTab.Audio.GeneralMidi._values["vibraphone"] = 11;
        AlphaTab.Audio.GeneralMidi._values["marimba"] = 12;
        AlphaTab.Audio.GeneralMidi._values["xylophone"] = 13;
        AlphaTab.Audio.GeneralMidi._values["tubularbells"] = 14;
        AlphaTab.Audio.GeneralMidi._values["dulcimer"] = 15;
        AlphaTab.Audio.GeneralMidi._values["drawbarorgan"] = 16;
        AlphaTab.Audio.GeneralMidi._values["percussiveorgan"] = 17;
        AlphaTab.Audio.GeneralMidi._values["rockorgan"] = 18;
        AlphaTab.Audio.GeneralMidi._values["churchorgan"] = 19;
        AlphaTab.Audio.GeneralMidi._values["reedorgan"] = 20;
        AlphaTab.Audio.GeneralMidi._values["accordion"] = 21;
        AlphaTab.Audio.GeneralMidi._values["harmonica"] = 22;
        AlphaTab.Audio.GeneralMidi._values["tangoaccordion"] = 23;
        AlphaTab.Audio.GeneralMidi._values["acousticguitarnylon"] = 24;
        AlphaTab.Audio.GeneralMidi._values["acousticguitarsteel"] = 25;
        AlphaTab.Audio.GeneralMidi._values["electricguitarjazz"] = 26;
        AlphaTab.Audio.GeneralMidi._values["electricguitarclean"] = 27;
        AlphaTab.Audio.GeneralMidi._values["electricguitarmuted"] = 28;
        AlphaTab.Audio.GeneralMidi._values["overdrivenguitar"] = 29;
        AlphaTab.Audio.GeneralMidi._values["distortionguitar"] = 30;
        AlphaTab.Audio.GeneralMidi._values["guitarharmonics"] = 31;
        AlphaTab.Audio.GeneralMidi._values["acousticbass"] = 32;
        AlphaTab.Audio.GeneralMidi._values["electricbassfinger"] = 33;
        AlphaTab.Audio.GeneralMidi._values["electricbasspick"] = 34;
        AlphaTab.Audio.GeneralMidi._values["fretlessbass"] = 35;
        AlphaTab.Audio.GeneralMidi._values["slapbass1"] = 36;
        AlphaTab.Audio.GeneralMidi._values["slapbass2"] = 37;
        AlphaTab.Audio.GeneralMidi._values["synthbass1"] = 38;
        AlphaTab.Audio.GeneralMidi._values["synthbass2"] = 39;
        AlphaTab.Audio.GeneralMidi._values["violin"] = 40;
        AlphaTab.Audio.GeneralMidi._values["viola"] = 41;
        AlphaTab.Audio.GeneralMidi._values["cello"] = 42;
        AlphaTab.Audio.GeneralMidi._values["contrabass"] = 43;
        AlphaTab.Audio.GeneralMidi._values["tremolostrings"] = 44;
        AlphaTab.Audio.GeneralMidi._values["pizzicatostrings"] = 45;
        AlphaTab.Audio.GeneralMidi._values["orchestralharp"] = 46;
        AlphaTab.Audio.GeneralMidi._values["timpani"] = 47;
        AlphaTab.Audio.GeneralMidi._values["stringensemble1"] = 48;
        AlphaTab.Audio.GeneralMidi._values["stringensemble2"] = 49;
        AlphaTab.Audio.GeneralMidi._values["synthstrings1"] = 50;
        AlphaTab.Audio.GeneralMidi._values["synthstrings2"] = 51;
        AlphaTab.Audio.GeneralMidi._values["choiraahs"] = 52;
        AlphaTab.Audio.GeneralMidi._values["voiceoohs"] = 53;
        AlphaTab.Audio.GeneralMidi._values["synthvoice"] = 54;
        AlphaTab.Audio.GeneralMidi._values["orchestrahit"] = 55;
        AlphaTab.Audio.GeneralMidi._values["trumpet"] = 56;
        AlphaTab.Audio.GeneralMidi._values["trombone"] = 57;
        AlphaTab.Audio.GeneralMidi._values["tuba"] = 58;
        AlphaTab.Audio.GeneralMidi._values["mutedtrumpet"] = 59;
        AlphaTab.Audio.GeneralMidi._values["frenchhorn"] = 60;
        AlphaTab.Audio.GeneralMidi._values["brasssection"] = 61;
        AlphaTab.Audio.GeneralMidi._values["synthbrass1"] = 62;
        AlphaTab.Audio.GeneralMidi._values["synthbrass2"] = 63;
        AlphaTab.Audio.GeneralMidi._values["sopranosax"] = 64;
        AlphaTab.Audio.GeneralMidi._values["altosax"] = 65;
        AlphaTab.Audio.GeneralMidi._values["tenorsax"] = 66;
        AlphaTab.Audio.GeneralMidi._values["baritonesax"] = 67;
        AlphaTab.Audio.GeneralMidi._values["oboe"] = 68;
        AlphaTab.Audio.GeneralMidi._values["englishhorn"] = 69;
        AlphaTab.Audio.GeneralMidi._values["bassoon"] = 70;
        AlphaTab.Audio.GeneralMidi._values["clarinet"] = 71;
        AlphaTab.Audio.GeneralMidi._values["piccolo"] = 72;
        AlphaTab.Audio.GeneralMidi._values["flute"] = 73;
        AlphaTab.Audio.GeneralMidi._values["recorder"] = 74;
        AlphaTab.Audio.GeneralMidi._values["panflute"] = 75;
        AlphaTab.Audio.GeneralMidi._values["blownbottle"] = 76;
        AlphaTab.Audio.GeneralMidi._values["shakuhachi"] = 77;
        AlphaTab.Audio.GeneralMidi._values["whistle"] = 78;
        AlphaTab.Audio.GeneralMidi._values["ocarina"] = 79;
        AlphaTab.Audio.GeneralMidi._values["lead1square"] = 80;
        AlphaTab.Audio.GeneralMidi._values["lead2sawtooth"] = 81;
        AlphaTab.Audio.GeneralMidi._values["lead3calliope"] = 82;
        AlphaTab.Audio.GeneralMidi._values["lead4chiff"] = 83;
        AlphaTab.Audio.GeneralMidi._values["lead5charang"] = 84;
        AlphaTab.Audio.GeneralMidi._values["lead6voice"] = 85;
        AlphaTab.Audio.GeneralMidi._values["lead7fifths"] = 86;
        AlphaTab.Audio.GeneralMidi._values["lead8bassandlead"] = 87;
        AlphaTab.Audio.GeneralMidi._values["pad1newage"] = 88;
        AlphaTab.Audio.GeneralMidi._values["pad2warm"] = 89;
        AlphaTab.Audio.GeneralMidi._values["pad3polysynth"] = 90;
        AlphaTab.Audio.GeneralMidi._values["pad4choir"] = 91;
        AlphaTab.Audio.GeneralMidi._values["pad5bowed"] = 92;
        AlphaTab.Audio.GeneralMidi._values["pad6metallic"] = 93;
        AlphaTab.Audio.GeneralMidi._values["pad7halo"] = 94;
        AlphaTab.Audio.GeneralMidi._values["pad8sweep"] = 95;
        AlphaTab.Audio.GeneralMidi._values["fx1rain"] = 96;
        AlphaTab.Audio.GeneralMidi._values["fx2soundtrack"] = 97;
        AlphaTab.Audio.GeneralMidi._values["fx3crystal"] = 98;
        AlphaTab.Audio.GeneralMidi._values["fx4atmosphere"] = 99;
        AlphaTab.Audio.GeneralMidi._values["fx5brightness"] = 100;
        AlphaTab.Audio.GeneralMidi._values["fx6goblins"] = 101;
        AlphaTab.Audio.GeneralMidi._values["fx7echoes"] = 102;
        AlphaTab.Audio.GeneralMidi._values["fx8scifi"] = 103;
        AlphaTab.Audio.GeneralMidi._values["sitar"] = 104;
        AlphaTab.Audio.GeneralMidi._values["banjo"] = 105;
        AlphaTab.Audio.GeneralMidi._values["shamisen"] = 106;
        AlphaTab.Audio.GeneralMidi._values["koto"] = 107;
        AlphaTab.Audio.GeneralMidi._values["kalimba"] = 108;
        AlphaTab.Audio.GeneralMidi._values["bagpipe"] = 109;
        AlphaTab.Audio.GeneralMidi._values["fiddle"] = 110;
        AlphaTab.Audio.GeneralMidi._values["shanai"] = 111;
        AlphaTab.Audio.GeneralMidi._values["tinklebell"] = 112;
        AlphaTab.Audio.GeneralMidi._values["agogo"] = 113;
        AlphaTab.Audio.GeneralMidi._values["steeldrums"] = 114;
        AlphaTab.Audio.GeneralMidi._values["woodblock"] = 115;
        AlphaTab.Audio.GeneralMidi._values["taikodrum"] = 116;
        AlphaTab.Audio.GeneralMidi._values["melodictom"] = 117;
        AlphaTab.Audio.GeneralMidi._values["synthdrum"] = 118;
        AlphaTab.Audio.GeneralMidi._values["reversecymbal"] = 119;
        AlphaTab.Audio.GeneralMidi._values["guitarfretnoise"] = 120;
        AlphaTab.Audio.GeneralMidi._values["breathnoise"] = 121;
        AlphaTab.Audio.GeneralMidi._values["seashore"] = 122;
        AlphaTab.Audio.GeneralMidi._values["birdtweet"] = 123;
        AlphaTab.Audio.GeneralMidi._values["telephonering"] = 124;
        AlphaTab.Audio.GeneralMidi._values["helicopter"] = 125;
        AlphaTab.Audio.GeneralMidi._values["applause"] = 126;
        AlphaTab.Audio.GeneralMidi._values["gunshot"] = 127;
    }
    name = name.toLowerCase().replace(" ","");
    return AlphaTab.Audio.GeneralMidi._values.hasOwnProperty(name) ? AlphaTab.Audio.GeneralMidi._values[name] : 0;
};
AlphaTab.Audio.GeneralMidi.IsPiano = function (program){
    // 1 Acoustic Grand Piano
    // 2 Bright Acoustic Piano
    // 3 Electric Grand Piano
    // 4 Honky - tonk Piano
    // 5 Electric Piano 1
    // 6 Electric Piano 2
    // 7 Harpsichord
    // 8 Clavi
    // 17 Drawbar Organ
    // 18 Percussive Organ
    // 19 Rock Organ
    // 20 Church Organ
    // 21 Reed Organ
    // 22 Accordion
    // 23 Harmonica
    // 24 Tango Accordion
    return program <= 8 || (program >= 17 && program <= 24);
};
AlphaTab.Audio.Generator = AlphaTab.Audio.Generator || {};
AlphaTab.Audio.Generator.MidiFileGenerator = function (score, handler, generateMetronome){
    this._score = null;
    this._handler = null;
    this._currentTempo = 0;
    this.GenerateMetronome = false;
    this._score = score;
    this._currentTempo = this._score.Tempo;
    this._handler = handler;
    this.GenerateMetronome = generateMetronome;
};
AlphaTab.Audio.Generator.MidiFileGenerator.prototype = {
    Generate: function (){
        // initialize tracks
        for (var i = 0,j = this._score.Tracks.length; i < j; i++){
            this.GenerateTrack(this._score.Tracks[i]);
        }
        var controller = new AlphaTab.Audio.Generator.MidiPlaybackController(this._score);
        var previousMasterBar = null;
        // store the previous played bar for repeats
        while (!controller.get_Finished()){
            var index = controller.Index;
            var bar = this._score.MasterBars[index];
            var currentTick = controller.CurrentTick;
            controller.ProcessCurrent();
            if (controller.ShouldPlay){
                this.GenerateMasterBar(bar, previousMasterBar, currentTick);
                for (var i = 0,j = this._score.Tracks.length; i < j; i++){
                    this.GenerateBar(this._score.Tracks[i].Bars[index], currentTick);
                }
            }
            controller.MoveNext();
            previousMasterBar = bar;
        }
    },
    GenerateTrack: function (track){
        // channel
        this.GenerateChannel(track, track.PlaybackInfo.PrimaryChannel, track.PlaybackInfo);
        if (track.PlaybackInfo.PrimaryChannel != track.PlaybackInfo.SecondaryChannel){
            this.GenerateChannel(track, track.PlaybackInfo.SecondaryChannel, track.PlaybackInfo);
        }
    },
    GenerateChannel: function (track, channel, playbackInfo){
        var volume = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(playbackInfo.Volume);
        var balance = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(playbackInfo.Balance);
        this._handler.AddControlChange(track.Index, 0, channel, 7, volume);
        this._handler.AddControlChange(track.Index, 0, channel, 10, balance);
        this._handler.AddControlChange(track.Index, 0, channel, 11, 127);
        // set parameter that is being updated (0) -> PitchBendRangeCoarse
        this._handler.AddControlChange(track.Index, 0, channel, 100, 0);
        this._handler.AddControlChange(track.Index, 0, channel, 101, 0);
        // Set PitchBendRangeCoarse to 12
        this._handler.AddControlChange(track.Index, 0, channel, 38, 0);
        this._handler.AddControlChange(track.Index, 0, channel, 6, 12);
        this._handler.AddProgramChange(track.Index, 0, channel, playbackInfo.Program);
    },
    GenerateMasterBar: function (masterBar, previousMasterBar, currentTick){
        // time signature
        if (previousMasterBar == null || previousMasterBar.TimeSignatureDenominator != masterBar.TimeSignatureDenominator || previousMasterBar.TimeSignatureNumerator != masterBar.TimeSignatureNumerator){
            this._handler.AddTimeSignature(currentTick, masterBar.TimeSignatureNumerator, masterBar.TimeSignatureDenominator);
        }
        // tempo
        if (previousMasterBar == null){
            this._handler.AddTempo(currentTick, masterBar.Score.Tempo);
            this._currentTempo = masterBar.Score.Tempo;
        }
        else if (masterBar.TempoAutomation != null){
            this._handler.AddTempo(currentTick, masterBar.TempoAutomation.Value | 0);
            this._currentTempo = ((masterBar.TempoAutomation.Value)) | 0;
        }
        // metronome
        if (this.GenerateMetronome){
            var start = currentTick;
            var length = AlphaTab.Audio.MidiUtils.ValueToTicks(masterBar.TimeSignatureDenominator);
            for (var i = 0; i < masterBar.TimeSignatureNumerator; i++){
                this._handler.AddMetronome(start, length);
                start += length;
            }
        }
    },
    GenerateBar: function (bar, barStartTick){
        for (var i = 0,j = bar.Voices.length; i < j; i++){
            this.GenerateVoice(bar.Voices[i], barStartTick);
        }
    },
    GenerateVoice: function (voice, barStartTick){
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            this.GenerateBeat(voice.Beats[i], barStartTick);
        }
    },
    GenerateBeat: function (beat, barStartTick){
        // TODO: take care of tripletfeel 
        var beatStart = beat.Start;
        var duration = beat.CalculateDuration();
        var track = beat.Voice.Bar.Track;
        for (var i = 0,j = beat.Automations.length; i < j; i++){
            this.GenerateAutomation(beat, beat.Automations[i], barStartTick);
        }
        if (beat.get_IsRest()){
            this._handler.AddRest(track.Index, barStartTick + beatStart, track.PlaybackInfo.PrimaryChannel);
        }
        else {
            var brushInfo = this.GetBrushInfo(beat);
            for (var i = 0,j = beat.Notes.length; i < j; i++){
                var n = beat.Notes[i];
                this.GenerateNote(n, barStartTick + beatStart, duration, brushInfo);
            }
        }
        if (beat.Vibrato != AlphaTab.Model.VibratoType.None){
            var phaseLength = 240;
            // ticks
            var bendAmplitude = 3;
            this.GenerateVibratorWithParams(beat.Voice.Bar.Track, barStartTick + beatStart, beat.CalculateDuration(), phaseLength, bendAmplitude);
        }
    },
    GenerateNote: function (note, beatStart, beatDuration, brushInfo){
        var track = note.Beat.Voice.Bar.Track;
        var noteKey = note.get_RealValue();
        var brushOffset = note.get_IsStringed() && note.String <= brushInfo.length ? brushInfo[note.String - 1] : 0;
        var noteStart = beatStart + brushOffset;
        var noteDuration = this.GetNoteDuration(note, beatDuration) - brushOffset;
        var dynamicValue = this.GetDynamicValue(note);
        // TODO: enable second condition after whammy generation is implemented
        if (!note.get_HasBend()){
            // reset bend 
            this._handler.AddBend(track.Index, noteStart, track.PlaybackInfo.PrimaryChannel, 64);
        }
        // 
        // Fade in
        if (note.Beat.FadeIn){
            this.GenerateFadeIn(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        // TODO: grace notes?
        //
        // Trill
        if (note.get_IsTrill() && !track.IsPercussion){
            this.GenerateTrill(note, noteStart, noteDuration, noteKey, dynamicValue);
            // no further generation needed
            return;
        }
        //
        // Tremolo Picking
        if (note.Beat.get_IsTremolo()){
            this.GenerateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue);
            // no further generation needed
            return;
        }
        //
        // All String Bending/Variation effects
        if (note.get_HasBend()){
            this.GenerateBend(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.Beat.get_HasWhammyBar()){
            this.GenerateWhammyBar(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.SlideType != AlphaTab.Model.SlideType.None){
            this.GenerateSlide(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.Vibrato != AlphaTab.Model.VibratoType.None){
            this.GenerateVibrato(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        //
        // Harmonics
        if (note.HarmonicType != AlphaTab.Model.HarmonicType.None){
            this.GenerateHarmonic(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        if (!note.IsTieDestination){
            this._handler.AddNote(track.Index, noteStart, noteDuration, noteKey, dynamicValue, track.PlaybackInfo.PrimaryChannel);
        }
    },
    GetNoteDuration: function (note, beatDuration){
        return this.ApplyDurationEffects(note, beatDuration);
        // a bit buggy:
        /*
        var lastNoteEnd = note.beat.start - note.beat.calculateDuration();
        var noteDuration = beatDuration;
        var currentBeat = note.beat.nextBeat;
        
        var letRingSuspend = false;
        
        // find the real note duration (let ring)
        while (currentBeat != null)
        {
        if (currentBeat.isRest())
        {
        return applyDurationEffects(note, noteDuration);
        }
        
        var letRing = currentBeat.voice == note.beat.voice && note.isLetRing;
        var letRingApplied = false;
        
        // we look for a note which still has let ring on or is a tie destination
        // in this case we increate the first played note
        var noteOnSameString = currentBeat.getNoteOnString(note.string);
        if (noteOnSameString != null)
        {
        // quit letring?
        if (!noteOnSameString.isTieDestination)
        {
        letRing = false; 
        letRingSuspend = true;
        
        // no let ring anymore, we are done
        if (!noteOnSameString.isLetRing)
        {
        return applyDurationEffects(note, noteDuration);
        }
        }
        
        // increase duration 
        letRingApplied = true;
        noteDuration += (currentBeat.start - lastNoteEnd) + noteOnSameString.beat.calculateDuration();
        lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
        }
        
        // if letRing is still active? (no note on the same string found)
        // and we didn't apply it already and of course it's not already stopped 
        // then we increase our duration as well
        if (letRing && !letRingApplied && !letRingSuspend)
        {
        noteDuration += (currentBeat.start - lastNoteEnd) + currentBeat.calculateDuration();
        lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
        }
        
        
        currentBeat = currentBeat.nextBeat;
        }
        
        return applyDurationEffects(note, noteDuration);*/
    },
    ApplyDurationEffects: function (note, duration){
        if (note.IsDead){
            return this.ApplyStaticDuration(30, duration);
        }
        if (note.IsPalmMute){
            return this.ApplyStaticDuration(80, duration);
        }
        if (note.IsStaccato){
            return ((duration / 2) | 0);
        }
        if (note.IsTieOrigin){
            var endNote = note.TieDestination;
            // for the initial start of the tie calculate absolute duration from start to end note
            if (!note.IsTieDestination){
                var startTick = note.Beat.get_AbsoluteStart();
                var endTick = endNote.Beat.get_AbsoluteStart() + this.GetNoteDuration(endNote, endNote.Beat.CalculateDuration());
                return endTick - startTick;
            }
            else {
                // for continuing ties, take the current duration + the one from the destination 
                // this branch will be entered as part of the recusion of the if branch
                return duration + this.GetNoteDuration(endNote, endNote.Beat.CalculateDuration());
            }
        }
        return duration;
    },
    ApplyStaticDuration: function (duration, maximum){
        var value = ((this._currentTempo * duration) / 60) | 0;
        return Math.min(value, maximum);
    },
    GetDynamicValue: function (note){
        var dynamicValue = note.Dynamic;
        // more silent on hammer destination
        if (!note.Beat.Voice.Bar.Track.IsPercussion && note.HammerPullOrigin != null){
            dynamicValue--;
        }
        // more silent on ghost notes
        if (note.IsGhost){
            dynamicValue--;
        }
        // louder on accent
        switch (note.Accentuated){
            case AlphaTab.Model.AccentuationType.Normal:
                dynamicValue++;
                break;
            case AlphaTab.Model.AccentuationType.Heavy:
                dynamicValue += 2;
                break;
        }
        return dynamicValue;
    },
    GenerateFadeIn: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Track;
        var endVolume = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(track.PlaybackInfo.Volume);
        var volumeFactor = endVolume / noteDuration;
        var tickStep = 120;
        var steps = ((noteDuration / tickStep) | 0);
        var endTick = noteStart + noteDuration;
        for (var i = steps - 1; i >= 0; i--){
            var tick = endTick - (i * tickStep);
            var volume = (tick - noteStart) * volumeFactor;
            if (i == steps - 1){
                this._handler.AddControlChange(track.Index, noteStart, track.PlaybackInfo.PrimaryChannel, 7, volume);
                this._handler.AddControlChange(track.Index, noteStart, track.PlaybackInfo.SecondaryChannel, 7, volume);
            }
            this._handler.AddControlChange(track.Index, tick, track.PlaybackInfo.PrimaryChannel, 7, volume);
            this._handler.AddControlChange(track.Index, tick, track.PlaybackInfo.SecondaryChannel, 7, volume);
        }
    },
    GenerateHarmonic: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        // TODO
    },
    GenerateVibrato: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var phaseLength = 480;
        // ticks
        var bendAmplitude = 2;
        var track = note.Beat.Voice.Bar.Track;
        this.GenerateVibratorWithParams(track, noteStart, noteDuration, phaseLength, bendAmplitude);
    },
    GenerateVibratorWithParams: function (track, noteStart, noteDuration, phaseLength, bendAmplitude){
        var resolution = 16;
        var phaseHalf = (phaseLength / 2) | 0;
        // 1st Phase stays at bend 0, 
        // then we have a sine wave with the given amplitude and phase length
        noteStart += phaseLength;
        var noteEnd = noteStart + noteDuration;
        while (noteStart < noteEnd){
            var phase = 0;
            var phaseDuration = noteStart + phaseLength < noteEnd ? phaseLength : noteEnd - noteStart;
            while (phase < phaseDuration){
                var bend = bendAmplitude * Math.sin(phase * 3.14159265358979 / phaseHalf);
                this._handler.AddBend(track.Index, noteStart + phase, track.PlaybackInfo.PrimaryChannel, (64 + bend));
                phase += resolution;
            }
            noteStart += phaseLength;
        }
    },
    GenerateSlide: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        // TODO 
    },
    GenerateWhammyBar: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        // TODO 
    },
    GenerateBend: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Track;
        var ticksPerPosition = (noteDuration) / 60;
        for (var i = 0; i < note.BendPoints.length - 1; i++){
            var currentPoint = note.BendPoints[i];
            var nextPoint = note.BendPoints[i + 1];
            // calculate the midi pitchbend values start and end values
            var currentBendValue = 64 + (currentPoint.Value * 2.75);
            var nextBendValue = 64 + (nextPoint.Value * 2.75);
            // how many midi ticks do we have to spend between this point and the next one?
            var ticksBetweenPoints = ticksPerPosition * (nextPoint.Offset - currentPoint.Offset);
            // we will generate one pitchbend message for each value
            // for this we need to calculate how many ticks to offset per value
            var ticksPerValue = ticksBetweenPoints / Math.abs(nextBendValue - currentBendValue);
            var tick = noteStart + (ticksPerPosition * currentPoint.Offset);
            // bend up
            if (currentBendValue < nextBendValue){
                while (currentBendValue <= nextBendValue){
                    this._handler.AddBend(track.Index, tick | 0, track.PlaybackInfo.PrimaryChannel, Math.round(currentBendValue));
                    currentBendValue++;
                    tick += ticksPerValue;
                }
            }
            else if (currentBendValue > nextBendValue){
                while (currentBendValue >= nextBendValue){
                    this._handler.AddBend(track.Index, tick | 0, track.PlaybackInfo.PrimaryChannel, Math.round(currentBendValue));
                    currentBendValue--;
                    tick += ticksPerValue;
                }
            }
        }
    },
    GenerateTrill: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Track;
        var trillKey = note.get_StringTuning() + note.get_TrillFret();
        var trillLength = AlphaTab.Audio.MidiUtils.ToTicks(note.TrillSpeed);
        var realKey = true;
        var tick = noteStart;
        while (tick + 10 < (noteStart + noteDuration)){
            // only the rest on last trill play
            if ((tick + trillLength) >= (noteStart + noteDuration)){
                trillLength = (noteStart + noteDuration) - tick;
            }
            this._handler.AddNote(track.Index, tick, trillLength, (realKey ? trillKey : noteKey), dynamicValue, track.PlaybackInfo.PrimaryChannel);
            realKey = !realKey;
            tick += trillLength;
        }
    },
    GenerateTremoloPicking: function (note, noteStart, noteDuration, noteKey, dynamicValue){
        var track = note.Beat.Voice.Bar.Track;
        var tpLength = AlphaTab.Audio.MidiUtils.ToTicks(note.Beat.TremoloSpeed);
        var tick = noteStart;
        while (tick + 10 < (noteStart + noteDuration)){
            // only the rest on last trill play
            if ((tick + tpLength) >= (noteStart + noteDuration)){
                tpLength = (noteStart + noteDuration) - tick;
            }
            this._handler.AddNote(track.Index, tick, tpLength, noteKey, dynamicValue, track.PlaybackInfo.PrimaryChannel);
            tick += tpLength;
        }
    },
    GetBrushInfo: function (beat){
        var brushInfo = new Int32Array(beat.Voice.Bar.Track.Tuning.length);
        if (beat.BrushType != AlphaTab.Model.BrushType.None){
            // 
            // calculate the number of  
            // a mask where the single bits indicate the strings used
            var stringUsed = 0;
            for (var i = 0,j = beat.Notes.length; i < j; i++){
                var n = beat.Notes[i];
                if (n.IsTieDestination)
                    continue;
                stringUsed |= 1 << (n.String - 1);
            }
            //
            // calculate time offset for all strings
            if (beat.Notes.length > 0){
                var brushMove = 0;
                var brushIncrement = this.GetBrushIncrement(beat);
                for (var i = 0,j = beat.Voice.Bar.Track.Tuning.length; i < j; i++){
                    var index = (beat.BrushType == AlphaTab.Model.BrushType.ArpeggioDown || beat.BrushType == AlphaTab.Model.BrushType.BrushDown) ? i : ((brushInfo.length - 1) - i);
                    if ((stringUsed & (1 << index)) != 0){
                        brushInfo[index] = brushMove;
                        brushMove = brushIncrement;
                    }
                }
            }
        }
        return brushInfo;
    },
    GetBrushIncrement: function (beat){
        if (beat.BrushDuration == 0)
            return 0;
        var duration = beat.CalculateDuration();
        if (duration == 0)
            return 0;
        return (((duration / 8) * (4 / beat.BrushDuration))) | 0;
    },
    GenerateAutomation: function (beat, automation, startMove){
        switch (automation.Type){
            case AlphaTab.Model.AutomationType.Instrument:
                this._handler.AddProgramChange(beat.Voice.Bar.Track.Index, beat.Start + startMove, beat.Voice.Bar.Track.PlaybackInfo.PrimaryChannel, (automation.Value));
                this._handler.AddProgramChange(beat.Voice.Bar.Track.Index, beat.Start + startMove, beat.Voice.Bar.Track.PlaybackInfo.SecondaryChannel, (automation.Value));
                break;
            case AlphaTab.Model.AutomationType.Balance:
                this._handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove, beat.Voice.Bar.Track.PlaybackInfo.PrimaryChannel, 10, (automation.Value));
                this._handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove, beat.Voice.Bar.Track.PlaybackInfo.SecondaryChannel, 10, (automation.Value));
                break;
            case AlphaTab.Model.AutomationType.Volume:
                this._handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove, beat.Voice.Bar.Track.PlaybackInfo.PrimaryChannel, 7, (automation.Value));
                this._handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove, beat.Voice.Bar.Track.PlaybackInfo.SecondaryChannel, 7, (automation.Value));
                break;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Audio.Generator.MidiFileGenerator.DefaultBend = 64;
    AlphaTab.Audio.Generator.MidiFileGenerator.DefaultBendSemitone = 2.75;
});
AlphaTab.Audio.Generator.MidiFileGenerator.GenerateMidiFile = function (score, generateMetronome){
    var midiFile = new AlphaTab.Audio.Model.MidiFile();
    // create score tracks + metronometrack
    for (var i = 0,j = score.Tracks.length; i < j; i++){
        midiFile.CreateTrack();
    }
    midiFile.InfoTrack = 0;
    var handler = new AlphaTab.Audio.Generator.MidiFileHandler(midiFile);
    var generator = new AlphaTab.Audio.Generator.MidiFileGenerator(score, handler, generateMetronome);
    generator.Generate();
    return midiFile;
};
AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort = function (data){
    var value = Math.max(-32768, Math.min(32767, (data * 8) - 1));
    return (Math.max(value, -1)) + 1;
};
AlphaTab.Audio.Generator.MidiFileHandler = function (midiFile){
    this._midiFile = null;
    this._metronomeTrack = 0;
    this._midiFile = midiFile;
    this._metronomeTrack = -1;
};
AlphaTab.Audio.Generator.MidiFileHandler.prototype = {
    AddEvent: function (track, tick, message){
        this._midiFile.Tracks[track].AddEvent(new AlphaTab.Audio.Model.MidiEvent(tick, message));
    },
    MakeCommand: function (command, channel){
        return ((command & 240) | (channel & 15));
    },
    AddTimeSignature: function (tick, timeSignatureNumerator, timeSignatureDenominator){
        var denominatorIndex = 0;
        while ((timeSignatureDenominator = (timeSignatureDenominator >> 1)) > 0){
            denominatorIndex++;
        }
        this.AddEvent(this._midiFile.InfoTrack, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage(88, new Uint8Array([(timeSignatureNumerator & 255), (denominatorIndex & 255), 48, 8])));
    },
    AddRest: function (track, tick, channel){
        this.AddEvent(track, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildSysExMessage(new Uint8Array([0])));
    },
    AddNote: function (track, start, length, key, dynamicValue, channel){
        var velocity = AlphaTab.Audio.MidiUtils.DynamicToVelocity(dynamicValue);
        this.AddEvent(track, start, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(144, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(key), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(velocity)])));
        this.AddEvent(track, start + length, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(128, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(key), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(velocity)])));
    },
    AddControlChange: function (track, tick, channel, controller, value){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(176, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(controller), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(value)])));
    },
    AddProgramChange: function (track, tick, channel, program){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(192, channel), AlphaTab.Audio.Generator.MidiFileHandler.FixValue(program)])));
    },
    AddTempo: function (tick, tempo){
        // bpm -> microsecond per quarter note
        var tempoInUsq = ((60000000 / tempo) | 0);
        this.AddEvent(this._midiFile.InfoTrack, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage(81, new Uint8Array([((tempoInUsq >> 16) & 255), ((tempoInUsq >> 8) & 255), (tempoInUsq & 255)])));
    },
    AddBend: function (track, tick, channel, value){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(224, channel), 0, AlphaTab.Audio.Generator.MidiFileHandler.FixValue(value)])));
    },
    AddMetronome: function (start, length){
        if (this._metronomeTrack == -1){
            this._midiFile.CreateTrack();
            this._metronomeTrack = this._midiFile.Tracks.length - 1;
        }
        this.AddNote(this._metronomeTrack, start, length, 37, AlphaTab.Model.DynamicValue.F, 9);
    }
};
$StaticConstructor(function (){
    AlphaTab.Audio.Generator.MidiFileHandler.DefaultMetronomeKey = 37;
    AlphaTab.Audio.Generator.MidiFileHandler.DefaultDurationDead = 30;
    AlphaTab.Audio.Generator.MidiFileHandler.DefaultDurationPalmMute = 80;
    AlphaTab.Audio.Generator.MidiFileHandler.RestMessage = 0;
});
AlphaTab.Audio.Generator.MidiFileHandler.FixValue = function (value){
    if (value > 127)
        return 127;
    return value;
};
AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage = function (metaType, data){
    var meta = AlphaTab.IO.ByteBuffer.Empty();
    meta.WriteByte(255);
    meta.WriteByte((metaType & 255));
    AlphaTab.Audio.Generator.MidiFileHandler.WriteVarInt(meta, data.length);
    meta.Write(data, 0, data.length);
    return new AlphaTab.Audio.Model.MidiMessage(meta.ToArray());
};
AlphaTab.Audio.Generator.MidiFileHandler.WriteVarInt = function (data, v){
    var n = 0;
    var array = new Uint8Array(4);
    do{
        array[n++] = ((v & 127) & 255);
        v >>= 7;
    }
    while (v > 0)
    while (n > 0){
        n--;
        if (n > 0)
            data.WriteByte(((array[n] | 128) & 255));
        else
            data.WriteByte(array[n]);
    }
};
AlphaTab.Audio.Generator.MidiFileHandler.BuildSysExMessage = function (data){
    var sysex = AlphaTab.IO.ByteBuffer.Empty();
    sysex.WriteByte(240);
    // status 
    AlphaTab.Audio.Generator.MidiFileHandler.WriteVarInt(sysex, data.length + 2);
    // write length of data
    sysex.WriteByte(0);
    // manufacturer id
    sysex.Write(data, 0, data.length);
    // data
    sysex.WriteByte(247);
    // end of data
    return new AlphaTab.Audio.Model.MidiMessage(sysex.ToArray());
};
AlphaTab.Audio.Generator.MidiPlaybackController = function (score){
    this._score = null;
    this._currentAlternateEndings = 0;
    this._repeatStartIndex = 0;
    this._repeatNumber = 0;
    this._repeatOpen = false;
    this.ShouldPlay = false;
    this.Index = 0;
    this.CurrentTick = 0;
    this._score = score;
    this.ShouldPlay = true;
    this.Index = 0;
    this.CurrentTick = 0;
};
AlphaTab.Audio.Generator.MidiPlaybackController.prototype = {
    get_Finished: function (){
        return this.Index >= this._score.MasterBars.length;
    },
    ProcessCurrent: function (){
        var masterBar = this._score.MasterBars[this.Index];
        var masterBarAlternateEndings = masterBar.AlternateEndings;
        // if the repeat group wasn't closed we reset the repeating 
        // on the last group opening
        if (!masterBar.RepeatGroup.IsClosed && masterBar.RepeatGroup.Openings[masterBar.RepeatGroup.Openings.length - 1] == masterBar){
            this._repeatNumber = 0;
            this._repeatOpen = false;
        }
        if ((masterBar.IsRepeatStart || masterBar.Index == 0) && this._repeatNumber == 0){
            this._repeatStartIndex = this.Index;
            this._repeatOpen = true;
        }
        else if (masterBar.IsRepeatStart){
            this.ShouldPlay = true;
        }
        // if we encounter an alternate ending
        if (this._repeatOpen && masterBarAlternateEndings > 0){
            // do we need to skip this section?
            if ((masterBarAlternateEndings & (1 << this._repeatNumber)) == 0){
                this.ShouldPlay = false;
            }
            else {
                this.ShouldPlay = true;
            }
        }
        if (this.ShouldPlay){
            this.CurrentTick += masterBar.CalculateDuration();
        }
    },
    MoveNext: function (){
        var masterBar = this._score.MasterBars[this.Index];
        var masterBarAlternateEndings = masterBar.AlternateEndings;
        var masterBarRepeatCount = masterBar.RepeatCount - 1;
        // if we encounter a repeat end 
        if (this._repeatOpen && (masterBarRepeatCount > 0)){
            // more repeats required?
            if (this._repeatNumber < masterBarRepeatCount){
                // jump to start
                this.Index = this._repeatStartIndex;
                this._repeatNumber++;
            }
            else {
                // no repeats anymore, jump after repeat end
                this._repeatNumber = 0;
                this._repeatOpen = false;
                this._currentAlternateEndings = 0;
                this.ShouldPlay = true;
                this.Index++;
            }
        }
        else {
            this.Index++;
        }
    }
};
AlphaTab.Audio.MidiUtils = function (){
};
$StaticConstructor(function (){
    AlphaTab.Audio.MidiUtils.QuarterTime = 960;
    AlphaTab.Audio.MidiUtils.PercussionChannel = 9;
    AlphaTab.Audio.MidiUtils.MinVelocity = 15;
    AlphaTab.Audio.MidiUtils.VelocityIncrement = 16;
});
AlphaTab.Audio.MidiUtils.ToTicks = function (duration){
    return AlphaTab.Audio.MidiUtils.ValueToTicks(duration);
};
AlphaTab.Audio.MidiUtils.ValueToTicks = function (duration){
    return ((960 * (4 / duration))) | 0;
};
AlphaTab.Audio.MidiUtils.ApplyDot = function (ticks, doubleDotted){
    if (doubleDotted){
        return ticks + ((ticks / 4) | 0) * 3;
    }
    return ticks + (ticks / 2) | 0;
};
AlphaTab.Audio.MidiUtils.ApplyTuplet = function (ticks, numerator, denominator){
    return (ticks * denominator / numerator) | 0;
};
AlphaTab.Audio.MidiUtils.DynamicToVelocity = function (dyn){
    return (15 + ((dyn) * 16));
    // switch(dynamicValue)
    // {
    //     case PPP:   return (MinVelocity + (0 * VelocityIncrement));
    //     case PP:    return (MinVelocity + (1 * VelocityIncrement));
    //     case P:     return (MinVelocity + (2 * VelocityIncrement));
    //     case MP:    return (MinVelocity + (3 * VelocityIncrement));
    //     case MF:    return (MinVelocity + (4 * VelocityIncrement));
    //     case F:     return (MinVelocity + (5 * VelocityIncrement));
    //     case FF:    return (MinVelocity + (6 * VelocityIncrement));
    //     case FFF:   return (MinVelocity + (7 * VelocityIncrement));
    // }
};
AlphaTab.Audio.MidiUtils.BuildTickLookup = function (score){
    var lookup = new AlphaTab.Audio.Model.MidiTickLookup();
    var controller = new AlphaTab.Audio.Generator.MidiPlaybackController(score);
    while (!controller.get_Finished()){
        var index = controller.Index;
        var currentTick = controller.CurrentTick;
        controller.ProcessCurrent();
        if (controller.ShouldPlay){
            var bar = new AlphaTab.Audio.Model.BarTickLookup();
            bar.Bar = score.MasterBars[index];
            bar.Start = currentTick;
            bar.End = bar.Start + bar.Bar.CalculateDuration();
            lookup.AddBar(bar);
        }
        controller.MoveNext();
    }
    return lookup;
};
AlphaTab.Audio.Model = AlphaTab.Audio.Model || {};
AlphaTab.Audio.Model.MidiController = {
    DataEntryCoarse: 6,
    VolumeCoarse: 7,
    PanCoarse: 10,
    ExpressionControllerCoarse: 11,
    DataEntryFine: 38,
    RegisteredParameterFine: 100,
    RegisteredParameterCourse: 101
};
AlphaTab.Audio.Model.MidiEvent = function (tick, message){
    this.Track = null;
    this.Tick = 0;
    this.Message = null;
    this.NextEvent = null;
    this.PreviousEvent = null;
    this.Tick = tick;
    this.Message = message;
};
AlphaTab.Audio.Model.MidiEvent.prototype = {
    get_DeltaTicks: function (){
        return this.PreviousEvent == null ? 0 : this.Tick - this.PreviousEvent.Tick;
    },
    WriteTo: function (s){
        this.WriteVariableInt(s, this.get_DeltaTicks());
        this.Message.WriteTo(s);
    },
    WriteVariableInt: function (s, value){
        var array = new Uint8Array(4);
        var n = 0;
        do{
            array[n++] = ((value & 127) & 255);
            value >>= 7;
        }
        while (value > 0)
        while (n > 0){
            n--;
            if (n > 0)
                s.WriteByte((array[n] | 128));
            else
                s.WriteByte(array[n]);
        }
    }
};
AlphaTab.Audio.Model.MidiFile = function (){
    this.Tracks = null;
    this.InfoTrack = 0;
    this.Tracks = [];
};
AlphaTab.Audio.Model.MidiFile.prototype = {
    CreateTrack: function (){
        var track = new AlphaTab.Audio.Model.MidiTrack();
        track.Index = this.Tracks.length;
        track.File = this;
        this.Tracks.push(track);
        return track;
    },
    WriteTo: function (s){
        var b;
        // magic number "MThd" (0x4D546864)
        b = new Uint8Array([77, 84, 104, 100]);
        s.Write(b, 0, b.length);
        // Header Length 6 (0x00000006)
        b = new Uint8Array([0, 0, 0, 6]);
        s.Write(b, 0, b.length);
        // format 
        b = new Uint8Array([0, 1]);
        s.Write(b, 0, b.length);
        // number of tracks
        var v = (this.Tracks.length) | 0;
        b = new Uint8Array([((v >> 8) & 255), (v & 255)]);
        s.Write(b, 0, b.length);
        v = 960;
        b = new Uint8Array([((v >> 8) & 255), (v & 255)]);
        s.Write(b, 0, b.length);
        for (var i = 0,j = this.Tracks.length; i < j; i++){
            this.Tracks[i].WriteTo(s);
        }
    }
};
AlphaTab.Audio.Model.MidiMessage = function (data){
    this.Event = null;
    this.Data = null;
    this.Data = data;
};
AlphaTab.Audio.Model.MidiMessage.prototype = {
    WriteTo: function (s){
        s.Write(this.Data, 0, this.Data.length);
    }
};
AlphaTab.Audio.Model.BarTickLookup = function (){
    this.Start = 0;
    this.End = 0;
    this.Bar = null;
};
AlphaTab.Audio.Model.MidiTickLookup = function (){
    this._lastBeat = null;
    this.Bars = null;
    this.BarLookup = null;
    this.Bars = [];
    this.BarLookup = {};
};
AlphaTab.Audio.Model.MidiTickLookup.prototype = {
    FindBeat: function (track, tick){
        //
        // some heuristics: try last found beat and it's next beat for lookup first
        // try last beat or next beat of last beat first
        if (this._lastBeat != null && this._lastBeat.NextBeat != null && this._lastBeat.Voice.Bar.Track == track){
            // check if tick is between _lastBeat and _lastBeat.nextBeat (still _lastBeat)
            if (tick >= this._lastBeat.get_AbsoluteStart() && tick < this._lastBeat.NextBeat.get_AbsoluteStart()){
                return this._lastBeat;
            }
            // we need a upper-next beat to check the nextbeat range 
            // TODO: this logic does not apply properly for alternate endings and repeats, better "next beat" detection using 
            // "next bar" info
            //if (_lastBeat.NextBeat.NextBeat != null && tick >= _lastBeat.NextBeat.AbsoluteStart && tick < _lastBeat.NextBeat.NextBeat.AbsoluteStart
            //    && !(_lastBeat.Index == _lastBeat.Voice.Beats.Count - 1 && _lastBeat.Voice.Bar.MasterBar.IsRepeatEnd))
            //{
            //    _lastBeat = _lastBeat.NextBeat;
            //    return _lastBeat;
            //}
        }
        //
        // Global Search
        // binary search within lookup
        var lookup = this.FindBar(tick);
        if (lookup == null)
            return null;
        var masterBar = lookup.Bar;
        var bar = track.Bars[masterBar.Index];
        // remap tick to initial bar start
        tick = (tick - lookup.Start + masterBar.Start);
        // linear search beat within beats
        var beat = null;
        for (var i = 0,j = bar.Voices[0].Beats.length; i < j; i++){
            var b = bar.Voices[0].Beats[i];
            // we search for the first beat which 
            // starts after the tick. 
            if (beat == null || b.get_AbsoluteStart() <= tick){
                beat = b;
            }
            else {
                break;
            }
        }
        this._lastBeat = beat;
        return this._lastBeat;
    },
    FindBar: function (tick){
        var bottom = 0;
        var top = this.Bars.length - 1;
        while (bottom <= top){
            var middle = ((top + bottom) / 2) | 0;
            var bar = this.Bars[middle];
            // found?
            if (tick >= bar.Start && tick <= bar.End){
                return bar;
            }
            // search in lower half 
            if (tick < bar.Start){
                top = middle - 1;
            }
            else {
                bottom = middle + 1;
            }
        }
        return null;
    },
    GetMasterBarStart: function (bar){
        if (!this.BarLookup.hasOwnProperty(bar.Index)){
            return 0;
        }
        return this.BarLookup[bar.Index].Start;
    },
    AddBar: function (bar){
        this.Bars.push(bar);
        if (!this.BarLookup.hasOwnProperty(bar.Bar.Index)){
            this.BarLookup[bar.Bar.Index] = bar;
        }
    }
};
AlphaTab.Audio.Model.MidiTrack = function (){
    this.Index = 0;
    this.File = null;
    this.FirstEvent = null;
    this.LastEvent = null;
};
AlphaTab.Audio.Model.MidiTrack.prototype = {
    AddEvent: function (e){
        e.Track = this;
        // first entry 
        if (this.FirstEvent == null){
            // first and last e
            this.FirstEvent = e;
            this.LastEvent = e;
        }
        else {
            // is the e after the last one?
            if (this.LastEvent.Tick <= e.Tick){
                // make the new e the last one
                this.LastEvent.NextEvent = e;
                e.PreviousEvent = this.LastEvent;
                this.LastEvent = e;
            }
            else if (this.FirstEvent.Tick > e.Tick){
                // make the new e the new head
                e.NextEvent = this.FirstEvent;
                this.FirstEvent.PreviousEvent = e;
                this.FirstEvent = e;
            }
            else {
                // we assume equal tick distribution and search for
                // the lesser distance,
                // start inserting on first e or last e?
                // use smaller delta 
                var firstDelta = e.Tick - this.FirstEvent.Tick;
                var lastDelta = this.LastEvent.Tick - e.Tick;
                if (firstDelta < lastDelta){
                    // search position from start to end
                    var previous = this.FirstEvent;
                    // as long the upcoming e is still before 
                    // the new one
                    while (previous != null && previous.NextEvent != null && previous.NextEvent.Tick <= e.Tick){
                        // we're moving to the next e 
                        previous = previous.NextEvent;
                    }
                    if (previous == null)
                        return;
                    // insert after the found element
                    var next = previous.NextEvent;
                    // update previous
                    previous.NextEvent = e;
                    // update new
                    e.PreviousEvent = previous;
                    e.NextEvent = next;
                    // update next
                    if (next != null){
                        next.PreviousEvent = e;
                    }
                }
                else {
                    // search position from end to start
                    var next = this.LastEvent;
                    // as long the previous e is after the new one
                    while (next != null && next.PreviousEvent != null && next.PreviousEvent.Tick > e.Tick){
                        // we're moving to previous e
                        next = next.PreviousEvent;
                    }
                    if (next == null)
                        return;
                    var previous = next.PreviousEvent;
                    // update next
                    next.PreviousEvent = e;
                    // update new
                    e.NextEvent = next;
                    e.PreviousEvent = previous;
                    // update previous
                    if (previous != null){
                        previous.NextEvent = e;
                    }
                    else {
                        this.FirstEvent = e;
                    }
                }
            }
        }
    },
    WriteTo: function (s){
        // build track data first
        var trackData = AlphaTab.IO.ByteBuffer.Empty();
        var current = this.FirstEvent;
        var count = 0;
        while (current != null){
            current.WriteTo(trackData);
            current = current.NextEvent;
            count++;
        }
        // magic number "MTrk" (0x4D54726B)
        var b = new Uint8Array([77, 84, 114, 107]);
        s.Write(b, 0, b.length);
        // size as integer
        var data = trackData.ToArray();
        var l = data.length;
        b = new Uint8Array([((l >> 24) & 255), ((l >> 16) & 255), ((l >> 8) & 255), ((l >> 0) & 255)]);
        s.Write(b, 0, b.length);
        s.Write(data, 0, data.length);
    }
};
AlphaTab.Exporter = AlphaTab.Exporter || {};
AlphaTab.Exporter.AlphaTexExporter = function (){
    this._builder = null;
    this._builder = new Array();
};
AlphaTab.Exporter.AlphaTexExporter.prototype = {
    Export: function (track){
        this.Score(track);
    },
    Score: function (track){
        this.MetaData(track);
        this.Bars(track);
    },
    ToTex: function (){
        return this._builder.join('');
    },
    MetaData: function (track){
        var score = track.Score;
        this.StringMetaData("title", score.Title);
        this.StringMetaData("subtitle", score.SubTitle);
        this.StringMetaData("artist", score.Artist);
        this.StringMetaData("album", score.Album);
        this.StringMetaData("words", score.Words);
        this.StringMetaData("music", score.Music);
        this.StringMetaData("copyright", score.Copyright);
        this._builder.push("\\tempo ");
        this._builder.push(score.Tempo);
        this._builder.push('\r\n');
        if (track.Capo > 0){
            this._builder.push("\\capo ");
            this._builder.push(track.Capo);
            this._builder.push('\r\n');
        }
        this._builder.push("\\tuning");
        for (var i = 0; i < track.Tuning.length; i++){
            this._builder.push(" ");
            this._builder.push(AlphaTab.Model.Tuning.GetTextForTuning(track.Tuning[i], true));
        }
        this._builder.push("\\instrument ");
        this._builder.push(track.PlaybackInfo.Program);
        this._builder.push('\r\n');
        this._builder.push(".");
        this._builder.push('\r\n');
    },
    StringMetaData: function (key, value){
        if (!AlphaTab.Platform.Std.IsNullOrWhiteSpace(value)){
            this._builder.push("\\");
            this._builder.push(key);
            this._builder.push(" \"");
            this._builder.push(value.replace("\"","\\\""));
            this._builder.push("\"");
            this._builder.push('\r\n');
        }
    },
    Bars: function (track){
        for (var i = 0; i < track.Bars.length; i++){
            if (i > 0){
                this._builder.push(" |");
                this._builder.push('\r\n');
            }
            this.Bar(track.Bars[i]);
        }
    },
    Bar: function (bar){
        this.BarMeta(bar);
        this.Voice(bar.Voices[0]);
    },
    Voice: function (voice){
        for (var i = 0; i < voice.Beats.length; i++){
            this.Beat(voice.Beats[i]);
        }
    },
    Beat: function (beat){
        if (beat.get_IsRest()){
            this._builder.push("r");
        }
        else {
            if (beat.Notes.length > 1){
                this._builder.push("(");
            }
            for (var i = 0; i < beat.Notes.length; i++){
                this.Note(beat.Notes[i]);
            }
            if (beat.Notes.length > 1){
                this._builder.push(")");
            }
        }
        this._builder.push(".");
        this._builder.push(beat.Duration);
        this._builder.push(" ");
        this.BeatEffects(beat);
    },
    Note: function (note){
        if (note.IsDead){
            this._builder.push("x");
        }
        else if (note.IsTieDestination){
            this._builder.push("-");
        }
        else {
            this._builder.push(note.Fret);
        }
        this._builder.push(".");
        this._builder.push(note.Beat.Voice.Bar.Track.Tuning.length - note.String + 1);
        this._builder.push(" ");
        this.NoteEffects(note);
    },
    NoteEffects: function (note){
        var hasEffectOpen = false;
        if (note.get_HasBend()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("be (");
            for (var i = 0; i < note.BendPoints.length; i++){
                this._builder.push(note.BendPoints[i].Offset);
                this._builder.push(" ");
                this._builder.push(note.BendPoints[i].Value);
                this._builder.push(" ");
            }
            this._builder.push(")");
        }
        switch (note.HarmonicType){
            case AlphaTab.Model.HarmonicType.Natural:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("nh ");
                break;
            case AlphaTab.Model.HarmonicType.Artificial:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("ah ");
                break;
            case AlphaTab.Model.HarmonicType.Tap:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("th ");
                break;
            case AlphaTab.Model.HarmonicType.Pinch:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("ph ");
                break;
            case AlphaTab.Model.HarmonicType.Semi:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("sh ");
                break;
        }
        if (note.get_IsTrill()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("tr ");
            this._builder.push(note.get_TrillFret());
            this._builder.push(" ");
            switch (note.TrillSpeed){
                case AlphaTab.Model.Duration.Sixteenth:
                    this._builder.push("16 ");
                    break;
                case AlphaTab.Model.Duration.ThirtySecond:
                    this._builder.push("32 ");
                    break;
                case AlphaTab.Model.Duration.SixtyFourth:
                    this._builder.push("64 ");
                    break;
            }
        }
        if (note.Vibrato != AlphaTab.Model.VibratoType.None){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("v ");
        }
        if (note.SlideType == AlphaTab.Model.SlideType.Legato){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("sl ");
        }
        if (note.SlideType == AlphaTab.Model.SlideType.Shift){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("ss ");
        }
        if (note.IsHammerPullOrigin){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("h ");
        }
        if (note.IsGhost){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("g ");
        }
        if (note.Accentuated == AlphaTab.Model.AccentuationType.Normal){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("ac ");
        }
        else if (note.Accentuated == AlphaTab.Model.AccentuationType.Heavy){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("hac ");
        }
        if (note.IsPalmMute){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("pm ");
        }
        if (note.IsStaccato){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("st ");
        }
        if (note.IsLetRing){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("lr ");
        }
        switch (note.LeftHandFinger){
            case AlphaTab.Model.Fingers.Thumb:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("1 ");
                break;
            case AlphaTab.Model.Fingers.IndexFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("2 ");
                break;
            case AlphaTab.Model.Fingers.MiddleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("3 ");
                break;
            case AlphaTab.Model.Fingers.AnnularFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("4 ");
                break;
            case AlphaTab.Model.Fingers.LittleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("5 ");
                break;
        }
        switch (note.RightHandFinger){
            case AlphaTab.Model.Fingers.Thumb:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("1 ");
                break;
            case AlphaTab.Model.Fingers.IndexFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("2 ");
                break;
            case AlphaTab.Model.Fingers.MiddleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("3 ");
                break;
            case AlphaTab.Model.Fingers.AnnularFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("4 ");
                break;
            case AlphaTab.Model.Fingers.LittleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("5 ");
                break;
        }
        this.EffectClose(hasEffectOpen);
    },
    EffectOpen: function (hasBeatEffectOpen){
        if (!hasBeatEffectOpen){
            this._builder.push("{");
        }
        return true;
    },
    EffectClose: function (hasBeatEffectOpen){
        if (hasBeatEffectOpen){
            this._builder.push("}");
        }
    },
    BeatEffects: function (beat){
        var hasEffectOpen = false;
        if (beat.FadeIn){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("f ");
        }
        switch (beat.GraceType){
            case AlphaTab.Model.GraceType.OnBeat:
                this._builder.push("gr ob ");
                break;
            case AlphaTab.Model.GraceType.BeforeBeat:
                this._builder.push("gr ");
                break;
        }
        if (beat.Vibrato != AlphaTab.Model.VibratoType.None){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("v ");
        }
        if (beat.Slap){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("s ");
        }
        if (beat.Pop){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("p ");
        }
        if (beat.Dots == 2){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("dd ");
        }
        else if (beat.Dots == 1){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("d ");
        }
        if (beat.PickStroke == AlphaTab.Model.PickStrokeType.Up){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("su ");
        }
        else if (beat.PickStroke == AlphaTab.Model.PickStrokeType.Down){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("sd ");
        }
        if (beat.get_HasTuplet()){
            var tupletValue = 0;
            if (beat.TupletDenominator == 3 && beat.TupletNumerator == 2){
                tupletValue = 3;
            }
            else if (beat.TupletDenominator == 5 && beat.TupletNumerator == 4){
                tupletValue = 5;
            }
            else if (beat.TupletDenominator == 6 && beat.TupletNumerator == 4){
                tupletValue = 6;
            }
            else if (beat.TupletDenominator == 7 && beat.TupletNumerator == 4){
                tupletValue = 7;
            }
            else if (beat.TupletDenominator == 9 && beat.TupletNumerator == 8){
                tupletValue = 9;
            }
            else if (beat.TupletDenominator == 10 && beat.TupletNumerator == 8){
                tupletValue = 10;
            }
            else if (beat.TupletDenominator == 11 && beat.TupletNumerator == 8){
                tupletValue = 11;
            }
            else if (beat.TupletDenominator == 12 && beat.TupletNumerator == 8){
                tupletValue = 12;
            }
            if (tupletValue != 0){
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder.push("tu ");
                this._builder.push(tupletValue);
                this._builder.push(" ");
            }
        }
        if (beat.get_HasWhammyBar()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("tbe (");
            for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                this._builder.push(beat.WhammyBarPoints[i].Offset);
                this._builder.push(" ");
                this._builder.push(beat.WhammyBarPoints[i].Value);
                this._builder.push(" ");
            }
            this._builder.push(")");
        }
        if (beat.get_IsTremolo()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder.push("tp ");
            if (beat.TremoloSpeed == AlphaTab.Model.Duration.Eighth){
                this._builder.push("8 ");
            }
            else if (beat.TremoloSpeed == AlphaTab.Model.Duration.Sixteenth){
                this._builder.push("16 ");
            }
            else if (beat.TremoloSpeed == AlphaTab.Model.Duration.ThirtySecond){
                this._builder.push("32 ");
            }
            else {
                this._builder.push("8 ");
            }
        }
        this.EffectClose(hasEffectOpen);
    },
    BarMeta: function (bar){
        var masterBar = bar.get_MasterBar();
        if (masterBar.Index > 0){
            var previousMasterBar = masterBar.PreviousMasterBar;
            var previousBar = bar.PreviousBar;
            if (previousMasterBar.TimeSignatureDenominator != masterBar.TimeSignatureDenominator || previousMasterBar.TimeSignatureNumerator != masterBar.TimeSignatureNumerator){
                this._builder.push("\\ts ");
                this._builder.push(masterBar.TimeSignatureNumerator);
                this._builder.push(" ");
                this._builder.push(masterBar.TimeSignatureDenominator);
                this._builder.push('\r\n');
            }
            if (previousMasterBar.KeySignature != masterBar.KeySignature){
                this._builder.push("\\ks ");
                switch (masterBar.KeySignature){
                    case -7:
                        this._builder.push("cb");
                        break;
                    case -6:
                        this._builder.push("gb");
                        break;
                    case -5:
                        this._builder.push("db");
                        break;
                    case -4:
                        this._builder.push("ab");
                        break;
                    case -3:
                        this._builder.push("eb");
                        break;
                    case -2:
                        this._builder.push("bb");
                        break;
                    case -1:
                        this._builder.push("f");
                        break;
                    case 0:
                        this._builder.push("c");
                        break;
                    case 1:
                        this._builder.push("g");
                        break;
                    case 2:
                        this._builder.push("d");
                        break;
                    case 3:
                        this._builder.push("a");
                        break;
                    case 4:
                        this._builder.push("e");
                        break;
                    case 5:
                        this._builder.push("b");
                        break;
                    case 6:
                        this._builder.push("f#");
                        break;
                    case 7:
                        this._builder.push("c#");
                        break;
                }
                this._builder.push('\r\n');
            }
            if (bar.Clef != previousBar.Clef){
                this._builder.push("\\clef ");
                switch (bar.Clef){
                    case AlphaTab.Model.Clef.Neutral:
                        this._builder.push("n");
                        break;
                    case AlphaTab.Model.Clef.C3:
                        this._builder.push("c3");
                        break;
                    case AlphaTab.Model.Clef.C4:
                        this._builder.push("c4");
                        break;
                    case AlphaTab.Model.Clef.F4:
                        this._builder.push("f4");
                        break;
                    case AlphaTab.Model.Clef.G2:
                        this._builder.push("g2");
                        break;
                }
                this._builder.push('\r\n');
            }
            if (masterBar.TempoAutomation != null){
                this._builder.push("\\tempo ");
                this._builder.push(masterBar.TempoAutomation.Value);
                this._builder.push('\r\n');
            }
        }
        if (masterBar.IsRepeatStart){
            this._builder.push("\\ro ");
            this._builder.push('\r\n');
        }
        if (masterBar.get_IsRepeatEnd()){
            this._builder.push("\\rc ");
            this._builder.push(masterBar.RepeatCount + 1);
            this._builder.push('\r\n');
        }
    }
};
AlphaTab.Importer = AlphaTab.Importer || {};
AlphaTab.Importer.AlphaTexException = function (position, nonTerm, expected, symbol, symbolData){
    this.Position = 0;
    this.NonTerm = null;
    this.Expected = AlphaTab.Importer.AlphaTexSymbols.No;
    this.Symbol = AlphaTab.Importer.AlphaTexSymbols.No;
    this.SymbolData = null;
    this.Position = position;
    this.NonTerm = nonTerm;
    this.Expected = expected;
    this.Symbol = symbol;
    this.SymbolData = symbolData;
};
AlphaTab.Importer.AlphaTexException.prototype = {
    get_Message: function (){
        if (this.SymbolData == null){
            return this.Position + ": Error on block " + this.NonTerm + ", expected a " + this.Expected + " found a " + this.Symbol;
        }
        return this.Position + ": Error on block " + this.NonTerm + ", invalid value: " + this.SymbolData;
    }
};
AlphaTab.Importer.ScoreImporter = function (){
    this._data = null;
};
AlphaTab.Importer.ScoreImporter.prototype = {
    Init: function (data){
        this._data = data;
    }
};
AlphaTab.Importer.ScoreImporter.BuildImporters = function (){
    return [new AlphaTab.Importer.Gp3To5Importer(), new AlphaTab.Importer.GpxImporter(), new AlphaTab.Importer.AlphaTexImporter(), new AlphaTab.Importer.MusicXml2Importer()];
};
AlphaTab.Importer.AlphaTexImporter = function (){
    this._score = null;
    this._track = null;
    this._ch = 0;
    this._curChPos = 0;
    this._sy = AlphaTab.Importer.AlphaTexSymbols.No;
    this._syData = null;
    this._allowNegatives = false;
    this._currentDuration = AlphaTab.Model.Duration.Whole;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.AlphaTexImporter.prototype = {
    ReadScore: function (){
        try{
            this.CreateDefaultScore();
            this._curChPos = 0;
            this._currentDuration = AlphaTab.Model.Duration.Quarter;
            this.NextChar();
            this.NewSy();
            this.Score();
            this._score.Finish();
            return this._score;
        }
        catch(e){
            if ((e.exception instanceof AlphaTab.Importer.AlphaTexException)){
                throw $CreateException(e, new Error());
            }
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
    },
    Error: function (nonterm, expected, symbolError){
        if (symbolError){
            throw $CreateException(new AlphaTab.Importer.AlphaTexException(this._curChPos, nonterm, expected, this._sy, null), new Error());
        }
        throw $CreateException(new AlphaTab.Importer.AlphaTexException(this._curChPos, nonterm, expected, expected, (this._syData)), new Error());
    },
    CreateDefaultScore: function (){
        this._score = new AlphaTab.Model.Score();
        this._score.Tempo = 120;
        this._score.TempoLabel = "";
        this._track = new AlphaTab.Model.Track();
        this._track.PlaybackInfo.Program = 25;
        this._track.PlaybackInfo.PrimaryChannel = AlphaTab.Importer.AlphaTexImporter.TrackChannels[0];
        this._track.PlaybackInfo.SecondaryChannel = AlphaTab.Importer.AlphaTexImporter.TrackChannels[1];
        this._track.Tuning = AlphaTab.Model.Tuning.GetDefaultTuningFor(6).Tunings;
        this._score.AddTrack(this._track);
    },
    ParseClef: function (str){
        switch (str.toLowerCase()){
            case "g2":
            case "treble":
                return AlphaTab.Model.Clef.G2;
            case "f4":
            case "bass":
                return AlphaTab.Model.Clef.F4;
            case "c3":
            case "tenor":
                return AlphaTab.Model.Clef.C3;
            case "c4":
            case "alto":
                return AlphaTab.Model.Clef.C4;
            case "n":
            case "neutral":
                return AlphaTab.Model.Clef.Neutral;
            default:
                return AlphaTab.Model.Clef.G2;
        }
    },
    ParseKeySignature: function (str){
        switch (str.toLowerCase()){
            case "cb":
                return -7;
            case "gb":
                return -6;
            case "db":
                return -5;
            case "ab":
                return -4;
            case "eb":
                return -3;
            case "bb":
                return -2;
            case "f":
                return -1;
            case "c":
                return 0;
            case "g":
                return 1;
            case "d":
                return 2;
            case "a":
                return 3;
            case "e":
                return 4;
            case "b":
                return 5;
            case "f#":
                return 6;
            case "c#":
                return 7;
            default:
                return 0;
        }
    },
    ParseTuning: function (str){
        var tuning = AlphaTab.Model.TuningParser.GetTuningForText(str);
        if (tuning < 0){
            this.Error("tuning-value", AlphaTab.Importer.AlphaTexSymbols.String, false);
        }
        return tuning;
    },
    NextChar: function (){
        var b = this._data.ReadByte();
        if (b == -1){
            this._ch = 0;
        }
        else {
            this._ch = b;
            this._curChPos++;
        }
    },
    NewSy: function (){
        this._sy = AlphaTab.Importer.AlphaTexSymbols.No;
        do{
            if (this._ch == 0){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Eof;
            }
            else if (AlphaTab.Platform.Std.IsWhiteSpace(this._ch)){
                // skip whitespaces 
                this.NextChar();
            }
            else if (this._ch == 47){
                this.NextChar();
                if (this._ch == 47){
                    // single line comment
                    while (this._ch != 13 && this._ch != 10 && this._ch != 0){
                        this.NextChar();
                    }
                }
                else if (this._ch == 42){
                    // multiline comment
                    while (this._ch != 0){
                        if (this._ch == 42){
                            this.NextChar();
                            if (this._ch == 47){
                                this.NextChar();
                                break;
                            }
                        }
                        else {
                            this.NextChar();
                        }
                    }
                }
                else {
                    this.Error("symbol", AlphaTab.Importer.AlphaTexSymbols.String, false);
                }
            }
            else if (this._ch == 34 || this._ch == 39){
                this.NextChar();
                var s = new Array();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                while (this._ch != 34 && this._ch != 39 && this._ch != 0){
                    s.push(String.fromCharCode(this._ch));
                    this.NextChar();
                }
                (this._syData) = s.join('');
                this.NextChar();
            }
            else if (this._ch == 45){
                // is number?
                if (this._allowNegatives && this.IsDigit(this._ch)){
                    var number = this.ReadNumber();
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.Number;
                    (this._syData) = number;
                }
                else {
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                    (this._syData) = this.ReadName();
                }
            }
            else if (this._ch == 46){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Dot;
                this.NextChar();
            }
            else if (this._ch == 58){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.DoubleDot;
                this.NextChar();
            }
            else if (this._ch == 40){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.LParensis;
                this.NextChar();
            }
            else if (this._ch == 92){
                this.NextChar();
                var name = this.ReadName();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.MetaCommand;
                (this._syData) = name;
            }
            else if (this._ch == 41){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.RParensis;
                this.NextChar();
            }
            else if (this._ch == 123){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.LBrace;
                this.NextChar();
            }
            else if (this._ch == 125){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.RBrace;
                this.NextChar();
            }
            else if (this._ch == 124){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Pipe;
                this.NextChar();
            }
            else if (this._ch == 42){
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Multiply;
                this.NextChar();
            }
            else if (this.IsDigit(this._ch)){
                var number = this.ReadNumber();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.Number;
                (this._syData) = number;
            }
            else if (AlphaTab.Importer.AlphaTexImporter.IsLetter(this._ch)){
                var name = this.ReadName();
                if (AlphaTab.Model.TuningParser.IsTuning(name)){
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.Tuning;
                    (this._syData) = name.toLowerCase();
                }
                else {
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                    (this._syData) = name;
                }
            }
            else {
                this.Error("symbol", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
        }
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.No)
    },
    IsDigit: function (code){
        return (code >= 48 && code <= 57) || (code == 45 && this._allowNegatives);
        // allow - if negatives
    },
    ReadName: function (){
        var str = new Array();
        do{
            str.push(String.fromCharCode(this._ch));
            this.NextChar();
        }
        while (AlphaTab.Importer.AlphaTexImporter.IsLetter(this._ch) || this.IsDigit(this._ch))
        return str.join('');
    },
    ReadNumber: function (){
        var str = new Array();
        do{
            str.push(String.fromCharCode(this._ch));
            this.NextChar();
        }
        while (this.IsDigit(this._ch))
        return AlphaTab.Platform.Std.ParseInt(str.join(''));
    },
    Score: function (){
        this.MetaData();
        this.Bars();
    },
    MetaData: function (){
        var anyMeta = false;
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.MetaCommand){
            var syData = (this._syData).toString().toLowerCase();
            if (syData == "title"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Title = (this._syData).toString();
                }
                else {
                    this.Error("title", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "subtitle"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.SubTitle = (this._syData).toString();
                }
                else {
                    this.Error("subtitle", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "artist"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Artist = (this._syData).toString();
                }
                else {
                    this.Error("artist", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "album"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Album = (this._syData).toString();
                }
                else {
                    this.Error("album", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "words"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Words = (this._syData).toString();
                }
                else {
                    this.Error("words", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "music"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Music = (this._syData).toString();
                }
                else {
                    this.Error("music", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "copyright"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    this._score.Copyright = (this._syData).toString();
                }
                else {
                    this.Error("copyright", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "tempo"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    this._score.Tempo = (this._syData);
                }
                else {
                    this.Error("tempo", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "capo"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    this._track.Capo = (this._syData);
                }
                else {
                    this.Error("capo", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (syData == "tuning"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Tuning){
                    var tuning = [];
                    do{
                        tuning.push(this.ParseTuning((this._syData).toString().toLowerCase()));
                        this.NewSy();
                    }
                    while (this._sy == AlphaTab.Importer.AlphaTexSymbols.Tuning)
                    this._track.Tuning = tuning.slice(0);
                }
                else {
                    this.Error("tuning", AlphaTab.Importer.AlphaTexSymbols.Tuning, true);
                }
                anyMeta = true;
            }
            else if (syData == "instrument"){
                this.NewSy();
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    var instrument = (this._syData);
                    if (instrument >= 0 && instrument <= 128){
                        this._track.PlaybackInfo.Program = (this._syData);
                    }
                    else {
                        this.Error("instrument", AlphaTab.Importer.AlphaTexSymbols.Number, false);
                    }
                }
                else if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    var instrumentName = (this._syData).toString().toLowerCase();
                    this._track.PlaybackInfo.Program = AlphaTab.Audio.GeneralMidi.GetValue(instrumentName);
                }
                else {
                    this.Error("instrument", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                this.NewSy();
                anyMeta = true;
            }
            else if (anyMeta){
                this.Error("metaDataTags", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
            else {
                // fall forward to bar meta if unknown score meta was found
                break;
            }
        }
        if (anyMeta){
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Dot){
                this.Error("song", AlphaTab.Importer.AlphaTexSymbols.Dot, true);
            }
            this.NewSy();
        }
        else if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Dot){
            this.NewSy();
        }
    },
    Bars: function (){
        this.Bar();
        while (this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
            // read pipe from last bar
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Pipe){
                this.Error("bar", AlphaTab.Importer.AlphaTexSymbols.Pipe, true);
            }
            this.NewSy();
            this.Bar();
        }
    },
    Bar: function (){
        var master = new AlphaTab.Model.MasterBar();
        this._score.AddMasterBar(master);
        var bar = new AlphaTab.Model.Bar();
        this._track.AddBar(bar);
        if (master.Index > 0){
            master.KeySignature = master.PreviousMasterBar.KeySignature;
            master.TimeSignatureDenominator = master.PreviousMasterBar.TimeSignatureDenominator;
            master.TimeSignatureNumerator = master.PreviousMasterBar.TimeSignatureNumerator;
            bar.Clef = bar.PreviousBar.Clef;
        }
        this.BarMeta(bar);
        var voice = new AlphaTab.Model.Voice();
        bar.AddVoice(voice);
        while (this._sy != AlphaTab.Importer.AlphaTexSymbols.Pipe && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
            this.Beat(voice);
        }
        if (voice.Beats.length == 0){
            var emptyBeat = new AlphaTab.Model.Beat();
            emptyBeat.IsEmpty = true;
            voice.AddBeat(emptyBeat);
        }
    },
    Beat: function (voice){
        // duration specifier?
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.DoubleDot){
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            var duration = (this._syData);
            switch (duration){
                case 1:
                case 2:
                case 4:
                case 8:
                case 16:
                case 32:
                case 64:
                    this._currentDuration = this.ParseDuration((this._syData));
                    break;
                default:
                    this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, false);
                    break;
            }
            this.NewSy();
            return;
        }
        var beat = new AlphaTab.Model.Beat();
        voice.AddBeat(beat);
        if (voice.Bar.get_MasterBar().TempoAutomation != null && voice.Beats.length == 1){
            beat.Automations.push(voice.Bar.get_MasterBar().TempoAutomation);
        }
        // notes
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.LParensis){
            this.NewSy();
            this.Note(beat);
            while (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
                this.Note(beat);
            }
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis){
                this.Error("note-list", AlphaTab.Importer.AlphaTexSymbols.RParensis, true);
            }
            this.NewSy();
        }
        else if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String && (this._syData).toString().toLowerCase() == "r"){
            // rest voice -> no notes 
            this.NewSy();
        }
        else {
            this.Note(beat);
        }
        // new duration
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Dot){
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            var duration = (this._syData);
            switch (duration){
                case 1:
                case 2:
                case 4:
                case 8:
                case 16:
                case 32:
                case 64:
                    this._currentDuration = this.ParseDuration((this._syData));
                    break;
                default:
                    this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, false);
                    break;
            }
            this.NewSy();
        }
        beat.Duration = this._currentDuration;
        // beat multiplier (repeat beat n times)
        var beatRepeat = 1;
        if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Multiply){
            this.NewSy();
            // multiplier count
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("multiplier", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            else {
                beatRepeat = (this._syData);
            }
            this.NewSy();
        }
        this.BeatEffects(beat);
        for (var i = 0; i < beatRepeat - 1; i++){
            voice.AddBeat(beat.Clone());
        }
    },
    BeatEffects: function (beat){
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LBrace){
            return;
        }
        this.NewSy();
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
            (this._syData) = (this._syData).toString().toLowerCase();
            if (!this.ApplyBeatEffect(beat)){
                this.Error("beat-effects", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
        }
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RBrace){
            this.Error("beat-effects", AlphaTab.Importer.AlphaTexSymbols.RBrace, true);
        }
        this.NewSy();
    },
    ApplyBeatEffect: function (beat){
        var syData = (this._syData).toString().toLowerCase();
        if (syData == "f"){
            beat.FadeIn = true;
            this.NewSy();
            return true;
        }
        if (syData == "v"){
            beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
            this.NewSy();
            return true;
        }
        if (syData == "s"){
            beat.Slap = true;
            this.NewSy();
            return true;
        }
        if (syData == "p"){
            beat.Pop = true;
            this.NewSy();
            return true;
        }
        if (syData == "dd"){
            beat.Dots = 2;
            this.NewSy();
            return true;
        }
        if (syData == "d"){
            beat.Dots = 1;
            this.NewSy();
            return true;
        }
        if (syData == "su"){
            beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
            this.NewSy();
            return true;
        }
        if (syData == "sd"){
            beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
            this.NewSy();
            return true;
        }
        if (syData == "tu"){
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("tuplet", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                return false;
            }
            var tuplet = (this._syData);
            switch (tuplet){
                case 3:
                    beat.TupletNumerator = 3;
                    beat.TupletDenominator = 2;
                    break;
                case 5:
                    beat.TupletNumerator = 5;
                    beat.TupletDenominator = 4;
                    break;
                case 6:
                    beat.TupletNumerator = 6;
                    beat.TupletDenominator = 4;
                    break;
                case 7:
                    beat.TupletNumerator = 7;
                    beat.TupletDenominator = 4;
                    break;
                case 9:
                    beat.TupletNumerator = 9;
                    beat.TupletDenominator = 8;
                    break;
                case 10:
                    beat.TupletNumerator = 10;
                    beat.TupletDenominator = 8;
                    break;
                case 11:
                    beat.TupletNumerator = 11;
                    beat.TupletDenominator = 8;
                    break;
                case 12:
                    beat.TupletNumerator = 12;
                    beat.TupletNumerator = 8;
                    beat.TupletDenominator = 8;
                    break;
            }
            this.NewSy();
            return true;
        }
        if (syData == "tb" || syData == "tbe"){
            var exact = syData == "tbe";
            // read points
            this.NewSy();
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LParensis){
                this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.LParensis, true);
                return false;
            }
            this._allowNegatives = true;
            this.NewSy();
            while (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
                var offset;
                var value;
                if (exact){
                    if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                        this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        return false;
                    }
                    offset = (this._syData);
                    this.NewSy();
                    if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                        this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        return false;
                    }
                    value = (this._syData);
                }
                else {
                    if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                        this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        return false;
                    }
                    offset = 0;
                    value = (this._syData);
                }
                beat.WhammyBarPoints.push(new AlphaTab.Model.BendPoint(offset, value));
                this.NewSy();
            }
            while (beat.WhammyBarPoints.length > 60){
                beat.WhammyBarPoints.splice(beat.WhammyBarPoints.length - 1,1);
            }
            // set positions
            if (!exact){
                var count = beat.WhammyBarPoints.length;
                var step = ((60 / count) | 0);
                var i = 0;
                while (i < count){
                    beat.WhammyBarPoints[i].Offset = Math.min(60, (i * step));
                    i++;
                }
            }
            else {
                beat.WhammyBarPoints.sort($CreateAnonymousDelegate(this, function (a, b){
    return a.Offset - b.Offset;
}));
            }
            this._allowNegatives = false;
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis){
                this.Error("tremolobar-effect", AlphaTab.Importer.AlphaTexSymbols.RParensis, true);
                return false;
            }
            this.NewSy();
            return true;
        }
        if (syData == "gr"){
            this.NewSy();
            if ((this._syData).toString().toLowerCase() == "ob"){
                beat.GraceType = AlphaTab.Model.GraceType.OnBeat;
                this.NewSy();
            }
            else {
                beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
            }
            return true;
        }
        if (syData == "tp"){
            this.NewSy();
            var duration = AlphaTab.Model.Duration.Eighth;
            if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                switch ((this._syData)){
                    case 8:
                        duration = AlphaTab.Model.Duration.Eighth;
                        break;
                    case 16:
                        duration = AlphaTab.Model.Duration.Sixteenth;
                        break;
                    case 32:
                        duration = AlphaTab.Model.Duration.ThirtySecond;
                        break;
                    default:
                        duration = AlphaTab.Model.Duration.Eighth;
                        break;
                }
                this.NewSy();
            }
            beat.TremoloSpeed = duration;
            return true;
        }
        return false;
    },
    Note: function (beat){
        // fret.string
        var syData = (this._syData).toString().toLowerCase();
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number && !(this._sy == AlphaTab.Importer.AlphaTexSymbols.String && (syData == "x" || syData == "-"))){
            this.Error("note-fret", AlphaTab.Importer.AlphaTexSymbols.Number, true);
        }
        var isDead = syData == "x";
        var isTie = syData == "-";
        var fret = (isDead || isTie ? 0 : (this._syData));
        this.NewSy();
        // Fret done
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Dot){
            this.Error("note", AlphaTab.Importer.AlphaTexSymbols.Dot, true);
        }
        this.NewSy();
        // dot done
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
            this.Error("note-string", AlphaTab.Importer.AlphaTexSymbols.Number, true);
        }
        var string = (this._syData);
        if (string < 1 || string > this._track.Tuning.length){
            this.Error("note-string", AlphaTab.Importer.AlphaTexSymbols.Number, false);
        }
        this.NewSy();
        // string done
        // read effects
        var note = new AlphaTab.Model.Note();
        beat.AddNote(note);
        note.String = this._track.Tuning.length - (string - 1);
        note.IsDead = isDead;
        note.IsTieDestination = isTie;
        if (!isTie){
            note.Fret = fret;
        }
        this.NoteEffects(note);
    },
    NoteEffects: function (note){
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LBrace){
            return;
        }
        this.NewSy();
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
            var syData = (this._syData).toString().toLowerCase();
            (this._syData) = syData;
            if (syData == "b" || syData == "be"){
                var exact = (this._syData) == "be";
                // read points
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.LParensis){
                    this.Error("bend-effect", AlphaTab.Importer.AlphaTexSymbols.LParensis, true);
                }
                this.NewSy();
                while (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis && this._sy != AlphaTab.Importer.AlphaTexSymbols.Eof){
                    var offset = 0;
                    var value = 0;
                    if (exact){
                        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                            this.Error("bend-effect-value", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        }
                        offset = (this._syData);
                        this.NewSy();
                        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                            this.Error("bend-effect-value", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        }
                        value = (this._syData);
                    }
                    else {
                        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                            this.Error("bend-effect-value", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                        }
                        value = (this._syData);
                    }
                    note.AddBendPoint(new AlphaTab.Model.BendPoint(offset, value));
                    this.NewSy();
                }
                while (note.BendPoints.length > 60){
                    note.BendPoints.splice(note.BendPoints.length - 1,1);
                }
                // set positions
                if (exact){
                    note.BendPoints.sort($CreateAnonymousDelegate(this, function (a, b){
    return a.Offset - b.Offset;
}));
                }
                else {
                    var count = note.BendPoints.length;
                    var step = (60 / (count - 1)) | 0;
                    var i = 0;
                    while (i < count){
                        note.BendPoints[i].Offset = Math.min(60, (i * step));
                        i++;
                    }
                }
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RParensis){
                    this.Error("bend-effect", AlphaTab.Importer.AlphaTexSymbols.RParensis, true);
                }
                this.NewSy();
            }
            else if (syData == "nh"){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                this.NewSy();
            }
            else if (syData == "ah"){
                // todo: Artificial Key
                note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                this.NewSy();
            }
            else if (syData == "th"){
                // todo: store tapped fret in data
                note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                this.NewSy();
            }
            else if (syData == "ph"){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                this.NewSy();
            }
            else if (syData == "sh"){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                this.NewSy();
            }
            else if (syData == "tr"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("trill-effect", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                var fret = (this._syData);
                this.NewSy();
                var duration = AlphaTab.Model.Duration.Sixteenth;
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    switch ((this._syData)){
                        case 16:
                            duration = AlphaTab.Model.Duration.Sixteenth;
                            break;
                        case 32:
                            duration = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                        case 64:
                            duration = AlphaTab.Model.Duration.SixtyFourth;
                            break;
                        default:
                            duration = AlphaTab.Model.Duration.Sixteenth;
                            break;
                    }
                    this.NewSy();
                }
                note.TrillValue = fret + note.get_StringTuning();
                note.TrillSpeed = duration;
            }
            else if (syData == "v"){
                this.NewSy();
                note.Vibrato = AlphaTab.Model.VibratoType.Slight;
            }
            else if (syData == "sl"){
                this.NewSy();
                note.SlideType = AlphaTab.Model.SlideType.Legato;
            }
            else if (syData == "ss"){
                this.NewSy();
                note.SlideType = AlphaTab.Model.SlideType.Shift;
            }
            else if (syData == "h"){
                this.NewSy();
                note.IsHammerPullOrigin = true;
            }
            else if (syData == "g"){
                this.NewSy();
                note.IsGhost = true;
            }
            else if (syData == "ac"){
                this.NewSy();
                note.Accentuated = AlphaTab.Model.AccentuationType.Normal;
            }
            else if (syData == "hac"){
                this.NewSy();
                note.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
            }
            else if (syData == "pm"){
                this.NewSy();
                note.IsPalmMute = true;
            }
            else if (syData == "st"){
                this.NewSy();
                note.IsStaccato = true;
            }
            else if (syData == "lr"){
                this.NewSy();
                note.IsLetRing = true;
            }
            else if (syData == "x"){
                this.NewSy();
                note.Fret = 0;
                note.IsDead = true;
            }
            else if (syData == "lf"){
                this.NewSy();
                var finger = AlphaTab.Model.Fingers.Thumb;
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    finger = this.ToFinger((this._syData));
                    this.NewSy();
                }
                note.LeftHandFinger = finger;
            }
            else if (syData == "rf"){
                this.NewSy();
                var finger = AlphaTab.Model.Fingers.Thumb;
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    finger = this.ToFinger((this._syData));
                    this.NewSy();
                }
                note.RightHandFinger = finger;
            }
            else if (this.ApplyBeatEffect(note.Beat)){
                // Success
            }
            else {
                this.Error(syData, AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
        }
        if (this._sy != AlphaTab.Importer.AlphaTexSymbols.RBrace){
            this.Error("note-effect", AlphaTab.Importer.AlphaTexSymbols.RBrace, false);
        }
        this.NewSy();
    },
    ToFinger: function (syData){
        switch (syData){
            case 1:
                return AlphaTab.Model.Fingers.Thumb;
            case 2:
                return AlphaTab.Model.Fingers.IndexFinger;
            case 3:
                return AlphaTab.Model.Fingers.MiddleFinger;
            case 4:
                return AlphaTab.Model.Fingers.AnnularFinger;
            case 5:
                return AlphaTab.Model.Fingers.LittleFinger;
        }
        return AlphaTab.Model.Fingers.Thumb;
    },
    ParseDuration: function (duration){
        switch (duration){
            case 1:
                return AlphaTab.Model.Duration.Whole;
            case 2:
                return AlphaTab.Model.Duration.Half;
            case 4:
                return AlphaTab.Model.Duration.Quarter;
            case 8:
                return AlphaTab.Model.Duration.Eighth;
            case 16:
                return AlphaTab.Model.Duration.Sixteenth;
            case 32:
                return AlphaTab.Model.Duration.ThirtySecond;
            case 64:
                return AlphaTab.Model.Duration.SixtyFourth;
            default:
                return AlphaTab.Model.Duration.Quarter;
        }
    },
    BarMeta: function (bar){
        var master = bar.get_MasterBar();
        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.MetaCommand){
            var syData = (this._syData).toString().toLowerCase();
            if (syData == "ts"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("timesignature-numerator", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                master.TimeSignatureNumerator = (this._syData);
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("timesignature-denominator", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                master.TimeSignatureDenominator = (this._syData);
            }
            else if (syData == "ro"){
                master.IsRepeatStart = true;
            }
            else if (syData == "rc"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("repeatclose", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                master.RepeatCount = (this._syData) - 1;
            }
            else if (syData == "ks"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.String){
                    this.Error("keysignature", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                master.KeySignature = this.ParseKeySignature((this._syData).toString().toLowerCase());
            }
            else if (syData == "clef"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.String && this._sy != AlphaTab.Importer.AlphaTexSymbols.Tuning){
                    this.Error("clef", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                bar.Clef = this.ParseClef((this._syData).toString().toLowerCase());
            }
            else if (syData == "tempo"){
                this.NewSy();
                if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                    this.Error("tempo", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                }
                var tempoAutomation = new AlphaTab.Model.Automation();
                tempoAutomation.IsLinear = true;
                tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
                tempoAutomation.Value = (this._syData);
                master.TempoAutomation = tempoAutomation;
            }
            else {
                this.Error("measure-effects", AlphaTab.Importer.AlphaTexSymbols.String, false);
            }
            this.NewSy();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.AlphaTexImporter.Eof = 0;
    AlphaTab.Importer.AlphaTexImporter.TrackChannels = new Int32Array([0, 1]);
});
AlphaTab.Importer.AlphaTexImporter.IsLetter = function (code){
    // no control characters, whitespaces, numbers or dots
    return !AlphaTab.Importer.AlphaTexImporter.IsTerminal(code) && ((code >= 33 && code <= 47) || (code >= 58 && code <= 126) || (code > 128));
    /* Unicode Symbols */
};
AlphaTab.Importer.AlphaTexImporter.IsTerminal = function (ch){
    return ch == 46 || ch == 123 || ch == 125 || ch == 91 || ch == 93 || ch == 40 || ch == 41 || ch == 124 || ch == 39 || ch == 34 || ch == 92;
};
$Inherit(AlphaTab.Importer.AlphaTexImporter, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.AlphaTexSymbols = {
    No: 0,
    Eof: 1,
    Number: 2,
    DoubleDot: 3,
    Dot: 4,
    String: 5,
    Tuning: 6,
    LParensis: 7,
    RParensis: 8,
    LBrace: 9,
    RBrace: 10,
    Pipe: 11,
    MetaCommand: 12,
    Multiply: 13
};
AlphaTab.Importer.Gp3To5Importer = function (){
    this._versionNumber = 0;
    this._score = null;
    this._globalTripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this._lyricsIndex = null;
    this._lyrics = null;
    this._barCount = 0;
    this._trackCount = 0;
    this._playbackInfos = null;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.Gp3To5Importer.prototype = {
    ReadScore: function (){
        this.ReadVersion();
        this._score = new AlphaTab.Model.Score();
        // basic song info
        this.ReadScoreInformation();
        // triplet feel before Gp5
        if (this._versionNumber < 500){
            this._globalTripletFeel = this.ReadBool() ? AlphaTab.Model.TripletFeel.Triplet8th : AlphaTab.Model.TripletFeel.NoTripletFeel;
        }
        // beat lyrics
        if (this._versionNumber >= 400){
            this.ReadLyrics();
        }
        // rse master settings since GP5.1
        if (this._versionNumber >= 510){
            // master volume (4)
            // master effect (4)
            // master equalizer (10)
            // master equalizer preset (1)
            this._data.Skip(19);
        }
        // page setup since GP5
        if (this._versionNumber >= 500){
            this.ReadPageSetup();
            this._score.TempoLabel = this.ReadStringIntByte();
        }
        // tempo stuff
        this._score.Tempo = this.ReadInt32();
        if (this._versionNumber >= 510){
            this.ReadBool();
            // hide tempo?
        }
        // keysignature and octave
        /* var keySignature = */
        this.ReadInt32();
        if (this._versionNumber >= 400){
            /* octave = */
            this._data.ReadByte();
        }
        this.ReadPlaybackInfos();
        // repetition stuff
        if (this._versionNumber >= 500){
            // "Coda" bar index (2)
            // "Double Coda" bar index (2)
            // "Segno" bar index (2)
            // "Segno Segno" bar index (2)
            // "Fine" bar index (2)
            // "Da Capo" bar index (2)
            // "Da Capo al Coda" bar index (2)
            // "Da Capo al Double Coda" bar index (2)
            // "Da Capo al Fine" bar index (2)
            // "Da Segno" bar index (2)
            // "Da Segno al Coda" bar index (2)
            // "Da Segno al Double Coda" bar index (2)
            // "Da Segno al Fine "bar index (2)
            // "Da Segno Segno" bar index (2)
            // "Da Segno Segno al Coda" bar index (2)
            // "Da Segno Segno al Double Coda" bar index (2)
            // "Da Segno Segno al Fine" bar index (2)
            // "Da Coda" bar index (2)
            // "Da Double Coda" bar index (2)
            this._data.Skip(38);
            // unknown (4)
            this._data.Skip(4);
        }
        // contents
        this._barCount = this.ReadInt32();
        this._trackCount = this.ReadInt32();
        this.ReadMasterBars();
        this.ReadTracks();
        this.ReadBars();
        this._score.Finish();
        return this._score;
    },
    ReadVersion: function (){
        var version = this.ReadStringByteLength(30);
        if (!version.indexOf("FICHIER GUITAR PRO ")==0){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        version = version.substr("FICHIER GUITAR PRO ".length + 1);
        var dot = version.indexOf(".");
        this._versionNumber = (100 * AlphaTab.Platform.Std.ParseInt(version.substr(0, dot))) + AlphaTab.Platform.Std.ParseInt(version.substr(dot + 1));
    },
    ReadScoreInformation: function (){
        this._score.Title = this.ReadStringIntUnused();
        this._score.SubTitle = this.ReadStringIntUnused();
        this._score.Artist = this.ReadStringIntUnused();
        this._score.Album = this.ReadStringIntUnused();
        this._score.Words = this.ReadStringIntUnused();
        this._score.Music = (this._versionNumber >= 500) ? this.ReadStringIntUnused() : this._score.Words;
        this._score.Copyright = this.ReadStringIntUnused();
        this._score.Tab = this.ReadStringIntUnused();
        this._score.Instructions = this.ReadStringIntUnused();
        var noticeLines = this.ReadInt32();
        var notice = new Array();
        for (var i = 0; i < noticeLines; i++){
            if (i > 0)
                notice.push('\r\n');
            notice.push(this.ReadStringIntUnused());
        }
        this._score.Notices = notice.join('');
    },
    ReadLyrics: function (){
        this._lyrics = [];
        this._lyricsIndex = [];
        this.ReadInt32();
        for (var i = 0; i < 5; i++){
            this._lyricsIndex.push(this.ReadInt32() - 1);
            this._lyrics.push(this.ReadStringInt());
        }
    },
    ReadPageSetup: function (){
        // Page Width (4)
        // Page Heigth (4)
        // Padding Left (4)
        // Padding Right (4)
        // Padding Top (4)
        // Padding Bottom (4)
        // Size Proportion(4)
        // Header and Footer display flags (2)
        this._data.Skip(30);
        // title format
        // subtitle format
        // artist format
        // album format
        // words format
        // music format
        // words and music format
        // copyright format
        // pagpublic enumber format
        for (var i = 0; i < 10; i++){
            this.ReadStringIntByte();
        }
    },
    ReadPlaybackInfos: function (){
        this._playbackInfos = [];
        for (var i = 0; i < 64; i++){
            var info = new AlphaTab.Model.PlaybackInformation();
            info.PrimaryChannel = i;
            info.SecondaryChannel = i;
            info.Program = this.ReadInt32();
            info.Volume = this._data.ReadByte();
            info.Balance = this._data.ReadByte();
            this._data.Skip(6);
            this._playbackInfos.push(info);
        }
    },
    ReadMasterBars: function (){
        for (var i = 0; i < this._barCount; i++){
            this.ReadMasterBar();
        }
    },
    ReadMasterBar: function (){
        var previousMasterBar = null;
        if (this._score.MasterBars.length > 0){
            previousMasterBar = this._score.MasterBars[this._score.MasterBars.length - 1];
        }
        var newMasterBar = new AlphaTab.Model.MasterBar();
        var flags = this._data.ReadByte();
        // time signature
        if ((flags & 1) != 0){
            newMasterBar.TimeSignatureNumerator = this._data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.TimeSignatureNumerator = previousMasterBar.TimeSignatureNumerator;
        }
        if ((flags & 2) != 0){
            newMasterBar.TimeSignatureDenominator = this._data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.TimeSignatureDenominator = previousMasterBar.TimeSignatureDenominator;
        }
        // repeatings
        newMasterBar.IsRepeatStart = (flags & 4) != 0;
        if ((flags & 8) != 0){
            newMasterBar.RepeatCount = this._data.ReadByte() + (this._versionNumber >= 500 ? 0 : 1);
        }
        // alternate endings
        if ((flags & 16) != 0){
            if (this._versionNumber < 500){
                var currentMasterBar = previousMasterBar;
                // get the already existing alternatives to ignore them 
                var existentAlternatives = 0;
                while (currentMasterBar != null){
                    // found another repeat ending?
                    if (currentMasterBar.get_IsRepeatEnd() && currentMasterBar != previousMasterBar)
                        break;
                    // found the opening?
                    if (currentMasterBar.IsRepeatStart)
                        break;
                    existentAlternatives |= currentMasterBar.AlternateEndings;
                    currentMasterBar = currentMasterBar.PreviousMasterBar;
                }
                // now calculate the alternative for this bar
                var repeatAlternative = 0;
                var repeatMask = this._data.ReadByte();
                for (var i = 0; i < 8; i++){
                    // only add the repeating if it is not existing
                    var repeating = (1 << i);
                    if (repeatMask > i && (existentAlternatives & repeating) == 0){
                        repeatAlternative |= repeating;
                    }
                }
                newMasterBar.AlternateEndings = repeatAlternative;
            }
            else {
                newMasterBar.AlternateEndings = this._data.ReadByte();
            }
        }
        // marker
        if ((flags & 32) != 0){
            var section = new AlphaTab.Model.Section();
            section.Text = this.ReadStringIntByte();
            section.Marker = "";
            this.ReadColor();
            newMasterBar.Section = section;
        }
        // keysignature
        if ((flags & 64) != 0){
            newMasterBar.KeySignature = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            this._data.ReadByte();
            // keysignature type
        }
        else if (previousMasterBar != null){
            newMasterBar.KeySignature = previousMasterBar.KeySignature;
        }
        if ((this._versionNumber >= 500) && ((flags & 3) != 0)){
            this._data.Skip(4);
        }
        // better alternate ending mask in GP5
        if ((this._versionNumber >= 500) && ((flags & 16) == 0)){
            newMasterBar.AlternateEndings = this._data.ReadByte();
        }
        // tripletfeel
        if (this._versionNumber >= 500){
            var tripletFeel = this._data.ReadByte();
            switch (tripletFeel){
                case 1:
                    newMasterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet8th;
                    break;
                case 2:
                    newMasterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet16th;
                    break;
            }
            this._data.ReadByte();
        }
        else {
            newMasterBar.TripletFeel = this._globalTripletFeel;
        }
        newMasterBar.IsDoubleBar = (flags & 128) != 0;
        this._score.AddMasterBar(newMasterBar);
    },
    ReadTracks: function (){
        for (var i = 0; i < this._trackCount; i++){
            this.ReadTrack();
        }
    },
    ReadTrack: function (){
        var newTrack = new AlphaTab.Model.Track();
        this._score.AddTrack(newTrack);
        var flags = this._data.ReadByte();
        newTrack.Name = this.ReadStringByteLength(40);
        newTrack.IsPercussion = (flags & 1) != 0;
        var stringCount = this.ReadInt32();
        var tuning = [];
        for (var i = 0; i < 7; i++){
            var stringTuning = this.ReadInt32();
            if (stringCount > i){
                tuning.push(stringTuning);
            }
        }
        newTrack.Tuning = tuning.slice(0);
        var port = this.ReadInt32();
        var index = this.ReadInt32() - 1;
        var effectChannel = this.ReadInt32() - 1;
        this._data.Skip(4);
        // Fretcount
        if (index >= 0 && index < this._playbackInfos.length){
            var info = this._playbackInfos[index];
            info.Port = port;
            info.IsSolo = (flags & 16) != 0;
            info.IsMute = (flags & 32) != 0;
            info.SecondaryChannel = effectChannel;
            newTrack.PlaybackInfo = info;
        }
        newTrack.Capo = this.ReadInt32();
        newTrack.Color = this.ReadColor();
        if (this._versionNumber >= 500){
            // flags for 
            //  0x01 -> show tablature
            //  0x02 -> show standard notation
            this._data.ReadByte();
            // flags for
            //  0x02 -> auto let ring
            //  0x04 -> auto brush
            this._data.ReadByte();
            // unknown
            this._data.Skip(43);
        }
        // unknown
        if (this._versionNumber >= 510){
            this._data.Skip(4);
            this.ReadStringIntByte();
            this.ReadStringIntByte();
        }
    },
    ReadBars: function (){
        for (var i = 0; i < this._barCount; i++){
            for (var t = 0; t < this._trackCount; t++){
                this.ReadBar(this._score.Tracks[t]);
            }
        }
    },
    ReadBar: function (track){
        var newBar = new AlphaTab.Model.Bar();
        if (track.IsPercussion){
            newBar.Clef = AlphaTab.Model.Clef.Neutral;
        }
        track.AddBar(newBar);
        var voiceCount = 1;
        if (this._versionNumber >= 500){
            this._data.ReadByte();
            voiceCount = 2;
        }
        for (var v = 0; v < voiceCount; v++){
            this.ReadVoice(track, newBar);
        }
    },
    ReadVoice: function (track, bar){
        var beatCount = this.ReadInt32();
        if (beatCount == 0){
            return;
        }
        var newVoice = new AlphaTab.Model.Voice();
        bar.AddVoice(newVoice);
        for (var i = 0; i < beatCount; i++){
            this.ReadBeat(track, bar, newVoice);
        }
    },
    ReadBeat: function (track, bar, voice){
        var newBeat = new AlphaTab.Model.Beat();
        var flags = this._data.ReadByte();
        if ((flags & 1) != 0){
            newBeat.Dots = 1;
        }
        if ((flags & 64) != 0){
            var type = this._data.ReadByte();
            newBeat.IsEmpty = (type & 2) == 0;
        }
        voice.AddBeat(newBeat);
        var duration = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        switch (duration){
            case -2:
                newBeat.Duration = AlphaTab.Model.Duration.Whole;
                break;
            case -1:
                newBeat.Duration = AlphaTab.Model.Duration.Half;
                break;
            case 0:
                newBeat.Duration = AlphaTab.Model.Duration.Quarter;
                break;
            case 1:
                newBeat.Duration = AlphaTab.Model.Duration.Eighth;
                break;
            case 2:
                newBeat.Duration = AlphaTab.Model.Duration.Sixteenth;
                break;
            case 3:
                newBeat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                break;
            case 4:
                newBeat.Duration = AlphaTab.Model.Duration.SixtyFourth;
                break;
            default:
                newBeat.Duration = AlphaTab.Model.Duration.Quarter;
                break;
        }
        if ((flags & 32) != 0){
            newBeat.TupletNumerator = this.ReadInt32();
            switch (newBeat.TupletNumerator){
                case 1:
                    newBeat.TupletDenominator = 1;
                    break;
                case 3:
                    newBeat.TupletDenominator = 2;
                    break;
                case 5:
                case 6:
                case 7:
                    newBeat.TupletDenominator = 4;
                    break;
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    newBeat.TupletDenominator = 8;
                    break;
                case 2:
                case 4:
                case 8:
                    break;
                default:
                    newBeat.TupletNumerator = 1;
                    newBeat.TupletDenominator = 1;
                    break;
            }
        }
        if ((flags & 2) != 0){
            this.ReadChord(newBeat);
        }
        if ((flags & 4) != 0){
            newBeat.Text = this.ReadStringIntUnused();
        }
        if ((flags & 8) != 0){
            this.ReadBeatEffects(newBeat);
        }
        if ((flags & 16) != 0){
            this.ReadMixTableChange(newBeat);
        }
        var stringFlags = this._data.ReadByte();
        for (var i = 6; i >= 0; i--){
            if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.Tuning.length){
                this.ReadNote(track, bar, voice, newBeat, (6 - i));
            }
        }
        if (this._versionNumber >= 500){
            this._data.ReadByte();
            var flag = this._data.ReadByte();
            if ((flag & 8) != 0){
                this._data.ReadByte();
            }
        }
    },
    ReadChord: function (beat){
        var chord = new AlphaTab.Model.Chord();
        var chordId = AlphaTab.Platform.Std.NewGuid();
        if (this._versionNumber >= 500){
            this._data.Skip(17);
            chord.Name = this.ReadStringByteLength(21);
            this._data.Skip(4);
            chord.FirstFret = this.ReadInt32();
            for (var i = 0; i < 7; i++){
                var fret = this.ReadInt32();
                if (i < chord.Strings.length){
                    chord.Strings.push(fret);
                }
            }
            this._data.Skip(32);
        }
        else {
            if (this._data.ReadByte() != 0){
                // gp4
                if (this._versionNumber >= 400){
                    // Sharp (1)
                    // Unused (3)
                    // Root (1)
                    // Major/Minor (1)
                    // Nin,Eleven or Thirteen (1)
                    // Bass (4)
                    // Diminished/Augmented (4)
                    // Add (1)
                    this._data.Skip(16);
                    chord.Name = (this.ReadStringByteLength(21));
                    // Unused (2)
                    // Fifth (1)
                    // Ninth (1)
                    // Eleventh (1)
                    this._data.Skip(4);
                    chord.FirstFret = (this.ReadInt32());
                    for (var i = 0; i < 7; i++){
                        var fret = this.ReadInt32();
                        if (i < chord.Strings.length){
                            chord.Strings.push(fret);
                        }
                    }
                    // number of barres (1)
                    // Fret of the barre (5)
                    // Barree end (5)
                    // Omission1,3,5,7,9,11,13 (7)
                    // Unused (1)
                    // Fingering (7)
                    // Show Diagram Fingering (1)
                    // ??
                    this._data.Skip(32);
                }
                else {
                    // unknown
                    this._data.Skip(25);
                    chord.Name = this.ReadStringByteLength(34);
                    chord.FirstFret = this.ReadInt32();
                    for (var i = 0; i < 6; i++){
                        var fret = this.ReadInt32();
                        chord.Strings.push(fret);
                    }
                    // unknown
                    this._data.Skip(36);
                }
            }
            else {
                var strings = this._versionNumber >= 406 ? 7 : 6;
                chord.Name = this.ReadStringIntByte();
                chord.FirstFret = this.ReadInt32();
                if (chord.FirstFret > 0){
                    for (var i = 0; i < strings; i++){
                        var fret = this.ReadInt32();
                        if (i < chord.Strings.length){
                            chord.Strings.push(fret);
                        }
                    }
                }
            }
        }
        if (!((chord.Name==null)||(chord.Name.length==0))){
            beat.ChordId = chordId;
            beat.Voice.Bar.Track.Chords[beat.ChordId] = chord;
        }
    },
    ReadBeatEffects: function (beat){
        var flags = this._data.ReadByte();
        var flags2 = 0;
        if (this._versionNumber >= 400){
            flags2 = this._data.ReadByte();
        }
        beat.FadeIn = (flags & 16) != 0;
        if ((this._versionNumber < 400 && (flags & 1) != 0) || (flags & 2) != 0){
            beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
        }
        beat.HasRasgueado = (flags2 & 1) != 0;
        if ((flags & 32) != 0 && this._versionNumber >= 400){
            var slapPop = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            switch (slapPop){
                case 1:
                    beat.Tap = true;
                    break;
                case 2:
                    beat.Slap = true;
                    break;
                case 3:
                    beat.Pop = true;
                    break;
            }
        }
        else if ((flags & 32) != 0){
            var slapPop = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            switch (slapPop){
                case 1:
                    beat.Tap = true;
                    break;
                case 2:
                    beat.Slap = true;
                    break;
                case 3:
                    beat.Pop = true;
                    break;
            }
            this._data.Skip(4);
        }
        if ((flags2 & 4) != 0){
            this.ReadTremoloBarEffect(beat);
        }
        if ((flags & 64) != 0){
            var strokeUp;
            var strokeDown;
            if (this._versionNumber < 500){
                strokeDown = this._data.ReadByte();
                strokeUp = this._data.ReadByte();
            }
            else {
                strokeUp = this._data.ReadByte();
                strokeDown = this._data.ReadByte();
            }
            if (strokeUp > 0){
                beat.BrushType = AlphaTab.Model.BrushType.BrushUp;
                beat.BrushDuration = AlphaTab.Importer.Gp3To5Importer.ToStrokeValue(strokeUp);
            }
            else if (strokeDown > 0){
                beat.BrushType = AlphaTab.Model.BrushType.BrushDown;
                beat.BrushDuration = AlphaTab.Importer.Gp3To5Importer.ToStrokeValue(strokeDown);
            }
        }
        if ((flags2 & 2) != 0){
            switch (AlphaTab.Platform.Std.ReadSignedByte(this._data)){
                case 0:
                    beat.PickStroke = AlphaTab.Model.PickStrokeType.None;
                    break;
                case 1:
                    beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
                    break;
                case 2:
                    beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
                    break;
            }
        }
    },
    ReadTremoloBarEffect: function (beat){
        this._data.ReadByte();
        // type
        this.ReadInt32();
        // value
        var pointCount = this.ReadInt32();
        if (pointCount > 0){
            for (var i = 0; i < pointCount; i++){
                var point = new AlphaTab.Model.BendPoint(0, 0);
                point.Offset = this.ReadInt32();
                // 0...60
                point.Value = (this.ReadInt32() / 25) | 0;
                // 0..12 (amount of quarters)
                this.ReadBool();
                // vibrato
                beat.WhammyBarPoints.push(point);
            }
        }
    },
    ReadMixTableChange: function (beat){
        var tableChange = new AlphaTab.Importer.MixTableChange();
        tableChange.Instrument = this._data.ReadByte();
        if (this._versionNumber >= 500){
            this._data.Skip(16);
            // Rse Info 
        }
        tableChange.Volume = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        tableChange.Balance = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        var chorus = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        var reverb = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        var phaser = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        var tremolo = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        if (this._versionNumber >= 500){
            tableChange.TempoName = this.ReadStringIntByte();
        }
        tableChange.Tempo = this.ReadInt32();
        // durations
        if (tableChange.Volume >= 0){
            this._data.ReadByte();
        }
        if (tableChange.Balance >= 0){
            this._data.ReadByte();
        }
        if (chorus >= 0){
            this._data.ReadByte();
        }
        if (reverb >= 0){
            this._data.ReadByte();
        }
        if (phaser >= 0){
            this._data.ReadByte();
        }
        if (tremolo >= 0){
            this._data.ReadByte();
        }
        if (tableChange.Tempo >= 0){
            tableChange.Duration = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            if (this._versionNumber >= 510){
                this._data.ReadByte();
                // hideTempo (bool)
            }
        }
        if (this._versionNumber >= 400){
            this._data.ReadByte();
            // all tracks flag
        }
        // unknown
        if (this._versionNumber >= 500){
            this._data.ReadByte();
        }
        // unknown
        if (this._versionNumber >= 510){
            this.ReadStringIntByte();
            this.ReadStringIntByte();
        }
        if (tableChange.Volume >= 0){
            var volumeAutomation = new AlphaTab.Model.Automation();
            volumeAutomation.IsLinear = true;
            volumeAutomation.Type = AlphaTab.Model.AutomationType.Volume;
            volumeAutomation.Value = tableChange.Volume;
            beat.Automations.push(volumeAutomation);
        }
        if (tableChange.Balance >= 0){
            var balanceAutomation = new AlphaTab.Model.Automation();
            balanceAutomation.IsLinear = true;
            balanceAutomation.Type = AlphaTab.Model.AutomationType.Balance;
            balanceAutomation.Value = tableChange.Balance;
            beat.Automations.push(balanceAutomation);
        }
        if (tableChange.Instrument >= 0){
            var instrumentAutomation = new AlphaTab.Model.Automation();
            instrumentAutomation.IsLinear = true;
            instrumentAutomation.Type = AlphaTab.Model.AutomationType.Instrument;
            instrumentAutomation.Value = tableChange.Instrument;
            beat.Automations.push(instrumentAutomation);
        }
        if (tableChange.Tempo >= 0){
            var tempoAutomation = new AlphaTab.Model.Automation();
            tempoAutomation.IsLinear = true;
            tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
            tempoAutomation.Value = tableChange.Tempo;
            beat.Automations.push(tempoAutomation);
            beat.Voice.Bar.get_MasterBar().TempoAutomation = tempoAutomation;
        }
    },
    ReadNote: function (track, bar, voice, beat, stringIndex){
        var newNote = new AlphaTab.Model.Note();
        newNote.String = track.Tuning.length - stringIndex;
        var flags = this._data.ReadByte();
        if ((flags & 2) != 0){
            newNote.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
        }
        else if ((flags & 64) != 0){
            newNote.Accentuated = AlphaTab.Model.AccentuationType.Normal;
        }
        newNote.IsGhost = ((flags & 4) != 0);
        if ((flags & 32) != 0){
            var noteType = this._data.ReadByte();
            if (noteType == 3){
                newNote.IsDead = true;
            }
            else if (noteType == 2){
                newNote.IsTieDestination = true;
            }
        }
        if ((flags & 1) != 0 && this._versionNumber < 500){
            this._data.ReadByte();
            // duration 
            this._data.ReadByte();
            // tuplet
        }
        if ((flags & 16) != 0){
            var dynamicNumber = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            newNote.Dynamic = this.ToDynamicValue(dynamicNumber);
            beat.Dynamic = newNote.Dynamic;
        }
        if ((flags & 32) != 0){
            newNote.Fret = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        }
        if ((flags & 128) != 0){
            newNote.LeftHandFinger = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            newNote.RightHandFinger = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            newNote.IsFingering = true;
        }
        if (this._versionNumber >= 500){
            if ((flags & 1) != 0){
                newNote.DurationPercent = this.ReadDouble();
            }
            var flags2 = this._data.ReadByte();
            newNote.AccidentalMode = (flags2 & 2) != 0 ? AlphaTab.Model.NoteAccidentalMode.SwapAccidentals : AlphaTab.Model.NoteAccidentalMode.Default;
        }
        beat.AddNote(newNote);
        if ((flags & 8) != 0){
            this.ReadNoteEffects(track, voice, beat, newNote);
        }
    },
    ToDynamicValue: function (value){
        switch (value){
            case 1:
                return AlphaTab.Model.DynamicValue.PPP;
            case 2:
                return AlphaTab.Model.DynamicValue.PP;
            case 3:
                return AlphaTab.Model.DynamicValue.P;
            case 4:
                return AlphaTab.Model.DynamicValue.MP;
            case 5:
                return AlphaTab.Model.DynamicValue.MF;
            case 6:
                return AlphaTab.Model.DynamicValue.F;
            case 7:
                return AlphaTab.Model.DynamicValue.FF;
            case 8:
                return AlphaTab.Model.DynamicValue.FFF;
            default:
                return AlphaTab.Model.DynamicValue.F;
        }
    },
    ReadNoteEffects: function (track, voice, beat, note){
        var flags = this._data.ReadByte();
        var flags2 = 0;
        if (this._versionNumber >= 400){
            flags2 = this._data.ReadByte();
        }
        if ((flags & 1) != 0){
            this.ReadBend(note);
        }
        if ((flags & 16) != 0){
            this.ReadGrace(voice, note);
        }
        if ((flags2 & 4) != 0){
            this.ReadTremoloPicking(beat);
        }
        if ((flags2 & 8) != 0){
            this.ReadSlide(note);
        }
        else if (this._versionNumber < 400){
            if ((flags & 4) != 0){
                note.SlideType = AlphaTab.Model.SlideType.Shift;
            }
        }
        if ((flags2 & 16) != 0){
            this.ReadArtificialHarmonic(note);
        }
        else if (this._versionNumber < 400){
            if ((flags & 4) != 0){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                note.HarmonicValue = this.DeltaFretToHarmonicValue(note.Fret);
            }
            if ((flags & 8) != 0){
                note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
            }
        }
        if ((flags2 & 32) != 0){
            this.ReadTrill(note);
        }
        note.IsLetRing = (flags & 8) != 0;
        note.IsHammerPullOrigin = (flags & 2) != 0;
        if ((flags2 & 64) != 0){
            note.Vibrato = AlphaTab.Model.VibratoType.Slight;
        }
        note.IsPalmMute = (flags2 & 2) != 0;
        note.IsStaccato = (flags2 & 1) != 0;
    },
    ReadBend: function (note){
        this._data.ReadByte();
        // type
        this.ReadInt32();
        // value
        var pointCount = this.ReadInt32();
        if (pointCount > 0){
            for (var i = 0; i < pointCount; i++){
                var point = new AlphaTab.Model.BendPoint(0, 0);
                point.Offset = this.ReadInt32();
                // 0...60
                point.Value = (this.ReadInt32() / 25) | 0;
                // 0..12 (amount of quarters)
                this.ReadBool();
                // vibrato
                note.AddBendPoint(point);
            }
        }
    },
    ReadGrace: function (voice, note){
        var graceBeat = new AlphaTab.Model.Beat();
        var graceNote = new AlphaTab.Model.Note();
        graceNote.String = note.String;
        graceNote.Fret = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        graceBeat.Duration = AlphaTab.Model.Duration.ThirtySecond;
        graceBeat.Dynamic = this.ToDynamicValue(AlphaTab.Platform.Std.ReadSignedByte(this._data));
        var transition = AlphaTab.Platform.Std.ReadSignedByte(this._data);
        switch (transition){
            case 0:
                break;
            case 1:
                graceNote.SlideType = AlphaTab.Model.SlideType.Legato;
                graceNote.SlideTarget = note;
                break;
            case 2:
                break;
            case 3:
                graceNote.IsHammerPullOrigin = true;
                break;
        }
        graceNote.Dynamic = graceBeat.Dynamic;
        this._data.Skip(1);
        // duration
        if (this._versionNumber < 500){
            graceBeat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
        }
        else {
            var flags = this._data.ReadByte();
            graceNote.IsDead = (flags & 1) != 0;
            graceBeat.GraceType = (flags & 2) != 0 ? AlphaTab.Model.GraceType.OnBeat : AlphaTab.Model.GraceType.BeforeBeat;
        }
        graceBeat.AddNote(graceNote);
        voice.AddGraceBeat(graceBeat);
    },
    ReadTremoloPicking: function (beat){
        var speed = this._data.ReadByte();
        switch (speed){
            case 1:
                beat.TremoloSpeed = AlphaTab.Model.Duration.Eighth;
                break;
            case 2:
                beat.TremoloSpeed = AlphaTab.Model.Duration.Sixteenth;
                break;
            case 3:
                beat.TremoloSpeed = AlphaTab.Model.Duration.ThirtySecond;
                break;
        }
    },
    ReadSlide: function (note){
        if (this._versionNumber >= 500){
            var type = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            switch (type){
                case 1:
                    note.SlideType = AlphaTab.Model.SlideType.Shift;
                    break;
                case 2:
                    note.SlideType = AlphaTab.Model.SlideType.Legato;
                    break;
                case 4:
                    note.SlideType = AlphaTab.Model.SlideType.OutDown;
                    break;
                case 8:
                    note.SlideType = AlphaTab.Model.SlideType.OutUp;
                    break;
                case 16:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromBelow;
                    break;
                case 32:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromAbove;
                    break;
                default:
                    note.SlideType = AlphaTab.Model.SlideType.None;
                    break;
            }
        }
        else {
            var type = AlphaTab.Platform.Std.ReadSignedByte(this._data);
            switch (type){
                case 1:
                    note.SlideType = AlphaTab.Model.SlideType.Shift;
                    break;
                case 2:
                    note.SlideType = AlphaTab.Model.SlideType.Legato;
                    break;
                case 3:
                    note.SlideType = AlphaTab.Model.SlideType.OutDown;
                    break;
                case 4:
                    note.SlideType = AlphaTab.Model.SlideType.OutUp;
                    break;
                case -1:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromBelow;
                    break;
                case -2:
                    note.SlideType = AlphaTab.Model.SlideType.IntoFromAbove;
                    break;
                default:
                    note.SlideType = AlphaTab.Model.SlideType.None;
                    break;
            }
        }
    },
    ReadArtificialHarmonic: function (note){
        var type = this._data.ReadByte();
        if (this._versionNumber >= 500){
            switch (type){
                case 1:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                    note.HarmonicValue = this.DeltaFretToHarmonicValue(note.Fret);
                    break;
                case 2:
                    var harmonicTone = this._data.ReadByte();
                    var harmonicKey = this._data.ReadByte();
                    var harmonicOctaveOffset = this._data.ReadByte();
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 3:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                    note.HarmonicValue = this.DeltaFretToHarmonicValue(this._data.ReadByte());
                    break;
                case 4:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                    note.HarmonicValue = 12;
                    break;
                case 5:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                    note.HarmonicValue = 12;
                    break;
            }
        }
        else if (this._versionNumber >= 400){
            switch (type){
                case 1:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                    break;
                case 3:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                    break;
                case 4:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                    break;
                case 5:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                    break;
                case 15:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 17:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 22:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
            }
        }
    },
    DeltaFretToHarmonicValue: function (deltaFret){
        switch (deltaFret){
            case 2:
                return 2.4;
            case 3:
                return 3.2;
            case 4:
            case 5:
            case 7:
            case 9:
            case 12:
            case 16:
            case 17:
            case 19:
            case 24:
                return deltaFret;
            case 8:
                return 8.2;
            case 10:
                return 9.6;
            case 14:
            case 15:
                return 14.7;
            case 21:
            case 22:
                return 21.7;
            default:
                return 12;
        }
    },
    ReadTrill: function (note){
        note.TrillValue = this._data.ReadByte() + note.get_StringTuning();
        switch (this._data.ReadByte()){
            case 1:
                note.TrillSpeed = AlphaTab.Model.Duration.Sixteenth;
                break;
            case 2:
                note.TrillSpeed = AlphaTab.Model.Duration.ThirtySecond;
                break;
            case 3:
                note.TrillSpeed = AlphaTab.Model.Duration.SixtyFourth;
                break;
        }
    },
    ReadDouble: function (){
        var bytes = new Uint8Array(8);
        this._data.Read(bytes, 0, bytes.length);
        var sign = 1 - ((bytes[0] >> 7) << 1);
        // sign = bit 0
        var exp = (((bytes[0] << 4) & 2047) | (bytes[1] >> 4)) - 1023;
        // exponent = bits 1..11
        var sig = this.GetDoubleSig(bytes);
        if (sig == 0 && exp == -1023)
            return 0;
        return sign * (1 + Math.pow(2, -52) * sig) * Math.pow(2, exp);
    },
    GetDoubleSig: function (bytes){
        return (((((bytes[1] & 15) << 16) | (bytes[2] << 8) | bytes[3]) * 4294967296 + (bytes[4] >> 7) * 2147483648 + (((bytes[4] & 127) << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]))) | 0;
    },
    ReadColor: function (){
        var r = this._data.ReadByte();
        var g = this._data.ReadByte();
        var b = this._data.ReadByte();
        this._data.Skip(1);
        // alpha?
        return new AlphaTab.Platform.Model.Color(r, g, b, 255);
    },
    ReadBool: function (){
        return this._data.ReadByte() != 0;
    },
    ReadInt32: function (){
        var bytes = new Uint8Array(4);
        this._data.Read(bytes, 0, 4);
        return bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
    },
    ReadStringIntUnused: function (){
        this._data.Skip(4);
        return this.ReadString(this._data.ReadByte());
    },
    ReadStringInt: function (){
        return this.ReadString(this.ReadInt32());
    },
    ReadStringIntByte: function (){
        var length = this.ReadInt32() - 1;
        this._data.ReadByte();
        return this.ReadString(length);
    },
    ReadString: function (length){
        var b = new Uint8Array(length);
        this._data.Read(b, 0, b.length);
        return AlphaTab.Platform.Std.ToString(b);
    },
    ReadStringByteLength: function (length){
        var stringLength = this._data.ReadByte();
        var s = this.ReadString(stringLength);
        if (stringLength < length){
            this._data.Skip(length - stringLength);
        }
        return s;
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.Gp3To5Importer.VersionString = "FICHIER GUITAR PRO ";
    AlphaTab.Importer.Gp3To5Importer.BendStep = 25;
});
AlphaTab.Importer.Gp3To5Importer.ToStrokeValue = function (value){
    switch (value){
        case 1:
            return 30;
        case 2:
            return 30;
        case 3:
            return 60;
        case 4:
            return 120;
        case 5:
            return 240;
        case 6:
            return 480;
        default:
            return 0;
    }
};
$Inherit(AlphaTab.Importer.Gp3To5Importer, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.GpxFile = function (){
    this.FileName = null;
    this.FileSize = 0;
    this.Data = null;
};
AlphaTab.Importer.GpxFileSystem = function (){
    this.FileFilter = null;
    this.Files = null;
    this.Files = [];
    this.FileFilter = $CreateAnonymousDelegate(this, function (s){
        return true;
    });
};
AlphaTab.Importer.GpxFileSystem.prototype = {
    Load: function (s){
        var src = new AlphaTab.IO.BitReader(s);
        this.ReadBlock(src);
    },
    ReadHeader: function (src){
        return this.GetString(src.ReadBytes(4), 0, 4);
    },
    Decompress: function (src, skipHeader){
        var uncompressed = AlphaTab.IO.ByteBuffer.Empty();
        var buffer;
        var expectedLength = this.GetInteger(src.ReadBytes(4), 0);
        try{
            // as long we reach our expected length we try to decompress, a EOF might occure. 
            while (uncompressed.get_Length() < expectedLength){
                // compression flag
                var flag = src.ReadBits(1);
                if (flag == 1){
                    // get offset and size of the content we need to read.
                    // compressed does mean we already have read the data and need 
                    // to copy it from our uncompressed buffer to the end
                    var wordSize = src.ReadBits(4);
                    var offset = src.ReadBitsReversed(wordSize);
                    var size = src.ReadBitsReversed(wordSize);
                    // the offset is relative to the end
                    var sourcePosition = uncompressed.get_Length() - offset;
                    var toRead = Math.min(offset, size);
                    // get the subbuffer storing the data and add it again to the end
                    buffer = uncompressed.GetBuffer();
                    uncompressed.Write(buffer, sourcePosition | 0, toRead);
                }
                else {
                    // on raw content we need to read the data from the source buffer 
                    var size = src.ReadBitsReversed(2);
                    for (var i = 0; i < size; i++){
                        uncompressed.WriteByte(src.ReadByte());
                    }
                }
            }
        }
        catch($$e2){
        }
        buffer = uncompressed.GetBuffer();
        var resultOffset = skipHeader ? 4 : 0;
        var resultSize = uncompressed.get_Length() - resultOffset;
        var result = new Uint8Array(resultSize | 0);
        result.set(buffer.subarray(resultOffset,resultOffset+resultSize | 0),0);
        return result;
    },
    ReadBlock: function (data){
        var header = this.ReadHeader(data);
        if (header == "BCFZ"){
            // decompress the data and use this 
            // we will skip the header 
            this.ReadUncompressedBlock(this.Decompress(data, true));
        }
        else if (header == "BCFS"){
            this.ReadUncompressedBlock(data.ReadAll());
        }
        else {
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
    },
    ReadUncompressedBlock: function (data){
        // the uncompressed block contains a list of filesystem entires
        // as long we have data we will try to read more entries
        // the first sector (0x1000 bytes) is empty (filled with 0xFF) 
        // so the first sector starts at 0x1000 
        // (we already skipped the 4 byte header so we don't have to take care of this) 
        var sectorSize = 4096;
        var offset = sectorSize;
        // we always need 4 bytes (+3 including offset) to read the type
        while ((offset + 3) < data.length){
            var entryType = this.GetInteger(data, offset);
            if (entryType == 2){
                // file structure: 
                //   offset |   type   |   size   | what
                //  --------+----------+----------+------
                //    0x04  |  string  |  127byte | FileName (zero terminated)
                //    0x83  |    ?     |    9byte | Unknown 
                //    0x8c  |   int    |    4byte | FileSize
                //    0x90  |    ?     |    4byte | Unknown
                //    0x94  |   int[]  |  n*4byte | Indices of the sector containing the data (end is marked with 0)
                // The sectors marked at 0x94 are absolutely positioned ( 1*0x1000 is sector 1, 2*0x1000 is sector 2,...)
                var file = new AlphaTab.Importer.GpxFile();
                file.FileName = this.GetString(data, offset + 4, 127);
                file.FileSize = this.GetInteger(data, offset + 140);
                // store file if needed
                var storeFile = this.FileFilter == null || this.FileFilter(file.FileName);
                if (storeFile){
                    this.Files.push(file);
                }
                // we need to iterate the blocks because we need to move after the last datasector
                var dataPointerOffset = offset + 148;
                var sector = 0;
                // this var is storing the sector index
                var sectorCount = 0;
                // we're keeping count so we can calculate the offset of the array item
                // as long we have data blocks we need to iterate them, 
                var fileData = storeFile ? AlphaTab.IO.ByteBuffer.WithCapactiy(file.FileSize) : null;
                while ((sector = this.GetInteger(data, (dataPointerOffset + (4 * (sectorCount++))))) != 0){
                    // the next file entry starts after the last data sector so we 
                    // move the offset along
                    offset = sector * sectorSize;
                    // write data only if needed
                    if (storeFile){
                        fileData.Write(data, offset, sectorSize);
                    }
                }
                if (storeFile){
                    // trim data to filesize if needed
                    file.Data = new Uint8Array((Math.min(file.FileSize, fileData.get_Length())) | 0);
                    // we can use the getBuffer here because we are intelligent and know not to read the empty data.
                    var raw = fileData.ToArray();
                    file.Data.set(raw.subarray(0,0+file.Data.length),0);
                }
            }
            // let's move to the next sector
            offset += sectorSize;
        }
    },
    GetString: function (data, offset, length){
        var buf = new Array();
        for (var i = 0; i < length; i++){
            var code = data[offset + i] & 255;
            if (code == 0)
                break;
            // zero terminated string
            buf.push(String.fromCharCode(code));
        }
        return buf.join('');
    },
    GetInteger: function (data, offset){
        return (data[offset + 3] << 24) | (data[offset + 2] << 16) | (data[offset + 1] << 8) | data[offset];
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.GpxFileSystem.HeaderBcFs = "BCFS";
    AlphaTab.Importer.GpxFileSystem.HeaderBcFz = "BCFZ";
    AlphaTab.Importer.GpxFileSystem.ScoreGpif = "score.gpif";
});
AlphaTab.Importer.GpxImporter = function (){
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.GpxImporter.prototype = {
    ReadScore: function (){
        // at first we need to load the binary file system 
        // from the GPX container
        var fileSystem = new AlphaTab.Importer.GpxFileSystem();
        fileSystem.FileFilter = $CreateAnonymousDelegate(this, function (s){
            return s == "score.gpif";
        });
        fileSystem.Load(this._data);
        // convert data to string
        var data = fileSystem.Files[0].Data;
        var xml = AlphaTab.Platform.Std.ToString(data);
        
        // lets set the fileSystem to null, maybe the garbage collector will come along
        // and kick the fileSystem binary data before we finish parsing
        fileSystem.Files = null;
        fileSystem = null;
        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        var parser = new AlphaTab.Importer.GpxParser();
        parser.ParseXml(xml);
        parser.Score.Finish();
        return parser.Score;
    }
};
$Inherit(AlphaTab.Importer.GpxImporter, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.GpxRhythm = function (){
    this.Dots = 0;
    this.TupletDenominator = 0;
    this.TupletNumerator = 0;
    this.Value = AlphaTab.Model.Duration.Whole;
    this.TupletDenominator = 1;
    this.TupletNumerator = 1;
    this.Value = AlphaTab.Model.Duration.Quarter;
};
AlphaTab.Importer.GpxParser = function (){
    this._automations = null;
    this._tracksMapping = null;
    this._tracksById = null;
    this._masterBars = null;
    this._barsOfMasterBar = null;
    this._barsById = null;
    this._voicesOfBar = null;
    this._voiceById = null;
    this._beatsOfVoice = null;
    this._rhythmOfBeat = null;
    this._beatById = null;
    this._rhythmById = null;
    this._noteById = null;
    this._notesOfBeat = null;
    this._tappedNotes = null;
    this.Score = null;
};
AlphaTab.Importer.GpxParser.prototype = {
    ParseXml: function (xml){
        this._automations = {};
        this._tracksMapping = new Array(0);
        this._tracksById = {};
        this._masterBars = [];
        this._barsOfMasterBar = [];
        this._voicesOfBar = {};
        this._barsById = {};
        this._voiceById = {};
        this._beatsOfVoice = {};
        this._beatById = {};
        this._rhythmOfBeat = {};
        this._rhythmById = {};
        this._notesOfBeat = {};
        this._noteById = {};
        this._tappedNotes = {};
        this.ParseDom(AlphaTab.Platform.Std.LoadXml(xml));
    },
    ParseDom: function (dom){
        var root = dom.get_DocumentElement();
        if (root == null)
            return;
        // the XML uses IDs for referring elements within the 
        // model. Therefore we do the parsing in 2 steps:
        // - at first we read all model elements and store them by ID in a lookup table
        // - after that we need to join up the information. 
        if (root.get_LocalName() == "GPIF"){
            this.Score = new AlphaTab.Model.Score();
            // parse all children
            AlphaTab.Platform.Std.IterateChildren(root, $CreateAnonymousDelegate(this, function (n){
                if (n.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                    switch (n.get_LocalName()){
                        case "Score":
                            this.ParseScoreNode(n);
                            break;
                        case "MasterTrack":
                            this.ParseMasterTrackNode(n);
                            break;
                        case "Tracks":
                            this.ParseTracksNode(n);
                            break;
                        case "MasterBars":
                            this.ParseMasterBarsNode(n);
                            break;
                        case "Bars":
                            this.ParseBars(n);
                            break;
                        case "Voices":
                            this.ParseVoices(n);
                            break;
                        case "Beats":
                            this.ParseBeats(n);
                            break;
                        case "Notes":
                            this.ParseNotes(n);
                            break;
                        case "Rhythms":
                            this.ParseRhythms(n);
                            break;
                    }
                }
            }));
        }
        else {
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        this.BuildModel();
    },
    ParseScoreNode: function (element){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Title":
                        this.Score.Title = this.GetValue(c.get_FirstChild());
                        break;
                    case "SubTitle":
                        this.Score.SubTitle = this.GetValue(c.get_FirstChild());
                        break;
                    case "Artist":
                        this.Score.Artist = this.GetValue(c.get_FirstChild());
                        break;
                    case "Album":
                        this.Score.Album = this.GetValue(c.get_FirstChild());
                        break;
                    case "Words":
                        this.Score.Words = this.GetValue(c.get_FirstChild());
                        break;
                    case "Music":
                        this.Score.Music = this.GetValue(c.get_FirstChild());
                        break;
                    case "WordsAndMusic":
                        if (c.get_FirstChild() != null && c.get_FirstChild().toString() != ""){
                        var wordsAndMusic = this.GetValue(c.get_FirstChild());
                        if (!((wordsAndMusic==null)||(wordsAndMusic.length==0)) && ((this.Score.Words==null)||(this.Score.Words.length==0))){
                            this.Score.Words = wordsAndMusic;
                        }
                        if (!((wordsAndMusic==null)||(wordsAndMusic.length==0)) && ((this.Score.Music==null)||(this.Score.Music.length==0))){
                            this.Score.Music = wordsAndMusic;
                        }
                    }
                        break;
                    case "Copyright":
                        this.Score.Copyright = this.GetValue(c.get_FirstChild());
                        break;
                    case "Tabber":
                        this.Score.Tab = this.GetValue(c.get_FirstChild());
                        break;
                    case "Instructions":
                        this.Score.Instructions = this.GetValue(c.get_FirstChild());
                        break;
                    case "Notices":
                        this.Score.Notices = this.GetValue(c.get_FirstChild());
                        break;
                }
            }
        }));
    },
    ParseMasterTrackNode: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Automations":
                        this.ParseAutomations(c);
                        break;
                    case "Tracks":
                        this._tracksMapping = this.GetValue(c).split(" ");
                        break;
                }
            }
        }));
    },
    ParseAutomations: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Automation":
                        this.ParseAutomation(c);
                        break;
                }
            }
        }));
    },
    ParseAutomation: function (node){
        var type = null;
        var isLinear = false;
        var barId = null;
        var ratioPosition = 0;
        var value = 0;
        var reference = 0;
        var text = null;
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Type":
                        type = this.GetValue(c);
                        break;
                    case "Linear":
                        isLinear = this.GetValue(c).toLowerCase() == "true";
                        break;
                    case "Bar":
                        barId = this.GetValue(c);
                        break;
                    case "Position":
                        ratioPosition = AlphaTab.Platform.Std.ParseFloat(this.GetValue(c));
                        break;
                    case "Value":
                        var parts = this.GetValue(c).split(" ");
                        value = AlphaTab.Platform.Std.ParseFloat(parts[0]);
                        reference = AlphaTab.Platform.Std.ParseInt(parts[1]);
                        break;
                    case "Text":
                        text = this.GetValue(c);
                        break;
                }
            }
        }));
        if (type == null)
            return;
        var automation = null;
        switch (type){
            case "Tempo":
                automation = AlphaTab.Model.Automation.BuildTempoAutomation(isLinear, ratioPosition, value, reference);
                break;
        }
        if (automation != null){
            automation.Text = text;
        }
        if (barId != null){
            if (!this._automations.hasOwnProperty(barId)){
                this._automations[barId] = [];
            }
            this._automations[barId].push(automation);
        }
    },
    ParseTracksNode: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Track":
                        this.ParseTrack(c);
                        break;
                }
            }
        }));
    },
    ParseTrack: function (node){
        var track = new AlphaTab.Model.Track();
        var trackId = node.get_Attributes().Get("id").get_Value();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Name":
                        track.Name = this.GetValue(c);
                        break;
                    case "ShortName":
                        track.ShortName = this.GetValue(c);
                        break;
                    case "Properties":
                        this.ParseTrackProperties(track, c);
                        break;
                    case "GeneralMidi":
                        this.ParseGeneralMidi(track, c);
                        break;
                    case "PlaybackState":
                        var state = this.GetValue(c);
                        track.PlaybackInfo.IsSolo = state == "Solo";
                        track.PlaybackInfo.IsMute = state == "Mute";
                        break;
                }
            }
        }));
        this._tracksById[trackId] = track;
    },
    ParseDiagramCollection: function (track, node){
        var items = this.FindChildElement(node, "Items");
        AlphaTab.Platform.Std.IterateChildren(items, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Item":
                        this.ParseDiagramItem(track, c);
                        break;
                }
            }
        }));
    },
    ParseDiagramItem: function (track, node){
        var chord = new AlphaTab.Model.Chord();
        var chordId = node.get_Attributes().Get("id").get_Value();
        chord.Name = node.get_Attributes().Get("name").get_Value();
        track.Chords[chordId] = chord;
    },
    FindChildElement: function (node, name){
        for (var i = 0; i < node.get_ChildNodes().get_Count(); i++){
            var c = node.get_ChildNodes().Get(i);
            if (c != null && c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element && c.get_LocalName() == name){
                return c;
            }
        }
        return null;
    },
    ParseTrackProperties: function (track, node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Property":
                        this.ParseTrackProperty(track, c);
                        break;
                }
            }
        }));
    },
    ParseTrackProperty: function (track, node){
        var propertyName = node.get_Attributes().Get("name").get_Value();
        switch (propertyName){
            case "Tuning":
                var tuningParts = this.GetValue(this.FindChildElement(node, "Pitches")).split(" ");
                var tuning = new Int32Array(tuningParts.length);
                for (var i = 0; i < tuning.length; i++){
                tuning[tuning.length - 1 - i] = AlphaTab.Platform.Std.ParseInt(tuningParts[i]);
            }
                track.Tuning = tuning;
                break;
            case "DiagramCollection":
                this.ParseDiagramCollection(track, node);
                break;
            case "CapoFret":
                track.Capo = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "Fret")));
                break;
        }
    },
    ParseGeneralMidi: function (track, node){
        track.PlaybackInfo.Port = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "Port")));
        track.PlaybackInfo.Program = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "Program")));
        track.PlaybackInfo.PrimaryChannel = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "PrimaryChannel")));
        track.PlaybackInfo.SecondaryChannel = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(node, "SecondaryChannel")));
        track.IsPercussion = (node.get_Attributes().Get("table") != null && node.get_Attributes().Get("table").get_Value() == "Percussion");
    },
    ParseMasterBarsNode: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "MasterBar":
                        this.ParseMasterBar(c);
                        break;
                }
            }
        }));
    },
    ParseMasterBar: function (node){
        var masterBar = new AlphaTab.Model.MasterBar();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Time":
                        var timeParts = this.GetValue(c).split("/");
                        masterBar.TimeSignatureNumerator = AlphaTab.Platform.Std.ParseInt(timeParts[0]);
                        masterBar.TimeSignatureDenominator = AlphaTab.Platform.Std.ParseInt(timeParts[1]);
                        break;
                    case "DoubleBar":
                        masterBar.IsDoubleBar = true;
                        break;
                    case "Section":
                        masterBar.Section = new AlphaTab.Model.Section();
                        masterBar.Section.Marker = this.GetValue(this.FindChildElement(c, "Letter"));
                        masterBar.Section.Text = this.GetValue(this.FindChildElement(c, "Text"));
                        break;
                    case "Repeat":
                        if (c.get_Attributes().Get("start").get_Value().toLowerCase() == "true"){
                        masterBar.IsRepeatStart = true;
                    }
                        if (c.get_Attributes().Get("end").get_Value().toLowerCase() == "true" && c.get_Attributes().Get("count").get_Value() != null){
                        masterBar.RepeatCount = AlphaTab.Platform.Std.ParseInt(c.get_Attributes().Get("count").get_Value());
                    }
                        break;
                    case "AlternateEndings":
                        var alternateEndings = this.GetValue(c).split(" ");
                        var i = 0;
                        for (var k = 0; k < alternateEndings.length; k++){
                        i |= 1 << (-1 + AlphaTab.Platform.Std.ParseInt(alternateEndings[k]));
                    }
                        masterBar.AlternateEndings = i;
                        break;
                    case "Bars":
                        this._barsOfMasterBar.push(this.GetValue(c).split(" "));
                        break;
                    case "TripletFeel":
                        switch (this.GetValue(c)){
                            case "NoTripletFeel":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
                            break;
                            case "Triplet8th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet8th;
                            break;
                            case "Triplet16th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet16th;
                            break;
                            case "Dotted8th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Dotted8th;
                            break;
                            case "Dotted16th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Dotted16th;
                            break;
                            case "Scottish8th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Scottish8th;
                            break;
                            case "Scottish16th":
                            masterBar.TripletFeel = AlphaTab.Model.TripletFeel.Scottish16th;
                            break;
                        }
                        break;
                    case "Key":
                        masterBar.KeySignature = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "AccidentalCount")));
                        break;
                }
            }
        }));
        this._masterBars.push(masterBar);
    },
    ParseBars: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Bar":
                        this.ParseBar(c);
                        break;
                }
            }
        }));
    },
    ParseBar: function (node){
        var bar = new AlphaTab.Model.Bar();
        var barId = node.get_Attributes().Get("id").get_Value();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Voices":
                        this._voicesOfBar[barId] = this.GetValue(c).split(" ");
                        break;
                    case "Clef":
                        switch (this.GetValue(c)){
                            case "Neutral":
                            bar.Clef = AlphaTab.Model.Clef.Neutral;
                            break;
                            case "G2":
                            bar.Clef = AlphaTab.Model.Clef.G2;
                            break;
                            case "F4":
                            bar.Clef = AlphaTab.Model.Clef.F4;
                            break;
                            case "C4":
                            bar.Clef = AlphaTab.Model.Clef.C4;
                            break;
                            case "C3":
                            bar.Clef = AlphaTab.Model.Clef.C3;
                            break;
                        }
                        break;
                }
            }
        }));
        this._barsById[barId] = bar;
    },
    ParseVoices: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Voice":
                        this.ParseVoice(c);
                        break;
                }
            }
        }));
    },
    ParseVoice: function (node){
        var voice = new AlphaTab.Model.Voice();
        var voiceId = node.get_Attributes().Get("id").get_Value();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Beats":
                        this._beatsOfVoice[voiceId] = this.GetValue(c).split(" ");
                        break;
                }
            }
        }));
        this._voiceById[voiceId] = voice;
    },
    ParseBeats: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Beat":
                        this.ParseBeat(c);
                        break;
                }
            }
        }));
    },
    ParseBeat: function (node){
        var beat = new AlphaTab.Model.Beat();
        var beatId = node.get_Attributes().Get("id").get_Value();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Notes":
                        this._notesOfBeat[beatId] = this.GetValue(c).split(" ");
                        break;
                    case "Rhythm":
                        this._rhythmOfBeat[beatId] = c.get_Attributes().Get("ref").get_Value();
                        break;
                    case "Fadding":
                        if (this.GetValue(c) == "FadeIn"){
                        beat.FadeIn = true;
                    }
                        break;
                    case "Tremolo":
                        switch (this.GetValue(c)){
                            case "1/2":
                            beat.TremoloSpeed = AlphaTab.Model.Duration.Eighth;
                            break;
                            case "1/4":
                            beat.TremoloSpeed = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case "1/8":
                            beat.TremoloSpeed = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                        }
                        break;
                    case "Chord":
                        beat.ChordId = this.GetValue(c);
                        break;
                    case "Hairpin":
                        switch (this.GetValue(c)){
                            case "Crescendo":
                            beat.Crescendo = AlphaTab.Model.CrescendoType.Crescendo;
                            break;
                            case "Decrescendo":
                            beat.Crescendo = AlphaTab.Model.CrescendoType.Decrescendo;
                            break;
                        }
                        break;
                    case "Arpeggio":
                        if (this.GetValue(c) == "Up"){
                        beat.BrushType = AlphaTab.Model.BrushType.ArpeggioUp;
                    }
                        else {
                        beat.BrushType = AlphaTab.Model.BrushType.ArpeggioDown;
                    }
                        break;
                    case "Properties":
                        this.ParseBeatProperties(c, beat);
                        break;
                    case "FreeText":
                        beat.Text = this.GetValue(c);
                        break;
                    case "Dynamic":
                        switch (this.GetValue(c)){
                            case "PPP":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.PPP;
                            break;
                            case "PP":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.PP;
                            break;
                            case "P":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.P;
                            break;
                            case "MP":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.MP;
                            break;
                            case "MF":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.MF;
                            break;
                            case "F":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.F;
                            break;
                            case "FF":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.FF;
                            break;
                            case "FFF":
                            beat.Dynamic = AlphaTab.Model.DynamicValue.FFF;
                            break;
                        }
                        break;
                    case "GraceNotes":
                        switch (this.GetValue(c)){
                            case "OnBeat":
                            beat.GraceType = AlphaTab.Model.GraceType.OnBeat;
                            break;
                            case "BeforeBeat":
                            beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
                            break;
                        }
                        break;
                }
            }
        }));
        this._beatById[beatId] = beat;
    },
    ParseBeatProperties: function (node, beat){
        var isWhammy = false;
        var whammyOrigin = null;
        var whammyMiddleValue = null;
        var whammyMiddleOffset1 = null;
        var whammyMiddleOffset2 = null;
        var whammyDestination = null;
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Property":
                        var name = c.get_Attributes().Get("name").get_Value();
                        switch (name){
                            case "Brush":
                            if (this.GetValue(this.FindChildElement(c, "Direction")) == "Up"){
                            beat.BrushType = AlphaTab.Model.BrushType.BrushUp;
                        }
                            else {
                            beat.BrushType = AlphaTab.Model.BrushType.BrushDown;
                        }
                            break;
                            case "PickStroke":
                            if (this.GetValue(this.FindChildElement(c, "Direction")) == "Up"){
                            beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
                        }
                            else {
                            beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
                        }
                            break;
                            case "Slapped":
                            if (this.FindChildElement(c, "Enable") != null)
                            beat.Slap = true;
                            break;
                            case "Popped":
                            if (this.FindChildElement(c, "Enable") != null)
                            beat.Pop = true;
                            break;
                            case "VibratoWTremBar":
                            switch (this.GetValue(this.FindChildElement(c, "Strength"))){
                                case "Wide":
                                beat.Vibrato = AlphaTab.Model.VibratoType.Wide;
                                break;
                                case "Slight":
                                beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
                                break;
                            }
                            break;
                            case "WhammyBar":
                            isWhammy = true;
                            break;
                            case "WhammyBarExtend":
                            break;
                            case "WhammyBarOriginValue":
                            if (whammyOrigin == null)
                            whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            whammyOrigin.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarOriginOffset":
                            if (whammyOrigin == null)
                            whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            whammyOrigin.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarMiddleValue":
                            whammyMiddleValue = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarMiddleOffset1":
                            whammyMiddleOffset1 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarMiddleOffset2":
                            whammyMiddleOffset2 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarDestinationValue":
                            if (whammyDestination == null)
                            whammyDestination = new AlphaTab.Model.BendPoint(60, 0);
                            whammyDestination.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "WhammyBarDestinationOffset":
                            if (whammyDestination == null)
                            whammyDestination = new AlphaTab.Model.BendPoint(0, 0);
                            whammyDestination.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                        }
                        break;
                }
            }
        }));
        if (isWhammy){
            if (whammyOrigin == null)
                whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
            if (whammyDestination == null)
                whammyDestination = new AlphaTab.Model.BendPoint(60, 0);
            var whammy = [];
            whammy.push(whammyOrigin);
            if (whammyMiddleOffset1 != null && whammyMiddleValue != null){
                whammy.push(new AlphaTab.Model.BendPoint(whammyMiddleOffset1, whammyMiddleValue));
            }
            if (whammyMiddleOffset2 != null && whammyMiddleValue != null){
                whammy.push(new AlphaTab.Model.BendPoint(whammyMiddleOffset2, whammyMiddleValue));
            }
            if (whammyMiddleOffset1 == null && whammyMiddleOffset2 == null && whammyMiddleValue != null){
                whammy.push(new AlphaTab.Model.BendPoint(30, whammyMiddleValue));
            }
            whammy.push(whammyDestination);
            beat.WhammyBarPoints = whammy;
        }
    },
    ParseNotes: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Note":
                        this.ParseNote(c);
                        break;
                }
            }
        }));
    },
    ParseNote: function (node){
        var note = new AlphaTab.Model.Note();
        var noteId = node.get_Attributes().Get("id").get_Value();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Properties":
                        this.ParseNoteProperties(c, note, noteId);
                        break;
                    case "AntiAccent":
                        if (this.GetValue(c).toLowerCase() == "normal"){
                        note.IsGhost = true;
                    }
                        break;
                    case "LetRing":
                        note.IsLetRing = true;
                        break;
                    case "Trill":
                        note.TrillValue = AlphaTab.Platform.Std.ParseInt(this.GetValue(c));
                        note.TrillSpeed = AlphaTab.Model.Duration.Sixteenth;
                        break;
                    case "Accent":
                        var accentFlags = AlphaTab.Platform.Std.ParseInt(this.GetValue(c));
                        if ((accentFlags & 1) != 0)
                        note.IsStaccato = true;
                        if ((accentFlags & 4) != 0)
                        note.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
                        if ((accentFlags & 8) != 0)
                        note.Accentuated = AlphaTab.Model.AccentuationType.Normal;
                        break;
                    case "Tie":
                        if (c.get_Attributes().Get("origin").get_Value().toLowerCase() == "true"){
                        note.IsTieOrigin = true;
                    }
                        if (c.get_Attributes().Get("destination").get_Value().toLowerCase() == "true"){
                        note.IsTieDestination = true;
                    }
                        break;
                    case "Vibrato":
                        switch (this.GetValue(c)){
                            case "Slight":
                            note.Vibrato = AlphaTab.Model.VibratoType.Slight;
                            break;
                            case "Wide":
                            note.Vibrato = AlphaTab.Model.VibratoType.Wide;
                            break;
                        }
                        break;
                    case "LeftFingering":
                        note.IsFingering = true;
                        switch (this.GetValue(c)){
                            case "P":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.Thumb;
                            break;
                            case "I":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.IndexFinger;
                            break;
                            case "M":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.MiddleFinger;
                            break;
                            case "A":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.AnnularFinger;
                            break;
                            case "C":
                            note.LeftHandFinger = AlphaTab.Model.Fingers.LittleFinger;
                            break;
                        }
                        break;
                    case "RightFingering":
                        note.IsFingering = true;
                        switch (this.GetValue(c)){
                            case "P":
                            note.RightHandFinger = AlphaTab.Model.Fingers.Thumb;
                            break;
                            case "I":
                            note.RightHandFinger = AlphaTab.Model.Fingers.IndexFinger;
                            break;
                            case "M":
                            note.RightHandFinger = AlphaTab.Model.Fingers.MiddleFinger;
                            break;
                            case "A":
                            note.RightHandFinger = AlphaTab.Model.Fingers.AnnularFinger;
                            break;
                            case "C":
                            note.RightHandFinger = AlphaTab.Model.Fingers.LittleFinger;
                            break;
                        }
                        break;
                }
            }
        }));
        this._noteById[noteId] = note;
    },
    ParseNoteProperties: function (node, note, noteId){
        var isBended = false;
        var bendOrigin = null;
        var bendMiddleValue = null;
        var bendMiddleOffset1 = null;
        var bendMiddleOffset2 = null;
        var bendDestination = null;
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Property":
                        var name = c.get_Attributes().Get("name").get_Value();
                        switch (name){
                            case "String":
                            note.String = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "String"))) + 1;
                            break;
                            case "Fret":
                            note.Fret = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Fret")));
                            break;
                            case "Element":
                            note.Element = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Element")));
                            break;
                            case "Variation":
                            note.Variation = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Variation")));
                            break;
                            case "Tapped":
                            this._tappedNotes[noteId] = true;
                            break;
                            case "HarmonicType":
                            var htype = this.FindChildElement(c, "HType");
                            if (htype != null){
                            switch (this.GetValue(htype)){
                                case "NoHarmonic":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.None;
                                    break;
                                case "Natural":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                                    break;
                                case "Artificial":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                                    break;
                                case "Pinch":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Pinch;
                                    break;
                                case "Tap":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                                    break;
                                case "Semi":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Semi;
                                    break;
                                case "Feedback":
                                    note.HarmonicType = AlphaTab.Model.HarmonicType.Feedback;
                                    break;
                            }
                        }
                            break;
                            case "HarmonicFret":
                            var hfret = this.FindChildElement(c, "HFret");
                            if (hfret != null){
                            note.HarmonicValue = AlphaTab.Platform.Std.ParseFloat(this.GetValue(hfret));
                        }
                            break;
                            case "Muted":
                            if (this.FindChildElement(c, "Enable") != null)
                            note.IsDead = true;
                            break;
                            case "PalmMuted":
                            if (this.FindChildElement(c, "Enable") != null)
                            note.IsPalmMute = true;
                            break;
                            case "Octave":
                            note.Octave = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Number"))) - 1;
                            break;
                            case "Tone":
                            note.Tone = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Step")));
                            break;
                            case "Bended":
                            isBended = true;
                            break;
                            case "BendOriginValue":
                            if (bendOrigin == null)
                            bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            bendOrigin.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendOriginOffset":
                            if (bendOrigin == null)
                            bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            bendOrigin.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendMiddleValue":
                            bendMiddleValue = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendMiddleOffset1":
                            bendMiddleOffset1 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendMiddleOffset2":
                            bendMiddleOffset2 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendDestinationValue":
                            if (bendDestination == null)
                            bendDestination = new AlphaTab.Model.BendPoint(60, 0);
                            bendDestination.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "BendDestinationOffset":
                            if (bendDestination == null)
                            bendDestination = new AlphaTab.Model.BendPoint(0, 0);
                            bendDestination.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(this.GetValue(this.FindChildElement(c, "Float"))));
                            break;
                            case "HopoOrigin":
                            if (this.FindChildElement(c, "Enable") != null)
                            note.IsHammerPullOrigin = true;
                            break;
                            case "HopoDestination":
                            break;
                            case "Slide":
                            var slideFlags = AlphaTab.Platform.Std.ParseInt(this.GetValue(this.FindChildElement(c, "Flags")));
                            if ((slideFlags & 1) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.Shift;
                            if ((slideFlags & 2) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.Legato;
                            if ((slideFlags & 4) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.OutDown;
                            if ((slideFlags & 8) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.OutUp;
                            if ((slideFlags & 16) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.IntoFromBelow;
                            if ((slideFlags & 32) != 0)
                            note.SlideType = AlphaTab.Model.SlideType.IntoFromAbove;
                            break;
                        }
                        break;
                }
            }
        }));
        if (isBended){
            if (bendOrigin == null)
                bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
            if (bendDestination == null)
                bendDestination = new AlphaTab.Model.BendPoint(60, 0);
            note.AddBendPoint(bendOrigin);
            if (bendMiddleOffset1 != null && bendMiddleValue != null){
                note.AddBendPoint(new AlphaTab.Model.BendPoint(bendMiddleOffset1, bendMiddleValue));
            }
            if (bendMiddleOffset2 != null && bendMiddleValue != null){
                note.AddBendPoint(new AlphaTab.Model.BendPoint(bendMiddleOffset2, bendMiddleValue));
            }
            if (bendMiddleOffset1 == null && bendMiddleOffset2 == null && bendMiddleValue != null){
                note.AddBendPoint(new AlphaTab.Model.BendPoint(30, bendMiddleValue));
            }
            note.AddBendPoint(bendDestination);
        }
    },
    ToBendValue: function (gpxValue){
        // NOTE: strange IEEE behavior here: 
        // (int)(100f * 0.04f) => 3
        // (100f*0.04f) => 4.0f => (int)4.0f => 4
        var converted = gpxValue * 0.04;
        return ((converted)) | 0;
    },
    ToBendOffset: function (gpxOffset){
        var converted = gpxOffset * 0.6;
        return ((converted)) | 0;
    },
    ParseRhythms: function (node){
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "Rhythm":
                        this.ParseRhythm(c);
                        break;
                }
            }
        }));
    },
    ParseRhythm: function (node){
        var rhythm = new AlphaTab.Importer.GpxRhythm();
        var rhythmId = node.get_Attributes().Get("id").get_Value();
        AlphaTab.Platform.Std.IterateChildren(node, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "NoteValue":
                        switch (this.GetValue(c)){
                            case "Whole":
                            rhythm.Value = AlphaTab.Model.Duration.Whole;
                            break;
                            case "Half":
                            rhythm.Value = AlphaTab.Model.Duration.Half;
                            break;
                            case "Quarter":
                            rhythm.Value = AlphaTab.Model.Duration.Quarter;
                            break;
                            case "Eighth":
                            rhythm.Value = AlphaTab.Model.Duration.Eighth;
                            break;
                            case "16th":
                            rhythm.Value = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case "32nd":
                            rhythm.Value = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                            case "64th":
                            rhythm.Value = AlphaTab.Model.Duration.SixtyFourth;
                            break;
                        }
                        break;
                    case "PrimaryTuplet":
                        rhythm.TupletNumerator = AlphaTab.Platform.Std.ParseInt(c.get_Attributes().Get("num").get_Value());
                        rhythm.TupletDenominator = AlphaTab.Platform.Std.ParseInt(c.get_Attributes().Get("den").get_Value());
                        break;
                    case "AugmentationDot":
                        rhythm.Dots = AlphaTab.Platform.Std.ParseInt(c.get_Attributes().Get("count").get_Value());
                        break;
                }
            }
        }));
        this._rhythmById[rhythmId] = rhythm;
    },
    GetValue: function (n){
        return AlphaTab.Platform.Std.GetNodeValue(n);
    },
    BuildModel: function (){
        // build score
        for (var i = 0,j = this._masterBars.length; i < j; i++){
            var masterBar = this._masterBars[i];
            this.Score.AddMasterBar(masterBar);
        }
        // build tracks (not all, only those used by the score)
        var trackIndex = 0;
        for (var $i9 = 0,$t9 = this._tracksMapping,$l9 = $t9.length,trackId = $t9[$i9]; $i9 < $l9; $i9++, trackId = $t9[$i9]){
            var track = this._tracksById[trackId];
            this.Score.AddTrack(track);
            // iterate all bar definitions for the masterbars
            // and add the correct bar to the track
            for (var i = 0,j = this._barsOfMasterBar.length; i < j; i++){
                var barIds = this._barsOfMasterBar[i];
                var barId = barIds[trackIndex];
                if (barId != "-1"){
                    track.AddBar(this._barsById[barId]);
                }
            }
            trackIndex++;
        }
        // build bars
        for (var $i10 = 0,$t10 = Object.keys(this._barsById),$l10 = $t10.length,barId = $t10[$i10]; $i10 < $l10; $i10++, barId = $t10[$i10]){
            var bar = this._barsById[barId];
            if (this._voicesOfBar.hasOwnProperty(barId)){
                // add voices to bars
                for (var $i11 = 0,$t11 = this._voicesOfBar[barId],$l11 = $t11.length,voiceId = $t11[$i11]; $i11 < $l11; $i11++, voiceId = $t11[$i11]){
                    if (voiceId != "-1"){
                        bar.AddVoice(this._voiceById[voiceId]);
                    }
                    else {
                        // invalid voice -> empty voice
                        var voice = new AlphaTab.Model.Voice();
                        bar.AddVoice(voice);
                        var beat = new AlphaTab.Model.Beat();
                        beat.IsEmpty = true;
                        beat.Duration = AlphaTab.Model.Duration.Quarter;
                        voice.AddBeat(beat);
                    }
                }
            }
        }
        // build beats
        for (var $i12 = 0,$t12 = Object.keys(this._beatById),$l12 = $t12.length,beatId = $t12[$i12]; $i12 < $l12; $i12++, beatId = $t12[$i12]){
            var beat = this._beatById[beatId];
            var rhythmId = this._rhythmOfBeat[beatId];
            var rhythm = this._rhythmById[rhythmId];
            // set beat duration
            beat.Duration = rhythm.Value;
            beat.Dots = rhythm.Dots;
            beat.TupletNumerator = rhythm.TupletNumerator;
            beat.TupletDenominator = rhythm.TupletDenominator;
            // add notes to beat
            if (this._notesOfBeat.hasOwnProperty(beatId)){
                for (var $i13 = 0,$t13 = this._notesOfBeat[beatId],$l13 = $t13.length,noteId = $t13[$i13]; $i13 < $l13; $i13++, noteId = $t13[$i13]){
                    if (noteId != "-1"){
                        beat.AddNote(this._noteById[noteId]);
                        if (this._tappedNotes.hasOwnProperty(noteId)){
                            beat.Tap = true;
                        }
                    }
                }
            }
        }
        // build voices
        for (var $i14 = 0,$t14 = Object.keys(this._voiceById),$l14 = $t14.length,voiceId = $t14[$i14]; $i14 < $l14; $i14++, voiceId = $t14[$i14]){
            var voice = this._voiceById[voiceId];
            if (this._beatsOfVoice.hasOwnProperty(voiceId)){
                // add beats to voices
                for (var $i15 = 0,$t15 = this._beatsOfVoice[voiceId],$l15 = $t15.length,beatId = $t15[$i15]; $i15 < $l15; $i15++, beatId = $t15[$i15]){
                    if (beatId != "-1"){
                        // important! we clone the beat because beats get reused
                        // in gp6, our model needs to have unique beats.
                        voice.AddBeat(this._beatById[beatId].Clone());
                    }
                }
            }
        }
        // build automations
        for (var $i16 = 0,$t16 = Object.keys(this._automations),$l16 = $t16.length,barId = $t16[$i16]; $i16 < $l16; $i16++, barId = $t16[$i16]){
            var bar = this._barsById[barId];
            for (var i = 0,j = bar.Voices.length; i < j; i++){
                var v = bar.Voices[i];
                if (v.Beats.length > 0){
                    for (var k = 0,l = this._automations[barId].length; k < l; k++){
                        var automation = this._automations[barId][k];
                        v.Beats[0].Automations.push(automation);
                    }
                }
            }
        }
        // build automations
        for (var $i17 = 0,$t17 = Object.keys(this._automations),$l17 = $t17.length,barId = $t17[$i17]; $i17 < $l17; $i17++, barId = $t17[$i17]){
            var automations = this._automations[barId];
            var bar = this._barsById[barId];
            for (var i = 0,j = automations.length; i < j; i++){
                var automation = automations[i];
                if (automation.Type == AlphaTab.Model.AutomationType.Tempo){
                    if (barId == "0"){
                        this.Score.Tempo = ((automation.Value)) | 0;
                        this.Score.TempoLabel = automation.Text;
                    }
                    bar.get_MasterBar().TempoAutomation = automation;
                }
            }
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Importer.GpxParser.InvalidId = "-1";
    AlphaTab.Importer.GpxParser.BendPointPositionFactor = 0.6;
    AlphaTab.Importer.GpxParser.BendPointValueFactor = 0.04;
});
AlphaTab.Importer.MixTableChange = function (){
    this.Volume = 0;
    this.Balance = 0;
    this.Instrument = 0;
    this.TempoName = null;
    this.Tempo = 0;
    this.Duration = 0;
    this.Volume = -1;
    this.Balance = -1;
    this.Instrument = -1;
    this.TempoName = null;
    this.Tempo = -1;
    this.Duration = 0;
};
AlphaTab.Importer.MusicXml2Importer = function (){
    this._score = null;
    this._trackById = null;
    this._trackFirstMeasureNumber = 0;
    this._maxVoices = 0;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.MusicXml2Importer.prototype = {
    ReadScore: function (){
        this._trackById = {};
        var xml = AlphaTab.Platform.Std.ToString(this._data.ReadAll());
        var dom;
        try{
            dom = AlphaTab.Platform.Std.LoadXml(xml);
        }
        catch($$e3){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        this._score = new AlphaTab.Model.Score();
        this._score.Tempo = 120;
        this.ParseDom(dom);
        this._score.Finish();
        return this._score;
    },
    ParseDom: function (dom){
        var root = dom.get_DocumentElement();
        if (root == null)
            return;
        switch (root.get_LocalName()){
            case "score-partwise":
                this.ParsePartwise(root);
                break;
            case "score-timewise":
                break;
            default:
                throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
    },
    ParsePartwise: function (element){
        var version = element.GetAttribute("version");
        if (!((version==null)||(version.length==0)) && version != "2.0"){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(), new Error());
        }
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "movement-title":
                        this._score.Title = AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild());
                        break;
                    case "identification":
                        this.ParseIdentification(c);
                        break;
                    case "part-list":
                        this.ParsePartList(c);
                        break;
                    case "part":
                        this.ParsePart(c);
                        break;
                }
            }
        }));
    },
    ParsePart: function (element){
        var id = element.GetAttribute("id");
        var track = this._trackById[id];
        var isFirstMeasure = true;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "measure":
                        this.ParseMeasure(c, track, isFirstMeasure);
                        isFirstMeasure = false;
                        break;
                }
            }
        }));
    },
    ParseMeasure: function (element, track, isFirstMeasure){
        var barIndex = 0;
        if (isFirstMeasure){
            this._trackFirstMeasureNumber = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("number"));
            barIndex = 0;
        }
        else {
            barIndex = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("number")) - this._trackFirstMeasureNumber;
        }
        // create empty bars to the current index
        var bar = null;
        var masterBar = null;
        for (var i = track.Bars.length; i <= barIndex; i++){
            bar = new AlphaTab.Model.Bar();
            masterBar = this.GetOrCreateMasterBar(barIndex);
            track.AddBar(bar);
            for (var j = 0; j < this._maxVoices; j++){
                var emptyVoice = new AlphaTab.Model.Voice();
                bar.AddVoice(emptyVoice);
                var emptyBeat = (function (){
                    var $v1 = new AlphaTab.Model.Beat();
                    $v1.IsEmpty = true;
                    return $v1;
                }).call(this);
                emptyVoice.AddBeat(emptyBeat);
            }
        }
        var chord = false;
        var isFirstBeat = true;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "note":
                        chord = this.ParseNoteBeat(c, track, bar, chord, isFirstBeat);
                        isFirstBeat = false;
                        break;
                    case "forward":
                        break;
                    case "direction":
                        this.ParseDirection(c, masterBar);
                        break;
                    case "attributes":
                        this.ParseAttributes(c, bar, masterBar);
                        break;
                    case "harmony":
                        break;
                    case "sound":
                        break;
                    case "barline":
                        break;
                }
            }
        }));
    },
    ParseNoteBeat: function (element, track, bar, chord, isFirstBeat){
        var voiceIndex = 0;
        var voiceNodes = element.GetElementsByTagName("voice");
        if (voiceNodes.get_Count() > 0){
            voiceIndex = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(voiceNodes.Get(0))) - 1;
        }
        var beat;
        var voice = this.GetOrCreateVoice(bar, voiceIndex);
        if (chord || (isFirstBeat && voice.Beats.length == 1)){
            beat = voice.Beats[voice.Beats.length - 1];
        }
        else {
            beat = new AlphaTab.Model.Beat();
            voice.AddBeat(beat);
        }
        var note = new AlphaTab.Model.Note();
        beat.AddNote(note);
        beat.IsEmpty = false;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "grace":
                        beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
                        beat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                        break;
                    case "duration":
                        beat.Duration = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "tie":
                        AlphaTab.Importer.MusicXml2Importer.ParseTied(c, note);
                        break;
                    case "cue":
                        break;
                    case "instrument":
                        break;
                    case "type":
                        switch (AlphaTab.Platform.Std.GetNodeValue(c)){
                            case "64th":
                            beat.Duration = AlphaTab.Model.Duration.SixtyFourth;
                            break;
                            case "32nd":
                            beat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                            case "16th":
                            beat.Duration = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case "eighth":
                            beat.Duration = AlphaTab.Model.Duration.Eighth;
                            break;
                            case "quarter":
                            beat.Duration = AlphaTab.Model.Duration.Quarter;
                            break;
                            case "half":
                            beat.Duration = AlphaTab.Model.Duration.Half;
                            break;
                            case "whole":
                            beat.Duration = AlphaTab.Model.Duration.Whole;
                            break;
                        }
                        break;
                    case "dot":
                        note.IsStaccato = true;
                        break;
                    case "accidental":
                        this.ParseAccidental(c, note);
                        break;
                    case "time-modification":
                        this.ParseTimeModification(c, beat);
                        break;
                    case "stem":
                        break;
                    case "notehead":
                        if (c.GetAttribute("parentheses") == "yes"){
                        note.IsGhost = true;
                    }
                        break;
                    case "beam":
                        break;
                    case "notations":
                        this.ParseNotations(c, beat, note);
                        break;
                    case "lyric":
                        break;
                    case "chord":
                        chord = true;
                        break;
                    case "pitch":
                        this.ParsePitch(c, track, beat, note);
                        break;
                    case "unpitched":
                        note.String = 0;
                        note.Fret = 0;
                        break;
                    case "rest":
                        beat.IsEmpty = false;
                        break;
                }
            }
        }));
        return chord;
    },
    ParseAccidental: function (element, note){
        switch (AlphaTab.Platform.Std.GetNodeValue(element)){
            case "sharp":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceSharp;
                break;
            case "natural":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceNatural;
                break;
            case "flat":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceFlat;
                break;
        }
    },
    ParseNotations: function (element, beat, note){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "tied":
                        AlphaTab.Importer.MusicXml2Importer.ParseTied(c, note);
                        break;
                    case "slide":
                        if (c.GetAttribute("type") == "start"){
                        note.SlideType = AlphaTab.Model.SlideType.Legato;
                    }
                        break;
                    case "dynamics":
                        this.ParseDynamics(c, beat);
                        break;
                }
            }
        }));
    },
    ParseDynamics: function (element, beat){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "p":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.P;
                        break;
                    case "pp":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.PP;
                        break;
                    case "ppp":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.PPP;
                        break;
                    case "f":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.F;
                        break;
                    case "ff":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.FF;
                        break;
                    case "fff":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.FFF;
                        break;
                    case "mp":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.MP;
                        break;
                    case "mf":
                        beat.Dynamic = AlphaTab.Model.DynamicValue.MF;
                        break;
                }
            }
        }));
    },
    ParseTimeModification: function (element, beat){
        var actualNodes = 0;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "actual-notes":
                        beat.TupletNumerator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "normal-notes":
                        beat.TupletDenominator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
    },
    ParsePitch: function (element, track, beat, note){
        var step = null;
        var semitones = 0;
        var octave = 0;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "step":
                        step = AlphaTab.Platform.Std.GetNodeValue(c);
                        break;
                    case "alter":
                        semitones = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "octave":
                        octave = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
        var fullNoteName = step + octave;
        var fullNoteValue = AlphaTab.Model.TuningParser.GetTuningForText(fullNoteName) + semitones;
        this.ApplyNoteStringFrets(track, beat, note, fullNoteValue);
    },
    ApplyNoteStringFrets: function (track, beat, note, fullNoteValue){
        note.String = this.FindStringForValue(track, beat, fullNoteValue);
        note.Fret = fullNoteValue - AlphaTab.Model.Note.GetStringTuning(track, note.String);
    },
    FindStringForValue: function (track, beat, value){
        // find strings which are already taken
        var takenStrings = {};
        for (var i = 0; i < beat.Notes.length; i++){
            var note = beat.Notes[i];
            takenStrings[note.String] = true;
        }
        // find a string where the note matches into 0 to <upperbound>
        // first try to find a string from 0-14 (more handy to play)
        // then try from 0-20 (guitars with high frets)
        // then unlimited 
        var steps = new Int32Array([14, 20, 2147483647]);
        for (var i = 0; i < steps.length; i++){
            for (var j = 0; j < track.Tuning.length; j++){
                if (!takenStrings.hasOwnProperty(j)){
                    var min = track.Tuning[j];
                    var max = track.Tuning[j] + steps[i];
                    if (value >= min && value <= max){
                        return track.Tuning.length - j;
                    }
                }
            }
        }
        // will not happen
        return 1;
    },
    GetOrCreateVoice: function (bar, index){
        if (index < bar.Voices.length){
            return bar.Voices[index];
        }
        for (var i = bar.Voices.length; i <= index; i++){
            bar.AddVoice(new AlphaTab.Model.Voice());
        }
        this._maxVoices = Math.max(this._maxVoices, bar.Voices.length);
        return bar.Voices[index];
    },
    ParseDirection: function (element, masterBar){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "sound":
                        var tempoAutomation = new AlphaTab.Model.Automation();
                        tempoAutomation.IsLinear = true;
                        tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
                        tempoAutomation.Value = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("tempo"));
                        masterBar.TempoAutomation = tempoAutomation;
                        break;
                }
            }
        }));
    },
    ParseAttributes: function (element, bar, masterBar){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "key":
                        this.ParseKey(c, masterBar);
                        break;
                    case "time":
                        this.ParseTime(c, masterBar);
                        break;
                    case "clef":
                        this.ParseClef(c, bar);
                        break;
                }
            }
        }));
    },
    ParseClef: function (element, bar){
        var sign = null;
        var line = null;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "sign":
                        sign = AlphaTab.Platform.Std.GetNodeValue(c);
                        break;
                    case "line":
                        line = AlphaTab.Platform.Std.GetNodeValue(c);
                        break;
                }
            }
        }));
        var clef = sign + line;
        switch (clef){
            case "G2":
                bar.Clef = AlphaTab.Model.Clef.G2;
                break;
            case "F4":
                bar.Clef = AlphaTab.Model.Clef.F4;
                break;
            case "C3":
                bar.Clef = AlphaTab.Model.Clef.C3;
                break;
            case "C4":
                bar.Clef = AlphaTab.Model.Clef.C4;
                break;
        }
    },
    ParseTime: function (element, masterBar){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "beats":
                        masterBar.TimeSignatureNumerator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "beats-type":
                        masterBar.TimeSignatureDenominator = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
    },
    ParseKey: function (element, masterBar){
        var fifths = -2147483648;
        var keyStep = -2147483648;
        var keyAlter = -2147483648;
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "fifths":
                        fifths = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "key-step":
                        keyStep = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                    case "key-alter":
                        keyAlter = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c));
                        break;
                }
            }
        }));
        if (fifths != -2147483648){
            // TODO: check if this is conrrect
            masterBar.KeySignature = fifths;
        }
        else {
            // TODO: map keyStep/keyAlter to internal keysignature
        }
    },
    GetOrCreateMasterBar: function (index){
        if (index < this._score.MasterBars.length){
            return this._score.MasterBars[index];
        }
        for (var i = this._score.MasterBars.length; i <= index; i++){
            var mb = new AlphaTab.Model.MasterBar();
            this._score.AddMasterBar(mb);
        }
        return this._score.MasterBars[index];
    },
    ParseIdentification: function (element){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "creator":
                        if (c.GetAttribute("type") == "composer"){
                        this._score.Music = AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild());
                    }
                        break;
                    case "rights":
                        this._score.Artist = AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild());
                        break;
                }
            }
        }));
    },
    ParsePartList: function (element){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "score-part":
                        this.ParseScorePart(c);
                        break;
                }
            }
        }));
    },
    ParseScorePart: function (element){
        var id = element.GetAttribute("id");
        var track = new AlphaTab.Model.Track();
        this._trackById[id] = track;
        this._score.AddTrack(track);
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "part-name":
                        track.Name = AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild());
                        break;
                    case "part-abbreviation":
                        track.ShortName = AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild());
                        break;
                    case "midi-instrument":
                        this.ParseMidiInstrument(c, track);
                        break;
                }
            }
        }));
        if (track.Tuning == null || track.Tuning.length == 0){
            track.Tuning = AlphaTab.Model.Tuning.GetDefaultTuningFor(6).Tunings;
        }
    },
    ParseMidiInstrument: function (element, track){
        AlphaTab.Platform.Std.IterateChildren(element, $CreateAnonymousDelegate(this, function (c){
            if (c.get_NodeType() == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.get_LocalName()){
                    case "midi-channel":
                        track.PlaybackInfo.PrimaryChannel = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild()));
                        break;
                    case "midi-program":
                        track.PlaybackInfo.Program = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild()));
                        break;
                    case "midi-volume":
                        track.PlaybackInfo.Volume = AlphaTab.Platform.Std.ParseInt(AlphaTab.Platform.Std.GetNodeValue(c.get_FirstChild()));
                        break;
                }
            }
        }));
    }
};
AlphaTab.Importer.MusicXml2Importer.ParseTied = function (element, note){
    if (element.GetAttribute("type") == "start"){
        note.IsTieOrigin = true;
    }
    else {
        note.IsTieDestination = true;
    }
};
$Inherit(AlphaTab.Importer.MusicXml2Importer, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.NoCompatibleReaderFoundException = function (){
};
AlphaTab.Importer.ScoreLoader = function (){
};
AlphaTab.Importer.ScoreLoader.LoadScoreAsync = function (path, success, error){
    var loader = AlphaTab.Environment.FileLoaders["default"]();
    loader.LoadBinaryAsync(path, function (data){
        var score = null;
        try{
            score = AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data);
        }
        catch(e){
            error(e);
        }
        if (score != null){
            success(score);
        }
    }, error);
};
AlphaTab.Importer.ScoreLoader.LoadScore = function (path){
    var loader = AlphaTab.Environment.FileLoaders["default"]();
    var data = loader.LoadBinary(path);
    return AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data);
};
AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes = function (data){
    var importers = AlphaTab.Importer.ScoreImporter.BuildImporters();
    var score = null;
    var bb = AlphaTab.IO.ByteBuffer.FromBuffer(data);
    for (var $i18 = 0,$l18 = importers.length,importer = importers[$i18]; $i18 < $l18; $i18++, importer = importers[$i18]){
        bb.Reset();
        try{
            importer.Init(bb);
            score = importer.ReadScore();
            break;
        }
        catch(e){
            if (!(e.exception instanceof AlphaTab.Importer.UnsupportedFormatException)){
                throw $CreateException(e, new Error());
            }
        }
    }
    if (score != null){
        return score;
    }
    throw $CreateException(new AlphaTab.Importer.NoCompatibleReaderFoundException(), new Error());
};
AlphaTab.Importer.UnsupportedFormatException = function (){
};
AlphaTab.IO = AlphaTab.IO || {};
AlphaTab.IO.BitReader = function (source){
    this._currentByte = 0;
    this._position = 0;
    this._source = null;
    this._source = source;
    this._position = 8;
    // to ensure a byte is read on beginning
};
AlphaTab.IO.BitReader.prototype = {
    ReadByte: function (){
        return this.ReadBits(8);
    },
    ReadBytes: function (count){
        var bytes = new Uint8Array(count);
        for (var i = 0; i < count; i++){
            bytes[i] = this.ReadByte();
        }
        return bytes;
    },
    ReadBits: function (count){
        var bits = 0;
        var i = count - 1;
        while (i >= 0){
            bits |= (this.ReadBit() << i);
            i--;
        }
        return bits;
    },
    ReadBitsReversed: function (count){
        var bits = 0;
        for (var i = 0; i < count; i++){
            bits |= (this.ReadBit() << i);
        }
        return bits;
    },
    ReadBit: function (){
        // need a new byte? 
        if (this._position >= 8){
            this._currentByte = this._source.ReadByte();
            if (this._currentByte == -1)
                throw $CreateException(new AlphaTab.IO.EndOfReaderException(), new Error());
            this._position = 0;
        }
        // shift the desired byte to the least significant bit and  
        // get the value using masking
        var value = (this._currentByte >> (8 - this._position - 1)) & 1;
        this._position++;
        return value;
    },
    ReadAll: function (){
        var all = AlphaTab.IO.ByteBuffer.Empty();
        try{
            while (true){
                all.WriteByte(this.ReadByte());
            }
        }
        catch($$e4){
        }
        return all.ToArray();
    }
};
$StaticConstructor(function (){
    AlphaTab.IO.BitReader.ByteSize = 8;
});
AlphaTab.IO.FileLoadException = function (message){
};
AlphaTab.IO.EndOfReaderException = function (){
};
AlphaTab.IO.ByteBuffer = function (){
    this._buffer = null;
    this._position = 0;
    this._length = 0;
    this._capacity = 0;
};
AlphaTab.IO.ByteBuffer.prototype = {
    get_Length: function (){
        return this._length;
    },
    GetBuffer: function (){
        return this._buffer;
    },
    Reset: function (){
        this._position = 0;
    },
    Skip: function (offset){
        this._position += offset;
    },
    SetCapacity: function (value){
        if (value != this._capacity){
            if (value > 0){
                var newBuffer = new Uint8Array(value);
                if (this._length > 0)
                    newBuffer.set(this._buffer.subarray(0,0+this._length),0);
                this._buffer = newBuffer;
            }
            else {
                this._buffer = null;
            }
            this._capacity = value;
        }
    },
    ReadByte: function (){
        var n = this._length - this._position;
        if (n <= 0)
            return -1;
        return this._buffer[this._position++];
    },
    Read: function (buffer, offset, count){
        var n = this._length - this._position;
        if (n > count)
            n = count;
        if (n <= 0)
            return 0;
        if (n <= 8){
            var byteCount = n;
            while (--byteCount >= 0)
                buffer[offset + byteCount] = this._buffer[this._position + byteCount];
        }
        else
            buffer.set(this._buffer.subarray(this._position,this._position+n),offset);
        this._position += n;
        return n;
    },
    WriteByte: function (value){
        var buffer = new Uint8Array(1);
        buffer[0] = value;
        this.Write(buffer, 0, 1);
    },
    Write: function (buffer, offset, count){
        var i = this._position + count;
        if (i > this._length){
            if (i > this._capacity){
                this.EnsureCapacity(i);
            }
            this._length = i;
        }
        if ((count <= 8) && (buffer != this._buffer)){
            var byteCount = count;
            while (--byteCount >= 0)
                this._buffer[this._position + byteCount] = buffer[offset + byteCount];
        }
        else {
            this._buffer.set(buffer.subarray(offset,offset+Math.min(count, buffer.length - offset)),this._position);
        }
        this._position = i;
    },
    EnsureCapacity: function (value){
        if (value > this._capacity){
            var newCapacity = value;
            if (newCapacity < 256)
                newCapacity = 256;
            if (newCapacity < this._capacity * 2)
                newCapacity = this._capacity * 2;
            this.SetCapacity(newCapacity);
        }
    },
    ReadAll: function (){
        return this.ToArray();
    },
    ToArray: function (){
        var copy = new Uint8Array(this._length);
        copy.set(this._buffer.subarray(0,0+this._length),0);
        return copy;
    }
};
AlphaTab.IO.ByteBuffer.Empty = function (){
    return AlphaTab.IO.ByteBuffer.WithCapactiy(0);
};
AlphaTab.IO.ByteBuffer.WithCapactiy = function (capacity){
    var buffer = new AlphaTab.IO.ByteBuffer();
    buffer._buffer = new Uint8Array(capacity);
    buffer._capacity = capacity;
    return buffer;
};
AlphaTab.IO.ByteBuffer.FromBuffer = function (data){
    var buffer = new AlphaTab.IO.ByteBuffer();
    buffer._buffer = data;
    buffer._capacity = buffer._length = data.length;
    return buffer;
};
AlphaTab.Model.AccentuationType = {
    None: 0,
    Normal: 1,
    Heavy: 2
};
AlphaTab.Model.AccidentalType = {
    None: 0,
    Natural: 1,
    Sharp: 2,
    Flat: 3
};
AlphaTab.Model.Automation = function (){
    this.IsLinear = false;
    this.Type = AlphaTab.Model.AutomationType.Tempo;
    this.Value = 0;
    this.RatioPosition = 0;
    this.Text = null;
};
AlphaTab.Model.Automation.prototype = {
    Clone: function (){
        var a = new AlphaTab.Model.Automation();
        AlphaTab.Model.Automation.CopyTo(this, a);
        return a;
    }
};
AlphaTab.Model.Automation.BuildTempoAutomation = function (isLinear, ratioPosition, value, reference){
    if (reference < 1 || reference > 5)
        reference = 2;
    var references = new Float32Array([1, 0.5, 1, 1.5, 2, 3]);
    var automation = new AlphaTab.Model.Automation();
    automation.Type = AlphaTab.Model.AutomationType.Tempo;
    automation.IsLinear = isLinear;
    automation.RatioPosition = ratioPosition;
    automation.Value = value * references[reference];
    return automation;
};
AlphaTab.Model.Automation.CopyTo = function (src, dst){
    dst.IsLinear = src.IsLinear;
    dst.RatioPosition = src.RatioPosition;
    dst.Text = src.Text;
    dst.Type = src.Type;
    dst.Value = src.Value;
};
AlphaTab.Model.AutomationType = {
    Tempo: 0,
    Volume: 1,
    Instrument: 2,
    Balance: 3
};
AlphaTab.Model.Bar = function (){
    this.Index = 0;
    this.NextBar = null;
    this.PreviousBar = null;
    this.Clef = AlphaTab.Model.Clef.Neutral;
    this.Track = null;
    this.Voices = null;
    this.MinDuration = null;
    this.MaxDuration = null;
    this.Voices = [];
    this.Clef = AlphaTab.Model.Clef.G2;
};
AlphaTab.Model.Bar.prototype = {
    AddVoice: function (voice){
        voice.Bar = this;
        voice.Index = this.Voices.length;
        this.Voices.push(voice);
    },
    get_MasterBar: function (){
        return this.Track.Score.MasterBars[this.Index];
    },
    get_IsEmpty: function (){
        for (var i = 0,j = this.Voices.length; i < j; i++){
            if (!this.Voices[i].get_IsEmpty()){
                return false;
            }
        }
        return true;
    },
    Finish: function (){
        for (var i = 0,j = this.Voices.length; i < j; i++){
            var voice = this.Voices[i];
            voice.Finish();
            if (voice.MinDuration == null || this.MinDuration == null || this.MinDuration > voice.MinDuration){
                this.MinDuration = voice.MinDuration;
            }
            if (voice.MaxDuration == null || this.MaxDuration == null || this.MaxDuration > voice.MaxDuration){
                this.MinDuration = voice.MaxDuration;
            }
        }
    }
};
AlphaTab.Model.Bar.CopyTo = function (src, dst){
    dst.Index = src.Index;
    dst.Clef = src.Clef;
};
AlphaTab.Model.Beat = function (){
    this._minNote = null;
    this._maxNote = null;
    this._maxStringNote = null;
    this._minStringNote = null;
    this.PreviousBeat = null;
    this.NextBeat = null;
    this.Index = 0;
    this.Voice = null;
    this.Notes = null;
    this.IsEmpty = false;
    this.Duration = AlphaTab.Model.Duration.Whole;
    this.Automations = null;
    this.Dots = 0;
    this.FadeIn = false;
    this.Lyrics = null;
    this.Pop = false;
    this.HasRasgueado = false;
    this.Slap = false;
    this.Tap = false;
    this.Text = null;
    this.BrushType = AlphaTab.Model.BrushType.None;
    this.BrushDuration = 0;
    this.TupletDenominator = 0;
    this.TupletNumerator = 0;
    this.WhammyBarPoints = null;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.ChordId = null;
    this.GraceType = AlphaTab.Model.GraceType.None;
    this.PickStroke = AlphaTab.Model.PickStrokeType.None;
    this.TremoloSpeed = null;
    this.Crescendo = AlphaTab.Model.CrescendoType.None;
    this.Start = 0;
    this.Dynamic = AlphaTab.Model.DynamicValue.PPP;
    this.WhammyBarPoints = [];
    this.Notes = [];
    this.BrushType = AlphaTab.Model.BrushType.None;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.GraceType = AlphaTab.Model.GraceType.None;
    this.PickStroke = AlphaTab.Model.PickStrokeType.None;
    this.Duration = AlphaTab.Model.Duration.Quarter;
    this.TremoloSpeed = null;
    this.Automations = [];
    this.Dots = 0;
    this.Start = 0;
    this.TupletDenominator = -1;
    this.TupletNumerator = -1;
    this.Dynamic = AlphaTab.Model.DynamicValue.F;
    this.Crescendo = AlphaTab.Model.CrescendoType.None;
};
AlphaTab.Model.Beat.prototype = {
    get_MinNote: function (){
        if (this._minNote == null){
            this.RefreshNotes();
        }
        return this._minNote;
    },
    get_MaxNote: function (){
        if (this._maxNote == null){
            this.RefreshNotes();
        }
        return this._maxNote;
    },
    get_MaxStringNote: function (){
        if (this._maxStringNote == null){
            this.RefreshNotes();
        }
        return this._maxStringNote;
    },
    get_MinStringNote: function (){
        if (this._minStringNote == null){
            this.RefreshNotes();
        }
        return this._minStringNote;
    },
    get_IsRest: function (){
        return this.Notes.length == 0;
    },
    get_HasTuplet: function (){
        return !(this.TupletDenominator == -1 && this.TupletNumerator == -1) && !(this.TupletDenominator == 1 && this.TupletNumerator == 1);
    },
    get_HasWhammyBar: function (){
        return this.WhammyBarPoints.length > 0;
    },
    get_HasChord: function (){
        return this.ChordId != null;
    },
    get_Chord: function (){
        return this.Voice.Bar.Track.Chords[this.ChordId];
    },
    get_IsTremolo: function (){
        return this.TremoloSpeed != null;
    },
    get_AbsoluteStart: function (){
        return this.Voice.Bar.get_MasterBar().Start + this.Start;
    },
    Clone: function (){
        var beat = new AlphaTab.Model.Beat();
        for (var i = 0,j = this.WhammyBarPoints.length; i < j; i++){
            beat.WhammyBarPoints.push(this.WhammyBarPoints[i].Clone());
        }
        for (var i = 0,j = this.Notes.length; i < j; i++){
            beat.AddNote(this.Notes[i].Clone());
        }
        AlphaTab.Model.Beat.CopyTo(this, beat);
        for (var i = 0,j = this.Automations.length; i < j; i++){
            beat.Automations.push(this.Automations[i].Clone());
        }
        return beat;
    },
    CalculateDuration: function (){
        var ticks = AlphaTab.Audio.MidiUtils.ToTicks(this.Duration);
        if (this.Dots == 2){
            ticks = AlphaTab.Audio.MidiUtils.ApplyDot(ticks, true);
        }
        else if (this.Dots == 1){
            ticks = AlphaTab.Audio.MidiUtils.ApplyDot(ticks, false);
        }
        if (this.TupletDenominator > 0 && this.TupletNumerator >= 0){
            ticks = AlphaTab.Audio.MidiUtils.ApplyTuplet(ticks, this.TupletNumerator, this.TupletDenominator);
        }
        return ticks;
    },
    AddNote: function (note){
        note.Beat = this;
        note.Index = this.Notes.length;
        this.Notes.push(note);
    },
    RefreshNotes: function (){
        for (var i = 0,j = this.Notes.length; i < j; i++){
            var note = this.Notes[i];
            if (this._minNote == null || note.get_RealValue() < this._minNote.get_RealValue()){
                this._minNote = note;
            }
            if (this._maxNote == null || note.get_RealValue() > this._maxNote.get_RealValue()){
                this._maxNote = note;
            }
            if (this._minStringNote == null || note.String < this._minStringNote.String){
                this._minStringNote = note;
            }
            if (this._maxStringNote == null || note.String > this._maxStringNote.String){
                this._maxStringNote = note;
            }
        }
    },
    GetAutomation: function (type){
        for (var i = 0,j = this.Automations.length; i < j; i++){
            var automation = this.Automations[i];
            if (automation.Type == type){
                return automation;
            }
        }
        return null;
    },
    GetNoteOnString: function (string){
        for (var i = 0,j = this.Notes.length; i < j; i++){
            var note = this.Notes[i];
            if (note.String == string){
                return note;
            }
        }
        return null;
    },
    Finish: function (){
        // start
        if (this.Index == 0){
            this.Start = 0;
        }
        else {
            this.Start = this.PreviousBeat.Start + this.PreviousBeat.CalculateDuration();
        }
        for (var i = 0,j = this.Notes.length; i < j; i++){
            this.Notes[i].Finish();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Beat.WhammyBarMaxPosition = 60;
    AlphaTab.Model.Beat.WhammyBarMaxValue = 24;
});
AlphaTab.Model.Beat.CopyTo = function (src, dst){
    dst.Index = src.Index;
    dst.IsEmpty = src.IsEmpty;
    dst.Duration = src.Duration;
    dst.Dots = src.Dots;
    dst.FadeIn = src.FadeIn;
    dst.Lyrics = src.Lyrics == null ? null : src.Lyrics.slice();
    dst.Pop = src.Pop;
    dst.HasRasgueado = src.HasRasgueado;
    dst.Slap = src.Slap;
    dst.Tap = src.Tap;
    dst.Text = src.Text;
    dst.BrushType = src.BrushType;
    dst.BrushDuration = src.BrushDuration;
    dst.TupletDenominator = src.TupletDenominator;
    dst.TupletNumerator = src.TupletNumerator;
    dst.Vibrato = src.Vibrato;
    dst.ChordId = src.ChordId;
    dst.GraceType = src.GraceType;
    dst.PickStroke = src.PickStroke;
    dst.TremoloSpeed = src.TremoloSpeed;
    dst.Crescendo = src.Crescendo;
    dst.Start = src.Start;
    dst.Dynamic = src.Dynamic;
};
AlphaTab.Model.BendPoint = function (offset, value){
    this.Offset = 0;
    this.Value = 0;
    this.Offset = offset;
    this.Value = value;
};
AlphaTab.Model.BendPoint.prototype = {
    Clone: function (){
        var point = new AlphaTab.Model.BendPoint(0, 0);
        AlphaTab.Model.BendPoint.CopyTo(this, point);
        return point;
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.BendPoint.MaxPosition = 60;
    AlphaTab.Model.BendPoint.MaxValue = 12;
});
AlphaTab.Model.BendPoint.CopyTo = function (src, dst){
    dst.Offset = src.Offset;
    dst.Value = src.Value;
};
AlphaTab.Model.BrushType = {
    None: 0,
    BrushUp: 1,
    BrushDown: 2,
    ArpeggioUp: 3,
    ArpeggioDown: 4
};
AlphaTab.Model.Chord = function (){
    this.Name = null;
    this.FirstFret = 0;
    this.Strings = null;
    this.Strings = [];
};
AlphaTab.Model.Chord.CopyTo = function (src, dst){
    dst.FirstFret = src.FirstFret;
    dst.Name = src.Name;
    dst.Strings = src.Strings.slice();
};
AlphaTab.Model.Clef = {
    Neutral: 0,
    C3: 1,
    C4: 2,
    F4: 3,
    G2: 4
};
AlphaTab.Model.CrescendoType = {
    None: 0,
    Crescendo: 1,
    Decrescendo: 2
};
AlphaTab.Model.Duration = {
    Whole: 1,
    Half: 2,
    Quarter: 4,
    Eighth: 8,
    Sixteenth: 16,
    ThirtySecond: 32,
    SixtyFourth: 64
};
AlphaTab.Model.DynamicValue = {
    PPP: 0,
    PP: 1,
    P: 2,
    MP: 3,
    MF: 4,
    F: 5,
    FF: 6,
    FFF: 7
};
AlphaTab.Model.Fingers = {
    Unknown: -2,
    NoOrDead: -1,
    Thumb: 0,
    IndexFinger: 1,
    MiddleFinger: 2,
    AnnularFinger: 3,
    LittleFinger: 4
};
AlphaTab.Model.GraceType = {
    None: 0,
    OnBeat: 1,
    BeforeBeat: 2
};
AlphaTab.Model.HarmonicType = {
    None: 0,
    Natural: 1,
    Artificial: 2,
    Pinch: 3,
    Tap: 4,
    Semi: 5,
    Feedback: 6
};
AlphaTab.Model.KeySignatureType = {
    Major: 0,
    Minor: 1
};
AlphaTab.Model.MasterBar = function (){
    this.AlternateEndings = 0;
    this.NextMasterBar = null;
    this.PreviousMasterBar = null;
    this.Index = 0;
    this.KeySignature = 0;
    this.IsDoubleBar = false;
    this.IsRepeatStart = false;
    this.RepeatCount = 0;
    this.RepeatGroup = null;
    this.TimeSignatureNumerator = 0;
    this.TimeSignatureDenominator = 0;
    this.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this.Section = null;
    this.TempoAutomation = null;
    this.VolumeAutomation = null;
    this.Score = null;
    this.Start = 0;
    this.TimeSignatureDenominator = 4;
    this.TimeSignatureNumerator = 4;
    this.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
};
AlphaTab.Model.MasterBar.prototype = {
    get_IsRepeatEnd: function (){
        return this.RepeatCount > 0;
    },
    get_IsSectionStart: function (){
        return this.Section != null;
    },
    CalculateDuration: function (){
        return this.TimeSignatureNumerator * AlphaTab.Audio.MidiUtils.ValueToTicks(this.TimeSignatureDenominator);
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.MasterBar.MaxAlternateEndings = 8;
});
AlphaTab.Model.MasterBar.CopyTo = function (src, dst){
    dst.AlternateEndings = src.AlternateEndings;
    dst.Index = src.Index;
    dst.KeySignature = src.KeySignature;
    dst.IsDoubleBar = src.IsDoubleBar;
    dst.IsRepeatStart = src.IsRepeatStart;
    dst.RepeatCount = src.RepeatCount;
    dst.TimeSignatureNumerator = src.TimeSignatureNumerator;
    dst.TimeSignatureDenominator = src.TimeSignatureDenominator;
    dst.TripletFeel = src.TripletFeel;
    dst.Start = src.Start;
};
AlphaTab.Model.ModelUtils = function (){
};
AlphaTab.Model.ModelUtils.GetIndex = function (duration){
    var index = 0;
    var value = duration;
    while ((value = (value >> 1)) > 0){
        index++;
    }
    return index;
};
AlphaTab.Model.ModelUtils.KeySignatureIsFlat = function (ks){
    return ks < 0;
};
AlphaTab.Model.ModelUtils.KeySignatureIsNatural = function (ks){
    return ks == 0;
};
AlphaTab.Model.ModelUtils.KeySignatureIsSharp = function (ks){
    return ks > 0;
};
AlphaTab.Model.NoteAccidentalMode = {
    Default: 0,
    SwapAccidentals: 1,
    ForceNatural: 2,
    ForceSharp: 3,
    ForceFlat: 4
};
AlphaTab.Model.Note = function (){
    this.Index = 0;
    this.Accentuated = AlphaTab.Model.AccentuationType.None;
    this.BendPoints = null;
    this.MaxBendPoint = null;
    this.Fret = 0;
    this.String = 0;
    this.Octave = 0;
    this.Tone = 0;
    this.Element = 0;
    this.Variation = 0;
    this.IsHammerPullOrigin = false;
    this.HammerPullOrigin = null;
    this.HammerPullDestination = null;
    this.HarmonicValue = 0;
    this.HarmonicType = AlphaTab.Model.HarmonicType.None;
    this.IsGhost = false;
    this.IsLetRing = false;
    this.IsPalmMute = false;
    this.IsDead = false;
    this.IsStaccato = false;
    this.SlideType = AlphaTab.Model.SlideType.None;
    this.SlideTarget = null;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.TieOrigin = null;
    this.TieDestination = null;
    this.IsTieDestination = false;
    this.IsTieOrigin = false;
    this.LeftHandFinger = AlphaTab.Model.Fingers.Thumb;
    this.RightHandFinger = AlphaTab.Model.Fingers.Thumb;
    this.IsFingering = false;
    this.TrillValue = 0;
    this.TrillSpeed = AlphaTab.Model.Duration.Whole;
    this.DurationPercent = 0;
    this.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.Default;
    this.Beat = null;
    this.Dynamic = AlphaTab.Model.DynamicValue.PPP;
    this.BendPoints = [];
    this.Dynamic = AlphaTab.Model.DynamicValue.F;
    this.Accentuated = AlphaTab.Model.AccentuationType.None;
    this.Fret = -2147483648;
    this.HarmonicType = AlphaTab.Model.HarmonicType.None;
    this.SlideType = AlphaTab.Model.SlideType.None;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.LeftHandFinger = AlphaTab.Model.Fingers.Unknown;
    this.RightHandFinger = AlphaTab.Model.Fingers.Unknown;
    this.TrillValue = -1;
    this.TrillSpeed = AlphaTab.Model.Duration.ThirtySecond;
    this.DurationPercent = 1;
    this.Octave = -1;
    this.Tone = -1;
    this.Fret = -1;
    this.String = -1;
    this.Element = -1;
    this.Variation = -1;
};
AlphaTab.Model.Note.prototype = {
    get_HasBend: function (){
        return this.BendPoints.length > 0;
    },
    get_IsStringed: function (){
        return this.Fret >= 0 && this.String >= 0;
    },
    get_IsPiano: function (){
        return this.Octave >= 0 && this.Tone >= 0;
    },
    get_IsPercussion: function (){
        return this.Element >= 0 && this.Variation >= 0;
    },
    get_IsHarmonic: function (){
        return this.HarmonicType != AlphaTab.Model.HarmonicType.None;
    },
    get_TrillFret: function (){
        return this.TrillValue - this.get_StringTuning();
    },
    get_IsTrill: function (){
        return this.TrillValue >= 0;
    },
    get_StringTuning: function (){
        return this.Beat.Voice.Bar.Track.Capo + AlphaTab.Model.Note.GetStringTuning(this.Beat.Voice.Bar.Track, this.String);
    },
    get_RealValue: function (){
        if (this.get_IsPercussion()){
            return AlphaTab.Rendering.Utils.PercussionMapper.MidiFromElementVariation(this);
        }
        if (this.get_IsStringed()){
            return this.Fret + this.get_StringTuning();
        }
        if (this.get_IsPiano()){
            return this.Octave * 12 + this.Tone;
        }
        return 0;
    },
    Clone: function (){
        var n = new AlphaTab.Model.Note();
        AlphaTab.Model.Note.CopyTo(this, n);
        for (var i = 0,j = this.BendPoints.length; i < j; i++){
            n.AddBendPoint(this.BendPoints[i].Clone());
        }
        return n;
    },
    AddBendPoint: function (point){
        this.BendPoints.push(point);
        if (this.MaxBendPoint == null || point.Value > this.MaxBendPoint.Value){
            this.MaxBendPoint = point;
        }
    },
    Finish: function (){
        var nextNoteOnLine = new AlphaTab.Util.Lazy($CreateAnonymousDelegate(this, function (){
            return AlphaTab.Model.Note.NextNoteOnSameLine(this);
        }));
        var prevNoteOnLine = new AlphaTab.Util.Lazy($CreateAnonymousDelegate(this, function (){
            return AlphaTab.Model.Note.PreviousNoteOnSameLine(this);
        }));
        // connect ties
        if (this.IsTieDestination){
            if (prevNoteOnLine.get_Value() == null){
                this.IsTieDestination = false;
            }
            else {
                this.TieOrigin = prevNoteOnLine.get_Value();
                this.TieOrigin.IsTieOrigin = true;
                this.TieOrigin.TieDestination = this;
                this.Fret = this.TieOrigin.Fret;
            }
        }
        // set hammeron/pulloffs
        if (this.IsHammerPullOrigin){
            if (nextNoteOnLine.get_Value() == null){
                this.IsHammerPullOrigin = false;
            }
            else {
                this.HammerPullDestination = nextNoteOnLine.get_Value();
                this.HammerPullDestination.HammerPullOrigin = this;
            }
        }
        // set slides
        if (this.SlideType != AlphaTab.Model.SlideType.None){
            this.SlideTarget = nextNoteOnLine.get_Value();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Note.MaxOffsetForSameLineSearch = 3;
});
AlphaTab.Model.Note.GetStringTuning = function (track, noteString){
    if (track.Tuning.length > 0)
        return track.Tuning[track.Tuning.length - (noteString - 1) - 1];
    return 0;
};
AlphaTab.Model.Note.CopyTo = function (src, dst){
    dst.Accentuated = src.Accentuated;
    dst.Fret = src.Fret;
    dst.String = src.String;
    dst.IsHammerPullOrigin = src.IsHammerPullOrigin;
    dst.HarmonicValue = src.HarmonicValue;
    dst.HarmonicType = src.HarmonicType;
    dst.IsGhost = src.IsGhost;
    dst.IsLetRing = src.IsLetRing;
    dst.IsPalmMute = src.IsPalmMute;
    dst.IsDead = src.IsDead;
    dst.IsStaccato = src.IsStaccato;
    dst.SlideType = src.SlideType;
    dst.Vibrato = src.Vibrato;
    dst.IsTieDestination = src.IsTieDestination;
    dst.LeftHandFinger = src.LeftHandFinger;
    dst.RightHandFinger = src.RightHandFinger;
    dst.IsFingering = src.IsFingering;
    dst.TrillValue = src.TrillValue;
    dst.TrillSpeed = src.TrillSpeed;
    dst.DurationPercent = src.DurationPercent;
    dst.AccidentalMode = src.AccidentalMode;
    dst.Dynamic = src.Dynamic;
    dst.Octave = src.Octave;
    dst.Tone = src.Tone;
    dst.Element = src.Element;
    dst.Variation = src.Variation;
};
AlphaTab.Model.Note.NextNoteOnSameLine = function (note){
    var nextBeat = note.Beat.NextBeat;
    // keep searching in same bar
    while (nextBeat != null && nextBeat.Voice.Bar.Index <= note.Beat.Voice.Bar.Index + 3){
        var noteOnString = nextBeat.GetNoteOnString(note.String);
        if (noteOnString != null){
            return noteOnString;
        }
        else {
            nextBeat = nextBeat.NextBeat;
        }
    }
    return null;
};
AlphaTab.Model.Note.PreviousNoteOnSameLine = function (note){
    var previousBeat = note.Beat.PreviousBeat;
    // keep searching in same bar
    while (previousBeat != null && previousBeat.Voice.Bar.Index >= note.Beat.Voice.Bar.Index - 3){
        var noteOnString = previousBeat.GetNoteOnString(note.String);
        if (noteOnString != null){
            return noteOnString;
        }
        else {
            previousBeat = previousBeat.PreviousBeat;
        }
    }
    return null;
};
AlphaTab.Model.PickStrokeType = {
    None: 0,
    Up: 1,
    Down: 2
};
AlphaTab.Model.PlaybackInformation = function (){
    this.Volume = 0;
    this.Balance = 0;
    this.Port = 0;
    this.Program = 0;
    this.PrimaryChannel = 0;
    this.SecondaryChannel = 0;
    this.IsMute = false;
    this.IsSolo = false;
    this.Volume = 15;
    this.Balance = 8;
    this.Port = 1;
};
AlphaTab.Model.PlaybackInformation.CopyTo = function (src, dst){
    dst.Volume = src.Volume;
    dst.Balance = src.Balance;
    dst.Port = src.Port;
    dst.Program = src.Program;
    dst.PrimaryChannel = src.PrimaryChannel;
    dst.SecondaryChannel = src.SecondaryChannel;
    dst.IsMute = src.IsMute;
    dst.IsSolo = src.IsSolo;
};
AlphaTab.Model.RepeatGroup = function (){
    this.MasterBars = null;
    this.Openings = null;
    this.Closings = null;
    this.IsClosed = false;
    this.MasterBars = [];
    this.Openings = [];
    this.Closings = [];
    this.IsClosed = false;
};
AlphaTab.Model.RepeatGroup.prototype = {
    AddMasterBar: function (masterBar){
        if (this.Openings.length == 0){
            this.Openings.push(masterBar);
        }
        this.MasterBars.push(masterBar);
        masterBar.RepeatGroup = this;
        if (masterBar.get_IsRepeatEnd()){
            this.Closings.push(masterBar);
            this.IsClosed = true;
        }
        else if (this.IsClosed){
            this.IsClosed = false;
            this.Openings.push(masterBar);
        }
    }
};
AlphaTab.Model.Score = function (){
    this._currentRepeatGroup = null;
    this.Album = null;
    this.Artist = null;
    this.Copyright = null;
    this.Instructions = null;
    this.Music = null;
    this.Notices = null;
    this.SubTitle = null;
    this.Title = null;
    this.Words = null;
    this.Tab = null;
    this.Tempo = 0;
    this.TempoLabel = null;
    this.MasterBars = null;
    this.Tracks = null;
    this.MasterBars = [];
    this.Tracks = [];
    this._currentRepeatGroup = new AlphaTab.Model.RepeatGroup();
};
AlphaTab.Model.Score.prototype = {
    AddMasterBar: function (bar){
        bar.Score = this;
        bar.Index = this.MasterBars.length;
        if (this.MasterBars.length != 0){
            bar.PreviousMasterBar = this.MasterBars[this.MasterBars.length - 1];
            bar.PreviousMasterBar.NextMasterBar = bar;
            bar.Start = bar.PreviousMasterBar.Start + bar.PreviousMasterBar.CalculateDuration();
        }
        // if the group is closed only the next upcoming header can
        // reopen the group in case of a repeat alternative, so we 
        // remove the current group 
        if (bar.IsRepeatStart || (this._currentRepeatGroup.IsClosed && bar.AlternateEndings <= 0)){
            this._currentRepeatGroup = new AlphaTab.Model.RepeatGroup();
        }
        this._currentRepeatGroup.AddMasterBar(bar);
        this.MasterBars.push(bar);
    },
    AddTrack: function (track){
        track.Score = this;
        track.Index = this.Tracks.length;
        this.Tracks.push(track);
    },
    Finish: function (){
        for (var i = 0,j = this.Tracks.length; i < j; i++){
            this.Tracks[i].Finish();
        }
    }
};
AlphaTab.Model.Score.CopyTo = function (src, dst){
    dst.Album = src.Album;
    dst.Artist = src.Artist;
    dst.Copyright = src.Copyright;
    dst.Instructions = src.Instructions;
    dst.Music = src.Music;
    dst.Notices = src.Notices;
    dst.SubTitle = src.SubTitle;
    dst.Title = src.Title;
    dst.Words = src.Words;
    dst.Tab = src.Tab;
    dst.Tempo = src.Tempo;
    dst.TempoLabel = src.TempoLabel;
};
AlphaTab.Model.Section = function (){
    this.Marker = null;
    this.Text = null;
};
AlphaTab.Model.Section.CopyTo = function (src, dst){
    dst.Marker = src.Marker;
    dst.Text = src.Text;
};
AlphaTab.Model.SlideType = {
    None: 0,
    Shift: 1,
    Legato: 2,
    IntoFromBelow: 3,
    IntoFromAbove: 4,
    OutUp: 5,
    OutDown: 6
};
AlphaTab.Model.Track = function (){
    this.Capo = 0;
    this.Index = 0;
    this.Name = null;
    this.ShortName = null;
    this.Tuning = null;
    this.TuningName = null;
    this.Color = null;
    this.PlaybackInfo = null;
    this.IsPercussion = false;
    this.Score = null;
    this.Bars = null;
    this.Chords = null;
    this.Name = "";
    this.ShortName = "";
    this.Tuning = new Int32Array(0);
    this.Bars = [];
    this.Chords = {};
    this.PlaybackInfo = new AlphaTab.Model.PlaybackInformation();
    this.Color = new AlphaTab.Platform.Model.Color(200, 0, 0, 255);
};
AlphaTab.Model.Track.prototype = {
    AddBar: function (bar){
        var bars = this.Bars;
        bar.Track = this;
        bar.Index = this.Bars.length;
        if (bars.length > 0){
            bar.PreviousBar = bars[bars.length - 1];
            bar.PreviousBar.NextBar = bar;
        }
        bars.push(bar);
    },
    Finish: function (){
        if (((this.ShortName==null)||(this.ShortName.length==0))){
            this.ShortName = this.Name;
            if (this.ShortName.length > 10)
                this.ShortName = this.ShortName.substr(0, 10);
        }
        for (var i = 0,j = this.Bars.length; i < j; i++){
            this.Bars[i].Finish();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Track.ShortNameMaxLength = 10;
});
AlphaTab.Model.Track.CopyTo = function (src, dst){
    dst.Capo = src.Capo;
    dst.Index = src.Index;
    dst.ShortName = src.ShortName;
    dst.Tuning = new Int32Array(src.Tuning);
    dst.Color.Raw = src.Color.Raw;
    dst.IsPercussion = src.IsPercussion;
};
AlphaTab.Model.TripletFeel = {
    NoTripletFeel: 0,
    Triplet16th: 1,
    Triplet8th: 2,
    Dotted16th: 3,
    Dotted8th: 4,
    Scottish16th: 5,
    Scottish8th: 6
};
AlphaTab.Model.Tuning = function (name, tuning, isStandard){
    this.IsStandard = false;
    this.Name = null;
    this.Tunings = null;
    this.IsStandard = isStandard;
    this.Name = name;
    this.Tunings = tuning;
};
$StaticConstructor(function (){
    AlphaTab.Model.Tuning._sevenStrings = null;
    AlphaTab.Model.Tuning._sixStrings = null;
    AlphaTab.Model.Tuning._fiveStrings = null;
    AlphaTab.Model.Tuning._fourStrings = null;
    AlphaTab.Model.Tuning._defaultTunings = null;
});
AlphaTab.Model.Tuning.GetTextForTuning = function (tuning, includeOctave){
    var octave = (tuning / 12) | 0;
    var note = tuning % 12;
    var notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    var result = notes[note];
    if (includeOctave){
        result += octave;
    }
    return result;
};
AlphaTab.Model.Tuning.GetDefaultTuningFor = function (stringCount){
    if (AlphaTab.Model.Tuning._sevenStrings == null){
        AlphaTab.Model.Tuning.Initialize();
    }
    if (AlphaTab.Model.Tuning._defaultTunings.hasOwnProperty(stringCount))
        return AlphaTab.Model.Tuning._defaultTunings[stringCount];
    return null;
};
AlphaTab.Model.Tuning.GetPresetsFor = function (stringCount){
    if (AlphaTab.Model.Tuning._sevenStrings == null){
        AlphaTab.Model.Tuning.Initialize();
    }
    switch (stringCount){
        case 7:
            return AlphaTab.Model.Tuning._sevenStrings;
        case 6:
            return AlphaTab.Model.Tuning._sixStrings;
        case 5:
            return AlphaTab.Model.Tuning._fiveStrings;
        case 4:
            return AlphaTab.Model.Tuning._fourStrings;
    }
    return [];
};
AlphaTab.Model.Tuning.Initialize = function (){
    AlphaTab.Model.Tuning._sevenStrings = [];
    AlphaTab.Model.Tuning._sixStrings = [];
    AlphaTab.Model.Tuning._fiveStrings = [];
    AlphaTab.Model.Tuning._fourStrings = [];
    AlphaTab.Model.Tuning._defaultTunings = {};
    AlphaTab.Model.Tuning._defaultTunings[7] = new AlphaTab.Model.Tuning("Guitar 7 strings", new Int32Array([64, 59, 55, 50, 45, 40, 35]), true);
    AlphaTab.Model.Tuning._sevenStrings.push(AlphaTab.Model.Tuning._defaultTunings[7]);
    AlphaTab.Model.Tuning._defaultTunings[6] = new AlphaTab.Model.Tuning("Guitar Standard Tuning", new Int32Array([64, 59, 55, 50, 45, 40]), true);
    AlphaTab.Model.Tuning._sixStrings.push(AlphaTab.Model.Tuning._defaultTunings[6]);
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Tune down � step", new Int32Array([63, 58, 54, 49, 44, 39]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Tune down 1 step", new Int32Array([62, 57, 53, 48, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Tune down 2 step", new Int32Array([60, 55, 51, 46, 41, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped D Tuning", new Int32Array([64, 59, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped D Tuning variant", new Int32Array([64, 57, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Double Dropped D Tuning", new Int32Array([62, 59, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped E Tuning", new Int32Array([66, 61, 57, 52, 47, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Dropped C Tuning", new Int32Array([62, 57, 53, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open C Tuning", new Int32Array([64, 60, 55, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Cm Tuning", new Int32Array([63, 60, 55, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open C6 Tuning", new Int32Array([64, 57, 55, 48, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Cmaj7 Tuning", new Int32Array([64, 59, 55, 52, 43, 36]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open D Tuning", new Int32Array([62, 57, 54, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Dm Tuning", new Int32Array([62, 57, 53, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open D5 Tuning", new Int32Array([62, 57, 50, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open D6 Tuning", new Int32Array([62, 59, 54, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Dsus4 Tuning", new Int32Array([62, 57, 55, 50, 45, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open E Tuning", new Int32Array([64, 59, 56, 52, 47, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Em Tuning", new Int32Array([64, 59, 55, 52, 47, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Esus11 Tuning", new Int32Array([64, 59, 55, 52, 45, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open F Tuning", new Int32Array([65, 60, 53, 48, 45, 41]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open G Tuning", new Int32Array([62, 59, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Gm Tuning", new Int32Array([62, 58, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open G6 Tuning", new Int32Array([64, 59, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Gsus4 Tuning", new Int32Array([62, 60, 55, 50, 43, 38]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open A Tuning", new Int32Array([64, 61, 57, 52, 45, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Open Am Tuning", new Int32Array([64, 60, 57, 52, 45, 40]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Guitar Nashville Tuning", new Int32Array([64, 59, 67, 62, 57, 52]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Bass 6 Strings Tuning", new Int32Array([48, 43, 38, 33, 28, 23]), false));
    AlphaTab.Model.Tuning._sixStrings.push(new AlphaTab.Model.Tuning("Lute or Vihuela Tuning", new Int32Array([64, 59, 54, 50, 45, 40]), false));
    AlphaTab.Model.Tuning._defaultTunings[5] = new AlphaTab.Model.Tuning("Bass 5 Strings Tuning", new Int32Array([43, 38, 33, 28, 23]), true);
    AlphaTab.Model.Tuning._fiveStrings.push(AlphaTab.Model.Tuning._defaultTunings[5]);
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo Dropped C Tuning", new Int32Array([62, 59, 55, 48, 67]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo Open D Tuning", new Int32Array([62, 57, 54, 50, 69]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo Open G Tuning", new Int32Array([62, 59, 55, 50, 67]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo G Minor Tuning", new Int32Array([62, 58, 55, 50, 67]), false));
    AlphaTab.Model.Tuning._fiveStrings.push(new AlphaTab.Model.Tuning("Banjo G Modal Tuning", new Int32Array([62, 57, 55, 50, 67]), false));
    AlphaTab.Model.Tuning._defaultTunings[4] = new AlphaTab.Model.Tuning("Bass Standard Tuning", new Int32Array([43, 38, 33, 28]), true);
    AlphaTab.Model.Tuning._fourStrings.push(AlphaTab.Model.Tuning._defaultTunings[4]);
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Tune down � step", new Int32Array([42, 37, 32, 27]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Tune down 1 step", new Int32Array([41, 36, 31, 26]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Tune down 2 step", new Int32Array([39, 34, 29, 24]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Bass Dropped D Tuning", new Int32Array([43, 38, 33, 26]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Ukulele C Tuning", new Int32Array([45, 40, 36, 43]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Ukulele G Tuning", new Int32Array([52, 47, 43, 38]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Mandolin Standard Tuning", new Int32Array([64, 57, 50, 43]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Mandolin or Violin Tuning", new Int32Array([76, 69, 62, 55]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Viola Tuning", new Int32Array([69, 62, 55, 48]), false));
    AlphaTab.Model.Tuning._fourStrings.push(new AlphaTab.Model.Tuning("Cello Tuning", new Int32Array([57, 50, 43, 36]), false));
};
AlphaTab.Model.Tuning.FindTuning = function (strings){
    var tunings = AlphaTab.Model.Tuning.GetPresetsFor(strings.length);
    for (var t = 0,tc = tunings.length; t < tc; t++){
        var tuning = tunings[t];
        var equals = true;
        for (var i = 0,j = strings.length; i < j; i++){
            if (strings[i] != tuning.Tunings[i]){
                equals = false;
                break;
            }
        }
        if (equals){
            return tuning;
        }
    }
    return null;
};
AlphaTab.Model.VibratoType = {
    None: 0,
    Slight: 1,
    Wide: 2
};
AlphaTab.Model.Voice = function (){
    this.Index = 0;
    this.Bar = null;
    this.Beats = null;
    this.MinDuration = null;
    this.MaxDuration = null;
    this.Beats = [];
};
AlphaTab.Model.Voice.prototype = {
    get_IsEmpty: function (){
        return this.Beats.length == 0;
    },
    AddBeat: function (beat){
        // chaining
        beat.Voice = this;
        beat.Index = this.Beats.length;
        this.Beats.push(beat);
    },
    Chain: function (beat){
        if (this.Bar == null)
            return;
        if (this.Bar.Index == 0 && beat.Index == 0){
            // very first beat
            beat.PreviousBeat = null;
        }
        else if (beat.Index == 0){
            // first beat of bar
            var previousVoice = this.Bar.PreviousBar.Voices[this.Index];
            beat.PreviousBeat = previousVoice.Beats[previousVoice.Beats.length - 1];
            beat.PreviousBeat.NextBeat = beat;
        }
        else {
            // other beats of bar
            beat.PreviousBeat = this.Beats[beat.Index - 1];
            beat.PreviousBeat.NextBeat = beat;
        }
    },
    AddGraceBeat: function (beat){
        if (this.Beats.length == 0){
            this.AddBeat(beat);
            return;
        }
        // remove last beat
        var lastBeat = this.Beats[this.Beats.length - 1];
        this.Beats.splice(this.Beats.length - 1,1);
        // insert grace beat
        this.AddBeat(beat);
        // reinsert last beat
        this.AddBeat(lastBeat);
    },
    Finish: function (){
        // TODO: find a proper solution to chain beats without iterating twice
        for (var i = 0,j = this.Beats.length; i < j; i++){
            var beat = this.Beats[i];
            this.Chain(beat);
        }
        for (var i = 0,j = this.Beats.length; i < j; i++){
            var beat = this.Beats[i];
            beat.Finish();
            if (this.MinDuration == null || this.MinDuration > beat.Duration){
                this.MinDuration = beat.Duration;
            }
            if (this.MaxDuration == null || this.MaxDuration < beat.Duration){
                this.MaxDuration = beat.Duration;
            }
        }
    }
};
AlphaTab.Model.Voice.CopyTo = function (src, dst){
    dst.Index = src.Index;
};
AlphaTab.Platform.Model = AlphaTab.Platform.Model || {};
AlphaTab.Platform.Model.Color = function (r, g, b, a){
    this.Raw = 0;
    this.Raw = (a << 24) | (r << 16) | (g << 8) | b;
};
AlphaTab.Platform.Model.Color.prototype = {
    get_A: function (){
        return ((this.Raw >> 24) & 255);
    },
    get_R: function (){
        return ((this.Raw >> 16) & 255);
    },
    get_G: function (){
        return ((this.Raw >> 8) & 255);
    },
    get_B: function (){
        return (this.Raw & 255);
    },
    ToRgbaString: function (){
        return "rgba(" + this.get_R() + "," + this.get_G() + "," + this.get_B() + "," + (this.get_A() / 255) + ")";
    }
};
AlphaTab.Platform.Model.FontStyle = {
    Plain: 0,
    Bold: 1,
    Italic: 2
};
AlphaTab.Platform.Model.Font = function (family, size, style){
    this.Family = null;
    this.Size = 0;
    this.Style = AlphaTab.Platform.Model.FontStyle.Plain;
    this.Family = family;
    this.Size = size;
    this.Style = style;
};
AlphaTab.Platform.Model.Font.prototype = {
    get_IsBold: function (){
        return (this.Style & AlphaTab.Platform.Model.FontStyle.Bold) != AlphaTab.Platform.Model.FontStyle.Plain;
    },
    get_IsItalic: function (){
        return (this.Style & AlphaTab.Platform.Model.FontStyle.Italic) != AlphaTab.Platform.Model.FontStyle.Plain;
    },
    Clone: function (){
        return new AlphaTab.Platform.Model.Font(this.Family, this.Size, this.Style);
    },
    ToCssString: function (){
        var buf = new Array();
        if (this.get_IsBold()){
            buf.push("bold ");
        }
        if (this.get_IsItalic()){
            buf.push("italic ");
        }
        buf.push(this.Size);
        buf.push("px ");
        buf.push("\'");
        buf.push(this.Family);
        buf.push("\'");
        return buf.join('');
    }
};
AlphaTab.Platform.Model.TextAlign = {
    Left: 0,
    Center: 1,
    Right: 2
};
AlphaTab.Platform.Model.TextBaseline = {
    Default: 0,
    Top: 1,
    Middle: 2,
    Bottom: 3
};
AlphaTab.Platform.Svg = AlphaTab.Platform.Svg || {};
AlphaTab.Platform.Svg.FontSizes = function (){
};
$StaticConstructor(function (){
    AlphaTab.Platform.Svg.FontSizes.TimesNewRoman = new Uint8Array([3, 4, 5, 6, 6, 9, 9, 2, 4, 4, 6, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 5, 10, 8, 7, 7, 8, 7, 6, 7, 8, 4, 4, 8, 7, 10, 8, 8, 7, 8, 7, 5, 8, 8, 7, 11, 8, 8, 7, 4, 3, 4, 5, 6, 4, 5, 5, 5, 5, 5, 4, 5, 6, 3, 3, 6, 3, 9, 6, 6, 6, 5, 4, 4, 4, 5, 6, 7, 6, 6, 5, 5, 2, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 2, 5, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 3, 3, 4, 5, 5, 4, 4, 3, 3, 6, 8, 8, 8, 5, 8, 8, 8, 8, 8, 8, 11, 7, 7, 7, 7, 7, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 6, 8, 8, 8, 8, 8, 8, 6, 5, 5, 5, 5, 5, 5, 5, 8, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 6, 6]);
    AlphaTab.Platform.Svg.FontSizes.Arial11Pt = new Uint8Array([3, 2, 4, 6, 6, 10, 7, 2, 4, 4, 4, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 11, 8, 7, 7, 7, 6, 6, 8, 7, 2, 5, 7, 6, 8, 7, 8, 6, 8, 7, 7, 6, 7, 8, 10, 7, 8, 7, 3, 3, 3, 5, 6, 4, 6, 6, 6, 6, 6, 4, 6, 6, 2, 2, 5, 2, 8, 6, 6, 6, 6, 4, 6, 3, 6, 6, 10, 6, 6, 6, 4, 2, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 6, 6, 7, 6, 2, 6, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 4, 4, 4, 6, 6, 4, 4, 4, 5, 6, 9, 10, 10, 6, 8, 8, 8, 8, 8, 8, 11, 7, 6, 6, 6, 6, 2, 2, 2, 2, 8, 7, 8, 8, 8, 8, 8, 6, 8, 7, 7, 7, 7, 8, 7, 7, 6, 6, 6, 6, 6, 6, 10, 6, 6, 6, 6, 6, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
    AlphaTab.Platform.Svg.FontSizes.ControlChars = 32;
});
AlphaTab.Platform.Svg.FontSizes.MeasureString = function (s, f, size, style){
    var data;
    var dataSize;
    var factor = 1;
    if ((style & AlphaTab.Platform.Model.FontStyle.Italic) != AlphaTab.Platform.Model.FontStyle.Plain){
        factor *= 1.2;
    }
    if ((style & AlphaTab.Platform.Model.FontStyle.Bold) != AlphaTab.Platform.Model.FontStyle.Plain){
        factor *= 1.2;
    }
    if (f == AlphaTab.Platform.Svg.SupportedFonts.TimesNewRoman){
        data = AlphaTab.Platform.Svg.FontSizes.TimesNewRoman;
        dataSize = 11;
    }
    else if (f == AlphaTab.Platform.Svg.SupportedFonts.Arial){
        data = AlphaTab.Platform.Svg.FontSizes.Arial11Pt;
        dataSize = 11;
    }
    else {
        data = new Uint8Array([8]);
        dataSize = 11;
    }
    var stringSize = 0;
    for (var i = 0; i < s.length; i++){
        var code = Math.min(data.length - 1, s.charCodeAt(i) - 32);
        if (code >= 0){
            stringSize += ((data[code] * size) / dataSize);
        }
    }
    return stringSize * factor;
};
AlphaTab.Platform.Svg.SupportedFonts = {
    TimesNewRoman: 0,
    Arial: 1
};
AlphaTab.Platform.Svg.SvgCanvas = function (){
    this._buffer = null;
    this._currentPath = null;
    this._currentPathIsEmpty = false;
    this._Color = null;
    this._LineWidth = 0;
    this._Font = null;
    this._TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
    this._TextBaseline = AlphaTab.Platform.Model.TextBaseline.Default;
    this._Resources = null;
    this._currentPath = new Array();
    this._currentPathIsEmpty = true;
    this.set_Color(new AlphaTab.Platform.Model.Color(255, 255, 255, 255));
    this.set_LineWidth(1);
    this.set_Font(new AlphaTab.Platform.Model.Font("Arial", 10, AlphaTab.Platform.Model.FontStyle.Plain));
    this.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
    this.set_TextBaseline(AlphaTab.Platform.Model.TextBaseline.Default);
};
AlphaTab.Platform.Svg.SvgCanvas.prototype = {
    get_Color: function (){
        return this._Color;
    },
    set_Color: function (value){
        this._Color = value;
    },
    get_LineWidth: function (){
        return this._LineWidth;
    },
    set_LineWidth: function (value){
        this._LineWidth = value;
    },
    get_Font: function (){
        return this._Font;
    },
    set_Font: function (value){
        this._Font = value;
    },
    get_TextAlign: function (){
        return this._TextAlign;
    },
    set_TextAlign: function (value){
        this._TextAlign = value;
    },
    get_TextBaseline: function (){
        return this._TextBaseline;
    },
    set_TextBaseline: function (value){
        this._TextBaseline = value;
    },
    get_Resources: function (){
        return this._Resources;
    },
    set_Resources: function (value){
        this._Resources = value;
    },
    BeginRender: function (width, height){
        this._buffer = new Array();
        this._buffer.push("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"");
        this._buffer.push(width);
        this._buffer.push("px\" height=\"");
        this._buffer.push(height);
        this._buffer.push("px\" class=\"alphaTabSurfaceSvg\">\n");
        this._currentPath = new Array();
        this._currentPathIsEmpty = true;
    },
    EndRender: function (){
        this._buffer.push("</svg>");
        return this._buffer.join('');
    },
    FillRect: function (x, y, w, h){
        this._buffer.push("<rect x=\"");
        this._buffer.push(x - 0.5);
        this._buffer.push("\" y=\"");
        this._buffer.push(y - 0.5);
        this._buffer.push("\" width=\"");
        this._buffer.push(w);
        this._buffer.push("\" height=\"");
        this._buffer.push(h);
        this._buffer.push("\" style=\"fill:");
        this._buffer.push(this.get_Color().ToRgbaString());
        this._buffer.push(";\" />\n");
    },
    StrokeRect: function (x, y, w, h){
        this._buffer.push("<rect x=\"");
        this._buffer.push(x - 0.5);
        this._buffer.push("\" y=\"");
        this._buffer.push(y - 0.5);
        this._buffer.push("\" width=\"");
        this._buffer.push(w);
        this._buffer.push("\" height=\"");
        this._buffer.push(h);
        this._buffer.push("\" style=\"stroke:");
        this._buffer.push(this.get_Color().ToRgbaString());
        this._buffer.push("; stroke-width:");
        this._buffer.push(this.get_LineWidth());
        this._buffer.push(";\" />\n");
    },
    BeginPath: function (){
    },
    ClosePath: function (){
        this._currentPath.push(" z");
    },
    MoveTo: function (x, y){
        this._currentPath.push(" M");
        this._currentPath.push(x - 0.5);
        this._currentPath.push(",");
        this._currentPath.push(y - 0.5);
    },
    LineTo: function (x, y){
        this._currentPathIsEmpty = false;
        this._currentPath.push(" L");
        this._currentPath.push(x - 0.5);
        this._currentPath.push(",");
        this._currentPath.push(y - 0.5);
    },
    QuadraticCurveTo: function (cpx, cpy, x, y){
        this._currentPathIsEmpty = false;
        this._currentPath.push(" Q");
        this._currentPath.push(cpx);
        this._currentPath.push(",");
        this._currentPath.push(cpy);
        this._currentPath.push(",");
        this._currentPath.push(x);
        this._currentPath.push(",");
        this._currentPath.push(y);
    },
    BezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y){
        this._currentPathIsEmpty = false;
        this._currentPath.push(" C");
        this._currentPath.push(cp1x);
        this._currentPath.push(",");
        this._currentPath.push(cp1y);
        this._currentPath.push(",");
        this._currentPath.push(cp2x);
        this._currentPath.push(",");
        this._currentPath.push(cp2y);
        this._currentPath.push(",");
        this._currentPath.push(x);
        this._currentPath.push(",");
        this._currentPath.push(y);
    },
    FillCircle: function (x, y, radius){
        this._currentPathIsEmpty = false;
        // 
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath.push(" M");
        this._currentPath.push(x - radius);
        this._currentPath.push(",");
        this._currentPath.push(y);
        this._currentPath.push(" A1,1 0 0,0 ");
        this._currentPath.push(x + radius);
        this._currentPath.push(",");
        this._currentPath.push(y);
        this._currentPath.push(" A1,1 0 0,0 ");
        this._currentPath.push(x - radius);
        this._currentPath.push(",");
        this._currentPath.push(y);
        this._currentPath.push(" z");
        this.Fill();
    },
    Fill: function (){
        if (!this._currentPathIsEmpty){
            this._buffer.push("<path d=\"");
            this._buffer.push(this._currentPath.join(''));
            this._buffer.push("\" style=\"fill:");
            this._buffer.push(this.get_Color().ToRgbaString());
            this._buffer.push("\" stroke=\"none\"/>\n");
        }
        this._currentPath = new Array();
        this._currentPathIsEmpty = true;
    },
    Stroke: function (){
        if (!this._currentPathIsEmpty){
            this._buffer.push("<path d=\"");
            this._buffer.push(this._currentPath.join(''));
            this._buffer.push("\" style=\"stroke:");
            this._buffer.push(this.get_Color().ToRgbaString());
            this._buffer.push("; stroke-width:");
            this._buffer.push(this.get_LineWidth());
            this._buffer.push(";\" fill=\"none\" />\n");
        }
        this._currentPath = new Array();
        this._currentPathIsEmpty = true;
    },
    FillText: function (text, x, y){
        this._buffer.push("<text x=\"");
        this._buffer.push(x);
        this._buffer.push("\" y=\"");
        this._buffer.push(y + this.GetSvgBaseLineOffset());
        this._buffer.push("\" style=\"font:");
        this._buffer.push(this.get_Font().ToCssString());
        this._buffer.push("; fill:");
        this._buffer.push(this.get_Color().ToRgbaString());
        this._buffer.push(";\" ");
        this._buffer.push(" dominant-baseline=\"");
        this._buffer.push(this.GetSvgBaseLine());
        this._buffer.push("\" text-anchor=\"");
        this._buffer.push(this.GetSvgTextAlignment());
        this._buffer.push("\">\n");
        this._buffer.push(text);
        this._buffer.push("</text>\n");
    },
    GetSvgTextAlignment: function (){
        switch (this.get_TextAlign()){
            case AlphaTab.Platform.Model.TextAlign.Left:
                return "start";
            case AlphaTab.Platform.Model.TextAlign.Center:
                return "middle";
            case AlphaTab.Platform.Model.TextAlign.Right:
                return "end";
        }
        return "";
    },
    GetSvgBaseLineOffset: function (){
        switch (this.get_TextBaseline()){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                return 0;
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                return 0;
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                return 0;
            default:
                return this.get_Font().Size;
        }
    },
    GetSvgBaseLine: function (){
        switch (this.get_TextBaseline()){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                return "top";
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                return "middle";
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                return "bottom";
            default:
                return "top";
        }
    },
    MeasureText: function (text){
        if (((text==null)||(text.length==0)))
            return 0;
        var font = AlphaTab.Platform.Svg.SupportedFonts.Arial;
        if (this.get_Font().Family.indexOf("Times")!=-1){
            font = AlphaTab.Platform.Svg.SupportedFonts.TimesNewRoman;
        }
        return AlphaTab.Platform.Svg.FontSizes.MeasureString(text, font, this.get_Font().Size, this.get_Font().Style);
    },
    FillMusicFontSymbol: function (x, y, scale, symbol){
        if (symbol == AlphaTab.Rendering.Glyphs.MusicFontSymbol.None){
            return;
        }
        //_buffer += "<text x=\"";
        //_buffer += x;
        //_buffer += "\" y=\"";
        //_buffer += y + GetSvgBaseLineOffset();
        //_buffer += "\" style=\"font:";
        //_buffer += Resources.MusicFont.ToCssString();
        //_buffer += "; fill:";
        //_buffer += Color.ToRgbaString();
        //_buffer += ";\" ";
        //_buffer += " dominant-baseline=\"top\" text-anchor=\"start\"";
        //_buffer += ">&#x";
        //_buffer += Std.ToHexString((int)symbol);
        //_buffer += ";</text>\n";
        //if (symbol == MusicFontSymbol.None)
        //{
        //    return;
        //}
        var glyph = new AlphaTab.Rendering.Utils.SvgRenderer(AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[symbol], scale, scale);
        glyph.Paint(x, y, this);
    }
};
AlphaTab.Rendering = AlphaTab.Rendering || {};
AlphaTab.Rendering.BarRendererBase = function (bar){
    this.Stave = null;
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Height = 0;
    this.Index = 0;
    this.IsEmpty = false;
    this.TopOverflow = 0;
    this.BottomOverflow = 0;
    this.Bar = null;
    this.IsLinkedToPrevious = false;
    this.Bar = bar;
    this.IsEmpty = true;
};
AlphaTab.Rendering.BarRendererBase.prototype = {
    RegisterOverflowTop: function (topOverflow){
        if (topOverflow > this.TopOverflow)
            this.TopOverflow = topOverflow;
    },
    RegisterOverflowBottom: function (bottomOverflow){
        if (bottomOverflow > this.BottomOverflow)
            this.BottomOverflow = bottomOverflow;
    },
    ApplyBarSpacing: function (spacing){
    },
    get_Resources: function (){
        return this.get_Layout().Renderer.RenderingResources;
    },
    get_Layout: function (){
        return this.Stave.StaveGroup.Layout;
    },
    get_Settings: function (){
        return this.get_Layout().Renderer.Settings;
    },
    get_Scale: function (){
        return this.get_Settings().Scale;
    },
    get_IsFirstOfLine: function (){
        return this.Index == 0;
    },
    get_IsLastOfLine: function (){
        return this.Index == this.Stave.BarRenderers.length - 1;
    },
    get_IsLast: function (){
        return this.Bar.Index == this.Stave.BarRenderers.length - 1;
    },
    RegisterMaxSizes: function (sizes){
    },
    ApplySizes: function (sizes){
    },
    FinalizeRenderer: function (layout){
    },
    get_TopPadding: function (){
        return 0;
    },
    get_BottomPadding: function (){
        return 0;
    },
    DoLayout: function (){
    },
    Paint: function (cx, cy, canvas){
    },
    BuildBoundingsLookup: function (lookup, visualTop, visualHeight, realTop, realHeight, x){
        var barLookup = new AlphaTab.Rendering.Utils.BarBoundings();
        barLookup.Bar = this.Bar;
        barLookup.IsFirstOfLine = this.get_IsFirstOfLine();
        barLookup.IsLastOfLine = this.get_IsLastOfLine();
        barLookup.VisualBounds = new AlphaTab.Rendering.Utils.Bounds(x + this.Stave.X + this.X, visualTop, this.Width, visualHeight);
        barLookup.Bounds = new AlphaTab.Rendering.Utils.Bounds(x + this.Stave.X + this.X, realTop, this.Width, realHeight);
        lookup.Bars.push(barLookup);
    }
};
AlphaTab.Rendering.GroupedBarRenderer = function (bar){
    this._preBeatGlyphs = null;
    this._voiceContainers = null;
    this._postBeatGlyphs = null;
    this._biggestVoiceContainer = null;
    AlphaTab.Rendering.BarRendererBase.call(this, bar);
    this._preBeatGlyphs = [];
    this._voiceContainers = {};
    this._postBeatGlyphs = [];
};
AlphaTab.Rendering.GroupedBarRenderer.prototype = {
    DoLayout: function (){
        this.CreatePreBeatGlyphs();
        this.CreateBeatGlyphs();
        this.CreatePostBeatGlyphs();
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            c.DoLayout();
        }));
        this.UpdateWidth();
    },
    UpdateWidth: function (){
        this.Width = this.get_PostBeatGlyphsStart();
        if (this._postBeatGlyphs.length > 0){
            this.Width += this._postBeatGlyphs[this._postBeatGlyphs.length - 1].X + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].Width;
        }
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            if (this._biggestVoiceContainer == null || c.Width > this._biggestVoiceContainer.Width){
                this._biggestVoiceContainer = c;
            }
        }));
    },
    GetNoteX: function (note, onEnd){
        return 0;
    },
    GetNoteY: function (note){
        return 0;
    },
    RegisterMaxSizes: function (sizes){
        var preSize = this.get_BeatGlyphsStart();
        if (sizes.GetSize("Pre") < preSize){
            sizes.SetSize("Pre", preSize);
        }
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            c.RegisterMaxSizes(sizes);
        }));
        var postSize;
        if (this._postBeatGlyphs.length == 0){
            postSize = 0;
        }
        else {
            postSize = this._postBeatGlyphs[this._postBeatGlyphs.length - 1].X + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].Width;
        }
        if (sizes.GetSize("Post") < postSize){
            sizes.SetSize("Post", postSize);
        }
        if (sizes.FullWidth < this.Width){
            sizes.FullWidth = this.Width;
        }
    },
    ApplySizes: function (sizes){
        // if we need additional space in the preBeat group we simply
        // add a new spacer
        var preSize = sizes.GetSize("Pre");
        var preSizeDiff = preSize - this.get_BeatGlyphsStart();
        if (preSizeDiff > 0){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, preSizeDiff, true));
        }
        // on beat glyphs we apply the glyph spacing
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            c.ApplySizes(sizes);
        }));
        // on the post glyphs we add the spacing before all other glyphs
        var postSize = sizes.GetSize("Post");
        var postSizeDiff;
        if (this._postBeatGlyphs.length == 0){
            postSizeDiff = postSize;
        }
        else {
            postSizeDiff = postSize - (this._postBeatGlyphs[this._postBeatGlyphs.length - 1].X + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].Width);
        }
        if (postSizeDiff > 0){
            this._postBeatGlyphs.splice(0,0,new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, postSizeDiff, true));
            for (var i = 0; i < this._postBeatGlyphs.length; i++){
                var g = this._postBeatGlyphs[i];
                g.X = i == 0 ? 0 : this._postBeatGlyphs[this._postBeatGlyphs.length - 1].X + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].Width;
                g.Index = i;
                g.Renderer = this;
            }
        }
        this.UpdateWidth();
    },
    AddGlyph: function (c, g){
        this.IsEmpty = false;
        g.X = c.length == 0 ? 0 : (c[c.length - 1].X + c[c.length - 1].Width);
        g.Index = c.length;
        g.Renderer = this;
        g.DoLayout();
        c.push(g);
    },
    AddPreBeatGlyph: function (g){
        this.AddGlyph(this._preBeatGlyphs, g);
    },
    AddBeatGlyph: function (g){
        this.GetOrCreateVoiceContainer(g.Beat.Voice.Index).AddGlyph(g);
    },
    GetOrCreateVoiceContainer: function (voiceIndex){
        var c;
        if (voiceIndex >= Object.keys(this._voiceContainers).length){
            c = new AlphaTab.Rendering.Glyphs.VoiceContainerGlyph(0, 0, voiceIndex);
            c.Renderer = this;
            this._voiceContainers[voiceIndex] = c;
        }
        else {
            c = this._voiceContainers[voiceIndex];
        }
        return c;
    },
    GetBeatContainer: function (voice, beat){
        return this.GetOrCreateVoiceContainer(voice).BeatGlyphs[beat];
    },
    GetPreNotesPosition: function (voice, beat){
        return this.GetBeatContainer(voice, beat).PreNotes;
    },
    GetOnNotesPosition: function (voice, beat){
        return this.GetBeatContainer(voice, beat).OnNotes;
    },
    GetPostNotesPosition: function (voice, beat){
        return this.GetBeatContainer(voice, beat).PostNotes;
    },
    AddPostBeatGlyph: function (g){
        this.AddGlyph(this._postBeatGlyphs, g);
    },
    CreatePreBeatGlyphs: function (){
    },
    CreateBeatGlyphs: function (){
    },
    CreatePostBeatGlyphs: function (){
    },
    get_PreBeatGlyphStart: function (){
        return 0;
    },
    get_BeatGlyphsStart: function (){
        var start = this.get_PreBeatGlyphStart();
        if (this._preBeatGlyphs.length > 0){
            start += this._preBeatGlyphs[this._preBeatGlyphs.length - 1].X + this._preBeatGlyphs[this._preBeatGlyphs.length - 1].Width;
        }
        return start;
    },
    get_PostBeatGlyphsStart: function (){
        var start = this.get_BeatGlyphsStart();
        var offset = 0;
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            if (c.Width > offset){
                offset = c.Width;
            }
            //if (c.beatGlyphs.length > 0)
            //{
            //    var coff = c.beatGlyphs[c.beatGlyphs.length - 1].x + c.beatGlyphs[c.beatGlyphs.length - 1].width;
            //    if (coff > offset)
            //    {
            //        offset = coff;
            //    }
            //}
        }));
        return start + offset;
    },
    get_PostBeatGlyphsWidth: function (){
        var width = 0;
        for (var i = 0,j = this._postBeatGlyphs.length; i < j; i++){
            var c = this._postBeatGlyphs[i];
            var x = c.X + c.Width;
            if (x > width)
                width = x;
        }
        return width;
    },
    ApplyBarSpacing: function (spacing){
        this.Width += spacing;
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            var toApply = spacing;
            if (this._biggestVoiceContainer != null){
                toApply += this._biggestVoiceContainer.Width - c.Width;
            }
            c.ApplyGlyphSpacing(toApply);
        }));
    },
    FinalizeRenderer: function (layout){
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            c.FinalizeGlyph(layout);
        }));
    },
    Paint: function (cx, cy, canvas){
        this.PaintBackground(cx, cy, canvas);
        var glyphStartX = this.get_PreBeatGlyphStart();
        for (var i = 0,j = this._preBeatGlyphs.length; i < j; i++){
            var g = this._preBeatGlyphs[i];
            g.Paint(cx + this.X + glyphStartX, cy + this.Y, canvas);
        }
        glyphStartX = this.get_BeatGlyphsStart();
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            c.Paint(cx + this.X + glyphStartX, cy + this.Y, canvas);
        }));
        glyphStartX = this.Width - this.get_PostBeatGlyphsWidth();
        for (var i = 0,j = this._postBeatGlyphs.length; i < j; i++){
            var g = this._postBeatGlyphs[i];
            g.Paint(cx + this.X + glyphStartX, cy + this.Y, canvas);
        }
    },
    PaintBackground: function (cx, cy, canvas){
        //var c = new Color((byte)Std.Random(255),
        //      (byte)Std.Random(255),
        //      (byte)Std.Random(255),
        //      100);
        //canvas.Color = c;
        //canvas.FillRect(cx + X, cy + Y, Width, Height);
    },
    BuildBoundingsLookup: function (lookup, visualTop, visualHeight, realTop, realHeight, x){
        AlphaTab.Rendering.BarRendererBase.prototype.BuildBoundingsLookup.call(this, lookup, visualTop, visualHeight, realTop, realHeight, x);
        var barLookup = lookup.Bars[lookup.Bars.length - 1];
        var beatStart = this.get_BeatGlyphsStart();
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, this._voiceContainers, $CreateAnonymousDelegate(this, function (c){
            for (var i = 0,j = c.BeatGlyphs.length; i < j; i++){
                var bc = c.BeatGlyphs[i];
                var beatLookup = new AlphaTab.Rendering.Utils.BeatBoundings();
                beatLookup.Beat = bc.Beat;
                // on beat bounding rectangle
                beatLookup.VisualBounds = new AlphaTab.Rendering.Utils.Bounds(x + this.Stave.X + this.X + beatStart + c.X + bc.X + bc.OnNotes.X, visualTop, bc.OnNotes.Width, visualHeight);
                // real beat boundings
                beatLookup.Bounds = new AlphaTab.Rendering.Utils.Bounds(x + this.Stave.X + this.X + beatStart + c.X + bc.X, realTop, bc.Width, realHeight);
                barLookup.Beats.push(beatLookup);
            }
        }));
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.GroupedBarRenderer.KeySizePre = "Pre";
    AlphaTab.Rendering.GroupedBarRenderer.KeySizePost = "Post";
});
$Inherit(AlphaTab.Rendering.GroupedBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.AlternateEndingsBarRenderer = function (bar){
    this._endings = null;
    this._endingsString = null;
    AlphaTab.Rendering.GroupedBarRenderer.call(this, bar);
    var alternateEndings = this.Bar.get_MasterBar().AlternateEndings;
    this._endings = [];
    for (var i = 0; i < 8; i++){
        if ((alternateEndings & (1 << i)) != 0){
            this._endings.push(i);
        }
    }
};
AlphaTab.Rendering.AlternateEndingsBarRenderer.prototype = {
    FinalizeRenderer: function (layout){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.FinalizeRenderer.call(this, layout);
        this.IsEmpty = this._endings.length == 0;
    },
    CreateBeatGlyphs: function (){
        
        this.CreateVoiceGlyphs(this.Bar.Voices[0]);
    },
    CreateVoiceGlyphs: function (voice){
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            var b = voice.Beats[i];
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.PostNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            this.AddBeatGlyph(container);
        }
    },
    DoLayout: function (){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.DoLayout.call(this);
        if (this.Index == 0){
            this.Stave.TopSpacing = 5;
            this.Stave.BottomSpacing = 4;
        }
        this.Height = this.get_Resources().WordsFont.Size;
        var endingsStrings = new Array();
        for (var i = 0,j = this._endings.length; i < j; i++){
            endingsStrings.push(this._endings[i] + 1);
            endingsStrings.push(". ");
        }
        this._endingsString = endingsStrings.join('');
    },
    get_TopPadding: function (){
        return 0;
    },
    get_BottomPadding: function (){
        return 0;
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.Paint.call(this, cx, cy, canvas);
        if (this._endings.length > 0){
            var res = this.get_Resources();
            canvas.set_Font(res.WordsFont);
            canvas.MoveTo(cx + this.X, cy + this.Y + this.Height);
            canvas.LineTo(cx + this.X, cy + this.Y);
            canvas.LineTo(cx + this.X + this.Width, cy + this.Y);
            canvas.Stroke();
            canvas.FillText(this._endingsString, cx + this.X + 3 * this.get_Scale(), cy + this.Y * this.get_Scale());
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.AlternateEndingsBarRenderer.Padding = 3;
});
$Inherit(AlphaTab.Rendering.AlternateEndingsBarRenderer, AlphaTab.Rendering.GroupedBarRenderer);
AlphaTab.Rendering.BarRendererFactory = function (){
    this.IsInAccolade = false;
    this.HideOnMultiTrack = false;
    this.HideOnPercussionTrack = false;
    this.IsInAccolade = true;
    this.HideOnMultiTrack = false;
    this.HideOnPercussionTrack = false;
};
AlphaTab.Rendering.BarRendererFactory.prototype = {
    CanCreate: function (track){
        return !this.HideOnPercussionTrack || !track.IsPercussion;
    }
};
AlphaTab.Rendering.AlternateEndingsBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this.IsInAccolade = false;
};
AlphaTab.Rendering.AlternateEndingsBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.AlternateEndingsBarRenderer(bar);
    }
};
$Inherit(AlphaTab.Rendering.AlternateEndingsBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.EffectBarGlyphSizing = {
    SinglePreBeatOnly: 0,
    SinglePreBeatToOnBeat: 1,
    SinglePreBeatToPostBeat: 2,
    SingleOnBeatOnly: 3,
    SingleOnBeatToPostBeat: 4,
    SinglePostBeatOnly: 5,
    GroupedPreBeatOnly: 6,
    GroupedPreBeatToOnBeat: 7,
    GroupedPreBeatToPostBeat: 8,
    GroupedOnBeatOnly: 9,
    GroupedOnBeatToPostBeat: 10,
    GroupedPostBeatOnly: 11
};
AlphaTab.Rendering.EffectBarRenderer = function (bar, info){
    this._info = null;
    this._uniqueEffectGlyphs = null;
    this._effectGlyphs = null;
    this._lastBeat = null;
    AlphaTab.Rendering.GroupedBarRenderer.call(this, bar);
    this._info = info;
    this._uniqueEffectGlyphs = [];
    this._effectGlyphs = [];
};
AlphaTab.Rendering.EffectBarRenderer.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.DoLayout.call(this);
        if (this.Index == 0){
            this.Stave.TopSpacing = 5;
            this.Stave.BottomSpacing = 5;
        }
        this.Height = this._info.GetHeight(this);
    },
    FinalizeRenderer: function (layout){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.FinalizeRenderer.call(this, layout);
        // after all layouting and sizing place and size the effect glyphs
        this.IsEmpty = true;
        
        var prevGlyph = null;
        if (this.Index > 0){
            // check if previous renderer had an effect on his last beat
            // and use this as merging element
            var prevRenderer = this.Stave.BarRenderers[this.Index - 1];
            if (prevRenderer._lastBeat != null && prevRenderer._effectGlyphs[0].hasOwnProperty(prevRenderer._lastBeat.Index)){
                prevGlyph = prevRenderer._effectGlyphs[0][prevRenderer._lastBeat.Index];
            }
        }
        for (var $i19 = 0,$t19 = Object.keys(this._effectGlyphs[0]),$l19 = $t19.length,key = $t19[$i19]; $i19 < $l19; $i19++, key = $t19[$i19]){
            var beatIndex = AlphaTab.Platform.Std.ParseInt(key);
            var effect = this._effectGlyphs[0][beatIndex];
            this.AlignGlyph(this._info.get_SizingMode(), beatIndex, 0, prevGlyph);
            prevGlyph = effect;
            this.IsEmpty = false;
        }
    },
    AlignGlyph: function (sizing, beatIndex, voiceIndex, prevGlyph){
        var g = this._effectGlyphs[voiceIndex][beatIndex];
        var pos;
        var container = this.GetBeatContainer(voiceIndex, beatIndex);
        switch (sizing){
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly:
                pos = container.PreNotes;
                g.X = pos.X + container.X;
                g.Width = pos.Width;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat:
                pos = container.PreNotes;
                g.X = pos.X + container.X;
                pos = container.OnNotes;
                g.Width = (pos.X + container.X + pos.Width) - g.X;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat:
                pos = container.PreNotes;
                g.X = pos.X + container.X;
                pos = container.PostNotes;
                g.Width = (pos.X + container.X + pos.Width) - g.X;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly:
                pos = container.OnNotes;
                g.X = pos.X + container.X;
                g.Width = pos.Width;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat:
                pos = container.OnNotes;
                g.X = pos.X + container.X;
                pos = container.PostNotes;
                g.Width = (pos.X + container.X + pos.Width) - g.X;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePostBeatOnly:
                pos = container.PostNotes;
                g.X = pos.X + container.X;
                g.Width = pos.Width;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatOnly:
                if (g != prevGlyph){
                this.AlignGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly, beatIndex, voiceIndex, prevGlyph);
            }
                else {
                pos = container.PreNotes;
                var posR = pos.Renderer;
                var gR = g.Renderer;
                g.Width = (posR.X + posR.get_BeatGlyphsStart() + container.X + pos.X + pos.Width) - (gR.X + gR.get_BeatGlyphsStart() + g.X);
                g.ExpandTo(container.Beat);
            }
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatToOnBeat:
                if (g != prevGlyph){
                this.AlignGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat, beatIndex, voiceIndex, prevGlyph);
            }
                else {
                pos = container.OnNotes;
                var posR = pos.Renderer;
                var gR = g.Renderer;
                g.Width = (posR.X + posR.get_BeatGlyphsStart() + container.X + pos.X + pos.Width) - (gR.X + gR.get_BeatGlyphsStart() + g.X);
                g.ExpandTo(container.Beat);
            }
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatToPostBeat:
                if (g != prevGlyph){
                this.AlignGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat, beatIndex, voiceIndex, prevGlyph);
            }
                else {
                pos = container.PostNotes;
                var posR = pos.Renderer;
                var gR = g.Renderer;
                g.Width = (posR.X + posR.get_BeatGlyphsStart() + container.X + pos.X + pos.Width) - (gR.X + gR.get_BeatGlyphsStart() + g.X);
                g.ExpandTo(container.Beat);
            }
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatOnly:
                if (g != prevGlyph){
                this.AlignGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly, beatIndex, voiceIndex, prevGlyph);
            }
                else {
                pos = container.OnNotes;
                var posR = pos.Renderer;
                var gR = g.Renderer;
                g.Width = (posR.X + posR.get_BeatGlyphsStart() + container.X + pos.X + pos.Width) - (gR.X + gR.get_BeatGlyphsStart() + g.X);
                g.ExpandTo(container.Beat);
            }
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat:
                if (g != prevGlyph){
                this.AlignGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat, beatIndex, voiceIndex, prevGlyph);
            }
                else {
                pos = container.PostNotes;
                var posR = pos.Renderer;
                var gR = g.Renderer;
                g.Width = (posR.X + posR.get_BeatGlyphsStart() + container.X + pos.X + pos.Width) - (gR.X + gR.get_BeatGlyphsStart() + g.X);
                g.ExpandTo(container.Beat);
            }
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPostBeatOnly:
                if (g != prevGlyph){
                this.AlignGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPostBeatOnly, beatIndex, voiceIndex, prevGlyph);
            }
                else {
                pos = container.PostNotes;
                var posR = pos.Renderer;
                var gR = g.Renderer;
                g.Width = (posR.X + posR.get_BeatGlyphsStart() + container.X + pos.X + pos.Width) - (gR.X + gR.get_BeatGlyphsStart() + g.X);
                g.ExpandTo(container.Beat);
            }
                break;
        }
    },
    CreatePreBeatGlyphs: function (){
    },
    CreateBeatGlyphs: function (){
        
        this._effectGlyphs.push({});
        this._uniqueEffectGlyphs.push([]);
        this.CreateVoiceGlyphs(this.Bar.Voices[0]);
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.PostNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            this.AddBeatGlyph(container);
            if (this._info.ShouldCreateGlyph(this, b)){
                this.CreateOrResizeGlyph(this._info.get_SizingMode(), b);
            }
            this._lastBeat = b;
        }
    },
    CreateOrResizeGlyph: function (sizing, b){
        switch (sizing){
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePostBeatOnly:
                var g = this._info.CreateNewGlyph(this, b);
                g.Renderer = this;
                g.DoLayout();
                this._effectGlyphs[b.Voice.Index][b.Index] = g;
                this._uniqueEffectGlyphs[b.Voice.Index].push(g);
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatOnly:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatToOnBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatToPostBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatOnly:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPostBeatOnly:
                if (b.Index > 0 || this.Index > 0){
                // check if the previous beat also had this effect
                var prevBeat = b.PreviousBeat;
                if (this._info.ShouldCreateGlyph(this, prevBeat)){
                    var previousRenderer = null;
                    // expand the previous effect
                    var prevEffect = null;
                    if (b.Index > 0 && this._effectGlyphs[b.Voice.Index].hasOwnProperty(prevBeat.Index)){
                        prevEffect = this._effectGlyphs[b.Voice.Index][prevBeat.Index];
                    }
                    else if (this.Index > 0){
                        previousRenderer = (this.Stave.BarRenderers[this.Index - 1]);
                        var voiceGlyphs = previousRenderer._effectGlyphs[b.Voice.Index];
                        if (voiceGlyphs.hasOwnProperty(prevBeat.Index)){
                            prevEffect = voiceGlyphs[prevBeat.Index];
                        }
                    }
                    if (prevEffect == null || !this._info.CanExpand(this, prevBeat, b)){
                        this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly, b);
                    }
                    else {
                        this._effectGlyphs[b.Voice.Index][b.Index] = prevEffect;
                        if (previousRenderer != null){
                            this.IsLinkedToPrevious = true;
                        }
                    }
                }
                else {
                    this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly, b);
                }
            }
                else {
                this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly, b);
            }
                break;
        }
    },
    CreatePostBeatGlyphs: function (){
    },
    get_TopPadding: function (){
        return 0;
    },
    get_BottomPadding: function (){
        return 0;
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.Paint.call(this, cx, cy, canvas);
        // canvas.setColor(new Color(0, 0, 200, 100));
        // canvas.fillRect(cx + x, cy + y, width, height);
        var glyphStart = this.get_BeatGlyphsStart();
        for (var i = 0,j = this._uniqueEffectGlyphs.length; i < j; i++){
            var v = this._uniqueEffectGlyphs[i];
            for (var k = 0,l = v.length; k < l; k++){
                var g = v[k];
                if (g.Renderer == this){
                    g.Paint(cx + this.X + glyphStart, cy + this.Y, canvas);
                }
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.EffectBarRenderer, AlphaTab.Rendering.GroupedBarRenderer);
AlphaTab.Rendering.EffectBarRendererFactory = function (info){
    this._info = null;
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this._info = info;
    this.IsInAccolade = false;
    this.HideOnMultiTrack = info.get_HideOnMultiTrack();
};
AlphaTab.Rendering.EffectBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.EffectBarRenderer(bar, this._info);
    }
};
$Inherit(AlphaTab.Rendering.EffectBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.Effects = AlphaTab.Rendering.Effects || {};
AlphaTab.Rendering.Effects.BeatVibratoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.BeatVibratoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return (beat.Vibrato != AlphaTab.Model.VibratoType.None);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    },
    GetHeight: function (renderer){
        return 17 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.VibratoGlyph(0, 5 * renderer.get_Scale(), 1.15);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.ChordsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.ChordsEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.get_HasChord();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.get_Chord().Name, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.CrescendoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.CrescendoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Crescendo != AlphaTab.Model.CrescendoType.None;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedPreBeatToPostBeat;
    },
    GetHeight: function (renderer){
        return 17 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.CrescendoGlyph(0, 0, beat.Crescendo);
    },
    CanExpand: function (renderer, from, to){
        return from.Crescendo == to.Crescendo;
    }
};
AlphaTab.Rendering.Glyphs = AlphaTab.Rendering.Glyphs || {};
AlphaTab.Rendering.Glyphs.Glyph = function (x, y){
    this.Index = 0;
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Renderer = null;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.Glyph.prototype = {
    ApplyGlyphSpacing: function (spacing){
        if (this.get_CanScale()){
            this.Width += spacing;
        }
    },
    get_CanScale: function (){
        return true;
    },
    get_Scale: function (){
        return this.Renderer.get_Scale();
    },
    DoLayout: function (){
    },
    Paint: function (cx, cy, canvas){
    }
};
AlphaTab.Rendering.Glyphs.EffectGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.EffectGlyph.prototype = {
    ExpandTo: function (beat){
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.EffectGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Effects.DummyEffectGlyph = function (x, y, s){
    this._s = null;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._s = s;
};
AlphaTab.Rendering.Effects.DummyEffectGlyph.prototype = {
    DoLayout: function (){
        this.Width = 20 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Color(res.MainGlyphColor);
        canvas.StrokeRect(cx + this.X, cy + this.Y, this.Width, 20 * this.get_Scale());
        canvas.set_Font(res.TablatureFont);
        canvas.FillText(this._s, cx + this.X, cy + this.Y);
    }
};
$Inherit(AlphaTab.Rendering.Effects.DummyEffectGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Effects.DynamicsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.DynamicsEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Voice.Index == 0 && ((beat.Index == 0 && beat.Voice.Bar.Index == 0) || (beat.PreviousBeat != null && beat.Dynamic != beat.PreviousBeat.Dynamic));
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 15 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.DynamicsGlyph(0, 0, beat.Dynamic);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.FadeInEffectInfo = function (){
};
AlphaTab.Rendering.Effects.FadeInEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.FadeIn;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.FadeInGlyph(0, 0);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.NoteEffectInfoBase = function (){
    this.LastCreateInfo = null;
};
AlphaTab.Rendering.Effects.NoteEffectInfoBase.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        this.LastCreateInfo = [];
        for (var i = 0,j = beat.Notes.length; i < j; i++){
            var n = beat.Notes[i];
            if (this.ShouldCreateGlyphForNote(renderer, n)){
                this.LastCreateInfo.push(n);
            }
        }
        return this.LastCreateInfo.length > 0;
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.FingeringEffectInfo = function (){
    this._maxGlyphCount = 0;
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.FingeringEffectInfo.prototype = {
    ShouldCreateGlyph: function (renderer, beat){
        var result = AlphaTab.Rendering.Effects.NoteEffectInfoBase.prototype.ShouldCreateGlyph.call(this, renderer, beat);
        if (this.LastCreateInfo.length >= this._maxGlyphCount)
            this._maxGlyphCount = this.LastCreateInfo.length;
        return result;
    },
    ShouldCreateGlyphForNote: function (renderer, note){
        return (note.LeftHandFinger != AlphaTab.Model.Fingers.NoOrDead && note.LeftHandFinger != AlphaTab.Model.Fingers.Unknown) || (note.RightHandFinger != AlphaTab.Model.Fingers.NoOrDead && note.RightHandFinger != AlphaTab.Model.Fingers.Unknown);
    },
    GetHeight: function (renderer){
        return this._maxGlyphCount * (20 * renderer.get_Scale());
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Effects.DummyEffectGlyph(0, 0, this.LastCreateInfo.length + "fingering");
    }
};
$Inherit(AlphaTab.Rendering.Effects.FingeringEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.HarmonicsEffectInfo = function (){
    this._beat = null;
    this._beatType = AlphaTab.Model.HarmonicType.None;
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        if (!note.get_IsHarmonic())
            return false;
        if (note.Beat != this._beat || note.HarmonicType > this._beatType){
            this._beatType = note.HarmonicType;
        }
        return true;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, AlphaTab.Rendering.Effects.HarmonicsEffectInfo.HarmonicToString(this._beatType), renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    }
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo.HarmonicToString = function (type){
    switch (type){
        case AlphaTab.Model.HarmonicType.Natural:
            return "N.H.";
        case AlphaTab.Model.HarmonicType.Artificial:
            return "A.H.";
        case AlphaTab.Model.HarmonicType.Pinch:
            return "P.H.";
        case AlphaTab.Model.HarmonicType.Tap:
            return "T.H.";
        case AlphaTab.Model.HarmonicType.Semi:
            return "S.H.";
        case AlphaTab.Model.HarmonicType.Feedback:
            return "Fdbk.";
    }
    return "";
};
$Inherit(AlphaTab.Rendering.Effects.HarmonicsEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.LetRingEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.LetRingEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.IsLetRing;
    },
    GetHeight: function (renderer){
        return 15 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LineRangedGlyph(0, 0, "LetRing");
    }
};
$Inherit(AlphaTab.Rendering.Effects.LetRingEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.MarkerEffectInfo = function (){
};
AlphaTab.Rendering.Effects.MarkerEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return true;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && beat.Voice.Bar.get_MasterBar().get_IsSectionStart();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.Voice.Bar.get_MasterBar().Section.Text, renderer.get_Resources().MarkerFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.NoteVibratoEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.NoteVibratoEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.Vibrato != AlphaTab.Model.VibratoType.None || (note.IsTieDestination && note.TieOrigin.Vibrato != AlphaTab.Model.VibratoType.None);
    },
    GetHeight: function (renderer){
        return 15 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.VibratoGlyph(0, 5 * renderer.get_Scale(), 0.9);
    }
};
$Inherit(AlphaTab.Rendering.Effects.NoteVibratoEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.CapoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.CapoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && beat.Voice.Bar.Index == 0 && beat.Voice.Bar.Track.Capo != 0;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Capo. fret " + beat.Voice.Bar.Track.Capo, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return false;
    }
};
AlphaTab.Rendering.Effects.PalmMuteEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.PalmMuteEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.IsPalmMute;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LineRangedGlyph(0, 0, "PalmMute");
    }
};
$Inherit(AlphaTab.Rendering.Effects.PalmMuteEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.PickStrokeEffectInfo = function (){
};
AlphaTab.Rendering.Effects.PickStrokeEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.PickStroke != AlphaTab.Model.PickStrokeType.None;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.PickStrokeGlyph(0, 0, beat.PickStroke);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TapEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TapEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return (beat.Slap || beat.Pop || beat.Tap);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        var res = renderer.get_Resources();
        if (beat.Slap){
            return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "S", res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
        }
        if (beat.Pop){
            return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "P", res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
        }
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "T", res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TempoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TempoEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return true;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && (beat.Voice.Bar.get_MasterBar().TempoAutomation != null || beat.Voice.Bar.Index == 0);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeatOnly;
    },
    GetHeight: function (renderer){
        return 25 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        var tempo;
        if (beat.Voice.Bar.get_MasterBar().TempoAutomation != null){
            tempo = ((beat.Voice.Bar.get_MasterBar().TempoAutomation.Value)) | 0;
        }
        else {
            tempo = beat.Voice.Bar.Track.Score.Tempo;
        }
        return new AlphaTab.Rendering.Glyphs.TempoGlyph(0, 0, tempo);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TextEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TextEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return false;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return !AlphaTab.Platform.Std.IsNullOrWhiteSpace(beat.Text);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.Text, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TrillEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.TrillEffectInfo.prototype = {
    ShouldCreateGlyphForNote: function (renderer, note){
        return note.get_IsTrill();
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TrillGlyph(0, 0, 0.9);
    }
};
$Inherit(AlphaTab.Rendering.Effects.TrillEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.TripletFeelEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TripletFeelEffectInfo.prototype = {
    get_HideOnMultiTrack: function (){
        return true;
    },
    ShouldCreateGlyph: function (renderer, beat){
        return beat.Index == 0 && (beat.Voice.Bar.get_MasterBar().Index == 0 && beat.Voice.Bar.get_MasterBar().TripletFeel != AlphaTab.Model.TripletFeel.NoTripletFeel) || (beat.Voice.Bar.get_MasterBar().Index > 0 && beat.Voice.Bar.get_MasterBar().TripletFeel != beat.Voice.Bar.get_MasterBar().PreviousMasterBar.TripletFeel);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
    },
    GetHeight: function (renderer){
        return 20 * renderer.get_Scale();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Effects.DummyEffectGlyph(0, 0, "TripletFeel");
    },
    CanExpand: function (renderer, from, to){
        return true;
    }
};
AlphaTab.Rendering.Glyphs.MusicFontGlyph = function (x, y, scale, symbol){
    this._scale = 0;
    this._symbol = AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._scale = scale;
    this._symbol = symbol;
};
AlphaTab.Rendering.Glyphs.MusicFontGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        canvas.FillMusicFontSymbol(cx + this.X, cy + this.Y, this._scale * this.get_Scale(), this._symbol);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.MusicFontGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.AccentuationGlyph = function (x, y, accentuation){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.AccentuationGlyph.GetSymbol(accentuation));
};
AlphaTab.Rendering.Glyphs.AccentuationGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
AlphaTab.Rendering.Glyphs.AccentuationGlyph.GetSymbol = function (accentuation){
    switch (accentuation){
        case AlphaTab.Model.AccentuationType.None:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
        case AlphaTab.Model.AccentuationType.Normal:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Accentuation;
        case AlphaTab.Model.AccentuationType.Heavy:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.HeavyAccentuation;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.AccentuationGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.GlyphGroup = function (x, y){
    this.Glyphs = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.GlyphGroup.prototype = {
    DoLayout: function (){
        if (this.Glyphs == null || this.Glyphs.length == 0){
            this.Width = 0;
            return;
        }
        var w = 0;
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.Renderer = this.Renderer;
            g.DoLayout();
            w = Math.max(w, g.Width);
        }
        this.Width = w;
    },
    AddGlyph: function (g){
        if (this.Glyphs == null)
            this.Glyphs = [];
        this.Glyphs.push(g);
    },
    Paint: function (cx, cy, canvas){
        if (this.Glyphs == null || this.Glyphs.length == 0)
            return;
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.Renderer = this.Renderer;
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.GlyphGroup, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph = function (){
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, 0, 0);
};
AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph.prototype = {
    DoLayout: function (){
        if (this.Glyphs == null){
            this.Width = 0;
            return;
        }
        //
        // Determine Columns for accidentals
        //
        this.Glyphs.sort($CreateAnonymousDelegate(this, function (a, b){
    return (a.Y-b.Y);
}));
        // defines the reserved y position of the columns
        var columns = [];
        columns.push(-3000);
        var accidentalSize = 21 * this.get_Scale();
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.Renderer = this.Renderer;
            g.DoLayout();
            // find column where glyph fits into
            // as long the glyph does not fit into the current column
            var gColumn = 0;
            while (columns[gColumn] > g.Y){
                // move to next column
                gColumn++;
                // and create the new column if needed
                if (gColumn == columns.length){
                    columns.push(-3000);
                }
            }
            // temporary save column as X
            g.X = gColumn;
            columns[gColumn] = g.Y + accidentalSize;
        }
        //
        // Place accidentals in columns
        //
        var columnWidth = 8 * this.get_Scale();
        if (this.Glyphs.length == 0){
            this.Width = 0;
        }
        else {
            this.Width = columnWidth * columns.length;
        }
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = this.Width - ((g.X + 1) * columnWidth);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph.NonReserved = -3000;
});
$Inherit(AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.BarNumberGlyph = function (x, y, number, hidden){
    this._number = 0;
    this._hidden = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._number = number;
    this._hidden = hidden;
};
AlphaTab.Rendering.Glyphs.BarNumberGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        if (this._hidden){
            return;
        }
        var res = this.Renderer.get_Resources();
        canvas.set_Color(res.BarNumberColor);
        canvas.set_Font(res.BarNumberFont);
        canvas.FillText(this._number.toString(), cx + this.X, cy + this.Y);
        canvas.set_Color(res.MainGlyphColor);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BarNumberGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BarSeperatorGlyph = function (x, y, isLast){
    this._isLast = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._isLast = isLast;
};
AlphaTab.Rendering.Glyphs.BarSeperatorGlyph.prototype = {
    DoLayout: function (){
        this.Width = (this._isLast ? 8 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.get_TopPadding();
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.get_BottomPadding();
        var left = ((cx + this.X)) | 0;
        var h = bottom - top;
        // line
        canvas.BeginPath();
        canvas.MoveTo(left, top);
        canvas.LineTo(left, bottom);
        canvas.Stroke();
        if (this._isLast){
            // big bar
            left += (((3 * this.get_Scale()) + 0.5)) | 0;
            canvas.FillRect(left, top, blockWidth, h);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BarSeperatorGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BeamGlyph = function (x, y, duration, direction, isGrace){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.BeamGlyph.GetSymbol(duration, direction, isGrace));
};
AlphaTab.Rendering.Glyphs.BeamGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    }
};
AlphaTab.Rendering.Glyphs.BeamGlyph.GetSymbol = function (duration, direction, isGrace){
    if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
        if (isGrace){
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
        }
        switch (duration){
            case AlphaTab.Model.Duration.Eighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
            case AlphaTab.Model.Duration.Sixteenth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixteenth;
            case AlphaTab.Model.Duration.ThirtySecond:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpThirtySecond;
            case AlphaTab.Model.Duration.SixtyFourth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixtyFourth;
            default:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
        }
    }
    else {
        if (isGrace){
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
        }
        switch (duration){
            case AlphaTab.Model.Duration.Eighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
            case AlphaTab.Model.Duration.Sixteenth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixteenth;
            case AlphaTab.Model.Duration.ThirtySecond:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownThirtySecond;
            case AlphaTab.Model.Duration.SixtyFourth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixtyFourth;
            default:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeamGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.BeatContainerGlyph = function (beat){
    this.Beat = null;
    this.PreNotes = null;
    this.OnNotes = null;
    this.PostNotes = null;
    this.Ties = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.Beat = beat;
    this.Ties = [];
};
AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype = {
    FinalizeGlyph: function (layout){
        this.PreNotes.FinalizeGlyph(layout);
        this.OnNotes.FinalizeGlyph(layout);
        this.PostNotes.FinalizeGlyph(layout);
    },
    RegisterMaxSizes: function (sizes){
        if (sizes.GetPreNoteSize(this.Beat.Start) < this.PreNotes.Width){
            sizes.SetPreNoteSize(this.Beat.Start, this.PreNotes.Width);
        }
        if (sizes.GetOnNoteSize(this.Beat.Start) < this.OnNotes.Width){
            sizes.SetOnNoteSize(this.Beat.Start, this.OnNotes.Width);
        }
        if (sizes.GetPostNoteSize(this.Beat.Start) < this.PostNotes.Width){
            sizes.SetPostNoteSize(this.Beat.Start, this.PostNotes.Width);
        }
    },
    ApplySizes: function (sizes){
        var size;
        var diff;
        size = sizes.GetPreNoteSize(this.Beat.Start);
        diff = size - this.PreNotes.Width;
        this.PreNotes.X = 0;
        if (diff > 0)
            this.PreNotes.ApplyGlyphSpacing(diff);
        size = sizes.GetOnNoteSize(this.Beat.Start);
        diff = size - this.OnNotes.Width;
        this.OnNotes.X = this.PreNotes.X + this.PreNotes.Width;
        if (diff > 0)
            this.OnNotes.ApplyGlyphSpacing(diff);
        size = sizes.GetPostNoteSize(this.Beat.Start);
        diff = size - this.PostNotes.Width;
        this.PostNotes.X = this.OnNotes.X + this.OnNotes.Width;
        if (diff > 0)
            this.PostNotes.ApplyGlyphSpacing(diff);
        this.Width = this.CalculateWidth();
    },
    CalculateWidth: function (){
        
        return this.PostNotes.X + this.PostNotes.Width;
    },
    DoLayout: function (){
        this.PreNotes.X = 0;
        this.PreNotes.Index = 0;
        this.PreNotes.Renderer = this.Renderer;
        this.PreNotes.Container = this;
        this.PreNotes.DoLayout();
        this.OnNotes.X = this.PreNotes.X + this.PreNotes.Width;
        this.OnNotes.Index = 1;
        this.OnNotes.Renderer = this.Renderer;
        this.OnNotes.Container = this;
        this.OnNotes.DoLayout();
        this.PostNotes.X = this.OnNotes.X + this.OnNotes.Width;
        this.PostNotes.Index = 2;
        this.PostNotes.Renderer = this.Renderer;
        this.PostNotes.Container = this;
        this.PostNotes.DoLayout();
        var i = this.Beat.Notes.length - 1;
        while (i >= 0){
            this.CreateTies(this.Beat.Notes[i--]);
        }
        this.Width = this.CalculateWidth();
    },
    CreateTies: function (n){
    },
    Paint: function (cx, cy, canvas){
        // canvas.Color = new Color(200, 0, 0, 100);
        // canvas.FillRect(cx + x, cy + y + 15 * Beat.Voice.Index, width, 10);
        // canvas.Font = new Font("Arial", 10);
        // canvas.Color = new Color(0, 0, 0);
        // canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);
        this.PreNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //canvas.Color = new Color(200, 0, 0, 100);
        //canvas.FillRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
        this.OnNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //canvas.Color new Color(0, 200, 0, 100);
        //canvas.FillRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
        this.PostNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //canvas.Color = new Color(0, 0, 200, 100);
        //canvas.FillRect(cx + X + PostNotes.X, cy + Y + PostNotes.Y + 20, PostNotes.Width, 10);
        for (var i = 0,j = this.Ties.length; i < j; i++){
            var t = this.Ties[i];
            t.Renderer = this.Renderer;
            t.Paint(cx, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatContainerGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BeatGlyphBase = function (){
    this.Container = null;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, 0, 0);
};
AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype = {
    DoLayout: function (){
        // left to right layout
        var w = 0;
        if (this.Glyphs != null){
            for (var i = 0,j = this.Glyphs.length; i < j; i++){
                var g = this.Glyphs[i];
                g.X = w;
                g.Renderer = this.Renderer;
                g.DoLayout();
                w += g.Width;
            }
        }
        this.Width = w;
    },
    NoteLoop: function (action){
        for (var i = this.Container.Beat.Notes.length - 1; i >= 0; i--){
            action(this.Container.Beat.Notes[i]);
        }
    },
    get_BeatDurationWidth: function (){
        switch (this.Container.Beat.Duration){
            case AlphaTab.Model.Duration.Whole:
                return 103;
            case AlphaTab.Model.Duration.Half:
                return 45;
            case AlphaTab.Model.Duration.Quarter:
                return 29;
            case AlphaTab.Model.Duration.Eighth:
                return 19;
            case AlphaTab.Model.Duration.Sixteenth:
                return 11;
            case AlphaTab.Model.Duration.ThirtySecond:
                return 11;
            case AlphaTab.Model.Duration.SixtyFourth:
                return 11;
            default:
                return 11;
        }
    },
    FinalizeGlyph: function (layout){
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatGlyphBase, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.BendGlyph = function (n, width, bendValueHeight){
    this._note = null;
    this._bendValueHeight = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._note = n;
    this.Width = width;
    this._bendValueHeight = bendValueHeight;
};
AlphaTab.Rendering.Glyphs.BendGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        // calculate offsets per step
        var dX = this.Width / 60;
        var maxValue = 0;
        for (var i = 0,j = this._note.BendPoints.length; i < j; i++){
            if (this._note.BendPoints[i].Value > maxValue){
                maxValue = this._note.BendPoints[i].Value;
            }
        }
        cx += this.X;
        cy += this.Y;
        canvas.BeginPath();
        for (var i = 0,j = this._note.BendPoints.length - 1; i < j; i++){
            var firstPt = this._note.BendPoints[i];
            var secondPt = this._note.BendPoints[i + 1];
            // draw pre-bend if previous 
            if (i == 0 && firstPt.Value != 0 && !this._note.IsTieDestination){
                this.PaintBend(new AlphaTab.Model.BendPoint(0, 0), firstPt, cx, cy, dX, canvas);
            }
            // don't draw a line if there's no offset and it's the last point
            if (firstPt.Value == secondPt.Value && i == this._note.BendPoints.length - 2)
                continue;
            this.PaintBend(firstPt, secondPt, cx, cy, dX, canvas);
        }
    },
    PaintBend: function (firstPt, secondPt, cx, cy, dX, canvas){
        var r = this.Renderer;
        var res = this.Renderer.get_Resources();
        var overflowOffset = r.get_LineOffset() / 2;
        var x1 = cx + (dX * firstPt.Offset);
        var y1 = cy - (this._bendValueHeight * firstPt.Value);
        if (firstPt.Value == 0){
            y1 += r.GetNoteY(this._note);
        }
        else {
            y1 += overflowOffset;
        }
        var x2 = cx + (dX * secondPt.Offset);
        var y2 = cy - (this._bendValueHeight * secondPt.Value);
        if (secondPt.Value == 0){
            y2 += r.GetNoteY(this._note);
        }
        else {
            y2 += overflowOffset;
        }
        if (firstPt.Value == secondPt.Value){
            // draw horizontal line
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x2, y2);
            canvas.Stroke();
        }
        else {
            if (x2 > x1){
                // draw bezier lien from first to second point
                canvas.MoveTo(x1, y1);
                canvas.BezierCurveTo(x2, y1, x2, y2, x2, y2);
                canvas.Stroke();
            }
            else {
                canvas.MoveTo(x1, y1);
                canvas.LineTo(x2, y2);
                canvas.Stroke();
            }
        }
        // what type of arrow? (up/down)
        var arrowSize = 6 * this.get_Scale();
        if (secondPt.Value > firstPt.Value){
            canvas.BeginPath();
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - arrowSize * 0.5, y2 + arrowSize);
            canvas.LineTo(x2 + arrowSize * 0.5, y2 + arrowSize);
            canvas.ClosePath();
            canvas.Fill();
        }
        else if (secondPt.Value != firstPt.Value){
            canvas.BeginPath();
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - arrowSize * 0.5, y2 - arrowSize);
            canvas.LineTo(x2 + arrowSize * 0.5, y2 - arrowSize);
            canvas.ClosePath();
            canvas.Fill();
        }
        canvas.Stroke();
        if (secondPt.Value != 0){
            var dV = secondPt.Value;
            var up = secondPt.Value > firstPt.Value;
            dV = Math.abs(dV);
            // calculate label
            var s = "";
            // Full Steps
            if (dV == 4 && up){
                s = "full";
                dV -= 4;
            }
            else if (dV >= 4){
                var steps = (dV / 4) | 0;
                s += steps;
                // Quaters
                dV -= steps * 4;
            }
            if (dV > 0){
                s += this.GetFractionSign(dV);
            }
            if (s != ""){
                if (!up){
                    s = "-" + s;
                }
                // draw label
                canvas.set_Font(res.TablatureFont);
                var size = canvas.MeasureText(s);
                var y = up ? y2 - res.TablatureFont.Size - (2 * this.get_Scale()) : y2 + (2 * this.get_Scale());
                var x = x2 - size / 2;
                canvas.FillText(s, x, y);
            }
        }
    },
    GetFractionSign: function (steps){
        switch (steps){
            case 1:
                return "¼";
            case 2:
                return "½";
            case 3:
                return "¾";
            default:
                return steps + "/ 4";
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BendGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.CircleGlyph = function (x, y, size){
    this._size = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._size = size;
};
AlphaTab.Rendering.Glyphs.CircleGlyph.prototype = {
    DoLayout: function (){
        this.Width = this._size + (3 * this.get_Scale());
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        canvas.FillCircle(cx + this.X, cy + this.Y, this._size);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.CircleGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ClefGlyph = function (x, y, clef){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ClefGlyph.GetSymbol(clef));
};
AlphaTab.Rendering.Glyphs.ClefGlyph.prototype = {
    DoLayout: function (){
        this.Width = 28 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
AlphaTab.Rendering.Glyphs.ClefGlyph.GetSymbol = function (clef){
    switch (clef){
        case AlphaTab.Model.Clef.Neutral:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefNeutral;
        case AlphaTab.Model.Clef.C3:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefC;
        case AlphaTab.Model.Clef.C4:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefC;
        case AlphaTab.Model.Clef.F4:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefF;
        case AlphaTab.Model.Clef.G2:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefG;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ClefGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.CrescendoGlyph = function (x, y, crescendo){
    this._crescendo = AlphaTab.Model.CrescendoType.None;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._crescendo = crescendo;
};
AlphaTab.Rendering.Glyphs.CrescendoGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var height = 17 * this.get_Scale();
        canvas.BeginPath();
        if (this._crescendo == AlphaTab.Model.CrescendoType.Crescendo){
            canvas.MoveTo(cx + this.X + this.Width, cy + this.Y);
            canvas.LineTo(cx + this.X, cy + this.Y + (height / 2));
            canvas.LineTo(cx + this.X + this.Width, cy + this.Y + height);
        }
        else {
            canvas.MoveTo(cx + this.X, cy + this.Y);
            canvas.LineTo(cx + this.X + this.Width, cy + this.Y + (height / 2));
            canvas.LineTo(cx + this.X, cy + this.Y + height);
        }
        canvas.Stroke();
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.CrescendoGlyph.Height = 17;
});
$Inherit(AlphaTab.Rendering.Glyphs.CrescendoGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteDead);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DigitGlyph = function (x, y, digit){
    this._digit = 0;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.DigitGlyph.GetSymbol(digit));
    this._digit = digit;
};
AlphaTab.Rendering.Glyphs.DigitGlyph.prototype = {
    DoLayout: function (){
        this.Y += 7 * this.get_Scale();
        this.Width = this.GetDigitWidth(this._digit) * this.get_Scale();
    },
    GetDigitWidth: function (digit){
        switch (digit){
            case 0:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                return 14;
            case 1:
                return 10;
            default:
                return 0;
        }
    },
    get_CanScale: function (){
        return false;
    }
};
AlphaTab.Rendering.Glyphs.DigitGlyph.GetSymbol = function (digit){
    switch (digit){
        case 0:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num0;
        case 1:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num1;
        case 2:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num2;
        case 3:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num3;
        case 4:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num4;
        case 5:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num5;
        case 6:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num6;
        case 7:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num7;
        case 8:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num8;
        case 9:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num9;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DigitGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DrumSticksGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteSideStick);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DrumSticksGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DrumSticksGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DynamicsGlyph = function (x, y, dynamics){
    this._dynamics = AlphaTab.Model.DynamicValue.PPP;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._dynamics = dynamics;
};
AlphaTab.Rendering.Glyphs.DynamicsGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var glyphs;
        switch (this._dynamics){
            case AlphaTab.Model.DynamicValue.PPP:
                glyphs = [this.get_P(), this.get_P(), this.get_P()];
                break;
            case AlphaTab.Model.DynamicValue.PP:
                glyphs = [this.get_P(), this.get_P()];
                break;
            case AlphaTab.Model.DynamicValue.P:
                glyphs = [this.get_P()];
                break;
            case AlphaTab.Model.DynamicValue.MP:
                glyphs = [this.get_M(), this.get_P()];
                break;
            case AlphaTab.Model.DynamicValue.MF:
                glyphs = [this.get_M(), this.get_F()];
                break;
            case AlphaTab.Model.DynamicValue.F:
                glyphs = [this.get_F()];
                break;
            case AlphaTab.Model.DynamicValue.FF:
                glyphs = [this.get_F(), this.get_F()];
                break;
            case AlphaTab.Model.DynamicValue.FFF:
                glyphs = [this.get_F(), this.get_F(), this.get_F()];
                break;
            default:
                return;
        }
        var glyphWidth = 0;
        for (var $i20 = 0,$l20 = glyphs.length,g = glyphs[$i20]; $i20 < $l20; $i20++, g = glyphs[$i20]){
            glyphWidth += g.Width;
        }
        var startX = (this.Width - glyphWidth) / 2;
        for (var $i21 = 0,$l21 = glyphs.length,g = glyphs[$i21]; $i21 < $l21; $i21++, g = glyphs[$i21]){
            g.X = startX;
            g.Y = 0;
            g.Renderer = this.Renderer;
            g.Paint(cx + this.X, cy + this.Y, canvas);
            startX += g.Width;
        }
    },
    get_P: function (){
        var p = new AlphaTab.Rendering.Glyphs.MusicFontGlyph(0, 0, 0.8, AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicP);
        p.Width = 7 * this.get_Scale();
        return p;
    },
    get_M: function (){
        var m = new AlphaTab.Rendering.Glyphs.MusicFontGlyph(0, 0, 0.8, AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicM);
        m.Width = 7 * this.get_Scale();
        return m;
    },
    get_F: function (){
        var f = new AlphaTab.Rendering.Glyphs.MusicFontGlyph(0, 0, 0.8, AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicF);
        f.Width = 7 * this.get_Scale();
        return f;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.DynamicsGlyph.GlyphScale = 0.8;
});
$Inherit(AlphaTab.Rendering.Glyphs.DynamicsGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.FadeInGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.FadeInGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var size = 6 * this.get_Scale();
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X, cy + this.Y);
        canvas.QuadraticCurveTo(cx + this.X + (this.Width / 2), cy + this.Y, cx + this.X + this.Width, cy + this.Y - size);
        canvas.MoveTo(cx + this.X, cy + this.Y);
        canvas.QuadraticCurveTo(cx + this.X + (this.Width / 2), cy + this.Y, cx + this.X + this.Width, cy + this.Y + size);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.FadeInGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.FlatGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalFlat);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.FlatGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.FlatGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.HiHatGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHiHat);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.HiHatGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.HiHatGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.SvgCommand = function (){
    this.Cmd = null;
    this.Numbers = null;
};
AlphaTab.Rendering.Glyphs.LazySvg = function (raw){
    this._raw = null;
    this._parsed = null;
    this._raw = raw;
};
AlphaTab.Rendering.Glyphs.LazySvg.prototype = {
    get_Commands: function (){
        if (this._parsed == null)
            this.Parse();
        return this._parsed;
    },
    Parse: function (){
        var parser = new AlphaTab.Rendering.Utils.SvgPathParser(this._raw);
        parser.Reset();
        this._parsed = [];
        while (!parser.get_Eof()){
            var command = new AlphaTab.Rendering.Glyphs.SvgCommand();
            this._parsed.push(command);
            command.Cmd = parser.GetString();
            switch (command.Cmd){
                case "M":
                    command.Numbers = [];
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    break;
                case "m":
                    command.Numbers = [];
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    break;
                case "Z":
                case "z":
                    break;
                case "L":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "l":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "V":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "v":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "H":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "h":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "C":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "c":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "S":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "s":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "Q":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "q":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "T":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
                case "t":
                    command.Numbers = [];
                    do{
                    command.Numbers.push(parser.GetNumber());
                    command.Numbers.push(parser.GetNumber());
                }
                    while (parser.get_CurrentTokenIsNumber())
                    break;
            }
        }
        this._raw = null;
        // not needed anymore.
    }
};
AlphaTab.Rendering.Glyphs.LineRangedGlyph = function (x, y, label){
    this._isExpanded = false;
    this._label = null;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._label = label;
};
AlphaTab.Rendering.Glyphs.LineRangedGlyph.prototype = {
    ExpandTo: function (beat){
        this._isExpanded = true;
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.EffectFont);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
        var textWidth = canvas.MeasureText(this._label);
        canvas.FillText(this._label, cx + this.X, cy + this.Y);
        // check if we need lines
        if (this._isExpanded){
            var lineSpacing = 3 * this.get_Scale();
            var startX = cx + this.X + textWidth + lineSpacing;
            var endX = cx + this.X + this.Width - lineSpacing - lineSpacing;
            var lineY = cy + this.Y + (8 * this.get_Scale());
            var lineSize = 8 * this.get_Scale();
            if (endX > startX){
                var lineX = startX;
                while (lineX < endX){
                    canvas.BeginPath();
                    canvas.MoveTo(lineX, lineY | 0);
                    canvas.LineTo(Math.min(lineX + lineSize, endX), lineY | 0);
                    lineX += lineSize + lineSpacing;
                    canvas.Stroke();
                }
                canvas.BeginPath();
                canvas.MoveTo(endX, ((lineY - 6 * this.get_Scale())) | 0);
                canvas.LineTo(endX, ((lineY + 6 * this.get_Scale())) | 0);
                canvas.Stroke();
            }
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineSpacing = 3;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineTopPadding = 8;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineTopOffset = 6;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineSize = 8;
});
$Inherit(AlphaTab.Rendering.Glyphs.LineRangedGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.MusicFont = function (){
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.MusicFont.ClefF = new AlphaTab.Rendering.Glyphs.LazySvg("M 545 -801c -53 49 -80 109 -80 179c 0 33 4 66 12 99c 8 33 38 57 89 74c 51 16 125 31 220 43c 95 12 159 53 192 124c 16 37 24 99 24 186c 0 95 -43 168 -130 220c -86 51 -186 77 -297 77c -128 0 -229 -28 -303 -86c -91 -70 -136 -169 -136 -297c 0 -115 23 -234 71 -356c 47 -121 118 -234 213 -337c 70 -74 163 -129 279 -164c 115 -35 233 -52 353 -52c 45 0 83 1 114 3c 31 2 81 9 151 21c 243 45 444 175 601 390c 144 198 217 409 217 632c 0 41 -2 72 -6 93c -33 281 -219 582 -558 905c -272 260 -591 493 -954 700c -330 190 -527 274 -589 254l -18 -68c 95 -33 197 -78 306 -136c 109 -57 218 -124 325 -198c 276 -198 477 -384 601 -558c 152 -210 252 -471 297 -781c 20 -128 31 -210 31 -248s 0 -68 0 -93c 0 -322 -109 -551 -328 -688c -99 -57 -200 -86 -303 -86c -78 0 -154 15 -226 46C 643 -873 586 -838 545 -801zM 2517 -783c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 -760 2451 -783 2517 -783zM 2517 54c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 77 2451 54 2517 54");
    AlphaTab.Rendering.Glyphs.MusicFont.ClefC = new AlphaTab.Rendering.Glyphs.LazySvg("M 26 1736V -1924h 458v 3659H 26zM 641 1736V -1924h 150v 3659H 641zM 1099 153c -42 -53 -86 -100 -130 -140c -44 -40 -95 -75 -153 -106c 106 -58 200 -135 279 -233c 110 -135 180 -289 208 -460c 17 127 46 216 87 266c 65 73 170 110 313 110c 150 0 259 -81 324 -244c 50 -124 75 -291 75 -500c 0 -197 -25 -355 -75 -471c -69 -155 -179 -232 -330 -232c -89 0 -167 18 -234 55c -67 36 -101 72 -101 107c 0 19 23 25 69 17c 46 -7 97 6 153 43c 56 36 84 89 84 159c 0 69 -23 125 -69 168c -46 42 -108 63 -185 63c -73 0 -138 -24 -194 -72c -56 -48 -84 -105 -84 -171c 0 -112 56 -212 168 -301c 127 -100 282 -150 463 -150c 228 0 412 74 553 224c 141 149 211 334 211 555c 0 248 -86 458 -258 631c -172 172 -381 259 -629 259c -57 0 -104 -3 -139 -11c -54 -19 -98 -34 -133 -46c -15 49 -48 99 -98 149c -11 15 -48 43 -110 85c 38 19 75 52 110 99c 50 50 88 105 115 164c 65 -31 113 -50 142 -57c 28 -7 70 -11 124 -11c 247 0 457 85 629 257c 172 171 258 380 258 627c 0 211 -73 390 -219 534c -146 144 -332 216 -558 216c -183 0 -334 -47 -453 -142c -118 -94 -178 -198 -178 -310c 0 -69 28 -128 84 -176c 56 -48 120 -72 194 -72c 69 0 129 23 179 69c 50 46 75 104 75 174c 0 65 -28 116 -84 153c -56 36 -107 51 -153 43c -46 -7 -69 0 -69 23c 0 27 35 60 106 101c 70 40 147 60 229 60c 153 0 265 -77 335 -231c 51 -112 76 -268 76 -469c 0 -201 -25 -363 -75 -487c -65 -166 -172 -249 -319 -249c -143 0 -242 30 -298 92c -56 61 -93 156 -113 284C 1279 435 1211 286 1099 153");
    AlphaTab.Rendering.Glyphs.MusicFont.RestThirtySecond = new AlphaTab.Rendering.Glyphs.LazySvg("M 717 -2195c 93 -30 174 -104 244 -220c 38 -65 65 -127 81 -185l 140 -604c -69 128 -196 191 -381 191c -50 0 -105 -7 -167 -23c -61 -15 -113 -46 -155 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168s 104 -69 173 -69c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -86 87c 23 11 48 21 75 28c 7 0 27 -3 57 -11c 73 -23 142 -80 208 -170c 57 -90 115 -180 173 -270h 40l -816 3503l -107 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 46 15 71 23 74 23c 7 0 26 -3 57 -11c 92 -27 178 -108 259 -243c 11 -19 26 -50 46 -93l 161 -667c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 23 7 46 15 69 23C 665 -2184 686 -2187 717 -2195");
    AlphaTab.Rendering.Glyphs.MusicFont.RestQuarter = new AlphaTab.Rendering.Glyphs.LazySvg("M 272 -1668L 979 -850c -54 23 -137 114 -249 272c -127 177 -191 313 -191 405c 0 112 36 226 110 342c 73 115 160 206 260 272l -34 81c -23 -3 -56 -7 -101 -11c -44 -3 -76 -5 -95 -5c -104 0 -182 9 -234 28c -52 19 -88 45 -110 78c -21 32 -31 70 -31 113c 0 81 42 175 127 284c 69 88 115 137 139 145l -28 46c -27 7 -123 -61 -289 -208c -185 -162 -278 -299 -278 -411c 0 -92 35 -168 107 -226c 71 -57 159 -87 263 -87c 54 0 109 7 165 23c 55 15 110 42 165 81l -642 -829c 54 -30 120 -107 199 -229c 79 -121 139 -238 182 -350c 7 -15 11 -42 11 -81c 0 -92 -44 -210 -133 -353c -73 -115 -121 -181 -144 -197H 272");
    AlphaTab.Rendering.Glyphs.MusicFont.GraceUp = new AlphaTab.Rendering.Glyphs.LazySvg("M 571 -1659h 53c 12 83 29 154 50 210c 21 56 46 105 74 145c 28 40 71 92 128 156c 56 63 102 118 138 162c 105 135 158 277 158 424c 0 151 -64 336 -193 554h -35c 16 -37 35 -82 57 -132s 40 -95 55 -136s 26 -81 35 -121s 12 -80 12 -119c 0 -62 -12 -125 -38 -188c -25 -63 -60 -121 -106 -175c -45 -53 -97 -97 -155 -130s -118 -51 -181 -55v 1245c 0 70 -21 134 -65 189c -43 55 -99 97 -167 127c -67 29 -135 44 -201 44c -64 0 -118 -16 -160 -48c -42 -32 -63 -79 -63 -140c 0 -65 21 -126 64 -181s 97 -99 163 -131c 65 -32 129 -48 191 -48c 85 0 147 16 184 50V -1082V -1659");
    AlphaTab.Rendering.Glyphs.MusicFont.GraceDown = new AlphaTab.Rendering.Glyphs.LazySvg("M -17 335c 0 -69 23 -131 69 -186s 103 -98 173 -128c 69 -30 137 -45 203 -45c 133 0 203 63 211 189c 0 54 -21 110 -65 167c -43 56 -99 103 -168 139s -138 54 -208 54c -63 0 -118 -14 -164 -44v 1104c 90 -15 172 -50 244 -106s 128 -122 168 -200c 40 -78 60 -156 60 -233c -1 -91 -13 -169 -34 -233c -20 -64 -57 -155 -110 -272l 34 -13c 34 60 64 122 91 188c 27 65 48 131 64 199s 23 133 23 198c 0 96 -22 183 -68 259c -45 76 -113 166 -203 269c -89 103 -157 193 -203 271c -45 77 -68 165 -68 264h -50V 335");
    AlphaTab.Rendering.Glyphs.MusicFont.Trill = new AlphaTab.Rendering.Glyphs.LazySvg("M 159 862l 148 -431h -291l 33 -97h 288l 61 -196l 190 -136h 56l -114 332c 40 0 100 -7 181 -22c 81 -15 143 -22 187 -22c 26 0 45 5 56 15c 11 10 16 29 16 57c 0 8 -3 37 -11 86c 72 -106 155 -160 246 -160c 72 8 110 50 114 126c 0 42 -9 73 -28 92s -40 28 -64 28c -48 0 -76 -29 -84 -87c 10 -22 16 -43 16 -64c 0 -11 -9 -17 -28 -17c -78 0 -147 86 -207 260l -131 406h -185l 34 -92c -21 9 -53 26 -94 51s -77 44 -108 58s -64 20 -100 20c -50 0 -95 -13 -133 -40c -38 -27 -59 -63 -61 -107c 1 -7 3 -18 5 -32S 157 867 159 862zM 658 837l 140 -412c 0 -4 0 -9 2 -16s 2 -10 2 -11c 0 -9 -7 -13 -22 -13c -34 0 -81 7 -140 21s -104 21 -136 21l -142 423c -6 23 -12 44 -17 64c 0 27 16 44 50 50C 444 958 532 916 658 837");
    AlphaTab.Rendering.Glyphs.MusicFont.ClefG = new AlphaTab.Rendering.Glyphs.LazySvg("M 1431 -3070c 95 0 186 114 272 344c 86 229 129 434 129 612c 0 243 -36 471 -108 684c -103 300 -271 545 -504 735l 108 564c 68 -15 132 -22 193 -22c 284 0 504 109 659 329c 132 185 199 410 199 675c 0 204 -65 379 -195 525c -130 145 -299 243 -506 292l 154 816c 0 45 0 77 0 96c 0 152 -54 282 -162 390s -244 181 -407 219c -26 7 -62 11 -108 11c -155 0 -294 -62 -416 -188c -121 -125 -182 -252 -182 -381c 0 -22 1 -39 5 -51c 18 -106 64 -191 136 -253c 72 -62 161 -94 267 -94c 102 0 191 34 267 102c 76 68 113 152 113 250c 0 106 -35 198 -105 276c -70 77 -160 116 -270 116c -26 0 -45 0 -56 0c 42 36 82 63 120 82c 72 36 143 54 212 54c 114 0 235 -62 362 -187c 94 -98 142 -214 142 -347c 0 -19 -1 -55 -3 -108l -138 -776c -49 11 -104 19 -165 23c -61 3 -123 5 -188 5c -339 0 -635 -123 -886 -370c -251 -247 -377 -543 -377 -889c 0 -193 87 -429 262 -706c 117 -189 285 -402 501 -638c 159 -174 254 -271 285 -290c -19 -37 -44 -142 -77 -313c -32 -171 -52 -284 -59 -339c -7 -55 -11 -111 -11 -168c 0 -235 54 -475 163 -718C 1164 -2948 1289 -3070 1431 -3070zM 1247 -129l -96 -507c -41 30 -116 104 -222 222c -106 117 -190 216 -251 296c -110 140 -194 269 -251 387c -76 155 -114 307 -114 455c 0 79 11 159 34 239c 49 167 182 326 400 478c 175 121 360 182 554 182c 53 0 96 -3 127 -11c 30 -7 80 -23 150 -46l -281 -1343c -178 22 -312 106 -403 250c -72 113 -107 237 -107 370c 0 144 80 281 240 410c 137 110 248 165 332 165l -8 39c -106 -15 -227 -70 -364 -164c -186 -132 -298 -291 -336 -477c -11 -56 -17 -111 -17 -164c 0 -185 56 -351 168 -496C 911 12 1060 -83 1247 -129zM 1684 -2306c -19 -125 -34 -201 -46 -227c -34 -76 -92 -113 -172 -113c -76 0 -157 82 -241 247c -84 165 -143 344 -178 538c -7 49 -1 156 17 322c 19 165 36 272 52 322l 132 -113c 91 -45 197 -176 315 -393c 88 -159 132 -313 132 -461C 1695 -2213 1692 -2253 1684 -2306zM 1388 225l 262 1304c 157 -37 282 -114 375 -229c 92 -115 138 -250 138 -405c 0 -30 0 -52 0 -68c -19 -177 -93 -322 -224 -433c -130 -111 -281 -167 -453 -167C 1443 225 1411 225 1388 225");
    AlphaTab.Rendering.Glyphs.MusicFont.Num0 = new AlphaTab.Rendering.Glyphs.LazySvg("M 0 991c 0 -230 45 -422 135 -577c 104 -183 253 -275 448 -275c 187 0 333 91 437 275c 89 158 135 351 135 577c 0 230 -43 422 -129 577c -104 183 -252 275 -442 275c -187 0 -334 -91 -442 -275C 46 1411 0 1218 0 991zM 583 230c -100 0 -168 72 -202 218c -34 145 -51 326 -51 542c 0 270 23 464 70 583c 46 118 108 178 183 178c 93 0 162 -88 205 -264c 32 -133 48 -298 48 -496c 0 -273 -23 -468 -70 -585C 719 288 658 230 583 230");
    AlphaTab.Rendering.Glyphs.MusicFont.Num1 = new AlphaTab.Rendering.Glyphs.LazySvg("M 345 1688V 440l -216 410l -37 -32l 253 -685h 351v 1549c 0 32 27 57 81 75c 18 3 46 8 86 16v 75h -685v -70c 35 -7 62 -12 81 -16C 316 1745 345 1720 345 1688");
    AlphaTab.Rendering.Glyphs.MusicFont.Num2 = new AlphaTab.Rendering.Glyphs.LazySvg("M 427 257c -93 10 -153 37 -178 81c 7 14 14 27 21 37c 68 0 115 7 140 21c 54 28 81 86 81 172c 0 61 -21 113 -64 156s -93 64 -151 64c -61 0 -113 -19 -156 -59c -43 -39 -64 -91 -64 -156c 0 -118 50 -221 151 -307c 100 -86 214 -129 340 -129c 169 0 311 36 426 108c 136 86 205 203 205 351c 0 129 -78 244 -236 345c -132 75 -263 153 -391 232c -78 61 -146 129 -204 205c -25 35 -50 73 -75 113c 110 -64 211 -97 300 -97c 64 0 130 18 198 54c 39 18 87 52 145 102c 46 39 82 59 107 59c 82 0 137 -35 166 -105c 7 -21 12 -57 16 -110h 43c 0 120 -18 216 -54 288c -54 106 -147 160 -280 160c -100 0 -206 -37 -315 -110c -109 -73 -200 -110 -272 -110c -108 0 -178 27 -210 81c -14 64 -23 102 -27 113h -70c 3 -36 8 -70 16 -102c 7 -32 27 -79 59 -140c 46 -93 151 -221 313 -383c 313 -313 469 -505 469 -577C 876 376 726 257 427 257");
    AlphaTab.Rendering.Glyphs.MusicFont.Num3 = new AlphaTab.Rendering.Glyphs.LazySvg("M 414 1024v -59c 21 0 47 -5 76 -16c 113 -39 193 -77 240 -113c 72 -57 109 -129 109 -216c 0 -111 -35 -204 -106 -278c -70 -73 -149 -110 -237 -110c -112 0 -194 32 -245 97c 3 18 8 34 16 48c 72 0 120 16 145 48c 25 32 37 75 37 129c 0 118 -66 178 -199 178c -57 0 -102 -16 -135 -48c -32 -32 -48 -84 -48 -156c 0 -126 44 -223 132 -291c 88 -68 231 -102 429 -102c 133 0 251 47 353 143c 102 95 153 211 153 348c 0 100 -21 177 -64 229c -43 52 -111 98 -205 137c 86 35 149 77 189 124c 54 64 81 147 81 248c 0 133 -51 247 -153 342c -102 95 -220 143 -353 143c -194 0 -336 -34 -426 -102c -90 -68 -135 -165 -135 -291c 0 -75 15 -128 45 -159c 30 -30 78 -45 143 -45c 129 0 194 59 194 178c 0 57 -12 101 -37 132c -25 30 -75 45 -151 45c 3 21 8 45 16 70c 61 46 135 70 221 70c 82 0 160 -36 232 -108c 72 -72 108 -163 108 -275c 0 -82 -36 -153 -108 -210c -54 -43 -135 -82 -243 -118L 414 1024");
    AlphaTab.Rendering.Glyphs.MusicFont.Num4 = new AlphaTab.Rendering.Glyphs.LazySvg("M 897 133c -86 147 -174 296 -264 445c -90 149 -162 258 -216 326l -302 469h 448v -556l 378 -318v 874h 162v 75h -162c 0 39 0 81 2 124c 1 43 6 78 13 105c 7 27 39 53 97 78c 7 3 23 8 48 16v 75h -712v -75c 32 -10 55 -18 70 -21c 54 -21 82 -43 86 -64c 3 -18 6 -51 8 -99c 1 -48 4 -94 8 -137h -588v -75c 158 -111 279 -288 361 -529c 43 -237 88 -475 135 -712H 897");
    AlphaTab.Rendering.Glyphs.MusicFont.Num5 = new AlphaTab.Rendering.Glyphs.LazySvg("M 122 133c 10 7 63 18 159 35c 95 16 177 24 245 24c 89 0 171 -5 245 -16c 73 -10 139 -23 197 -37c 0 61 -8 112 -24 153c -16 41 -47 78 -94 110c -21 14 -62 27 -121 37c -59 10 -112 16 -159 16c -72 0 -145 -5 -221 -16c -75 -10 -117 -21 -124 -32v 475c 93 -104 197 -156 313 -156c 158 0 286 43 383 130c 97 86 145 198 145 336c 0 173 -61 325 -183 455c -122 130 -266 195 -432 195c -39 0 -68 -1 -86 -5c -86 -14 -154 -43 -205 -86c -72 -61 -108 -156 -108 -286c 0 -61 16 -109 48 -145c 32 -36 82 -54 151 -54c 136 0 205 64 205 194c 0 108 -43 169 -129 183c -25 10 -50 23 -75 37c 32 32 68 54 108 67c 39 12 79 18 118 18c 93 0 170 -45 232 -135c 61 -90 91 -219 91 -385c 0 -112 -27 -209 -81 -290c -54 -81 -127 -122 -221 -122c -118 0 -210 54 -275 162h -102V 133");
    AlphaTab.Rendering.Glyphs.MusicFont.Num6 = new AlphaTab.Rendering.Glyphs.LazySvg("M 871 305c -7 -11 -12 -22 -16 -34c -57 -52 -118 -79 -183 -79c -32 0 -63 7 -91 21c -64 36 -114 110 -148 224c -34 113 -51 227 -51 342c 0 165 19 253 59 264c 75 -108 185 -162 332 -162c 110 0 201 52 273 156c 60 89 91 190 91 302c 0 154 -47 278 -143 369c -95 91 -213 137 -353 137c -190 0 -341 -89 -450 -267c -109 -178 -164 -382 -164 -612c 0 -208 64 -399 194 -572c 129 -172 279 -259 448 -259c 158 0 273 49 345 147c 50 69 75 148 75 239c 0 54 -19 103 -59 147c -39 43 -79 65 -118 65c -68 0 -122 -16 -162 -48c -39 -32 -59 -86 -59 -162c 0 -68 21 -121 64 -159C 795 330 835 309 871 305zM 849 1391c 0 -129 -9 -221 -27 -275c -32 -93 -91 -140 -178 -140c -82 0 -137 38 -164 116c -27 77 -40 177 -40 299c 0 108 14 199 43 275c 28 75 82 113 162 113c 72 0 124 -39 156 -118C 833 1582 849 1492 849 1391");
    AlphaTab.Rendering.Glyphs.MusicFont.Num7 = new AlphaTab.Rendering.Glyphs.LazySvg("M 313 1850c 10 -86 23 -172 37 -259c 43 -172 118 -313 226 -421c 122 -118 217 -221 286 -307c 90 -111 142 -201 156 -270l 27 -124c -46 30 -96 56 -148 79c -52 22 -103 34 -153 34c -93 0 -206 -40 -340 -122c -64 -40 -120 -61 -167 -61c -57 0 -98 17 -121 51c -23 34 -42 65 -56 94h -64v -356h 54c 7 21 16 44 27 67c 10 23 30 35 59 35c 25 0 62 -16 113 -48c 108 -72 185 -108 232 -108c 75 0 149 26 221 78c 72 52 140 78 205 78c 46 0 82 -22 108 -67c 10 -18 19 -48 27 -89h 70v 340c 0 107 -17 206 -52 295c -10 25 -87 159 -231 403c -35 64 -60 142 -76 234c -15 91 -23 178 -23 260c 0 114 0 175 0 182H 313");
    AlphaTab.Rendering.Glyphs.MusicFont.Num8 = new AlphaTab.Rendering.Glyphs.LazySvg("M 795 905c 57 18 126 77 205 178c 64 79 97 151 97 216c 0 183 -57 324 -172 421c -97 82 -214 124 -351 124c -151 0 -276 -49 -375 -148c -99 -99 -148 -231 -148 -396c 0 -68 34 -138 102 -210c 50 -54 106 -93 167 -118c -72 -39 -127 -94 -167 -164c -39 -70 -59 -144 -59 -224c 0 -136 48 -244 145 -324c 97 -79 208 -118 334 -118c 133 0 245 40 337 121s 137 195 137 342c 0 57 -32 120 -97 189C 901 845 849 883 795 905zM 389 1040c -57 28 -102 61 -135 97c -46 54 -70 118 -70 194c 0 108 35 204 106 288c 71 84 165 126 282 126c 106 0 185 -24 238 -72s 79 -103 79 -164c 0 -39 -26 -88 -80 -145c -53 -57 -112 -106 -176 -145c -64 -39 -124 -81 -179 -124C 437 1079 415 1061 389 1040zM 708 835c 46 -18 89 -53 126 -105c 37 -52 56 -107 56 -164c 0 -100 -28 -183 -86 -248c -57 -64 -136 -97 -237 -97c -79 0 -145 26 -197 78c -52 52 -78 112 -78 180c 0 36 25 75 75 118c 25 21 72 54 143 97c 70 43 121 77 153 102C 676 808 690 820 708 835");
    AlphaTab.Rendering.Glyphs.MusicFont.Num9 = new AlphaTab.Rendering.Glyphs.LazySvg("M 333 1682c 3 10 9 21 16 32c 57 50 118 75 183 75c 32 0 62 -7 91 -21c 68 -36 117 -107 148 -213c 30 -106 45 -222 45 -348c 0 -169 -18 -259 -54 -270c -75 111 -185 167 -329 167c -111 0 -200 -48 -267 -146c -66 -97 -99 -202 -99 -315c 0 -155 47 -279 143 -372c 95 -92 215 -138 359 -138c 190 0 343 93 459 280c 100 165 151 365 151 599c 0 208 -64 399 -194 572s -279 259 -448 259c -158 0 -273 -48 -345 -145c -50 -68 -75 -147 -75 -237c 0 -54 19 -102 59 -145c 39 -43 86 -64 140 -64c 61 0 109 16 145 48c 35 32 54 86 54 162c 0 68 -25 124 -75 167C 405 1661 369 1679 333 1682zM 354 594c 0 130 8 222 27 277c 32 94 89 141 172 141c 82 0 138 -40 167 -122c 28 -81 43 -180 43 -296c 0 -112 -12 -199 -37 -261c -36 -86 -93 -130 -172 -130c -75 0 -127 38 -156 114C 369 393 354 486 354 594");
    AlphaTab.Rendering.Glyphs.MusicFont.RestSixteenth = new AlphaTab.Rendering.Glyphs.LazySvg("M 494 -1275c 76 -27 149 -91 218 -191c 23 -31 51 -81 86 -151l 161 -667c -73 128 -198 192 -374 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 19 7 40 15 63 23c 15 0 38 -5 69 -17c 73 -23 140 -79 202 -167c 61 -88 121 -177 179 -267h 40l -602 2586l -106 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 45 15 72 23 80 23C 465 -1269 482 -1271 494 -1275");
    AlphaTab.Rendering.Glyphs.MusicFont.RestEighth = new AlphaTab.Rendering.Glyphs.LazySvg("M 247 -1725c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 27 -9 60 -28 98c -19 38 -48 69 -86 92c 23 7 46 15 69 23c 15 0 38 -5 69 -17c 88 -31 175 -113 260 -246c 38 -62 77 -125 115 -188h 40l -382 1670l -112 0l 331 -1316c -73 128 -198 191 -375 191c -19 0 -38 0 -57 0c -27 -3 -69 -13 -127 -28c -57 -15 -106 -46 -147 -92c -40 -46 -60 -106 -60 -179c 0 -69 23 -127 69 -174S 178 -1725 247 -1725");
    AlphaTab.Rendering.Glyphs.MusicFont.RestWhole = new AlphaTab.Rendering.Glyphs.LazySvg("M 1046 445H -25v -458h 1071V 445");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteWhole = new AlphaTab.Rendering.Glyphs.LazySvg("M 0 437c 0 -109 40 -197 121 -265s 177 -115 290 -143s 216 -41 312 -41c 104 0 213 13 328 41s 214 74 298 141s 128 156 133 266c 0 110 -40 199 -121 268s -177 117 -290 145s -219 43 -319 43c -107 0 -218 -13 -332 -41s -211 -75 -293 -144S 2 550 0 437zM 450 361c 7 133 46 243 118 330s 158 130 259 130c 77 -8 131 -34 161 -77s 44 -117 44 -224c -10 -137 -51 -248 -123 -333s -159 -127 -262 -127c -72 11 -123 37 -152 78S 450 253 450 361");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteQuarter = new AlphaTab.Rendering.Glyphs.LazySvg("M 658 800c -108 65 -216 98 -324 98c -119 0 -216 -42 -289 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 228 -208c 111 -69 223 -104 335 -104c 108 0 200 36 278 110c 57 57 86 131 86 220c 0 92 -31 185 -92 278C 827 673 750 746 658 800");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteHalf = new AlphaTab.Rendering.Glyphs.LazySvg("M 669 818c -108 65 -216 98 -324 98c -119 0 -216 -42 -290 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 229 -208c 112 -69 224 -104 336 -104c 108 0 200 36 278 110c 57 57 87 131 87 220c 0 92 -31 185 -92 278C 839 691 762 764 669 818zM 95 754c 19 23 57 34 115 34c 65 0 132 -13 200 -40c 67 -27 134 -64 200 -113c 65 -48 127 -118 185 -208s 87 -169 87 -234c 0 -23 -5 -44 -17 -63c -11 -15 -34 -23 -69 -23c -46 0 -113 18 -200 55c -87 36 -164 77 -231 121c -67 44 -133 110 -197 197s -95 159 -95 217C 72 720 79 739 95 754");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteDead = new AlphaTab.Rendering.Glyphs.LazySvg("M 482 345c 42 -15 70 -38 84 -69c 13 -30 20 -102 20 -214c 0 -30 0 -50 0 -57c 0 -3 0 -7 0 -11h 307v 313c -31 0 -54 0 -69 0c -38 0 -77 1 -115 2c -38 2 -72 8 -101 20c -28 11 -51 38 -66 81v 81c 15 42 38 70 69 84c 30 13 102 20 214 20c 30 0 50 0 57 0c 3 0 7 0 11 0v 313h -307c 0 -31 0 -54 0 -69c 0 -38 -1 -77 -2 -115c -2 -38 -8 -72 -20 -101c -11 -28 -38 -51 -81 -66h -104c -42 15 -70 38 -84 69c -13 30 -20 102 -20 214c 0 30 0 50 0 57c 0 3 0 7 0 11h -307V 595c 30 0 54 0 69 0c 38 0 77 -1 115 -2c 38 -2 72 -8 101 -20c 28 -11 51 -38 66 -81v -81c -15 -42 -38 -70 -69 -84c -31 -13 -102 -20 -214 -20c -31 0 -50 0 -57 0c -3 0 -7 0 -11 0v -313h 307c 0 31 0 54 0 69c 0 38 0 77 2 115c 1 38 8 72 20 101c 11 28 38 51 81 66H 482");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteHarmonic = new AlphaTab.Rendering.Glyphs.LazySvg("M 116 453l 452 -452c 108 131 197 220 266 266l 261 202l -446 452c -38 -46 -81 -90 -127 -133c -46 -42 -90 -85 -133 -127c -42 -42 -98 -89 -168 -139C 182 496 147 472 116 453");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteRideCymbal = new AlphaTab.Rendering.Glyphs.LazySvg("M 910 417C 763 561 616 695 469 840 384 691 261 576 126 473 79 438 29 407 -23 382 122 239 267 96 412 -46 502 92 628 203 754 310 803 350 853 388 910 417zM 465 696C 561 602 657 508 753 414 655 352 574 268 492 188 464 159 438 128 415 94 320 191 226 288 131 384c 113 55 203 147 285 241 17 22 33 45 48 70z");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteHiHat = new AlphaTab.Rendering.Glyphs.LazySvg("M 484 6c -201 -2 -395 126 -471 312 -79 182 -38 409 101 552 134 144 355 197 540 129 191 -65 333 -253 341 -456 12 -199 -104 -398 -283 -485 -70 -35 -148 -53 -227 -53zm 0 101c 90 0 179 32 250 88 -83 80 -168 158 -250 240 -82 -82 -165 -165 -247 -247 70 -52 159 -81 247 -81zm -322 155c 83 83 167 167 250 250 -85 84 -172 166 -257 250 -100 -127 -113 -315 -26 -453 10 -16 21 -33 33 -48zm 647 6c 97 124 112 306 33 444 -14 23 -30 67 -52 24 -75 -75 -152 -149 -228 -225 81 -82 165 -162 247 -244zm -325 322c 83 83 170 164 254 247 -121 101 -303 121 -442 44 -22 -16 -86 -35 -42 -61 76 -76 153 -153 230 -230z");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteSideStick = new AlphaTab.Rendering.Glyphs.LazySvg("M 0 0c -25 24 -51 48 -77 72 151 151 302 302 454 454 -144 142 -288 285 -433 427 25 25 51 51 77 77 142 -142 285 -285 427 -427 144 142 288 285 433 427 25 -25 51 -51 77 -77 -144 -142 -288 -285 -433 -427 151 -151 302 -302 454 -454 -25 -24 -51 -48 -77 -72 -151 149 -302 299 -454 449 -149 -149 -299 -299 -449 -449");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteHiHatHalf = new AlphaTab.Rendering.Glyphs.LazySvg("M 449 22c 185 -2 364 116 434 288 73 168 35 377 -93 508 -123 133 -327 182 -498 119 -176 -60 -307 -233 -314 -420 -11 -183 96 -366 261 -447 64 -32 137 -49 209 -49zm 0 93c -82 0 -163 30 -228 81 177 176 354 352 531 528 99 -127 104 -319 7 -450 -70 -98 -189 -159 -310 -158zm -296 153c -75 93 -102 223 -64 338 46 160 209 278 377 267 77 -2 153 -30 215 -77 -176 -176 -352 -352 -528 -528z");
    AlphaTab.Rendering.Glyphs.MusicFont.NoteChineseCymbal = new AlphaTab.Rendering.Glyphs.LazySvg("M 503 -450l 577 579l -64 66l -516 -514l -512 512l -68 -64L 503 -450zM 499 601l 316 314l 145 -143l -314 -316l 316 -312l -141 -141l -317 319l -317 -323l -136 136l 319 319l -326 326l 140 140L 499 601");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterUpEighth = new AlphaTab.Rendering.Glyphs.LazySvg("M 9 1032V -9h 87c 20 137 48 252 83 345s 75 172 122 238s 116 151 209 255s 168 193 225 265c 172 221 259 453 259 695c 0 248 -105 550 -317 907h -57c 27 -62 58 -134 94 -216s 65 -156 90 -223s 43 -133 57 -199s 21 -131 21 -196c 0 -102 -20 -204 -62 -308s -99 -199 -174 -287s -159 -159 -254 -213s -194 -84 -296 -90v 68H 9");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterUpSixteenth = new AlphaTab.Rendering.Glyphs.LazySvg("M 943 1912c 62 135 94 280 94 435c 0 202 -61 404 -183 605h -57c 108 -233 162 -430 162 -590c 0 -117 -26 -220 -78 -309c -52 -89 -118 -166 -198 -230c -80 -64 -187 -137 -322 -220s -220 -136 -257 -161v 72h -86V 8h 86c 6 108 28 200 65 276s 74 133 111 170s 109 106 218 206s 190 184 245 252c 87 109 151 216 191 319s 60 212 60 328C 994 1648 977 1764 943 1912zM 897 1815c 0 -17 0 -41 1 -72s 1 -53 1 -68c 0 -369 -266 -701 -798 -996c 3 120 31 229 83 327s 130 199 233 303s 195 195 276 273C 776 1659 843 1737 897 1815");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterUpThirtySecond = new AlphaTab.Rendering.Glyphs.LazySvg("M 14 1990V 10h 87c 11 121 35 216 70 283c 35 66 89 134 161 202c 72 68 174 164 307 288c 235 226 353 494 353 802c 0 106 -14 211 -43 317c 29 90 43 186 43 287c 0 79 -12 171 -36 274c 57 73 86 191 86 352c 0 112 -15 226 -46 342s -76 218 -137 308h -57c 108 -223 162 -418 162 -582c 0 -104 -20 -199 -62 -284s -99 -163 -172 -232c -73 -69 -153 -133 -239 -192s -215 -142 -389 -251v 64H 14zM 108 1292c 7 113 39 215 96 305c 56 89 129 176 218 259s 179 168 273 257c 93 88 160 168 199 240c 2 -19 3 -48 3 -87C 900 1904 636 1579 108 1292zM 115 666c 0 106 23 197 71 272s 129 166 247 274s 209 197 276 268s 129 168 187 288c 7 -42 10 -83 10 -122c 0 -146 -40 -280 -120 -401c -80 -121 -171 -221 -273 -300C 411 867 278 774 115 666");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterUpSixtyFourth = new AlphaTab.Rendering.Glyphs.LazySvg("M 21 2851V 564v -554h 86c 0 140 32 254 98 342c 65 87 173 200 322 339s 261 271 336 400s 113 292 113 490c 0 96 -12 208 -36 338c 43 83 65 188 65 316c 0 122 -21 237 -65 345c 48 109 72 223 72 342c 0 117 -24 222 -72 316c 57 85 86 205 86 360c 0 218 -53 443 -161 673h -65c 98 -280 147 -498 147 -652c 0 -115 -22 -210 -65 -284s -93 -130 -149 -170c -56 -39 -153 -100 -291 -183s -247 -156 -327 -221l 0 87L 21 2851zM 107 2001c 0 121 29 233 89 336s 138 203 236 301s 192 190 280 278c 88 87 149 166 181 235c 11 -60 17 -112 17 -155c 0 -212 -81 -405 -244 -578C 505 2246 318 2106 107 2001zM 114 668c 0 119 22 219 68 300s 127 176 245 286c 118 109 208 198 272 265c 63 66 128 163 195 290c 7 -46 10 -90 10 -133c 0 -166 -41 -313 -124 -439s -177 -229 -281 -308C 395 848 267 762 114 668zM 114 1338c 0 123 24 226 73 309s 133 176 252 282s 211 193 278 263s 128 164 183 283c 9 -45 14 -94 14 -147c 0 -138 -39 -270 -116 -395s -177 -236 -297 -334S 252 1413 114 1338");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterDownEighth = new AlphaTab.Rendering.Glyphs.LazySvg("M 9 -1032V 9h 87c 20 -137 48 -252 83 -345s 75 -172 122 -238s 116 -151 209 -255s 168 -193 225 -265c 172 -221 259 -453 259 -695c 0 -248 -105 -550 -317 -907h -57c 27 62 58 134 94 216s 65 156 90 223s 43 133 57 199s 21 131 21 196c 0 102 -20 204 -62 308s -99 199 -174 287s -159 159 -254 213s -194 84 -296 90v 68H 9");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterDownSixteenth = new AlphaTab.Rendering.Glyphs.LazySvg("M 943 -1912c 62 -135 94 -280 94 -435c 0 -202 -61 -404 -183 -605h -57c 108 233 162 430 162 590c 0 117 -26 220 -78 309c -52 89 -118 166 -198 230c -80 64 -187 137 -322 220s -220 136 -257 161v 72h -86V -8h 86c 6 -108 28 -200 65 -276s 74 -133 111 -170s 109 -106 218 -206s 190 -184 245 -252c 87 -109 151 -216 191 -319s 60 -212 60 -328C 994 -1648 977 -1764 943 -1912zM 897 -1815c 0 17 0 41 1 72s 1 53 1 68c 0 369 -266 701 -798 996c 3 -120 31 -229 83 -327s 130 -199 233 -303s 195 -195 276 -273C 776 -1659 843 -1737 897 -1815");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterDownThirtySecond = new AlphaTab.Rendering.Glyphs.LazySvg("M 14 -1990V -10h 87c 11 -121 35 -216 70 -283c 35 -66 89 -134 161 -202c 72 -68 174 -164 307 -288c 235 -226 353 -494 353 -802c 0 -106 -14 -211 -43 -317c 29 -90 43 -186 43 -287c 0 -79 -12 -171 -36 -274c 57 -73 86 -191 86 -352c 0 -112 -15 -226 -46 -342s -76 -218 -137 -308h -57c 108 223 162 418 162 582c 0 104 -20 199 -62 284s -99 163 -172 232c -73 69 -153 133 -239 192s -215 142 -389 251v 64H 14zM 108 -1292c 7 -113 39 -215 96 -305c 56 -89 129 -176 218 -259s 179 -168 273 -257c 93 -88 160 -168 199 -240c 2 19 3 48 3 87C 900 -1904 636 -1579 108 -1292zM 115 -666c 0 -106 23 -197 71 -272s 129 -166 247 -274s 209 -197 276 -268s 129 -168 187 -288c 7 42 10 83 10 122c 0 146 -40 280 -120 401c -80 121 -171 221 -273 300C 411 -867 278 -774 115 -666");
    AlphaTab.Rendering.Glyphs.MusicFont.FooterDownSixtyFourth = new AlphaTab.Rendering.Glyphs.LazySvg("M 21 -2851V -564v -554h 86c 0 -140 32 -254 98 -342c 65 -87 173 -200 322 -339s 261 -271 336 -400s 113 -292 113 -490c 0 -96 -12 -208 -36 -338c 43 -83 65 -188 65 -316c 0 -122 -21 -237 -65 -345c 48 -109 72 -223 72 -342c 0 -117 -24 -222 -72 -316c 57 -85 86 -205 86 -360c 0 -218 -53 -443 -161 -673h -65c 98 280 147 498 147 652c 0 115 -22 210 -65 284s -93 130 -149 170c -56 39 -153 100 -291 183s -247 156 -327 221l 0 -87L 21 -2851zM 107 -2001c 0 -121 29 -233 89 -336s 138 -203 236 -301s 192 -190 280 -278c 88 -87 149 -166 181 -235c 11 60 17 112 17 155c 0 212 -81 405 -244 578C 505 -2246 318 -2106 107 -2001zM 114 -668c 0 -119 22 -219 68 -300s 127 -176 245 -286c 118 -109 208 -198 272 -265c 63 -66 128 -163 195 -290c 7 46 10 90 10 133c 0 166 -41 313 -124 439s -177 229 -281 308C 395 -848 267 -762 114 -668zM 114 -1338c 0 -123 24 -226 73 -309s 133 -176 252 -282s 211 -193 278 -263s 128 -164 183 -283c 9 45 14 94 14 147c 0 138 -39 270 -116 395s -177 236 -297 334S 252 -1413 114 -1338");
    AlphaTab.Rendering.Glyphs.MusicFont.SimileMark = new AlphaTab.Rendering.Glyphs.LazySvg("M 413 1804l -446 3l 1804 -1806l 449 -3L 413 1804zM 331 434c 0 -53 20 -100 62 -142c 41 -41 91 -62 148 -62s 104 19 142 56c 38 38 56 87 56 148c 0 56 -19 105 -59 145c -39 39 -88 59 -145 59c -56 0 -105 -19 -145 -59C 351 540 331 491 331 434zM 1437 1380c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 104 19 142 56c 38 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 1456 1485 1437 1437 1437 1380");
    AlphaTab.Rendering.Glyphs.MusicFont.SimileMark2 = new AlphaTab.Rendering.Glyphs.LazySvg("M 414 1818l -446 3l 1809 -1809l 449 -6L 414 1818zM 340 439c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 105 20 145 59c 39 39 59 88 59 145c 0 56 -19 104 -56 142c -38 38 -89 56 -153 56c -56 0 -104 -18 -142 -56C 359 549 340 500 340 439zM 1152 1815l -446 3l 1812 -1812l 446 -3L 1152 1815zM 2192 1391c 0 -56 18 -104 56 -142c 38 -37 87 -56 148 -56c 56 0 104 19 142 56c 37 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 2211 1495 2192 1448 2192 1391");
    AlphaTab.Rendering.Glyphs.MusicFont.Coda = new AlphaTab.Rendering.Glyphs.LazySvg("M 697 1689v 299h -72v -299c -189 0 -349 -81 -478 -244c -129 -163 -193 -349 -193 -558h -248v -73h 248c 0 -216 63 -409 189 -581c 126 -171 287 -257 481 -257v -248h 72v 248c 189 0 345 84 467 254s 182 364 182 585h 284v 73h -284c 0 209 -60 395 -182 558C 1042 1608 887 1689 697 1689zM 624 813v -737c -126 14 -208 88 -244 222c -36 133 -54 305 -54 514H 624zM 324 886c 0 262 25 445 76 547s 125 158 222 167v -715H 324zM 697 813h 292c 0 -221 -12 -378 -36 -471c -43 -166 -129 -257 -255 -272V 813zM 989 886h -292v 715c 97 -9 170 -64 219 -164C 964 1338 989 1154 989 886");
    AlphaTab.Rendering.Glyphs.MusicFont.Segno = new AlphaTab.Rendering.Glyphs.LazySvg("M 604 1150c -182 -112 -324 -222 -425 -329c -126 -131 -189 -256 -189 -372c 0 -116 42 -218 128 -306c 85 -87 194 -131 327 -131c 98 0 196 32 294 97c 98 64 147 141 147 229c 0 56 -9 104 -28 142c -18 38 -50 56 -94 56c -100 0 -155 -46 -164 -137c 0 -18 8 -45 25 -80c 17 -34 21 -63 11 -85c -22 -69 -86 -104 -192 -104c -67 0 -123 20 -168 61c -44 40 -67 84 -67 131c 0 135 64 248 193 339c 25 18 155 88 392 207l 571 -843l 148 0l -611 900c 196 121 334 223 415 304c 118 118 177 245 177 379c 0 112 -43 214 -130 304c -86 90 -193 136 -320 136c -102 0 -202 -34 -300 -102c -97 -68 -146 -152 -146 -251c 0 -37 13 -79 40 -125c 27 -46 57 -69 93 -69c 47 0 82 12 105 38c 22 25 38 65 47 120c 6 22 0 51 -16 87c -17 36 -22 65 -16 87c 9 31 35 56 78 75c 42 18 91 28 147 28c 58 0 105 -21 142 -65c 36 -43 55 -89 55 -139c 0 -139 -89 -263 -269 -371c -133 -68 -232 -117 -297 -148l -544 810l -152 -1L 604 1150zM 201 1091c 34 0 64 11 89 32s 37 51 37 89c 0 34 -12 64 -37 89c -25 25 -54 37 -89 37c -34 0 -64 -12 -89 -37c -25 -25 -37 -54 -37 -89C 74 1131 116 1091 201 1091zM 1291 696c 34 0 64 12 89 37c 25 25 37 54 37 89c 0 31 -12 59 -37 84c -25 25 -54 37 -89 37s -63 -11 -86 -35s -35 -52 -35 -87c 0 -34 10 -64 32 -89C 1224 708 1253 696 1291 696");
    AlphaTab.Rendering.Glyphs.MusicFont.OttavaAbove = new AlphaTab.Rendering.Glyphs.LazySvg("M 488 562c 78 9 147 45 206 110c 59 64 88 138 88 222c 0 95 -39 171 -118 227c -78 55 -175 83 -290 83c -112 0 -208 -28 -288 -85c -80 -56 -120 -134 -120 -233c 0 -41 5 -77 15 -107c 10 -29 29 -61 56 -94c 27 -32 77 -62 149 -89c 12 -3 28 -7 49 -13c -69 -12 -127 -48 -172 -107c -45 -59 -68 -123 -68 -190c 0 -88 37 -161 113 -217s 158 -84 249 -84c 96 0 185 29 265 87c 80 58 120 131 120 220c 0 73 -22 134 -68 183c -24 24 -62 47 -113 68C 547 545 521 553 488 562zM 279 588c -66 21 -118 57 -156 108c -37 51 -56 112 -56 181c 0 72 27 141 83 206c 56 65 130 97 224 97c 90 0 166 -36 226 -108c 51 -60 77 -124 77 -190c 0 -54 -21 -101 -63 -140c -30 -27 -68 -49 -113 -68L 279 588zM 460 547c 130 -39 195 -127 195 -263c 0 -66 -25 -129 -77 -188c -51 -59 -122 -88 -213 -88c -87 0 -155 28 -202 86c -47 57 -70 119 -70 186c 0 36 14 72 43 108c 28 36 68 63 120 81L 460 547zM 842 311l -13 -9l 68 -58c 24 -21 51 -28 81 -22c 27 3 40 24 40 63c 0 36 -15 100 -47 192c -31 92 -47 149 -47 170c 0 33 13 46 40 40c 42 -3 94 -47 156 -133c 61 -86 93 -156 93 -211c 0 -12 -7 -22 -22 -31c -18 -9 -28 -16 -31 -22c -15 -30 -7 -49 22 -59c 30 -12 52 9 68 63c 18 75 -12 167 -93 274c -80 107 -147 161 -201 161c -57 0 -86 -24 -86 -72c 0 -18 4 -37 13 -59c 9 -21 23 -65 43 -133c 19 -68 29 -120 29 -156c 0 -15 -1 -25 -4 -31c -9 -18 -24 -19 -45 -4L 842 311zM 1636 683l 81 -68l -72 83c -18 19 -36 29 -54 29c -15 0 -21 -15 -18 -45l 40 -167c -3 21 -28 59 -77 113c -57 66 -109 99 -154 99c -66 0 -99 -39 -99 -118c 0 -78 28 -159 86 -242c 57 -83 122 -124 195 -124c 39 0 74 15 104 45l 9 -45h 31l -95 407c -6 18 -7 30 -4 36S 1621 692 1636 683zM 1382 683c 51 0 107 -37 167 -111c 18 -24 43 -63 77 -115l 31 -134c -33 -34 -66 -51 -99 -51c -54 0 -105 40 -152 120c -46 80 -70 154 -70 222C 1336 660 1351 683 1382 683");
    AlphaTab.Rendering.Glyphs.MusicFont.OttavaBelow = new AlphaTab.Rendering.Glyphs.LazySvg("M 469 529c 75 6 143 41 202 107c 59 65 88 141 88 229c 0 97 -39 173 -118 229c -78 56 -175 84 -290 84c -112 0 -208 -28 -288 -86c -80 -57 -120 -136 -120 -236c 0 -33 6 -68 18 -104c 12 -36 31 -69 56 -97s 65 -55 120 -79c 18 -6 43 -15 77 -27c -69 -12 -126 -47 -170 -104s -65 -121 -65 -191c 0 -85 37 -156 113 -214c 75 -57 157 -86 245 -86c 93 0 182 28 265 86c 83 57 124 130 124 218c 0 72 -22 133 -68 182c -24 24 -62 47 -113 68C 528 512 502 520 469 529zM 251 563c -66 21 -118 57 -154 108c -36 51 -54 112 -54 181c 0 72 27 141 84 206c 55 65 130 97 224 97c 93 0 169 -36 226 -108c 48 -60 72 -124 72 -190c 0 -51 -21 -98 -63 -140c -30 -30 -66 -52 -108 -68L 251 563zM 432 522c 130 -39 195 -128 195 -265c 0 -67 -25 -130 -77 -189c -51 -59 -121 -89 -208 -89c -87 0 -155 29 -202 89c -47 59 -70 119 -70 180c 0 36 13 74 40 112s 66 66 118 84L 432 522zM 827 268h -13l 63 -45c 24 -27 52 -39 86 -36c 24 3 36 23 36 60c 0 34 -15 98 -45 191c -30 93 -45 154 -45 182c 0 34 13 49 40 46c 42 -3 94 -49 156 -138c 61 -89 93 -161 93 -218c 0 -12 -10 -25 -31 -37c -15 -6 -22 -12 -22 -18c -15 -30 -9 -50 18 -59c 33 -12 57 9 72 64c 18 76 -12 168 -93 277c -80 108 -146 162 -197 162c -63 0 -95 -28 -95 -84c 0 -8 3 -22 9 -40c 18 -47 35 -102 52 -164c 16 -62 24 -105 24 -129c 0 -17 -3 -29 -9 -35c -6 -6 -18 -4 -36 4L 827 268zM 1413 -13l -72 -9c 23 6 53 1 89 -15c 11 -3 30 -15 53 -35l -131 444c 30 -45 64 -81 102 -108c 38 -27 76 -40 116 -40c 39 0 68 11 86 34c 18 22 27 55 27 98c 0 79 -30 156 -90 231c -60 74 -137 112 -231 112c -30 0 -57 -8 -81 -24c -24 -16 -33 -36 -27 -62L 1413 -13zM 1294 635c 15 21 42 32 81 32c 78 0 146 -42 204 -128c 48 -73 72 -145 72 -215c 0 -30 -7 -50 -22 -59c -18 -9 -36 -13 -54 -13c -36 0 -77 17 -122 52c -45 35 -81 77 -108 126L 1294 635");
    AlphaTab.Rendering.Glyphs.MusicFont.QuindicesimaAbove = new AlphaTab.Rendering.Glyphs.LazySvg("M 245 985V 270v -72c -9 -8 -30 -13 -61 -13c -25 0 -42 1 -52 4l -99 31l -4 -22l 317 -190v 980c 0 39 6 68 20 88c 13 19 31 34 52 43l 145 40v 9h -531l -4 -18l 149 -40c 24 -9 42 -24 54 -45C 241 1050 245 1024 245 985zM 685 338c 60 15 105 27 136 36c 96 27 167 53 213 77c 175 87 263 192 263 313c 0 72 -15 140 -47 204s -70 111 -115 142c -45 31 -87 53 -124 65c -37 12 -94 18 -170 18c -66 0 -128 -13 -186 -40c -57 -27 -86 -63 -86 -108c 0 -24 16 -36 49 -36c 18 0 41 5 70 15c 28 10 61 35 97 74c 36 39 69 59 99 59c 96 0 170 -39 222 -118c 42 -63 63 -131 63 -204c 0 -57 -18 -108 -56 -152c -37 -43 -79 -77 -124 -102c -45 -24 -125 -54 -240 -90c -36 -12 -87 -27 -154 -45l 154 -426h 426c 36 0 65 -4 86 -13l 45 -34l 22 -29h 9l -127 195h -449L 685 338zM 1806 561h -59l 145 -367c 0 -18 0 -30 0 -36c -6 -27 -21 -42 -45 -45c -24 -3 -51 13 -81 50c -3 6 -9 16 -18 31l -145 367h -68l 154 -379c -3 -15 -4 -26 -4 -32c -6 -21 -18 -34 -36 -37c -45 -6 -98 34 -158 121c -9 12 -21 34 -36 65h -18c 30 -47 54 -83 72 -106c 57 -71 111 -106 163 -106c 18 2 34 14 50 34c 2 5 9 17 18 34c 9 -17 16 -28 22 -34c 24 -22 60 -34 108 -34c 18 0 33 11 45 34c 2 5 7 18 13 38c 18 -21 31 -34 40 -40c 36 -27 74 -37 113 -31c 30 6 49 24 59 54c 3 9 6 25 9 49l -122 304c -3 15 -4 25 -4 31c 0 9 6 13 18 13c 18 0 39 -17 63 -52c 6 -11 16 -28 31 -52l 13 4c -15 29 -27 49 -36 61c -30 43 -56 65 -77 65c -51 0 -71 -20 -59 -62l 122 -306c 0 -17 0 -29 0 -35c -6 -23 -22 -35 -49 -35s -51 10 -72 31c -6 6 -15 18 -27 36L 1806 561zM 2555 525l 77 -63l -72 73c -18 17 -36 26 -54 26c -15 0 -21 -12 -18 -36l 40 -158c -6 31 -43 78 -113 138c -45 40 -84 60 -118 60c -66 0 -99 -38 -99 -114c 0 -79 28 -158 86 -235c 57 -77 122 -116 195 -116c 24 0 48 5 72 16c 6 2 16 9 31 20l 9 -36h 31l -95 395c -6 18 -7 30 -4 35C 2526 535 2537 534 2555 525zM 2292 525c 51 0 108 -35 172 -107c 21 -23 46 -61 77 -112l 27 -134c -30 -29 -63 -44 -99 -44c -54 0 -105 38 -152 116c -46 77 -70 149 -70 215C 2246 502 2262 525 2292 525");
    AlphaTab.Rendering.Glyphs.MusicFont.QuindicesimaBelow = new AlphaTab.Rendering.Glyphs.LazySvg("M 2400 -200C 2376 -180 2358 -170 2346 -166C 2310 -150 2280 -144 2256 -150L 2328 -141L 2168 484C 2162 509 2172 530 2196 546C 2221 562 2247 571 2278 571C 2371 571 2448 534 2509 459C 2569 384 2600 307 2600 228C 2600 185 2590 151 2571 128C 2553 105 2526 93 2487 93C 2448 93 2409 107 2371 134C 2333 161 2299 198 2268 243L 2400 -200zM 1300 -57L 1278 -29L 1234 6C 1213 15 1183 21 1146 21L 721 21L 565 446C 632 464 685 481 721 493C 836 530 913 560 959 584C 1004 608 1046 640 1084 684C 1122 728 1143 780 1143 837C 1143 910 1120 980 1078 1043C 1026 1122 953 1159 856 1159C 825 1159 792 1139 756 1100C 719 1060 687 1035 659 1025C 630 1014 605 1009 587 1009C 554 1009 537 1022 537 1046C 537 1092 567 1129 625 1156C 682 1183 742 1196 809 1196C 884 1196 943 1190 981 1178C 1018 1166 1060 1144 1106 1112C 1151 1080 1190 1032 1221 968C 1253 905 1268 838 1268 765C 1268 644 1181 540 1006 453C 960 429 890 402 793 375C 763 365 716 352 656 337L 734 140L 1184 140L 1309 -57L 1300 -57zM 315 6L 0 196L 3 221L 103 190C 112 187 130 184 156 184C 187 184 206 187 215 196L 215 268L 215 984C 215 1023 212 1050 203 1065C 191 1086 171 1100 146 1109L 0 1150L 3 1168L 534 1168L 534 1159L 387 1118C 366 1109 351 1094 337 1075C 323 1055 315 1026 315 987L 315 6zM 1640 84C 1589 84 1535 119 1478 190C 1459 214 1436 249 1406 296L 1425 296C 1440 265 1450 246 1459 234C 1519 147 1573 106 1618 112C 1636 115 1650 128 1656 150C 1656 156 1656 165 1659 181L 1506 562L 1571 562L 1718 193C 1727 178 1734 168 1737 162C 1767 126 1794 109 1818 112C 1842 115 1856 129 1862 156L 1862 193L 1718 562L 1778 562L 1921 193C 1933 175 1943 162 1950 156C 1971 135 1994 125 2021 125C 2049 125 2065 138 2071 162L 2071 196L 1950 503C 1937 544 1957 565 2009 565C 2030 565 2057 543 2087 500C 2096 488 2106 466 2121 437L 2109 434C 2094 457 2084 475 2078 487C 2053 522 2030 537 2012 537C 2000 537 1996 534 1996 525C 1996 519 1997 508 2000 493L 2121 190C 2118 166 2115 149 2112 140C 2103 110 2083 90 2053 84C 2013 78 1976 88 1940 115C 1931 121 1918 135 1900 156C 1893 136 1890 124 1887 118C 1875 95 1858 84 1840 84C 1792 84 1755 96 1731 118C 1725 124 1718 136 1709 153C 1700 136 1693 124 1690 118C 1675 98 1658 87 1640 84zM 2490 121C 2508 121 2528 125 2546 134C 2562 143 2568 163 2568 193C 2568 264 2545 335 2496 409C 2439 495 2372 537 2293 537C 2254 537 2224 527 2209 506L 2259 300C 2286 251 2323 210 2368 175C 2414 139 2454 121 2490 121z");
    AlphaTab.Rendering.Glyphs.MusicFont.FermataShort = new AlphaTab.Rendering.Glyphs.LazySvg("M 60 694l -110 1l 660 -713l 656 713l -66 -1l -562 -611L 60 694zM 662 488c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 633 488 662 488");
    AlphaTab.Rendering.Glyphs.MusicFont.FermataNormal = new AlphaTab.Rendering.Glyphs.LazySvg("M 871 230c -216 0 -405 69 -565 209c -160 139 -255 317 -284 531c -2 -16 -4 -32 -4 -48c 0 -21 0 -36 0 -44c 0 -228 84 -427 252 -599c 168 -171 368 -257 600 -257c 229 0 429 84 598 254c 169 169 254 370 254 603c 0 40 0 70 0 92c -26 -216 -119 -394 -278 -533C 1283 299 1093 230 871 230zM 869 767c 29 0 54 10 74 30s 30 44 30 74c 0 29 -9 53 -28 72c -18 18 -44 28 -76 28c -26 0 -50 -9 -72 -28c -21 -18 -32 -42 -32 -72c 0 -29 10 -54 30 -74S 839 767 869 767");
    AlphaTab.Rendering.Glyphs.MusicFont.FermataLong = new AlphaTab.Rendering.Glyphs.LazySvg("M 55 702h -68v -704h 1317v 704h -68v -500h -1180V 702zM 647 494c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 618 494 647 494");
    AlphaTab.Rendering.Glyphs.MusicFont.DynamicP = new AlphaTab.Rendering.Glyphs.LazySvg("M 447 894l -146 415l 92 0v 50h -364v -50h 93l 310 -797c 7 -9 10 -16 10 -21c 7 -19 7 -33 0 -43c -14 -14 -27 -21 -39 -21c -38 0 -83 48 -133 144c -14 31 -34 79 -61 144h -25c 26 -72 48 -125 64 -158c 57 -108 116 -162 176 -162c 19 0 33 2 43 7c 12 4 21 18 28 39c 2 7 4 19 7 36c 16 -26 47 -52 90 -79c 43 -26 89 -39 137 -39c 19 0 45 5 77 16c 32 10 59 37 81 78c 21 41 32 89 32 141c 0 35 -2 64 -7 86c -4 21 -13 50 -25 86c -26 64 -71 123 -133 177s -119 80 -169 80C 528 1024 481 981 447 894zM 754 425c -33 -14 -73 5 -119 58c -36 43 -67 92 -93 145c -26 53 -39 113 -39 181c 0 48 9 78 28 90c 26 14 62 0 108 -41c 45 -42 81 -92 108 -150c 9 -24 19 -56 28 -96c 9 -40 14 -74 14 -103C 790 462 778 435 754 425");
    AlphaTab.Rendering.Glyphs.MusicFont.DynamicF = new AlphaTab.Rendering.Glyphs.LazySvg("M 951 406v 39h -194l -18 90c -48 194 -97 344 -147 447c -67 141 -154 245 -259 310c -33 21 -77 32 -129 32c -77 0 -127 -21 -151 -64c -14 -26 -21 -51 -21 -75c 0 -38 13 -71 41 -97c 27 -26 57 -37 88 -32c 55 9 83 36 83 79c 0 16 -3 32 -10 46c -9 33 -32 55 -68 64c -12 2 -16 7 -14 14c 4 19 22 28 54 28c 16 -2 36 -14 57 -36c 7 -7 22 -26 47 -57c 52 -79 102 -205 147 -378c 19 -77 38 -154 57 -231l 32 -140h -137v -39h 144c -14 -55 21 -139 108 -252c 65 -84 144 -139 238 -166c 28 -7 57 -10 86 -10c 60 0 109 15 148 46c 38 31 57 72 57 122c 0 48 -14 81 -43 99c -28 18 -56 21 -83 9c -31 -14 -46 -38 -46 -72c 0 -28 10 -52 32 -72c 7 -7 22 -12 46 -14c 24 -2 37 -8 39 -18c 7 -28 -16 -43 -72 -43c -33 0 -64 6 -93 18c -77 33 -132 102 -166 205c -9 33 -20 83 -32 148H 951");
    AlphaTab.Rendering.Glyphs.MusicFont.DynamicM = new AlphaTab.Rendering.Glyphs.LazySvg("M 553 1076l -165 1l 201 -502c 7 -12 11 -21 14 -28c 12 -26 18 -45 18 -57c 0 -21 -8 -33 -25 -36c -31 -7 -62 9 -93 50c -9 12 -22 33 -39 65l -199 508l -164 0l 212 -501c 4 -10 7 -17 7 -22c 4 -19 7 -37 7 -52c 0 -17 -3 -28 -10 -33c -9 -10 -22 -14 -39 -14c -50 0 -116 61 -198 183c -12 19 -30 47 -54 84h -18c 43 -73 78 -126 104 -160c 86 -106 165 -154 238 -142c 16 2 37 21 61 56c 7 10 18 28 32 56c 14 -26 28 -45 43 -57c 45 -40 101 -61 166 -61c 31 0 54 19 68 57c 2 12 6 32 10 61c 21 -30 39 -51 54 -62c 48 -39 101 -56 158 -49c 55 7 89 30 104 69c 2 11 3 30 3 55l -163 437c -12 19 -20 32 -22 39c -7 14 -4 22 7 25c 21 2 54 -20 97 -68c 14 -14 34 -39 61 -75h 21c -31 44 -56 78 -75 101c -62 67 -125 101 -188 101c -24 0 -43 -10 -57 -32c -14 -21 -16 -43 -7 -65l 169 -429c 4 -7 6 -11 6 -14c 10 -26 16 -47 16 -64c 0 -26 -10 -40 -32 -43c -28 -7 -58 9 -89 50c -9 12 -22 33 -39 64L 553 1076");
    AlphaTab.Rendering.Glyphs.MusicFont.Accentuation = new AlphaTab.Rendering.Glyphs.LazySvg("M 748 286C 382 365 16 445 -350 525c 0 -23 0 -46 0 -69C -58 400 234 344 526 288 233 233 -58 178 -351 124c 0 -24 0 -49 0 -74 366 78 732 157 1099 236z");
    AlphaTab.Rendering.Glyphs.MusicFont.HeavyAccentuation = new AlphaTab.Rendering.Glyphs.LazySvg("M -223 900L -275 900l 349 -1004l 353 1004l -128 0l -264 -750L -223 900");
    AlphaTab.Rendering.Glyphs.MusicFont.WaveHorizontal = new AlphaTab.Rendering.Glyphs.LazySvg("M 1382 230c -43 32 -92 69 -146 111s -104 76 -149 105c -45 28 -89 51 -134 68s -86 26 -127 28c -47 -6 -87 -19 -119 -38s -79 -51 -143 -98c -64 -46 -117 -81 -160 -102c -42 -21 -90 -32 -141 -32c -79 0 -174 55 -285 166v -112c 132 -110 241 -193 327 -249s 166 -83 244 -83c 48 0 93 11 134 34c 40 22 88 56 144 101c 55 44 103 79 143 103c 40 24 85 37 135 40c 89 -7 182 -55 278 -146V 230");
    AlphaTab.Rendering.Glyphs.MusicFont.WaveVertical = new AlphaTab.Rendering.Glyphs.LazySvg("M 165 4h 50c 47 44 86 85 115 122s 43 75 43 114c 0 31 -9 60 -28 85c -19 25 -47 55 -85 89s -66 64 -86 90c -19 26 -30 55 -31 88h 5c 0 31 9 60 27 86c 18 25 46 56 84 93s 66 68 86 95c 19 27 28 57 28 92c 0 33 -9 62 -28 89c -19 26 -47 57 -85 92c -37 35 -65 64 -84 89c -18 24 -27 51 -27 82c 0 17 22 59 67 127h -50c -59 -57 -100 -100 -124 -130c -23 -29 -35 -67 -35 -113c 0 -33 9 -62 27 -86c 18 -24 46 -53 85 -87c 38 -33 66 -63 85 -88c 18 -25 28 -55 28 -91c 0 -17 -8 -37 -26 -61s -42 -54 -73 -89c -31 -35 -53 -60 -64 -75c -41 -64 -61 -109 -61 -135c 1 -40 20 -80 56 -119c 35 -38 72 -77 110 -117c 38 -39 58 -76 60 -112c 0 -18 -4 -35 -13 -50C 210 72 192 44 165 4");
    AlphaTab.Rendering.Glyphs.MusicFont.PickStrokeDown = new AlphaTab.Rendering.Glyphs.LazySvg("M 0 -20h 816v 844h -74v -477h -672v 477H 0V -20");
    AlphaTab.Rendering.Glyphs.MusicFont.PickStrokeUp = new AlphaTab.Rendering.Glyphs.LazySvg("M 551 -7L 289 950l -264 -956h 66l 202 759l 193 -759H 551");
    AlphaTab.Rendering.Glyphs.MusicFont.TremoloPickingThirtySecond = new AlphaTab.Rendering.Glyphs.LazySvg("M -488 787v -250l 986 -505v 253L -488 787zM -488 1200v -250l 986 -505v 253L -488 1200zM -488 1612v -250l 986 -505v 261L -488 1612");
    AlphaTab.Rendering.Glyphs.MusicFont.TremoloPickingSixteenth = new AlphaTab.Rendering.Glyphs.LazySvg("M -488 787v -250l 986 -505v 253L -488 787zM -488 1200v -250l 986 -505v 253L -488 1200");
    AlphaTab.Rendering.Glyphs.MusicFont.TremoloPickingEighth = new AlphaTab.Rendering.Glyphs.LazySvg("M -488 787v -250l 986 -505v 253L -488 787");
    AlphaTab.Rendering.Glyphs.MusicFont.UpperMordent = new AlphaTab.Rendering.Glyphs.LazySvg("M 16 714v -195l 425 -494c 34 -22 53 -33 56 -33c 19 0 33 6 39 20l 349 306c 17 17 36 28 56 33c 19 -6 33 -12 39 -19l 264 -307c 33 -22 53 -33 59 -33c 17 0 29 6 36 20l 349 306c 20 21 39 34 55 40c 20 -7 34 -16 40 -26l 224 -264v 194l -422 494c -32 22 -54 33 -66 33c -15 0 -26 -6 -33 -19l -346 -310c -15 -15 -37 -23 -66 -23c -16 0 -26 3 -29 9l -267 310c -25 22 -46 33 -62 33c -14 0 -25 -6 -33 -19l -346 -310c -18 -19 -40 -29 -66 -29c -14 0 -25 5 -32 16L 16 714");
    AlphaTab.Rendering.Glyphs.MusicFont.LowerMordent = new AlphaTab.Rendering.Glyphs.LazySvg("M -34 664v -195l 399 -458c 34 -37 58 -56 72 -56s 41 18 82 56l 352 310v -607h 99v 525l 191 -227c 38 -41 62 -62 72 -62c 10 0 38 16 82 50l 277 247c 64 53 99 80 102 82c 10 -2 24 -15 43 -38c 18 -23 33 -39 42 -50l 115 -142v 178l -349 412c -26 34 -51 52 -75 52c -12 0 -40 -19 -83 -59l -257 -230c -46 -46 -83 -69 -111 -69c -7 0 -12 1 -17 5c -4 3 -9 9 -16 17c -6 8 -11 14 -16 19v 607h -99v -492l -121 149c -31 34 -56 52 -75 52c -7 0 -15 -2 -22 -6c -7 -4 -18 -12 -32 -25c -14 -12 -25 -21 -33 -27l -290 -263c -35 -28 -57 -42 -66 -42c -15 0 -33 14 -56 42L -34 664");
    AlphaTab.Rendering.Glyphs.MusicFont.Turn = new AlphaTab.Rendering.Glyphs.LazySvg("M 1141 739c -20 -17 -65 -56 -136 -115c -70 -60 -143 -117 -218 -172c -75 -54 -150 -100 -224 -136c -73 -36 -140 -54 -199 -54c -74 6 -138 45 -191 115s -82 143 -85 218c 8 119 77 179 208 179c 18 0 33 -3 45 -9c 11 -6 31 -20 59 -40c 28 -20 53 -35 75 -45c 22 -9 48 -14 79 -14c 89 0 146 39 170 117c 0 76 -31 132 -93 169c -62 36 -129 55 -202 55c -165 -8 -290 -53 -373 -135c -83 -82 -124 -182 -124 -301c 0 -85 22 -171 67 -255c 44 -84 107 -155 189 -213c 81 -57 174 -92 279 -105c 137 0 267 29 388 89c 121 59 240 137 356 232c 116 95 229 188 337 278c 42 35 97 69 165 101c 67 31 131 47 191 47c 92 -5 162 -35 210 -91c 47 -56 71 -121 71 -196c 0 -64 -18 -119 -55 -162c -36 -43 -85 -65 -146 -65c -21 0 -50 12 -89 38c -38 25 -68 43 -90 55c -22 11 -53 17 -93 17c -42 0 -79 -14 -113 -44c -33 -29 -50 -66 -50 -111c 0 -60 31 -104 95 -134c 63 -29 130 -44 200 -44c 102 0 192 24 269 72c 76 48 135 112 175 191c 40 78 60 161 60 249c 0 87 -20 168 -60 243c -40 74 -101 134 -184 179c -82 45 -185 68 -306 68c -116 0 -224 -22 -323 -66C 1375 894 1264 827 1141 739");
    AlphaTab.Rendering.Glyphs.MusicFont.OpenNote = new AlphaTab.Rendering.Glyphs.LazySvg("M 443 922c -124 0 -229 -45 -315 -135s -128 -197 -128 -322c 0 -130 42 -239 126 -326c 84 -87 189 -130 316 -130c 122 0 225 39 310 118c 84 78 130 177 138 295c 0 145 -41 263 -125 354S 575 915 443 922zM 426 96c -101 0 -182 35 -244 107c -61 71 -92 158 -92 260c 0 101 32 185 98 252s 150 100 254 100c 113 0 201 -36 264 -109s 94 -168 94 -288C 780 204 655 96 426 96");
    AlphaTab.Rendering.Glyphs.MusicFont.StoppedNote = new AlphaTab.Rendering.Glyphs.LazySvg("M 462 1009v -449h -445v -122h 445V -3h 118v 441h 452v 122h -452v 449H 462");
    AlphaTab.Rendering.Glyphs.MusicFont.Tempo = new AlphaTab.Rendering.Glyphs.LazySvg("M 550 1578V 30l 43 8v 1679c 0 86 -41 160 -124 220s -173 90 -272 90c -114 0 -182 -46 -203 -139c 0 -84 41 -164 125 -239s 173 -112 270 -112C 457 1539 510 1552 550 1578zM 914 1686v -76h 540v 76H 914zM 914 1850h 540v 80h -540V 1850");
    AlphaTab.Rendering.Glyphs.MusicFont.AccidentalSharp = new AlphaTab.Rendering.Glyphs.LazySvg("M 482 -275v -577h 93v 540l 135 -57v 343l -135 57v 551l 135 -62v 343l -135 57v 561h -93v -525l -223 93v 566h -93v -530l -135 52v -343l 135 -52v -551l -135 57v -348l 135 -52v -561h 93v 525L 482 -275zM 258 156v 551l 223 -93v -546L 258 156");
    AlphaTab.Rendering.Glyphs.MusicFont.AccidentalFlat = new AlphaTab.Rendering.Glyphs.LazySvg("M -23 -1273h 93v 1300c 48 -27 86 -48 114 -62c 93 -41 176 -62 249 -62c 52 0 97 13 137 39c 39 26 70 70 91 132c 10 31 15 62 15 93c 0 100 -50 204 -150 311c -72 76 -157 143 -254 202c -41 24 -97 69 -166 135c -45 41 -88 84 -130 129V -1273zM 367 17c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -27 0 -59 7 -93 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 128 -156 192 -284 192 -384C 460 103 429 51 367 17");
    AlphaTab.Rendering.Glyphs.MusicFont.AccidentalNatural = new AlphaTab.Rendering.Glyphs.LazySvg("M 38 472V -1283h 99v 792l 478 -132v 1738h -93v -775L 38 472zM 137 180l 385 -104v -429l -385 104V 180");
    AlphaTab.Rendering.Glyphs.MusicFont.ClefNeutral = new AlphaTab.Rendering.Glyphs.LazySvg("M 915 1887v -1875h 337v 1875H 915zM 1477 1887v -1875h 337v 1875H 1477");
    AlphaTab.Rendering.Glyphs.MusicFont.RestSixtyFourth = new AlphaTab.Rendering.Glyphs.LazySvg("M 705 -2202c 77 -26 144 -77 200 -150c 56 -73 101 -174 136 -305l 127 -547c -69 127 -197 191 -382 191c -46 0 -100 -7 -162 -23c -61 -15 -114 -46 -156 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168c 46 -46 104 -69 174 -69c 65 0 123 25 174 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 27 -3 57 -11c 77 -23 148 -81 213 -174c 53 -73 86 -137 98 -191l 154 -638c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174c 46 -46 104 -69 174 -69s 128 24 176 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98c -15 34 -42 65 -81 92c 19 7 40 15 63 23c 11 0 32 -3 63 -11c 73 -23 140 -80 202 -169c 61 -89 121 -179 179 -271l 41 0l -1032 4425l -107 0l 319 -1316c -73 128 -196 192 -370 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -105 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 171 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 26 -3 57 -11c 76 -23 150 -83 219 -180c 57 -77 86 -129 86 -156l 161 -667c -73 124 -198 186 -375 186c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -22c -69 -19 -125 -51 -167 -97c -42 -45 -63 -105 -63 -177c 0 -68 23 -126 69 -172c 46 -45 106 -68 179 -68c 65 0 122 23 171 71c 48 47 72 102 72 163c 0 30 -7 63 -23 97c -15 34 -44 65 -87 91c 23 7 46 14 69 21C 653 -2190 674 -2194 705 -2202");
    AlphaTab.Rendering.Glyphs.MusicFont.AccidentalDoubleFlat = new AlphaTab.Rendering.Glyphs.LazySvg("M 67 25c 52 -27 93 -48 124 -62c 100 -45 176 -67 228 -67c 45 0 95 12 150 36V -1275h 88v 1300c 48 -27 88 -48 119 -62c 100 -45 183 -67 249 -67c 55 0 104 13 145 39c 41 26 72 71 93 137c 10 31 15 62 15 93c 0 107 -48 212 -145 316c -72 79 -163 143 -270 192c -34 17 -78 52 -132 104c -53 51 -108 107 -163 166v -529c -38 45 -72 83 -104 115c -55 55 -121 103 -197 141c -45 20 -102 68 -171 141c -41 41 -81 85 -119 131V -1275h 88V 25zM 369 15c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -31 0 -64 7 -98 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 462 101 431 49 369 15zM 962 15c -3 -3 -12 -6 -26 -10c -20 -6 -36 -10 -46 -10c -31 0 -63 7 -96 23c -33 15 -77 46 -132 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 1055 101 1024 49 962 15");
    AlphaTab.Rendering.Glyphs.MusicFont.AccidentalDoubleSharp = new AlphaTab.Rendering.Glyphs.LazySvg("M 22 243c -32 -31 -48 -68 -48 -110c 0 -38 15 -71 45 -98c 30 -27 63 -40 98 -40c 38 0 70 14 96 43c 64 57 116 124 158 199c 41 75 62 146 62 213c -83 0 -172 -30 -268 -91C 99 317 51 278 22 243zM 18 872c 25 25 59 38 100 38c 38 0 70 -14 96 -43c 44 -38 86 -86 124 -144c 64 -96 96 -187 96 -273c -70 0 -140 18 -211 55c -70 36 -137 87 -201 151c -32 31 -48 70 -48 115C -26 810 -11 843 18 872zM 848 32c -25 -25 -60 -38 -105 -38c -41 0 -76 16 -105 48c -57 67 -94 113 -110 139c -60 96 -91 185 -91 268c 92 0 182 -28 268 -86c 79 -67 124 -105 134 -115c 31 -31 48 -72 48 -120C 886 96 874 64 848 32zM 838 656c 31 31 48 70 48 115c 0 38 -14 72 -43 100s -62 43 -100 43c -38 0 -73 -16 -105 -48c -51 -57 -88 -105 -110 -144c -60 -96 -91 -187 -91 -273c 105 0 211 41 316 124C 803 622 832 650 838 656");
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup = null;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup = {};
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefF] = AlphaTab.Rendering.Glyphs.MusicFont.ClefF;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefC] = AlphaTab.Rendering.Glyphs.MusicFont.ClefC;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestThirtySecond] = AlphaTab.Rendering.Glyphs.MusicFont.RestThirtySecond;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestQuarter] = AlphaTab.Rendering.Glyphs.MusicFont.RestQuarter;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.GraceUp] = AlphaTab.Rendering.Glyphs.MusicFont.GraceUp;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.GraceDown] = AlphaTab.Rendering.Glyphs.MusicFont.GraceDown;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Trill] = AlphaTab.Rendering.Glyphs.MusicFont.Trill;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefG] = AlphaTab.Rendering.Glyphs.MusicFont.ClefG;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num0] = AlphaTab.Rendering.Glyphs.MusicFont.Num0;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num1] = AlphaTab.Rendering.Glyphs.MusicFont.Num1;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num2] = AlphaTab.Rendering.Glyphs.MusicFont.Num2;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num3] = AlphaTab.Rendering.Glyphs.MusicFont.Num3;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num4] = AlphaTab.Rendering.Glyphs.MusicFont.Num4;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num5] = AlphaTab.Rendering.Glyphs.MusicFont.Num5;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num6] = AlphaTab.Rendering.Glyphs.MusicFont.Num6;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num7] = AlphaTab.Rendering.Glyphs.MusicFont.Num7;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num8] = AlphaTab.Rendering.Glyphs.MusicFont.Num8;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Num9] = AlphaTab.Rendering.Glyphs.MusicFont.Num9;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestSixteenth] = AlphaTab.Rendering.Glyphs.MusicFont.RestSixteenth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestEighth] = AlphaTab.Rendering.Glyphs.MusicFont.RestEighth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestWhole] = AlphaTab.Rendering.Glyphs.MusicFont.RestWhole;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteWhole] = AlphaTab.Rendering.Glyphs.MusicFont.NoteWhole;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteQuarter] = AlphaTab.Rendering.Glyphs.MusicFont.NoteQuarter;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHalf] = AlphaTab.Rendering.Glyphs.MusicFont.NoteHalf;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteDead] = AlphaTab.Rendering.Glyphs.MusicFont.NoteDead;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic] = AlphaTab.Rendering.Glyphs.MusicFont.NoteHarmonic;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteRideCymbal] = AlphaTab.Rendering.Glyphs.MusicFont.NoteRideCymbal;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHiHat] = AlphaTab.Rendering.Glyphs.MusicFont.NoteHiHat;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteSideStick] = AlphaTab.Rendering.Glyphs.MusicFont.NoteSideStick;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHiHatHalf] = AlphaTab.Rendering.Glyphs.MusicFont.NoteHiHatHalf;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteChineseCymbal] = AlphaTab.Rendering.Glyphs.MusicFont.NoteChineseCymbal;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth] = AlphaTab.Rendering.Glyphs.MusicFont.FooterUpEighth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixteenth] = AlphaTab.Rendering.Glyphs.MusicFont.FooterUpSixteenth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpThirtySecond] = AlphaTab.Rendering.Glyphs.MusicFont.FooterUpThirtySecond;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixtyFourth] = AlphaTab.Rendering.Glyphs.MusicFont.FooterUpSixtyFourth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth] = AlphaTab.Rendering.Glyphs.MusicFont.FooterDownEighth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixteenth] = AlphaTab.Rendering.Glyphs.MusicFont.FooterDownSixteenth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownThirtySecond] = AlphaTab.Rendering.Glyphs.MusicFont.FooterDownThirtySecond;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixtyFourth] = AlphaTab.Rendering.Glyphs.MusicFont.FooterDownSixtyFourth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.SimileMark] = AlphaTab.Rendering.Glyphs.MusicFont.SimileMark;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.SimileMark2] = AlphaTab.Rendering.Glyphs.MusicFont.SimileMark2;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Coda] = AlphaTab.Rendering.Glyphs.MusicFont.Coda;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Segno] = AlphaTab.Rendering.Glyphs.MusicFont.Segno;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.OttavaAbove] = AlphaTab.Rendering.Glyphs.MusicFont.OttavaAbove;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.OttavaBelow] = AlphaTab.Rendering.Glyphs.MusicFont.OttavaBelow;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.QuindicesimaAbove] = AlphaTab.Rendering.Glyphs.MusicFont.QuindicesimaAbove;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.QuindicesimaBelow] = AlphaTab.Rendering.Glyphs.MusicFont.QuindicesimaBelow;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FermataShort] = AlphaTab.Rendering.Glyphs.MusicFont.FermataShort;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FermataNormal] = AlphaTab.Rendering.Glyphs.MusicFont.FermataNormal;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.FermataLong] = AlphaTab.Rendering.Glyphs.MusicFont.FermataLong;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicP] = AlphaTab.Rendering.Glyphs.MusicFont.DynamicP;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicF] = AlphaTab.Rendering.Glyphs.MusicFont.DynamicF;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicM] = AlphaTab.Rendering.Glyphs.MusicFont.DynamicM;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Accentuation] = AlphaTab.Rendering.Glyphs.MusicFont.Accentuation;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.HeavyAccentuation] = AlphaTab.Rendering.Glyphs.MusicFont.HeavyAccentuation;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal] = AlphaTab.Rendering.Glyphs.MusicFont.WaveHorizontal;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveVertical] = AlphaTab.Rendering.Glyphs.MusicFont.WaveVertical;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.PickStrokeDown] = AlphaTab.Rendering.Glyphs.MusicFont.PickStrokeDown;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.PickStrokeUp] = AlphaTab.Rendering.Glyphs.MusicFont.PickStrokeUp;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingThirtySecond] = AlphaTab.Rendering.Glyphs.MusicFont.TremoloPickingThirtySecond;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingSixteenth] = AlphaTab.Rendering.Glyphs.MusicFont.TremoloPickingSixteenth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingEighth] = AlphaTab.Rendering.Glyphs.MusicFont.TremoloPickingEighth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.UpperMordent] = AlphaTab.Rendering.Glyphs.MusicFont.UpperMordent;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.LowerMordent] = AlphaTab.Rendering.Glyphs.MusicFont.LowerMordent;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Turn] = AlphaTab.Rendering.Glyphs.MusicFont.Turn;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.OpenNote] = AlphaTab.Rendering.Glyphs.MusicFont.OpenNote;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.StoppedNote] = AlphaTab.Rendering.Glyphs.MusicFont.StoppedNote;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo] = AlphaTab.Rendering.Glyphs.MusicFont.Tempo;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalSharp] = AlphaTab.Rendering.Glyphs.MusicFont.AccidentalSharp;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalFlat] = AlphaTab.Rendering.Glyphs.MusicFont.AccidentalFlat;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalNatural] = AlphaTab.Rendering.Glyphs.MusicFont.AccidentalNatural;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefNeutral] = AlphaTab.Rendering.Glyphs.MusicFont.ClefNeutral;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestSixtyFourth] = AlphaTab.Rendering.Glyphs.MusicFont.RestSixtyFourth;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalDoubleFlat] = AlphaTab.Rendering.Glyphs.MusicFont.AccidentalDoubleFlat;
    AlphaTab.Rendering.Glyphs.MusicFont.SymbolLookup[AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalDoubleSharp] = AlphaTab.Rendering.Glyphs.MusicFont.AccidentalDoubleSharp;
});
AlphaTab.Rendering.Glyphs.MusicFontSymbol = {
    None: -1,
    ClefF: 32768,
    ClefC: 32769,
    RestThirtySecond: 32770,
    RestQuarter: 32771,
    GraceUp: 32772,
    GraceDown: 32773,
    Trill: 32774,
    ClefG: 32775,
    Num0: 32776,
    Num1: 32777,
    Num2: 32778,
    Num3: 32779,
    Num4: 32780,
    Num5: 32781,
    Num6: 32782,
    Num7: 32783,
    Num8: 32784,
    Num9: 32785,
    RestSixteenth: 32786,
    RestEighth: 32787,
    RestWhole: 32788,
    NoteWhole: 32789,
    NoteQuarter: 32790,
    NoteHalf: 32791,
    NoteDead: 32792,
    NoteHarmonic: 32793,
    NoteRideCymbal: 32794,
    NoteHiHat: 32795,
    NoteSideStick: 32796,
    NoteHiHatHalf: 32797,
    NoteChineseCymbal: 32798,
    FooterUpEighth: 32799,
    FooterUpSixteenth: 32800,
    FooterUpThirtySecond: 32801,
    FooterUpSixtyFourth: 32802,
    FooterDownEighth: 32803,
    FooterDownSixteenth: 32804,
    FooterDownThirtySecond: 32805,
    FooterDownSixtyFourth: 32806,
    SimileMark: 32807,
    SimileMark2: 32808,
    Coda: 32809,
    Segno: 32810,
    OttavaAbove: 32811,
    OttavaBelow: 32812,
    QuindicesimaAbove: 32813,
    QuindicesimaBelow: 32814,
    FermataShort: 32815,
    FermataNormal: 32816,
    FermataLong: 32817,
    DynamicP: 32818,
    DynamicF: 32819,
    DynamicM: 32820,
    Accentuation: 32821,
    HeavyAccentuation: 32822,
    WaveHorizontal: 32823,
    WaveVertical: 32824,
    PickStrokeDown: 32825,
    PickStrokeUp: 32826,
    TremoloPickingThirtySecond: 32827,
    TremoloPickingSixteenth: 32828,
    TremoloPickingEighth: 32829,
    UpperMordent: 32830,
    LowerMordent: 32831,
    Turn: 32832,
    OpenNote: 32833,
    StoppedNote: 32834,
    Tempo: 32835,
    AccidentalSharp: 32836,
    AccidentalFlat: 32837,
    AccidentalNatural: 32838,
    ClefNeutral: 32839,
    RestSixtyFourth: 32840,
    AccidentalDoubleFlat: 32841,
    AccidentalDoubleSharp: 32842
};
AlphaTab.Rendering.Glyphs.NaturalizeGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalNatural);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.NaturalizeGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NaturalizeGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.NoteHeadGlyph = function (x, y, duration, isGrace){
    this._isGrace = false;
    this._duration = AlphaTab.Model.Duration.Whole;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GetSymbol(duration));
    this._isGrace = isGrace;
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.NoteHeadGlyph.prototype = {
    DoLayout: function (){
        switch (this._duration){
            case AlphaTab.Model.Duration.Whole:
                this.Width = 14 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
                break;
            default:
                this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
                break;
        }
    },
    get_CanScale: function (){
        return false;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GraceScale = 0.5;
    AlphaTab.Rendering.Glyphs.NoteHeadGlyph.NoteHeadHeight = 9;
});
AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.Whole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteWhole;
        case AlphaTab.Model.Duration.Half:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHalf;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteQuarter;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.NoteNumberGlyph = function (x, y, n, isGrace){
    this._noteString = null;
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._isGrace = isGrace;
    if (!n.IsTieDestination){
        this._noteString = n.IsDead ? "X" : n.Fret.toString();
        if (n.IsGhost){
            this._noteString = "(" + this._noteString + ")";
        }
    }
    else if (n.Beat.Index == 0 || n.get_HasBend()){
        this._noteString = "(" + n.TieOrigin.Fret + ")";
    }
    else {
        this._noteString = "";
    }
};
AlphaTab.Rendering.Glyphs.NoteNumberGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    CalculateWidth: function (){
        this.Width = this.Renderer.get_Layout().Renderer.Canvas.MeasureText(this._noteString);
    },
    Paint: function (cx, cy, canvas){
        if (this._noteString != null){
            canvas.FillText(this._noteString.toLowerCase(), cx + this.X, cy + this.Y);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NoteNumberGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.NumberGlyph = function (x, y, number){
    this._number = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._number = number;
};
AlphaTab.Rendering.Glyphs.NumberGlyph.prototype = {
    get_CanScale: function (){
        return false;
    },
    DoLayout: function (){
        var i = this._number;
        while (i > 0){
            var num = i % 10;
            var gl = new AlphaTab.Rendering.Glyphs.DigitGlyph(0, 0, num);
            this.AddGlyph(gl);
            i = (i / 10) | 0;
        }
        this.Glyphs.reverse();
        var cx = 0;
        for (var j = 0,k = this.Glyphs.length; j < k; j++){
            var g = this.Glyphs[j];
            g.X = cx;
            g.Y = 0;
            g.Renderer = this.Renderer;
            g.DoLayout();
            cx += g.Width;
        }
        this.Width = cx;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NumberGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.PickStrokeGlyph = function (x, y, pickStroke){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.PickStrokeGlyph.GetSymbol(pickStroke));
};
AlphaTab.Rendering.Glyphs.PickStrokeGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
AlphaTab.Rendering.Glyphs.PickStrokeGlyph.GetSymbol = function (pickStroke){
    switch (pickStroke){
        case AlphaTab.Model.PickStrokeType.Up:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.PickStrokeUp;
        case AlphaTab.Model.PickStrokeType.Down:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.PickStrokeDown;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.PickStrokeGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.RepeatCloseGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.RepeatCloseGlyph.prototype = {
    DoLayout: function (){
        this.Width = (this.Renderer.get_IsLast() ? 11 : 13) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.get_TopPadding();
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.get_BottomPadding();
        var left = cx + this.X;
        var h = bottom - top;
        //circles 
        var circleSize = 1.5 * this.get_Scale();
        var middle = (top + bottom) / 2;
        var dotOffset = 3;
        canvas.FillCircle(left, middle - (circleSize * 3), circleSize);
        canvas.FillCircle(left, middle + (circleSize * 3), circleSize);
        // line
        left += (4 * this.get_Scale());
        canvas.BeginPath();
        canvas.MoveTo(left, top);
        canvas.LineTo(left, bottom);
        canvas.Stroke();
        // big bar
        left += (3 * this.get_Scale()) + 0.5;
        canvas.FillRect(left, top, blockWidth, h);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RepeatCloseGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.RepeatCountGlyph = function (x, y, count){
    this._count = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._count = count;
};
AlphaTab.Rendering.Glyphs.RepeatCountGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.BarNumberFont);
        var s = "x" + this._count;
        var w = canvas.MeasureText(s) / 1.5;
        canvas.FillText(s, cx + this.X - w, cy + this.Y);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RepeatCountGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.RepeatOpenGlyph = function (x, y, circleSize, dotOffset){
    this._dotOffset = 0;
    this._circleSize = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._dotOffset = dotOffset;
    this._circleSize = circleSize;
};
AlphaTab.Rendering.Glyphs.RepeatOpenGlyph.prototype = {
    DoLayout: function (){
        this.Width = 13 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.get_TopPadding();
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.get_BottomPadding();
        var left = cx + this.X + 0.5;
        // big bar
        var h = bottom - top;
        canvas.FillRect(left, top, blockWidth, h);
        // line
        left += (blockWidth * 2) - 0.5;
        canvas.BeginPath();
        canvas.MoveTo(left, top);
        canvas.LineTo(left, bottom);
        canvas.Stroke();
        //circles 
        left += 3 * this.get_Scale();
        var circleSize = this._circleSize * this.get_Scale();
        var middle = (top + bottom) / 2;
        canvas.FillCircle(left, middle - (circleSize * this._dotOffset), circleSize);
        canvas.FillCircle(left, middle + (circleSize * this._dotOffset), circleSize);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RepeatOpenGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreRestGlyph = function (x, y, duration){
    this._duration = AlphaTab.Model.Duration.Whole;
    this.Beat = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol(duration));
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.prototype = {
    DoLayout: function (){
        switch (this._duration){
            case AlphaTab.Model.Duration.Whole:
            case AlphaTab.Model.Duration.Half:
            case AlphaTab.Model.Duration.Quarter:
            case AlphaTab.Model.Duration.Eighth:
            case AlphaTab.Model.Duration.Sixteenth:
                this.Width = 9 * this.get_Scale();
                break;
            case AlphaTab.Model.Duration.ThirtySecond:
                this.Width = 12 * this.get_Scale();
                break;
            case AlphaTab.Model.Duration.SixtyFourth:
                this.Width = 14 * this.get_Scale();
                break;
        }
    },
    get_CanScale: function (){
        return false;
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this.Width / 2, cx + this.X + this.Width / 2);
        }
    }
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.Whole:
        case AlphaTab.Model.Duration.Half:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestWhole;
        case AlphaTab.Model.Duration.Quarter:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestQuarter;
        case AlphaTab.Model.Duration.Eighth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestEighth;
        case AlphaTab.Model.Duration.Sixteenth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestSixteenth;
        case AlphaTab.Model.Duration.ThirtySecond:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestThirtySecond;
        case AlphaTab.Model.Duration.SixtyFourth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestSixtyFourth;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreRestGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.RideCymbalGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteRideCymbal);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.RideCymbalGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RideCymbalGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.ScoreBeatContainerGlyph = function (beat){
    AlphaTab.Rendering.Glyphs.BeatContainerGlyph.call(this, beat);
};
AlphaTab.Rendering.ScoreBeatContainerGlyph.prototype = {
    CreateTies: function (n){
        // create a tie if any effect requires it
        // NOTE: we create 2 tie glyphs if we have a line break inbetween 
        // the two notes
        if (n.IsTieOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.TieDestination, this, false);
            this.Ties.push(tie);
        }
        if (n.IsTieDestination){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n.TieOrigin, n, this, true);
            this.Ties.push(tie);
        }
        else if (n.IsHammerPullOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.HammerPullDestination, this, false);
            this.Ties.push(tie);
        }
        else if (n.SlideType == AlphaTab.Model.SlideType.Legato){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.SlideTarget, this, false);
            this.Ties.push(tie);
        }
        // TODO: depending on the type we have other positioning
        // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
        if (n.SlideType != AlphaTab.Model.SlideType.None){
            var l = new AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph(n.SlideType, n, this);
            this.Ties.push(l);
        }
    }
};
$Inherit(AlphaTab.Rendering.ScoreBeatContainerGlyph, AlphaTab.Rendering.Glyphs.BeatContainerGlyph);
AlphaTab.Rendering.Glyphs.ScoreBeatGlyph = function (){
    this.NoteHeads = null;
    this.RestGlyph = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.prototype = {
    FinalizeGlyph: function (layout){
        if (this.NoteHeads != null){
            this.NoteHeads.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else if (this.RestGlyph != null){
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    ApplyGlyphSpacing: function (spacing){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.ApplyGlyphSpacing.call(this, spacing);
        if (this.NoteHeads != null){
            this.NoteHeads.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else if (this.RestGlyph != null){
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    DoLayout: function (){
        // create glyphs
        var sr = this.Renderer;
        if (!this.Container.Beat.IsEmpty){
            if (!this.Container.Beat.get_IsRest()){
                //
                // Note heads
                //
                this.NoteHeads = new AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph();
                this.NoteHeads.Beat = this.Container.Beat;
                this.NoteHeads.BeamingHelper = this.BeamingHelper;
                this.NoteLoop($CreateDelegate(this, this.CreateNoteGlyph));
                this.AddGlyph(this.NoteHeads);
                //
                // Note dots
                //
                if (this.Container.Beat.Dots > 0){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale(), false));
                    for (var i = 0; i < this.Container.Beat.Dots; i++){
                        var group = new AlphaTab.Rendering.Glyphs.GlyphGroup(0, 0);
                        this.NoteLoop($CreateAnonymousDelegate(this, function (n){
                            this.CreateBeatDot(sr.GetNoteLine(n), 2, group);
                        }));
                        this.AddGlyph(group);
                    }
                }
            }
            else {
                var dotLine = 0;
                var line = 0;
                var offset = 0;
                var dotOffset = 0;
                switch (this.Container.Beat.Duration){
                    case AlphaTab.Model.Duration.Whole:
                        line = 4;
                        dotLine = 4;
                        break;
                    case AlphaTab.Model.Duration.Half:
                        line = 5;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Quarter:
                        line = 7;
                        offset = -2;
                        dotLine = 4;
                        dotOffset = 3;
                        break;
                    case AlphaTab.Model.Duration.Eighth:
                        line = 8;
                        dotLine = 4;
                        dotOffset = 3;
                        break;
                    case AlphaTab.Model.Duration.Sixteenth:
                        line = 10;
                        dotLine = 4;
                        dotOffset = 3;
                        break;
                    case AlphaTab.Model.Duration.ThirtySecond:
                        line = 10;
                        dotLine = 2;
                        dotOffset = 2;
                        break;
                    case AlphaTab.Model.Duration.SixtyFourth:
                        line = 12;
                        dotLine = 2;
                        dotOffset = 2;
                        break;
                }
                var y = sr.GetScoreY(line, offset);
                this.RestGlyph = new AlphaTab.Rendering.Glyphs.ScoreRestGlyph(0, y, this.Container.Beat.Duration);
                this.RestGlyph.Beat = this.Container.Beat;
                this.RestGlyph.BeamingHelper = this.BeamingHelper;
                this.AddGlyph(this.RestGlyph);
                //
                // Note dots
                //
                if (this.Container.Beat.Dots > 0){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale(), false));
                    for (var i = 0; i < this.Container.Beat.Dots; i++){
                        var group = new AlphaTab.Rendering.Glyphs.GlyphGroup(0, 0);
                        this.CreateBeatDot(dotLine, dotOffset, group);
                        this.AddGlyph(group);
                    }
                }
            }
        }
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    },
    CreateBeatDot: function (line, offset, group){
        var sr = this.Renderer;
        group.AddGlyph(new AlphaTab.Rendering.Glyphs.CircleGlyph(0, sr.GetScoreY(line, offset + 2), 1.5 * this.get_Scale()));
    },
    CreateNoteHeadGlyph: function (n){
        var isGrace = this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None;
        if (n.Beat.Voice.Bar.Track.IsPercussion){
            var value = n.get_RealValue();
            if (value <= 30 || value >= 67 || AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys.hasOwnProperty(value)){
                return new AlphaTab.Rendering.Glyphs.NoteHeadGlyph(0, 0, AlphaTab.Model.Duration.Quarter, isGrace);
            }
            if (AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys.hasOwnProperty(value)){
                return new AlphaTab.Rendering.Glyphs.DrumSticksGlyph(0, 0, isGrace);
            }
            if (value == 46){
                return new AlphaTab.Rendering.Glyphs.HiHatGlyph(0, 0, isGrace);
            }
            if (value == 49 || value == 57){
                return new AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph(0, 0, isGrace);
            }
            if (value == 52){
                return new AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph(0, 0, isGrace);
            }
            if (value == 51 || value == 53 || value == 59){
                return new AlphaTab.Rendering.Glyphs.RideCymbalGlyph(0, 0, isGrace);
            }
            return new AlphaTab.Rendering.Glyphs.NoteHeadGlyph(0, 0, AlphaTab.Model.Duration.Quarter, isGrace);
        }
        if (n.IsDead){
            return new AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph(0, 0, isGrace);
        }
        if (n.HarmonicType == AlphaTab.Model.HarmonicType.None){
            return new AlphaTab.Rendering.Glyphs.NoteHeadGlyph(0, 0, n.Beat.Duration, isGrace);
        }
        return new AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph(0, 0, isGrace);
    },
    CreateNoteGlyph: function (n){
        var sr = this.Renderer;
        var noteHeadGlyph = this.CreateNoteHeadGlyph(n);
        // calculate y position
        var line = sr.GetNoteLine(n);
        noteHeadGlyph.Y = sr.GetScoreY(line, -1);
        this.NoteHeads.AddNoteGlyph(noteHeadGlyph, n, line);
        if (n.IsStaccato && !this.NoteHeads.BeatEffects.hasOwnProperty("Staccato")){
            this.NoteHeads.BeatEffects["Staccato"] = new AlphaTab.Rendering.Glyphs.CircleGlyph(0, 0, 1.5);
        }
        if (n.Accentuated == AlphaTab.Model.AccentuationType.Normal && !this.NoteHeads.BeatEffects.hasOwnProperty("Accent")){
            this.NoteHeads.BeatEffects["Accent"] = new AlphaTab.Rendering.Glyphs.AccentuationGlyph(0, 0, AlphaTab.Model.AccentuationType.Normal);
        }
        if (n.Accentuated == AlphaTab.Model.AccentuationType.Heavy && !this.NoteHeads.BeatEffects.hasOwnProperty("HAccent")){
            this.NoteHeads.BeatEffects["HAccent"] = new AlphaTab.Rendering.Glyphs.AccentuationGlyph(0, 0, AlphaTab.Model.AccentuationType.Heavy);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys = null;
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys = null;
    // ReSharper disable ForCanBeConvertedToForeach
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys = {};
    var normalKeyNotes = new Int32Array([32, 34, 35, 36, 38, 39, 40, 41, 43, 45, 47, 48, 50, 55, 56, 58, 60, 61]);
    for (var i = 0; i < normalKeyNotes.length; i++){
        AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.NormalKeys[normalKeyNotes[i]] = true;
    }
    AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys = {};
    var xKeyNotes = new Int32Array([31, 33, 37, 42, 44, 54, 62, 63, 64, 65, 66]);
    for (var i = 0; i < xKeyNotes.length; i++){
        AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.XKeys[xKeyNotes[i]] = true;
    }
    // ReSharper restore ForCanBeConvertedToForeach
});
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBeatGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph.prototype = {
    DoLayout: function (){
        this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, this.get_BeatDurationWidth() * this.get_Scale(), true));
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph.prototype = {
    ApplyGlyphSpacing: function (spacing){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.ApplyGlyphSpacing.call(this, spacing);
        if (this.Glyphs == null)
            return;
        // add spacing at the beginning, this way the elements are closer to the note head
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            this.Glyphs[i].X += spacing;
        }
    },
    DoLayout: function (){
        if (this.Container.Beat.BrushType != AlphaTab.Model.BrushType.None){
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.ScoreBrushGlyph(this.Container.Beat));
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale(), true));
        }
        if (!this.Container.Beat.get_IsRest()){
            var accidentals = new AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph();
            this.NoteLoop($CreateAnonymousDelegate(this, function (n){
                this.CreateAccidentalGlyph(n, accidentals);
            }));
            this.AddGlyph(accidentals);
        }
        // a small padding
        this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * (this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None ? 0.5 : 1) * this.get_Scale(), true));
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    },
    CreateAccidentalGlyph: function (n, accidentals){
        var sr = this.Renderer;
        var accidental = sr.AccidentalHelper.ApplyAccidental(n);
        var noteLine = sr.GetNoteLine(n);
        var isGrace = this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None;
        switch (accidental){
            case AlphaTab.Model.AccidentalType.Sharp:
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.SharpGlyph(0, sr.GetScoreY(noteLine, 0), isGrace));
                break;
            case AlphaTab.Model.AccidentalType.Flat:
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.FlatGlyph(0, sr.GetScoreY(noteLine, 0), isGrace));
                break;
            case AlphaTab.Model.AccidentalType.Natural:
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.NaturalizeGlyph(0, sr.GetScoreY(noteLine + 1, 0), isGrace));
                break;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.ScoreBrushGlyph = function (beat){
    this._beat = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._beat = beat;
};
AlphaTab.Rendering.Glyphs.ScoreBrushGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var scoreBarRenderer = this.Renderer;
        var lineSize = scoreBarRenderer.get_LineOffset();
        var topY = cy + this.Y + scoreBarRenderer.GetNoteY(this._beat.get_MaxNote());
        var bottomY = cy + this.Y + scoreBarRenderer.GetNoteY(this._beat.get_MinNote()) + lineSize;
        var arrowX = cx + this.X + this.Width / 2;
        var arrowSize = 8 * this.get_Scale();
        if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp || this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioDown){
            var size = 14 * this.get_Scale();
            var waveTop = topY;
            var waveBottom = bottomY;
            if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                waveTop -= lineSize;
                waveBottom -= arrowSize;
                var steps = Math.floor((waveBottom - waveTop) / size);
                for (var i = 0; i < steps; i++){
                    canvas.FillMusicFontSymbol(cx + this.X + (2 * this.get_Scale()), waveBottom - ((i + 1) * size), 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveVertical);
                }
            }
            else {
                waveTop += arrowSize;
                waveBottom += lineSize;
                var steps = Math.floor((waveBottom - waveTop) / size);
                for (var i = 0; i < steps; i++){
                    canvas.FillMusicFontSymbol(cx + this.X + (2 * this.get_Scale()), waveTop + (i * size), 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveVertical);
                }
            }
            if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, bottomY);
                canvas.LineTo(arrowX + arrowSize / 2, bottomY - arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, bottomY - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
            else if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioDown){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, topY);
                canvas.LineTo(arrowX + arrowSize / 2, topY + arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, topY + arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBrushGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo = function (glyph, line){
    this.Glyph = null;
    this.Line = 0;
    this.Glyph = glyph;
    this.Line = line;
};
AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph = function (){
    this._infos = null;
    this._noteLookup = null;
    this._tremoloPicking = null;
    this.MinNote = null;
    this.MaxNote = null;
    this.SpacingChanged = null;
    this.UpLineX = 0;
    this.DownLineX = 0;
    this.BeatEffects = null;
    this.Beat = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._infos = [];
    this.BeatEffects = {};
    this._noteLookup = {};
};
AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph.prototype = {
    get_Direction: function (){
        return this.BeamingHelper.get_Direction();
    },
    GetNoteX: function (note, onEnd){
        if (this._noteLookup.hasOwnProperty(note.String)){
            var n = this._noteLookup[note.String];
            var pos = this.X + n.X;
            if (onEnd){
                pos += n.Width;
            }
            return pos;
        }
        return 0;
    },
    GetNoteY: function (note){
        if (this._noteLookup.hasOwnProperty(note.String)){
            return this.Y + this._noteLookup[note.String].Y;
        }
        return 0;
    },
    AddNoteGlyph: function (noteGlyph, note, noteLine){
        var info = new AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo(noteGlyph, noteLine);
        this._infos.push(info);
        this._noteLookup[note.String] = noteGlyph;
        if (this.MinNote == null || this.MinNote.Line > info.Line){
            this.MinNote = info;
        }
        if (this.MaxNote == null || this.MaxNote.Line < info.Line){
            this.MaxNote = info;
        }
    },
    get_CanScale: function (){
        return false;
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this.UpLineX, cx + this.X + this.DownLineX);
        }
    },
    get_HasTopOverflow: function (){
        return this.MinNote != null && this.MinNote.Line < 0;
    },
    get_HasBottomOverflow: function (){
        return this.MaxNote != null && this.MaxNote.Line > 8;
    },
    DoLayout: function (){
        this._infos.sort($CreateAnonymousDelegate(this, function (a, b){
    return (a.Line-b.Line);
}));
        var padding = 0;
        // Std.int(4 * getScale());
        var displacedX = 0;
        var lastDisplaced = false;
        var lastLine = 0;
        var anyDisplaced = false;
        var w = 0;
        for (var i = 0,j = this._infos.length; i < j; i++){
            var g = this._infos[i].Glyph;
            g.Renderer = this.Renderer;
            g.DoLayout();
            g.X = 0;
            if (i == 0){
                displacedX = g.Width + 0;
            }
            else {
                // check if note needs to be repositioned
                if (Math.abs(lastLine - this._infos[i].Line) <= 1){
                    // reposition if needed
                    if (!lastDisplaced){
                        g.X = displacedX - (this.get_Scale());
                        anyDisplaced = true;
                        lastDisplaced = true;
                        // let next iteration know we are displace now
                    }
                    else {
                        lastDisplaced = false;
                        // let next iteration know that we weren't displaced now
                    }
                }
                else {
                    lastDisplaced = false;
                }
            }
            lastLine = this._infos[i].Line;
            w = Math.max(w, g.X + g.Width);
        }
        if (anyDisplaced){
            this.UpLineX = displacedX;
            this.DownLineX = displacedX;
        }
        else {
            this.UpLineX = w;
            this.DownLineX = 0;
        }
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.Glyph, this.BeatEffects, $CreateAnonymousDelegate(this, function (e){
            e.Renderer = this.Renderer;
            e.DoLayout();
        }));
        if (this.Beat.get_IsTremolo()){
            var direction = this.BeamingHelper.get_Direction();
            var offset;
            var baseNote = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? this.MinNote : this.MaxNote;
            var tremoloX = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? displacedX : 0;
            if (this.Beat.TremoloSpeed != null){
                var speed = this.Beat.TremoloSpeed;
                switch (speed){
                    case AlphaTab.Model.Duration.ThirtySecond:
                        offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -15 : 10;
                        break;
                    case AlphaTab.Model.Duration.Sixteenth:
                        offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -12 : 10;
                        break;
                    case AlphaTab.Model.Duration.Eighth:
                        offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -10 : 10;
                        break;
                    default:
                        offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -15 : 15;
                        break;
                }
            }
            else {
                offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -15 : 15;
            }
            this._tremoloPicking = new AlphaTab.Rendering.Glyphs.TremoloPickingGlyph(tremoloX, baseNote.Glyph.Y + offset * (this.get_Scale()), this.Beat.TremoloSpeed);
            this._tremoloPicking.Renderer = this.Renderer;
            this._tremoloPicking.DoLayout();
        }
        this.Width = w + 0;
    },
    Paint: function (cx, cy, canvas){
        var scoreRenderer = this.Renderer;
        //
        // Note Effects only painted once
        //
        var effectY = this.BeamingHelper.get_Direction() == AlphaTab.Rendering.Utils.BeamDirection.Up ? scoreRenderer.GetScoreY(this.MaxNote.Line, 13.5) : scoreRenderer.GetScoreY(this.MinNote.Line, -9);
        // TODO: take care of actual glyph height
        var effectSpacing = (this.BeamingHelper.get_Direction() == AlphaTab.Rendering.Utils.BeamDirection.Up) ? 7 * (this.get_Scale()) : -7 * (this.get_Scale());
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.Glyph, this.BeatEffects, $CreateAnonymousDelegate(this, function (g){
            g.Y = effectY;
            g.X = this.Width / 2;
            g.Paint(cx + this.X, cy + this.Y, canvas);
            effectY += effectSpacing;
        }));
        canvas.set_Color(this.Renderer.get_Layout().Renderer.RenderingResources.StaveLineColor);
        // TODO: Take care of beateffects in overflow
        var linePadding = 3 * (this.get_Scale());
        if (this.get_HasTopOverflow()){
            var l = -1;
            while (l >= this.MinNote.Line){
                // + 1 Because we want to place the line in the center of the note, not at the top
                var lY = cy + this.Y + scoreRenderer.GetScoreY(l + 1, -1);
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X - linePadding, lY);
                canvas.LineTo(cx + this.X + this.Width + linePadding, lY);
                canvas.Stroke();
                l -= 2;
            }
        }
        if (this.get_HasBottomOverflow()){
            var l = 11;
            while (l <= this.MaxNote.Line){
                var lY = cy + this.Y + scoreRenderer.GetScoreY(l + 1, -1);
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X - linePadding, lY);
                canvas.LineTo(cx + this.X + this.Width + linePadding, lY);
                canvas.Stroke();
                l += 2;
            }
        }
        canvas.set_Color(this.Renderer.get_Layout().Renderer.RenderingResources.MainGlyphColor);
        if (this._tremoloPicking != null)
            this._tremoloPicking.Paint(cx + this.X, cy + this.Y, canvas);
        for (var i = 0,j = this._infos.length; i < j; i++){
            var g = this._infos[i];
            g.Glyph.Renderer = this.Renderer;
            g.Glyph.Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph = function (type, startNote, parent){
    this._startNote = null;
    this._type = AlphaTab.Model.SlideType.None;
    this._parent = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._type = type;
    this._startNote = startNote;
    this._parent = parent;
};
AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var r = this.Renderer;
        var sizeX = 12 * this.get_Scale();
        var offsetX = 1 * this.get_Scale();
        var startX;
        var startY;
        var endX;
        var endY;
        switch (this._type){
            case AlphaTab.Model.SlideType.Shift:
            case AlphaTab.Model.SlideType.Legato:
                startX = cx + r.GetNoteX(this._startNote, true) + offsetX;
                startY = cy + r.GetNoteY(this._startNote) + 4.5;
                if (this._startNote.SlideTarget != null){
                endX = cx + r.GetNoteX(this._startNote.SlideTarget, false) - offsetX;
                endY = cy + r.GetNoteY(this._startNote.SlideTarget) + 4.5;
            }
                else {
                endX = cx + this._parent.X + this._parent.PostNotes.X + this._parent.PostNotes.Width;
                endY = startY;
            }
                break;
            case AlphaTab.Model.SlideType.IntoFromBelow:
                endX = cx + r.GetNoteX(this._startNote, false) - offsetX;
                endY = cy + r.GetNoteY(this._startNote) + 4.5;
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote) + 9;
                break;
            case AlphaTab.Model.SlideType.IntoFromAbove:
                endX = cx + r.GetNoteX(this._startNote, false) - offsetX;
                endY = cy + r.GetNoteY(this._startNote) + 4.5;
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote);
                break;
            case AlphaTab.Model.SlideType.OutUp:
                startX = cx + r.GetNoteX(this._startNote, true) + offsetX;
                startY = cy + r.GetNoteY(this._startNote) + 4.5;
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote);
                break;
            case AlphaTab.Model.SlideType.OutDown:
                startX = cx + r.GetNoteX(this._startNote, true) + offsetX;
                startY = cy + r.GetNoteY(this._startNote) + 4.5;
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote) + 9;
                break;
            default:
                return;
        }
        canvas.BeginPath();
        canvas.MoveTo(startX, startY);
        canvas.LineTo(endX, endY);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TieGlyph = function (startNote, endNote, parent, forEnd){
    this.StartNote = null;
    this.EndNote = null;
    this.Parent = null;
    this.YOffset = 0;
    this._forEnd = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.StartNote = startNote;
    this.EndNote = endNote;
    this.Parent = parent;
    this._forEnd = forEnd;
};
AlphaTab.Rendering.Glyphs.TieGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        if (this.EndNote == null)
            return;
        var startNoteRenderer = this.Renderer.get_Layout().GetRendererForBar(this.Renderer.Stave.StaveId, this.StartNote.Beat.Voice.Bar.Index);
        var endNoteRenderer = this.Renderer.get_Layout().GetRendererForBar(this.Renderer.Stave.StaveId, this.EndNote.Beat.Voice.Bar.Index);
        var startX = 0;
        var endX = 0;
        var startY = 0;
        var endY = 0;
        var shouldDraw = false;
        var parent = this.Parent;
        // if we are on the tie start, we check if we 
        // either can draw till the end note, or we just can draw till the bar end
        if (!this._forEnd){
            // line break or bar break
            if (startNoteRenderer != endNoteRenderer){
                startX = cx + startNoteRenderer.GetNoteX(this.StartNote, true);
                // line break: to bar end
                if (endNoteRenderer == null || startNoteRenderer.Stave != endNoteRenderer.Stave){
                    endX = cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width;
                }
                else {
                    endX = cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width;
                    endX += endNoteRenderer.GetNoteX(this.EndNote, true);
                }
                startY = cy + startNoteRenderer.GetNoteY(this.StartNote) + this.YOffset;
                endY = startY;
            }
            else {
                startX = cx + startNoteRenderer.GetNoteX(this.StartNote, true);
                endX = cx + endNoteRenderer.GetNoteX(this.EndNote, false);
                startY = cy + startNoteRenderer.GetNoteY(this.StartNote) + this.YOffset;
                endY = cy + endNoteRenderer.GetNoteY(this.EndNote) + this.YOffset;
            }
            shouldDraw = true;
        }
        else if (startNoteRenderer.Stave != endNoteRenderer.Stave){
            startX = cx;
            endX = cx + endNoteRenderer.GetNoteX(this.EndNote, true);
            startY = cy + endNoteRenderer.GetNoteY(this.EndNote) + this.YOffset;
            endY = startY;
            shouldDraw = true;
        }
        if (shouldDraw){
            AlphaTab.Rendering.Glyphs.TieGlyph.PaintTie(canvas, this.get_Scale(), startX, startY, endX, endY, this.GetBeamDirection(this.StartNote, startNoteRenderer) == AlphaTab.Rendering.Utils.BeamDirection.Down);
            canvas.Fill();
        }
    },
    GetBeamDirection: function (note, noteRenderer){
        return AlphaTab.Rendering.Utils.BeamDirection.Down;
    }
};
AlphaTab.Rendering.Glyphs.TieGlyph.PaintTie = function (canvas, scale, x1, y1, x2, y2, down){
    // ensure endX > startX
    if (x2 > x1){
        var t = x1;
        x1 = x2;
        x2 = t;
        t = y1;
        y1 = y2;
        y2 = t;
    }
    //
    // calculate control points 
    //
    var offset = 15 * scale;
    var size = 4 * scale;
    // normal vector
    var normalVectorX = (y2 - y1);
    var normalVectorY = (x2 - x1);
    var length = Math.sqrt((normalVectorX * normalVectorX) + (normalVectorY * normalVectorY));
    if (down)
        normalVectorX *= -1;
    else
        normalVectorY *= -1;
    // make to unit vector
    normalVectorX /= length;
    normalVectorY /= length;
    // center of connection
    var centerX = (x2 + x1) / 2;
    var centerY = (y2 + y1) / 2;
    // control points
    var cp1X = centerX + (offset * normalVectorX);
    var cp1Y = centerY + (offset * normalVectorY);
    var cp2X = centerX + ((offset - size) * normalVectorX);
    var cp2Y = centerY + ((offset - size) * normalVectorY);
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.QuadraticCurveTo(cp1X, cp1Y, x2, y2);
    canvas.QuadraticCurveTo(cp2X, cp2Y, x1, y1);
    canvas.ClosePath();
};
$Inherit(AlphaTab.Rendering.Glyphs.TieGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ScoreTieGlyph = function (startNote, endNote, parent, forEnd){
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startNote, endNote, parent, forEnd);
};
AlphaTab.Rendering.Glyphs.ScoreTieGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.TieGlyph.prototype.DoLayout.call(this);
        this.YOffset = (4.5);
    },
    GetBeamDirection: function (note, noteRenderer){
        return (noteRenderer).GetBeatDirection(note.Beat);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreTieGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.SharpGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.5 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalSharp);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.SharpGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.5 : 1) * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.SharpGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.SpacingGlyph = function (x, y, width, scaling){
    this._scaling = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._scaling = scaling;
    this.Width = width;
    this._scaling = scaling;
};
AlphaTab.Rendering.Glyphs.SpacingGlyph.prototype = {
    get_CanScale: function (){
        return this._scaling;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.SpacingGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph = function (beat){
    AlphaTab.Rendering.Glyphs.BeatContainerGlyph.call(this, beat);
};
AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph.prototype = {
    CreateTies: function (n){
        if (n.IsHammerPullOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, n.HammerPullDestination, this, false);
            this.Ties.push(tie);
        }
        else if (n.SlideType == AlphaTab.Model.SlideType.Legato){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, n.SlideTarget, this, false);
            this.Ties.push(tie);
        }
        if (n.SlideType != AlphaTab.Model.SlideType.None){
            var l = new AlphaTab.Rendering.Glyphs.TabSlideLineGlyph(n.SlideType, n, this);
            this.Ties.push(l);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph, AlphaTab.Rendering.Glyphs.BeatContainerGlyph);
AlphaTab.Rendering.Glyphs.TabBeatGlyph = function (){
    this.NoteNumbers = null;
    this.RestGlyph = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatGlyph.prototype = {
    DoLayout: function (){
        // create glyphs
        if (!this.Container.Beat.get_IsRest()){
            //
            // Note numbers
            this.NoteNumbers = new AlphaTab.Rendering.Glyphs.TabNoteChordGlyph(0, 0, this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None);
            this.NoteNumbers.Beat = this.Container.Beat;
            this.NoteNumbers.BeamingHelper = this.BeamingHelper;
            this.NoteLoop($CreateDelegate(this, this.CreateNoteGlyph));
            this.AddGlyph(this.NoteNumbers);
            //
            // Whammy Bar
            if (this.Container.Beat.get_HasWhammyBar() && !this.NoteNumbers.BeatEffects.hasOwnProperty("Whammy")){
                this.NoteNumbers.BeatEffects["Whammy"] = new AlphaTab.Rendering.Glyphs.WhammyBarGlyph(this.Container.Beat, this.Container);
            }
            //
            // Tremolo Picking
            if (this.Container.Beat.get_IsTremolo() && !this.NoteNumbers.BeatEffects.hasOwnProperty("Tremolo")){
                this.NoteNumbers.BeatEffects["Tremolo"] = new AlphaTab.Rendering.Glyphs.TremoloPickingGlyph(5 * this.get_Scale(), 0, this.Container.Beat.TremoloSpeed);
            }
        }
        else {
            this.RestGlyph = new AlphaTab.Rendering.Glyphs.TabRestGlyph();
            this.RestGlyph.Beat = this.Container.Beat;
            this.RestGlyph.BeamingHelper = this.BeamingHelper;
            this.AddGlyph(this.RestGlyph);
        }
        // left to right layout
        if (this.Glyphs == null)
            return;
        var w = 0;
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = w;
            g.Renderer = this.Renderer;
            g.DoLayout();
            w += g.Width;
        }
        this.Width = w;
    },
    FinalizeGlyph: function (layout){
        if (!this.Container.Beat.get_IsRest()){
            this.NoteNumbers.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else {
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    ApplyGlyphSpacing: function (spacing){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.ApplyGlyphSpacing.call(this, spacing);
        if (!this.Container.Beat.get_IsRest()){
            this.NoteNumbers.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else {
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    CreateNoteGlyph: function (n){
        var isGrace = this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None;
        var tr = this.Renderer;
        var noteNumberGlyph = new AlphaTab.Rendering.Glyphs.NoteNumberGlyph(0, 0, n, isGrace);
        var l = n.Beat.Voice.Bar.Track.Tuning.length - n.String + 1;
        noteNumberGlyph.Y = tr.GetTabY(l, -2);
        this.NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph.prototype = {
    DoLayout: function (){
        // note specific effects
        this.NoteLoop($CreateDelegate(this, this.CreateNoteGlyphs));
        this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, this.get_BeatDurationWidth() * this.get_Scale(), true));
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    },
    CreateNoteGlyphs: function (n){
        if (n.get_IsTrill()){
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale(), true));
            var trillNote = new AlphaTab.Model.Note();
            trillNote.IsGhost = true;
            trillNote.Fret = n.get_TrillFret();
            trillNote.String = n.String;
            var tr = this.Renderer;
            var trillNumberGlyph = new AlphaTab.Rendering.Glyphs.NoteNumberGlyph(0, 0, trillNote, true);
            var l = n.Beat.Voice.Bar.Track.Tuning.length - n.String;
            trillNumberGlyph.Y = tr.GetTabY(l, 0);
            this.AddGlyph(trillNumberGlyph);
        }
        if (n.get_HasBend()){
            var bendValueHeight = 6;
            var bendHeight = n.MaxBendPoint.Value * bendValueHeight;
            this.Renderer.RegisterOverflowTop(bendHeight);
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.BendGlyph(n, this.get_BeatDurationWidth() * this.get_Scale(), bendValueHeight));
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph.prototype = {
    DoLayout: function (){
        if (this.Container.Beat.BrushType != AlphaTab.Model.BrushType.None){
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.TabBrushGlyph(this.Container.Beat));
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale(), true));
        }
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.TabBrushGlyph = function (beat){
    this._beat = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._beat = beat;
};
AlphaTab.Rendering.Glyphs.TabBrushGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var tabBarRenderer = this.Renderer;
        var res = this.Renderer.get_Resources();
        var topY = cy + this.Y + tabBarRenderer.GetNoteY(this._beat.get_MaxStringNote()) - res.TablatureFont.Size / 2;
        var bottomY = cy + this.Y + tabBarRenderer.GetNoteY(this._beat.get_MinStringNote()) + res.TablatureFont.Size / 2;
        var arrowX = ((cx + this.X + this.Width / 2)) | 0;
        var arrowSize = 8 * this.get_Scale();
        if (this._beat.BrushType != AlphaTab.Model.BrushType.None){
            if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.BrushDown){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, topY);
                canvas.LineTo(arrowX, bottomY);
                canvas.Stroke();
            }
            else {
                var size = 14 * this.get_Scale();
                var waveTop = topY;
                var waveBottom = bottomY;
                if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                    waveBottom -= arrowSize;
                    var steps = Math.floor((waveBottom - waveTop) / size);
                    for (var i = 0; i < steps; i++){
                        canvas.FillMusicFontSymbol(cx + this.X + (2 * this.get_Scale()), waveBottom - ((i + 1) * size), 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveVertical);
                    }
                }
                else {
                    waveTop += arrowSize;
                    var steps = Math.floor((waveBottom - waveTop) / size);
                    for (var i = 0; i < steps; i++){
                        canvas.FillMusicFontSymbol(cx + this.X + (2 * this.get_Scale()), waveTop + (i * size), 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveVertical);
                    }
                }
            }
            if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, bottomY);
                canvas.LineTo(arrowX + arrowSize / 2, bottomY - arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, bottomY - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
            else {
                canvas.BeginPath();
                canvas.MoveTo(arrowX, topY);
                canvas.LineTo(arrowX + arrowSize / 2, topY + arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, topY + arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBrushGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabClefGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.TabClefGlyph.prototype = {
    DoLayout: function (){
        this.Width = 28 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        //TabBarRenderer tabBarRenderer = (TabBarRenderer)Renderer;
        var track = this.Renderer.Bar.Track;
        var res = this.Renderer.get_Resources();
        var startY = cy + this.Y + 10 * this.get_Scale() * 0.6;
        //var endY = cy + Y + tabBarRenderer.GetTabY(track.Tuning.Count, -2);
        // TODO: Find a more generic way of calculating the font size but for now this works.
        var fontScale = 1;
        var correction = 0;
        switch (track.Tuning.length){
            case 4:
                fontScale = 0.6;
                break;
            case 5:
                fontScale = 0.8;
                break;
            case 6:
                fontScale = 1.1;
                correction = 1;
                break;
            case 7:
                fontScale = 1.15;
                break;
            case 8:
                fontScale = 1.35;
                break;
        }
        var font = res.TabClefFont.Clone();
        font.Size = font.Size * fontScale;
        canvas.set_Font(font);
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        canvas.FillText("T", cx + this.X + this.Width / 2, startY);
        canvas.FillText("A", cx + this.X + this.Width / 2, startY + font.Size - (correction * this.get_Scale()));
        canvas.FillText("B", cx + this.X + this.Width / 2, startY + (font.Size - (correction * this.get_Scale())) * 2);
        canvas.set_TextAlign(old);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabClefGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabNoteChordGlyph = function (x, y, isGrace){
    this._notes = null;
    this._noteLookup = null;
    this._minNote = null;
    this._isGrace = false;
    this._centerX = 0;
    this.Beat = null;
    this.BeamingHelper = null;
    this.BeatEffects = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._isGrace = isGrace;
    this._notes = [];
    this.BeatEffects = {};
    this._noteLookup = {};
};
AlphaTab.Rendering.Glyphs.TabNoteChordGlyph.prototype = {
    GetNoteX: function (note, onEnd){
        if (this._noteLookup.hasOwnProperty(note.String)){
            var n = this._noteLookup[note.String];
            var pos = this.X + n.X;
            if (onEnd){
                n.CalculateWidth();
                pos += n.Width;
            }
            return pos;
        }
        return 0;
    },
    GetNoteY: function (note){
        if (this._noteLookup.hasOwnProperty(note.String)){
            return this.Y + this._noteLookup[note.String].Y;
        }
        return 0;
    },
    DoLayout: function (){
        var w = 0;
        for (var i = 0,j = this._notes.length; i < j; i++){
            var g = this._notes[i];
            g.Renderer = this.Renderer;
            g.DoLayout();
            if (g.Width > w){
                w = g.Width;
            }
        }
        var tabHeight = this.Renderer.get_Resources().TablatureFont.Size;
        var effectY = this.GetNoteY(this._minNote) + tabHeight / 2;
        // TODO: take care of actual glyph height
        var effectSpacing = 7 * this.get_Scale();
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.Glyph, this.BeatEffects, $CreateAnonymousDelegate(this, function (g){
            g.Y = effectY;
            g.X += this.Width / 2;
            g.Renderer = this.Renderer;
            effectY += effectSpacing;
            g.DoLayout();
        }));
        this._centerX = 0;
        this.Width = w;
    },
    AddNoteGlyph: function (noteGlyph, note){
        this._notes.push(noteGlyph);
        this._noteLookup[note.String] = noteGlyph;
        if (this._minNote == null || note.String < this._minNote.String)
            this._minNote = note;
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        var old = canvas.get_TextBaseline();
        canvas.set_TextBaseline(AlphaTab.Platform.Model.TextBaseline.Middle);
        canvas.set_Font(this._isGrace ? res.GraceFont : res.TablatureFont);
        for (var i = 0,j = this._notes.length; i < j; i++){
            var g = this._notes[i];
            g.Renderer = this.Renderer;
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
        canvas.set_TextBaseline(old);
        AlphaTab.Platform.Std.Foreach(AlphaTab.Rendering.Glyphs.Glyph, this.BeatEffects, $CreateAnonymousDelegate(this, function (g){
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }));
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null && !this.BeamingHelper.HasBeatLineX(this.Beat)){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this._centerX, cx + this.X + this._centerX);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabNoteChordGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabRestGlyph = function (){
    this.Beat = null;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.SpacingGlyph.call(this, 0, 0, 0, false);
};
AlphaTab.Rendering.Glyphs.TabRestGlyph.prototype = {
    DoLayout: function (){
        this.Width = 10 * this.get_Scale();
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX(this.Beat, cx + this.X + this.Width / 2, cx + this.X + this.Width / 2);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabRestGlyph, AlphaTab.Rendering.Glyphs.SpacingGlyph);
AlphaTab.Rendering.Glyphs.TabSlideLineGlyph = function (type, startNote, parent){
    this._startNote = null;
    this._type = AlphaTab.Model.SlideType.None;
    this._parent = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._type = type;
    this._startNote = startNote;
    this._parent = parent;
};
AlphaTab.Rendering.Glyphs.TabSlideLineGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    get_CanScale: function (){
        return false;
    },
    Paint: function (cx, cy, canvas){
        var r = this.Renderer;
        var sizeX = 12 * this.get_Scale();
        var sizeY = 3 * this.get_Scale();
        var startX;
        var startY;
        var endX;
        var endY;
        switch (this._type){
            case AlphaTab.Model.SlideType.Shift:
            case AlphaTab.Model.SlideType.Legato:
                var startOffsetY;
                var endOffsetY;
                if (this._startNote.SlideTarget == null){
                startOffsetY = 0;
                endOffsetY = 0;
            }
                else if (this._startNote.SlideTarget.Fret > this._startNote.Fret){
                startOffsetY = sizeY;
                endOffsetY = sizeY * -1;
            }
            else {
                startOffsetY = sizeY * -1;
                endOffsetY = sizeY;
            }
                startX = cx + r.GetNoteX(this._startNote, true);
                startY = cy + r.GetNoteY(this._startNote) + startOffsetY;
                if (this._startNote.SlideTarget != null){
                endX = cx + r.GetNoteX(this._startNote.SlideTarget, false);
                endY = cy + r.GetNoteY(this._startNote.SlideTarget) + endOffsetY;
            }
                else {
                endX = cx + this._parent.X + this._parent.PostNotes.X + this._parent.PostNotes.Width;
                endY = startY;
            }
                break;
            case AlphaTab.Model.SlideType.IntoFromBelow:
                endX = cx + r.GetNoteX(this._startNote, false);
                endY = cy + r.GetNoteY(this._startNote);
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote) + sizeY;
                break;
            case AlphaTab.Model.SlideType.IntoFromAbove:
                endX = cx + r.GetNoteX(this._startNote, false);
                endY = cy + r.GetNoteY(this._startNote);
                startX = endX - sizeX;
                startY = cy + r.GetNoteY(this._startNote) - sizeY;
                break;
            case AlphaTab.Model.SlideType.OutUp:
                startX = cx + r.GetNoteX(this._startNote, true);
                startY = cy + r.GetNoteY(this._startNote);
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote) - sizeY;
                break;
            case AlphaTab.Model.SlideType.OutDown:
                startX = cx + r.GetNoteX(this._startNote, true);
                startY = cy + r.GetNoteY(this._startNote);
                endX = startX + sizeX;
                endY = cy + r.GetNoteY(this._startNote) + sizeY;
                break;
            default:
                return;
        }
        canvas.BeginPath();
        canvas.MoveTo(startX, startY);
        canvas.LineTo(endX, endY);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabSlideLineGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabTieGlyph = function (startNote, endNote, parent, forEnd){
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startNote, endNote, parent, forEnd);
};
AlphaTab.Rendering.Glyphs.TabTieGlyph.prototype = {
    GetBeamDirection: function (note, noteRenderer){
        return this.StartNote.String > 3 ? AlphaTab.Rendering.Utils.BeamDirection.Down : AlphaTab.Rendering.Utils.BeamDirection.Up;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabTieGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.TempoGlyph = function (x, y, tempo){
    this._tempo = 0;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._tempo = tempo;
};
AlphaTab.Rendering.Glyphs.TempoGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.MarkerFont);
        canvas.FillMusicFontSymbol(cx + this.X, cy + this.Y, 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
        canvas.FillText("" + this._tempo, cx + this.X + (20 * this.get_Scale()), cy + this.X + (7 * this.get_Scale()));
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TempoGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TextGlyph = function (x, y, text, font, textAlign){
    this._text = null;
    this._font = null;
    this._textAlign = AlphaTab.Platform.Model.TextAlign.Left;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._text = text;
    this._font = font;
    this._textAlign = textAlign;
};
AlphaTab.Rendering.Glyphs.TextGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        canvas.set_Font(this._font);
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(this._textAlign);
        canvas.FillText(this._text, cx + this.X, cy + this.Y);
        canvas.set_TextAlign(old);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TextGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TimeSignatureGlyph = function (x, y, numerator, denominator){
    this._numerator = 0;
    this._denominator = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._numerator = numerator;
    this._denominator = denominator;
};
AlphaTab.Rendering.Glyphs.TimeSignatureGlyph.prototype = {
    get_CanScale: function (){
        return false;
    },
    DoLayout: function (){
        var numerator = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 0, this._numerator);
        var denominator = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 18 * this.get_Scale(), this._denominator);
        this.AddGlyph(numerator);
        this.AddGlyph(denominator);
        AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.DoLayout.call(this);
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = (this.Width - g.Width) / 2;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TimeSignatureGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph = function (x, y, duration){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.GetSymbol(duration));
};
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.prototype = {
    DoLayout: function (){
        this.Width = 12 * this.get_Scale();
    },
    get_CanScale: function (){
        return false;
    }
};
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.ThirtySecond:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingThirtySecond;
        case AlphaTab.Model.Duration.Sixteenth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingSixteenth;
        case AlphaTab.Model.Duration.Eighth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.TremoloPickingEighth;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TremoloPickingGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.TrillGlyph = function (x, y, scale){
    this._scale = 0;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._scale = scale;
};
AlphaTab.Rendering.Glyphs.TrillGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.MarkerFont);
        var textw = canvas.MeasureText("tr");
        canvas.FillText("tr", cx + this.X, cy + this.Y);
        var startX = textw;
        var endX = this.Width - startX;
        var step = 11 * this.get_Scale() * this._scale;
        var loops = Math.max(1, ((endX - startX) / step));
        var loopX = startX;
        var loopY = cy + this.Y + res.MarkerFont.Size / 2;
        for (var i = 0; i < loops; i++){
            canvas.FillMusicFontSymbol(cx + this.X + loopX, loopY, this._scale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal);
            loopX += step;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TrillGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.VibratoGlyph = function (x, y, scale){
    this._scale = 0;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._scale = scale;
};
AlphaTab.Rendering.Glyphs.VibratoGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        var step = 11 * this.get_Scale() * this._scale;
        var loops = Math.max(1, (this.Width / step));
        var loopX = 0;
        for (var i = 0; i < loops; i++){
            canvas.FillMusicFontSymbol(cx + this.X + loopX, cy + this.Y, this._scale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal);
            loopX += step;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.VibratoGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.VoiceContainerGlyph = function (x, y, voiceIndex){
    this.BeatGlyphs = null;
    this.VoiceIndex = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this.BeatGlyphs = [];
    this.VoiceIndex = voiceIndex;
};
AlphaTab.Rendering.Glyphs.VoiceContainerGlyph.prototype = {
    ApplyGlyphSpacing: function (spacing){
        var glyphSpacing = spacing / this.BeatGlyphs.length;
        var gx = 0;
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            var g = this.BeatGlyphs[i];
            g.X = gx;
            gx += g.Width + glyphSpacing;
            g.ApplyGlyphSpacing(glyphSpacing);
        }
        this.Width = gx;
    },
    RegisterMaxSizes: function (sizes){
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            var b = this.BeatGlyphs[i];
            b.RegisterMaxSizes(sizes);
        }
    },
    ApplySizes: function (sizes){
        this.Width = 0;
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            this.BeatGlyphs[i].X = (i == 0) ? 0 : this.BeatGlyphs[i - 1].X + this.BeatGlyphs[i - 1].Width;
            this.BeatGlyphs[i].ApplySizes(sizes);
        }
        if (this.BeatGlyphs.length > 0){
            this.Width = this.BeatGlyphs[this.BeatGlyphs.length - 1].X + this.BeatGlyphs[this.BeatGlyphs.length - 1].Width;
        }
    },
    AddGlyph: function (g){
        g.X = this.BeatGlyphs.length == 0 ? 0 : this.BeatGlyphs[this.BeatGlyphs.length - 1].X + this.BeatGlyphs[this.BeatGlyphs.length - 1].Width;
        g.Index = this.BeatGlyphs.length;
        g.Renderer = this.Renderer;
        g.DoLayout();
        this.BeatGlyphs.push(g);
        this.Width = g.X + g.Width;
    },
    DoLayout: function (){
    },
    FinalizeGlyph: function (layout){
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            this.BeatGlyphs[i].FinalizeGlyph(layout);
        }
    },
    Paint: function (cx, cy, canvas){
        //canvas.Color = new Color((byte) Random.Next(255), (byte) Random.Next(255), (byte) Random.Next(255), 128);
        //canvas.FillRect(cx + X, cy + Y, Width, 100);
        for (var i = 0,j = this.BeatGlyphs.length; i < j; i++){
            this.BeatGlyphs[i].Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.VoiceContainerGlyph.KeySizeBeat = "Beat";
});
$Inherit(AlphaTab.Rendering.Glyphs.VoiceContainerGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.WhammyBarGlyph = function (beat, parent){
    this._beat = null;
    this._parent = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._beat = beat;
    this._parent = parent;
};
AlphaTab.Rendering.Glyphs.WhammyBarGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        // 
        // Calculate the min and max offsets
        var minY = 0;
        var maxY = 0;
        var sizeY = 60 * this.get_Scale();
        if (this._beat.WhammyBarPoints.length >= 2){
            var dy = sizeY / 24;
            for (var i = 0,j = this._beat.WhammyBarPoints.length; i < j; i++){
                var pt = this._beat.WhammyBarPoints[i];
                var ptY = 0 - (dy * pt.Value);
                if (ptY > maxY)
                    maxY = ptY;
                if (ptY < minY)
                    minY = ptY;
            }
        }
        //
        // calculate the overflow 
        var tabBarRenderer = this.Renderer;
        var track = this.Renderer.Bar.Track;
        var tabTop = tabBarRenderer.GetTabY(0, -2);
        var tabBottom = tabBarRenderer.GetTabY(track.Tuning.length, -2);
        var absMinY = this.Y + minY + tabTop;
        var absMaxY = this.Y + maxY - tabBottom;
        if (absMinY < 0)
            tabBarRenderer.RegisterOverflowTop(Math.abs(absMinY));
        if (absMaxY > 0)
            tabBarRenderer.RegisterOverflowBottom(Math.abs(absMaxY));
    },
    Paint: function (cx, cy, canvas){
        var tabBarRenderer = this.Renderer;
        var res = this.Renderer.get_Resources();
        var startX = cx + this.X + this._parent.OnNotes.Width / 2;
        var endX = this._beat.NextBeat == null || this._beat.Voice != this._beat.NextBeat.Voice ? cx + this.X + this._parent.OnNotes.Width / 2 + this._parent.PostNotes.Width : cx + tabBarRenderer.GetBeatX(this._beat.NextBeat);
        var startY = cy + this.X;
        var textOffset = 3 * this.get_Scale();
        var sizeY = 60 * this.get_Scale();
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        if (this._beat.WhammyBarPoints.length >= 2){
            var dx = (endX - startX) / 60;
            var dy = sizeY / 24;
            canvas.BeginPath();
            for (var i = 0,j = this._beat.WhammyBarPoints.length - 1; i < j; i++){
                var pt1 = this._beat.WhammyBarPoints[i];
                var pt2 = this._beat.WhammyBarPoints[i + 1];
                if (pt1.Value == pt2.Value && i == this._beat.WhammyBarPoints.length - 2)
                    continue;
                var pt1X = startX + (dx * pt1.Offset);
                var pt1Y = startY - (dy * pt1.Value);
                var pt2X = startX + (dx * pt2.Offset);
                var pt2Y = startY - (dy * pt2.Value);
                canvas.MoveTo(pt1X, pt1Y);
                canvas.LineTo(pt2X, pt2Y);
                if (pt2.Value != 0){
                    var dv = pt2.Value / 4;
                    var up = (pt2.Value - pt1.Value) >= 0;
                    var s = "";
                    if (dv < 0)
                        s += "-";
                    if (dv >= 1 || dv <= -1)
                        s += Math.abs(dv) + " ";
                    dv -= dv | 0;
                    if (dv == 0.25)
                        s += "1/4";
                    else if (dv == 0.5)
                        s += "1/2";
                    else if (dv == 0.75)
                        s += "3/4";
                    canvas.set_Font(res.GraceFont);
                    //var size = canvas.MeasureText(s);
                    var sy = up ? pt2Y - res.GraceFont.Size - textOffset : pt2Y + textOffset;
                    var sx = pt2X;
                    canvas.FillText(s, sx, sy);
                }
            }
            canvas.Stroke();
        }
        canvas.set_TextAlign(old);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.WhammyBarGlyph.WhammyMaxOffset = 60;
});
$Inherit(AlphaTab.Rendering.Glyphs.WhammyBarGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.RenderFinishedEventArgs = function (){
    this.Width = 0;
    this.Height = 0;
    this.TotalWidth = 0;
    this.TotalHeight = 0;
    this.RenderResult = null;
};
AlphaTab.Rendering.Layout = AlphaTab.Rendering.Layout || {};
AlphaTab.Rendering.Layout.HeaderFooterElements = {
    None: 0,
    Title: 1,
    SubTitle: 2,
    Artist: 4,
    Album: 8,
    Words: 16,
    Music: 32,
    WordsAndMusic: 64,
    Copyright: 128,
    PageNumber: 256,
    All: 511
};
AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo = function (){
    this.Width = 0;
    this.MasterBars = null;
    this.MasterBars = [];
};
AlphaTab.Rendering.Layout.ScoreLayout = function (renderer){
    this._barRendererLookup = null;
    this.PartialRenderFinished = null;
    this.Renderer = null;
    this.Width = 0;
    this.Height = 0;
    this.Renderer = renderer;
    this._barRendererLookup = {};
};
AlphaTab.Rendering.Layout.ScoreLayout.prototype = {
    get_Scale: function (){
        return this.Renderer.Settings.Scale;
    },
    CreateEmptyStaveGroup: function (){
        var group = new AlphaTab.Rendering.Staves.StaveGroup();
        group.Layout = this;
        var isFirstTrack = true;
        for (var i = 0; i < this.Renderer.Tracks.length; i++){
            var track = this.Renderer.Tracks[i];
            for (var j = 0; j < this.Renderer.Settings.Staves.length; j++){
                var s = this.Renderer.Settings.Staves[j];
                if (AlphaTab.Environment.StaveFactories.hasOwnProperty(s.Id)){
                    var factory = AlphaTab.Environment.StaveFactories[s.Id](this);
                    if (factory.CanCreate(track) && (isFirstTrack || !factory.HideOnMultiTrack)){
                        group.AddStave(track, new AlphaTab.Rendering.Staves.Stave(s.Id, factory, s.AdditionalSettings));
                    }
                }
            }
            isFirstTrack = false;
        }
        return group;
    },
    RegisterBarRenderer: function (key, index, renderer){
        if (!this._barRendererLookup.hasOwnProperty(key)){
            this._barRendererLookup[key] = {};
        }
        this._barRendererLookup[key][index] = renderer;
    },
    UnregisterBarRenderer: function (key, index){
        if (this._barRendererLookup.hasOwnProperty(key)){
            var lookup = this._barRendererLookup[key];
            delete lookup[index];
        }
    },
    GetRendererForBar: function (key, index){
        if (this._barRendererLookup.hasOwnProperty(key) && this._barRendererLookup[key].hasOwnProperty(index)){
            return this._barRendererLookup[key][index];
        }
        return null;
    },
    add_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $CombineDelegates(this.PartialRenderFinished, value);
    },
    remove_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $RemoveDelegate(this.PartialRenderFinished, value);
    },
    OnPartialRenderFinished: function (e){
        if (this.PartialRenderFinished != null){
            this.PartialRenderFinished(e);
        }
    },
    RenderAnnotation: function (){
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
        var canvas = this.Renderer.Canvas;
        var resources = this.Renderer.RenderingResources;
        var height = (resources.CopyrightFont.Size * 2);
        this.Height += height;
        var x = this.Width / 2;
        canvas.BeginRender(this.Width, height);
        canvas.set_Color(resources.MainGlyphColor);
        canvas.set_Font(resources.CopyrightFont);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        canvas.FillText(msg, x, 0);
        var result = canvas.EndRender();
        this.OnPartialRenderFinished((function (){
            var $v2 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v2.Width = this.Width;
            $v2.Height = height;
            $v2.RenderResult = result;
            $v2.TotalWidth = this.Width;
            $v2.TotalHeight = this.Height;
            return $v2;
        }).call(this));
    }
};
AlphaTab.Rendering.Layout.HorizontalScreenLayout = function (renderer){
    this._group = null;
    AlphaTab.Rendering.Layout.ScoreLayout.call(this, renderer);
};
AlphaTab.Rendering.Layout.HorizontalScreenLayout.prototype = {
    DoLayoutAndRender: function (){
        if (this.Renderer.Settings.Staves.length == 0)
            return;
        var score = this.Renderer.Score;
        var canvas = this.Renderer.Canvas;
        var startIndex = this.Renderer.Settings.Layout.Get("start", 1);
        startIndex--;
        // map to array index
        startIndex = Math.min(score.MasterBars.length - 1, Math.max(0, startIndex));
        var currentBarIndex = startIndex;
        var endBarIndex = this.Renderer.Settings.Layout.Get("count", score.MasterBars.length);
        endBarIndex = startIndex + endBarIndex - 1;
        // map count to array index
        endBarIndex = Math.min(score.MasterBars.length - 1, Math.max(0, endBarIndex));
        this._group = this.CreateEmptyStaveGroup();
        this._group.X = AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[0];
        this._group.Y = AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[1];
        var countPerPartial = this.Renderer.Settings.Layout.Get("countPerPartial", 10);
        var partials = [];
        var currentPartial = new AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo();
        while (currentBarIndex <= endBarIndex){
            var result = this._group.AddBars(this.Renderer.Tracks, currentBarIndex);
            // if we detect that the new renderer is linked to the previous
            // renderer, we need to put it into the previous partial 
            var renderer = this._group.GetBarRenderer(currentBarIndex);
            if (currentPartial.MasterBars.length == 0 && result.IsLinkedToPrevious && partials.length > 0){
                var previousPartial = partials[partials.length - 1];
                previousPartial.MasterBars.push(score.MasterBars[currentBarIndex]);
                previousPartial.Width += renderer.Width;
            }
            else {
                currentPartial.MasterBars.push(score.MasterBars[currentBarIndex]);
                currentPartial.Width += renderer.Width;
                // no targetPartial here because previous partials already handled this code
                if (currentPartial.MasterBars.length >= countPerPartial){
                    if (partials.length == 0){
                        currentPartial.Width += this._group.X + this._group.AccoladeSpacing;
                    }
                    partials.push(currentPartial);
                    currentPartial = new AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo();
                }
            }
            currentBarIndex++;
        }
        // don't miss the last partial if not empty
        if (currentPartial.MasterBars.length >= 0){
            if (partials.length == 0){
                currentPartial.Width += this._group.X + this._group.AccoladeSpacing;
            }
            partials.push(currentPartial);
        }
        this._group.FinalizeGroup(this);
        this.Height = this._group.Y + this._group.get_Height() + AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[3];
        this.Width = this._group.X + this._group.Width + AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[2];
        // TODO: Find a good way to render the score partwise
        // we need to precalculate the final height somehow
        //canvas.BeginRender(Width, Height);
        //canvas.Color = Renderer.RenderingResources.MainGlyphColor;
        //canvas.TextAlign = TextAlign.Left;
        //_group.Paint(0, 0, Renderer.Canvas);
        //var result = canvas.EndRender();
        //OnPartialRenderFinished(new RenderFinishedEventArgs
        //{
        //    TotalWidth = Width,
        //    TotalHeight = y,
        //    Width = Width,
        //    Height = Height,
        //    RenderResult = result
        //});
        currentBarIndex = 0;
        for (var i = 0; i < partials.length; i++){
            var partial = partials[i];
            canvas.BeginRender(partial.Width, this.Height);
            canvas.set_Color(this.Renderer.RenderingResources.MainGlyphColor);
            canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
            var renderer = this._group.GetBarRenderer(partial.MasterBars[0].Index);
            var renderX = renderer.X + this._group.AccoladeSpacing;
            if (i == 0){
                renderX -= this._group.X + this._group.AccoladeSpacing;
            }
            this._group.PaintPartial(-renderX, this._group.Y, this.Renderer.Canvas, currentBarIndex, partial.MasterBars.length);
            var result = canvas.EndRender();
            this.OnPartialRenderFinished((function (){
                var $v3 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                $v3.TotalWidth = this.Width;
                $v3.TotalHeight = this.Height;
                $v3.Width = partial.Width;
                $v3.Height = this.Height;
                $v3.RenderResult = result;
                return $v3;
            }).call(this));
            currentBarIndex += partial.MasterBars.length;
        }
    },
    BuildBoundingsLookup: function (lookup){
        this._group.BuildBoundingsLookup(lookup);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding = new Float32Array([20, 20, 20, 20]);
    AlphaTab.Rendering.Layout.HorizontalScreenLayout.GroupSpacing = 20;
});
$Inherit(AlphaTab.Rendering.Layout.HorizontalScreenLayout, AlphaTab.Rendering.Layout.ScoreLayout);
AlphaTab.Rendering.Layout.PageViewLayout = function (renderer){
    this._groups = null;
    AlphaTab.Rendering.Layout.ScoreLayout.call(this, renderer);
};
AlphaTab.Rendering.Layout.PageViewLayout.prototype = {
    DoLayoutAndRender: function (){
        var x = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0];
        var y = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[1];
        this.Width = this.Renderer.Settings.Width;
        // 
        // 1. Score Info
        y = this.LayoutAndRenderScoreInfo(x, y);
        //
        // 2. One result per StaveGroup
        y = this.LayoutAndRenderScore(x, y);
        this.Height = y + AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[3];
    },
    LayoutAndRenderScoreInfo: function (x, y){
        var flags = this.Renderer.Settings.Layout.Get("hideInfo", false) ? AlphaTab.Rendering.Layout.HeaderFooterElements.None : AlphaTab.Rendering.Layout.HeaderFooterElements.All;
        var score = this.Renderer.Score;
        var scale = this.get_Scale();
        var canvas = this.Renderer.Canvas;
        var res = this.Renderer.RenderingResources;
        var glyphs = [];
        var str;
        if (!((score.Title==null)||(score.Title.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Title) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(this.Width / 2, y, score.Title, res.TitleFont, AlphaTab.Platform.Model.TextAlign.Center));
            y += (35 * scale);
        }
        if (!((score.SubTitle==null)||(score.SubTitle.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(this.Width / 2, y, score.SubTitle, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center));
            y += (20 * scale);
        }
        if (!((score.Artist==null)||(score.Artist.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Artist) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(this.Width / 2, y, score.Artist, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center));
            y += (20 * scale);
        }
        if (!((score.Album==null)||(score.Album.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Album) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(this.Width / 2, y, score.Album, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center));
            y += (20 * scale);
        }
        if (!((score.Music==null)||(score.Music.length==0)) && score.Music == score.Words && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(this.Width / 2, y, "Music and Words by " + score.Words, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Center));
            y += (20 * scale);
        }
        else {
            if (!((score.Music==null)||(score.Music.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Music) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
                glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(this.Width - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[2], y, "Music by " + score.Music, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Right));
            }
            if (!((score.Words==null)||(score.Words.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Words) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
                glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(x, y, "Words by " + score.Music, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Left));
            }
            y += (20 * scale);
        }
        y += (20 * scale);
        // tuning info
        if (this.Renderer.Tracks.length == 1 && !this.Renderer.Tracks[0].IsPercussion){
            var tuning = AlphaTab.Model.Tuning.FindTuning(this.Renderer.Tracks[0].Tuning);
            if (tuning != null){
                // Name
                glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(x, y, tuning.Name, res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left));
                y += (15 * scale);
                if (!tuning.IsStandard){
                    // Strings
                    var stringsPerColumn = (Math.ceil(this.Renderer.Tracks[0].Tuning.length / 2)) | 0;
                    var currentX = x;
                    var currentY = y;
                    for (var i = 0,j = this.Renderer.Tracks[0].Tuning.length; i < j; i++){
                        str = "(" + (i + 1) + ") = " + AlphaTab.Model.Tuning.GetTextForTuning(this.Renderer.Tracks[0].Tuning[i], false);
                        glyphs.push(new AlphaTab.Rendering.Glyphs.TextGlyph(currentX, currentY, str, res.EffectFont, AlphaTab.Platform.Model.TextAlign.Left));
                        currentY += (15 * scale);
                        if (i == stringsPerColumn - 1){
                            currentY = y;
                            currentX += (43 * scale);
                        }
                    }
                    y += (stringsPerColumn * (15 * scale));
                }
            }
        }
        y += 25 * scale;
        canvas.BeginRender(this.Width, y);
        canvas.set_Color(res.ScoreInfoColor);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        for (var i = 0; i < glyphs.length; i++){
            glyphs[i].Paint(0, 0, canvas);
        }
        var result = canvas.EndRender();
        this.OnPartialRenderFinished((function (){
            var $v4 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v4.Width = this.Width;
            $v4.Height = y;
            $v4.RenderResult = result;
            $v4.TotalWidth = this.Width;
            $v4.TotalHeight = y;
            return $v4;
        }).call(this));
        return y;
    },
    LayoutAndRenderScore: function (x, y){
        var score = this.Renderer.Score;
        var canvas = this.Renderer.Canvas;
        var startIndex = this.Renderer.Settings.Layout.Get("start", 1);
        startIndex--;
        // map to array index
        startIndex = Math.min(score.MasterBars.length - 1, Math.max(0, startIndex));
        var currentBarIndex = startIndex;
        var endBarIndex = this.Renderer.Settings.Layout.Get("count", score.MasterBars.length);
        if (endBarIndex < 0)
            endBarIndex = score.MasterBars.length;
        endBarIndex = startIndex + endBarIndex - 1;
        // map count to array index
        endBarIndex = Math.min(score.MasterBars.length - 1, Math.max(0, endBarIndex));
        this._groups = [];
        if (this.Renderer.Settings.Staves.length > 0){
            while (currentBarIndex <= endBarIndex){
                // create group and align set proper coordinates
                var group = this.CreateStaveGroup(currentBarIndex, endBarIndex);
                this._groups.push(group);
                group.X = x;
                group.Y = y;
                // finalize group (sizing etc).
                this.FitGroup(group);
                group.FinalizeGroup(this);
                // paint into canvas
                var height = group.get_Height() + (20 * this.get_Scale());
                canvas.BeginRender(this.Width, height);
                this.Renderer.Canvas.set_Color(this.Renderer.RenderingResources.MainGlyphColor);
                this.Renderer.Canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
                // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates 
                // since we use partial drawing
                group.Paint(0, -group.Y, canvas);
                // calculate coordinates for next group
                y += height;
                currentBarIndex = group.get_LastBarIndex() + 1;
                var result = canvas.EndRender();
                this.OnPartialRenderFinished((function (){
                    var $v5 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                    $v5.TotalWidth = this.Width;
                    $v5.TotalHeight = y;
                    $v5.Width = this.Width;
                    $v5.Height = height;
                    $v5.RenderResult = result;
                    return $v5;
                }).call(this));
            }
        }
        return y;
    },
    FitGroup: function (group){
        // calculate additional space for each bar (can be negative!)
        var barSpace = 0;
        var freeSpace = this.get_MaxWidth() - group.Width;
        if (freeSpace != 0 && group.MasterBars.length > 0){
            barSpace = freeSpace / group.MasterBars.length;
        }
        if (group.IsFull || barSpace < 0){
            // add it to the measures
            group.ApplyBarSpacing(barSpace);
        }
        this.Width = Math.max(this.Width, group.Width);
    },
    CreateStaveGroup: function (currentBarIndex, endIndex){
        var group = this.CreateEmptyStaveGroup();
        group.Index = this._groups.length;
        var barsPerRow = this.Renderer.Settings.Layout.Get("barsPerRow", -1);
        var maxWidth = this.get_MaxWidth();
        var end = endIndex + 1;
        for (var i = currentBarIndex; i < end; i++){
            group.AddBars(this.Renderer.Tracks, i);
            var groupIsFull = false;
            // can bar placed in this line?
            if (barsPerRow == -1 && ((group.Width) >= maxWidth && group.MasterBars.length != 0)){
                groupIsFull = true;
            }
            else if (group.MasterBars.length == barsPerRow + 1){
                groupIsFull = true;
            }
            if (groupIsFull){
                group.RevertLastBar();
                group.IsFull = true;
                return group;
            }
            group.X = 0;
        }
        return group;
    },
    get_MaxWidth: function (){
        return this.Renderer.Settings.Width - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0] - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[2];
    },
    BuildBoundingsLookup: function (lookup){
        for (var i = 0,j = this._groups.length; i < j; i++){
            this._groups[i].BuildBoundingsLookup(lookup);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Layout.PageViewLayout.PagePadding = new Float32Array([40, 40, 40, 40]);
    AlphaTab.Rendering.Layout.PageViewLayout.GroupSpacing = 20;
});
$Inherit(AlphaTab.Rendering.Layout.PageViewLayout, AlphaTab.Rendering.Layout.ScoreLayout);
AlphaTab.Rendering.RenderingResources = function (scale){
    this.MusicFont = null;
    this.CopyrightFont = null;
    this.TitleFont = null;
    this.SubTitleFont = null;
    this.WordsFont = null;
    this.EffectFont = null;
    this.TablatureFont = null;
    this.GraceFont = null;
    this.StaveLineColor = null;
    this.BarSeperatorColor = null;
    this.BarNumberFont = null;
    this.BarNumberColor = null;
    this.MarkerFont = null;
    this.TabClefFont = null;
    this.MainGlyphColor = null;
    this.Scale = 0;
    this.ScoreInfoColor = null;
    this.Init(scale);
};
AlphaTab.Rendering.RenderingResources.prototype = {
    Init: function (scale){
        this.Scale = scale;
        var musicFont = "alphaTab";
        var sansFont = "Arial";
        var serifFont = "Georgia";
        this.MusicFont = new AlphaTab.Platform.Model.Font(musicFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.EffectFont = new AlphaTab.Platform.Model.Font(serifFont, 12 * scale, AlphaTab.Platform.Model.FontStyle.Italic);
        this.CopyrightFont = new AlphaTab.Platform.Model.Font(sansFont, 12 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.TitleFont = new AlphaTab.Platform.Model.Font(serifFont, 32 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.SubTitleFont = new AlphaTab.Platform.Model.Font(serifFont, 20 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.WordsFont = new AlphaTab.Platform.Model.Font(serifFont, 15 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.TablatureFont = new AlphaTab.Platform.Model.Font(sansFont, 13 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.GraceFont = new AlphaTab.Platform.Model.Font(sansFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.StaveLineColor = new AlphaTab.Platform.Model.Color(165, 165, 165, 255);
        this.BarSeperatorColor = new AlphaTab.Platform.Model.Color(34, 34, 17, 255);
        this.BarNumberFont = new AlphaTab.Platform.Model.Font(sansFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.BarNumberColor = new AlphaTab.Platform.Model.Color(200, 0, 0, 255);
        this.MarkerFont = new AlphaTab.Platform.Model.Font(serifFont, 14 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.TabClefFont = new AlphaTab.Platform.Model.Font(sansFont, 18 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.ScoreInfoColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
        this.MainGlyphColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
    }
};
AlphaTab.Rendering.RhythmBarRenderer = function (bar, direction){
    this._direction = AlphaTab.Rendering.Utils.BeamDirection.Up;
    this._helpers = null;
    AlphaTab.Rendering.GroupedBarRenderer.call(this, bar);
    this._direction = direction;
};
AlphaTab.Rendering.RhythmBarRenderer.prototype = {
    DoLayout: function (){
        this._helpers = this.Stave.StaveGroup.Helpers.Helpers[this.Bar.Track.Index][this.Bar.Index];
        AlphaTab.Rendering.GroupedBarRenderer.prototype.DoLayout.call(this);
        this.Height = this.Stave.GetSetting("rhythm-height", 24) * this.get_Scale();
        this.IsEmpty = false;
    },
    CreateBeatGlyphs: function (){
        
        this.CreateVoiceGlyphs(this.Bar.Voices[0]);
    },
    CreateVoiceGlyphs: function (voice){
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            var b = voice.Beats[i];
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.PostNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            this.AddBeatGlyph(container);
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.Paint.call(this, cx, cy, canvas);
        for (var i = 0,j = this._helpers.BeamHelpers.length; i < j; i++){
            var v = this._helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                this.PaintBeamHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, v[k]);
            }
        }
    },
    PaintBeamHelper: function (cx, cy, canvas, h){
        if (h.Beats[0].GraceType != AlphaTab.Model.GraceType.None)
            return;
        var useBeams = this.Stave.GetSetting("use-beams", false);
        // check if we need to paint simple footer
        if (useBeams && h.Beats.length == 1){
            this.PaintFooter(cx, cy, canvas, h);
        }
        else {
            this.PaintBar(cx, cy, canvas, h);
        }
    },
    PaintBar: function (cx, cy, canvas, h){
        for (var i = 0,j = h.Beats.length; i < j; i++){
            var beat = h.Beats[i];
            if (h.HasBeatLineX(beat)){
                //
                // draw line 
                //
                var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
                var y1 = cy + this.Y;
                var y2 = cy + this.Y + this.Height;
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + beatLineX, y1);
                canvas.LineTo(cx + this.X + beatLineX, y2);
                canvas.Stroke();
                var brokenBarOffset = (6 * this.get_Scale());
                var barSpacing = (6 * this.get_Scale());
                var barSize = (3 * this.get_Scale());
                var barCount = AlphaTab.Model.ModelUtils.GetIndex(beat.Duration) - 2;
                var barStart = cy + this.Y;
                if (this._direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    barSpacing = -barSpacing;
                    barStart += this.Height;
                }
                for (var barIndex = 0; barIndex < barCount; barIndex++){
                    var barStartX;
                    var barEndX;
                    var barStartY;
                    var barEndY;
                    var barY = barStart + (barIndex * barSpacing);
                    // 
                    // Broken Bar to Next
                    //
                    if (h.Beats.length == 1){
                        barStartX = beatLineX;
                        barEndX = beatLineX + brokenBarOffset;
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                    else if (i < h.Beats.length - 1){
                        // full bar?
                        if (this.IsFullBarJoin(beat, h.Beats[i + 1], barIndex)){
                            barStartX = beatLineX;
                            barEndX = h.GetBeatLineX(h.Beats[i + 1]) + this.get_Scale();
                        }
                        else if (i == 0 || !this.IsFullBarJoin(h.Beats[i - 1], beat, barIndex)){
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        }
                        else {
                            continue;
                        }
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                    else if (i > 0 && !this.IsFullBarJoin(beat, h.Beats[i - 1], barIndex)){
                        barStartX = beatLineX - brokenBarOffset;
                        barEndX = beatLineX;
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                }
            }
        }
    },
    PaintFooter: function (cx, cy, canvas, h){
        var beat = h.Beats[0];
        if (beat.Duration == AlphaTab.Model.Duration.Whole){
            return;
        }
        //
        // draw line 
        //
        var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
        var topY = 0;
        var bottomY = this.Height;
        var beamY = this._direction == AlphaTab.Rendering.Utils.BeamDirection.Down ? bottomY : topY;
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X + beatLineX, cy + this.Y + topY);
        canvas.LineTo(cx + this.X + beatLineX, cy + this.Y + bottomY);
        canvas.Stroke();
        //
        // Draw beam 
        //
        var glyph = new AlphaTab.Rendering.Glyphs.BeamGlyph(beatLineX, beamY, beat.Duration, this._direction, false);
        glyph.Renderer = this;
        glyph.DoLayout();
        glyph.Paint(cx + this.X, cy + this.Y, canvas);
    },
    IsFullBarJoin: function (a, b, barIndex){
        return (AlphaTab.Model.ModelUtils.GetIndex(a.Duration) - 2 - barIndex > 0) && (AlphaTab.Model.ModelUtils.GetIndex(b.Duration) - 2 - barIndex > 0);
    }
};
AlphaTab.Rendering.RhythmBarRenderer.PaintSingleBar = function (canvas, x1, y1, x2, y2, size){
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.LineTo(x2, y2);
    canvas.LineTo(x2, y2 - size);
    canvas.LineTo(x1, y1 - size);
    canvas.ClosePath();
    canvas.Fill();
};
$Inherit(AlphaTab.Rendering.RhythmBarRenderer, AlphaTab.Rendering.GroupedBarRenderer);
AlphaTab.Rendering.RhythmBarRendererFactory = function (direction){
    this._direction = AlphaTab.Rendering.Utils.BeamDirection.Up;
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this._direction = direction;
    this.IsInAccolade = false;
    this.HideOnMultiTrack = false;
};
AlphaTab.Rendering.RhythmBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.RhythmBarRenderer(bar, this._direction);
    }
};
$Inherit(AlphaTab.Rendering.RhythmBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.ScoreBarRenderer = function (bar){
    this._helpers = null;
    this._startSpacing = false;
    this.AccidentalHelper = null;
    AlphaTab.Rendering.GroupedBarRenderer.call(this, bar);
    this.AccidentalHelper = new AlphaTab.Rendering.Utils.AccidentalHelper();
};
AlphaTab.Rendering.ScoreBarRenderer.prototype = {
    GetBeatDirection: function (beat){
        var g = this.GetOnNotesPosition(beat.Voice.Index, beat.Index);
        if (g != null){
            return g.NoteHeads.get_Direction();
        }
        return AlphaTab.Rendering.Utils.BeamDirection.Up;
    },
    GetNoteX: function (note, onEnd){
        var g = this.GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
        if (g != null){
            return g.Container.X + g.X + g.NoteHeads.GetNoteX(note, onEnd);
        }
        return 0;
    },
    GetNoteY: function (note){
        var beat = this.GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
        if (beat != null){
            return beat.NoteHeads.GetNoteY(note);
        }
        return 0;
    },
    get_TopPadding: function (){
        return this.get_GlyphOverflow();
    },
    get_BottomPadding: function (){
        return this.get_GlyphOverflow();
    },
    get_LineOffset: function (){
        return ((9) * this.get_Scale());
    },
    DoLayout: function (){
        this._helpers = this.Stave.StaveGroup.Helpers.Helpers[this.Bar.Track.Index][this.Bar.Index];
        AlphaTab.Rendering.GroupedBarRenderer.prototype.DoLayout.call(this);
        this.Height = (this.get_LineOffset() * 4) + this.get_TopPadding() + this.get_BottomPadding();
        if (this.Index == 0){
            this.Stave.RegisterStaveTop(this.get_GlyphOverflow());
            this.Stave.RegisterStaveBottom(this.Height - this.get_GlyphOverflow());
        }
        var top = this.GetScoreY(0, 0);
        var bottom = this.GetScoreY(8, 0);
        for (var i = 0,j = this._helpers.BeamHelpers.length; i < j; i++){
            var v = this._helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                //
                // max note (highest) -> top overflow
                // 
                var maxNoteY = this.GetScoreY(this.GetNoteLine(h.MaxNote), 0);
                if (h.get_Direction() == AlphaTab.Rendering.Utils.BeamDirection.Up){
                    maxNoteY -= this.GetStemSize(h.MaxDuration);
                    maxNoteY -= h.FingeringCount * this.get_Resources().GraceFont.Size;
                    if (h.HasTuplet){
                        maxNoteY -= this.get_Resources().EffectFont.Size * 2;
                    }
                }
                if (maxNoteY < top){
                    this.RegisterOverflowTop(Math.abs(maxNoteY));
                }
                //
                // min note (lowest) -> bottom overflow
                //t
                var minNoteY = this.GetScoreY(this.GetNoteLine(h.MinNote), 0);
                if (h.get_Direction() == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    minNoteY += this.GetStemSize(h.MaxDuration);
                    minNoteY += h.FingeringCount * this.get_Resources().GraceFont.Size;
                }
                if (minNoteY > bottom){
                    this.RegisterOverflowBottom(Math.abs(minNoteY) - bottom);
                }
            }
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.Paint.call(this, cx, cy, canvas);
        this.PaintBeams(cx, cy, canvas);
        this.PaintTuplets(cx, cy, canvas);
    },
    PaintTuplets: function (cx, cy, canvas){
        for (var i = 0,j = this._helpers.TupletHelpers.length; i < j; i++){
            var v = this._helpers.TupletHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintTupletHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeams: function (cx, cy, canvas){
        for (var i = 0,j = this._helpers.BeamHelpers.length; i < j; i++){
            var v = this._helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintBeamHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeamHelper: function (cx, cy, canvas, h){
        // check if we need to paint simple footer
        if (h.Beats.length == 1){
            this.PaintFooter(cx, cy, canvas, h);
        }
        else {
            this.PaintBar(cx, cy, canvas, h);
        }
    },
    PaintTupletHelper: function (cx, cy, canvas, h){
        var res = this.get_Resources();
        var oldAlign = canvas.get_TextAlign();
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        // check if we need to paint simple footer
        if (h.Beats.length == 1 || !h.get_IsFull()){
            for (var i = 0,j = h.Beats.length; i < j; i++){
                var beat = h.Beats[i];
                var beamingHelper = this._helpers.BeamHelperLookup[h.VoiceIndex][beat.Index];
                if (beamingHelper == null)
                    continue;
                var direction = beamingHelper.get_Direction();
                var tupletX = beamingHelper.GetBeatLineX(beat) + this.get_Scale();
                var tupletY = cy + this.Y + this.CalculateBeamY(beamingHelper, tupletX);
                var offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? res.EffectFont.Size * 1.8 : -3 * this.get_Scale();
                canvas.set_Font(res.EffectFont);
                canvas.FillText(h.Tuplet.toString(), cx + this.X + tupletX, tupletY - offset);
            }
        }
        else {
            var firstBeat = h.Beats[0];
            var lastBeat = h.Beats[h.Beats.length - 1];
            var firstBeamingHelper = this._helpers.BeamHelperLookup[h.VoiceIndex][firstBeat.Index];
            var lastBeamingHelper = this._helpers.BeamHelperLookup[h.VoiceIndex][lastBeat.Index];
            if (firstBeamingHelper != null && lastBeamingHelper != null){
                var direction = firstBeamingHelper.get_Direction();
                // 
                // Calculate the overall area of the tuplet bracket
                var startX = firstBeamingHelper.GetBeatLineX(firstBeat) + this.get_Scale();
                var endX = lastBeamingHelper.GetBeatLineX(lastBeat) + this.get_Scale();
                //
                // Calculate how many space the text will need
                canvas.set_Font(res.EffectFont);
                var s = h.Tuplet.toString();
                var sw = canvas.MeasureText(s);
                var sp = 3 * this.get_Scale();
                // 
                // Calculate the offsets where to break the bracket
                var middleX = (startX + endX) / 2;
                var offset1X = middleX - sw / 2 - sp;
                var offset2X = middleX + sw / 2 + sp;
                //
                // calculate the y positions for our bracket
                var startY = this.CalculateBeamY(firstBeamingHelper, startX);
                var offset1Y = this.CalculateBeamY(firstBeamingHelper, offset1X);
                var middleY = this.CalculateBeamY(firstBeamingHelper, middleX);
                var offset2Y = this.CalculateBeamY(lastBeamingHelper, offset2X);
                var endY = this.CalculateBeamY(lastBeamingHelper, endX);
                var offset = 10 * this.get_Scale();
                var size = 5 * this.get_Scale();
                if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    offset *= -1;
                    size *= -1;
                }
                //
                // draw the bracket
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + startX, ((cy + this.Y + startY - offset)) | 0);
                canvas.LineTo(cx + this.X + startX, ((cy + this.Y + startY - offset - size)) | 0);
                canvas.LineTo(cx + this.X + offset1X, ((cy + this.Y + offset1Y - offset - size)) | 0);
                canvas.Stroke();
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + offset2X, ((cy + this.Y + offset2Y - offset - size)) | 0);
                canvas.LineTo(cx + this.X + endX, ((cy + this.Y + endY - offset - size)) | 0);
                canvas.LineTo(cx + this.X + endX, ((cy + this.Y + endY - offset)) | 0);
                canvas.Stroke();
                //
                // Draw the string
                canvas.FillText(s, cx + this.X + middleX, cy + this.Y + middleY - offset - size - res.EffectFont.Size);
            }
        }
        canvas.set_TextAlign(oldAlign);
    },
    GetStemSize: function (duration){
        var size;
        switch (duration){
            case AlphaTab.Model.Duration.Half:
                size = 6;
                break;
            case AlphaTab.Model.Duration.Quarter:
                size = 6;
                break;
            case AlphaTab.Model.Duration.Eighth:
                size = 6;
                break;
            case AlphaTab.Model.Duration.Sixteenth:
                size = 6;
                break;
            case AlphaTab.Model.Duration.ThirtySecond:
                size = 7;
                break;
            case AlphaTab.Model.Duration.SixtyFourth:
                size = 8;
                break;
            default:
                size = 0;
                break;
        }
        return this.GetScoreY(size, 0);
    },
    CalculateBeamY: function (h, x){
        var correction = 4.5;
        var stemSize = this.GetStemSize(h.MaxDuration);
        return h.CalculateBeamY(stemSize, this.get_Scale(), x, this.get_Scale(), $CreateAnonymousDelegate(this, function (n){
            return this.GetScoreY(this.GetNoteLine(n), correction - 1);
        }));
    },
    PaintBar: function (cx, cy, canvas, h){
        for (var i = 0,j = h.Beats.length; i < j; i++){
            var beat = h.Beats[i];
            var correction = 4.5;
            //
            // draw line 
            //
            var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
            var direction = h.get_Direction();
            var y1 = cy + this.Y + (direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? this.GetScoreY(this.GetNoteLine(beat.get_MinNote()), correction - 1) : this.GetScoreY(this.GetNoteLine(beat.get_MaxNote()), correction - 1));
            var y2 = cy + this.Y + this.CalculateBeamY(h, beatLineX);
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X + beatLineX, y1);
            canvas.LineTo(cx + this.X + beatLineX, y2);
            canvas.Stroke();
            var fingeringY = y2;
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                fingeringY -= correction * 3;
            }
            else {
                fingeringY += correction * 3;
            }
            this.PaintFingering(canvas, beat, cx + this.X + beatLineX, direction, fingeringY);
            var brokenBarOffset = 6 * this.get_Scale();
            var barSpacing = 6 * this.get_Scale();
            var barSize = 3 * this.get_Scale();
            var barCount = AlphaTab.Model.ModelUtils.GetIndex(beat.Duration) - 2;
            var barStart = cy + this.Y;
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                barSpacing = -barSpacing;
                barSize = -barSize;
            }
            for (var barIndex = 0; barIndex < barCount; barIndex++){
                var barStartX;
                var barEndX;
                var barStartY;
                var barEndY;
                var barY = barStart + (barIndex * barSpacing);
                // 
                // Bar to Next?
                //
                if (i < h.Beats.length - 1){
                    // full bar?
                    if (this.IsFullBarJoin(beat, h.Beats[i + 1], barIndex)){
                        barStartX = beatLineX;
                        barEndX = h.GetBeatLineX(h.Beats[i + 1]) + this.get_Scale();
                    }
                    else if (i == 0 || !this.IsFullBarJoin(h.Beats[i - 1], beat, barIndex)){
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                    }
                    else {
                        continue;
                    }
                    barStartY = barY + this.CalculateBeamY(h, barStartX);
                    barEndY = barY + this.CalculateBeamY(h, barEndX);
                    AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                }
                else if (i > 0 && !this.IsFullBarJoin(beat, h.Beats[i - 1], barIndex)){
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    barStartY = barY + this.CalculateBeamY(h, barStartX);
                    barEndY = barY + this.CalculateBeamY(h, barEndX);
                    AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                }
            }
        }
    },
    IsFullBarJoin: function (a, b, barIndex){
        return (AlphaTab.Model.ModelUtils.GetIndex(a.Duration) - 2 - barIndex > 0) && (AlphaTab.Model.ModelUtils.GetIndex(b.Duration) - 2 - barIndex > 0);
    },
    PaintFooter: function (cx, cy, canvas, h){
        var beat = h.Beats[0];
        var isGrace = beat.GraceType != AlphaTab.Model.GraceType.None;
        var scaleMod = isGrace ? 0.5 : 1;
        //
        // draw line 
        //
        var stemSize = this.GetStemSize(h.MaxDuration);
        var correction = ((9 * scaleMod) / 2);
        var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
        var direction = h.get_Direction();
        var topY = this.GetScoreY(this.GetNoteLine(beat.get_MaxNote()), correction);
        var bottomY = this.GetScoreY(this.GetNoteLine(beat.get_MinNote()), correction);
        if (beat.Duration == AlphaTab.Model.Duration.Whole){
            correction += (13.5) * scaleMod;
        }
        var beamY;
        var fingeringY;
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
            bottomY += stemSize * scaleMod;
            beamY = bottomY;
            fingeringY = cy + this.Y + bottomY;
        }
        else {
            topY -= stemSize * scaleMod;
            beamY = topY;
            fingeringY = cy + this.Y + topY - correction;
        }
        this.PaintFingering(canvas, beat, cx + this.X + beatLineX, direction, fingeringY);
        if (beat.Duration == AlphaTab.Model.Duration.Whole){
            return;
        }
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X + beatLineX, cy + this.Y + topY);
        canvas.LineTo(cx + this.X + beatLineX, cy + this.Y + bottomY);
        canvas.Stroke();
        if (isGrace){
            var graceSizeY = 15 * this.get_Scale();
            var graceSizeX = 12 * this.get_Scale();
            canvas.BeginPath();
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                canvas.MoveTo(cx + this.X + beatLineX - (graceSizeX / 2), cy + this.Y + bottomY - graceSizeY);
                canvas.LineTo(cx + this.X + beatLineX + (graceSizeX / 2), cy + this.Y + bottomY);
            }
            else {
                canvas.MoveTo(cx + this.X + beatLineX - (graceSizeX / 2), cy + this.Y + topY + graceSizeY);
                canvas.LineTo(cx + this.X + beatLineX + (graceSizeX / 2), cy + this.Y + topY);
            }
            canvas.Stroke();
        }
        //
        // Draw beam 
        //
        if (beat.Duration > AlphaTab.Model.Duration.Quarter){
            var glyph = new AlphaTab.Rendering.Glyphs.BeamGlyph(beatLineX, beamY, beat.Duration, direction, isGrace);
            glyph.Renderer = this;
            glyph.DoLayout();
            glyph.Paint(cx + this.X, cy + this.Y, canvas);
        }
    },
    PaintFingering: function (canvas, beat, beatLineX, direction, topY){
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
            beatLineX -= 10 * this.get_Scale();
        }
        else {
            beatLineX += 3 * this.get_Scale();
            topY -= canvas.get_Font().Size;
        }
        // sort notes ascending in their value to ensure 
        // we are drawing the numbers according to their order on the stave 
        var noteList = beat.Notes.slice();
        noteList.sort($CreateAnonymousDelegate(this, function (a, b){
    return b.get_RealValue() - a.get_RealValue();
}));
        for (var n = 0; n < noteList.length; n++){
            var note = noteList[n];
            var text = null;
            if (note.LeftHandFinger != AlphaTab.Model.Fingers.Unknown){
                text = this.FingerToString(beat, note.LeftHandFinger, true);
            }
            else if (note.RightHandFinger != AlphaTab.Model.Fingers.Unknown){
                text = this.FingerToString(beat, note.RightHandFinger, false);
            }
            if (text == null){
                continue;
            }
            canvas.FillText(text, beatLineX, topY);
            topY -= ((canvas.get_Font().Size)) | 0;
        }
    },
    FingerToString: function (beat, finger, leftHand){
        if (this.get_Settings().ForcePianoFingering || AlphaTab.Audio.GeneralMidi.IsPiano(beat.Voice.Bar.Track.PlaybackInfo.Program)){
            switch (finger){
                case AlphaTab.Model.Fingers.Unknown:
                case AlphaTab.Model.Fingers.NoOrDead:
                    return null;
                case AlphaTab.Model.Fingers.Thumb:
                    return "1";
                case AlphaTab.Model.Fingers.IndexFinger:
                    return "2";
                case AlphaTab.Model.Fingers.MiddleFinger:
                    return "3";
                case AlphaTab.Model.Fingers.AnnularFinger:
                    return "4";
                case AlphaTab.Model.Fingers.LittleFinger:
                    return "5";
                default:
                    return null;
            }
        }
        else if (leftHand){
            switch (finger){
                case AlphaTab.Model.Fingers.Unknown:
                case AlphaTab.Model.Fingers.NoOrDead:
                    return "0";
                case AlphaTab.Model.Fingers.Thumb:
                    return "T";
                case AlphaTab.Model.Fingers.IndexFinger:
                    return "1";
                case AlphaTab.Model.Fingers.MiddleFinger:
                    return "2";
                case AlphaTab.Model.Fingers.AnnularFinger:
                    return "3";
                case AlphaTab.Model.Fingers.LittleFinger:
                    return "4";
                default:
                    return null;
            }
        }
        else {
            switch (finger){
                case AlphaTab.Model.Fingers.Unknown:
                case AlphaTab.Model.Fingers.NoOrDead:
                    return null;
                case AlphaTab.Model.Fingers.Thumb:
                    return "p";
                case AlphaTab.Model.Fingers.IndexFinger:
                    return "i";
                case AlphaTab.Model.Fingers.MiddleFinger:
                    return "m";
                case AlphaTab.Model.Fingers.AnnularFinger:
                    return "a";
                case AlphaTab.Model.Fingers.LittleFinger:
                    return "c";
                default:
                    return null;
            }
        }
    },
    CreatePreBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().IsRepeatStart){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.get_IsFirstOfLine() || this.Bar.Clef != this.Bar.PreviousBar.Clef){
            var offset = 0;
            switch (this.Bar.Clef){
                case AlphaTab.Model.Clef.Neutral:
                    offset = 4;
                    break;
                case AlphaTab.Model.Clef.F4:
                    offset = 4;
                    break;
                case AlphaTab.Model.Clef.C3:
                    offset = 6;
                    break;
                case AlphaTab.Model.Clef.C4:
                    offset = 4;
                    break;
                case AlphaTab.Model.Clef.G2:
                    offset = 6;
                    break;
            }
            this.CreateStartSpacing();
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.ClefGlyph(0, this.GetScoreY(offset, 0), this.Bar.Clef));
        }
        // Key signature
        if ((this.Bar.PreviousBar == null && this.Bar.get_MasterBar().KeySignature != 0) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().KeySignature != this.Bar.PreviousBar.get_MasterBar().KeySignature)){
            this.CreateStartSpacing();
            this.CreateKeySignatureGlyphs();
        }
        // Time Signature
        if ((this.Bar.PreviousBar == null) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureNumerator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureNumerator) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureDenominator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureDenominator)){
            this.CreateStartSpacing();
            this.CreateTimeSignatureGlyphs();
        }
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.BarNumberGlyph(0, this.GetScoreY(-1, -3), this.Bar.Index + 1, !this.Stave.IsFirstInAccolade));
        if (this.Bar.get_IsEmpty()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, (30 * this.get_Scale()), false));
        }
    },
    CreateBeatGlyphs: function (){
        
        this.CreateVoiceGlyphs(this.Bar.Voices[0]);
    },
    CreatePostBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().get_IsRepeatEnd()){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCloseGlyph(this.X, 0));
            if (this.Bar.get_MasterBar().RepeatCount > 2){
                var line = this.get_IsLast() || this.get_IsLastOfLine() ? -1 : -4;
                this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCountGlyph(0, this.GetScoreY(line, -3), this.Bar.get_MasterBar().RepeatCount));
            }
        }
        else if (this.Bar.get_MasterBar().IsDoubleBar){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 3 * this.get_Scale(), false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
        }
        else if (this.Bar.NextBar == null || !this.Bar.NextBar.get_MasterBar().IsRepeatStart){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, this.get_IsLast()));
        }
    },
    CreateStartSpacing: function (){
        if (this._startSpacing)
            return;
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 2 * this.get_Scale(), true));
        this._startSpacing = true;
    },
    CreateKeySignatureGlyphs: function (){
        var offsetClef = 0;
        var currentKey = this.Bar.get_MasterBar().KeySignature;
        var previousKey = this.Bar.PreviousBar == null ? 0 : this.Bar.PreviousBar.get_MasterBar().KeySignature;
        switch (this.Bar.Clef){
            case AlphaTab.Model.Clef.Neutral:
                offsetClef = 0;
                break;
            case AlphaTab.Model.Clef.G2:
                offsetClef = 0;
                break;
            case AlphaTab.Model.Clef.F4:
                offsetClef = 2;
                break;
            case AlphaTab.Model.Clef.C3:
                offsetClef = -1;
                break;
            case AlphaTab.Model.Clef.C4:
                offsetClef = 1;
                break;
        }
        // naturalize previous key
        // TODO: only naturalize the symbols needed 
        var naturalizeSymbols = Math.abs(previousKey);
        var previousKeyPositions = AlphaTab.Model.ModelUtils.KeySignatureIsSharp(previousKey) ? AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps : AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps;
        for (var i = 0; i < naturalizeSymbols; i++){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.NaturalizeGlyph(0, this.GetScoreY(previousKeyPositions[i] + offsetClef, 0), false));
        }
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        //var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (AlphaTab.Model.ModelUtils.KeySignatureIsSharp(currentKey)){
            for (var i = 0; i < Math.abs(currentKey); i++){
                this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SharpGlyph(0, this.GetScoreY(AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps[i] + offsetClef, 0), false));
            }
        }
        else {
            for (var i = 0; i < Math.abs(currentKey); i++){
                this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.FlatGlyph(0, this.GetScoreY(AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps[i] + offsetClef, 0), false));
            }
        }
    },
    CreateTimeSignatureGlyphs: function (){
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale(), true));
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.TimeSignatureGlyph(0, 0, this.Bar.get_MasterBar().TimeSignatureNumerator, this.Bar.get_MasterBar().TimeSignatureDenominator));
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            var container = new AlphaTab.Rendering.ScoreBeatContainerGlyph(b);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatGlyph();
            (container.OnNotes).BeamingHelper = this._helpers.BeamHelperLookup[v.Index][b.Index];
            container.PostNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph();
            this.AddBeatGlyph(container);
        }
    },
    GetNoteLine: function (n){
        return this.AccidentalHelper.GetNoteLine(n);
    },
    GetScoreY: function (steps, correction){
        return ((this.get_LineOffset() / 2) * steps) + (correction * this.get_Scale());
    },
    get_GlyphOverflow: function (){
        var res = this.get_Resources();
        return (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2);
    },
    PaintBackground: function (cx, cy, canvas){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.PaintBackground.call(this, cx, cy, canvas);
        var res = this.get_Resources();
        //var c = new Color((byte)Random.Next(255),
        //                  (byte)Random.Next(255),
        //                  (byte)Random.Next(255),
        //                  100);
        //canvas.Color = c;
        //canvas.FillRect(cx + X, cy + Y, Width, Height);
        //
        // draw string lines
        //
        canvas.set_Color(res.StaveLineColor);
        var lineY = cy + this.Y + this.get_GlyphOverflow();
        for (var i = 0; i < 5; i++){
            if (i > 0)
                lineY += this.get_LineOffset();
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X, lineY | 0);
            canvas.LineTo(cx + this.X + this.Width, lineY | 0);
            canvas.Stroke();
        }
        canvas.set_Color(res.MainGlyphColor);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps = new Int32Array([1, 4, 0, 3, 6, 2, 5]);
    AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps = new Int32Array([5, 2, 6, 3, 7, 4, 8]);
    AlphaTab.Rendering.ScoreBarRenderer.LineSpacing = 8;
});
AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar = function (canvas, x1, y1, x2, y2, size){
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.LineTo(x2, y2);
    canvas.LineTo(x2, y2 + size);
    canvas.LineTo(x1, y1 + size);
    canvas.ClosePath();
    canvas.Fill();
};
$Inherit(AlphaTab.Rendering.ScoreBarRenderer, AlphaTab.Rendering.GroupedBarRenderer);
AlphaTab.Rendering.ScoreBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
};
AlphaTab.Rendering.ScoreBarRendererFactory.prototype = {
    Create: function (bar){
        return new AlphaTab.Rendering.ScoreBarRenderer(bar);
    }
};
$Inherit(AlphaTab.Rendering.ScoreBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.ScoreRenderer = function (settings, param){
    this._currentLayoutMode = null;
    this.PreRender = null;
    this.PartialRenderFinished = null;
    this.RenderFinished = null;
    this.PostRenderFinished = null;
    this.Canvas = null;
    this.Score = null;
    this.Tracks = null;
    this.Layout = null;
    this.RenderingResources = null;
    this.Settings = null;
    this.Settings = settings;
    this.RenderingResources = new AlphaTab.Rendering.RenderingResources(1);
    if (settings.Engine == null || !AlphaTab.Environment.RenderEngines.hasOwnProperty(settings.Engine)){
        this.Canvas = AlphaTab.Environment.RenderEngines["default"](param);
    }
    else {
        this.Canvas = AlphaTab.Environment.RenderEngines[settings.Engine](param);
    }
    this.RecreateLayout();
};
AlphaTab.Rendering.ScoreRenderer.prototype = {
    RecreateLayout: function (){
        if (this._currentLayoutMode != this.Settings.Layout.Mode){
            if (this.Settings.Layout == null || !AlphaTab.Environment.LayoutEngines.hasOwnProperty(this.Settings.Layout.Mode)){
                this.Layout = AlphaTab.Environment.LayoutEngines["default"](this);
            }
            else {
                this.Layout = AlphaTab.Environment.LayoutEngines[this.Settings.Layout.Mode](this);
            }
            this.Layout.add_PartialRenderFinished($CreateDelegate(this, this.OnPartialRenderFinished));
            this._currentLayoutMode = this.Settings.Layout.Mode;
        }
    },
    Render: function (track){
        this.Score = track.Score;
        this.Tracks = [track];
        this.Invalidate();
    },
    RenderMultiple: function (tracks){
        if (tracks.length == 0){
            this.Score = null;
        }
        else {
            this.Score = tracks[0].Score;
        }
        this.Tracks = tracks;
        this.Invalidate();
    },
    Invalidate: function (){
        if (this.Tracks.length == 0)
            return;
        if (this.RenderingResources.Scale != this.Settings.Scale){
            this.RenderingResources.Init(this.Settings.Scale);
            this.Canvas.set_LineWidth(this.Settings.Scale);
        }
        this.Canvas.set_Resources(this.RenderingResources);
        this.OnPreRender();
        this.RecreateLayout();
        this.LayoutAndRender();
    },
    LayoutAndRender: function (){
        this.Layout.DoLayoutAndRender();
        this.Layout.RenderAnnotation();
        this.OnRenderFinished((function (){
            var $v6 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v6.TotalHeight = this.Layout.Height;
            $v6.TotalWidth = this.Layout.Width;
            return $v6;
        }).call(this));
        this.OnPostRenderFinished();
    },
    add_PreRender: function (value){
        this.PreRender = $CombineDelegates(this.PreRender, value);
    },
    remove_PreRender: function (value){
        this.PreRender = $RemoveDelegate(this.PreRender, value);
    },
    OnPreRender: function (){
        var handler = this.PreRender;
        if (handler != null)
            handler();
    },
    add_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $CombineDelegates(this.PartialRenderFinished, value);
    },
    remove_PartialRenderFinished: function (value){
        this.PartialRenderFinished = $RemoveDelegate(this.PartialRenderFinished, value);
    },
    OnPartialRenderFinished: function (e){
        var handler = this.PartialRenderFinished;
        if (handler != null)
            handler(e);
    },
    add_RenderFinished: function (value){
        this.RenderFinished = $CombineDelegates(this.RenderFinished, value);
    },
    remove_RenderFinished: function (value){
        this.RenderFinished = $RemoveDelegate(this.RenderFinished, value);
    },
    OnRenderFinished: function (e){
        var handler = this.RenderFinished;
        if (handler != null)
            handler(e);
    },
    add_PostRenderFinished: function (value){
        this.PostRenderFinished = $CombineDelegates(this.PostRenderFinished, value);
    },
    remove_PostRenderFinished: function (value){
        this.PostRenderFinished = $RemoveDelegate(this.PostRenderFinished, value);
    },
    OnPostRenderFinished: function (){
        var handler = this.PostRenderFinished;
        if (handler != null)
            handler();
    },
    BuildBoundingsLookup: function (){
        var lookup = new AlphaTab.Rendering.Utils.BoundingsLookup();
        this.Layout.BuildBoundingsLookup(lookup);
        return lookup;
    }
};
AlphaTab.Rendering.Staves = AlphaTab.Rendering.Staves || {};
AlphaTab.Rendering.Staves.BarSizeInfo = function (){
    this.FullWidth = 0;
    this.Sizes = null;
    this.PreNoteSizes = null;
    this.OnNoteSizes = null;
    this.PostNoteSizes = null;
    this.Sizes = {};
    this.PreNoteSizes = {};
    this.OnNoteSizes = {};
    this.PostNoteSizes = {};
    this.FullWidth = 0;
};
AlphaTab.Rendering.Staves.BarSizeInfo.prototype = {
    SetSize: function (key, size){
        this.Sizes[key] = size;
    },
    GetSize: function (key){
        if (this.Sizes.hasOwnProperty(key)){
            return this.Sizes[key];
        }
        return 0;
    },
    GetPreNoteSize: function (beat){
        if (this.PreNoteSizes.hasOwnProperty(beat)){
            return this.PreNoteSizes[beat];
        }
        return 0;
    },
    GetOnNoteSize: function (beat){
        if (this.OnNoteSizes.hasOwnProperty(beat)){
            return this.OnNoteSizes[beat];
        }
        return 0;
    },
    GetPostNoteSize: function (beat){
        if (this.PostNoteSizes.hasOwnProperty(beat)){
            return this.PostNoteSizes[beat];
        }
        return 0;
    },
    SetPreNoteSize: function (beat, size){
        this.PreNoteSizes[beat] = size;
    },
    SetOnNoteSize: function (beat, size){
        this.OnNoteSizes[beat] = size;
    },
    SetPostNoteSize: function (beat, size){
        this.PostNoteSizes[beat] = size;
    }
};
AlphaTab.Rendering.Staves.Stave = function (staveId, factory, settings){
    this._factory = null;
    this._settings = null;
    this.StaveTrackGroup = null;
    this.StaveGroup = null;
    this.BarRenderers = null;
    this.X = 0;
    this.Y = 0;
    this.Height = 0;
    this.Index = 0;
    this.StaveId = null;
    this.StaveTop = 0;
    this.TopSpacing = 0;
    this.BottomSpacing = 0;
    this.StaveBottom = 0;
    this.IsFirstInAccolade = false;
    this.IsLastInAccolade = false;
    this.BarRenderers = [];
    this.StaveId = staveId;
    this._factory = factory;
    this._settings = settings;
    this.TopSpacing = 10;
    this.BottomSpacing = 10;
    this.StaveTop = 0;
    this.StaveBottom = 0;
};
AlphaTab.Rendering.Staves.Stave.prototype = {
    GetSetting: function (key, def){
        if (this._settings.hasOwnProperty(key)){
            return (this._settings[key]);
        }
        return def;
    },
    get_IsInAccolade: function (){
        return this._factory.IsInAccolade;
    },
    RegisterStaveTop: function (offset){
        this.StaveTop = offset;
    },
    RegisterStaveBottom: function (offset){
        this.StaveBottom = offset;
    },
    AddBar: function (bar){
        var renderer = this._factory.Create(bar);
        renderer.Stave = this;
        renderer.Index = this.BarRenderers.length;
        renderer.DoLayout();
        this.BarRenderers.push(renderer);
        this.StaveGroup.Layout.RegisterBarRenderer(this.StaveId, bar.Index, renderer);
    },
    RevertLastBar: function (){
        var lastBar = this.BarRenderers[this.BarRenderers.length - 1];
        this.BarRenderers.splice(this.BarRenderers.length - 1,1);
        this.StaveGroup.Layout.UnregisterBarRenderer(this.StaveId, lastBar.Bar.Index);
    },
    ApplyBarSpacing: function (spacing){
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            this.BarRenderers[i].ApplyBarSpacing(spacing);
        }
    },
    get_TopOverflow: function (){
        var m = 0;
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            var r = this.BarRenderers[i];
            if (r.TopOverflow > m){
                m = r.TopOverflow;
            }
        }
        return m;
    },
    get_BottomOverflow: function (){
        var m = 0;
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            var r = this.BarRenderers[i];
            if (r.BottomOverflow > m){
                m = r.BottomOverflow;
            }
        }
        return m;
    },
    FinalizeStave: function (layout){
        var x = 0;
        this.Height = 0;
        var topOverflow = this.get_TopOverflow();
        var bottomOverflow = this.get_BottomOverflow();
        var isEmpty = true;
        for (var i = 0; i < this.BarRenderers.length; i++){
            this.BarRenderers[i].X = x;
            this.BarRenderers[i].Y = this.TopSpacing + topOverflow;
            this.Height = Math.max(this.Height, this.BarRenderers[i].Height);
            this.BarRenderers[i].FinalizeRenderer(layout);
            x += this.BarRenderers[i].Width;
            if (!this.BarRenderers[i].IsEmpty){
                isEmpty = false;
            }
        }
        if (!isEmpty){
            this.Height += this.TopSpacing + topOverflow + bottomOverflow + this.BottomSpacing;
        }
        else {
            this.Height = 0;
        }
    },
    Paint: function (cx, cy, canvas, startIndex, count){
        if (this.Height == 0 || count == 0)
            return;
        for (var i = startIndex,j = Math.min(startIndex + count, this.BarRenderers.length); i < j; i++){
            this.BarRenderers[i].Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
AlphaTab.Rendering.Staves.StaveTrackGroup = function (staveGroup, track){
    this.Track = null;
    this.StaveGroup = null;
    this.Staves = null;
    this.FirstStaveInAccolade = null;
    this.LastStaveInAccolade = null;
    this.StaveGroup = staveGroup;
    this.Track = track;
    this.Staves = [];
};
AlphaTab.Rendering.Staves.AddBarsToStaveGroupResult = function (){
    this.Width = 0;
    this.IsLinkedToPrevious = false;
};
AlphaTab.Rendering.Staves.StaveGroup = function (){
    this._firstStaveInAccolade = null;
    this._lastStaveInAccolade = null;
    this._accoladeSpacingCalculated = false;
    this._allStaves = null;
    this.X = 0;
    this.Y = 0;
    this.Index = 0;
    this.AccoladeSpacing = 0;
    this.IsFull = false;
    this.Width = 0;
    this.MasterBars = null;
    this.Staves = null;
    this.Layout = null;
    this.Helpers = null;
    this.MasterBars = [];
    this.Staves = [];
    this._allStaves = [];
    this.Width = 0;
    this.Index = 0;
    this._accoladeSpacingCalculated = false;
    this.AccoladeSpacing = 0;
    this.Helpers = new AlphaTab.Rendering.Utils.BarHelpersGroup();
};
AlphaTab.Rendering.Staves.StaveGroup.prototype = {
    get_LastBarIndex: function (){
        return this.MasterBars[this.MasterBars.length - 1].Index;
    },
    AddBars: function (tracks, barIndex){
        if (tracks.length == 0)
            return null;
        var result = new AlphaTab.Rendering.Staves.AddBarsToStaveGroupResult();
        var score = tracks[0].Score;
        var masterBar = score.MasterBars[barIndex];
        this.MasterBars.push(masterBar);
        this.Helpers.BuildHelpers(tracks, barIndex);
        if (!this._accoladeSpacingCalculated && this.Index == 0){
            this._accoladeSpacingCalculated = true;
            var canvas = this.Layout.Renderer.Canvas;
            var res = this.Layout.Renderer.RenderingResources.EffectFont;
            canvas.set_Font(res);
            for (var i = 0; i < tracks.length; i++){
                this.AccoladeSpacing = Math.max(this.AccoladeSpacing, canvas.MeasureText(tracks[i].ShortName));
            }
            this.AccoladeSpacing += (20);
            this.Width += this.AccoladeSpacing;
        }
        // add renderers
        var maxSizes = new AlphaTab.Rendering.Staves.BarSizeInfo();
        for (var i = 0,j = this.Staves.length; i < j; i++){
            var g = this.Staves[i];
            for (var k = 0,l = g.Staves.length; k < l; k++){
                var s = g.Staves[k];
                s.AddBar(g.Track.Bars[barIndex]);
                s.BarRenderers[s.BarRenderers.length - 1].RegisterMaxSizes(maxSizes);
                if (s.BarRenderers[s.BarRenderers.length - 1].IsLinkedToPrevious){
                    result.IsLinkedToPrevious = true;
                }
            }
        }
        // ensure same widths of new renderer
        var realWidth = 0;
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            var s = this._allStaves[i];
            s.BarRenderers[s.BarRenderers.length - 1].ApplySizes(maxSizes);
            if (s.BarRenderers[s.BarRenderers.length - 1].Width > realWidth){
                realWidth = s.BarRenderers[s.BarRenderers.length - 1].Width;
            }
        }
        this.Width += realWidth;
        result.Width = realWidth;
        return result;
    },
    GetBarRenderer: function (barIndex){
        var stave = this._firstStaveInAccolade;
        if (barIndex >= stave.BarRenderers.length){
            return null;
        }
        return stave.BarRenderers[barIndex];
    },
    GetStaveTrackGroup: function (track){
        for (var i = 0,j = this.Staves.length; i < j; i++){
            var g = this.Staves[i];
            if (g.Track == track){
                return g;
            }
        }
        return null;
    },
    AddStave: function (track, stave){
        var group = this.GetStaveTrackGroup(track);
        if (group == null){
            group = new AlphaTab.Rendering.Staves.StaveTrackGroup(this, track);
            this.Staves.push(group);
        }
        stave.StaveTrackGroup = group;
        stave.StaveGroup = this;
        stave.Index = this._allStaves.length;
        this._allStaves.push(stave);
        group.Staves.push(stave);
        if (stave.get_IsInAccolade()){
            if (this._firstStaveInAccolade == null){
                this._firstStaveInAccolade = stave;
                stave.IsFirstInAccolade = true;
            }
            if (group.FirstStaveInAccolade == null){
                group.FirstStaveInAccolade = stave;
            }
            if (this._lastStaveInAccolade == null){
                this._lastStaveInAccolade = stave;
                stave.IsLastInAccolade = true;
            }
            if (this._lastStaveInAccolade != null){
                this._lastStaveInAccolade.IsLastInAccolade = false;
            }
            this._lastStaveInAccolade = stave;
            this._lastStaveInAccolade.IsLastInAccolade = true;
            group.LastStaveInAccolade = stave;
        }
    },
    get_Height: function (){
        return this._allStaves[this._allStaves.length - 1].Y + this._allStaves[this._allStaves.length - 1].Height;
    },
    RevertLastBar: function (){
        if (this.MasterBars.length > 1){
            this.MasterBars.splice(this.MasterBars.length - 1,1);
            var w = 0;
            for (var i = 0,j = this._allStaves.length; i < j; i++){
                var s = this._allStaves[i];
                w = Math.max(w, s.BarRenderers[s.BarRenderers.length - 1].Width);
                s.RevertLastBar();
            }
            this.Width -= w;
        }
    },
    ApplyBarSpacing: function (spacing){
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].ApplyBarSpacing(spacing);
        }
        this.Width += this.MasterBars.length * spacing;
    },
    Paint: function (cx, cy, canvas){
        this.PaintPartial(cx + this.X, cy + this.Y, canvas, 0, this.MasterBars.length);
    },
    PaintPartial: function (cx, cy, canvas, startIndex, count){
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].Paint(cx, cy, canvas, startIndex, count);
        }
        var res = this.Layout.Renderer.RenderingResources;
        if (this.Staves.length > 0 && startIndex == 0){
            //
            // Draw start grouping
            // 
            if (this._firstStaveInAccolade != null && this._lastStaveInAccolade != null){
                //
                // draw grouping line for all staves
                //
                var firstStart = cy + this._firstStaveInAccolade.Y + this._firstStaveInAccolade.StaveTop + this._firstStaveInAccolade.TopSpacing + this._firstStaveInAccolade.get_TopOverflow();
                var lastEnd = cy + this._lastStaveInAccolade.Y + this._lastStaveInAccolade.TopSpacing + this._lastStaveInAccolade.get_TopOverflow() + this._lastStaveInAccolade.StaveBottom;
                var acooladeX = cx + this._firstStaveInAccolade.X;
                canvas.set_Color(res.BarSeperatorColor);
                canvas.BeginPath();
                canvas.MoveTo(acooladeX, firstStart);
                canvas.LineTo(acooladeX, lastEnd);
                canvas.Stroke();
            }
            //
            // Draw accolade for each track group
            // 
            canvas.set_Font(res.EffectFont);
            for (var i = 0,j = this.Staves.length; i < j; i++){
                var g = this.Staves[i];
                if (g.FirstStaveInAccolade != null && g.LastStaveInAccolade != null){
                    var firstStart = cy + g.FirstStaveInAccolade.Y + g.FirstStaveInAccolade.StaveTop + g.FirstStaveInAccolade.TopSpacing + g.FirstStaveInAccolade.get_TopOverflow();
                    var lastEnd = cy + g.LastStaveInAccolade.Y + g.LastStaveInAccolade.TopSpacing + g.LastStaveInAccolade.get_TopOverflow() + g.LastStaveInAccolade.StaveBottom;
                    var acooladeX = cx + g.FirstStaveInAccolade.X;
                    var barSize = (3 * this.Layout.Renderer.Settings.Scale);
                    var barOffset = barSize;
                    var accoladeStart = firstStart - (barSize * 4);
                    var accoladeEnd = lastEnd + (barSize * 4);
                    // text
                    if (this.Index == 0){
                        canvas.FillText(g.Track.ShortName, cx + (10 * this.Layout.get_Scale()), firstStart);
                    }
                    // rect
                    canvas.FillRect(acooladeX - barOffset - barSize, accoladeStart, barSize, accoladeEnd - accoladeStart);
                    var spikeStartX = acooladeX - barOffset - barSize;
                    var spikeEndX = acooladeX + barSize * 2;
                    // top spike
                    canvas.BeginPath();
                    canvas.MoveTo(spikeStartX, accoladeStart);
                    canvas.BezierCurveTo(spikeStartX, accoladeStart, spikeStartX, accoladeStart, spikeEndX, accoladeStart - barSize);
                    canvas.BezierCurveTo(acooladeX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize);
                    canvas.ClosePath();
                    canvas.Fill();
                    // bottom spike 
                    canvas.BeginPath();
                    canvas.MoveTo(spikeStartX, accoladeEnd);
                    canvas.BezierCurveTo(spikeStartX, accoladeEnd, acooladeX, accoladeEnd, spikeEndX, accoladeEnd + barSize);
                    canvas.BezierCurveTo(acooladeX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
            }
        }
    },
    FinalizeGroup: function (scoreLayout){
        var currentY = 0;
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].X = this.AccoladeSpacing;
            this._allStaves[i].Y = (currentY);
            this._allStaves[i].FinalizeStave(scoreLayout);
            currentY += this._allStaves[i].Height;
        }
    },
    BuildBoundingsLookup: function (lookup){
        var visualTop = this.Y + this._firstStaveInAccolade.Y;
        var visualBottom = this.Y + this._lastStaveInAccolade.Y + this._lastStaveInAccolade.Height;
        var realTop = this.Y + this._allStaves[0].Y;
        var realBottom = this.Y + this._allStaves[this._allStaves.length - 1].Y + this._allStaves[this._allStaves.length - 1].Height;
        var visualHeight = visualBottom - visualTop;
        var realHeight = realBottom - realTop;
        for (var i = 0,j = this._firstStaveInAccolade.BarRenderers.length; i < j; i++){
            this._firstStaveInAccolade.BarRenderers[i].BuildBoundingsLookup(lookup, visualTop, visualHeight, realTop, realHeight, this.X);
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Staves.StaveGroup.AccoladeLabelSpacing = 10;
});
AlphaTab.Rendering.TabBarRenderer = function (bar){
    this._helpers = null;
    AlphaTab.Rendering.GroupedBarRenderer.call(this, bar);
};
AlphaTab.Rendering.TabBarRenderer.prototype = {
    get_LineOffset: function (){
        return ((11) * this.get_Scale());
    },
    GetNoteX: function (note, onEnd){
        var beat = this.GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
        if (beat != null){
            return beat.Container.X + beat.X + beat.NoteNumbers.GetNoteX(note, onEnd);
        }
        return this.get_PostBeatGlyphsStart();
    },
    GetBeatX: function (beat){
        var bg = this.GetPreNotesPosition(beat.Voice.Index, beat.Index);
        if (bg != null){
            return bg.Container.X + bg.X;
        }
        return 0;
    },
    GetNoteY: function (note){
        var beat = this.GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
        if (beat != null){
            return beat.NoteNumbers.GetNoteY(note);
        }
        return 0;
    },
    DoLayout: function (){
        this._helpers = this.Stave.StaveGroup.Helpers.Helpers[this.Bar.Track.Index][this.Bar.Index];
        AlphaTab.Rendering.GroupedBarRenderer.prototype.DoLayout.call(this);
        this.Height = this.get_LineOffset() * (this.Bar.Track.Tuning.length - 1) + (this.get_NumberOverflow() * 2);
        if (this.Index == 0){
            this.Stave.RegisterStaveTop(this.get_NumberOverflow());
            this.Stave.RegisterStaveBottom(this.Height - this.get_NumberOverflow());
        }
    },
    CreatePreBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().IsRepeatStart){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.get_IsFirstOfLine()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.TabClefGlyph(0, 0));
        }
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.BarNumberGlyph(0, this.GetTabY(-1, -3), this.Bar.Index + 1, !this.Stave.IsFirstInAccolade));
        if (this.Bar.get_IsEmpty()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 30 * this.get_Scale(), false));
        }
    },
    CreateBeatGlyphs: function (){
        
        this.CreateVoiceGlyphs(this.Bar.Voices[0]);
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            var container = new AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph(b);
            container.PreNotes = new AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.TabBeatGlyph();
            (container.OnNotes).BeamingHelper = this._helpers.BeamHelperLookup[v.Index][b.Index];
            container.PostNotes = new AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph();
            this.AddBeatGlyph(container);
        }
    },
    CreatePostBeatGlyphs: function (){
        if (this.Bar.get_MasterBar().get_IsRepeatEnd()){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCloseGlyph(this.X, 0));
            if (this.Bar.get_MasterBar().RepeatCount > 2){
                var line = this.get_IsLast() || this.get_IsLastOfLine() ? -1 : -4;
                this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCountGlyph(0, this.GetTabY(line, -3), this.Bar.get_MasterBar().RepeatCount));
            }
        }
        else if (this.Bar.get_MasterBar().IsDoubleBar){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 3 * this.get_Scale(), false));
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, false));
        }
        else if (this.Bar.NextBar == null || !this.Bar.NextBar.get_MasterBar().IsRepeatStart){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0, this.get_IsLast()));
        }
    },
    get_TopPadding: function (){
        return this.get_NumberOverflow();
    },
    get_BottomPadding: function (){
        return this.get_NumberOverflow();
    },
    GetTabY: function (line, correction){
        return (this.get_LineOffset() * line) + (correction * this.get_Scale());
    },
    get_NumberOverflow: function (){
        var res = this.get_Resources();
        return (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2);
    },
    PaintBackground: function (cx, cy, canvas){
        AlphaTab.Rendering.GroupedBarRenderer.prototype.PaintBackground.call(this, cx, cy, canvas);
        var res = this.get_Resources();
        //
        // draw string lines
        //
        canvas.set_Color(res.StaveLineColor);
        var lineY = cy + this.Y + this.get_NumberOverflow();
        for (var i = 0,j = this.Bar.Track.Tuning.length; i < j; i++){
            if (i > 0)
                lineY += this.get_LineOffset();
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X, lineY | 0);
            canvas.LineTo(cx + this.X + this.Width, lineY | 0);
            canvas.Stroke();
        }
        canvas.set_Color(res.MainGlyphColor);
        // Info guides for debugging
        //DrawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
        //DrawInfoGuide(canvas, cx, cy, stave.StaveTop, new Color(0, 255, 0)); // stavetop
        //DrawInfoGuide(canvas, cx, cy, stave.StaveBottom, new Color(0,255,0)); // stavebottom
        //DrawInfoGuide(canvas, cx, cy, Height, new Color(255, 0, 0)); // bottom
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.TabBarRenderer.LineSpacing = 10;
});
$Inherit(AlphaTab.Rendering.TabBarRenderer, AlphaTab.Rendering.GroupedBarRenderer);
AlphaTab.Rendering.TabBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this.HideOnPercussionTrack = true;
};
AlphaTab.Rendering.TabBarRendererFactory.prototype = {
    CanCreate: function (track){
        return track.Tuning.length > 0 && AlphaTab.Rendering.BarRendererFactory.prototype.CanCreate.call(this, track);
    },
    Create: function (bar){
        return new AlphaTab.Rendering.TabBarRenderer(bar);
    }
};
$Inherit(AlphaTab.Rendering.TabBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.Utils = AlphaTab.Rendering.Utils || {};
AlphaTab.Rendering.Utils.AccidentalHelper = function (){
    this._registeredAccidentals = null;
    this._appliedScoreLines = null;
    this._registeredAccidentals = {};
    this._appliedScoreLines = {};
};
AlphaTab.Rendering.Utils.AccidentalHelper.prototype = {
    GetNoteId: function (n){
        return n.Beat.Index + "-" + n.Index;
    },
    ApplyAccidental: function (note){
        var noteValue = note.get_RealValue();
        var ks = note.Beat.Voice.Bar.get_MasterBar().KeySignature;
        var ksi = (ks + 7);
        var index = (noteValue % 12);
        //var octave = (noteValue / 12);
        var accidentalToSet = AlphaTab.Model.AccidentalType.None;
        var line = this.RegisterNoteLine(note);
        if (!note.Beat.Voice.Bar.Track.IsPercussion){
            // the key signature symbol required according to 
            var keySignatureAccidental = ksi < 7 ? AlphaTab.Model.AccidentalType.Flat : AlphaTab.Model.AccidentalType.Sharp;
            // determine whether the current note requires an accidental according to the key signature
            var hasNoteAccidentalForKeySignature = AlphaTab.Rendering.Utils.AccidentalHelper.KeySignatureLookup[ksi][index];
            var isAccidentalNote = AlphaTab.Rendering.Utils.AccidentalHelper.AccidentalNotes[index];
            var isAccidentalRegistered = this._registeredAccidentals.hasOwnProperty(line);
            if (hasNoteAccidentalForKeySignature != isAccidentalNote && !isAccidentalRegistered){
                this._registeredAccidentals[line] = true;
                accidentalToSet = isAccidentalNote ? keySignatureAccidental : AlphaTab.Model.AccidentalType.Natural;
            }
            else if (hasNoteAccidentalForKeySignature == isAccidentalNote && isAccidentalRegistered){
                delete this._registeredAccidentals[line];
                accidentalToSet = isAccidentalNote ? keySignatureAccidental : AlphaTab.Model.AccidentalType.Natural;
            }
        }
        // TODO: change accidentalToSet according to note.AccidentalMode
        return accidentalToSet;
    },
    RegisterNoteLine: function (n){
        var value = n.Beat.Voice.Bar.Track.IsPercussion ? AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(n) : n.get_RealValue();
        var ks = n.Beat.Voice.Bar.get_MasterBar().KeySignature;
        var clef = n.Beat.Voice.Bar.Clef;
        var index = value % 12;
        var octave = ((value / 12) | 0);
        // Initial Position
        var steps = AlphaTab.Rendering.Utils.AccidentalHelper.OctaveSteps[clef];
        // Move to Octave
        steps -= (octave * 7);
        // get the step list for the current keySignature
        var stepList = AlphaTab.Model.ModelUtils.KeySignatureIsSharp(ks) || AlphaTab.Model.ModelUtils.KeySignatureIsNatural(ks) ? AlphaTab.Rendering.Utils.AccidentalHelper.SharpNoteSteps : AlphaTab.Rendering.Utils.AccidentalHelper.FlatNoteSteps;
        //Add offset for note itself
        var offset = 0;
        switch (n.AccidentalMode){
            case AlphaTab.Model.NoteAccidentalMode.Default:
            case AlphaTab.Model.NoteAccidentalMode.SwapAccidentals:
            case AlphaTab.Model.NoteAccidentalMode.ForceNatural:
            case AlphaTab.Model.NoteAccidentalMode.ForceFlat:
            case AlphaTab.Model.NoteAccidentalMode.ForceSharp:
            default:
                offset = stepList[index];
                break;
        }
        steps -= stepList[index];
        // TODO: It seems note heads are always one step above the calculated line 
        // maybe the SVG paths are wrong, need to recheck where step=0 is really placed
        var line = steps + 1;
        this._appliedScoreLines[this.GetNoteId(n)] = line;
        return line;
    },
    GetNoteLine: function (n){
        return this._appliedScoreLines[this.GetNoteId(n)];
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.AccidentalHelper.KeySignatureLookup = [[true, true, true, true, true, true, true, true, true, true, true, true], [true, true, true, true, true, false, true, true, true, true, true, true], [false, true, true, true, true, false, true, true, true, true, true, true], [false, true, true, true, true, false, false, false, true, true, true, true], [false, false, false, true, true, false, false, false, true, true, true, true], [false, false, false, true, true, false, false, false, false, false, true, true], [false, false, false, false, false, false, false, false, false, false, true, true], [false, false, false, false, false, false, false, false, false, false, false, false], [false, false, false, false, false, true, true, false, false, false, false, false], [true, true, false, false, false, true, true, false, false, false, false, false], [true, true, false, false, false, true, true, true, true, false, false, false], [true, true, true, true, false, true, true, true, true, false, false, false], [true, true, true, true, false, true, true, true, true, true, true, false], [true, true, true, true, true, true, true, true, true, true, true, false], [true, true, true, true, true, true, true, true, true, true, true, true]];
    AlphaTab.Rendering.Utils.AccidentalHelper.AccidentalNotes = [false, true, false, true, false, false, true, false, true, false, true, false];
    AlphaTab.Rendering.Utils.AccidentalHelper.StepsPerOctave = 7;
    AlphaTab.Rendering.Utils.AccidentalHelper.OctaveSteps = new Int32Array([38, 32, 30, 26, 38]);
    AlphaTab.Rendering.Utils.AccidentalHelper.SharpNoteSteps = new Int32Array([0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]);
    AlphaTab.Rendering.Utils.AccidentalHelper.FlatNoteSteps = new Int32Array([0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]);
    AlphaTab.Rendering.Utils.AccidentalHelper.NoteStepCorrection = 1;
});
AlphaTab.Rendering.Utils.BarHelpers = function (bar){
    this.BeamHelpers = null;
    this.BeamHelperLookup = null;
    this.TupletHelpers = null;
    this.BeamHelpers = [];
    this.BeamHelperLookup = [];
    this.TupletHelpers = [];
    var currentBeamHelper = null;
    var currentTupletHelper = null;
    for (var i = 0,j = bar.Voices.length; i < j; i++){
        var v = bar.Voices[i];
        this.BeamHelpers.push([]);
        this.BeamHelperLookup.push({});
        this.TupletHelpers.push([]);
        for (var k = 0,l = v.Beats.length; k < l; k++){
            var b = v.Beats[k];
            var newBeamingHelper = false;
            if (!b.get_IsRest()){
                // try to fit beam to current beamhelper
                if (currentBeamHelper == null || !currentBeamHelper.CheckBeat(b)){
                    // if not possible, create the next beaming helper
                    currentBeamHelper = new AlphaTab.Rendering.Utils.BeamingHelper(bar.Track);
                    currentBeamHelper.CheckBeat(b);
                    this.BeamHelpers[v.Index].push(currentBeamHelper);
                    newBeamingHelper = true;
                }
            }
            if (b.get_HasTuplet()){
                // try to fit tuplet to current tuplethelper
                // TODO: register tuplet overflow
                var previousBeat = b.PreviousBeat;
                // don't group if the previous beat isn't in the same voice
                if (previousBeat != null && previousBeat.Voice != b.Voice)
                    previousBeat = null;
                // if a new beaming helper was started, we close our tuplet grouping as well
                if (newBeamingHelper && b.Duration > AlphaTab.Model.Duration.Quarter && currentTupletHelper != null){
                    currentTupletHelper.Finish();
                }
                if (previousBeat == null || currentTupletHelper == null || !currentTupletHelper.Check(b)){
                    currentTupletHelper = new AlphaTab.Rendering.Utils.TupletHelper(v.Index);
                    currentTupletHelper.Check(b);
                    this.TupletHelpers[v.Index].push(currentTupletHelper);
                }
            }
            this.BeamHelperLookup[v.Index][b.Index] = currentBeamHelper;
        }
        currentBeamHelper = null;
        currentTupletHelper = null;
    }
};
AlphaTab.Rendering.Utils.BarHelpersGroup = function (){
    this.Helpers = null;
    this.Helpers = {};
};
AlphaTab.Rendering.Utils.BarHelpersGroup.prototype = {
    BuildHelpers: function (tracks, barIndex){
        for (var i = 0; i < tracks.length; i++){
            var t = tracks[i];
            var h;
            if (!this.Helpers.hasOwnProperty(t.Index)){
                h = {};
                this.Helpers[t.Index] = h;
            }
            else {
                h = this.Helpers[t.Index];
            }
            if (!h.hasOwnProperty(barIndex)){
                h[barIndex] = new AlphaTab.Rendering.Utils.BarHelpers(t.Bars[barIndex]);
            }
        }
    }
};
AlphaTab.Rendering.Utils.BeamDirection = {
    Up: 0,
    Down: 1
};
AlphaTab.Rendering.Utils.BeamBarType = {
    Full: 0,
    PartLeft: 1,
    PartRight: 2
};
AlphaTab.Rendering.Utils.BeatLinePositions = function (up, down){
    this.Up = 0;
    this.Down = 0;
    this.Up = up;
    this.Down = down;
};
AlphaTab.Rendering.Utils.BeamingHelper = function (track){
    this._lastBeat = null;
    this._track = null;
    this._beatLineXPositions = null;
    this.Voice = null;
    this.Beats = null;
    this.MaxDuration = AlphaTab.Model.Duration.Whole;
    this.FingeringCount = 0;
    this.HasTuplet = false;
    this.FirstMinNote = null;
    this.FirstMaxNote = null;
    this.LastMinNote = null;
    this.LastMaxNote = null;
    this.MinNote = null;
    this.MaxNote = null;
    this._track = track;
    this.Beats = [];
    this._beatLineXPositions = {};
    this.MaxDuration = AlphaTab.Model.Duration.Whole;
};
AlphaTab.Rendering.Utils.BeamingHelper.prototype = {
    GetValue: function (n){
        if (this._track.IsPercussion){
            return AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(n);
        }
        else {
            return n.get_RealValue();
        }
    },
    GetBeatLineX: function (beat){
        if (this.HasBeatLineX(beat)){
            if (this.get_Direction() == AlphaTab.Rendering.Utils.BeamDirection.Up){
                return this._beatLineXPositions[beat.Index].Up;
            }
            return this._beatLineXPositions[beat.Index].Down;
        }
        return 0;
    },
    HasBeatLineX: function (beat){
        return this._beatLineXPositions.hasOwnProperty(beat.Index);
    },
    RegisterBeatLineX: function (beat, up, down){
        this._beatLineXPositions[beat.Index] = new AlphaTab.Rendering.Utils.BeatLinePositions(up, down);
    },
    get_Direction: function (){
        // multivoice handling
        
        if (this.Beats.length == 1 && this.Beats[0].Duration == AlphaTab.Model.Duration.Whole){
            return AlphaTab.Rendering.Utils.BeamDirection.Up;
        }
        // the average key is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        var avg = ((this.GetValue(this.MaxNote) + this.GetValue(this.MinNote)) / 2) | 0;
        return avg <= AlphaTab.Rendering.Utils.BeamingHelper.ScoreMiddleKeys[this._lastBeat.Voice.Bar.Clef] ? AlphaTab.Rendering.Utils.BeamDirection.Up : AlphaTab.Rendering.Utils.BeamDirection.Down;
    },
    CheckBeat: function (beat){
        if (this.Voice == null){
            this.Voice = beat.Voice;
        }
        // allow adding if there are no beats yet
        var add = false;
        if (this.Beats.length == 0){
            add = true;
        }
        else if (AlphaTab.Rendering.Utils.BeamingHelper.CanJoin(this._lastBeat, beat)){
            add = true;
        }
        if (add){
            this._lastBeat = beat;
            this.Beats.push(beat);
            if (beat.get_HasTuplet()){
                this.HasTuplet = true;
            }
            var fingeringCount = 0;
            for (var n = 0; n < beat.Notes.length; n++){
                var note = beat.Notes[n];
                if (note.LeftHandFinger != AlphaTab.Model.Fingers.Unknown || note.RightHandFinger != AlphaTab.Model.Fingers.Unknown){
                    fingeringCount++;
                }
            }
            if (fingeringCount > this.FingeringCount){
                this.FingeringCount = fingeringCount;
            }
            this.CheckNote(beat.get_MinNote());
            this.CheckNote(beat.get_MaxNote());
            if (this.MaxDuration < beat.Duration){
                this.MaxDuration = beat.Duration;
            }
        }
        return add;
    },
    CheckNote: function (note){
        var value = this.GetValue(note);
        // detect the smallest note which is at the beginning of this group
        if (this.FirstMinNote == null || note.Beat.Start < this.FirstMinNote.Beat.Start){
            this.FirstMinNote = note;
        }
        else if (note.Beat.Start == this.FirstMinNote.Beat.Start){
            if (value < this.GetValue(this.FirstMinNote)){
                this.FirstMinNote = note;
            }
        }
        // detect the biggest note which is at the beginning of this group
        if (this.FirstMaxNote == null || note.Beat.Start < this.FirstMaxNote.Beat.Start){
            this.FirstMaxNote = note;
        }
        else if (note.Beat.Start == this.FirstMaxNote.Beat.Start){
            if (value > this.GetValue(this.FirstMaxNote)){
                this.FirstMaxNote = note;
            }
        }
        // detect the smallest note which is at the end of this group
        if (this.LastMinNote == null || note.Beat.Start > this.LastMinNote.Beat.Start){
            this.LastMinNote = note;
        }
        else if (note.Beat.Start == this.LastMinNote.Beat.Start){
            if (value < this.GetValue(this.LastMinNote)){
                this.LastMinNote = note;
            }
        }
        // detect the biggest note which is at the end of this group
        if (this.LastMaxNote == null || note.Beat.Start > this.LastMaxNote.Beat.Start){
            this.LastMaxNote = note;
        }
        else if (note.Beat.Start == this.LastMaxNote.Beat.Start){
            if (value > this.GetValue(this.LastMaxNote)){
                this.LastMaxNote = note;
            }
        }
        if (this.MaxNote == null || value > this.GetValue(this.MaxNote)){
            this.MaxNote = note;
        }
        if (this.MinNote == null || value < this.GetValue(this.MinNote)){
            this.MinNote = note;
        }
    },
    CalculateBeamY: function (stemSize, xCorrection, xPosition, scale, yPosition){
        // create a line between the min and max note of the group
        var direction = this.get_Direction();
        if (this.Beats.length == 1){
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                return yPosition(this.MaxNote) - stemSize;
            }
            return yPosition(this.MinNote) + stemSize;
        }
        // we use the min/max notes to place the beam along their real position        
        // we only want a maximum of 10 offset for their gradient
        var maxDistance = (10 * scale);
        // if the min note is not first or last, we can align notes directly to the position
        // of the min note
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && this.MinNote != this.FirstMinNote && this.MinNote != this.LastMinNote){
            return yPosition(this.MinNote) + stemSize;
        }
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && this.MaxNote != this.FirstMaxNote && this.MaxNote != this.LastMaxNote){
            return yPosition(this.MaxNote) - stemSize;
        }
        var startX = this.GetBeatLineX(this.FirstMinNote.Beat) + xCorrection;
        var startY = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? yPosition(this.FirstMaxNote) - stemSize : yPosition(this.FirstMinNote) + stemSize;
        var endX = this.GetBeatLineX(this.LastMaxNote.Beat) + xCorrection;
        var endY = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? yPosition(this.LastMaxNote) - stemSize : yPosition(this.LastMinNote) + stemSize;
        // ensure the maxDistance
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && startY > endY && (startY - endY) > maxDistance)
            endY = (startY - maxDistance);
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && endY > startY && (endY - startY) > maxDistance)
            startY = (endY - maxDistance);
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && startY < endY && (endY - startY) > maxDistance)
            endY = (startY + maxDistance);
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && endY < startY && (startY - endY) > maxDistance)
            startY = (endY + maxDistance);
        // get the y position of the given beat on this curve
        if (startX == endX)
            return startY;
        // y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
        return ((endY - startY) / (endX - startX)) * (xPosition - startX) + startY;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.BeamingHelper.ScoreMiddleKeys = new Int32Array([48, 48, 45, 38, 59]);
});
AlphaTab.Rendering.Utils.BeamingHelper.CanJoin = function (b1, b2){
    // is this a voice we can join with?
    if (b1 == null || b2 == null || b1.get_IsRest() || b2.get_IsRest() || b1.GraceType != AlphaTab.Model.GraceType.None || b2.GraceType != AlphaTab.Model.GraceType.None){
        return false;
    }
    var m1 = b1.Voice.Bar;
    var m2 = b1.Voice.Bar;
    // only join on same measure
    if (m1 != m2)
        return false;
    // get times of those voices and check if the times 
    // are in the same division
    var start1 = b1.Start;
    var start2 = b2.Start;
    // we can only join 8th, 16th, 32th and 64th voices
    if (!AlphaTab.Rendering.Utils.BeamingHelper.CanJoinDuration(b1.Duration) || !AlphaTab.Rendering.Utils.BeamingHelper.CanJoinDuration(b2.Duration)){
        return start1 == start2;
    }
    // TODO: create more rules for automatic beaming
    var divisionLength = 960;
    switch (m1.get_MasterBar().TimeSignatureDenominator){
        case 8:
            if (m1.get_MasterBar().TimeSignatureNumerator % 3 == 0){
            divisionLength += 480;
        }
            break;
    }
    // check if they are on the same division 
    var division1 = (((divisionLength + start1) / divisionLength) | 0) | 0;
    var division2 = (((divisionLength + start2) / divisionLength) | 0) | 0;
    return division1 == division2;
};
AlphaTab.Rendering.Utils.BeamingHelper.CanJoinDuration = function (d){
    switch (d){
        case AlphaTab.Model.Duration.Whole:
        case AlphaTab.Model.Duration.Half:
        case AlphaTab.Model.Duration.Quarter:
            return false;
        default:
            return true;
    }
};
AlphaTab.Rendering.Utils.Bounds = function (x, y, w, h){
    this.X = 0;
    this.Y = 0;
    this.W = 0;
    this.H = 0;
    this.X = x;
    this.Y = y;
    this.W = w;
    this.H = h;
};
AlphaTab.Rendering.Utils.BeatBoundings = function (){
    this.Beat = null;
    this.Bounds = null;
    this.VisualBounds = null;
};
AlphaTab.Rendering.Utils.BarBoundings = function (){
    this.IsFirstOfLine = false;
    this.IsLastOfLine = false;
    this.Bar = null;
    this.Bounds = null;
    this.VisualBounds = null;
    this.Beats = null;
    this.Beats = [];
};
AlphaTab.Rendering.Utils.BarBoundings.prototype = {
    FindBeatAtPos: function (x){
        var index = 0;
        // move right as long we didn't pass our x-pos
        while (index < (this.Beats.length - 1) && x > (this.Beats[index].Bounds.X + this.Beats[index].Bounds.W)){
            index++;
        }
        return this.Beats[index].Beat;
    }
};
AlphaTab.Rendering.Utils.BoundingsLookup = function (){
    this.Bars = null;
    this.Bars = [];
};
AlphaTab.Rendering.Utils.BoundingsLookup.prototype = {
    GetBeatAtPos: function (x, y){
        //
        // find a bar which matches in y-axis
        var bottom = 0;
        var top = this.Bars.length - 1;
        var barIndex = -1;
        while (bottom <= top){
            var middle = ((top + bottom) / 2) | 0;
            var bar = this.Bars[middle];
            // found?
            if (y >= bar.Bounds.Y && y <= (bar.Bounds.Y + bar.Bounds.H)){
                barIndex = middle;
                break;
            }
            // search in lower half 
            if (y < bar.Bounds.Y){
                top = middle - 1;
            }
            else {
                bottom = middle + 1;
            }
        }
        // no bar found
        if (barIndex == -1)
            return null;
        // 
        // Find the matching bar in the row
        var currentBar = this.Bars[barIndex];
        // clicked before bar
        if (x < currentBar.Bounds.X){
            // we move left till we either pass our x-position or are at the beginning of the line/score
            while (barIndex > 0 && x < this.Bars[barIndex].Bounds.X && !this.Bars[barIndex].IsFirstOfLine){
                barIndex--;
            }
        }
        else {
            // we move right till we either pass our our x-position or are at the end of the line/score
            while (barIndex < (this.Bars.length - 1) && x > (this.Bars[barIndex].Bounds.X + this.Bars[barIndex].Bounds.W) && !this.Bars[barIndex].IsLastOfLine){
                barIndex++;
            }
        }
        // 
        // Find the matching beat within the bar
        return this.Bars[barIndex].FindBeatAtPos(x);
    }
};
AlphaTab.Rendering.Utils.PercussionMapper = function (){
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.PercussionMapper.ElementVariationToMidi = [new Int32Array([35, 35, 35]), new Int32Array([38, 38, 37]), new Int32Array([56, 56, 56]), new Int32Array([56, 56, 56]), new Int32Array([56, 56, 56]), new Int32Array([41, 41, 41]), new Int32Array([43, 43, 43]), new Int32Array([45, 45, 45]), new Int32Array([47, 47, 47]), new Int32Array([48, 48, 48]), new Int32Array([42, 46, 46]), new Int32Array([44, 44, 44]), new Int32Array([49, 49, 49]), new Int32Array([57, 57, 57]), new Int32Array([55, 55, 55]), new Int32Array([51, 59, 53]), new Int32Array([52, 52, 52])];
});
AlphaTab.Rendering.Utils.PercussionMapper.MidiFromElementVariation = function (note){
    return AlphaTab.Rendering.Utils.PercussionMapper.ElementVariationToMidi[note.Element][note.Variation];
};
AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay = function (note){
    var value = note.get_RealValue();
    if (value == 61 || value == 66){
        return 50;
    }
    else if (value == 60 || value == 65){
        return 52;
    }
    else if ((value >= 35 && value <= 36) || value == 44){
        return 53;
    }
    else if (value == 41 || value == 64){
        return 55;
    }
    else if (value == 43 || value == 62){
        return 57;
    }
    else if (value == 45 || value == 63){
        return 59;
    }
    else if (value == 47 || value == 54){
        return 62;
    }
    else if (value == 48 || value == 56){
        return 64;
    }
    else if (value == 50){
        return 65;
    }
    else if (value == 42 || value == 46 || (value >= 49 && value <= 53) || value == 57 || value == 59){
        return 67;
    }
    return 60;
};
AlphaTab.Rendering.Utils.SvgPathParser = function (svg){
    this._currentIndex = 0;
    this.Svg = null;
    this.LastCommand = null;
    this.CurrentToken = null;
    this.Svg = svg;
};
AlphaTab.Rendering.Utils.SvgPathParser.prototype = {
    Reset: function (){
        this._currentIndex = 0;
        this.NextToken();
    },
    get_Eof: function (){
        return this._currentIndex >= this.Svg.length;
    },
    GetString: function (){
        var t = this.CurrentToken;
        this.NextToken();
        return t;
    },
    GetNumber: function (){
        return AlphaTab.Platform.Std.ParseFloat(this.GetString());
    },
    get_CurrentTokenIsNumber: function (){
        return AlphaTab.Platform.Std.IsStringNumber(this.CurrentToken, true);
    },
    NextChar: function (){
        if (this.get_Eof())
            return 0;
        return this.Svg.charCodeAt(this._currentIndex++);
    },
    PeekChar: function (){
        if (this.get_Eof())
            return 0;
        return this.Svg.charCodeAt(this._currentIndex);
    },
    NextToken: function (){
        var token = new Array();
        var c;
        var skipChar;
        // skip leading spaces and separators
        do{
            c = this.NextChar();
            skipChar = AlphaTab.Platform.Std.IsWhiteSpace(c) || c == 32;
        }
        while (!this.get_Eof() && skipChar)
        // read token itself 
        if (!this.get_Eof() || !skipChar){
            token.push(String.fromCharCode(c));
            if (AlphaTab.Platform.Std.IsCharNumber(c, true)){
                c = this.PeekChar();
                // get first upcoming character
                while (!this.get_Eof() && (AlphaTab.Platform.Std.IsCharNumber(c, false) || c == 46)){
                    token.push(String.fromCharCode(this.NextChar()));
                    // peek next character for check
                    c = this.PeekChar();
                }
            }
            else {
                this.LastCommand = token.join('');
            }
        }
        this.CurrentToken = token.join('');
    }
};
AlphaTab.Rendering.Utils.SvgRenderer = function (svg, xScale, yScale){
    this._svg = null;
    this._lastCmd = null;
    this._currentX = 0;
    this._currentY = 0;
    this._xScale = 0;
    this._yScale = 0;
    this._xGlyphScale = 0;
    this._yGlyphScale = 0;
    this._lastControlX = 0;
    this._lastControlY = 0;
    this._svg = svg;
    this._xGlyphScale = xScale * 0.0099;
    this._yGlyphScale = yScale * 0.0099;
};
AlphaTab.Rendering.Utils.SvgRenderer.prototype = {
    Paint: function (x, y, canvas){
        if (this._svg == null)
            return;
        this._xScale = this._xGlyphScale;
        this._yScale = this._yGlyphScale;
        var startX = x;
        var startY = y;
        this._currentX = startX;
        this._currentY = startY;
        canvas.BeginPath();
        for (var i = 0,j = this._svg.get_Commands().length; i < j; i++){
            this.ParseCommand(startX, startY, canvas, this._svg.get_Commands()[i]);
        }
        canvas.Fill();
    },
    ParseCommand: function (cx, cy, canvas, cmd){
        var canContinue;
        // reusable flag for shorthand curves
        var i;
        switch (cmd.Cmd){
            case "M":
                this._currentX = (cx + cmd.Numbers[0] * this._xScale);
                this._currentY = (cy + cmd.Numbers[1] * this._yScale);
                canvas.MoveTo(this._currentX, this._currentY);
                break;
            case "m":
                this._currentX += (cmd.Numbers[0] * this._xScale);
                this._currentY += (cmd.Numbers[1] * this._yScale);
                canvas.MoveTo(this._currentX, this._currentY);
                break;
            case "Z":
            case "z":
                canvas.ClosePath();
                break;
            case "L":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX = (cx + cmd.Numbers[i++] * this._xScale);
                this._currentY = (cy + cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "l":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX += (cmd.Numbers[i++] * this._xScale);
                this._currentY += (cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "V":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentY = (cy + cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "v":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentY += (cmd.Numbers[i++] * this._yScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "H":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX = (cx + cmd.Numbers[i++] * this._xScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "h":
                i = 0;
                while (i < cmd.Numbers.length){
                this._currentX += (cmd.Numbers[i++] * this._xScale);
                canvas.LineTo(this._currentX, this._currentY);
            }
                break;
            case "C":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                var x2 = (cx + cmd.Numbers[i++] * this._xScale);
                var y2 = (cy + cmd.Numbers[i++] * this._yScale);
                var x3 = (cx + cmd.Numbers[i++] * this._xScale);
                var y3 = (cy + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "c":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                var x2 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y2 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                var x3 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y3 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "S":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "c" || this._lastCmd == "C" || this._lastCmd == "S" || this._lastCmd == "s";
                var x2 = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var y2 = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                var x3 = (cx + cmd.Numbers[i++] * this._xScale);
                var y3 = (cy + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "s":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "c" || this._lastCmd == "C" || this._lastCmd == "S" || this._lastCmd == "s";
                var x2 = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var y2 = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                var x3 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y3 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x2;
                this._lastControlY = y2;
                this._currentX = x3;
                this._currentY = y3;
                canvas.BezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
                break;
            case "Q":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                var x2 = (cx + cmd.Numbers[i++] * this._xScale);
                var y2 = (cy + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x1;
                this._lastControlY = y1;
                this._currentX = x2;
                this._currentY = y2;
                canvas.QuadraticCurveTo(x1, y1, x2, y2);
            }
                break;
            case "q":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                var x2 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y2 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                this._lastControlX = x1;
                this._lastControlY = y1;
                this._currentX = x2;
                this._currentY = y2;
                canvas.QuadraticCurveTo(x1, y1, x2, y2);
            }
                break;
            case "T":
                i = 0;
                while (i < cmd.Numbers.length){
                var x1 = (cx + cmd.Numbers[i++] * this._xScale);
                var y1 = (cy + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "q" || this._lastCmd == "Q" || this._lastCmd == "t" || this._lastCmd == "T";
                var cpx = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var cpy = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                this._currentX = x1;
                this._currentY = y1;
                this._lastControlX = cpx;
                this._lastControlY = cpy;
                canvas.QuadraticCurveTo(cpx, cpy, x1, y1);
            }
                break;
            case "t":
                i = 0;
                while (i < cmd.Numbers.length){
                // TODO: buggy/incomplete
                var x1 = (this._currentX + cmd.Numbers[i++] * this._xScale);
                var y1 = (this._currentY + cmd.Numbers[i++] * this._yScale);
                canContinue = this._lastCmd == "q" || this._lastCmd == "Q" || this._lastCmd == "t" || this._lastCmd == "T";
                var cpx = canContinue ? this._currentX + (this._currentX - this._lastControlX) : this._currentX;
                var cpy = canContinue ? this._currentY + (this._currentY - this._lastControlY) : this._currentY;
                this._lastControlX = cpx;
                this._lastControlY = cpy;
                canvas.QuadraticCurveTo(cpx, cpy, x1, y1);
            }
                break;
        }
        this._lastCmd = cmd.Cmd;
    }
};
AlphaTab.Rendering.Utils.TupletHelper = function (voice){
    this._isFinished = false;
    this.Beats = null;
    this.VoiceIndex = 0;
    this.Tuplet = 0;
    this.VoiceIndex = voice;
    this.Beats = [];
};
AlphaTab.Rendering.Utils.TupletHelper.prototype = {
    get_IsFull: function (){
        return this.Beats.length == this.Tuplet;
    },
    Finish: function (){
        this._isFinished = true;
    },
    Check: function (beat){
        if (this.Beats.length == 0){
            this.Tuplet = beat.TupletNumerator;
        }
        else if (beat.Voice.Index != this.VoiceIndex || beat.TupletNumerator != this.Tuplet || this.get_IsFull() || this._isFinished){
            return false;
        }
        this.Beats.push(beat);
        return true;
    }
};
AlphaTab.LayoutSettings = function (){
    this.Mode = null;
    this.AdditionalSettings = null;
    this.AdditionalSettings = {};
};
AlphaTab.LayoutSettings.prototype = {
    Get: function (key, def){
        if (this.AdditionalSettings.hasOwnProperty(key)){
            return (this.AdditionalSettings[key]);
        }
        return def;
    }
};
AlphaTab.LayoutSettings.get_Defaults = function (){
    var settings = new AlphaTab.LayoutSettings();
    settings.Mode = "page";
    return settings;
};
AlphaTab.StaveSettings = function (id){
    this.Id = null;
    this.AdditionalSettings = null;
    this.Id = id;
    this.AdditionalSettings = {};
};
AlphaTab.Util = AlphaTab.Util || {};
AlphaTab.Util.Lazy = function (factory){
    this._factory = null;
    this._created = false;
    this._value = null;
    this._factory = factory;
};
AlphaTab.Util.Lazy.prototype = {
    get_Value: function (){
        if (!this._created){
            this._value = this._factory();
            this._created = true;
        }
        return this._value;
    }
};
AlphaTab.Xml.XmlNodeType = {
    None: 0,
    Element: 1,
    Attribute: 2,
    Text: 3,
    CDATA: 4,
    EntityReference: 5,
    Entity: 6,
    ProcessingInstruction: 7,
    Comment: 8,
    Document: 9,
    DocumentType: 10,
    DocumentFragment: 11,
    Notation: 12,
    Whitespace: 13,
    SignificantWhitespace: 14,
    EndElement: 15,
    EndEntity: 16,
    XmlDeclaration: 17
};

for(var i = 0; i < $StaticConstructors.length; i++) {
    $StaticConstructors[i]();
}


