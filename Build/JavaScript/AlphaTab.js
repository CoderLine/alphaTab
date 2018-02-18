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
    AlphaTab.Environment.RenderEngines["svg"] = function (){
        return new AlphaTab.Platform.Svg.CssFontSvgCanvas();
    };
    AlphaTab.Environment.RenderEngines["default"] = function (){
        return new AlphaTab.Platform.Svg.CssFontSvgCanvas();
    };
    AlphaTab.Environment.RenderEngines["html5"] = function (){
        return new AlphaTab.Platform.JavaScript.Html5Canvas();
    };
    // check whether webfont is loaded
    AlphaTab.Environment.CheckFontLoad();
     Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };;
    // try to build the find the alphaTab script url in case we are not in the webworker already
    if (self.document){
        
        var vbAjaxLoader = new String();
        vbAjaxLoader+="<script type=\"text/vbscript\">"+'\r\n';
        vbAjaxLoader+="Function VbAjaxLoader(method, fileName)"+'\r\n';
        vbAjaxLoader+="    Dim xhr"+'\r\n';
        vbAjaxLoader+="    Set xhr = CreateObject(\"Microsoft.XMLHTTP\")"+'\r\n';
        vbAjaxLoader+="    xhr.Open method, fileName, False"+'\r\n';
        vbAjaxLoader+="    xhr.setRequestHeader \"Accept-Charset\", \"x-user-defined\""+'\r\n';
        vbAjaxLoader+="    xhr.send"+'\r\n';
        vbAjaxLoader+="    Dim byteArray()"+'\r\n';
        vbAjaxLoader+="    if xhr.Status = 200 Then"+'\r\n';
        vbAjaxLoader+="        Dim byteString"+'\r\n';
        vbAjaxLoader+="        Dim i"+'\r\n';
        vbAjaxLoader+="        byteString=xhr.responseBody"+'\r\n';
        vbAjaxLoader+="        ReDim byteArray(LenB(byteString))"+'\r\n';
        vbAjaxLoader+="        For i = 1 To LenB(byteString)"+'\r\n';
        vbAjaxLoader+="            byteArray(i-1) = AscB(MidB(byteString, i, 1))"+'\r\n';
        vbAjaxLoader+="        Next"+'\r\n';
        vbAjaxLoader+="    End If"+'\r\n';
        vbAjaxLoader+="    VbAjaxLoader=byteArray"+'\r\n';
        vbAjaxLoader+="End Function"+'\r\n';
        vbAjaxLoader+="</script>"+'\r\n';
        document.write(vbAjaxLoader);
        var scriptElement = document["currentScript"];
        if (!scriptElement){
            // try to get javascript from exception stack
            try{
                var error = new Error();
                var stack = error["stack"];
                if (!stack){
                    throw $CreateException(error, new Error());
                }
                AlphaTab.Environment.ScriptFile = AlphaTab.Environment.ScriptFileFromStack(stack);
            }
            catch(e){
                var stack = e["stack"];
                if (!stack){
                    scriptElement = document.querySelector("script[data-alphatab]");
                }
                else {
                    AlphaTab.Environment.ScriptFile = AlphaTab.Environment.ScriptFileFromStack(stack);
                }
            }
        }
        // failed to automatically resolve
        if (((AlphaTab.Environment.ScriptFile==null)||(AlphaTab.Environment.ScriptFile.length==0))){
            if (!scriptElement){
                console.warn("Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializing alphaTab");
            }
            else {
                AlphaTab.Environment.ScriptFile = scriptElement.src;
            }
        }
    }
};
AlphaTab.Environment.ScriptFileFromStack = function (stack){
    var matches = stack.match("(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?");
    if (!matches){
        matches = stack.match("^(?:|[^:@]*@|.+\\)@(?=data:text\\/javascript|blob|http[s]?|file)|.+?\\s+(?: at |@)(?:[^:\\(]+ )*[\\(]?)(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?");
        if (!matches){
            matches = stack.match("\\)@(data:text\\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\\/\\/[\\/]?.+?\\/[^:\\)]*?)(?::\\d+)(?::\\d+)?");
            if (!matches){
                return null;
            }
        }
    }
    return matches[1];
};
AlphaTab.Environment.CheckFontLoad = function (){
    var isWorker =  typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    if (isWorker){
        // no web fonts in web worker
        AlphaTab.Environment.IsFontLoaded = false;
        return;
    }
    var cssFontLoadingModuleSupported =  !!document.fonts && !!document.fonts.load;
    if (cssFontLoadingModuleSupported){
        // ReSharper disable once UnusedVariable
        var onLoaded = function (){
            AlphaTab.Environment.IsFontLoaded = true;
            return true;
        };
         document.fonts.load('1em alphaTab').then(onLoaded);
    }
    else {
        var checkFont = null;
        checkFont = function (){
            var testItem = document.getElementById("alphaTabFontChecker");
            if (testItem == null){
                // create a hidden element with the font style set
                testItem = document.createElement("div");
                testItem.setAttribute("id", "alphaTabFontChecker");
                testItem.style.opacity = "0";
                testItem.style.position = "absolute";
                testItem.style.left = "0";
                testItem.style.top = "0";
                testItem.style.fontSize = "100px";
                testItem.classList.add("at");
                testItem.innerHTML = "&#" + 57424 + ";";
                document.body.appendChild(testItem);
            }
            // get width
            var width = testItem.offsetWidth;
            if (width > 30 && width < 100){
                AlphaTab.Environment.IsFontLoaded = true;
                document.body.removeChild(testItem);
            }
            else {
                window.setTimeout(function (){
                    checkFont();
                }, 1000);
            }
        };
        window.addEventListener("DOMContentLoaded", function (e){
            checkFont();
        });
    }
};
$StaticConstructor(function (){
    AlphaTab.Environment.RenderEngines = null;
    AlphaTab.Environment.LayoutEngines = null;
    AlphaTab.Environment.StaveProfiles = null;
    AlphaTab.Environment.StaveProfileScoreTab = "score-tab";
    AlphaTab.Environment.StaveProfileTab = "tab";
    AlphaTab.Environment.StaveProfileScore = "score";
    AlphaTab.Environment.ScriptFile = null;
    AlphaTab.Environment.IsFontLoaded = false;
    AlphaTab.Environment.RenderEngines = {};
    AlphaTab.Environment.LayoutEngines = {};
    AlphaTab.Environment.StaveProfiles = {};
    AlphaTab.Environment.PlatformInit();
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
    // default combinations of stave textprofiles
    AlphaTab.Environment.StaveProfiles["default"] = AlphaTab.Environment.StaveProfiles["score-tab"] = [new AlphaTab.Rendering.EffectBarRendererFactory("score-effects", [new AlphaTab.Rendering.Effects.TempoEffectInfo(), new AlphaTab.Rendering.Effects.TripletFeelEffectInfo(), new AlphaTab.Rendering.Effects.MarkerEffectInfo(), new AlphaTab.Rendering.Effects.TextEffectInfo(), new AlphaTab.Rendering.Effects.ChordsEffectInfo(), new AlphaTab.Rendering.Effects.TrillEffectInfo(), new AlphaTab.Rendering.Effects.BeatVibratoEffectInfo(), new AlphaTab.Rendering.Effects.NoteVibratoEffectInfo(), new AlphaTab.Rendering.Effects.AlternateEndingsEffectInfo()]), new AlphaTab.Rendering.ScoreBarRendererFactory(), new AlphaTab.Rendering.EffectBarRendererFactory("tab-effects", [new AlphaTab.Rendering.Effects.CrescendoEffectInfo(), new AlphaTab.Rendering.Effects.DynamicsEffectInfo(), new AlphaTab.Rendering.Effects.LyricsEffectInfo(), new AlphaTab.Rendering.Effects.TrillEffectInfo(), new AlphaTab.Rendering.Effects.BeatVibratoEffectInfo(), new AlphaTab.Rendering.Effects.NoteVibratoEffectInfo(), new AlphaTab.Rendering.Effects.TapEffectInfo(), new AlphaTab.Rendering.Effects.FadeInEffectInfo(), new AlphaTab.Rendering.Effects.HarmonicsEffectInfo(), new AlphaTab.Rendering.Effects.LetRingEffectInfo(), new AlphaTab.Rendering.Effects.CapoEffectInfo(), new AlphaTab.Rendering.Effects.PalmMuteEffectInfo(), new AlphaTab.Rendering.Effects.PickStrokeEffectInfo()]), new AlphaTab.Rendering.TabBarRendererFactory(false, false, false)];
    AlphaTab.Environment.StaveProfiles["score"] = [new AlphaTab.Rendering.EffectBarRendererFactory("score-effects", [new AlphaTab.Rendering.Effects.TempoEffectInfo(), new AlphaTab.Rendering.Effects.TripletFeelEffectInfo(), new AlphaTab.Rendering.Effects.MarkerEffectInfo(), new AlphaTab.Rendering.Effects.TextEffectInfo(), new AlphaTab.Rendering.Effects.ChordsEffectInfo(), new AlphaTab.Rendering.Effects.TrillEffectInfo(), new AlphaTab.Rendering.Effects.BeatVibratoEffectInfo(), new AlphaTab.Rendering.Effects.NoteVibratoEffectInfo(), new AlphaTab.Rendering.Effects.FadeInEffectInfo(), new AlphaTab.Rendering.Effects.LetRingEffectInfo(), new AlphaTab.Rendering.Effects.PalmMuteEffectInfo(), new AlphaTab.Rendering.Effects.PickStrokeEffectInfo(), new AlphaTab.Rendering.Effects.AlternateEndingsEffectInfo()]), new AlphaTab.Rendering.ScoreBarRendererFactory(), new AlphaTab.Rendering.EffectBarRendererFactory("score-bottom-effects", [new AlphaTab.Rendering.Effects.CrescendoEffectInfo(), new AlphaTab.Rendering.Effects.DynamicsEffectInfo(), new AlphaTab.Rendering.Effects.LyricsEffectInfo()])];
    AlphaTab.Environment.StaveProfiles["tab"] = [new AlphaTab.Rendering.EffectBarRendererFactory("tab-effects", [new AlphaTab.Rendering.Effects.TempoEffectInfo(), new AlphaTab.Rendering.Effects.TripletFeelEffectInfo(), new AlphaTab.Rendering.Effects.MarkerEffectInfo(), new AlphaTab.Rendering.Effects.TextEffectInfo(), new AlphaTab.Rendering.Effects.ChordsEffectInfo(), new AlphaTab.Rendering.Effects.TripletFeelEffectInfo(), new AlphaTab.Rendering.Effects.TrillEffectInfo(), new AlphaTab.Rendering.Effects.BeatVibratoEffectInfo(), new AlphaTab.Rendering.Effects.NoteVibratoEffectInfo(), new AlphaTab.Rendering.Effects.TapEffectInfo(), new AlphaTab.Rendering.Effects.FadeInEffectInfo(), new AlphaTab.Rendering.Effects.HarmonicsEffectInfo(), new AlphaTab.Rendering.Effects.LetRingEffectInfo(), new AlphaTab.Rendering.Effects.CapoEffectInfo(), new AlphaTab.Rendering.Effects.PalmMuteEffectInfo(), new AlphaTab.Rendering.Effects.PickStrokeEffectInfo(), new AlphaTab.Rendering.Effects.AlternateEndingsEffectInfo()]), new AlphaTab.Rendering.TabBarRendererFactory(true, true, true), new AlphaTab.Rendering.EffectBarRendererFactory("tab-bottom-effects", [new AlphaTab.Rendering.Effects.LyricsEffectInfo()])];
});
AlphaTab.AlphaTabException = function (message){
    this.Description = null;
    this.Description = message;
};
AlphaTab.Importer = AlphaTab.Importer || {};
AlphaTab.Importer.FileLoadException = function (message, xhr){
    this.Xhr = null;
    AlphaTab.AlphaTabException.call(this, message);
    this.Xhr = xhr;
};
$Inherit(AlphaTab.Importer.FileLoadException, AlphaTab.AlphaTabException);
AlphaTab.Importer.ScoreLoader = function (){
};
AlphaTab.Importer.ScoreLoader.LoadScoreAsync = function (path, success, error){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path);
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function (e){
        if (xhr.readyState == 4){
            if (xhr.status == 200){
                try{
                    var reader = new Uint8Array(xhr.response);
                    var score = AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(reader);
                    success(score);
                }
                catch(exception){
                    error(exception);
                }
            }
            else if (xhr.status == 0){
                error(new AlphaTab.Importer.FileLoadException("You are offline!!\n Please Check Your Network.", xhr));
            }
            else if (xhr.status == 404){
                error(new AlphaTab.Importer.FileLoadException("Requested URL not found.", xhr));
            }
            else if (xhr.status == 500){
                error(new AlphaTab.Importer.FileLoadException("Internel Server Error.", xhr));
            }
            else if (xhr.statusText == "parsererror"){
                error(new AlphaTab.Importer.FileLoadException("Error.\nParsing JSON Request failed.", xhr));
            }
            else if (xhr.statusText == "timeout"){
                error(new AlphaTab.Importer.FileLoadException("Request Time out.", xhr));
            }
            else {
                error(new AlphaTab.Importer.FileLoadException("Unknow Error: " + xhr.responseText, xhr));
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.responseType = "arraybuffer";
    // IE fallback
    if (xhr.responseType != "arraybuffer"){
        // use VB Loader to load binary array
        var vbArr = VbAjaxLoader("GET",path);
        var fileContents = vbArr.toArray();
        // decode byte array to string
        var data = new String();
        var i = 0;
        while (i < (fileContents.length - 1)){
            data+=(fileContents[i]);
            i++;
        }
        var reader = AlphaTab.Importer.ScoreLoader.GetBytesFromString(data);
        var score = AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(reader);
        success(score);
        return;
    }
    xhr.send();
};
AlphaTab.Importer.ScoreLoader.GetBytesFromString = function (s){
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++){
        b[i] = s.charCodeAt(i);
    }
    return b;
};
AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes = function (data){
    var importers = AlphaTab.Importer.ScoreImporter.BuildImporters();
    AlphaTab.Util.Logger.Info("ScoreLoader", "Loading score from " + data.length + " bytes using " + importers.length + " importers", null);
    var score = null;
    var bb = AlphaTab.IO.ByteBuffer.FromBuffer(data);
    for (var $i2 = 0,$l2 = importers.length,importer = importers[$i2]; $i2 < $l2; $i2++, importer = importers[$i2]){
        bb.Reset();
        try{
            AlphaTab.Util.Logger.Info("ScoreLoader", "Importing using importer " + importer.get_Name(), null);
            importer.Init(bb);
            score = importer.ReadScore();
            AlphaTab.Util.Logger.Info("ScoreLoader", "Score imported using " + importer.get_Name(), null);
            break;
        }
        catch(e){
            if (!(e.exception instanceof AlphaTab.Importer.UnsupportedFormatException)){
                AlphaTab.Util.Logger.Info("ScoreLoader", "Score import failed due to unexpected error: " + e, null);
                throw $CreateException(e, new Error());
            }
            else {
                AlphaTab.Util.Logger.Info("ScoreLoader", importer.get_Name() + " does not support the file", null);
            }
        }
    }
    if (score != null){
        return score;
    }
    AlphaTab.Util.Logger.Error("ScoreLoader", "No compatible importer found for file", null);
    throw $CreateException(new AlphaTab.Importer.NoCompatibleReaderFoundException(), new Error());
};
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
            for (var key in track.Chords){
                var chord = track.Chords[key];
                var chord2 = {};
                AlphaTab.Model.Chord.CopyTo(chord, chord2);
                track2.Chords[key] = chord;
            }
            track2.Staves = [];
            for (var s = 0; s < track.Staves.length; s++){
                var staff = track.Staves[s];
                var staff2 = {};
                staff2.Bars = [];
                for (var b = 0; b < staff.Bars.length; b++){
                    var bar = staff.Bars[b];
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
                    staff2.Bars.push(bar2);
                }
                track2.Staves.push(staff2);
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
            var track2 = new AlphaTab.Model.Track(track.Staves.length);
            AlphaTab.Model.Track.CopyTo(track, track2);
            score2.AddTrack(track2);
            AlphaTab.Model.PlaybackInformation.CopyTo(track.PlaybackInfo, track2.PlaybackInfo);
            for (var key in track.Chords){
                var chord = track.Chords[key];
                var chord2 = new AlphaTab.Model.Chord();
                AlphaTab.Model.Chord.CopyTo(chord, chord2);
                track2.Chords[key] = chord2;
            }
            for (var s = 0; s < track.Staves.length; s++){
                var staff = track.Staves[s];
                for (var b = 0; b < staff.Bars.length; b++){
                    var bar = staff.Bars[b];
                    var bar2 = new AlphaTab.Model.Bar();
                    AlphaTab.Model.Bar.CopyTo(bar, bar2);
                    track2.AddBarToStaff(s, bar2);
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
        }
        score2.Finish();
        return score2;
    }
};
AlphaTab.Platform = AlphaTab.Platform || {};
AlphaTab.Platform.JavaScript = AlphaTab.Platform.JavaScript || {};
AlphaTab.Platform.JavaScript.ResizeEventArgs = function (){
    this.OldWidth = 0;
    this.NewWidth = 0;
    this.Settings = null;
};
AlphaTab.Platform.JavaScript.JsApi = function (element, options){
    this._visibilityCheckerInterval = 0;
    this._visibilityCheckerIntervalId = 0;
    this._renderResults = null;
    this._totalResultCount = 0;
    this.Element = null;
    this.CanvasElement = null;
    this.Settings = null;
    this.Renderer = null;
    this.Score = null;
    this.TrackIndexes = null;
    this.Element = element;
    this.Element.classList.add("alphaTab");
    // load settings
    var dataAttributes = this.GetDataAttributes();
    var settings = this.Settings = AlphaTab.Settings.FromJson(options, dataAttributes);
    var autoSize = settings.Width < 0;
    // get track data to parse
    var tracksData;
    if (options != null && options.tracks){
        tracksData = options.tracks;
    }
    else {
        if (dataAttributes.hasOwnProperty("tracks")){
            tracksData = dataAttributes["tracks"];
        }
        else {
            tracksData = 0;
        }
    }
    this.SetTracks(tracksData, false);
    var contents = "";
    if (element != null){
        // get load contents
        if (dataAttributes.hasOwnProperty("tex") && element.innerText){
            contents = (element.innerHTML).trim();
            element.innerHTML = "";
        }
        this.CanvasElement = document.createElement("div");
        this.CanvasElement.className = "alphaTabSurface";
        this.CanvasElement.style.fontSize = "0";
        this.CanvasElement.style.overflow = "hidden";
        this.CanvasElement.style.lineHeight = "0";
        element.appendChild(this.CanvasElement);
        if (settings.Engine == "default" || settings.Engine == "svg"){
            window.addEventListener("scroll", $CreateAnonymousDelegate(this, function (e){
                this.ShowSvgsInViewPort();
            }), true);
            window.addEventListener("resize", $CreateAnonymousDelegate(this, function (e){
                this.ShowSvgsInViewPort();
            }), true);
        }
        if (autoSize){
            settings.Width = element.offsetWidth;
            var timeoutId = 0;
            window.addEventListener("resize", $CreateAnonymousDelegate(this, function (e){
                clearTimeout(timeoutId);
                timeoutId = setTimeout($CreateAnonymousDelegate(this, function (){
                    if (element.offsetWidth != settings.Width){
                        this.TriggerResize();
                    }
                }), 1);
            }));
        }
    }
    this.CreateStyleElement(settings);
    if (element != null && autoSize){
        var initialResizeEventInfo = new AlphaTab.Platform.JavaScript.ResizeEventArgs();
        initialResizeEventInfo.OldWidth = 0;
        initialResizeEventInfo.NewWidth = element.offsetWidth;
        initialResizeEventInfo.Settings = settings;
        this.TriggerEvent("resize", initialResizeEventInfo);
        settings.Width = initialResizeEventInfo.NewWidth;
    }
    var workersUnsupported = !window.Worker;
    if (settings.UseWebWorker && !workersUnsupported && settings.Engine != "html5"){
        this.Renderer = new AlphaTab.Platform.JavaScript.WorkerScoreRenderer(this, settings);
    }
    else {
        this.Renderer = new AlphaTab.Rendering.ScoreRenderer(settings);
    }
    this.Renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (o){
        this.TriggerEvent("rendered", null);
    }));
    this.Renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
        this.Element.classList.remove("loading");
        this.Element.classList.remove("rendering");
        this.TriggerEvent("postRendered", null);
    }));
    this.Renderer.add_PreRender($CreateAnonymousDelegate(this, function (result){
        this._renderResults = [];
        this._totalResultCount = 0;
        this.AppendRenderResult(result);
    }));
    this.Renderer.add_PartialRenderFinished($CreateDelegate(this, this.AppendRenderResult));
    this.Renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (r){
        this.AppendRenderResult(r);
        this.AppendRenderResult(null);
        // marks last element
    }));
    this.Renderer.add_Error($CreateDelegate(this, this.Error));
    var initialRender = $CreateAnonymousDelegate(this, function (){
        // rendering was possibly delayed due to invisible element
        // in this case we need the correct width for autosize
        if (autoSize){
            this.Settings.Width = this.Element.offsetWidth;
            this.Renderer.UpdateSettings(settings);
        }
        if (!((contents==null)||(contents.length==0))){
            this.Tex(contents);
        }
        else if (options && options.file){
            this.Load(options.file);
        }
        else if (dataAttributes.hasOwnProperty("file")){
            this.Load(dataAttributes["file"]);
        }
    });
    this._visibilityCheckerInterval = options && options.visibilityCheckInterval || 500;
    if (this.get_IsElementVisible()){
        // element is visible, so we start rendering
        initialRender();
    }
    else {
        // if the alphaTab element is not visible, we postpone the rendering
        // we check in a regular interval whether it became available. 
        AlphaTab.Util.Logger.Warning("Rendering", "AlphaTab container is invisible, checking for element visibility in " + this._visibilityCheckerInterval + "ms intervals", null);
        this._visibilityCheckerIntervalId = setInterval($CreateAnonymousDelegate(this, function (){
            if (this.get_IsElementVisible()){
                AlphaTab.Util.Logger.Info("Rendering", "AlphaTab container became visible, triggering initial rendering", null);
                initialRender();
                clearInterval(this._visibilityCheckerIntervalId);
                this._visibilityCheckerIntervalId = 0;
            }
        }), this._visibilityCheckerInterval);
    }
};
AlphaTab.Platform.JavaScript.JsApi.prototype = {
    get_IsElementVisible: function (){
        return !!(this.Element.offsetWidth || this.Element.offsetHeight || this.Element.getClientRects().length);
    },
    get_Tracks: function (){
        var tracks = this.TrackIndexesToTracks(this.TrackIndexes);
        if (tracks.length == 0 && this.Score.Tracks.length > 0){
            tracks.push(this.Score.Tracks[0]);
        }
        return tracks.slice(0);
    },
    GetDataAttributes: function (){
        var dataAttributes = {};
        if (this.Element.dataset){
            for (var key in this.Element.dataset){
                var value = this.Element.dataset[key];
                try{
                    value = JSON.parse(value);
                }
                catch($$e1){
                    if (value == ""){
                        value = null;
                    }
                }
                dataAttributes[key] = value;
            }
        }
        else {
            for (var i = 0; i < this.Element.attributes.length; i++){
                var attr = this.Element.attributes[i];
                if (attr.nodeName.indexOf("data-")==0){
                    var keyParts = attr.nodeName.substr(5).split("-");
                    var key = keyParts[0];
                    for (var j = 1; j < keyParts.length; j++){
                        key += keyParts[j].substr(0, 1).toUpperCase() + keyParts[j].substr(1);
                    }
                    var value = attr.nodeValue;
                    try{
                        value = JSON.parse(value);
                    }
                    catch($$e2){
                        if (value == ""){
                            value = null;
                        }
                    }
                    dataAttributes[key] = value;
                }
            }
        }
        return dataAttributes;
    },
    TriggerResize: function (){
        // if the element is visible, perfect, we do the update
        if (this.get_IsElementVisible()){
            if (this._visibilityCheckerIntervalId != 0){
                AlphaTab.Util.Logger.Info("Rendering", "AlphaTab container became visible again, doing autosizing", null);
                clearInterval(this._visibilityCheckerIntervalId);
                this._visibilityCheckerIntervalId = 0;
            }
            var resizeEventInfo = new AlphaTab.Platform.JavaScript.ResizeEventArgs();
            resizeEventInfo.OldWidth = this.Settings.Width;
            resizeEventInfo.NewWidth = this.Element.offsetWidth;
            resizeEventInfo.Settings = this.Settings;
            this.TriggerEvent("resize", resizeEventInfo);
            this.Settings.Width = resizeEventInfo.NewWidth;
            this.Renderer.UpdateSettings(this.Settings);
            this.Renderer.Resize(this.Element.offsetWidth);
        }
        else if (this._visibilityCheckerIntervalId == 0){
            AlphaTab.Util.Logger.Warning("Rendering", "AlphaTab container was invisible while autosizing, checking for element visibility in " + this._visibilityCheckerInterval + "ms intervals", null);
            this._visibilityCheckerIntervalId = setInterval($CreateDelegate(this, this.TriggerResize), this._visibilityCheckerInterval);
        }
    },
    ShowSvgsInViewPort: function (){
        var placeholders = this.CanvasElement.querySelectorAll("[data-lazy=true]");
        for (var $i3 = 0,$l3 = placeholders.length,x = placeholders[$i3]; $i3 < $l3; $i3++, x = placeholders[$i3]){
            var placeholder = x;
            if (AlphaTab.Platform.JavaScript.JsApi.IsElementInViewPort(placeholder)){
                placeholder.outerHTML = placeholder.svg;
            }
        }
    },
    Print: function (width){
        // prepare a popup window for printing (a4 width, window height, centered)
        var preview = window.open("", "", "width=0,height=0");
        var a4 = preview.document.createElement("div");
        if (!((width==null)||(width.length==0))){
            a4.style.width = width;
        }
        else {
            a4.style.width = "210mm";
        }
        preview.document.write("<!DOCTYPE html><html></head><body></body></html>");
        preview.document.body.appendChild(a4);
        var dualScreenLeft = typeof(window.screenLeft) != "undefined" ? window.screenLeft : screen["left"];
        var dualScreenTop = typeof(window.screenTop) != "undefined" ? window.screenTop : screen["top"];
        var screenWidth = typeof(window.innerWidth) != "undefined" ? window.innerWidth : typeof(document.documentElement.clientWidth) != "undefined" ? document.documentElement.clientWidth : screen.width;
        var screenHeight = typeof(window.innerHeight) != "undefined" ? window.innerHeight : typeof(document.documentElement.clientHeight) != "undefined" ? document.documentElement.clientHeight : screen.height;
        var w = a4.offsetWidth + 50;
        var h = window.innerHeight;
        var left = (((screenWidth / 2) | 0) - ((w / 2) | 0)) + dualScreenLeft;
        var top = (((screenHeight / 2) | 0) - ((h / 2) | 0)) + dualScreenTop;
        preview.resizeTo(w, h);
        preview.moveTo(left, top);
        preview.focus();
        // render alphaTab
        var settings = AlphaTab.Settings.get_Defaults();
        settings.ScriptFile = this.Settings.ScriptFile;
        settings.FontDirectory = this.Settings.FontDirectory;
        settings.Scale = 0.8;
        settings.StretchForce = 0.8;
        settings.DisableLazyLoading = true;
        settings.UseWebWorker = false;
        var alphaTab = new AlphaTab.Platform.JavaScript.JsApi(a4, settings);
        alphaTab.Renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
            alphaTab.CanvasElement.style.height = "100%";
            preview.window.print();
        }));
        alphaTab.SetTracks(this.get_Tracks(), true);
    },
    AppendRenderResult: function (result){
        if (result != null){
            this.CanvasElement.style.width = result.TotalWidth + "px";
            this.CanvasElement.style.height = result.TotalHeight + "px";
        }
        if (result == null || result.RenderResult != null){
            // the queue/dequeue like mechanism used here is to maintain the order within the setTimeout. 
            // setTimeout allows to decouple the rendering from the JS processing a bit which makes the overall display faster. 
            this._renderResults.push(result);
            setTimeout($CreateAnonymousDelegate(this, function (){
                while (this._renderResults.length > 0){
                    var renderResult = this._renderResults[0];
                    this._renderResults.splice(0,1);
                    // null result indicates that the rendering finished
                    if (renderResult == null){
                        // so we remove elements that might be from a previous render session
                        while (this.CanvasElement.childElementCount > this._totalResultCount){
                            this.CanvasElement.removeChild(this.CanvasElement.lastChild);
                        }
                    }
                    else {
                        var body = renderResult.RenderResult;
                        if (typeof(body) == "string"){
                            var placeholder;
                            if (this._totalResultCount < this.CanvasElement.childElementCount){
                                placeholder = this.CanvasElement.children[this._totalResultCount];
                            }
                            else {
                                placeholder = document.createElement("div");
                                this.CanvasElement.appendChild(placeholder);
                            }
                            placeholder.style.width = renderResult.Width + "px";
                            placeholder.style.height = renderResult.Height + "px";
                            placeholder.style.display = "inline-block";
                            if (AlphaTab.Platform.JavaScript.JsApi.IsElementInViewPort(placeholder) || this.Settings.DisableLazyLoading){
                                placeholder.outerHTML = body;
                            }
                            else {
                                placeholder.svg = body;
                                placeholder.setAttribute("data-lazy", "true");
                            }
                        }
                        else {
                            if (this._totalResultCount < this.CanvasElement.childElementCount){
                                this.CanvasElement.replaceChild(renderResult.RenderResult, this.CanvasElement.children[this._totalResultCount]);
                            }
                            else {
                                this.CanvasElement.appendChild(renderResult.RenderResult);
                            }
                        }
                        this._totalResultCount++;
                    }
                }
            }), 1);
        }
    },
    CreateStyleElement: function (settings){
        var elementDocument = this.Element.ownerDocument;
        var styleElement = elementDocument.getElementById("alphaTabStyle");
        if (styleElement == null){
            var fontDirectory = settings.FontDirectory;
            styleElement = elementDocument.createElement("style");
            styleElement.id = "alphaTabStyle";
            styleElement.type = "text/css";
            var css = new String();
            css+="@font-face {"+'\r\n';
            css+="    font-family: \'alphaTab\';"+'\r\n';
            css+="     src: url(\'" + fontDirectory + "Bravura.eot\');"+'\r\n';
            css+="     src: url(\'" + fontDirectory + "Bravura.eot?#iefix\') format(\'embedded-opentype\')"+'\r\n';
            css+="          , url(\'" + fontDirectory + "Bravura.woff\') format(\'woff\')"+'\r\n';
            css+="          , url(\'" + fontDirectory + "Bravura.otf\') format(\'opentype\')"+'\r\n';
            css+="          , url(\'" + fontDirectory + "Bravura.svg#Bravura\') format(\'svg\');"+'\r\n';
            css+="     font-weight: normal;"+'\r\n';
            css+="     font-style: normal;"+'\r\n';
            css+="}"+'\r\n';
            css+=".alphaTabSurface * {"+'\r\n';
            css+="    cursor: default;"+'\r\n';
            css+="}"+'\r\n';
            css+=".at {"+'\r\n';
            css+="     font-family: \'alphaTab\';"+'\r\n';
            css+="     speak: none;"+'\r\n';
            css+="     font-style: normal;"+'\r\n';
            css+="     font-weight: normal;"+'\r\n';
            css+="     font-variant: normal;"+'\r\n';
            css+="     text-transform: none;"+'\r\n';
            css+="     line-height: 1;"+'\r\n';
            css+="     line-height: 1;"+'\r\n';
            css+="     -webkit-font-smoothing: antialiased;"+'\r\n';
            css+="     -moz-osx-font-smoothing: grayscale;"+'\r\n';
            css+="     font-size: 34px;"+'\r\n';
            css+="     overflow: visible !important;"+'\r\n';
            css+="}"+'\r\n';
            styleElement.innerHTML = css;
            elementDocument.getElementsByTagName("head")[0].appendChild(styleElement);
        }
    },
    Destroy: function (){
        this.Element.innerHTML = "";
        this.Renderer.Destroy();
    },
    Load: function (data){
        this.Element.classList.add("loading");
        try{
            if ((data instanceof ArrayBuffer)){
                this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(new Uint8Array(data)), true);
            }
            else if ((data instanceof Uint8Array)){
                this.ScoreLoaded(AlphaTab.Importer.ScoreLoader.LoadScoreFromBytes(data), true);
            }
            else if (typeof(data) == "string"){
                AlphaTab.Importer.ScoreLoader.LoadScoreAsync(data, $CreateAnonymousDelegate(this, function (s){
                    this.ScoreLoaded(s, true);
                }), $CreateAnonymousDelegate(this, function (e){
                    this.Error("import", e);
                }));
            }
        }
        catch(e){
            this.Error("import", e);
        }
    },
    Tex: function (contents){
        this.Element.classList.add("loading");
        try{
            var parser = new AlphaTab.Importer.AlphaTexImporter();
            var data = AlphaTab.IO.ByteBuffer.FromBuffer(AlphaTab.Platform.Std.StringToByteArray(contents));
            parser.Init(data);
            this.ScoreLoaded(parser.ReadScore(), true);
        }
        catch(e){
            this.Error("import", e);
        }
    },
    SetTracks: function (tracksData, render){
        if (tracksData.length && typeof(tracksData[0].Index) == "number"){
            this.Score = tracksData[0].Score;
        }
        else if (typeof(tracksData.Index) == "number"){
            this.Score = tracksData.Score;
        }
        this.TrackIndexes = this.ParseTracks(tracksData);
        if (render){
            this.Render();
        }
    },
    TrackIndexesToTracks: function (trackIndexes){
        var tracks = [];
        for (var $i4 = 0,$l4 = trackIndexes.length,track = trackIndexes[$i4]; $i4 < $l4; $i4++, track = trackIndexes[$i4]){
            if (track >= 0 && track < this.Score.Tracks.length){
                tracks.push(this.Score.Tracks[track]);
            }
        }
        return tracks;
    },
    ParseTracks: function (tracksData){
        var tracks = [];
        // decode string
        if (typeof(tracksData) == "string"){
            try{
                tracksData = JSON.parse(tracksData);
            }
            catch($$e3){
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
                else if (typeof(tracksData[i].Index) == "number"){
                    var track = tracksData[i];
                    value = track.Index;
                }
                else {
                    value = AlphaTab.Platform.Std.ParseInt(tracksData[i].ToString());
                }
                if (value >= 0){
                    tracks.push(value);
                }
            }
        }
        else if (typeof(tracksData.Index) == "number"){
            tracks.push(tracksData.Index);
        }
        return tracks.slice(0);
    },
    ScoreLoaded: function (score, render){
        AlphaTab.Model.ModelUtils.ApplyPitchOffsets(this.Settings, score);
        this.Score = score;
        this.TriggerEvent("loaded", score);
        if (render){
            this.Render();
        }
    },
    Error: function (type, details){
        AlphaTab.Util.Logger.Error(type, "An unexpected error occurred", details);
        this.TriggerEvent("error", {
            type: type,
            details: details
        });
    },
    TriggerEvent: function (name, details){
        if (this.Element != null){
            name = "alphaTab." + name;
            var e = document.createEvent("CustomEvent");
            e.initCustomEvent(name, false, false, details);
            this.Element.dispatchEvent(e);
            if (window&&"jQuery"in window){
                var jquery = window["jQuery"];
                jquery(this.Element).trigger(name, details);
            }
        }
    },
    Render: function (){
        if (this.Renderer == null)
            return;
        var renderAction = null;
        renderAction = $CreateAnonymousDelegate(this, function (){
            // if font is not yet loaded, try again in 1 sec
            if (!AlphaTab.Environment.IsFontLoaded){
                window.setTimeout($CreateAnonymousDelegate(this, function (){
                    renderAction();
                }), 1000);
            }
            else {
                // when font is finally loaded, start rendering
                this.Renderer.Render(this.Score, this.TrackIndexes);
            }
        });
        renderAction();
    },
    UpdateLayout: function (json){
        this.Settings.Layout = AlphaTab.Settings.LayoutFromJson(json);
        this.Renderer.UpdateSettings(this.Settings);
        this.Renderer.Invalidate();
    }
};
AlphaTab.Platform.JavaScript.JsApi.IsElementInViewPort = function (el){
    var rect = el.getBoundingClientRect();
    return (rect.top + rect.height >= 0 && rect.top <= window.innerHeight && rect.left + rect.width >= 0 && rect.left <= window.innerWidth);
};
AlphaTab.Platform.JavaScript.JsWorker = function (main){
    this._renderer = null;
    this._main = null;
    this._main = main;
    this._main.addEventListener("message", $CreateDelegate(this, this.HandleMessage), false);
};
AlphaTab.Platform.JavaScript.JsWorker.prototype = {
    HandleMessage: function (e){
        var data = e.data;
        var cmd = data ? data["cmd"] : "";
        switch (cmd){
            case "alphaTab.initialize":
                var settings = AlphaTab.Settings.FromJson(data["settings"], null);
                this._renderer = new AlphaTab.Rendering.ScoreRenderer(settings);
                this._renderer.add_PartialRenderFinished($CreateAnonymousDelegate(this, function (result){
                this._main.postMessage({
    cmd: "alphaTab.partialRenderFinished",
    result: result
}
);
            }));
                this._renderer.add_RenderFinished($CreateAnonymousDelegate(this, function (result){
                this._main.postMessage({
    cmd: "alphaTab.renderFinished",
    result: result
}
);
            }));
                this._renderer.add_PostRenderFinished($CreateAnonymousDelegate(this, function (){
                this._main.postMessage({
    cmd: "alphaTab.postRenderFinished",
    boundsLookup: this._renderer.BoundsLookup.ToJson()
}
);
            }));
                this._renderer.add_PreRender($CreateAnonymousDelegate(this, function (result){
                this._main.postMessage({
    cmd: "alphaTab.preRender",
    result: result
}
);
            }));
                this._renderer.add_Error($CreateDelegate(this, this.Error));
                break;
            case "alphaTab.invalidate":
                this._renderer.Invalidate();
                break;
            case "alphaTab.resize":
                this._renderer.Resize(data["width"]);
                break;
            case "alphaTab.render":
                var converter = new AlphaTab.Model.JsonConverter();
                var score = converter.JsObjectToScore(data["score"]);
                this.RenderMultiple(score, data["trackIndexes"]);
                break;
            case "alphaTab.updateSettings":
                this.UpdateSettings(data["settings"]);
                break;
        }
    },
    UpdateSettings: function (settings){
        this._renderer.UpdateSettings(AlphaTab.Settings.FromJson(settings, null));
    },
    RenderMultiple: function (score, trackIndexes){
        try{
            this._renderer.Render(score, trackIndexes);
        }
        catch(e){
            this.Error("render", e);
        }
    },
    Error: function (type, e){
        AlphaTab.Util.Logger.Error(type, "An unexpected error occurred in worker", e);
        var error = JSON.parse(JSON.stringify(e));
        if (e["message"]){
            error.message = e["message"];
        }
        if (e["stack"]){
            error.stack = e["stack"];
        }
        if (e["constructor"] && e["constructor"]["name"]){
            error.type = e["constructor"]["name"];
        }
        this._main.postMessage({
    cmd: "alphaTab.error",
    error: {
        type: type,
        detail: error
    }
}
);
    }
};
$StaticConstructor(function (){
    if (!self.document){
        new AlphaTab.Platform.JavaScript.JsWorker(self);
    }
});
AlphaTab.Platform.JavaScript.Html5Canvas = function (){
    this._canvas = null;
    this._context = null;
    this._color = null;
    this._font = null;
    this._musicFont = null;
    this._Resources = null;
    this._color = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
    var fontElement = document.createElement("span");
    fontElement.classList.add("at");
    document.body.appendChild(fontElement);
    var style = window.getComputedStyle(fontElement, null);
    this._musicFont = new AlphaTab.Platform.Model.Font(style.fontFamily, AlphaTab.Platform.Std.ParseFloat(style.fontSize), AlphaTab.Platform.Model.FontStyle.Plain);
};
AlphaTab.Platform.JavaScript.Html5Canvas.prototype = {
    get_Resources: function (){
        return this._Resources;
    },
    set_Resources: function (value){
        this._Resources = value;
    },
    OnPreRender: function (){
        // nothing to do
        return null;
    },
    OnRenderFinished: function (){
        // nothing to do
        return null;
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
        if (this._color.RGBA == value.RGBA)
            return;
        this._color = value;
        this._context.strokeStyle = value.RGBA;
        this._context.fillStyle = value.RGBA;
    },
    get_LineWidth: function (){
        return this._context.lineWidth;
    },
    set_LineWidth: function (value){
        this._context.lineWidth = value;
    },
    FillRect: function (x, y, w, h){
        if (w > 0){
            this._context.fillRect(x | 0 - 0.5, y | 0 - 0.5, w, h);
        }
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
        this._context.beginPath();
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
        this._context.font = value.ToCssString(1);
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
            case "middle":
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
    BeginGroup: function (identifier){
    },
    EndGroup: function (){
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
        var baseLine = this._context.textBaseline;
        var font = this._context.font;
        this._context.font = this._musicFont.ToCssString(scale);
        this._context.textBaseline = "middle";
        this._context.fillText(String.fromCharCode(symbol), x, y);
        this._context.textBaseline = baseLine;
        this._context.font = font;
    }
};
AlphaTab.Platform.JavaScript.WorkerScoreRenderer = function (api, settings){
    this._api = null;
    this._worker = null;
    this.PreRender = null;
    this.PartialRenderFinished = null;
    this.RenderFinished = null;
    this.Error = null;
    this.PostRenderFinished = null;
    this.BoundsLookup = null;
    this._api = api;
    // Bug #172: FireFox silently does not start the worker when script is on a different domain
    // we use blob workers always since they seem to work always
    try{
        var script = "importScripts(\'" + settings.ScriptFile + "\')";
        var blob = new Blob([script]);
        this._worker = new Worker(window.URL.createObjectURL(blob));
    }
    catch(e){
        AlphaTab.Util.Logger.Error("Rendering", "Failed to create WebWorker: " + e, null);
        // TODO: fallback to synchronous mode
    }
    this._worker.postMessage({
        cmd: "alphaTab.initialize",
        settings: settings.ToJson()
    });
    this._worker.addEventListener("message", $CreateDelegate(this, this.HandleWorkerMessage), false);
};
AlphaTab.Platform.JavaScript.WorkerScoreRenderer.prototype = {
    Destroy: function (){
        this._worker.terminate();
    },
    UpdateSettings: function (settings){
        this._worker.postMessage({
            cmd: "alphaTab.updateSettings",
            settings: settings.ToJson()
        });
    },
    Invalidate: function (){
        this._worker.postMessage({
            cmd: "alphaTab.invalidate"
        });
    },
    Resize: function (width){
        this._worker.postMessage({
            cmd: "alphaTab.resize",
            width: width
        });
    },
    HandleWorkerMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "alphaTab.preRender":
                this.OnPreRender(data["result"]);
                break;
            case "alphaTab.partialRenderFinished":
                this.OnPartialRenderFinished(data["result"]);
                break;
            case "alphaTab.renderFinished":
                this.OnRenderFinished(data["result"]);
                break;
            case "alphaTab.postRenderFinished":
                this.BoundsLookup = AlphaTab.Rendering.Utils.BoundsLookup.FromJson(data["boundsLookup"], this._api.Score);
                this.OnPostRenderFinished();
                break;
            case "alphaTab.error":
                this.OnError(data["type"], data["detail"]);
                break;
        }
    },
    Render: function (score, trackIndexes){
        var converter = new AlphaTab.Model.JsonConverter();
        score = converter.ScoreToJsObject(score);
        this._worker.postMessage({
            cmd: "alphaTab.render",
            score: score,
            trackIndexes: trackIndexes
        });
    },
    add_PreRender: function (value){
        this.PreRender = $CombineDelegates(this.PreRender, value);
    },
    remove_PreRender: function (value){
        this.PreRender = $RemoveDelegate(this.PreRender, value);
    },
    OnPreRender: function (obj){
        var handler = this.PreRender;
        if (handler != null)
            handler(obj);
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
    add_Error: function (value){
        this.Error = $CombineDelegates(this.Error, value);
    },
    remove_Error: function (value){
        this.Error = $RemoveDelegate(this.Error, value);
    },
    OnError: function (type, details){
        var handler = this.Error;
        if (handler != null)
            handler(type, details);
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
    }
};
AlphaTab.Platform.Std = function (){
};
AlphaTab.Platform.Std.ParseFloat = function (s){
    return parseFloat(s);
};
AlphaTab.Platform.Std.Log = function (logLevel, category, msg, details){
     var stack = new Error().stack;;
     if(!stack) { try { throw new Error(); } catch(e) { stack = e.stack; } };
    // ReSharper disable once RedundantAssignment
    msg = "[AlphaTab][" + category + "] " + msg;
    switch (logLevel){
        case AlphaTab.Util.LogLevel.None:
            break;
        case AlphaTab.Util.LogLevel.Debug:
             console.debug(msg, details);;
            break;
        case AlphaTab.Util.LogLevel.Info:
             console.info(msg, details);;
            break;
        case AlphaTab.Util.LogLevel.Warning:
             console.warn(msg, details);;
            break;
        case AlphaTab.Util.LogLevel.Error:
             console.error(msg, stack, details);;
            break;
    }
};
AlphaTab.Platform.Std.ParseInt = function (s){
    var val = parseInt(s);
    return isNaN(val) ? -2147483648 : val;
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
AlphaTab.Platform.Std.ReadSignedByte = function (readable){
    var n = readable.ReadByte();
    if (n >= 128)
        return (n - 256);
    return n;
};
AlphaTab.Platform.Std.ToString = function (data){
    var s = new String();
    var i = 0;
    while (i < data.length){
        var c = data[i++];
        if (c < 128){
            if (c == 0)
                break;
            s+=String.fromCharCode(c);
        }
        else if (c < 224){
            s+=String.fromCharCode(((c & 63) << 6) | (data[i++] & 127));
        }
        else if (c < 240){
            s+=String.fromCharCode(((c & 31) << 12) | ((data[i++] & 127) << 6) | (data[i++] & 127));
        }
        else {
            var u = ((c & 15) << 18) | ((data[i++] & 127) << 12) | ((data[i++] & 127) << 6) | (data[i++] & 127);
            s+=String.fromCharCode((u >> 18) + 55232);
            s+=String.fromCharCode((u & 1023) | 56320);
        }
    }
    return s;
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
    return c == 32 || c == 11 || c == 13 || c == 10 || c == 9;
};
AlphaTab.Platform.Std.ToHexString = function (n, digits){
    var s = "";
    var hexChars = "0123456789ABCDEF";
    do{
        s = String.fromCharCode(hexChars.charCodeAt((n & 15))) + s;
        n >>= 4;
    }
    while (n > 0)
    while (s.length < digits){
        s = "0" + s;
    }
    return s;
};
AlphaTab.Rendering = AlphaTab.Rendering || {};
AlphaTab.Rendering.Utils = AlphaTab.Rendering.Utils || {};
AlphaTab.Rendering.Utils.BoundsLookup = function (){
    this._beatLookup = null;
    this._currentStaveGroup = null;
    this.StaveGroups = null;
    this.IsFinished = false;
    this.StaveGroups = [];
    this._beatLookup = {};
};
AlphaTab.Rendering.Utils.BoundsLookup.prototype = {
    ToJson: function (){
        var json = {};
        var staveGroups = [];
        json.StaveGroups = staveGroups;
        for (var $i9 = 0,$t9 = this.StaveGroups,$l9 = $t9.length,group = $t9[$i9]; $i9 < $l9; $i9++, group = $t9[$i9]){
            var g = {};
            g.VisualBounds = this.BoundsToJson(group.VisualBounds);
            g.RealBounds = this.BoundsToJson(group.RealBounds);
            g.Bars = [];
            for (var $i10 = 0,$t10 = group.Bars,$l10 = $t10.length,masterBar = $t10[$i10]; $i10 < $l10; $i10++, masterBar = $t10[$i10]){
                var mb = {};
                mb.VisualBounds = this.BoundsToJson(masterBar.VisualBounds);
                mb.RealBounds = this.BoundsToJson(masterBar.RealBounds);
                mb.Bars = [];
                for (var $i11 = 0,$t11 = masterBar.Bars,$l11 = $t11.length,bar = $t11[$i11]; $i11 < $l11; $i11++, bar = $t11[$i11]){
                    var b = {};
                    b.VisualBounds = this.BoundsToJson(bar.VisualBounds);
                    b.RealBounds = this.BoundsToJson(bar.RealBounds);
                    b.Beats = [];
                    for (var $i12 = 0,$t12 = bar.Beats,$l12 = $t12.length,beat = $t12[$i12]; $i12 < $l12; $i12++, beat = $t12[$i12]){
                        var bb = {};
                        bb.VisualBounds = this.BoundsToJson(beat.VisualBounds);
                        bb.RealBounds = this.BoundsToJson(beat.RealBounds);
                        bb.BeatIndex = beat.Beat.Index;
                        bb.VoiceIndex = beat.Beat.Voice.Index;
                        bb.BarIndex = beat.Beat.Voice.Bar.Index;
                        bb.StaffIndex = beat.Beat.Voice.Bar.Staff.Index;
                        bb.TrackIndex = beat.Beat.Voice.Bar.Staff.Track.Index;
                        b.Beats.push(bb);
                    }
                    mb.Bars.push(b);
                }
                g.Bars.push(mb);
            }
            staveGroups.push(g);
        }
        return json;
    },
    BoundsToJson: function (bounds){
        var json = {};
        json.X = bounds.X;
        json.Y = bounds.Y;
        json.W = bounds.W;
        json.H = bounds.H;
        return json;
    },
    Finish: function (){
        for (var i = 0; i < this.StaveGroups.length; i++){
            this.StaveGroups[i].Finish();
        }
        this.IsFinished = true;
    },
    AddStaveGroup: function (bounds){
        bounds.Index = this.StaveGroups.length;
        bounds.BoundsLookup = this;
        this.StaveGroups.push(bounds);
        this._currentStaveGroup = bounds;
    },
    AddMasterBar: function (bounds){
        bounds.StaveGroupBounds = this._currentStaveGroup;
        this._currentStaveGroup.AddBar(bounds);
    },
    AddBeat: function (bounds){
        this._beatLookup[bounds.Beat.Id] = bounds;
    },
    FindBeat: function (beat){
        var id = beat.Id;
        if (this._beatLookup.hasOwnProperty(id)){
            return this._beatLookup[id];
        }
        return null;
    },
    GetBeatAtPos: function (x, y){
        //
        // find a bar which matches in y-axis
        var bottom = 0;
        var top = this.StaveGroups.length - 1;
        var staveGroupIndex = -1;
        while (bottom <= top){
            var middle = ((top + bottom) / 2) | 0;
            var group = this.StaveGroups[middle];
            // found?
            if (y >= group.RealBounds.Y && y <= (group.RealBounds.Y + group.RealBounds.H)){
                staveGroupIndex = middle;
                break;
            }
            // search in lower half 
            if (y < group.RealBounds.Y){
                top = middle - 1;
            }
            else {
                bottom = middle + 1;
            }
        }
        // no bar found
        if (staveGroupIndex == -1)
            return null;
        // 
        // Find the matching bar in the row
        var staveGroup = this.StaveGroups[staveGroupIndex];
        var bar = staveGroup.FindBarAtPos(x);
        if (bar != null){
            return bar.FindBeatAtPos(x, y);
        }
        return null;
    }
};
AlphaTab.Rendering.Utils.BoundsLookup.FromJson = function (json, score){
    var lookup = new AlphaTab.Rendering.Utils.BoundsLookup();
    var staveGroups = json["StaveGroups"];
    for (var $i5 = 0,$l5 = staveGroups.length,staveGroup = staveGroups[$i5]; $i5 < $l5; $i5++, staveGroup = staveGroups[$i5]){
        var sg = new AlphaTab.Rendering.Utils.StaveGroupBounds();
        sg.VisualBounds = staveGroup.VisualBounds;
        sg.RealBounds = staveGroup.RealBounds;
        lookup.AddStaveGroup(sg);
        for (var $i6 = 0,$t6 = staveGroup.Bars,$l6 = $t6.length,masterBar = $t6[$i6]; $i6 < $l6; $i6++, masterBar = $t6[$i6]){
            var mb = new AlphaTab.Rendering.Utils.MasterBarBounds();
            mb.IsFirstOfLine = masterBar.IsFirstOfLine;
            mb.VisualBounds = masterBar.VisualBounds;
            mb.RealBounds = masterBar.RealBounds;
            sg.AddBar(mb);
            for (var $i7 = 0,$t7 = masterBar.Bars,$l7 = $t7.length,bar = $t7[$i7]; $i7 < $l7; $i7++, bar = $t7[$i7]){
                var b = new AlphaTab.Rendering.Utils.BarBounds();
                b.VisualBounds = bar.VisualBounds;
                b.RealBounds = bar.RealBounds;
                mb.AddBar(b);
                for (var $i8 = 0,$t8 = bar.Beats,$l8 = $t8.length,beat = $t8[$i8]; $i8 < $l8; $i8++, beat = $t8[$i8]){
                    var bb = new AlphaTab.Rendering.Utils.BeatBounds();
                    bb.VisualBounds = beat.VisualBounds;
                    bb.RealBounds = beat.RealBounds;
                    bb.Beat = score.Tracks[beat["TrackIndex"]].Staves[beat["StaffIndex"]].Bars[beat["BarIndex"]].Voices[beat["VoiceIndex"]].Beats[beat["BeatIndex"]];
                    b.AddBeat(bb);
                }
            }
        }
    }
    return lookup;
};
AlphaTab.Settings = function (){
    this.ScriptFile = null;
    this.FontDirectory = null;
    this.DisableLazyLoading = false;
    this.UseWebWorker = false;
    this.Scale = 0;
    this.Width = 0;
    this.Engine = null;
    this.Layout = null;
    this.StretchForce = 0;
    this.ForcePianoFingering = false;
    this.Staves = null;
    this.TranspositionPitches = null;
    this.DisplayTranspositionPitches = null;
};
AlphaTab.Settings.prototype = {
    ToJson: function (){
        var json = {};
        json.useWorker = this.UseWebWorker;
        json.scale = this.Scale;
        json.width = this.Width;
        json.engine = this.Engine;
        json.stretchForce = this.StretchForce;
        json.forcePianoFingering = this.ForcePianoFingering;
        json.transpositionPitches = this.TranspositionPitches;
        json.displayTranspositionPitches = this.DisplayTranspositionPitches;
        json.scriptFile = this.ScriptFile;
        json.fontDirectory = this.FontDirectory;
        json.lazy = this.DisableLazyLoading;
        json.layout = {};
        json.layout.mode = this.Layout.Mode;
        json.layout.additionalSettings = {};
        for (var setting in this.Layout.AdditionalSettings){
            json.layout.additionalSettings[setting] = this.Layout.AdditionalSettings[setting];
        }
        json.staves = {};
        json.staves.id = this.Staves.Id;
        json.staves.additionalSettings = {};
        for (var additionalSetting in this.Staves.AdditionalSettings){
            json.staves.additionalSettings[additionalSetting] = this.Staves.AdditionalSettings[additionalSetting];
        }
        return json;
    }
};
AlphaTab.Settings.SetDefaults = function (settings){
    settings.UseWebWorker = true;
};
AlphaTab.Settings.FromJson = function (json, dataAttributes){
    if ((json instanceof AlphaTab.Settings)){
        return json;
    }
    var settings = AlphaTab.Settings.get_Defaults();
    settings.ScriptFile = AlphaTab.Environment.ScriptFile;
    AlphaTab.Settings.FillFromJson(settings, json, dataAttributes);
    return settings;
};
AlphaTab.Settings.FillFromJson = function (settings, json, dataAttributes){
    if (self.document && self.window["ALPHATAB_ROOT"]){
        settings.ScriptFile = self.window["ALPHATAB_ROOT"];
        settings.ScriptFile = AlphaTab.Settings.EnsureFullUrl(settings.ScriptFile);
        settings.ScriptFile = AlphaTab.Settings.AppendScriptName(settings.ScriptFile);
    }
    else {
        settings.ScriptFile = AlphaTab.Environment.ScriptFile;
    }
    if (self.document && self.window["ALPHATAB_FONT"]){
        settings.FontDirectory = self.window["ALPHATAB_FONT"];
        settings.FontDirectory = AlphaTab.Settings.EnsureFullUrl(settings.FontDirectory);
    }
    else {
        settings.FontDirectory = settings.ScriptFile;
        if (!((settings.FontDirectory==null)||(settings.FontDirectory.length==0))){
            var lastSlash = settings.FontDirectory.lastIndexOf("/");
            if (lastSlash >= 0){
                settings.FontDirectory = settings.FontDirectory.substr(0, lastSlash) + "/Font/";
            }
        }
    }
    if (json&&"useWorker"in json){
        settings.UseWebWorker = json.useWorker;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("useWorker")){
        settings.UseWebWorker = dataAttributes["useWorker"];
    }
    if (json&&"scale"in json){
        settings.Scale = json.scale;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("scale")){
        settings.Scale = dataAttributes["scale"];
    }
    if (json&&"width"in json){
        settings.Width = json.width;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("width")){
        settings.Width = dataAttributes["width"];
    }
    if (json&&"engine"in json){
        settings.Engine = json.engine;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("engine")){
        settings.Engine = dataAttributes["engine"];
    }
    if (json&&"stretchForce"in json){
        settings.StretchForce = json.stretchForce;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("stretchForce")){
        settings.StretchForce = dataAttributes["stretchForce"];
    }
    if (json&&"forcePianoFingering"in json){
        settings.ForcePianoFingering = json.forcePianoFingering;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("forcePianoFingering")){
        settings.ForcePianoFingering = dataAttributes["forcePianoFingering"];
    }
    if (json&&"lazy"in json){
        settings.DisableLazyLoading = !json.lazy;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("lazy")){
        settings.DisableLazyLoading = !dataAttributes["lazy"];
    }
    if (json&&"transpositionPitches"in json){
        settings.TranspositionPitches = json.transpositionPitches;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("transpositionPitches")){
        var pitchOffsets = dataAttributes["transpositionPitches"];
        if (pitchOffsets != null && (pitchOffsets instanceof Array)){
            settings.TranspositionPitches = pitchOffsets;
        }
    }
    if (json&&"displayTranspositionPitches"in json){
        settings.DisplayTranspositionPitches = json.displayTranspositionPitches;
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("displayTranspositionPitches")){
        var pitchOffsets = dataAttributes["displayTranspositionPitches"];
        if (pitchOffsets != null && (pitchOffsets instanceof Array)){
            settings.DisplayTranspositionPitches = pitchOffsets;
        }
    }
    if (json&&"scriptFile"in json){
        settings.ScriptFile = AlphaTab.Settings.EnsureFullUrl(json.scriptFile);
        settings.ScriptFile = AlphaTab.Settings.AppendScriptName(settings.ScriptFile);
    }
    if (json&&"fontDirectory"in json){
        settings.FontDirectory = AlphaTab.Settings.EnsureFullUrl(json.fontDirectory);
    }
    if (json&&"layout"in json){
        settings.Layout = AlphaTab.Settings.LayoutFromJson(json.layout);
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("layout")){
        settings.Layout = AlphaTab.Settings.LayoutFromJson(dataAttributes["layout"]);
    }
    if (dataAttributes != null){
        for (var key in dataAttributes){
            if (key.indexOf("layout")==0){
                var property = key.substr(6);
                settings.Layout.AdditionalSettings[property.toLowerCase()] = dataAttributes[key];
            }
        }
    }
    if (json&&"staves"in json){
        settings.Staves = AlphaTab.Settings.StavesFromJson(json.staves);
    }
    else if (dataAttributes != null && dataAttributes.hasOwnProperty("staves")){
        settings.Staves = AlphaTab.Settings.StavesFromJson(dataAttributes["staves"]);
    }
    if (dataAttributes != null){
        for (var key in dataAttributes){
            if (key.indexOf("staves")==0){
                var property = key.substr(6);
                settings.Staves.AdditionalSettings[property.toLowerCase()] = dataAttributes[key];
            }
        }
    }
};
AlphaTab.Settings.StavesFromJson = function (json){
    var staveSettings;
    if (typeof(json) == "string"){
        staveSettings = new AlphaTab.StaveSettings(json);
    }
    else if (json.id){
        staveSettings = new AlphaTab.StaveSettings(json.id);
        if (json.additionalSettings){
            var keys2 = Object.keys(json.additionalSettings);
            for (var $i13 = 0,$l13 = keys2.length,key2 = keys2[$i13]; $i13 < $l13; $i13++, key2 = keys2[$i13]){
                staveSettings.AdditionalSettings[key2.toLowerCase()] = json.additionalSettings[key2];
            }
        }
    }
    else {
        return new AlphaTab.StaveSettings("score-tab");
    }
    return staveSettings;
};
AlphaTab.Settings.LayoutFromJson = function (json){
    var layout = new AlphaTab.LayoutSettings();
    if (typeof(json) == "string"){
        layout.Mode = json;
    }
    else {
        if (json.mode)
            layout.Mode = json.mode;
        if (json.additionalSettings){
            var keys = Object.keys(json.additionalSettings);
            for (var $i14 = 0,$l14 = keys.length,key = keys[$i14]; $i14 < $l14; $i14++, key = keys[$i14]){
                layout.AdditionalSettings[key.toLowerCase()] = json.additionalSettings[key];
            }
        }
    }
    return layout;
};
AlphaTab.Settings.AppendScriptName = function (url){
    // append script name 
    if (!((url==null)||(url.length==0)) && !(url.lastIndexOf(".js")==(url.length-".js".length))){
        if (!(url.lastIndexOf("/")==(url.length-"/".length))){
            url += "/";
        }
        url += "AlphaTab.js";
    }
    return url;
};
AlphaTab.Settings.EnsureFullUrl = function (relativeUrl){
    if (!relativeUrl.indexOf("http")==0 && !relativeUrl.indexOf("https")==0){
        var root = new String();
        root+=window.location.protocol;
        root+="//";
        root+=window.location.hostname;
        if (window.location.port){
            root+=":";
            root+=window.location.port;
        }
        root+=relativeUrl;
        if (!(relativeUrl.lastIndexOf("/")==(relativeUrl.length-"/".length))){
            root+="/";
        }
        return root;
    }
    return relativeUrl;
};
AlphaTab.Settings.get_Defaults = function (){
    var settings = new AlphaTab.Settings();
    settings.Scale = 1;
    settings.StretchForce = 1;
    settings.Width = -1;
    settings.Engine = "default";
    settings.TranspositionPitches = new Int32Array(0);
    settings.DisplayTranspositionPitches = new Int32Array(0);
    settings.Layout = AlphaTab.LayoutSettings.get_Defaults();
    settings.Staves = new AlphaTab.StaveSettings("default");
    AlphaTab.Settings.SetDefaults(settings);
    return settings;
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
    return program <= 7 || (program >= 16 && program <= 23);
};
AlphaTab.Audio.GeneralMidi.IsGuitar = function (program){
    return (program >= 24 && program <= 39) || program == 105 || program == 43;
};
AlphaTab.Audio.Generator = AlphaTab.Audio.Generator || {};
AlphaTab.Audio.Generator.MidiFileGenerator = function (score, handler){
    this._score = null;
    this._handler = null;
    this._currentTempo = 0;
    this.TickLookup = null;
    this._score = score;
    this._currentTempo = this._score.Tempo;
    this._handler = handler;
    this.TickLookup = new AlphaTab.Audio.Model.MidiTickLookup();
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
                    var track = this._score.Tracks[i];
                    for (var k = 0,l = track.Staves.length; k < l; k++){
                        var staff = track.Staves[k];
                        if (index < staff.Bars.length){
                            this.GenerateBar(staff.Bars[index], currentTick);
                        }
                    }
                }
            }
            controller.MoveNext();
            previousMasterBar = bar;
        }
        for (var i = 0,j = this._score.Tracks.length; i < j; i++){
            this._handler.FinishTrack(this._score.Tracks[i].Index, controller.CurrentTick);
        }
        this.TickLookup.Finish();
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
        var masterBarLookup = new AlphaTab.Audio.Model.MasterBarTickLookup();
        masterBarLookup.MasterBar = masterBar;
        masterBarLookup.Start = currentTick;
        masterBarLookup.Tempo = this._currentTempo;
        masterBarLookup.End = masterBarLookup.Start + masterBar.CalculateDuration();
        this.TickLookup.AddMasterBar(masterBarLookup);
    },
    GenerateBar: function (bar, barStartTick){
        for (var i = 0,j = bar.Voices.length; i < j; i++){
            this.GenerateVoice(bar.Voices[i], barStartTick);
        }
    },
    GenerateVoice: function (voice, barStartTick){
        if (voice.IsEmpty && (!voice.Bar.get_IsEmpty() || voice.Index != 0))
            return;
        for (var i = 0,j = voice.Beats.length; i < j; i++){
            this.GenerateBeat(voice.Beats[i], barStartTick);
        }
    },
    GenerateBeat: function (beat, barStartTick){
        // TODO: take care of tripletfeel 
        var beatStart = beat.Start;
        var audioDuration = beat.Voice.Bar.get_IsEmpty() ? beat.Voice.Bar.get_MasterBar().CalculateDuration() : beat.CalculateDuration();
        var beatLookup = new AlphaTab.Audio.Model.BeatTickLookup();
        beatLookup.Start = barStartTick + beatStart;
        var realTickOffset = beat.NextBeat == null ? audioDuration : beat.NextBeat.get_AbsoluteStart() - beat.get_AbsoluteStart();
        beatLookup.End = barStartTick + beatStart + (realTickOffset > audioDuration ? realTickOffset : audioDuration);
        beatLookup.Beat = beat;
        this.TickLookup.AddBeat(beatLookup);
        var track = beat.Voice.Bar.Staff.Track;
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
                this.GenerateNote(n, barStartTick + beatStart, audioDuration, brushInfo);
            }
        }
        if (beat.Vibrato != AlphaTab.Model.VibratoType.None){
            var phaseLength = 240;
            // ticks
            var bendAmplitude = 3;
            this.GenerateVibratorWithParams(beat.Voice.Bar.Staff.Track, barStartTick + beatStart, beat.CalculateDuration(), phaseLength, bendAmplitude);
        }
    },
    GenerateNote: function (note, beatStart, beatDuration, brushInfo){
        var track = note.Beat.Voice.Bar.Staff.Track;
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
        if (!note.Beat.Voice.Bar.Staff.Track.IsPercussion && note.HammerPullOrigin != null){
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
        var track = note.Beat.Voice.Bar.Staff.Track;
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
        var track = note.Beat.Voice.Bar.Staff.Track;
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
        var track = note.Beat.Voice.Bar.Staff.Track;
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
        var track = note.Beat.Voice.Bar.Staff.Track;
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
        var track = note.Beat.Voice.Bar.Staff.Track;
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
        var brushInfo = new Int32Array(beat.Voice.Bar.Staff.Track.Tuning.length);
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
                for (var i = 0,j = beat.Voice.Bar.Staff.Track.Tuning.length; i < j; i++){
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
                this._handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel, (automation.Value));
                this._handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel, (automation.Value));
                break;
            case AlphaTab.Model.AutomationType.Balance:
                var balance = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(automation.Value | 0);
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel, 10, balance);
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel, 10, balance);
                break;
            case AlphaTab.Model.AutomationType.Volume:
                var volume = AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort(automation.Value | 0);
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel, 7, volume);
                this._handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove, beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel, 7, volume);
                break;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Audio.Generator.MidiFileGenerator.DefaultBend = 64;
    AlphaTab.Audio.Generator.MidiFileGenerator.DefaultBendSemitone = 2.75;
});
AlphaTab.Audio.Generator.MidiFileGenerator.GenerateMidiFile = function (score){
    var midiFile = new AlphaTab.Audio.Model.MidiFile();
    // create score tracks + metronometrack
    for (var i = 0,j = score.Tracks.length; i < j; i++){
        midiFile.CreateTrack();
    }
    midiFile.InfoTrack = 0;
    var handler = new AlphaTab.Audio.Generator.MidiFileHandler(midiFile);
    var generator = new AlphaTab.Audio.Generator.MidiFileGenerator(score, handler);
    generator.Generate();
    midiFile.TickLookup = generator.TickLookup;
    return midiFile;
};
AlphaTab.Audio.Generator.MidiFileGenerator.ToChannelShort = function (data){
    var value = Math.max(-32768, Math.min(32767, (data * 8) - 1));
    return (Math.max(value, -1)) + 1;
};
AlphaTab.Audio.Generator.MidiFileHandler = function (midiFile){
    this._midiFile = null;
    this._midiFile = midiFile;
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
    FinishTrack: function (track, tick){
        this.AddEvent(this._midiFile.InfoTrack, tick, AlphaTab.Audio.Generator.MidiFileHandler.BuildMetaMessage(47, new Uint8Array(0)));
    },
    AddBend: function (track, tick, channel, value){
        this.AddEvent(track, tick, new AlphaTab.Audio.Model.MidiMessage(new Uint8Array([this.MakeCommand(224, channel), 0, AlphaTab.Audio.Generator.MidiFileHandler.FixValue(value)])));
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
AlphaTab.Audio.MidiUtils.TicksToMillis = function (ticks, tempo){
    return ((ticks * (60000 / (tempo * 960)))) | 0;
};
AlphaTab.Audio.MidiUtils.ToTicks = function (duration){
    return AlphaTab.Audio.MidiUtils.ValueToTicks(duration);
};
AlphaTab.Audio.MidiUtils.ValueToTicks = function (duration){
    var denomninator = duration;
    if (denomninator < 0){
        denomninator = 1 / -denomninator;
    }
    return ((960 * (4 / denomninator))) | 0;
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
    this.TickLookup = null;
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
        // magic number "MThd" (0x4D546864)
        var b = new Uint8Array([77, 84, 104, 100]);
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
AlphaTab.Audio.Model.BeatTickLookup = function (){
    this.Start = 0;
    this.End = 0;
    this.Beat = null;
};
AlphaTab.Audio.Model.MasterBarTickLookup = function (){
    this.Start = 0;
    this.End = 0;
    this.Tempo = 0;
    this.MasterBar = null;
    this.Beats = null;
    //BeatsPerTrack = new FastDictionary<int, FastList<BeatTickLookup>>();
    this.Beats = [];
};
AlphaTab.Audio.Model.MasterBarTickLookup.prototype = {
    Finish: function (){
        this.Beats.sort($CreateAnonymousDelegate(this, function (a, b){
            return a.Start - b.Start;
        }));
        //foreach (var track in BeatsPerTrack)
        //{
        //    BeatsPerTrack[track].Sort((a, b) => a.Start - b.Start);
        //}
    },
    AddBeat: function (beat){
        //var track = beat.Beat.Voice.Bar.Staff.Track.Index;
        //if (!BeatsPerTrack.ContainsKey(track))
        //{
        //    BeatsPerTrack[track] = new FastList<BeatTickLookup>();
        //}
        //BeatsPerTrack[track].Add(beat);
        this.Beats.push(beat);
    }
};
AlphaTab.Audio.Model.MidiTickLookupFindBeatResult = function (){
    this.CurrentBeat = null;
    this.NextBeat = null;
    this.Duration = 0;
};
AlphaTab.Audio.Model.MidiTickLookup = function (){
    this._currentMasterBar = null;
    this.MasterBarLookup = null;
    this.MasterBars = null;
    this.MasterBars = [];
    this.MasterBarLookup = {};
};
AlphaTab.Audio.Model.MidiTickLookup.prototype = {
    Finish: function (){
        for (var i = 0; i < this.MasterBars.length; i++){
            this.MasterBars[i].Finish();
        }
    },
    FindBeat: function (tracks, tick){
        // get all beats within the masterbar
        var masterBar = this.FindMasterBar(tick);
        if (masterBar == null){
            return null;
        }
        var trackLookup = {};
        for (var $i15 = 0,$l15 = tracks.length,track = tracks[$i15]; $i15 < $l15; $i15++, track = tracks[$i15]){
            trackLookup[track.Index] = true;
        }
        var beat = null;
        var index = 0;
        var beats = masterBar.Beats;
        for (var b = 0; b < beats.length; b++){
            // is the current beat played on the given tick?
            var currentBeat = beats[b];
            // skip non relevant beats
            if (!trackLookup.hasOwnProperty(currentBeat.Beat.Voice.Bar.Staff.Track.Index)){
                continue;
            }
            if (currentBeat.Start <= tick && tick < currentBeat.End){
                // take the latest played beat we can find. (most right)
                if (beat == null || (beat.Start < currentBeat.Start)){
                    beat = beats[b];
                    index = b;
                }
            }
            else if (currentBeat.End > tick){
                break;
            }
        }
        if (beat == null){
            return null;
        }
        // search for next relevant beat in masterbar
        var nextBeat = null;
        for (var b = index + 1; b < beats.length; b++){
            var currentBeat = beats[b];
            if (trackLookup.hasOwnProperty(currentBeat.Beat.Voice.Bar.Staff.Track.Index)){
                nextBeat = currentBeat;
                break;
            }
        }
        // first relevant beat in next bar
        if (nextBeat == null && masterBar.MasterBar.NextMasterBar != null){
            var nextBar = this.GetMasterBar(masterBar.MasterBar.NextMasterBar);
            beats = nextBar.Beats;
            for (var b = 0; b < beats.length; b++){
                var currentBeat = beats[b];
                if (trackLookup.hasOwnProperty(currentBeat.Beat.Voice.Bar.Staff.Track.Index)){
                    nextBeat = currentBeat;
                    break;
                }
            }
        }
        var result = new AlphaTab.Audio.Model.MidiTickLookupFindBeatResult();
        result.CurrentBeat = beat.Beat;
        result.NextBeat = nextBeat == null ? null : nextBeat.Beat;
        result.Duration = AlphaTab.Audio.MidiUtils.TicksToMillis(beat.End - beat.Start, masterBar.Tempo);
        return result;
    },
    FindMasterBar: function (tick){
        var bars = this.MasterBars;
        var bottom = 0;
        var top = bars.length - 1;
        while (bottom <= top){
            var middle = ((top + bottom) / 2) | 0;
            var bar = bars[middle];
            // found?
            if (tick >= bar.Start && tick < bar.End){
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
    GetMasterBar: function (bar){
        if (!this.MasterBarLookup.hasOwnProperty(bar.Index)){
            return (function (){
                var $v1 = new AlphaTab.Audio.Model.MasterBarTickLookup();
                $v1.Start = 0;
                $v1.End = 0;
                $v1.Beats = [];
                $v1.MasterBar = bar;
                return $v1;
            }).call(this);
        }
        return this.MasterBarLookup[bar.Index];
    },
    GetMasterBarStart: function (bar){
        if (!this.MasterBarLookup.hasOwnProperty(bar.Index)){
            return 0;
        }
        return this.MasterBarLookup[bar.Index].Start;
    },
    AddMasterBar: function (masterBar){
        this.MasterBars.push(masterBar);
        this._currentMasterBar = masterBar;
        if (!this.MasterBarLookup.hasOwnProperty(masterBar.MasterBar.Index)){
            this.MasterBarLookup[masterBar.MasterBar.Index] = masterBar;
        }
    },
    AddBeat: function (beat){
        this._currentMasterBar.AddBeat(beat);
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
    this._builder = new String();
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
        return this._builder;
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
        this._builder+="\\tempo ";
        this._builder+=score.Tempo;
        this._builder+=""+'\r\n';
        if (track.Capo > 0){
            this._builder+="\\capo ";
            this._builder+=track.Capo;
            this._builder+=""+'\r\n';
        }
        this._builder+="\\tuning";
        for (var i = 0; i < track.Tuning.length; i++){
            this._builder+=" ";
            this._builder+=AlphaTab.Model.Tuning.GetTextForTuning(track.Tuning[i], true);
        }
        this._builder+="\\instrument ";
        this._builder+=track.PlaybackInfo.Program;
        this._builder+=""+'\r\n';
        this._builder+=".";
        this._builder+=""+'\r\n';
    },
    StringMetaData: function (key, value){
        if (!AlphaTab.Platform.Std.IsNullOrWhiteSpace(value)){
            this._builder+="\\";
            this._builder+=key;
            this._builder+=" \"";
            this._builder+=value.replace("\"","\\\"");
            this._builder+="\"";
            this._builder+=""+'\r\n';
        }
    },
    Bars: function (track){
        // alphatab only supports single staves, 
        for (var i = 0; i < 1; i++){
            for (var j = 0; j < track.Staves[i].Bars.length; j++){
                if (i > 0){
                    this._builder+=" |";
                    this._builder+=""+'\r\n';
                }
                this.Bar(track.Staves[i].Bars[j]);
            }
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
            this._builder+="r";
        }
        else {
            if (beat.Notes.length > 1){
                this._builder+="(";
            }
            for (var i = 0; i < beat.Notes.length; i++){
                this.Note(beat.Notes[i]);
            }
            if (beat.Notes.length > 1){
                this._builder+=")";
            }
        }
        this._builder+=".";
        this._builder+=beat.Duration;
        this._builder+=" ";
        this.BeatEffects(beat);
    },
    Note: function (note){
        if (note.IsDead){
            this._builder+="x";
        }
        else if (note.IsTieDestination){
            this._builder+="-";
        }
        else {
            this._builder+=note.Fret;
        }
        this._builder+=".";
        this._builder+=note.Beat.Voice.Bar.Staff.Track.Tuning.length - note.String + 1;
        this._builder+=" ";
        this.NoteEffects(note);
    },
    NoteEffects: function (note){
        var hasEffectOpen = false;
        if (note.get_HasBend()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="be (";
            for (var i = 0; i < note.BendPoints.length; i++){
                this._builder+=note.BendPoints[i].Offset;
                this._builder+=" ";
                this._builder+=note.BendPoints[i].Value;
                this._builder+=" ";
            }
            this._builder+=")";
        }
        switch (note.HarmonicType){
            case AlphaTab.Model.HarmonicType.Natural:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="nh ";
                break;
            case AlphaTab.Model.HarmonicType.Artificial:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="ah ";
                break;
            case AlphaTab.Model.HarmonicType.Tap:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="th ";
                break;
            case AlphaTab.Model.HarmonicType.Pinch:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="ph ";
                break;
            case AlphaTab.Model.HarmonicType.Semi:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="sh ";
                break;
        }
        if (note.get_IsTrill()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="tr ";
            this._builder+=note.get_TrillFret();
            this._builder+=" ";
            switch (note.TrillSpeed){
                case AlphaTab.Model.Duration.Sixteenth:
                    this._builder+="16 ";
                    break;
                case AlphaTab.Model.Duration.ThirtySecond:
                    this._builder+="32 ";
                    break;
                case AlphaTab.Model.Duration.SixtyFourth:
                    this._builder+="64 ";
                    break;
            }
        }
        if (note.Vibrato != AlphaTab.Model.VibratoType.None){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="v ";
        }
        if (note.SlideType == AlphaTab.Model.SlideType.Legato){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="sl ";
        }
        if (note.SlideType == AlphaTab.Model.SlideType.Shift){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="ss ";
        }
        if (note.IsHammerPullOrigin){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="h ";
        }
        if (note.IsGhost){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="g ";
        }
        if (note.Accentuated == AlphaTab.Model.AccentuationType.Normal){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="ac ";
        }
        else if (note.Accentuated == AlphaTab.Model.AccentuationType.Heavy){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="hac ";
        }
        if (note.IsPalmMute){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="pm ";
        }
        if (note.IsStaccato){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="st ";
        }
        if (note.IsLetRing){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="lr ";
        }
        switch (note.LeftHandFinger){
            case AlphaTab.Model.Fingers.Thumb:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="1 ";
                break;
            case AlphaTab.Model.Fingers.IndexFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="2 ";
                break;
            case AlphaTab.Model.Fingers.MiddleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="3 ";
                break;
            case AlphaTab.Model.Fingers.AnnularFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="4 ";
                break;
            case AlphaTab.Model.Fingers.LittleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="5 ";
                break;
        }
        switch (note.RightHandFinger){
            case AlphaTab.Model.Fingers.Thumb:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="1 ";
                break;
            case AlphaTab.Model.Fingers.IndexFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="2 ";
                break;
            case AlphaTab.Model.Fingers.MiddleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="3 ";
                break;
            case AlphaTab.Model.Fingers.AnnularFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="4 ";
                break;
            case AlphaTab.Model.Fingers.LittleFinger:
                hasEffectOpen = this.EffectOpen(hasEffectOpen);
                this._builder+="5 ";
                break;
        }
        this.EffectClose(hasEffectOpen);
    },
    EffectOpen: function (hasBeatEffectOpen){
        if (!hasBeatEffectOpen){
            this._builder+="{";
        }
        return true;
    },
    EffectClose: function (hasBeatEffectOpen){
        if (hasBeatEffectOpen){
            this._builder+="}";
        }
    },
    BeatEffects: function (beat){
        var hasEffectOpen = false;
        if (beat.FadeIn){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="f ";
        }
        switch (beat.GraceType){
            case AlphaTab.Model.GraceType.OnBeat:
                this._builder+="gr ob ";
                break;
            case AlphaTab.Model.GraceType.BeforeBeat:
                this._builder+="gr ";
                break;
        }
        if (beat.Vibrato != AlphaTab.Model.VibratoType.None){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="v ";
        }
        if (beat.Slap){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="s ";
        }
        if (beat.Pop){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="p ";
        }
        if (beat.Dots == 2){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="dd ";
        }
        else if (beat.Dots == 1){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="d ";
        }
        if (beat.PickStroke == AlphaTab.Model.PickStrokeType.Up){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="su ";
        }
        else if (beat.PickStroke == AlphaTab.Model.PickStrokeType.Down){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="sd ";
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
                this._builder+="tu ";
                this._builder+=tupletValue;
                this._builder+=" ";
            }
        }
        if (beat.get_HasWhammyBar()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="tbe (";
            for (var i = 0; i < beat.WhammyBarPoints.length; i++){
                this._builder+=beat.WhammyBarPoints[i].Offset;
                this._builder+=" ";
                this._builder+=beat.WhammyBarPoints[i].Value;
                this._builder+=" ";
            }
            this._builder+=")";
        }
        if (beat.get_IsTremolo()){
            hasEffectOpen = this.EffectOpen(hasEffectOpen);
            this._builder+="tp ";
            if (beat.TremoloSpeed == AlphaTab.Model.Duration.Eighth){
                this._builder+="8 ";
            }
            else if (beat.TremoloSpeed == AlphaTab.Model.Duration.Sixteenth){
                this._builder+="16 ";
            }
            else if (beat.TremoloSpeed == AlphaTab.Model.Duration.ThirtySecond){
                this._builder+="32 ";
            }
            else {
                this._builder+="8 ";
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
                this._builder+="\\ts ";
                this._builder+=masterBar.TimeSignatureNumerator;
                this._builder+=" ";
                this._builder+=masterBar.TimeSignatureDenominator;
                this._builder+=""+'\r\n';
            }
            if (previousMasterBar.KeySignature != masterBar.KeySignature){
                this._builder+="\\ks ";
                switch (masterBar.KeySignature){
                    case -7:
                        this._builder+="cb";
                        break;
                    case -6:
                        this._builder+="gb";
                        break;
                    case -5:
                        this._builder+="db";
                        break;
                    case -4:
                        this._builder+="ab";
                        break;
                    case -3:
                        this._builder+="eb";
                        break;
                    case -2:
                        this._builder+="bb";
                        break;
                    case -1:
                        this._builder+="f";
                        break;
                    case 0:
                        this._builder+="c";
                        break;
                    case 1:
                        this._builder+="g";
                        break;
                    case 2:
                        this._builder+="d";
                        break;
                    case 3:
                        this._builder+="a";
                        break;
                    case 4:
                        this._builder+="e";
                        break;
                    case 5:
                        this._builder+="b";
                        break;
                    case 6:
                        this._builder+="f#";
                        break;
                    case 7:
                        this._builder+="c#";
                        break;
                }
                this._builder+=""+'\r\n';
            }
            if (bar.Clef != previousBar.Clef){
                this._builder+="\\clef ";
                switch (bar.Clef){
                    case AlphaTab.Model.Clef.Neutral:
                        this._builder+="n";
                        break;
                    case AlphaTab.Model.Clef.C3:
                        this._builder+="c3";
                        break;
                    case AlphaTab.Model.Clef.C4:
                        this._builder+="c4";
                        break;
                    case AlphaTab.Model.Clef.F4:
                        this._builder+="f4";
                        break;
                    case AlphaTab.Model.Clef.G2:
                        this._builder+="g2";
                        break;
                }
                this._builder+=""+'\r\n';
            }
            if (masterBar.TempoAutomation != null){
                this._builder+="\\tempo ";
                this._builder+=masterBar.TempoAutomation.Value;
                this._builder+=""+'\r\n';
            }
        }
        if (masterBar.IsRepeatStart){
            this._builder+="\\ro ";
            this._builder+=""+'\r\n';
        }
        if (masterBar.get_IsRepeatEnd()){
            this._builder+="\\rc ";
            this._builder+=masterBar.RepeatCount + 1;
            this._builder+=""+'\r\n';
        }
    }
};
AlphaTab.Importer.AlphaTexException = function (position, nonTerm, expected, symbol, symbolData){
    this.Position = 0;
    this.NonTerm = null;
    this.Expected = AlphaTab.Importer.AlphaTexSymbols.No;
    this.Symbol = AlphaTab.Importer.AlphaTexSymbols.No;
    this.SymbolData = null;
    AlphaTab.AlphaTabException.call(this, "");
    this.Position = position;
    this.NonTerm = nonTerm;
    this.Expected = expected;
    this.Symbol = symbol;
    this.SymbolData = symbolData;
    if (this.SymbolData == null){
        this.Description = "MalFormed AlphaTex: @" + this.Position + ": Error on block " + this.NonTerm + ", expected a " + this.Expected + " found a " + this.Symbol;
    }
    else {
        this.Description = "MalFormed AlphaTex: @" + this.Position + ": Error on block " + this.NonTerm + ", invalid value: " + this.SymbolData;
    }
};
$Inherit(AlphaTab.Importer.AlphaTexException, AlphaTab.AlphaTabException);
AlphaTab.Importer.ScoreImporter = function (){
    this.Data = null;
};
AlphaTab.Importer.ScoreImporter.prototype = {
    Init: function (data){
        this.Data = data;
    }
};
AlphaTab.Importer.ScoreImporter.BuildImporters = function (){
    return [new AlphaTab.Importer.Gp3To5Importer(), new AlphaTab.Importer.GpxImporter(), new AlphaTab.Importer.AlphaTexImporter(), new AlphaTab.Importer.MusicXmlImporter()];
};
AlphaTab.Importer.AlphaTexImporter = function (){
    this._score = null;
    this._track = null;
    this._ch = 0;
    this._curChPos = 0;
    this._sy = AlphaTab.Importer.AlphaTexSymbols.No;
    this._syData = null;
    this._allowNegatives = false;
    this._currentDuration = AlphaTab.Model.Duration.QuadrupleWhole;
    this._lyrics = null;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.AlphaTexImporter.prototype = {
    get_Name: function (){
        return "AlphaTex";
    },
    ReadScore: function (){
        try{
            this.CreateDefaultScore();
            this._curChPos = 0;
            this._currentDuration = AlphaTab.Model.Duration.Quarter;
            this._lyrics = [];
            this.NextChar();
            this.NewSy();
            this.Score();
            this._score.Finish();
            this._track.ApplyLyrics(this._lyrics);
            return this._score;
        }
        catch(e){
            if ((e.exception instanceof AlphaTab.Importer.AlphaTexException)){
                throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException((e).Description), new Error());
            }
            throw $CreateException(e, new Error());
        }
    },
    Error: function (nonterm, expected, symbolError){
        var e;
        if (symbolError){
            e = new AlphaTab.Importer.AlphaTexException(this._curChPos, nonterm, expected, this._sy, null);
        }
        else {
            e = new AlphaTab.Importer.AlphaTexException(this._curChPos, nonterm, expected, expected, (this._syData));
        }
        AlphaTab.Util.Logger.Error(this.get_Name(), e.Description, null);
        throw $CreateException(e, new Error());
    },
    CreateDefaultScore: function (){
        this._score = new AlphaTab.Model.Score();
        this._score.Tempo = 120;
        this._score.TempoLabel = "";
        this._track = new AlphaTab.Model.Track(1);
        this._track.PlaybackInfo.Program = 25;
        this._track.PlaybackInfo.PrimaryChannel = AlphaTab.Importer.AlphaTexImporter.TrackChannels[0];
        this._track.PlaybackInfo.SecondaryChannel = AlphaTab.Importer.AlphaTexImporter.TrackChannels[1];
        this._track.Tuning = AlphaTab.Model.Tuning.GetDefaultTuningFor(6).Tunings;
        this._score.AddTrack(this._track);
    },
    ParseClefFromString: function (str){
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
    ParseClefFromInt: function (i){
        switch (i){
            case 43:
                return AlphaTab.Model.Clef.G2;
            case 65:
                return AlphaTab.Model.Clef.F4;
            case 48:
                return AlphaTab.Model.Clef.C3;
            case 60:
                return AlphaTab.Model.Clef.C4;
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
    NextChar: function (){
        var b = this.Data.ReadByte();
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
                var startChar = this._ch;
                this.NextChar();
                var s = new String();
                this._sy = AlphaTab.Importer.AlphaTexSymbols.String;
                while (this._ch != startChar && this._ch != 0){
                    s+=String.fromCharCode(this._ch);
                    this.NextChar();
                }
                (this._syData) = s;
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
                var tuning = AlphaTab.Model.TuningParser.Parse(name);
                if (tuning != null){
                    this._sy = AlphaTab.Importer.AlphaTexSymbols.Tuning;
                    (this._syData) = tuning;
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
        var str = new String();
        do{
            str+=String.fromCharCode(this._ch);
            this.NextChar();
        }
        while (AlphaTab.Importer.AlphaTexImporter.IsLetter(this._ch) || this.IsDigit(this._ch) || this._ch == 35)
        return str;
    },
    ReadNumber: function (){
        var str = new String();
        do{
            str+=String.fromCharCode(this._ch);
            this.NextChar();
        }
        while (this.IsDigit(this._ch))
        return AlphaTab.Platform.Std.ParseInt(str);
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
                switch (this._sy){
                    case AlphaTab.Importer.AlphaTexSymbols.String:
                        var text = (this._syData).toString().toLowerCase();
                        if (text == "piano" || text == "none" || text == "voice"){
                        // clear tuning
                        this._track.Tuning = new Int32Array(0);
                    }
                        else {
                        this.Error("tuning", AlphaTab.Importer.AlphaTexSymbols.Tuning, true);
                    }
                        this.NewSy();
                        break;
                    case AlphaTab.Importer.AlphaTexSymbols.Tuning:
                        var tuning = [];
                        do{
                        var t = (this._syData);
                        tuning.push(t.get_RealValue());
                        this.NewSy();
                    }
                        while (this._sy == AlphaTab.Importer.AlphaTexSymbols.Tuning)
                        this._track.Tuning = tuning.slice(0);
                        break;
                    default:
                        this.Error("tuning", AlphaTab.Importer.AlphaTexSymbols.Tuning, true);
                        break;
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
            else if (syData == "lyrics"){
                this.NewSy();
                var lyrics = new AlphaTab.Model.Lyrics();
                lyrics.StartBar = 0;
                lyrics.Text = "";
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.Number){
                    lyrics.StartBar = (this._syData);
                    this.NewSy();
                }
                if (this._sy == AlphaTab.Importer.AlphaTexSymbols.String){
                    lyrics.Text = (this._syData);
                    this.NewSy();
                }
                else {
                    this.Error("lyrics", AlphaTab.Importer.AlphaTexSymbols.String, true);
                }
                this._lyrics.push(lyrics);
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
        this._track.AddBarToStaff(0, bar);
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
            this._allowNegatives = true;
            this.NewSy();
            this._allowNegatives = false;
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            this._currentDuration = this.ParseDuration((this._syData));
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
            this._allowNegatives = true;
            this.NewSy();
            this._allowNegatives = false;
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("duration", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            this._currentDuration = this.ParseDuration((this._syData));
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
                beat.AddWhammyBarPoint(new AlphaTab.Model.BendPoint(offset, value));
                this.NewSy();
            }
            while (beat.WhammyBarPoints.length > 60){
                beat.RemoveWhammyBarPoint(beat.WhammyBarPoints.length - 1);
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
        var isDead = (this._syData) == "x";
        var isTie = (this._syData) == "-";
        var fret = -1;
        var octave = -1;
        var tone = -1;
        switch (this._sy){
            case AlphaTab.Importer.AlphaTexSymbols.Number:
                fret = (this._syData);
                break;
            case AlphaTab.Importer.AlphaTexSymbols.String:
                if (isTie || isDead){
                fret = 0;
            }
                else {
                this.Error("note-fret", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
                break;
            case AlphaTab.Importer.AlphaTexSymbols.Tuning:
                var tuning = (this._syData);
                octave = tuning.Octave;
                tone = tuning.NoteValue;
                break;
            default:
                this.Error("note-fret", AlphaTab.Importer.AlphaTexSymbols.Number, true);
                break;
        }
        this.NewSy();
        // Fret done
        var isFretted = octave == -1 && this._track.Tuning.length > 0;
        var string = -1;
        if (isFretted){
            // Fret [Dot] String
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Dot){
                this.Error("note", AlphaTab.Importer.AlphaTexSymbols.Dot, true);
            }
            this.NewSy();
            // dot done
            if (this._sy != AlphaTab.Importer.AlphaTexSymbols.Number){
                this.Error("note-string", AlphaTab.Importer.AlphaTexSymbols.Number, true);
            }
            string = (this._syData);
            if (string < 1 || string > this._track.Tuning.length){
                this.Error("note-string", AlphaTab.Importer.AlphaTexSymbols.Number, false);
            }
            this.NewSy();
            // string done
        }
        // read effects
        var note = new AlphaTab.Model.Note();
        beat.AddNote(note);
        if (isFretted){
            note.String = this._track.Tuning.length - (string - 1);
            note.IsDead = isDead;
            note.IsTieDestination = isTie;
            if (!isTie){
                note.Fret = fret;
            }
        }
        else {
            note.Octave = octave;
            note.Tone = tone;
            note.IsTieDestination = isTie;
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
            case -4:
                return AlphaTab.Model.Duration.QuadrupleWhole;
            case -2:
                return AlphaTab.Model.Duration.DoubleWhole;
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
            case 128:
                return AlphaTab.Model.Duration.OneHundredTwentyEighth;
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
                switch (this._sy){
                    case AlphaTab.Importer.AlphaTexSymbols.String:
                        bar.Clef = this.ParseClefFromString((this._syData).toString().toLowerCase());
                        break;
                    case AlphaTab.Importer.AlphaTexSymbols.Number:
                        bar.Clef = this.ParseClefFromInt((this._syData));
                        break;
                    case AlphaTab.Importer.AlphaTexSymbols.Tuning:
                        bar.Clef = this.ParseClefFromInt((this._syData).get_RealValue());
                        break;
                    default:
                        this.Error("clef", AlphaTab.Importer.AlphaTexSymbols.String, true);
                        break;
                }
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
    this._lyricsTrack = 0;
    this._lyrics = null;
    this._barCount = 0;
    this._trackCount = 0;
    this._playbackInfos = null;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.Gp3To5Importer.prototype = {
    get_Name: function (){
        return "Guitar Pro 3-5";
    },
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
            this.Data.Skip(19);
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
            this.Data.ReadByte();
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
            this.Data.Skip(38);
            // unknown (4)
            this.Data.Skip(4);
        }
        // contents
        this._barCount = this.ReadInt32();
        this._trackCount = this.ReadInt32();
        this.ReadMasterBars();
        this.ReadTracks();
        this.ReadBars();
        this._score.Finish();
        if (this._lyrics != null && this._lyricsTrack >= 0){
            this._score.Tracks[this._lyricsTrack].ApplyLyrics(this._lyrics);
        }
        return this._score;
    },
    ReadVersion: function (){
        var version = this.ReadStringByteLength(30);
        if (!version.indexOf("FICHIER GUITAR PRO ")==0){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
        }
        version = version.substr("FICHIER GUITAR PRO ".length + 1);
        var dot = version.indexOf(".");
        this._versionNumber = (100 * AlphaTab.Platform.Std.ParseInt(version.substr(0, dot))) + AlphaTab.Platform.Std.ParseInt(version.substr(dot + 1));
        AlphaTab.Util.Logger.Info(this.get_Name(), "Guitar Pro version " + version + " detected", null);
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
        var notice = new String();
        for (var i = 0; i < noticeLines; i++){
            if (i > 0)
                notice+=""+'\r\n';
            notice+=this.ReadStringIntUnused();
        }
        this._score.Notices = notice;
    },
    ReadLyrics: function (){
        this._lyrics = [];
        this._lyricsTrack = this.ReadInt32() - 1;
        for (var i = 0; i < 5; i++){
            var lyrics = new AlphaTab.Model.Lyrics();
            lyrics.StartBar = this.ReadInt32() - 1;
            lyrics.Text = this.ReadStringInt();
            this._lyrics.push(lyrics);
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
        this.Data.Skip(30);
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
            info.Volume = this.Data.ReadByte();
            info.Balance = this.Data.ReadByte();
            this.Data.Skip(6);
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
        var flags = this.Data.ReadByte();
        // time signature
        if ((flags & 1) != 0){
            newMasterBar.TimeSignatureNumerator = this.Data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.TimeSignatureNumerator = previousMasterBar.TimeSignatureNumerator;
        }
        if ((flags & 2) != 0){
            newMasterBar.TimeSignatureDenominator = this.Data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.TimeSignatureDenominator = previousMasterBar.TimeSignatureDenominator;
        }
        // repeatings
        newMasterBar.IsRepeatStart = (flags & 4) != 0;
        if ((flags & 8) != 0){
            newMasterBar.RepeatCount = this.Data.ReadByte() + (this._versionNumber >= 500 ? 0 : 1);
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
                var repeatMask = this.Data.ReadByte();
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
                newMasterBar.AlternateEndings = this.Data.ReadByte();
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
            newMasterBar.KeySignature = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newMasterBar.KeySignatureType = this.Data.ReadByte();
        }
        else if (previousMasterBar != null){
            newMasterBar.KeySignature = previousMasterBar.KeySignature;
            newMasterBar.KeySignatureType = previousMasterBar.KeySignatureType;
        }
        if ((this._versionNumber >= 500) && ((flags & 3) != 0)){
            this.Data.Skip(4);
        }
        // better alternate ending mask in GP5
        if ((this._versionNumber >= 500) && ((flags & 16) == 0)){
            newMasterBar.AlternateEndings = this.Data.ReadByte();
        }
        // tripletfeel
        if (this._versionNumber >= 500){
            var tripletFeel = this.Data.ReadByte();
            switch (tripletFeel){
                case 1:
                    newMasterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet8th;
                    break;
                case 2:
                    newMasterBar.TripletFeel = AlphaTab.Model.TripletFeel.Triplet16th;
                    break;
            }
            this.Data.ReadByte();
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
        var newTrack = new AlphaTab.Model.Track(1);
        this._score.AddTrack(newTrack);
        var flags = this.Data.ReadByte();
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
        this.Data.Skip(4);
        // Fretcount
        if (index >= 0 && index < this._playbackInfos.length){
            var info = this._playbackInfos[index];
            info.Port = port;
            info.IsSolo = (flags & 16) != 0;
            info.IsMute = (flags & 32) != 0;
            info.SecondaryChannel = effectChannel;
            if (AlphaTab.Audio.GeneralMidi.IsGuitar(info.Program)){
                newTrack.DisplayTranspositionPitch = -12;
            }
            newTrack.PlaybackInfo = info;
        }
        newTrack.Capo = this.ReadInt32();
        newTrack.Color = this.ReadColor();
        if (this._versionNumber >= 500){
            // flags for 
            //  0x01 -> show tablature
            //  0x02 -> show standard notation
            this.Data.ReadByte();
            // flags for
            //  0x02 -> auto let ring
            //  0x04 -> auto brush
            this.Data.ReadByte();
            // unknown
            this.Data.Skip(43);
        }
        // unknown
        if (this._versionNumber >= 510){
            this.Data.Skip(4);
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
        track.AddBarToStaff(0, newBar);
        var voiceCount = 1;
        if (this._versionNumber >= 500){
            this.Data.ReadByte();
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
        var flags = this.Data.ReadByte();
        if ((flags & 1) != 0){
            newBeat.Dots = 1;
        }
        if ((flags & 64) != 0){
            var type = this.Data.ReadByte();
            newBeat.IsEmpty = (type & 2) == 0;
        }
        voice.AddBeat(newBeat);
        var duration = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
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
        var stringFlags = this.Data.ReadByte();
        for (var i = 6; i >= 0; i--){
            if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.Tuning.length){
                this.ReadNote(track, bar, voice, newBeat, (6 - i));
            }
        }
        if (this._versionNumber >= 500){
            this.Data.ReadByte();
            var flag = this.Data.ReadByte();
            if ((flag & 8) != 0){
                this.Data.ReadByte();
            }
        }
    },
    ReadChord: function (beat){
        var chord = new AlphaTab.Model.Chord();
        var chordId = AlphaTab.Platform.Std.NewGuid();
        if (this._versionNumber >= 500){
            this.Data.Skip(17);
            chord.Name = this.ReadStringByteLength(21);
            this.Data.Skip(4);
            chord.FirstFret = this.ReadInt32();
            for (var i = 0; i < 7; i++){
                var fret = this.ReadInt32();
                if (i < beat.Voice.Bar.Staff.Track.Tuning.length){
                    chord.Strings.push(fret);
                }
            }
            var numberOfBarres = this.Data.ReadByte();
            var barreFrets = new Uint8Array(5);
            this.Data.Read(barreFrets, 0, barreFrets.length);
            for (var i = 0; i < numberOfBarres; i++){
                chord.BarreFrets.push(barreFrets[i]);
            }
            this.Data.Skip(26);
        }
        else {
            if (this.Data.ReadByte() != 0){
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
                    this.Data.Skip(16);
                    chord.Name = (this.ReadStringByteLength(21));
                    // Unused (2)
                    // Fifth (1)
                    // Ninth (1)
                    // Eleventh (1)
                    this.Data.Skip(4);
                    chord.FirstFret = (this.ReadInt32());
                    for (var i = 0; i < 7; i++){
                        var fret = this.ReadInt32();
                        if (i < beat.Voice.Bar.Staff.Track.Tuning.length){
                            chord.Strings.push(fret);
                        }
                    }
                    var numberOfBarres = this.Data.ReadByte();
                    var barreFrets = new Uint8Array(5);
                    this.Data.Read(barreFrets, 0, barreFrets.length);
                    for (var i = 0; i < numberOfBarres; i++){
                        chord.BarreFrets.push(barreFrets[i]);
                    }
                    // Barree end (5)
                    // Omission1,3,5,7,9,11,13 (7)
                    // Unused (1)
                    // Fingering (7)
                    // Show Diagram Fingering (1)
                    // ??
                    this.Data.Skip(26);
                }
                else {
                    // unknown
                    this.Data.Skip(25);
                    chord.Name = this.ReadStringByteLength(34);
                    chord.FirstFret = this.ReadInt32();
                    for (var i = 0; i < 6; i++){
                        var fret = this.ReadInt32();
                        if (i < beat.Voice.Bar.Staff.Track.Tuning.length){
                            chord.Strings.push(fret);
                        }
                    }
                    // unknown
                    this.Data.Skip(36);
                }
            }
            else {
                var strings = this._versionNumber >= 406 ? 7 : 6;
                chord.Name = this.ReadStringIntByte();
                chord.FirstFret = this.ReadInt32();
                if (chord.FirstFret > 0){
                    for (var i = 0; i < strings; i++){
                        var fret = this.ReadInt32();
                        if (i < beat.Voice.Bar.Staff.Track.Tuning.length){
                            chord.Strings.push(fret);
                        }
                    }
                }
            }
        }
        if (!((chord.Name==null)||(chord.Name.length==0))){
            beat.ChordId = chordId;
            beat.Voice.Bar.Staff.Track.Chords[beat.ChordId] = chord;
        }
    },
    ReadBeatEffects: function (beat){
        var flags = this.Data.ReadByte();
        var flags2 = 0;
        if (this._versionNumber >= 400){
            flags2 = this.Data.ReadByte();
        }
        beat.FadeIn = (flags & 16) != 0;
        if ((this._versionNumber < 400 && (flags & 1) != 0) || (flags & 2) != 0){
            beat.Vibrato = AlphaTab.Model.VibratoType.Slight;
        }
        beat.HasRasgueado = (flags2 & 1) != 0;
        if ((flags & 32) != 0 && this._versionNumber >= 400){
            var slapPop = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
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
            var slapPop = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
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
            this.Data.Skip(4);
        }
        if ((flags2 & 4) != 0){
            this.ReadTremoloBarEffect(beat);
        }
        if ((flags & 64) != 0){
            var strokeUp;
            var strokeDown;
            if (this._versionNumber < 500){
                strokeDown = this.Data.ReadByte();
                strokeUp = this.Data.ReadByte();
            }
            else {
                strokeUp = this.Data.ReadByte();
                strokeDown = this.Data.ReadByte();
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
            switch (AlphaTab.Platform.Std.ReadSignedByte(this.Data)){
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
        this.Data.ReadByte();
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
                beat.AddWhammyBarPoint(point);
            }
        }
    },
    ReadMixTableChange: function (beat){
        var tableChange = new AlphaTab.Importer.MixTableChange();
        tableChange.Instrument = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        if (this._versionNumber >= 500){
            this.Data.Skip(16);
            // Rse Info 
        }
        tableChange.Volume = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        tableChange.Balance = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var chorus = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var reverb = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var phaser = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        var tremolo = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        if (this._versionNumber >= 500){
            tableChange.TempoName = this.ReadStringIntByte();
        }
        tableChange.Tempo = this.ReadInt32();
        // durations
        if (tableChange.Volume >= 0){
            this.Data.ReadByte();
        }
        if (tableChange.Balance >= 0){
            this.Data.ReadByte();
        }
        if (chorus >= 0){
            this.Data.ReadByte();
        }
        if (reverb >= 0){
            this.Data.ReadByte();
        }
        if (phaser >= 0){
            this.Data.ReadByte();
        }
        if (tremolo >= 0){
            this.Data.ReadByte();
        }
        if (tableChange.Tempo >= 0){
            tableChange.Duration = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            if (this._versionNumber >= 510){
                this.Data.ReadByte();
                // hideTempo (bool)
            }
        }
        if (this._versionNumber >= 400){
            this.Data.ReadByte();
            // all tracks flag
        }
        // unknown
        if (this._versionNumber >= 500){
            this.Data.ReadByte();
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
        var flags = this.Data.ReadByte();
        if ((flags & 2) != 0){
            newNote.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
        }
        else if ((flags & 64) != 0){
            newNote.Accentuated = AlphaTab.Model.AccentuationType.Normal;
        }
        newNote.IsGhost = ((flags & 4) != 0);
        if ((flags & 32) != 0){
            var noteType = this.Data.ReadByte();
            if (noteType == 3){
                newNote.IsDead = true;
            }
            else if (noteType == 2){
                newNote.IsTieDestination = true;
            }
        }
        if ((flags & 1) != 0 && this._versionNumber < 500){
            this.Data.ReadByte();
            // duration 
            this.Data.ReadByte();
            // tuplet
        }
        if ((flags & 16) != 0){
            var dynamicNumber = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newNote.Dynamic = this.ToDynamicValue(dynamicNumber);
            beat.Dynamic = newNote.Dynamic;
        }
        if ((flags & 32) != 0){
            newNote.Fret = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        }
        if ((flags & 128) != 0){
            newNote.LeftHandFinger = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newNote.RightHandFinger = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
            newNote.IsFingering = true;
        }
        if (this._versionNumber >= 500){
            if ((flags & 1) != 0){
                newNote.DurationPercent = this.ReadDouble();
            }
            var flags2 = this.Data.ReadByte();
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
        var flags = this.Data.ReadByte();
        var flags2 = 0;
        if (this._versionNumber >= 400){
            flags2 = this.Data.ReadByte();
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
        this.Data.ReadByte();
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
        graceNote.Fret = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
        graceBeat.Duration = AlphaTab.Model.Duration.ThirtySecond;
        graceBeat.Dynamic = this.ToDynamicValue(AlphaTab.Platform.Std.ReadSignedByte(this.Data));
        var transition = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
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
        this.Data.Skip(1);
        // duration
        if (this._versionNumber < 500){
            graceBeat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
        }
        else {
            var flags = this.Data.ReadByte();
            graceNote.IsDead = (flags & 1) != 0;
            graceBeat.GraceType = (flags & 2) != 0 ? AlphaTab.Model.GraceType.OnBeat : AlphaTab.Model.GraceType.BeforeBeat;
        }
        graceBeat.AddNote(graceNote);
        voice.AddGraceBeat(graceBeat);
    },
    ReadTremoloPicking: function (beat){
        var speed = this.Data.ReadByte();
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
            var type = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
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
            var type = AlphaTab.Platform.Std.ReadSignedByte(this.Data);
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
        var type = this.Data.ReadByte();
        if (this._versionNumber >= 500){
            switch (type){
                case 1:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Natural;
                    note.HarmonicValue = this.DeltaFretToHarmonicValue(note.Fret);
                    break;
                case 2:
                    var harmonicTone = this.Data.ReadByte();
                    var harmonicKey = this.Data.ReadByte();
                    var harmonicOctaveOffset = this.Data.ReadByte();
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Artificial;
                    break;
                case 3:
                    note.HarmonicType = AlphaTab.Model.HarmonicType.Tap;
                    note.HarmonicValue = this.DeltaFretToHarmonicValue(this.Data.ReadByte());
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
        note.TrillValue = this.Data.ReadByte() + note.get_StringTuning();
        switch (this.Data.ReadByte()){
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
        this.Data.Read(bytes, 0, bytes.length);
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
        var r = this.Data.ReadByte();
        var g = this.Data.ReadByte();
        var b = this.Data.ReadByte();
        this.Data.Skip(1);
        // alpha?
        return new AlphaTab.Platform.Model.Color(r, g, b, 255);
    },
    ReadBool: function (){
        return this.Data.ReadByte() != 0;
    },
    ReadInt32: function (){
        var bytes = new Uint8Array(4);
        this.Data.Read(bytes, 0, 4);
        return bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
    },
    ReadStringIntUnused: function (){
        this.Data.Skip(4);
        return this.ReadString(this.Data.ReadByte());
    },
    ReadStringInt: function (){
        return this.ReadString(this.ReadInt32());
    },
    ReadStringIntByte: function (){
        var length = this.ReadInt32() - 1;
        this.Data.ReadByte();
        return this.ReadString(length);
    },
    ReadString: function (length){
        var b = new Uint8Array(length);
        this.Data.Read(b, 0, b.length);
        return AlphaTab.Platform.Std.ToString(b);
    },
    ReadStringByteLength: function (length){
        var stringLength = this.Data.ReadByte();
        var s = this.ReadString(stringLength);
        if (stringLength < length){
            this.Data.Skip(length - stringLength);
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
        catch($$e4){
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
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
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
        var buf = new String();
        for (var i = 0; i < length; i++){
            var code = data[offset + i] & 255;
            if (code == 0)
                break;
            // zero terminated string
            buf+=String.fromCharCode(code);
        }
        return buf;
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
    get_Name: function (){
        return "Guitar Pro 6";
    },
    ReadScore: function (){
        // at first we need to load the binary file system 
        // from the GPX container
        AlphaTab.Util.Logger.Info(this.get_Name(), "Loading GPX filesystem", null);
        var fileSystem = new AlphaTab.Importer.GpxFileSystem();
        fileSystem.FileFilter = $CreateAnonymousDelegate(this, function (s){
            return s == "score.gpif";
        });
        fileSystem.Load(this.Data);
        AlphaTab.Util.Logger.Info(this.get_Name(), "GPX filesystem loaded", null);
        // convert data to string
        var data = fileSystem.Files[0].Data;
        var xml = AlphaTab.Platform.Std.ToString(data);
        // lets set the fileSystem to null, maybe the garbage collector will come along
        // and kick the fileSystem binary data before we finish parsing
        fileSystem.Files = null;
        fileSystem = null;
        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        AlphaTab.Util.Logger.Info(this.get_Name(), "Start Parsing score.gpif", null);
        var parser = new AlphaTab.Importer.GpxParser();
        parser.ParseXml(xml);
        AlphaTab.Util.Logger.Info(this.get_Name(), "score.gpif parsed", null);
        return parser.Score;
    }
};
$Inherit(AlphaTab.Importer.GpxImporter, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.GpxRhythm = function (){
    this.Dots = 0;
    this.TupletDenominator = 0;
    this.TupletNumerator = 0;
    this.Value = AlphaTab.Model.Duration.QuadrupleWhole;
    this.TupletDenominator = -1;
    this.TupletNumerator = -1;
    this.Value = AlphaTab.Model.Duration.Quarter;
};
AlphaTab.Importer.GpxParser = function (){
    this._masterTrackAutomations = null;
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
    this._lyricsByTrack = null;
    this.Score = null;
};
AlphaTab.Importer.GpxParser.prototype = {
    ParseXml: function (xml){
        this._masterTrackAutomations = {};
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
        this._lyricsByTrack = {};
        var dom;
        try{
            dom = new AlphaTab.Xml.XmlDocument(xml);
        }
        catch($$e5){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
        }
        this.ParseDom(dom);
        this.BuildModel();
        this.Score.Finish();
        if (Object.keys(this._lyricsByTrack).length > 0){
            for (var trackId in this._lyricsByTrack){
                var track = this._tracksById[trackId];
                track.ApplyLyrics(this._lyricsByTrack[trackId]);
            }
        }
    },
    ParseDom: function (dom){
        var root = dom.DocumentElement;
        if (root == null)
            return;
        // the XML uses IDs for referring elements within the 
        // model. Therefore we do the parsing in 2 steps:
        // - at first we read all model elements and store them by ID in a lookup table
        // - after that we need to join up the information. 
        if (root.LocalName == "GPIF"){
            this.Score = new AlphaTab.Model.Score();
            // parse all children
            for (var $i16 = 0,$t16 = root.ChildNodes,$l16 = $t16.length,n = $t16[$i16]; $i16 < $l16; $i16++, n = $t16[$i16]){
                if (n.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                    switch (n.LocalName){
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
            }
        }
        else {
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
        }
    },
    ParseScoreNode: function (element){
        for (var $i17 = 0,$t17 = element.ChildNodes,$l17 = $t17.length,c = $t17[$i17]; $i17 < $l17; $i17++, c = $t17[$i17]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Title":
                        this.Score.Title = c.FirstChild.get_InnerText();
                        break;
                    case "SubTitle":
                        this.Score.SubTitle = c.FirstChild.get_InnerText();
                        break;
                    case "Artist":
                        this.Score.Artist = c.FirstChild.get_InnerText();
                        break;
                    case "Album":
                        this.Score.Album = c.FirstChild.get_InnerText();
                        break;
                    case "Words":
                        this.Score.Words = c.FirstChild.get_InnerText();
                        break;
                    case "Music":
                        this.Score.Music = c.FirstChild.get_InnerText();
                        break;
                    case "WordsAndMusic":
                        if (c.FirstChild != null && c.FirstChild.toString() != ""){
                        var wordsAndMusic = c.FirstChild.get_InnerText();
                        if (!((wordsAndMusic==null)||(wordsAndMusic.length==0)) && ((this.Score.Words==null)||(this.Score.Words.length==0))){
                            this.Score.Words = wordsAndMusic;
                        }
                        if (!((wordsAndMusic==null)||(wordsAndMusic.length==0)) && ((this.Score.Music==null)||(this.Score.Music.length==0))){
                            this.Score.Music = wordsAndMusic;
                        }
                    }
                        break;
                    case "Copyright":
                        this.Score.Copyright = c.FirstChild.get_InnerText();
                        break;
                    case "Tabber":
                        this.Score.Tab = c.FirstChild.get_InnerText();
                        break;
                    case "Instructions":
                        this.Score.Instructions = c.FirstChild.get_InnerText();
                        break;
                    case "Notices":
                        this.Score.Notices = c.FirstChild.get_InnerText();
                        break;
                }
            }
        }
    },
    ParseMasterTrackNode: function (node){
        for (var $i18 = 0,$t18 = node.ChildNodes,$l18 = $t18.length,c = $t18[$i18]; $i18 < $l18; $i18++, c = $t18[$i18]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Automations":
                        this.ParseAutomations(c, this._masterTrackAutomations);
                        break;
                    case "Tracks":
                        this._tracksMapping = c.get_InnerText().split(" ");
                        break;
                }
            }
        }
    },
    ParseAutomations: function (node, automations){
        for (var $i19 = 0,$t19 = node.ChildNodes,$l19 = $t19.length,c = $t19[$i19]; $i19 < $l19; $i19++, c = $t19[$i19]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Automation":
                        this.ParseAutomation(c, automations);
                        break;
                }
            }
        }
    },
    ParseAutomation: function (node, automations){
        var type = null;
        var isLinear = false;
        var barId = null;
        var ratioPosition = 0;
        var value = 0;
        var reference = 0;
        var text = null;
        for (var $i20 = 0,$t20 = node.ChildNodes,$l20 = $t20.length,c = $t20[$i20]; $i20 < $l20; $i20++, c = $t20[$i20]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Type":
                        type = c.get_InnerText();
                        break;
                    case "Linear":
                        isLinear = c.get_InnerText().toLowerCase() == "true";
                        break;
                    case "Bar":
                        barId = c.get_InnerText();
                        break;
                    case "Position":
                        ratioPosition = AlphaTab.Platform.Std.ParseFloat(c.get_InnerText());
                        break;
                    case "Value":
                        var parts = c.get_InnerText().split(" ");
                        value = AlphaTab.Platform.Std.ParseFloat(parts[0]);
                        reference = AlphaTab.Platform.Std.ParseInt(parts[1]);
                        break;
                    case "Text":
                        text = c.get_InnerText();
                        break;
                }
            }
        }
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
            if (!automations.hasOwnProperty(barId)){
                automations[barId] = [];
            }
            automations[barId].push(automation);
        }
    },
    ParseTracksNode: function (node){
        for (var $i21 = 0,$t21 = node.ChildNodes,$l21 = $t21.length,c = $t21[$i21]; $i21 < $l21; $i21++, c = $t21[$i21]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Track":
                        this.ParseTrack(c);
                        break;
                }
            }
        }
    },
    ParseTrack: function (node){
        var track = new AlphaTab.Model.Track(1);
        var trackId = node.GetAttribute("id");
        for (var $i22 = 0,$t22 = node.ChildNodes,$l22 = $t22.length,c = $t22[$i22]; $i22 < $l22; $i22++, c = $t22[$i22]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Name":
                        track.Name = c.get_InnerText();
                        break;
                    case "Color":
                        var parts = c.get_InnerText().split(" ");
                        if (parts.length >= 3){
                        var r = AlphaTab.Platform.Std.ParseInt(parts[0]);
                        var g = AlphaTab.Platform.Std.ParseInt(parts[1]);
                        var b = AlphaTab.Platform.Std.ParseInt(parts[2]);
                        track.Color = new AlphaTab.Platform.Model.Color(r, g, b, 255);
                    }
                        break;
                    case "Instrument":
                        var instrumentName = c.GetAttribute("ref");
                        if ((instrumentName.lastIndexOf("-gs")==(instrumentName.length-"-gs".length)) || (instrumentName.lastIndexOf("GrandStaff")==(instrumentName.length-"GrandStaff".length))){
                        track.EnsureStaveCount(2);
                    }
                        break;
                    case "ShortName":
                        track.ShortName = c.get_InnerText();
                        break;
                    case "Lyrics":
                        this.ParseLyrics(trackId, c);
                        break;
                    case "Properties":
                        this.ParseTrackProperties(track, c);
                        break;
                    case "GeneralMidi":
                        this.ParseGeneralMidi(track, c);
                        break;
                    case "PlaybackState":
                        var state = c.get_InnerText();
                        track.PlaybackInfo.IsSolo = state == "Solo";
                        track.PlaybackInfo.IsMute = state == "Mute";
                        break;
                    case "PartSounding":
                        this.ParsePartSounding(track, c);
                        break;
                }
            }
        }
        this._tracksById[trackId] = track;
    },
    ParseLyrics: function (trackId, node){
        var tracks = [];
        for (var $i23 = 0,$t23 = node.ChildNodes,$l23 = $t23.length,c = $t23[$i23]; $i23 < $l23; $i23++, c = $t23[$i23]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Line":
                        tracks.push(this.ParseLyricsLine(c));
                        break;
                }
            }
        }
        this._lyricsByTrack[trackId] = tracks;
    },
    ParseLyricsLine: function (node){
        var lyrics = new AlphaTab.Model.Lyrics();
        for (var $i24 = 0,$t24 = node.ChildNodes,$l24 = $t24.length,c = $t24[$i24]; $i24 < $l24; $i24++, c = $t24[$i24]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Offset":
                        lyrics.StartBar = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "Text":
                        lyrics.Text = c.get_InnerText();
                        break;
                }
            }
        }
        return lyrics;
    },
    ParseDiagramCollection: function (track, node){
        var items = node.FindChildElement("Items");
        for (var $i25 = 0,$t25 = items.ChildNodes,$l25 = $t25.length,c = $t25[$i25]; $i25 < $l25; $i25++, c = $t25[$i25]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Item":
                        this.ParseDiagramItem(track, c);
                        break;
                }
            }
        }
    },
    ParseDiagramItem: function (track, node){
        var chord = new AlphaTab.Model.Chord();
        var chordId = node.GetAttribute("id");
        chord.Name = node.GetAttribute("name");
        track.Chords[chordId] = chord;
        var diagram = node.FindChildElement("Diagram");
        var stringCount = AlphaTab.Platform.Std.ParseInt(diagram.GetAttribute("stringCount"));
        var baseFret = AlphaTab.Platform.Std.ParseInt(diagram.GetAttribute("baseFret"));
        chord.FirstFret = baseFret + 1;
        for (var i = 0; i < stringCount; i++){
            chord.Strings.push(-1);
        }
        for (var $i26 = 0,$t26 = diagram.ChildNodes,$l26 = $t26.length,c = $t26[$i26]; $i26 < $l26; $i26++, c = $t26[$i26]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Fret":
                        var guitarString = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("string"));
                        chord.Strings[stringCount - guitarString - 1] = baseFret + AlphaTab.Platform.Std.ParseInt(c.GetAttribute("fret"));
                        break;
                    case "Fingering":
                        var existingFingers = {};
                        for (var $i27 = 0,$t27 = c.ChildNodes,$l27 = $t27.length,p = $t27[$i27]; $i27 < $l27; $i27++, p = $t27[$i27]){
                        if (p.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                            switch (p.LocalName){
                                case "Position":
                                    var finger = AlphaTab.Model.Fingers.Unknown;
                                    var fret = baseFret + AlphaTab.Platform.Std.ParseInt(p.GetAttribute("fret"));
                                    switch (p.GetAttribute("finger")){
                                        case "Index":
                                        finger = AlphaTab.Model.Fingers.IndexFinger;
                                        break;
                                        case "Middle":
                                        finger = AlphaTab.Model.Fingers.MiddleFinger;
                                        break;
                                        case "Rank":
                                        finger = AlphaTab.Model.Fingers.AnnularFinger;
                                        break;
                                        case "Pinky":
                                        finger = AlphaTab.Model.Fingers.LittleFinger;
                                        break;
                                        case "Thumb":
                                        finger = AlphaTab.Model.Fingers.Thumb;
                                        break;
                                        case "None":
                                        break;
                                    }
                                    if (finger != AlphaTab.Model.Fingers.Unknown){
                                    if (existingFingers.hasOwnProperty(finger)){
                                        chord.BarreFrets.push(fret);
                                    }
                                    else {
                                        existingFingers[finger] = true;
                                    }
                                }
                                    break;
                            }
                        }
                    }
                        break;
                }
            }
        }
    },
    ParseTrackProperties: function (track, node){
        for (var $i28 = 0,$t28 = node.ChildNodes,$l28 = $t28.length,c = $t28[$i28]; $i28 < $l28; $i28++, c = $t28[$i28]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Property":
                        this.ParseTrackProperty(track, c);
                        break;
                }
            }
        }
    },
    ParseTrackProperty: function (track, node){
        var propertyName = node.GetAttribute("name");
        switch (propertyName){
            case "Tuning":
                var tuningParts = node.FindChildElement("Pitches").get_InnerText().split(" ");
                var tuning = new Int32Array(tuningParts.length);
                for (var i = 0; i < tuning.length; i++){
                tuning[tuning.length - 1 - i] = AlphaTab.Platform.Std.ParseInt(tuningParts[i]);
            }
                track.Tuning = tuning;
                break;
            case "DiagramCollection":
            case "ChordCollection":
                this.ParseDiagramCollection(track, node);
                break;
            case "CapoFret":
                track.Capo = AlphaTab.Platform.Std.ParseInt(node.FindChildElement("Fret").get_InnerText());
                break;
        }
    },
    ParseGeneralMidi: function (track, node){
        track.PlaybackInfo.Port = AlphaTab.Platform.Std.ParseInt(node.FindChildElement("Port").get_InnerText());
        track.PlaybackInfo.Program = AlphaTab.Platform.Std.ParseInt(node.FindChildElement("Program").get_InnerText());
        track.PlaybackInfo.PrimaryChannel = AlphaTab.Platform.Std.ParseInt(node.FindChildElement("PrimaryChannel").get_InnerText());
        track.PlaybackInfo.SecondaryChannel = AlphaTab.Platform.Std.ParseInt(node.FindChildElement("SecondaryChannel").get_InnerText());
        track.IsPercussion = node.GetAttribute("table") == "Percussion";
    },
    ParsePartSounding: function (track, node){
        for (var $i29 = 0,$t29 = node.ChildNodes,$l29 = $t29.length,c = $t29[$i29]; $i29 < $l29; $i29++, c = $t29[$i29]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "TranspositionPitch":
                        track.DisplayTranspositionPitch = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
    },
    ParseMasterBarsNode: function (node){
        for (var $i30 = 0,$t30 = node.ChildNodes,$l30 = $t30.length,c = $t30[$i30]; $i30 < $l30; $i30++, c = $t30[$i30]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "MasterBar":
                        this.ParseMasterBar(c);
                        break;
                }
            }
        }
    },
    ParseMasterBar: function (node){
        var masterBar = new AlphaTab.Model.MasterBar();
        for (var $i31 = 0,$t31 = node.ChildNodes,$l31 = $t31.length,c = $t31[$i31]; $i31 < $l31; $i31++, c = $t31[$i31]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Time":
                        var timeParts = c.get_InnerText().split("/");
                        masterBar.TimeSignatureNumerator = AlphaTab.Platform.Std.ParseInt(timeParts[0]);
                        masterBar.TimeSignatureDenominator = AlphaTab.Platform.Std.ParseInt(timeParts[1]);
                        break;
                    case "DoubleBar":
                        masterBar.IsDoubleBar = true;
                        break;
                    case "Section":
                        masterBar.Section = new AlphaTab.Model.Section();
                        masterBar.Section.Marker = c.FindChildElement("Letter").get_InnerText();
                        masterBar.Section.Text = c.FindChildElement("Text").get_InnerText();
                        break;
                    case "Repeat":
                        if (c.GetAttribute("start").toLowerCase() == "true"){
                        masterBar.IsRepeatStart = true;
                    }
                        if (c.GetAttribute("end").toLowerCase() == "true" && c.GetAttribute("count") != null){
                        masterBar.RepeatCount = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("count"));
                    }
                        break;
                    case "AlternateEndings":
                        var alternateEndings = c.get_InnerText().split(" ");
                        var i = 0;
                        for (var k = 0; k < alternateEndings.length; k++){
                        i |= 1 << (-1 + AlphaTab.Platform.Std.ParseInt(alternateEndings[k]));
                    }
                        masterBar.AlternateEndings = i;
                        break;
                    case "Bars":
                        this._barsOfMasterBar.push(c.get_InnerText().split(" "));
                        break;
                    case "TripletFeel":
                        switch (c.get_InnerText()){
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
                        masterBar.KeySignature = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("AccidentalCount").get_InnerText());
                        var mode = c.FindChildElement("Mode");
                        if (mode != null){
                        switch (mode.get_InnerText().toLowerCase()){
                            case "major":
                                masterBar.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
                                break;
                            case "minor":
                                masterBar.KeySignatureType = AlphaTab.Model.KeySignatureType.Minor;
                                break;
                        }
                    }
                        break;
                }
            }
        }
        this._masterBars.push(masterBar);
    },
    ParseBars: function (node){
        for (var $i32 = 0,$t32 = node.ChildNodes,$l32 = $t32.length,c = $t32[$i32]; $i32 < $l32; $i32++, c = $t32[$i32]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Bar":
                        this.ParseBar(c);
                        break;
                }
            }
        }
    },
    ParseBar: function (node){
        var bar = new AlphaTab.Model.Bar();
        var barId = node.GetAttribute("id");
        for (var $i33 = 0,$t33 = node.ChildNodes,$l33 = $t33.length,c = $t33[$i33]; $i33 < $l33; $i33++, c = $t33[$i33]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Voices":
                        this._voicesOfBar[barId] = c.get_InnerText().split(" ");
                        break;
                    case "Clef":
                        switch (c.get_InnerText()){
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
                    case "Ottavia":
                        switch (c.get_InnerText()){
                            case "8va":
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._8va;
                            break;
                            case "15ma":
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._15ma;
                            break;
                            case "8vb":
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._8vb;
                            break;
                            case "15mb":
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._15mb;
                            break;
                        }
                        break;
                }
            }
        }
        this._barsById[barId] = bar;
    },
    ParseVoices: function (node){
        for (var $i34 = 0,$t34 = node.ChildNodes,$l34 = $t34.length,c = $t34[$i34]; $i34 < $l34; $i34++, c = $t34[$i34]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Voice":
                        this.ParseVoice(c);
                        break;
                }
            }
        }
    },
    ParseVoice: function (node){
        var voice = new AlphaTab.Model.Voice();
        var voiceId = node.GetAttribute("id");
        for (var $i35 = 0,$t35 = node.ChildNodes,$l35 = $t35.length,c = $t35[$i35]; $i35 < $l35; $i35++, c = $t35[$i35]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Beats":
                        this._beatsOfVoice[voiceId] = c.get_InnerText().split(" ");
                        break;
                }
            }
        }
        this._voiceById[voiceId] = voice;
    },
    ParseBeats: function (node){
        for (var $i36 = 0,$t36 = node.ChildNodes,$l36 = $t36.length,c = $t36[$i36]; $i36 < $l36; $i36++, c = $t36[$i36]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Beat":
                        this.ParseBeat(c);
                        break;
                }
            }
        }
    },
    ParseBeat: function (node){
        var beat = new AlphaTab.Model.Beat();
        var beatId = node.GetAttribute("id");
        for (var $i37 = 0,$t37 = node.ChildNodes,$l37 = $t37.length,c = $t37[$i37]; $i37 < $l37; $i37++, c = $t37[$i37]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Notes":
                        this._notesOfBeat[beatId] = c.get_InnerText().split(" ");
                        break;
                    case "Rhythm":
                        this._rhythmOfBeat[beatId] = c.GetAttribute("ref");
                        break;
                    case "Fadding":
                        if (c.get_InnerText() == "FadeIn"){
                        beat.FadeIn = true;
                    }
                        break;
                    case "Tremolo":
                        switch (c.get_InnerText()){
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
                        beat.ChordId = c.get_InnerText();
                        break;
                    case "Hairpin":
                        switch (c.get_InnerText()){
                            case "Crescendo":
                            beat.Crescendo = AlphaTab.Model.CrescendoType.Crescendo;
                            break;
                            case "Decrescendo":
                            beat.Crescendo = AlphaTab.Model.CrescendoType.Decrescendo;
                            break;
                        }
                        break;
                    case "Arpeggio":
                        if (c.get_InnerText() == "Up"){
                        beat.BrushType = AlphaTab.Model.BrushType.ArpeggioUp;
                    }
                        else {
                        beat.BrushType = AlphaTab.Model.BrushType.ArpeggioDown;
                    }
                        break;
                    case "Properties":
                        this.ParseBeatProperties(c, beat);
                        break;
                    case "XProperties":
                        this.ParseBeatXProperties(c, beat);
                        break;
                    case "FreeText":
                        beat.Text = c.get_InnerText();
                        break;
                    case "Dynamic":
                        switch (c.get_InnerText()){
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
                        switch (c.get_InnerText()){
                            case "OnBeat":
                            beat.GraceType = AlphaTab.Model.GraceType.OnBeat;
                            break;
                            case "BeforeBeat":
                            beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
                            break;
                        }
                        break;
                    case "Legato":
                        if (c.GetAttribute("origin") == "true"){
                        beat.IsLegatoOrigin = true;
                    }
                        break;
                }
            }
        }
        this._beatById[beatId] = beat;
    },
    ParseBeatXProperties: function (node, beat){
        for (var $i38 = 0,$t38 = node.ChildNodes,$l38 = $t38.length,c = $t38[$i38]; $i38 < $l38; $i38++, c = $t38[$i38]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "XProperty":
                        var id = c.GetAttribute("id");
                        switch (id){
                            case "1124204545":
                            var val = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Int").get_InnerText());
                            beat.InvertBeamDirection = val == 1;
                            break;
                        }
                        break;
                }
            }
        }
    },
    ParseBeatProperties: function (node, beat){
        var isWhammy = false;
        var whammyOrigin = null;
        var whammyMiddleValue = null;
        var whammyMiddleOffset1 = null;
        var whammyMiddleOffset2 = null;
        var whammyDestination = null;
        for (var $i39 = 0,$t39 = node.ChildNodes,$l39 = $t39.length,c = $t39[$i39]; $i39 < $l39; $i39++, c = $t39[$i39]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Property":
                        var name = c.GetAttribute("name");
                        switch (name){
                            case "Brush":
                            if (c.FindChildElement("Direction").get_InnerText() == "Up"){
                            beat.BrushType = AlphaTab.Model.BrushType.BrushUp;
                        }
                            else {
                            beat.BrushType = AlphaTab.Model.BrushType.BrushDown;
                        }
                            break;
                            case "PickStroke":
                            if (c.FindChildElement("Direction").get_InnerText() == "Up"){
                            beat.PickStroke = AlphaTab.Model.PickStrokeType.Up;
                        }
                            else {
                            beat.PickStroke = AlphaTab.Model.PickStrokeType.Down;
                        }
                            break;
                            case "Slapped":
                            if (c.FindChildElement("Enable") != null)
                            beat.Slap = true;
                            break;
                            case "Popped":
                            if (c.FindChildElement("Enable") != null)
                            beat.Pop = true;
                            break;
                            case "VibratoWTremBar":
                            switch (c.FindChildElement("Strength").get_InnerText()){
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
                            whammyOrigin.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "WhammyBarOriginOffset":
                            if (whammyOrigin == null)
                            whammyOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            whammyOrigin.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "WhammyBarMiddleValue":
                            whammyMiddleValue = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "WhammyBarMiddleOffset1":
                            whammyMiddleOffset1 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "WhammyBarMiddleOffset2":
                            whammyMiddleOffset2 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "WhammyBarDestinationValue":
                            if (whammyDestination == null)
                            whammyDestination = new AlphaTab.Model.BendPoint(60, 0);
                            whammyDestination.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "WhammyBarDestinationOffset":
                            if (whammyDestination == null)
                            whammyDestination = new AlphaTab.Model.BendPoint(0, 0);
                            whammyDestination.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                        }
                        break;
                }
            }
        }
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
        for (var $i40 = 0,$t40 = node.ChildNodes,$l40 = $t40.length,c = $t40[$i40]; $i40 < $l40; $i40++, c = $t40[$i40]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Note":
                        this.ParseNote(c);
                        break;
                }
            }
        }
    },
    ParseNote: function (node){
        var note = new AlphaTab.Model.Note();
        var noteId = node.GetAttribute("id");
        for (var $i41 = 0,$t41 = node.ChildNodes,$l41 = $t41.length,c = $t41[$i41]; $i41 < $l41; $i41++, c = $t41[$i41]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Properties":
                        this.ParseNoteProperties(c, note, noteId);
                        break;
                    case "AntiAccent":
                        if (c.get_InnerText().toLowerCase() == "normal"){
                        note.IsGhost = true;
                    }
                        break;
                    case "LetRing":
                        note.IsLetRing = true;
                        break;
                    case "Trill":
                        note.TrillValue = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        note.TrillSpeed = AlphaTab.Model.Duration.Sixteenth;
                        break;
                    case "Accent":
                        var accentFlags = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        if ((accentFlags & 1) != 0)
                        note.IsStaccato = true;
                        if ((accentFlags & 4) != 0)
                        note.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
                        if ((accentFlags & 8) != 0)
                        note.Accentuated = AlphaTab.Model.AccentuationType.Normal;
                        break;
                    case "Tie":
                        if (c.GetAttribute("origin").toLowerCase() == "true"){
                        note.IsTieOrigin = true;
                    }
                        if (c.GetAttribute("destination").toLowerCase() == "true"){
                        note.IsTieDestination = true;
                    }
                        break;
                    case "Vibrato":
                        switch (c.get_InnerText()){
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
                        switch (c.get_InnerText()){
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
                        switch (c.get_InnerText()){
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
        }
        this._noteById[noteId] = note;
    },
    ParseNoteProperties: function (node, note, noteId){
        var isBended = false;
        var bendOrigin = null;
        var bendMiddleValue = null;
        var bendMiddleOffset1 = null;
        var bendMiddleOffset2 = null;
        var bendDestination = null;
        for (var $i42 = 0,$t42 = node.ChildNodes,$l42 = $t42.length,c = $t42[$i42]; $i42 < $l42; $i42++, c = $t42[$i42]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Property":
                        var name = c.GetAttribute("name");
                        switch (name){
                            case "String":
                            note.String = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("String").get_InnerText()) + 1;
                            break;
                            case "Fret":
                            note.Fret = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Fret").get_InnerText());
                            break;
                            case "Element":
                            note.Element = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Element").get_InnerText());
                            break;
                            case "Variation":
                            note.Variation = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Variation").get_InnerText());
                            break;
                            case "Tapped":
                            this._tappedNotes[noteId] = true;
                            break;
                            case "HarmonicType":
                            var htype = c.FindChildElement("HType");
                            if (htype != null){
                            switch (htype.get_InnerText()){
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
                            var hfret = c.FindChildElement("HFret");
                            if (hfret != null){
                            note.HarmonicValue = AlphaTab.Platform.Std.ParseFloat(hfret.get_InnerText());
                        }
                            break;
                            case "Muted":
                            if (c.FindChildElement("Enable") != null)
                            note.IsDead = true;
                            break;
                            case "PalmMuted":
                            if (c.FindChildElement("Enable") != null)
                            note.IsPalmMute = true;
                            break;
                            case "Octave":
                            note.Octave = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Number").get_InnerText());
                            break;
                            case "Tone":
                            note.Tone = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Step").get_InnerText());
                            break;
                            case "Bended":
                            isBended = true;
                            break;
                            case "BendOriginValue":
                            if (bendOrigin == null)
                            bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            bendOrigin.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "BendOriginOffset":
                            if (bendOrigin == null)
                            bendOrigin = new AlphaTab.Model.BendPoint(0, 0);
                            bendOrigin.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "BendMiddleValue":
                            bendMiddleValue = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "BendMiddleOffset1":
                            bendMiddleOffset1 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "BendMiddleOffset2":
                            bendMiddleOffset2 = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "BendDestinationValue":
                            if (bendDestination == null)
                            bendDestination = new AlphaTab.Model.BendPoint(60, 0);
                            bendDestination.Value = this.ToBendValue(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "BendDestinationOffset":
                            if (bendDestination == null)
                            bendDestination = new AlphaTab.Model.BendPoint(0, 0);
                            bendDestination.Offset = this.ToBendOffset(AlphaTab.Platform.Std.ParseFloat(c.FindChildElement("Float").get_InnerText()));
                            break;
                            case "HopoOrigin":
                            if (c.FindChildElement("Enable") != null)
                            note.IsHammerPullOrigin = true;
                            break;
                            case "HopoDestination":
                            break;
                            case "Slide":
                            var slideFlags = AlphaTab.Platform.Std.ParseInt(c.FindChildElement("Flags").get_InnerText());
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
        }
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
        for (var $i43 = 0,$t43 = node.ChildNodes,$l43 = $t43.length,c = $t43[$i43]; $i43 < $l43; $i43++, c = $t43[$i43]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "Rhythm":
                        this.ParseRhythm(c);
                        break;
                }
            }
        }
    },
    ParseRhythm: function (node){
        var rhythm = new AlphaTab.Importer.GpxRhythm();
        var rhythmId = node.GetAttribute("id");
        for (var $i44 = 0,$t44 = node.ChildNodes,$l44 = $t44.length,c = $t44[$i44]; $i44 < $l44; $i44++, c = $t44[$i44]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "NoteValue":
                        switch (c.get_InnerText()){
                            case "Long":
                            rhythm.Value = AlphaTab.Model.Duration.QuadrupleWhole;
                            break;
                            case "DoubleWhole":
                            rhythm.Value = AlphaTab.Model.Duration.DoubleWhole;
                            break;
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
                            case "128th":
                            rhythm.Value = AlphaTab.Model.Duration.OneHundredTwentyEighth;
                            break;
                            case "256th":
                            rhythm.Value = AlphaTab.Model.Duration.TwoHundredFiftySixth;
                            break;
                        }
                        break;
                    case "PrimaryTuplet":
                        rhythm.TupletNumerator = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("num"));
                        rhythm.TupletDenominator = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("den"));
                        break;
                    case "AugmentationDot":
                        rhythm.Dots = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("count"));
                        break;
                }
            }
        }
        this._rhythmById[rhythmId] = rhythm;
    },
    BuildModel: function (){
        // build score
        for (var i = 0,j = this._masterBars.length; i < j; i++){
            var masterBar = this._masterBars[i];
            this.Score.AddMasterBar(masterBar);
        }
        // add tracks to score
        for (var $i45 = 0,$t45 = this._tracksMapping,$l45 = $t45.length,trackId = $t45[$i45]; $i45 < $l45; $i45++, trackId = $t45[$i45]){
            if (((trackId==null)||(trackId.length==0))){
                continue;
            }
            var track = this._tracksById[trackId];
            this.Score.AddTrack(track);
        }
        // process all masterbars
        for (var masterBarIndex = 0; masterBarIndex < this._barsOfMasterBar.length; masterBarIndex++){
            var barIds = this._barsOfMasterBar[masterBarIndex];
            // add all bars of masterbar vertically to all tracks
            var staveIndex = 0;
            for (var barIndex = 0,trackIndex = 0; barIndex < barIds.length && trackIndex < this.Score.Tracks.length; barIndex++){
                var barId = barIds[barIndex];
                if (barId != "-1"){
                    var bar = this._barsById[barId];
                    var track = this.Score.Tracks[trackIndex];
                    track.AddBarToStaff(staveIndex, bar);
                    // stave is full? -> next track
                    if (staveIndex == track.Staves.length - 1){
                        trackIndex++;
                        staveIndex = 0;
                    }
                    else {
                        staveIndex++;
                    }
                }
                else {
                    // no bar for track
                    trackIndex++;
                }
            }
        }
        // build bars
        for (var barId in this._barsById){
            var bar = this._barsById[barId];
            if (this._voicesOfBar.hasOwnProperty(barId)){
                // add voices to bars
                for (var $i46 = 0,$t46 = this._voicesOfBar[barId],$l46 = $t46.length,voiceId = $t46[$i46]; $i46 < $l46; $i46++, voiceId = $t46[$i46]){
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
        for (var beatId in this._beatById){
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
                for (var $i47 = 0,$t47 = this._notesOfBeat[beatId],$l47 = $t47.length,noteId = $t47[$i47]; $i47 < $l47; $i47++, noteId = $t47[$i47]){
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
        for (var voiceId in this._voiceById){
            var voice = this._voiceById[voiceId];
            if (this._beatsOfVoice.hasOwnProperty(voiceId)){
                // add beats to voices
                for (var $i48 = 0,$t48 = this._beatsOfVoice[voiceId],$l48 = $t48.length,beatId = $t48[$i48]; $i48 < $l48; $i48++, beatId = $t48[$i48]){
                    if (beatId != "-1"){
                        // important! we clone the beat because beats get reused
                        // in gp6, our model needs to have unique beats.
                        voice.AddBeat(this._beatById[beatId].Clone());
                    }
                }
            }
        }
        // build masterbar automations
        for (var barIndex in this._masterTrackAutomations){
            var automations = this._masterTrackAutomations[barIndex];
            var masterBar = this.Score.MasterBars[AlphaTab.Platform.Std.ParseInt(barIndex)];
            for (var i = 0,j = automations.length; i < j; i++){
                var automation = automations[i];
                if (automation.Type == AlphaTab.Model.AutomationType.Tempo){
                    if (barIndex == "0"){
                        this.Score.Tempo = ((automation.Value)) | 0;
                        if (automation.Text != null){
                            this.Score.TempoLabel = automation.Text;
                        }
                    }
                    masterBar.TempoAutomation = automation;
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
AlphaTab.Importer.MusicXmlImporter = function (){
    this._score = null;
    this._trackById = null;
    this._trackFirstMeasureNumber = 0;
    this._maxVoices = 0;
    this._currentChord = null;
    this._divisionsPerQuarterNote = 0;
    this._voiceOfStaff = {};
    this._isBeamContinue = false;
    this._previousBeatWasPulled = false;
    this._previousBeat = null;
    AlphaTab.Importer.ScoreImporter.call(this);
};
AlphaTab.Importer.MusicXmlImporter.prototype = {
    get_Name: function (){
        return "MusicXML";
    },
    ReadScore: function (){
        this._trackById = {};
        var xml = AlphaTab.Platform.Std.ToString(this.Data.ReadAll());
        var dom;
        try{
            dom = new AlphaTab.Xml.XmlDocument(xml);
        }
        catch($$e6){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
        }
        this._score = new AlphaTab.Model.Score();
        this._score.Tempo = 120;
        this.ParseDom(dom);
        this._score.Finish();
        return this._score;
    },
    ParseDom: function (dom){
        var root = dom.DocumentElement;
        if (root == null){
            throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
        }
        switch (root.LocalName){
            case "score-partwise":
                this.ParsePartwise(root);
                break;
            case "score-timewise":
                break;
            default:
                throw $CreateException(new AlphaTab.Importer.UnsupportedFormatException(""), new Error());
        }
    },
    ParsePartwise: function (element){
        for (var $i49 = 0,$t49 = element.ChildNodes,$l49 = $t49.length,c = $t49[$i49]; $i49 < $l49; $i49++, c = $t49[$i49]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "movement-title":
                        this._score.Title = c.FirstChild.get_InnerText();
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
        }
    },
    ParsePart: function (element){
        var id = element.GetAttribute("id");
        if (!this._trackById.hasOwnProperty(id)){
            return;
        }
        var track = this._trackById[id];
        var isFirstMeasure = true;
        for (var $i50 = 0,$t50 = element.ChildNodes,$l50 = $t50.length,c = $t50[$i50]; $i50 < $l50; $i50++, c = $t50[$i50]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "measure":
                        if (this.ParseMeasure(c, track, isFirstMeasure)){
                        isFirstMeasure = false;
                    }
                        break;
                }
            }
        }
    },
    ParseMeasure: function (element, track, isFirstMeasure){
        if (element.GetAttribute("implicit") == "yes" && element.GetElementsByTagName("note").length == 0){
            return false;
        }
        var barIndex = 0;
        if (isFirstMeasure){
            this._divisionsPerQuarterNote = 0;
            this._trackFirstMeasureNumber = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("number"));
            if (this._trackFirstMeasureNumber == -2147483648){
                this._trackFirstMeasureNumber = 0;
            }
            barIndex = 0;
        }
        else {
            barIndex = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("number"));
            if (barIndex == -2147483648){
                return false;
            }
            barIndex -= this._trackFirstMeasureNumber;
        }
        // try to find out the number of staffs required 
        if (isFirstMeasure){
            var attributes = element.GetElementsByTagName("attributes");
            if (attributes.length > 0){
                var stavesElements = attributes[0].GetElementsByTagName("staves");
                if (stavesElements.length > 0){
                    var staves = AlphaTab.Platform.Std.ParseInt(stavesElements[0].get_InnerText());
                    track.EnsureStaveCount(staves);
                }
            }
        }
        // create empty bars to the current index
        var bars = new Array(track.Staves.length);
        var masterBar = null;
        for (var b = track.Staves[0].Bars.length; b <= barIndex; b++){
            for (var s = 0; s < track.Staves.length; s++){
                var bar = bars[s] = new AlphaTab.Model.Bar();
                if (track.Staves[s].Bars.length > 0){
                    var previousBar = track.Staves[s].Bars[track.Staves[s].Bars.length - 1];
                    bar.Clef = previousBar.Clef;
                }
                masterBar = this.GetOrCreateMasterBar(barIndex);
                track.AddBarToStaff(s, bar);
                for (var v = 0; v < this._maxVoices; v++){
                    var emptyVoice = new AlphaTab.Model.Voice();
                    bar.AddVoice(emptyVoice);
                    var emptyBeat = (function (){
                        var $v2 = new AlphaTab.Model.Beat();
                        $v2.IsEmpty = true;
                        return $v2;
                    }).call(this);
                    emptyVoice.AddBeat(emptyBeat);
                }
            }
        }
        var attributesParsed = false;
        for (var $i51 = 0,$t51 = element.ChildNodes,$l51 = $t51.length,c = $t51[$i51]; $i51 < $l51; $i51++, c = $t51[$i51]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "note":
                        this.ParseNoteBeat(c, bars);
                        break;
                    case "forward":
                        this.ParseForward(c, bars);
                        break;
                    case "direction":
                        this.ParseDirection(c, masterBar);
                        break;
                    case "attributes":
                        if (!attributesParsed){
                        this.ParseAttributes(c, bars, masterBar);
                        attributesParsed = true;
                    }
                        break;
                    case "harmony":
                        this.ParseHarmony(c, track);
                        break;
                    case "sound":
                        break;
                    case "barline":
                        this.ParseBarline(c, masterBar);
                        break;
                }
            }
        }
        return true;
    },
    GetOrCreateBeat: function (element, bars, chord){
        var voiceIndex = 0;
        var voiceNodes = element.GetElementsByTagName("voice");
        if (voiceNodes.length > 0){
            voiceIndex = AlphaTab.Platform.Std.ParseInt(voiceNodes[0].get_InnerText()) - 1;
        }
        var previousBeatWasPulled = this._previousBeatWasPulled;
        this._previousBeatWasPulled = false;
        var staffElement = element.GetElementsByTagName("staff");
        var staff = 1;
        if (staffElement.length > 0){
            staff = AlphaTab.Platform.Std.ParseInt(staffElement[0].get_InnerText());
            // in case we have a beam with a staff-jump we pull the note to the previous staff
            if ((this._isBeamContinue || previousBeatWasPulled) && this._previousBeat.Voice.Bar.Staff.Index != staff - 1){
                staff = this._previousBeat.Voice.Bar.Staff.Index + 1;
                this._previousBeatWasPulled = true;
            }
            var staffId = bars[0].Staff.Track.Index + "-" + staff;
            if (!this._voiceOfStaff.hasOwnProperty(staffId)){
                this._voiceOfStaff[staffId] = voiceIndex;
            }
            voiceIndex -= this._voiceOfStaff[staffId];
        }
        var bar = bars[staff - 1];
        var beat;
        var voice = this.GetOrCreateVoice(bar, voiceIndex);
        if (chord || (voice.Beats.length == 1 && voice.IsEmpty)){
            beat = voice.Beats[voice.Beats.length - 1];
        }
        else {
            beat = new AlphaTab.Model.Beat();
            beat.IsEmpty = false;
            voice.AddBeat(beat);
        }
        this._isBeamContinue = false;
        this._previousBeat = beat;
        return beat;
    },
    ParseForward: function (element, bars){
        var beat = this.GetOrCreateBeat(element, bars, false);
        var durationInDivisions = AlphaTab.Platform.Std.ParseInt(element.FindChildElement("duration").get_InnerText());
        var duration = (durationInDivisions * 4) / this._divisionsPerQuarterNote;
        var durations = new Int32Array([64, 32, 16, 8, 4, 2, 1]);
        for (var $i52 = 0,$l52 = durations.length,d = durations[$i52]; $i52 < $l52; $i52++, d = durations[$i52]){
            if (duration >= d){
                beat.Duration = d;
                duration -= d;
                break;
            }
        }
        if (duration > 0){
            // TODO: Handle remaining duration 
            // (additional beats, dotted durations,...)
        }
        beat.IsEmpty = false;
    },
    ParseStaffDetails: function (element, track){
        for (var $i53 = 0,$t53 = element.ChildNodes,$l53 = $t53.length,c = $t53[$i53]; $i53 < $l53; $i53++, c = $t53[$i53]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "staff-lines":
                        track.Tuning = new Int32Array(AlphaTab.Platform.Std.ParseInt(c.get_InnerText()));
                        break;
                    case "staff-tuning":
                        this.ParseStaffTuning(c, track);
                        break;
                }
            }
        }
        if (this.IsEmptyTuning(track.Tuning)){
            track.Tuning = new Int32Array(0);
        }
    },
    ParseStaffTuning: function (element, track){
        var line = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("line"));
        var tuningStep = "C";
        var tuningOctave = "";
        var tuningAlter = 0;
        for (var $i54 = 0,$t54 = element.ChildNodes,$l54 = $t54.length,c = $t54[$i54]; $i54 < $l54; $i54++, c = $t54[$i54]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "tuning-step":
                        tuningStep = c.get_InnerText();
                        break;
                    case "tuning-alter":
                        tuningAlter = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "tuning-octave":
                        tuningOctave = c.get_InnerText();
                        break;
                }
            }
        }
        track.Tuning[track.Tuning.length - line] = AlphaTab.Model.TuningParser.GetTuningForText(tuningStep + tuningOctave) + tuningAlter;
    },
    ParseHarmony: function (element, track){
        var root = element.FindChildElement("root");
        var rootStep = root.FindChildElement("root-step").get_InnerText();
        var kind = element.FindChildElement("kind").get_InnerText();
        var chord = new AlphaTab.Model.Chord();
        chord.Name = rootStep;
        // TODO: find proper names for the rest
        //switch (kind)
        //{
        //    // triads
        //    case "major":
        //        break;
        //    case "minor":
        //        chord.Name += "m";
        //        break;
        //    // Sevenths
        //    case "augmented":
        //        break;
        //    case "diminished":
        //        break;
        //    case "dominant":
        //        break;
        //    case "major-seventh":
        //        chord.Name += "7M";
        //        break;
        //    case "minor-seventh":
        //        chord.Name += "m7";
        //        break;
        //    case "diminished-seventh":
        //        break;
        //    case "augmented-seventh":
        //        break;
        //    case "half-diminished":
        //        break;
        //    case "major-minor":
        //        break;
        //    // Sixths
        //    case "major-sixth":
        //        break;
        //    case "minor-sixth":
        //        break;
        //    // Ninths
        //    case "dominant-ninth":
        //        break;
        //    case "major-ninth":
        //        break;
        //    case "minor-ninth":
        //        break;
        //    // 11ths
        //    case "dominant-11th":
        //        break;
        //    case "major-11th":
        //        break;
        //    case "minor-11th":
        //        break;
        //    // 13ths
        //    case "dominant-13th":
        //        break;
        //    case "major-13th":
        //        break;
        //    case "minor-13th":
        //        break;
        //    // Suspended
        //    case "suspended-second":
        //        break;
        //    case "suspended-fourth":
        //        break;
        //    // Functional sixths
        //    case "Neapolitan":
        //        break;
        //    case "Italian":
        //        break;
        //    case "French":
        //        break;
        //    case "German":
        //        break;
        //    // Other
        //    case "pedal":
        //        break;
        //    case "power":
        //        break;
        //    case "Tristan":
        //        break;
        //}
        //var degree = element.GetElementsByTagName("degree");
        //if (degree.Length > 0)
        //{
        //    var degreeValue = Std.GetNodeValue(degree[0].GetElementsByTagName("degree-value")[0]);
        //    var degreeAlter = Std.GetNodeValue(degree[0].GetElementsByTagName("degree-alter")[0]);
        //    var degreeType = Std.GetNodeValue(degree[0].GetElementsByTagName("degree-type")[0]);
        //    if (!string.IsNullOrEmpty(degreeType))
        //    {
        //        chord.Name += degreeType;
        //    }
        //    if (!string.IsNullOrEmpty(degreeValue))
        //    {
        //        chord.Name += "#" + degreeValue;
        //    }
        //}
        this._currentChord = AlphaTab.Platform.Std.NewGuid();
        track.Chords[this._currentChord] = chord;
    },
    ParseBarline: function (element, masterBar){
        for (var $i55 = 0,$t55 = element.ChildNodes,$l55 = $t55.length,c = $t55[$i55]; $i55 < $l55; $i55++, c = $t55[$i55]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "repeat":
                        this.ParseRepeat(c, masterBar);
                        break;
                    case "ending":
                        this.ParseEnding(c, masterBar);
                        break;
                }
            }
        }
    },
    ParseEnding: function (element, masterBar){
        var number = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("number"));
        if (number > 0){
            --number;
            masterBar.AlternateEndings |= (1 << number);
        }
    },
    ParseRepeat: function (element, masterBar){
        var direction = element.GetAttribute("direction");
        var times = AlphaTab.Platform.Std.ParseInt(element.GetAttribute("times"));
        if (times < 0){
            times = 2;
        }
        if (direction == "backward"){
            masterBar.RepeatCount = times;
        }
        else if (direction == "forward"){
            masterBar.IsRepeatStart = true;
        }
    },
    ParseNoteBeat: function (element, bars){
        var chord = element.GetElementsByTagName("chord").length > 0;
        var beat = this.GetOrCreateBeat(element, bars, chord);
        beat.ChordId = this._currentChord;
        this._currentChord = null;
        var note = new AlphaTab.Model.Note();
        beat.Voice.IsEmpty = false;
        beat.IsEmpty = false;
        beat.AddNote(note);
        beat.Dots = 0;
        for (var $i56 = 0,$t56 = element.ChildNodes,$l56 = $t56.length,c = $t56[$i56]; $i56 < $l56; $i56++, c = $t56[$i56]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "grace":
                        beat.GraceType = AlphaTab.Model.GraceType.BeforeBeat;
                        beat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                        break;
                    case "duration":
                        if (beat.get_IsRest()){
                        // unit: divisions per quarter note
                        var duration = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        switch (duration){
                            case 1:
                                beat.Duration = AlphaTab.Model.Duration.Whole;
                                break;
                            case 2:
                                beat.Duration = AlphaTab.Model.Duration.Half;
                                break;
                            case 4:
                                beat.Duration = AlphaTab.Model.Duration.Quarter;
                                break;
                            case 8:
                                beat.Duration = AlphaTab.Model.Duration.Eighth;
                                break;
                            case 16:
                                beat.Duration = AlphaTab.Model.Duration.Sixteenth;
                                break;
                            case 32:
                                beat.Duration = AlphaTab.Model.Duration.ThirtySecond;
                                break;
                            case 64:
                                beat.Duration = AlphaTab.Model.Duration.SixtyFourth;
                                break;
                            default:
                                beat.Duration = AlphaTab.Model.Duration.Quarter;
                                break;
                        }
                    }
                        break;
                    case "tie":
                        AlphaTab.Importer.MusicXmlImporter.ParseTied(c, note);
                        break;
                    case "cue":
                        break;
                    case "instrument":
                        break;
                    case "type":
                        beat.Duration = this.GetDuration(c.get_InnerText());
                        if (beat.GraceType != AlphaTab.Model.GraceType.None && beat.Duration < AlphaTab.Model.Duration.Sixteenth){
                        beat.Duration = AlphaTab.Model.Duration.Eighth;
                    }
                        break;
                    case "dot":
                        beat.Dots++;
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
                        var beamMode = c.get_InnerText();
                        if (beamMode == "continue"){
                        this._isBeamContinue = true;
                    }
                        break;
                    case "notations":
                        this.ParseNotations(c, beat, note);
                        break;
                    case "lyric":
                        this.ParseLyric(c, beat);
                        break;
                    case "pitch":
                        this.ParsePitch(c, note);
                        break;
                    case "unpitched":
                        this.ParseUnpitched(c, note);
                        break;
                    case "rest":
                        beat.IsEmpty = false;
                        beat.Notes = [];
                        break;
                }
            }
        }
        // check if new note is duplicate on string
        if (note.get_IsStringed()){
            for (var i = 0; i < beat.Notes.length; i++){
                if (beat.Notes[i].String == note.String && beat.Notes[i] != note){
                    beat.RemoveNote(note);
                    break;
                }
            }
        }
    },
    GetDuration: function (text){
        switch (text){
            case "256th":
            case "128th":
            case "64th":
                return AlphaTab.Model.Duration.SixtyFourth;
            case "32nd":
                return AlphaTab.Model.Duration.ThirtySecond;
            case "16th":
                return AlphaTab.Model.Duration.Sixteenth;
            case "eighth":
                return AlphaTab.Model.Duration.Eighth;
            case "quarter":
                return AlphaTab.Model.Duration.Quarter;
            case "half":
                return AlphaTab.Model.Duration.Half;
            case "long":
            case "breve":
            case "whole":
                return AlphaTab.Model.Duration.Whole;
        }
        return AlphaTab.Model.Duration.Quarter;
    },
    ParseLyric: function (element, beat){
        for (var $i57 = 0,$t57 = element.ChildNodes,$l57 = $t57.length,c = $t57[$i57]; $i57 < $l57; $i57++, c = $t57[$i57]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "text":
                        if (!((beat.Text==null)||(beat.Text.length==0))){
                        beat.Text += " " + c.get_InnerText();
                    }
                        else {
                        beat.Text = c.get_InnerText();
                    }
                        break;
                }
            }
        }
    },
    ParseAccidental: function (element, note){
        switch (element.get_InnerText()){
            case "sharp":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceSharp;
                break;
            case "natural":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceNatural;
                break;
            case "flat":
                note.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.ForceFlat;
                break;
            case "double-sharp":
                break;
            case "sharp-sharp":
                break;
            case "flat-flat":
                break;
            case "natural-sharp":
                break;
            case "natural-flat":
                break;
            case "quarter-flat":
                break;
            case "quarter-sharp":
                break;
            case "three-quarters-flat":
                break;
            case "three-quarters-sharp":
                break;
        }
    },
    ParseNotations: function (element, beat, note){
        for (var $i58 = 0,$t58 = element.ChildNodes,$l58 = $t58.length,c = $t58[$i58]; $i58 < $l58; $i58++, c = $t58[$i58]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "articulations":
                        this.ParseArticulations(c, note);
                        break;
                    case "tied":
                        AlphaTab.Importer.MusicXmlImporter.ParseTied(c, note);
                        break;
                    case "slide":
                    case "glissando":
                        if (c.GetAttribute("type") == "start"){
                        note.SlideType = AlphaTab.Model.SlideType.Shift;
                    }
                        break;
                    case "dynamics":
                        this.ParseDynamics(c, beat);
                        break;
                    case "technical":
                        this.ParseTechnical(c, note);
                        break;
                    case "ornaments":
                        this.ParseOrnaments(c, note);
                        break;
                    case "slur":
                        if (c.GetAttribute("type") == "start"){
                        beat.IsLegatoOrigin = true;
                    }
                        break;
                }
            }
        }
    },
    ParseOrnaments: function (element, note){
        for (var $i59 = 0,$t59 = element.ChildNodes,$l59 = $t59.length,c = $t59[$i59]; $i59 < $l59; $i59++, c = $t59[$i59]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "tremolo":
                        var tremoloSpeed = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        switch (tremoloSpeed){
                            case 1:
                            note.Beat.TremoloSpeed = AlphaTab.Model.Duration.Eighth;
                            break;
                            case 2:
                            note.Beat.TremoloSpeed = AlphaTab.Model.Duration.Sixteenth;
                            break;
                            case 3:
                            note.Beat.TremoloSpeed = AlphaTab.Model.Duration.ThirtySecond;
                            break;
                        }
                        break;
                }
            }
        }
    },
    ParseTechnical: function (element, note){
        for (var $i60 = 0,$t60 = element.ChildNodes,$l60 = $t60.length,c = $t60[$i60]; $i60 < $l60; $i60++, c = $t60[$i60]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "string":
                        note.String = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        if (note.String != -2147483648){
                        note.String = note.Beat.Voice.Bar.Staff.Track.Tuning.length - note.String + 1;
                    }
                        break;
                    case "fret":
                        note.Fret = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
        if (note.String == -2147483648 || note.Fret == -2147483648){
            note.String = -1;
            note.Fret = -1;
        }
    },
    ParseArticulations: function (element, note){
        for (var $i61 = 0,$t61 = element.ChildNodes,$l61 = $t61.length,c = $t61[$i61]; $i61 < $l61; $i61++, c = $t61[$i61]){
            switch (c.LocalName){
                case "accent":
                    note.Accentuated = AlphaTab.Model.AccentuationType.Normal;
                    break;
                case "strong-accent":
                    note.Accentuated = AlphaTab.Model.AccentuationType.Heavy;
                    break;
                case "staccato":
                case "detached-legato":
                    note.IsStaccato = true;
                    break;
            }
        }
    },
    ParseDynamics: function (element, beat){
        for (var $i62 = 0,$t62 = element.ChildNodes,$l62 = $t62.length,c = $t62[$i62]; $i62 < $l62; $i62++, c = $t62[$i62]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
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
        }
    },
    ParseTimeModification: function (element, beat){
        for (var $i63 = 0,$t63 = element.ChildNodes,$l63 = $t63.length,c = $t63[$i63]; $i63 < $l63; $i63++, c = $t63[$i63]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "actual-notes":
                        beat.TupletNumerator = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "normal-notes":
                        beat.TupletDenominator = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
    },
    ParseUnpitched: function (element, note){
        var step = null;
        var semitones = 0;
        var octave = 0;
        for (var $i64 = 0,$t64 = element.ChildNodes,$l64 = $t64.length,c = $t64[$i64]; $i64 < $l64; $i64++, c = $t64[$i64]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "display-step":
                        step = c.get_InnerText();
                        break;
                    case "display-alter":
                        semitones = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "display-octave":
                        octave = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
        var value = octave * 12 + AlphaTab.Model.TuningParser.GetToneForText(step) + semitones;
        note.Octave = ((value / 12) | 0);
        note.Tone = value - (note.Octave * 12);
    },
    ParsePitch: function (element, note){
        var step = null;
        var semitones = 0;
        var octave = 0;
        for (var $i65 = 0,$t65 = element.ChildNodes,$l65 = $t65.length,c = $t65[$i65]; $i65 < $l65; $i65++, c = $t65[$i65]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "step":
                        step = c.get_InnerText();
                        break;
                    case "alter":
                        semitones = AlphaTab.Platform.Std.ParseFloat(c.get_InnerText());
                        if (isNaN(semitones)){
                        semitones = 0;
                    }
                        break;
                    case "octave":
                        octave = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
        var value = octave * 12 + AlphaTab.Model.TuningParser.GetToneForText(step) + semitones | 0;
        note.Octave = ((value / 12) | 0);
        note.Tone = value - (note.Octave * 12);
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
        for (var $i66 = 0,$t66 = element.ChildNodes,$l66 = $t66.length,c = $t66[$i66]; $i66 < $l66; $i66++, c = $t66[$i66]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "sound":
                        var tempo = c.GetAttribute("tempo");
                        if (!((tempo==null)||(tempo.length==0))){
                        var tempoAutomation = new AlphaTab.Model.Automation();
                        tempoAutomation.IsLinear = true;
                        tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
                        tempoAutomation.Value = AlphaTab.Platform.Std.ParseInt(tempo);
                        masterBar.TempoAutomation = tempoAutomation;
                    }
                        break;
                    case "direction-type":
                        var directionType = c.FirstElement;
                        switch (directionType.LocalName){
                            case "words":
                            masterBar.Section = new AlphaTab.Model.Section();
                            masterBar.Section.Text = directionType.get_InnerText();
                            break;
                            case "metronome":
                            this.ParseMetronome(c.FirstElement, masterBar);
                            break;
                        }
                        break;
                }
            }
        }
    },
    ParseMetronome: function (element, masterBar){
        var unit = AlphaTab.Model.Duration.Quarter;
        var perMinute = 120;
        for (var $i67 = 0,$t67 = element.ChildNodes,$l67 = $t67.length,c = $t67[$i67]; $i67 < $l67; $i67++, c = $t67[$i67]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "beat-unit":
                        unit = this.GetDuration(c.get_InnerText());
                        break;
                    case "per-minute":
                        perMinute = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
        var tempoAutomation = masterBar.TempoAutomation = new AlphaTab.Model.Automation();
        tempoAutomation.Type = AlphaTab.Model.AutomationType.Tempo;
        tempoAutomation.Value = perMinute * ((unit / 4) | 0);
    },
    ParseAttributes: function (element, bars, masterBar){
        var number;
        var hasTime = false;
        for (var $i68 = 0,$t68 = element.ChildNodes,$l68 = $t68.length,c = $t68[$i68]; $i68 < $l68; $i68++, c = $t68[$i68]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "divisions":
                        this._divisionsPerQuarterNote = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "key":
                        this.ParseKey(c, masterBar);
                        break;
                    case "time":
                        this.ParseTime(c, masterBar);
                        hasTime = true;
                        break;
                    case "clef":
                        number = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("number"));
                        if (number == -2147483648){
                        number = 1;
                    }
                        this.ParseClef(c, bars[number - 1]);
                        break;
                    case "staff-details":
                        number = AlphaTab.Platform.Std.ParseInt(c.GetAttribute("number"));
                        if (number == -2147483648){
                        number = 1;
                    }
                        this.ParseStaffDetails(c, bars[number - 1].Staff.Track);
                        break;
                }
            }
        }
        if (!hasTime){
            masterBar.TimeSignatureCommon = true;
        }
    },
    ParseClef: function (element, bar){
        var sign = null;
        var line = 0;
        for (var $i69 = 0,$t69 = element.ChildNodes,$l69 = $t69.length,c = $t69[$i69]; $i69 < $l69; $i69++, c = $t69[$i69]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "sign":
                        sign = c.get_InnerText();
                        break;
                    case "line":
                        line = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "clef-octave-change":
                        switch (AlphaTab.Platform.Std.ParseInt(c.get_InnerText())){
                            case -2:
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._15mb;
                            break;
                            case -1:
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._8vb;
                            break;
                            case 1:
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._8va;
                            break;
                            case 2:
                            bar.ClefOttavia = AlphaTab.Model.ClefOttavia._15mb;
                            break;
                        }
                        break;
                }
            }
        }
        switch (sign){
            case "G":
                bar.Clef = AlphaTab.Model.Clef.G2;
                break;
            case "F":
                bar.Clef = AlphaTab.Model.Clef.F4;
                break;
            case "C":
                if (line == 3){
                bar.Clef = AlphaTab.Model.Clef.C3;
            }
                else {
                bar.Clef = AlphaTab.Model.Clef.C4;
            }
                break;
            case "percussion":
                bar.Clef = AlphaTab.Model.Clef.Neutral;
                break;
            default:
                bar.Clef = AlphaTab.Model.Clef.G2;
                break;
        }
    },
    ParseTime: function (element, masterBar){
        if (element.GetAttribute("symbol") == "common"){
            masterBar.TimeSignatureCommon = true;
        }
        var beatsParsed = false;
        var beatTypeParsed = false;
        for (var $i70 = 0,$t70 = element.ChildNodes,$l70 = $t70.length,c = $t70[$i70]; $i70 < $l70; $i70++, c = $t70[$i70]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                var v = c.get_InnerText();
                switch (c.LocalName){
                    case "beats":
                        if (!beatsParsed){
                        if (!v.indexOf("+")!=-1){
                            masterBar.TimeSignatureNumerator = AlphaTab.Platform.Std.ParseInt(v);
                        }
                        else {
                            masterBar.TimeSignatureNumerator = 4;
                        }
                        beatsParsed = true;
                    }
                        break;
                    case "beat-type":
                        if (!beatTypeParsed){
                        if (!v.indexOf("+")!=-1){
                            masterBar.TimeSignatureDenominator = AlphaTab.Platform.Std.ParseInt(v);
                        }
                        else {
                            masterBar.TimeSignatureDenominator = 4;
                        }
                        beatTypeParsed = true;
                    }
                        break;
                }
            }
        }
    },
    ParseKey: function (element, masterBar){
        var fifths = -2147483648;
        var keyStep = -2147483648;
        var keyAlter = -2147483648;
        var mode = null;
        for (var $i71 = 0,$t71 = element.ChildNodes,$l71 = $t71.length,c = $t71[$i71]; $i71 < $l71; $i71++, c = $t71[$i71]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "fifths":
                        fifths = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "key-step":
                        keyStep = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "key-alter":
                        keyAlter = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "mode":
                        mode = c.get_InnerText();
                        break;
                }
            }
        }
        if (-7 <= fifths && fifths <= 7){
            // TODO: check if this is conrrect
            masterBar.KeySignature = fifths;
        }
        else {
            masterBar.KeySignature = 0;
            // TODO: map keyStep/keyAlter to internal keysignature
        }
        if (mode == "minor"){
            masterBar.KeySignatureType = AlphaTab.Model.KeySignatureType.Minor;
        }
        else {
            masterBar.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
        }
    },
    GetOrCreateMasterBar: function (index){
        if (index < this._score.MasterBars.length){
            return this._score.MasterBars[index];
        }
        for (var i = this._score.MasterBars.length; i <= index; i++){
            var mb = new AlphaTab.Model.MasterBar();
            if (this._score.MasterBars.length > 0){
                var prev = this._score.MasterBars[this._score.MasterBars.length - 1];
                mb.TimeSignatureDenominator = prev.TimeSignatureDenominator;
                mb.TimeSignatureNumerator = prev.TimeSignatureNumerator;
                mb.KeySignature = prev.KeySignature;
                mb.KeySignatureType = prev.KeySignatureType;
            }
            this._score.AddMasterBar(mb);
        }
        return this._score.MasterBars[index];
    },
    ParseIdentification: function (element){
        for (var $i72 = 0,$t72 = element.ChildNodes,$l72 = $t72.length,c = $t72[$i72]; $i72 < $l72; $i72++, c = $t72[$i72]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "creator":
                        if (c.GetAttribute("type") == "composer"){
                        this._score.Words = c.get_InnerText();
                    }
                        break;
                    case "rights":
                        if (!((this._score.Copyright==null)||(this._score.Copyright.length==0))){
                        this._score.Copyright += "\n";
                    }
                        this._score.Copyright += c.get_InnerText();
                        break;
                }
            }
        }
    },
    ParsePartList: function (element){
        for (var $i73 = 0,$t73 = element.ChildNodes,$l73 = $t73.length,c = $t73[$i73]; $i73 < $l73; $i73++, c = $t73[$i73]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "score-part":
                        this.ParseScorePart(c);
                        break;
                }
            }
        }
    },
    ParseScorePart: function (element){
        var id = element.GetAttribute("id");
        var track = new AlphaTab.Model.Track(1);
        this._trackById[id] = track;
        this._score.AddTrack(track);
        for (var $i74 = 0,$t74 = element.ChildNodes,$l74 = $t74.length,c = $t74[$i74]; $i74 < $l74; $i74++, c = $t74[$i74]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "part-name":
                        track.Name = c.get_InnerText();
                        break;
                    case "part-abbreviation":
                        track.ShortName = c.get_InnerText();
                        break;
                    case "midi-instrument":
                        this.ParseMidiInstrument(c, track);
                        break;
                }
            }
        }
        if (this.IsEmptyTuning(track.Tuning)){
            track.Tuning = new Int32Array(0);
        }
    },
    IsEmptyTuning: function (tuning){
        if (tuning == null){
            return true;
        }
        for (var i = 0; i < tuning.length; i++){
            if (tuning[i] != 0){
                return false;
            }
        }
        return true;
    },
    ParseMidiInstrument: function (element, track){
        for (var $i75 = 0,$t75 = element.ChildNodes,$l75 = $t75.length,c = $t75[$i75]; $i75 < $l75; $i75++, c = $t75[$i75]){
            if (c.NodeType == AlphaTab.Xml.XmlNodeType.Element){
                switch (c.LocalName){
                    case "midi-channel":
                        track.PlaybackInfo.PrimaryChannel = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "midi-program":
                        track.PlaybackInfo.Program = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                    case "midi-volume":
                        track.PlaybackInfo.Volume = AlphaTab.Platform.Std.ParseInt(c.get_InnerText());
                        break;
                }
            }
        }
    }
};
AlphaTab.Importer.MusicXmlImporter.ParseTied = function (element, note){
    if (note.Beat.GraceType != AlphaTab.Model.GraceType.None)
        return;
    if (element.GetAttribute("type") == "start"){
        note.IsTieOrigin = true;
    }
    else {
        note.IsTieDestination = true;
    }
};
$Inherit(AlphaTab.Importer.MusicXmlImporter, AlphaTab.Importer.ScoreImporter);
AlphaTab.Importer.NoCompatibleReaderFoundException = function (){
    AlphaTab.AlphaTabException.call(this, "");
};
$Inherit(AlphaTab.Importer.NoCompatibleReaderFoundException, AlphaTab.AlphaTabException);
AlphaTab.Importer.UnsupportedFormatException = function (message){
    AlphaTab.AlphaTabException.call(this, message);
};
$Inherit(AlphaTab.Importer.UnsupportedFormatException, AlphaTab.AlphaTabException);
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
        catch($$e7){
        }
        return all.ToArray();
    }
};
$StaticConstructor(function (){
    AlphaTab.IO.BitReader.ByteSize = 8;
});
AlphaTab.IO.EndOfReaderException = function (){
    AlphaTab.AlphaTabException.call(this, "");
};
$Inherit(AlphaTab.IO.EndOfReaderException, AlphaTab.AlphaTabException);
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
    this.Id = 0;
    this.Index = 0;
    this.NextBar = null;
    this.PreviousBar = null;
    this.Clef = AlphaTab.Model.Clef.Neutral;
    this.ClefOttavia = AlphaTab.Model.ClefOttavia._15ma;
    this.Staff = null;
    this.Voices = null;
    this.Id = AlphaTab.Model.Bar.GlobalBarId++;
    this.Voices = [];
    this.Clef = AlphaTab.Model.Clef.G2;
    this.ClefOttavia = AlphaTab.Model.ClefOttavia.Regular;
};
AlphaTab.Model.Bar.prototype = {
    AddVoice: function (voice){
        voice.Bar = this;
        voice.Index = this.Voices.length;
        this.Voices.push(voice);
    },
    get_MasterBar: function (){
        return this.Staff.Track.Score.MasterBars[this.Index];
    },
    get_IsEmpty: function (){
        for (var i = 0,j = this.Voices.length; i < j; i++){
            if (!this.Voices[i].IsEmpty){
                return false;
            }
        }
        return true;
    },
    Finish: function (){
        for (var i = 0,j = this.Voices.length; i < j; i++){
            var voice = this.Voices[i];
            voice.Finish();
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Bar.GlobalBarId = 0;
});
AlphaTab.Model.Bar.CopyTo = function (src, dst){
    dst.Id = src.Id;
    dst.Index = src.Index;
    dst.Clef = src.Clef;
    dst.ClefOttavia = src.ClefOttavia;
};
AlphaTab.Model.Beat = function (){
    this._minNote = null;
    this._maxNote = null;
    this._maxStringNote = null;
    this._minStringNote = null;
    this.PreviousBeat = null;
    this.NextBeat = null;
    this.Id = 0;
    this.Index = 0;
    this.Voice = null;
    this.Notes = null;
    this.IsEmpty = false;
    this.IsLegatoOrigin = false;
    this.Duration = AlphaTab.Model.Duration.QuadrupleWhole;
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
    this.MaxWhammyPoint = null;
    this.Vibrato = AlphaTab.Model.VibratoType.None;
    this.ChordId = null;
    this.GraceType = AlphaTab.Model.GraceType.None;
    this.PickStroke = AlphaTab.Model.PickStrokeType.None;
    this.TremoloSpeed = null;
    this.Crescendo = AlphaTab.Model.CrescendoType.None;
    this.Start = 0;
    this.Dynamic = AlphaTab.Model.DynamicValue.PPP;
    this.InvertBeamDirection = false;
    this.Id = AlphaTab.Model.Beat.GlobalBeatId++;
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
    this.InvertBeamDirection = false;
};
AlphaTab.Model.Beat.prototype = {
    get_IsLegatoDestination: function (){
        return this.PreviousBeat != null && this.PreviousBeat.IsLegatoOrigin;
    },
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
        return this.Voice.Bar.Staff.Track.Chords[this.ChordId];
    },
    get_IsTremolo: function (){
        return this.TremoloSpeed != null;
    },
    get_AbsoluteStart: function (){
        return this.Voice.Bar.get_MasterBar().Start + this.Start;
    },
    Clone: function (){
        var beat = new AlphaTab.Model.Beat();
        var id = beat.Id;
        for (var i = 0,j = this.WhammyBarPoints.length; i < j; i++){
            beat.AddWhammyBarPoint(this.WhammyBarPoints[i].Clone());
        }
        for (var i = 0,j = this.Notes.length; i < j; i++){
            beat.AddNote(this.Notes[i].Clone());
        }
        AlphaTab.Model.Beat.CopyTo(this, beat);
        for (var i = 0,j = this.Automations.length; i < j; i++){
            beat.Automations.push(this.Automations[i].Clone());
        }
        beat.Id = id;
        return beat;
    },
    AddWhammyBarPoint: function (point){
        this.WhammyBarPoints.push(point);
        if (this.MaxWhammyPoint == null || point.Value > this.MaxWhammyPoint.Value){
            this.MaxWhammyPoint = point;
        }
    },
    RemoveWhammyBarPoint: function (index){
        // check index
        if (index < 0 || index >= this.WhammyBarPoints.length)
            return;
        // remove point
        this.WhammyBarPoints.splice(index,1);
        var point = this.WhammyBarPoints[index];
        // update maxWhammy point if required
        if (point != this.MaxWhammyPoint)
            return;
        this.MaxWhammyPoint = null;
        for (var $i76 = 0,$t76 = this.WhammyBarPoints,$l76 = $t76.length,currentPoint = $t76[$i76]; $i76 < $l76; $i76++, currentPoint = $t76[$i76]){
            if (this.MaxWhammyPoint == null || currentPoint.Value > this.MaxWhammyPoint.Value){
                this.MaxWhammyPoint = currentPoint;
            }
        }
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
    RemoveNote: function (note){
        var index = this.Notes.indexOf(note);
        if (index >= 0){
            this.Notes.splice(index,1);
        }
        if (note == this._minNote || note == this._maxNote || note == this._minStringNote || note == this._maxStringNote){
            this.RefreshNotes();
        }
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
    AlphaTab.Model.Beat.GlobalBeatId = 0;
});
AlphaTab.Model.Beat.CopyTo = function (src, dst){
    dst.Id = src.Id;
    dst.Index = src.Index;
    dst.IsEmpty = src.IsEmpty;
    dst.Duration = src.Duration;
    dst.Dots = src.Dots;
    dst.FadeIn = src.FadeIn;
    if (src.Lyrics != null){
        dst.Lyrics = new Array(src.Lyrics.length);
        for (var i = 0; i < src.Lyrics.length; i++){
            dst.Lyrics[i] = src.Lyrics[i];
        }
    }
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
    dst.IsLegatoOrigin = src.IsLegatoOrigin;
    dst.InvertBeamDirection = src.InvertBeamDirection;
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
    this.BarreFrets = null;
    this.Strings = [];
    this.BarreFrets = [];
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
AlphaTab.Model.ClefOttavia = {
    _15ma: 0,
    _8va: 1,
    Regular: 2,
    _8vb: 3,
    _15mb: 4
};
AlphaTab.Model.CrescendoType = {
    None: 0,
    Crescendo: 1,
    Decrescendo: 2
};
AlphaTab.Model.Duration = {
    QuadrupleWhole: -4,
    DoubleWhole: -2,
    Whole: 1,
    Half: 2,
    Quarter: 4,
    Eighth: 8,
    Sixteenth: 16,
    ThirtySecond: 32,
    SixtyFourth: 64,
    OneHundredTwentyEighth: 128,
    TwoHundredFiftySixth: 256
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
AlphaTab.Model.Lyrics = function (){
    this.StartBar = 0;
    this.Text = null;
    this.Chunks = null;
};
AlphaTab.Model.Lyrics.prototype = {
    Finish: function (){
        var chunks = [];
        this.Parse(this.Text, 0, chunks);
        this.Chunks = chunks.slice(0);
    },
    Parse: function (str, p, chunks){
        if (((str==null)||(str.length==0)))
            return;
        var state = 1;
        var next = 1;
        var skipSpace = false;
        var start = 0;
        while (p < str.length){
            var c = str.charCodeAt(p);
            switch (state){
                case 0:
                    switch (c){
                        case 10:
                        case 13:
                        case 9:
                        break;
                        case 32:
                        if (!skipSpace){
                        state = next;
                        continue;
                    }
                        break;
                        default:
                        skipSpace = false;
                        state = next;
                        continue;
                    }
                    break;
                case 1:
                    switch (c){
                        case 91:
                        state = 3;
                        break;
                        default:
                        start = p;
                        state = 2;
                        continue;
                    }
                    break;
                case 3:
                    switch (c){
                        case 93:
                        state = 1;
                        break;
                    }
                    break;
                case 2:
                    switch (c){
                        case 45:
                        state = 4;
                        break;
                        case 13:
                        case 10:
                        case 32:
                        var txt = str.substr(start, p - start);
                        chunks.push(this.PrepareChunk(txt));
                        state = 0;
                        next = 1;
                        break;
                    }
                    break;
                case 4:
                    switch (c){
                        case 45:
                        break;
                        default:
                        var txt = str.substr(start, p - start);
                        chunks.push(this.PrepareChunk(txt));
                        skipSpace = true;
                        state = 0;
                        next = 1;
                        continue;
                    }
                    break;
            }
            p++;
        }
        if (state == 2){
            if (p != start){
                chunks.push(str.substr(start, p - start));
            }
        }
    },
    PrepareChunk: function (txt){
        return txt.replace("+"," ");
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Lyrics.CharCodeLF = "\n";
    AlphaTab.Model.Lyrics.CharCodeTab = "\t";
    AlphaTab.Model.Lyrics.CharCodeCR = "\r";
    AlphaTab.Model.Lyrics.CharCodeSpace = " ";
    AlphaTab.Model.Lyrics.CharCodeBrackedClose = "]";
    AlphaTab.Model.Lyrics.CharCodeBrackedOpen = "[";
    AlphaTab.Model.Lyrics.CharCodeDash = "-";
});
AlphaTab.Model.MasterBar = function (){
    this.AlternateEndings = 0;
    this.NextMasterBar = null;
    this.PreviousMasterBar = null;
    this.Index = 0;
    this.KeySignature = 0;
    this.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
    this.IsDoubleBar = false;
    this.IsRepeatStart = false;
    this.RepeatCount = 0;
    this.RepeatGroup = null;
    this.TimeSignatureNumerator = 0;
    this.TimeSignatureDenominator = 0;
    this.TimeSignatureCommon = false;
    this.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this.Section = null;
    this.TempoAutomation = null;
    this.VolumeAutomation = null;
    this.Score = null;
    this.Start = 0;
    this.TimeSignatureDenominator = 4;
    this.TimeSignatureNumerator = 4;
    this.TripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    this.KeySignatureType = AlphaTab.Model.KeySignatureType.Major;
    this.TimeSignatureCommon = false;
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
    dst.KeySignatureType = src.KeySignatureType;
    dst.IsDoubleBar = src.IsDoubleBar;
    dst.IsRepeatStart = src.IsRepeatStart;
    dst.RepeatCount = src.RepeatCount;
    dst.TimeSignatureNumerator = src.TimeSignatureNumerator;
    dst.TimeSignatureDenominator = src.TimeSignatureDenominator;
    dst.TimeSignatureCommon = src.TimeSignatureCommon;
    dst.TripletFeel = src.TripletFeel;
    dst.Start = src.Start;
};
AlphaTab.Model.ModelUtils = function (){
};
AlphaTab.Model.ModelUtils.GetIndex = function (duration){
    var index = 0;
    var value = duration;
    if (value < 0){
        return index;
    }
    return (Math.log2(duration)) | 0;
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
AlphaTab.Model.ModelUtils.ApplyPitchOffsets = function (settings, score){
    for (var i = 0; i < score.Tracks.length; i++){
        if (i < settings.DisplayTranspositionPitches.length){
            score.Tracks[i].DisplayTranspositionPitch = -settings.DisplayTranspositionPitches[i];
        }
        if (i < settings.TranspositionPitches.length){
            score.Tracks[i].TranspositionPitch = -settings.TranspositionPitches[i];
        }
    }
};
AlphaTab.Model.NoteAccidentalMode = {
    Default: 0,
    SwapAccidentals: 1,
    ForceNatural: 2,
    ForceSharp: 3,
    ForceFlat: 4
};
AlphaTab.Model.Note = function (){
    this.Id = 0;
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
    this.TrillSpeed = AlphaTab.Model.Duration.QuadrupleWhole;
    this.DurationPercent = 0;
    this.AccidentalMode = AlphaTab.Model.NoteAccidentalMode.Default;
    this.Beat = null;
    this.Dynamic = AlphaTab.Model.DynamicValue.PPP;
    this.Id = AlphaTab.Model.Note.GlobalNoteId++;
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
        if (this.get_IsStringed())
            return false;
        return this.Octave >= 0 && this.Tone >= 0;
    },
    get_IsPercussion: function (){
        if (this.get_IsStringed())
            return false;
        return this.Element >= 0 && this.Variation >= 0;
    },
    get_IsHammerPullDestination: function (){
        return this.HammerPullOrigin != null;
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
        return this.Beat.Voice.Bar.Staff.Track.Capo + AlphaTab.Model.Note.GetStringTuning(this.Beat.Voice.Bar.Staff.Track, this.String);
    },
    get_RealValue: function (){
        if (this.get_IsPercussion()){
            return AlphaTab.Rendering.Utils.PercussionMapper.MidiFromElementVariation(this);
        }
        if (this.get_IsStringed()){
            return this.Fret + this.get_StringTuning() - this.Beat.Voice.Bar.Staff.Track.TranspositionPitch;
        }
        if (this.get_IsPiano()){
            return this.Octave * 12 + this.Tone - this.Beat.Voice.Bar.Staff.Track.TranspositionPitch;
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
                this.Octave = this.TieOrigin.Octave;
                this.Tone = this.TieOrigin.Tone;
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
    AlphaTab.Model.Note.GlobalNoteId = 0;
    AlphaTab.Model.Note.MaxOffsetForSameLineSearch = 3;
});
AlphaTab.Model.Note.GetStringTuning = function (track, noteString){
    if (track.Tuning.length > 0)
        return track.Tuning[track.Tuning.length - (noteString - 1) - 1];
    return 0;
};
AlphaTab.Model.Note.CopyTo = function (src, dst){
    dst.Id = src.Id;
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
    this.Album = this.Artist = this.Copyright = this.Instructions = this.Music = this.Notices = this.SubTitle = this.Title = this.Words = this.Tab = this.TempoLabel = "";
    this.Tempo = 120;
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
    this.Text = this.Marker = "";
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
AlphaTab.Model.Staff = function (){
    this.Bars = null;
    this.Track = null;
    this.Index = 0;
    this.Bars = [];
};
AlphaTab.Model.Staff.prototype = {
    Finish: function (){
        for (var i = 0,j = this.Bars.length; i < j; i++){
            this.Bars[i].Finish();
        }
    }
};
AlphaTab.Model.Track = function (staveCount){
    this.Capo = 0;
    this.TranspositionPitch = 0;
    this.DisplayTranspositionPitch = 0;
    this.Index = 0;
    this.Name = null;
    this.ShortName = null;
    this.Tuning = null;
    this.TuningName = null;
    this.Color = null;
    this.PlaybackInfo = null;
    this.IsPercussion = false;
    this.Score = null;
    this.Staves = null;
    this.Chords = null;
    this.Name = "";
    this.ShortName = "";
    this.Tuning = new Int32Array(0);
    this.Chords = {};
    this.PlaybackInfo = new AlphaTab.Model.PlaybackInformation();
    this.Color = new AlphaTab.Platform.Model.Color(200, 0, 0, 255);
    this.Staves = [];
    this.EnsureStaveCount(staveCount);
};
AlphaTab.Model.Track.prototype = {
    get_IsStringed: function (){
        return this.Tuning.length > 0;
    },
    EnsureStaveCount: function (staveCount){
        while (this.Staves.length < staveCount){
            var staff = new AlphaTab.Model.Staff();
            staff.Index = this.Staves.length;
            staff.Track = this;
            this.Staves.push(staff);
        }
    },
    AddBarToStaff: function (staffIndex, bar){
        var staff = this.Staves[staffIndex];
        var bars = staff.Bars;
        bar.Staff = staff;
        bar.Index = bars.length;
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
        for (var i = 0,j = this.Staves.length; i < j; i++){
            this.Staves[i].Finish();
        }
    },
    ApplyLyrics: function (lyrics){
        for (var $i77 = 0,$l77 = lyrics.length,lyric = lyrics[$i77]; $i77 < $l77; $i77++, lyric = lyrics[$i77]){
            lyric.Finish();
        }
        var staff = this.Staves[0];
        for (var li = 0; li < lyrics.length; li++){
            var lyric = lyrics[li];
            if (lyric.StartBar >= 0){
                var beat = staff.Bars[lyric.StartBar].Voices[0].Beats[0];
                for (var ci = 0; ci < lyric.Chunks.length && beat != null; ci++){
                    // skip rests and empty beats
                    while (beat != null && (beat.IsEmpty || beat.get_IsRest())){
                        beat = beat.NextBeat;
                    }
                    // mismatch between chunks and beats might lead to missing beats
                    if (beat != null){
                        // initialize lyrics list for beat if required
                        if (beat.Lyrics == null){
                            beat.Lyrics = new Array(lyrics.length);
                        }
                        // assign chunk
                        beat.Lyrics[li] = lyric.Chunks[ci];
                        beat = beat.NextBeat;
                    }
                }
            }
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Model.Track.ShortNameMaxLength = 10;
});
AlphaTab.Model.Track.CopyTo = function (src, dst){
    dst.Name = src.Name;
    dst.Capo = src.Capo;
    dst.Index = src.Index;
    dst.ShortName = src.ShortName;
    dst.Tuning = new Int32Array(src.Tuning);
    dst.Color.Raw = src.Color.Raw;
    dst.Color.RGBA = src.Color.RGBA;
    dst.IsPercussion = src.IsPercussion;
    dst.TranspositionPitch = src.TranspositionPitch;
    dst.DisplayTranspositionPitch = src.DisplayTranspositionPitch;
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
AlphaTab.Model.Tuning.GetTextForTuning = function (tuning, includeOctave){
    var octave = (tuning / 12) | 0;
    var note = tuning % 12;
    var notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    var result = notes[note];
    if (includeOctave){
        result += (octave - 1);
    }
    return result;
};
AlphaTab.Model.Tuning.GetDefaultTuningFor = function (stringCount){
    if (AlphaTab.Model.Tuning._defaultTunings.hasOwnProperty(stringCount))
        return AlphaTab.Model.Tuning._defaultTunings[stringCount];
    return null;
};
AlphaTab.Model.Tuning.GetPresetsFor = function (stringCount){
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
$StaticConstructor(function (){
    AlphaTab.Model.Tuning._sevenStrings = null;
    AlphaTab.Model.Tuning._sixStrings = null;
    AlphaTab.Model.Tuning._fiveStrings = null;
    AlphaTab.Model.Tuning._fourStrings = null;
    AlphaTab.Model.Tuning._defaultTunings = null;
    AlphaTab.Model.Tuning.Initialize();
});
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
AlphaTab.Model.TuningParseResult = function (){
    this.Note = null;
    this.NoteValue = 0;
    this.Octave = 0;
};
AlphaTab.Model.TuningParseResult.prototype = {
    get_RealValue: function (){
        return (this.Octave * 12) + this.NoteValue;
    }
};
AlphaTab.Model.TuningParser = function (){
};
AlphaTab.Model.TuningParser.IsTuning = function (name){
    return AlphaTab.Model.TuningParser.Parse(name) != null;
};
AlphaTab.Model.TuningParser.Parse = function (name){
    var note = "";
    var octave = "";
    for (var i = 0; i < name.length; i++){
        var c = name.charCodeAt(i);
        if (AlphaTab.Platform.Std.IsCharNumber(c, false)){
            // number without note?
            if (((note==null)||(note.length==0))){
                return null;
            }
            octave += String.fromCharCode(c);
        }
        else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c == 35){
            note += String.fromCharCode(c);
        }
        else {
            return null;
        }
    }
    if (((octave==null)||(octave.length==0)) || ((note==null)||(note.length==0))){
        return null;
    }
    var result = new AlphaTab.Model.TuningParseResult();
    result.Octave = AlphaTab.Platform.Std.ParseInt(octave) + 1;
    result.Note = note.toLowerCase();
    result.NoteValue = AlphaTab.Model.TuningParser.GetToneForText(result.Note);
    return result;
};
AlphaTab.Model.TuningParser.GetTuningForText = function (str){
    var result = AlphaTab.Model.TuningParser.Parse(str);
    if (result == null){
        return -1;
    }
    return result.get_RealValue();
};
AlphaTab.Model.TuningParser.GetToneForText = function (note){
    var b;
    switch (note.toLowerCase()){
        case "c":
            b = 0;
            break;
        case "c#":
        case "db":
            b = 1;
            break;
        case "d":
            b = 2;
            break;
        case "d#":
        case "eb":
            b = 3;
            break;
        case "e":
            b = 4;
            break;
        case "f":
            b = 5;
            break;
        case "f#":
        case "gb":
            b = 6;
            break;
        case "g":
            b = 7;
            break;
        case "g#":
        case "ab":
            b = 8;
            break;
        case "a":
            b = 9;
            break;
        case "a#":
        case "bb":
            b = 10;
            break;
        case "b":
            b = 11;
            break;
        default:
            return 0;
    }
    return b;
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
    this.IsEmpty = false;
    this.Beats = [];
    this.IsEmpty = true;
};
AlphaTab.Model.Voice.prototype = {
    AddBeat: function (beat){
        // chaining
        beat.Voice = this;
        beat.Index = this.Beats.length;
        this.Beats.push(beat);
        if (!beat.IsEmpty){
            this.IsEmpty = false;
        }
    },
    Chain: function (beat){
        if (this.Bar == null)
            return;
        if (beat.Index < this.Beats.length - 1){
            beat.NextBeat = this.Beats[beat.Index + 1];
            beat.NextBeat.PreviousBeat = beat;
        }
        else if (beat.Index == beat.Voice.Beats.length - 1 && beat.Voice.Bar.NextBar != null){
            var nextVoice = this.Bar.NextBar.Voices[this.Index];
            if (nextVoice.Beats.length > 0){
                beat.NextBeat = nextVoice.Beats[0];
                beat.NextBeat.PreviousBeat = beat;
            }
            else {
                beat.NextBeat.PreviousBeat = beat;
            }
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
        this.IsEmpty = false;
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
        }
    }
};
AlphaTab.Model.Voice.CopyTo = function (src, dst){
    dst.Index = src.Index;
    dst.IsEmpty = src.IsEmpty;
};
AlphaTab.Platform.Model = AlphaTab.Platform.Model || {};
AlphaTab.Platform.Model.Color = function (r, g, b, a){
    this.Raw = 0;
    this.RGBA = null;
    this.Raw = (a << 24) | (r << 16) | (g << 8) | b;
    if (this.get_A() == 255){
        this.RGBA = "#" + AlphaTab.Platform.Std.ToHexString(this.get_R(), 2) + AlphaTab.Platform.Std.ToHexString(this.get_G(), 2) + AlphaTab.Platform.Std.ToHexString(this.get_B(), 2);
    }
    else {
        this.RGBA = "rgba(" + this.get_R() + "," + this.get_G() + "," + this.get_B() + "," + (this.get_A() / 255) + ")";
    }
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
    }
};
$StaticConstructor(function (){
    AlphaTab.Platform.Model.Color.BlackRgb = "#000000";
});
AlphaTab.Platform.Model.FontStyle = {
    Plain: 0,
    Bold: 1,
    Italic: 2
};
AlphaTab.Platform.Model.Font = function (family, size, style){
    this._css = null;
    this.Family = null;
    this.Size = 0;
    this.Style = AlphaTab.Platform.Model.FontStyle.Plain;
    this.Family = family;
    this.Size = size;
    this.Style = style;
    this._css = this.ToCssString(1);
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
    ToCssString: function (scale){
        if (this._css != null && scale == 1){
            return this._css;
        }
        var buf = new String();
        if (this.get_IsBold()){
            buf+="bold ";
        }
        if (this.get_IsItalic()){
            buf+="italic ";
        }
        buf+=this.Size * scale;
        buf+="px ";
        buf+="\'";
        buf+=this.Family;
        buf+="\'";
        return buf;
    }
};
AlphaTab.Platform.Model.TextAlign = {
    Left: 0,
    Center: 1,
    Right: 2
};
AlphaTab.Platform.Model.TextBaseline = {
    Top: 0,
    Middle: 1,
    Bottom: 2
};
AlphaTab.Platform.Svg = AlphaTab.Platform.Svg || {};
AlphaTab.Platform.Svg.FontSizes = function (){
};
$StaticConstructor(function (){
    AlphaTab.Platform.Svg.FontSizes.TimesNewRoman = new Uint8Array([3, 4, 5, 6, 6, 9, 9, 2, 4, 4, 6, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 5, 10, 8, 7, 7, 8, 7, 6, 7, 8, 4, 4, 8, 7, 10, 8, 8, 7, 8, 7, 5, 8, 8, 7, 11, 8, 8, 7, 4, 3, 4, 5, 6, 4, 5, 5, 5, 5, 5, 4, 5, 6, 3, 3, 6, 3, 9, 6, 6, 6, 5, 4, 4, 4, 5, 6, 7, 6, 6, 5, 5, 2, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 2, 5, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 3, 3, 4, 5, 5, 4, 4, 3, 3, 6, 8, 8, 8, 5, 8, 8, 8, 8, 8, 8, 11, 7, 7, 7, 7, 7, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 6, 8, 8, 8, 8, 8, 8, 6, 5, 5, 5, 5, 5, 5, 5, 8, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 6, 6]);
    AlphaTab.Platform.Svg.FontSizes.Arial11Pt = new Uint8Array([3, 3, 4, 6, 6, 10, 7, 2, 4, 4, 4, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 11, 7, 7, 8, 8, 7, 7, 9, 8, 3, 6, 7, 6, 9, 8, 9, 7, 9, 8, 7, 7, 8, 7, 10, 7, 7, 7, 3, 3, 3, 5, 6, 4, 6, 6, 6, 6, 6, 3, 6, 6, 2, 2, 6, 2, 9, 6, 6, 6, 6, 4, 6, 3, 6, 6, 8, 6, 6, 6, 4, 3, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 3, 6, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 4, 4, 4, 6, 6, 4, 4, 4, 4, 6, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 11, 8, 7, 7, 7, 7, 3, 3, 3, 3, 8, 8, 9, 9, 9, 9, 9, 6, 9, 8, 8, 8, 8, 7, 7, 7, 6, 6, 6, 6, 6, 6, 10, 6, 6, 6, 6, 6, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6]);
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
    this.Buffer = null;
    this._currentPath = null;
    this._currentPathIsEmpty = false;
    this._Color = null;
    this._LineWidth = 0;
    this._Font = null;
    this._TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
    this._TextBaseline = AlphaTab.Platform.Model.TextBaseline.Top;
    this._Resources = null;
    this._currentPath = new String();
    this._currentPathIsEmpty = true;
    this.set_Color(new AlphaTab.Platform.Model.Color(255, 255, 255, 255));
    this.set_LineWidth(1);
    this.set_Font(new AlphaTab.Platform.Model.Font("Arial", 10, AlphaTab.Platform.Model.FontStyle.Plain));
    this.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
    this.set_TextBaseline(AlphaTab.Platform.Model.TextBaseline.Top);
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
        this.Buffer = new String();
        this.Buffer+="<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"";
        this.Buffer+=width;
        this.Buffer+="px\" height=\"";
        this.Buffer+=height;
        this.Buffer+="px\" class=\"alphaTabSurfaceSvg\">\n";
        this._currentPath = new String();
        this._currentPathIsEmpty = true;
    },
    BeginGroup: function (identifier){
        this.Buffer+="<g class=\"" + identifier + "\">";
    },
    EndGroup: function (){
        this.Buffer+="</g>";
    },
    EndRender: function (){
        this.Buffer+="</svg>";
        return this.Buffer;
    },
    FillRect: function (x, y, w, h){
        if (w > 0){
            this.Buffer+="<rect x=\"" + (x | 0 - 0.5) + "\" y=\"" + (y | 0 - 0.5) + "\" width=\"" + w + "\" height=\"" + h + "\" fill=\"" + this.get_Color().RGBA + "\" />\n";
        }
    },
    StrokeRect: function (x, y, w, h){
        this.Buffer+="<rect x=\"" + (x | 0 - 0.5) + "\" y=\"" + (y | 0 - 0.5) + "\" width=\"" + w + "\" height=\"" + h + "\" stroke=\"" + this.get_Color().RGBA + "\"";
        if (this.get_LineWidth() != 1){
            this.Buffer+=" stroke-width=\"" + this.get_LineWidth() + "\"";
        }
        this.Buffer+=" fill=\"transparent\" />\n";
    },
    BeginPath: function (){
    },
    ClosePath: function (){
        this._currentPath+=" z";
    },
    MoveTo: function (x, y){
        this._currentPath+=" M" + (x - 0.5) + "," + (y - 0.5);
    },
    LineTo: function (x, y){
        this._currentPathIsEmpty = false;
        this._currentPath+=" L" + (x - 0.5) + "," + (y - 0.5);
    },
    QuadraticCurveTo: function (cpx, cpy, x, y){
        this._currentPathIsEmpty = false;
        this._currentPath+=" Q" + cpx + "," + cpy + "," + x + "," + y;
    },
    BezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y){
        this._currentPathIsEmpty = false;
        this._currentPath+=" C" + cp1x + "," + cp1y + "," + cp2x + "," + cp2y + "," + x + "," + y;
    },
    FillCircle: function (x, y, radius){
        this._currentPathIsEmpty = false;
        // 
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath+=" M" + (x - radius) + "," + y + " A1,1 0 0,0 " + (x + radius) + "," + y + " A1,1 0 0,0 " + (x - radius) + "," + y + " z";
        this.Fill();
    },
    Fill: function (){
        if (!this._currentPathIsEmpty){
            this.Buffer+="<path d=\"" + this._currentPath + "\"";
            if (this.get_Color().RGBA != "#000000"){
                this.Buffer+=" fill=\"" + this.get_Color().RGBA + "\"";
            }
            this.Buffer+=" stroke=\"none\"/>";
        }
        this._currentPath = new String();
        this._currentPathIsEmpty = true;
    },
    Stroke: function (){
        if (!this._currentPathIsEmpty){
            var s = "<path d=\"" + this._currentPath + "\" stroke=\"" + this.get_Color().RGBA + "\"";
            if (this.get_LineWidth() != 1){
                s += " stroke-width=\"" + this.get_LineWidth() + "\"";
            }
            s += " fill=\"none\" />";
            this.Buffer+=s;
        }
        this._currentPath = new String();
        this._currentPathIsEmpty = true;
    },
    FillText: function (text, x, y){
        var s = "<text x=\"" + (x | 0) + "\" y=\"" + (y | 0) + "\" style=\"font:" + this.get_Font().ToCssString(1) + "\" " + " dominant-baseline=\"" + this.GetSvgBaseLine() + "\"";
        if (this.get_Color().RGBA != "#000000"){
            s += " fill=\"" + this.get_Color().RGBA + "\"";
        }
        if (this.get_TextAlign() != AlphaTab.Platform.Model.TextAlign.Left){
            s += " text-anchor=\"" + this.GetSvgTextAlignment() + "\"";
        }
        s += ">" + text + "</text>";
        this.Buffer+=s;
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
    GetSvgBaseLine: function (){
        switch (this.get_TextBaseline()){
            case AlphaTab.Platform.Model.TextBaseline.Top:
                return "hanging";
            case AlphaTab.Platform.Model.TextBaseline.Middle:
                return "middle";
            case AlphaTab.Platform.Model.TextBaseline.Bottom:
                return "bottom";
            default:
                return "";
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
    OnPreRender: function (){
        // nothing to do
        return null;
    },
    OnRenderFinished: function (){
        // nothing to do
        return null;
    }
};
$StaticConstructor(function (){
    AlphaTab.Platform.Svg.SvgCanvas.BlurCorrection = 0.5;
});
AlphaTab.Platform.Svg.CssFontSvgCanvas = function (){
    AlphaTab.Platform.Svg.SvgCanvas.call(this);
};
AlphaTab.Platform.Svg.CssFontSvgCanvas.prototype = {
    FillMusicFontSymbol: function (x, y, scale, symbol){
        this.Buffer+="<g transform=\"translate(" + (x | 0 - 0.5) + " " + (y | 0 - 0.5) + ")\" class=\"at\" ><text";
        //Buffer.Append("<svg x=\"" + ((int) x - BlurCorrection) + "\" y=\"" + ((int) y - BlurCorrection) +
        //              "\" class=\"at\" >");
        if (scale != 1){
            this.Buffer+="  style=\"font-size: " + (scale * 100) + "%\"";
        }
        if (this.get_Color().RGBA != "#000000"){
            this.Buffer+=" fill=\"" + this.get_Color().RGBA + "\"";
        }
        //Buffer.Append(">&#" + (int)symbol + ";</text></svg>");
        this.Buffer+=">&#" + symbol + ";</text></g>";
    }
};
$Inherit(AlphaTab.Platform.Svg.CssFontSvgCanvas, AlphaTab.Platform.Svg.SvgCanvas);
AlphaTab.Rendering.BarRendererBase = function (renderer, bar){
    this._preBeatGlyphs = null;
    this._voiceContainers = null;
    this._postBeatGlyphs = null;
    this._wasFirstOfLine = false;
    this._appliedLayoutingInfo = 0;
    this.Staff = null;
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Height = 0;
    this.Index = 0;
    this.TopOverflow = 0;
    this.BottomOverflow = 0;
    this.Helpers = null;
    this.Bar = null;
    this.IsLinkedToPrevious = false;
    this.ScoreRenderer = null;
    this.LayoutingInfo = null;
    this.IsFinalized = false;
    this.TopPadding = 0;
    this.BottomPadding = 0;
    this.Bar = bar;
    this.ScoreRenderer = renderer;
    this.Helpers = new AlphaTab.Rendering.Utils.BarHelpers(bar);
};
AlphaTab.Rendering.BarRendererBase.prototype = {
    get_NextRenderer: function (){
        if (this.Bar.NextBar == null){
            return null;
        }
        return this.ScoreRenderer.Layout.GetRendererForBar(this.Staff.get_StaveId(), this.Bar.NextBar);
    },
    get_PreviousRenderer: function (){
        if (this.Bar.PreviousBar == null){
            return null;
        }
        return this.ScoreRenderer.Layout.GetRendererForBar(this.Staff.get_StaveId(), this.Bar.PreviousBar);
    },
    RegisterOverflowTop: function (topOverflow){
        if (topOverflow > this.TopOverflow)
            this.TopOverflow = topOverflow;
    },
    RegisterOverflowBottom: function (bottomOverflow){
        if (bottomOverflow > this.BottomOverflow)
            this.BottomOverflow = bottomOverflow;
    },
    ScaleToWidth: function (width){
        // preBeat and postBeat glyphs do not get resized
        var containerWidth = width - this._preBeatGlyphs.Width - this._postBeatGlyphs.Width;
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.ScaleToWidth(containerWidth);
        }
        this._postBeatGlyphs.X = this._preBeatGlyphs.X + this._preBeatGlyphs.Width + containerWidth;
        this.Width = width;
    },
    get_Resources: function (){
        return this.ScoreRenderer.RenderingResources;
    },
    get_Settings: function (){
        return this.ScoreRenderer.Settings;
    },
    get_Scale: function (){
        return this.get_Settings().Scale;
    },
    get_IsFirstOfLine: function (){
        return this.Index == 0;
    },
    get_IsLast: function (){
        return this.Staff.StaveGroup.IsLast && this.Index == this.Staff.BarRenderers.length - 1;
    },
    RegisterLayoutingInfo: function (){
        var info = this.LayoutingInfo;
        var preSize = this._preBeatGlyphs.Width;
        if (info.PreBeatSize < preSize){
            info.PreBeatSize = preSize;
        }
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.RegisterLayoutingInfo(info);
        }
        var postSize = this._postBeatGlyphs.Width;
        if (info.PostBeatSize < postSize){
            info.PostBeatSize = postSize;
        }
    },
    ApplyLayoutingInfo: function (){
        if (this._appliedLayoutingInfo >= this.LayoutingInfo.Version){
            return false;
        }
        this._appliedLayoutingInfo = this.LayoutingInfo.Version;
        // if we need additional space in the preBeat group we simply
        // add a new spacer
        this._preBeatGlyphs.Width = this.LayoutingInfo.PreBeatSize;
        // on beat glyphs we apply the glyph spacing
        var voiceEnd = this._preBeatGlyphs.X + this._preBeatGlyphs.Width;
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            c.X = this._preBeatGlyphs.X + this._preBeatGlyphs.Width;
            c.ApplyLayoutingInfo(this.LayoutingInfo);
            var newEnd = c.X + c.Width;
            if (voiceEnd < newEnd){
                voiceEnd = newEnd;
            }
        }
        // on the post glyphs we add the spacing before all other glyphs
        this._postBeatGlyphs.X = voiceEnd;
        this._postBeatGlyphs.Width = this.LayoutingInfo.PostBeatSize;
        this.Width = this._postBeatGlyphs.X + this._postBeatGlyphs.Width;
        return true;
    },
    FinalizeRenderer: function (){
        this.IsFinalized = true;
    },
    DoLayout: function (){
        this._preBeatGlyphs = new AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup();
        this._preBeatGlyphs.Renderer = this;
        this._voiceContainers = {};
        this._postBeatGlyphs = new AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup();
        this._postBeatGlyphs.Renderer = this;
        for (var i = 0; i < this.Bar.Voices.length; i++){
            var voice = this.Bar.Voices[i];
            if (this.HasVoiceContainer(voice)){
                var c = new AlphaTab.Rendering.Glyphs.VoiceContainerGlyph(0, 0, voice);
                c.Renderer = this;
                this._voiceContainers[this.Bar.Voices[i].Index] = c;
            }
        }
        this.CreatePreBeatGlyphs();
        this.CreateBeatGlyphs();
        this.CreatePostBeatGlyphs();
        this.UpdateSizes();
    },
    HasVoiceContainer: function (voice){
        return !voice.IsEmpty || voice.Index == 0;
    },
    UpdateSizes: function (){
        this.Staff.RegisterStaffTop(this.TopPadding);
        this.Staff.RegisterStaffBottom(this.Height - this.BottomPadding);
        var voiceContainers = this._voiceContainers;
        var beatGlyphsStart = this.get_BeatGlyphsStart();
        var postBeatStart = beatGlyphsStart;
        for (var voice in voiceContainers){
            var c = voiceContainers[voice];
            c.X = beatGlyphsStart;
            c.DoLayout();
            var x = c.X + c.Width;
            if (postBeatStart < x){
                postBeatStart = x;
            }
        }
        this._postBeatGlyphs.X = postBeatStart;
        this.Width = this._postBeatGlyphs.X + this._postBeatGlyphs.Width;
    },
    AddPreBeatGlyph: function (g){
        this._preBeatGlyphs.AddGlyph(g);
    },
    AddBeatGlyph: function (g){
        g.Renderer = this;
        g.PreNotes.Renderer = this;
        g.OnNotes.Renderer = this;
        g.OnNotes.BeamingHelper = this.Helpers.BeamHelperLookup[g.Beat.Voice.Index][g.Beat.Index];
        this.GetOrCreateVoiceContainer(g.Beat.Voice).AddGlyph(g);
    },
    GetOrCreateVoiceContainer: function (voice){
        return this._voiceContainers[voice.Index];
    },
    GetBeatContainer: function (beat){
        return this.GetOrCreateVoiceContainer(beat.Voice).BeatGlyphs[beat.Index];
    },
    GetPreNotesGlyphForBeat: function (beat){
        return this.GetBeatContainer(beat).PreNotes;
    },
    GetOnNotesGlyphForBeat: function (beat){
        return this.GetBeatContainer(beat).OnNotes;
    },
    Paint: function (cx, cy, canvas){
        this.PaintBackground(cx, cy, canvas);
        canvas.set_Color(this.get_Resources().MainGlyphColor);
        this._preBeatGlyphs.Paint(cx + this.X, cy + this.Y, canvas);
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            canvas.set_Color(c.Voice.Index == 0 ? this.get_Resources().MainGlyphColor : this.get_Resources().SecondaryGlyphColor);
            c.Paint(cx + this.X, cy + this.Y, canvas);
        }
        canvas.set_Color(this.get_Resources().MainGlyphColor);
        this._postBeatGlyphs.Paint(cx + this.X, cy + this.Y, canvas);
    },
    PaintBackground: function (cx, cy, canvas){
        //var c = new Color((byte)Std.Random(255),
        //      (byte)Std.Random(255),
        //      (byte)Std.Random(255),
        //      100);
        //canvas.Color = c;
        //canvas.FillRect(cx + X, cy + Y, Width, Height);
    },
    BuildBoundingsLookup: function (masterBarBounds, cx, cy){
        var barBounds = new AlphaTab.Rendering.Utils.BarBounds();
        barBounds.Bar = this.Bar;
        barBounds.VisualBounds = {
            X: cx + this.X,
            Y: cy + this.Y + this.TopPadding,
            W: this.Width,
            H: this.Height - this.TopPadding - this.BottomPadding
        };
        barBounds.RealBounds = {
            X: cx + this.X,
            Y: cy + this.Y,
            W: this.Width,
            H: this.Height
        };
        masterBarBounds.AddBar(barBounds);
        for (var voice in this._voiceContainers){
            var c = this._voiceContainers[voice];
            if (!c.Voice.IsEmpty || (this.Bar.get_IsEmpty() && voice == 0)){
                for (var i = 0,j = c.BeatGlyphs.length; i < j; i++){
                    var bc = c.BeatGlyphs[i];
                    var beatBoundings = new AlphaTab.Rendering.Utils.BeatBounds();
                    beatBoundings.Beat = bc.Beat;
                    beatBoundings.VisualBounds = {
                        X: cx + this.X + c.X + bc.X + bc.OnNotes.X,
                        Y: barBounds.VisualBounds.Y,
                        W: bc.OnNotes.Width,
                        H: barBounds.VisualBounds.H
                    };
                    beatBoundings.RealBounds = {
                        X: cx + this.X + c.X + bc.X,
                        Y: barBounds.RealBounds.Y,
                        W: bc.Width,
                        H: barBounds.RealBounds.H
                    };
                    barBounds.AddBeat(beatBoundings);
                }
            }
        }
    },
    AddPostBeatGlyph: function (g){
        this._postBeatGlyphs.AddGlyph(g);
    },
    CreatePreBeatGlyphs: function (){
        this._wasFirstOfLine = this.get_IsFirstOfLine();
    },
    CreateBeatGlyphs: function (){
    },
    CreatePostBeatGlyphs: function (){
        this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
    },
    get_BeatGlyphsStart: function (){
        return this._preBeatGlyphs.X + this._preBeatGlyphs.Width;
    },
    GetNoteX: function (note, onEnd){
        return 0;
    },
    GetBeatX: function (beat, requestedPosition){
        var container = this.GetBeatContainer(beat);
        if (container != null){
            switch (requestedPosition){
                case AlphaTab.Rendering.BeatXPosition.PreNotes:
                    return container.VoiceContainer.X + container.X + container.PreNotes.X;
                case AlphaTab.Rendering.BeatXPosition.OnNotes:
                    return container.VoiceContainer.X + container.X + container.OnNotes.X;
                case AlphaTab.Rendering.BeatXPosition.PostNotes:
                    return container.VoiceContainer.X + container.X + container.OnNotes.X + container.OnNotes.Width;
                case AlphaTab.Rendering.BeatXPosition.EndBeat:
                    return container.VoiceContainer.X + container.X + container.Width;
            }
        }
        return 0;
    },
    GetNoteY: function (note){
        return 0;
    },
    ReLayout: function (){
        // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
        // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
        if (this._wasFirstOfLine ^ this.get_IsFirstOfLine()){
            this._preBeatGlyphs = new AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup();
            this._preBeatGlyphs.Renderer = this;
            this.CreatePreBeatGlyphs();
        }
        this.UpdateSizes();
        this.RegisterLayoutingInfo();
    }
};
AlphaTab.Rendering.BeatXPosition = {
    PreNotes: 0,
    OnNotes: 1,
    PostNotes: 2,
    EndBeat: 3
};
AlphaTab.Rendering.BarRendererFactory = function (){
    this.IsInAccolade = false;
    this.HideOnMultiTrack = false;
    this.HideOnPercussionTrack = false;
    this.IsInAccolade = true;
    this.HideOnPercussionTrack = false;
    this.HideOnMultiTrack = false;
};
AlphaTab.Rendering.BarRendererFactory.prototype = {
    CanCreate: function (track, staff){
        return !this.HideOnPercussionTrack || !track.IsPercussion;
    }
};
AlphaTab.Rendering.EffectBarGlyphSizing = {
    SinglePreBeat: 0,
    SingleOnBeat: 1,
    GroupedBeforeBeat: 2,
    GroupedOnBeat: 3,
    FullBar: 4
};
AlphaTab.Rendering.Glyphs = AlphaTab.Rendering.Glyphs || {};
AlphaTab.Rendering.Glyphs.Glyph = function (x, y){
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Renderer = null;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.Glyph.prototype = {
    get_Scale: function (){
        return this.Renderer.get_Scale();
    },
    DoLayout: function (){
    },
    Paint: function (cx, cy, canvas){
    }
};
AlphaTab.Rendering.EffectBand = function (info){
    this._uniqueEffectGlyphs = null;
    this._effectGlyphs = null;
    this.IsEmpty = false;
    this.PreviousBand = null;
    this.IsLinkedToPrevious = false;
    this.FirstBeat = null;
    this.LastBeat = null;
    this.Height = 0;
    this.Info = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.Info = info;
    this._uniqueEffectGlyphs = [];
    this._effectGlyphs = [];
    this.IsEmpty = true;
};
AlphaTab.Rendering.EffectBand.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        for (var i = 0; i < this.Renderer.Bar.Voices.length; i++){
            this._effectGlyphs.push({});
            this._uniqueEffectGlyphs.push([]);
        }
    },
    CreateGlyph: function (beat){
        // NOTE: the track order will never change. even if the staff behind the renderer changes, the trackIndex will not. 
        // so it's okay to access the staff here while creating the glyphs. 
        if (this.Info.ShouldCreateGlyph(beat) && (!this.Info.get_HideOnMultiTrack() || this.Renderer.Staff.TrackIndex == 0)){
            this.IsEmpty = false;
            if (this.FirstBeat == null || this.FirstBeat.Index > beat.Index){
                this.FirstBeat = beat;
            }
            if (this.LastBeat == null || this.LastBeat.Index < beat.Index){
                this.LastBeat = beat;
            }
            var glyph = this.CreateOrResizeGlyph(this.Info.get_SizingMode(), beat);
            if (glyph.Height > this.Height){
                this.Height = glyph.Height;
            }
        }
    },
    CreateOrResizeGlyph: function (sizing, b){
        var g;
        switch (sizing){
            case AlphaTab.Rendering.EffectBarGlyphSizing.FullBar:
                g = this.Info.CreateNewGlyph(this.Renderer, b);
                g.Renderer = this.Renderer;
                g.Beat = b;
                g.DoLayout();
                this._effectGlyphs[b.Voice.Index][b.Index] = g;
                this._uniqueEffectGlyphs[b.Voice.Index].push(g);
                return g;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat:
                g = this.Info.CreateNewGlyph(this.Renderer, b);
                g.Renderer = this.Renderer;
                g.Beat = b;
                g.DoLayout();
                this._effectGlyphs[b.Voice.Index][b.Index] = g;
                this._uniqueEffectGlyphs[b.Voice.Index].push(g);
                return g;
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat:
                if (b.Index > 0 || this.Renderer.Index > 0){
                // check if the previous beat also had this effect
                var prevBeat = b.PreviousBeat;
                if (this.Info.ShouldCreateGlyph(prevBeat)){
                    // first load the effect bar renderer and glyph
                    var prevEffect = null;
                    if (b.Index > 0 && this._effectGlyphs[b.Voice.Index].hasOwnProperty(prevBeat.Index)){
                        // load effect from previous beat in the same renderer
                        prevEffect = this._effectGlyphs[b.Voice.Index][prevBeat.Index];
                    }
                    else if (this.Renderer.Index > 0){
                        // load the effect from the previous renderer if possible. 
                        var previousRenderer = this.Renderer.get_PreviousRenderer();
                        var previousBand = previousRenderer.BandLookup[this.Info.get_EffectId()];
                        var voiceGlyphs = previousBand._effectGlyphs[b.Voice.Index];
                        if (voiceGlyphs.hasOwnProperty(prevBeat.Index)){
                            prevEffect = voiceGlyphs[prevBeat.Index];
                        }
                    }
                    // if the effect cannot be expanded, create a new glyph
                    // in case of expansion also create a new glyph, but also link the glyphs together 
                    // so for rendering it might be expanded. 
                    var newGlyph = this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat, b);
                    if (prevEffect != null && this.Info.CanExpand(prevBeat, b)){
                        // link glyphs 
                        prevEffect.NextGlyph = newGlyph;
                        newGlyph.PreviousGlyph = prevEffect;
                        // mark renderers as linked for consideration when layouting the renderers (line breaking, partial breaking)
                        this.IsLinkedToPrevious = true;
                    }
                    return newGlyph;
                }
                // in case the previous beat did not have the same effect, we simply create a new glyph
                return this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat, b);
            }
                return this.CreateOrResizeGlyph(AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat, b);
        }
        return null;
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.Paint.call(this, cx, cy, canvas);
        //canvas.Color = new Color((byte)Std.Random(255), (byte)Std.Random(255), (byte)Std.Random(255), 100);
        //canvas.FillRect(cx + X, cy + Y, Renderer.Width, Height);
        for (var i = 0,j = this._uniqueEffectGlyphs.length; i < j; i++){
            var v = this._uniqueEffectGlyphs[i];
            //canvas.Color = i == 0
            //    ? Renderer.Resources.MainGlyphColor
            //    : Renderer.Resources.SecondaryGlyphColor;
            for (var k = 0,l = v.length; k < l; k++){
                var g = v[k];
                g.Paint(cx + this.X, cy + this.Y, canvas);
            }
        }
    },
    AlignGlyphs: function (){
        for (var v = 0; v < this._effectGlyphs.length; v++){
            for (var key in this._effectGlyphs[v]){
                this.AlignGlyph(this.Info.get_SizingMode(), this.Renderer.Bar.Voices[v].Beats[key]);
            }
        }
    },
    AlignGlyph: function (sizing, beat){
        var g = this._effectGlyphs[beat.Voice.Index][beat.Index];
        var pos;
        var container = this.Renderer.GetBeatContainer(beat);
        switch (sizing){
            case AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat:
                pos = container.PreNotes;
                g.X = this.Renderer.get_BeatGlyphsStart() + pos.X + container.X;
                g.Width = pos.Width;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat:
            case AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat:
                pos = container.OnNotes;
                g.X = this.Renderer.get_BeatGlyphsStart() + pos.X + container.X;
                g.Width = pos.Width;
                break;
            case AlphaTab.Rendering.EffectBarGlyphSizing.FullBar:
                g.Width = this.Renderer.Width;
                break;
        }
    }
};
$Inherit(AlphaTab.Rendering.EffectBand, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.EffectBandSizingInfo = function (){
    this._effectSlot = null;
    this.Slots = null;
    this.Slots = [];
    this._effectSlot = {};
};
AlphaTab.Rendering.EffectBandSizingInfo.prototype = {
    GetOrCreateSlot: function (band){
        // first check preferrable slot depending on type
        if (this._effectSlot.hasOwnProperty(band.Info.get_EffectId())){
            var slot = this._effectSlot[band.Info.get_EffectId()];
            if (slot.CanBeUsed(band)){
                return slot;
            }
        }
        // find any slot that can be used
        for (var $i78 = 0,$t78 = this.Slots,$l78 = $t78.length,slot = $t78[$i78]; $i78 < $l78; $i78++, slot = $t78[$i78]){
            if (slot.CanBeUsed(band)){
                return slot;
            }
        }
        // create a new slot if required
        var newSlot = new AlphaTab.Rendering.EffectBandSlot();
        this.Slots.push(newSlot);
        return newSlot;
    },
    CopySlots: function (sizingInfo){
        for (var $i79 = 0,$t79 = sizingInfo.Slots,$l79 = $t79.length,slot = $t79[$i79]; $i79 < $l79; $i79++, slot = $t79[$i79]){
            var copy = new AlphaTab.Rendering.EffectBandSlot();
            copy.Y = slot.Y;
            copy.Height = slot.Height;
            copy.UniqueEffectId = slot.UniqueEffectId;
            this.Slots.push(copy);
            for (var $i80 = 0,$t80 = slot.Bands,$l80 = $t80.length,band = $t80[$i80]; $i80 < $l80; $i80++, band = $t80[$i80]){
                this._effectSlot[band.Info.get_EffectId()] = copy;
            }
        }
    },
    Register: function (effectBand){
        var freeSlot = this.GetOrCreateSlot(effectBand);
        freeSlot.Update(effectBand);
        this._effectSlot[effectBand.Info.get_EffectId()] = freeSlot;
    }
};
AlphaTab.Rendering.EffectBandSlot = function (){
    this.Y = 0;
    this.Height = 0;
    this.FirstBeat = null;
    this.LastBeat = null;
    this.Bands = null;
    this.UniqueEffectId = null;
    this.Bands = [];
};
AlphaTab.Rendering.EffectBandSlot.prototype = {
    Update: function (effectBand){
        // lock band to particular effect if needed
        if (!effectBand.Info.get_CanShareBand()){
            this.UniqueEffectId = effectBand.Info.get_EffectId();
        }
        this.Bands.push(effectBand);
        if (effectBand.Height > this.Height){
            this.Height = effectBand.Height;
        }
        if (this.FirstBeat == null || this.FirstBeat.Index > effectBand.FirstBeat.Index){
            this.FirstBeat = effectBand.FirstBeat;
        }
        if (this.LastBeat == null || this.LastBeat.Index < effectBand.LastBeat.Index){
            this.LastBeat = effectBand.LastBeat;
        }
    },
    CanBeUsed: function (band){
        return ((this.UniqueEffectId == null && band.Info.get_CanShareBand()) || band.Info.get_EffectId() == this.UniqueEffectId) && (this.FirstBeat == null || this.LastBeat.Index < band.FirstBeat.Index || band.LastBeat.Index < this.FirstBeat.Index);
    }
};
AlphaTab.Rendering.EffectBarRenderer = function (renderer, bar, infos){
    this._infos = null;
    this._bands = null;
    this.BandLookup = null;
    this.SizingInfo = null;
    AlphaTab.Rendering.BarRendererBase.call(this, renderer, bar);
    this._infos = infos;
};
AlphaTab.Rendering.EffectBarRenderer.prototype = {
    UpdateSizes: function (){
        this.TopOverflow = 0;
        this.BottomOverflow = 0;
        this.TopPadding = 0;
        this.BottomPadding = 0;
        this.UpdateHeight();
        AlphaTab.Rendering.BarRendererBase.prototype.UpdateSizes.call(this);
    },
    UpdateHeight: function (){
        if (this.SizingInfo == null)
            return;
        var y = 0;
        for (var $i81 = 0,$t81 = this.SizingInfo.Slots,$l81 = $t81.length,slot = $t81[$i81]; $i81 < $l81; $i81++, slot = $t81[$i81]){
            slot.Y = y;
            for (var $i82 = 0,$t82 = slot.Bands,$l82 = $t82.length,band = $t82[$i82]; $i82 < $l82; $i82++, band = $t82[$i82]){
                band.Y = y;
                band.Height = slot.Height;
            }
            y += slot.Height;
        }
        this.Height = y;
    },
    ApplyLayoutingInfo: function (){
        if (!AlphaTab.Rendering.BarRendererBase.prototype.ApplyLayoutingInfo.call(this))
            return false;
        this.SizingInfo = new AlphaTab.Rendering.EffectBandSizingInfo();
        // we create empty slots for the same group
        if (this.Index > 0){
            var previousRenderer = this.get_PreviousRenderer();
            this.SizingInfo.CopySlots(previousRenderer.SizingInfo);
        }
        for (var $i83 = 0,$t83 = this._bands,$l83 = $t83.length,effectBand = $t83[$i83]; $i83 < $l83; $i83++, effectBand = $t83[$i83]){
            effectBand.AlignGlyphs();
            if (!effectBand.IsEmpty){
                // find a slot that ended before the start of the band
                this.SizingInfo.Register(effectBand);
            }
        }
        this.UpdateHeight();
        return true;
    },
    ScaleToWidth: function (width){
        AlphaTab.Rendering.BarRendererBase.prototype.ScaleToWidth.call(this, width);
        for (var $i84 = 0,$t84 = this._bands,$l84 = $t84.length,effectBand = $t84[$i84]; $i84 < $l84; $i84++, effectBand = $t84[$i84]){
            effectBand.AlignGlyphs();
        }
    },
    CreateBeatGlyphs: function (){
        this._bands = new Array(this._infos.length);
        this.BandLookup = {};
        for (var i = 0; i < this._infos.length; i++){
            this._bands[i] = new AlphaTab.Rendering.EffectBand(this._infos[i]);
            this._bands[i].Renderer = this;
            this._bands[i].DoLayout();
            this.BandLookup[this._infos[i].get_EffectId()] = this._bands[i];
        }
        for (var $i85 = 0,$t85 = this.Bar.Voices,$l85 = $t85.length,voice = $t85[$i85]; $i85 < $l85; $i85++, voice = $t85[$i85]){
            if (this.HasVoiceContainer(voice)){
                this.CreateVoiceGlyphs(voice);
            }
        }
        for (var $i86 = 0,$t86 = this._bands,$l86 = $t86.length,effectBand = $t86[$i86]; $i86 < $l86; $i86++, effectBand = $t86[$i86]){
            if (effectBand.IsLinkedToPrevious){
                this.IsLinkedToPrevious = true;
            }
        }
    },
    CreateVoiceGlyphs: function (v){
        for (var $i87 = 0,$t87 = v.Beats,$l87 = $t87.length,b = $t87[$i87]; $i87 < $l87; $i87++, b = $t87[$i87]){
            // we create empty glyphs as alignment references and to get the 
            // effect bar sized
            var container = new AlphaTab.Rendering.Glyphs.BeatContainerGlyph(b, this.GetOrCreateVoiceContainer(v));
            container.PreNotes = new AlphaTab.Rendering.Glyphs.BeatGlyphBase();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase();
            this.AddBeatGlyph(container);
            for (var $i88 = 0,$t88 = this._bands,$l88 = $t88.length,effectBand = $t88[$i88]; $i88 < $l88; $i88++, effectBand = $t88[$i88]){
                effectBand.CreateGlyph(b);
            }
        }
    },
    Paint: function (cx, cy, canvas){
        this.PaintBackground(cx, cy, canvas);
        canvas.set_Color(this.get_Resources().MainGlyphColor);
        for (var $i89 = 0,$t89 = this._bands,$l89 = $t89.length,effectBand = $t89[$i89]; $i89 < $l89; $i89++, effectBand = $t89[$i89]){
            effectBand.Paint(cx + this.X, cy + this.Y, canvas);
        }
        //canvas.Color = new Color(0, 0, 200, 100);
        //canvas.StrokeRect(cx + X, cy + Y, Width, Height);
    }
};
$Inherit(AlphaTab.Rendering.EffectBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.EffectBarRendererFactory = function (staffId, infos){
    this._infos = null;
    this._staffId = null;
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this._infos = infos;
    this._staffId = staffId;
    this.IsInAccolade = false;
};
AlphaTab.Rendering.EffectBarRendererFactory.prototype = {
    get_StaffId: function (){
        return this._staffId;
    },
    Create: function (renderer, bar, staveSettings){
        return new AlphaTab.Rendering.EffectBarRenderer(renderer, bar, this._infos);
    }
};
$Inherit(AlphaTab.Rendering.EffectBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.Effects = AlphaTab.Rendering.Effects || {};
AlphaTab.Rendering.Effects.BeatVibratoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.BeatVibratoEffectInfo.prototype = {
    get_EffectId: function (){
        return "beat-vibrato";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Vibrato != AlphaTab.Model.VibratoType.None;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.VibratoGlyph(0, 5 * renderer.get_Scale(), 1.4);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.ChordsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.ChordsEffectInfo.prototype = {
    get_EffectId: function (){
        return "chords";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.get_HasChord();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.get_Chord().Name, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (from, to){
        return false;
    }
};
AlphaTab.Rendering.Effects.CrescendoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.CrescendoEffectInfo.prototype = {
    get_EffectId: function (){
        return "crescendo";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Crescendo != AlphaTab.Model.CrescendoType.None;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.CrescendoGlyph(0, 0, beat.Crescendo);
    },
    CanExpand: function (from, to){
        return from.Crescendo == to.Crescendo;
    }
};
AlphaTab.Rendering.Glyphs.EffectGlyph = function (x, y){
    this.Beat = null;
    this.NextGlyph = null;
    this.PreviousGlyph = null;
    this.Height = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
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
    get_EffectId: function (){
        return "dynamics";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Voice.Index == 0 && ((beat.Index == 0 && beat.Voice.Bar.Index == 0) || (beat.PreviousBeat != null && beat.Dynamic != beat.PreviousBeat.Dynamic));
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.DynamicsGlyph(0, 0, beat.Dynamic);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.FadeInEffectInfo = function (){
};
AlphaTab.Rendering.Effects.FadeInEffectInfo.prototype = {
    get_EffectId: function (){
        return "fade-in";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.FadeIn;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.FadeInGlyph(0, 0);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.NoteEffectInfoBase = function (){
    this.LastCreateInfo = null;
};
AlphaTab.Rendering.Effects.NoteEffectInfoBase.prototype = {
    ShouldCreateGlyph: function (beat){
        this.LastCreateInfo = [];
        for (var i = 0,j = beat.Notes.length; i < j; i++){
            var n = beat.Notes[i];
            if (this.ShouldCreateGlyphForNote(n)){
                this.LastCreateInfo.push(n);
            }
        }
        return this.LastCreateInfo.length > 0;
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo = function (){
    this._beat = null;
    this._beatType = AlphaTab.Model.HarmonicType.None;
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.HarmonicsEffectInfo.prototype = {
    get_EffectId: function (){
        return "harmonics";
    },
    ShouldCreateGlyphForNote: function (note){
        if (!note.get_IsHarmonic())
            return false;
        if (note.Beat != this._beat || note.HarmonicType > this._beatType){
            this._beat = note.Beat;
            this._beatType = note.HarmonicType;
        }
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
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
    get_EffectId: function (){
        return "let-ring";
    },
    get_CanShareBand: function (){
        return false;
    },
    ShouldCreateGlyphForNote: function (note){
        return note.IsLetRing;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LineRangedGlyph("LetRing");
    }
};
$Inherit(AlphaTab.Rendering.Effects.LetRingEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.MarkerEffectInfo = function (){
};
AlphaTab.Rendering.Effects.MarkerEffectInfo.prototype = {
    get_EffectId: function (){
        return "marker";
    },
    get_HideOnMultiTrack: function (){
        return true;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Voice.Bar.Staff.Index == 0 && beat.Voice.Index == 0 && beat.Index == 0 && beat.Voice.Bar.get_MasterBar().get_IsSectionStart();
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.Voice.Bar.get_MasterBar().Section.Text, renderer.get_Resources().MarkerFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.NoteVibratoEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.NoteVibratoEffectInfo.prototype = {
    get_EffectId: function (){
        return "note-vibrato";
    },
    ShouldCreateGlyphForNote: function (note){
        return note.Vibrato != AlphaTab.Model.VibratoType.None || (note.IsTieDestination && note.TieOrigin.Vibrato != AlphaTab.Model.VibratoType.None);
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.VibratoGlyph(0, 5 * renderer.get_Scale(), 1.2);
    }
};
$Inherit(AlphaTab.Rendering.Effects.NoteVibratoEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.CapoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.CapoEffectInfo.prototype = {
    get_EffectId: function (){
        return "capo";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Index == 0 && beat.Voice.Bar.Index == 0 && beat.Voice.Bar.Staff.Track.Capo != 0;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Capo. fret " + beat.Voice.Bar.Staff.Track.Capo, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (from, to){
        return false;
    }
};
AlphaTab.Rendering.Effects.PalmMuteEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.PalmMuteEffectInfo.prototype = {
    get_EffectId: function (){
        return "palm-mute";
    },
    ShouldCreateGlyphForNote: function (note){
        return note.IsPalmMute;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.GroupedOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LineRangedGlyph("P.M.");
    }
};
$Inherit(AlphaTab.Rendering.Effects.PalmMuteEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.PickStrokeEffectInfo = function (){
};
AlphaTab.Rendering.Effects.PickStrokeEffectInfo.prototype = {
    get_EffectId: function (){
        return "pick-stroke";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.PickStroke != AlphaTab.Model.PickStrokeType.None;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.PickStrokeGlyph(0, 0, beat.PickStroke);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TapEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TapEffectInfo.prototype = {
    get_EffectId: function (){
        return "tap";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return true;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return (beat.Slap || beat.Pop || beat.Tap);
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
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TempoEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TempoEffectInfo.prototype = {
    get_EffectId: function (){
        return "tempo";
    },
    get_HideOnMultiTrack: function (){
        return true;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Voice.Bar.Staff.Index == 0 && beat.Voice.Index == 0 && beat.Index == 0 && (beat.Voice.Bar.get_MasterBar().TempoAutomation != null || beat.Voice.Bar.Index == 0);
    },
    CreateNewGlyph: function (renderer, beat){
        var tempo;
        if (beat.Voice.Bar.get_MasterBar().TempoAutomation != null){
            tempo = ((beat.Voice.Bar.get_MasterBar().TempoAutomation.Value)) | 0;
        }
        else {
            tempo = beat.Voice.Bar.Staff.Track.Score.Tempo;
        }
        return new AlphaTab.Rendering.Glyphs.TempoGlyph(0, 0, tempo);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.LyricsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.LyricsEffectInfo.prototype = {
    get_EffectId: function (){
        return "lyrics";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Lyrics != null;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.LyricsGlyph(0, 0, beat.Lyrics, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Center);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TextEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TextEffectInfo.prototype = {
    get_EffectId: function (){
        return "text";
    },
    get_HideOnMultiTrack: function (){
        return false;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    ShouldCreateGlyph: function (beat){
        return !AlphaTab.Platform.Std.IsNullOrWhiteSpace(beat.Text);
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, beat.Text, renderer.get_Resources().EffectFont, AlphaTab.Platform.Model.TextAlign.Left);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TrillEffectInfo = function (){
    AlphaTab.Rendering.Effects.NoteEffectInfoBase.call(this);
};
AlphaTab.Rendering.Effects.TrillEffectInfo.prototype = {
    get_EffectId: function (){
        return "trill";
    },
    ShouldCreateGlyphForNote: function (note){
        return note.get_IsTrill();
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SingleOnBeat;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TrillGlyph(0, 0);
    }
};
$Inherit(AlphaTab.Rendering.Effects.TrillEffectInfo, AlphaTab.Rendering.Effects.NoteEffectInfoBase);
AlphaTab.Rendering.Effects.AlternateEndingsEffectInfo = function (){
};
AlphaTab.Rendering.Effects.AlternateEndingsEffectInfo.prototype = {
    get_EffectId: function (){
        return "alternate-feel";
    },
    get_HideOnMultiTrack: function (){
        return true;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.FullBar;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Index == 0 && beat.Voice.Bar.get_MasterBar().AlternateEndings != 0;
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.AlternateEndingsGlyph(0, 0, beat.Voice.Bar.get_MasterBar().AlternateEndings);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Effects.TripletFeelEffectInfo = function (){
};
AlphaTab.Rendering.Effects.TripletFeelEffectInfo.prototype = {
    get_EffectId: function (){
        return "triplet-feel";
    },
    get_HideOnMultiTrack: function (){
        return true;
    },
    get_CanShareBand: function (){
        return false;
    },
    get_SizingMode: function (){
        return AlphaTab.Rendering.EffectBarGlyphSizing.SinglePreBeat;
    },
    ShouldCreateGlyph: function (beat){
        return beat.Index == 0 && ((beat.Voice.Bar.get_MasterBar().Index == 0 && beat.Voice.Bar.get_MasterBar().TripletFeel != AlphaTab.Model.TripletFeel.NoTripletFeel) || (beat.Voice.Bar.get_MasterBar().Index > 0 && beat.Voice.Bar.get_MasterBar().TripletFeel != beat.Voice.Bar.get_MasterBar().PreviousMasterBar.TripletFeel));
    },
    CreateNewGlyph: function (renderer, beat){
        return new AlphaTab.Rendering.Glyphs.TripletFeelGlyph(beat.Voice.Bar.get_MasterBar().TripletFeel);
    },
    CanExpand: function (from, to){
        return true;
    }
};
AlphaTab.Rendering.Glyphs.MusicFontGlyph = function (x, y, glyphScale, symbol){
    this.GlyphScale = 0;
    this._symbol = AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this.GlyphScale = glyphScale;
    this._symbol = symbol;
};
AlphaTab.Rendering.Glyphs.MusicFontGlyph.prototype = {
    Paint: function (cx, cy, canvas){
        canvas.FillMusicFontSymbol(cx + this.X, cy + this.Y, this.GlyphScale * this.get_Scale(), this._symbol);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.MusicFontGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.AccentuationGlyph = function (x, y, accentuation){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.AccentuationGlyph.GetSymbol(accentuation));
};
AlphaTab.Rendering.Glyphs.AccentuationGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * this.get_Scale();
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
    get_IsEmpty: function (){
        return this.Glyphs == null || this.Glyphs.length == 0;
    },
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
        var glyphs = this.Glyphs;
        if (glyphs == null || glyphs.length == 0)
            return;
        for (var $i90 = 0,$l90 = glyphs.length,g = glyphs[$i90]; $i90 < $l90; $i90++, g = glyphs[$i90]){
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
        var padding = 2 * this.get_Scale();
        if (this.Glyphs.length == 0){
            this.Width = 0;
        }
        else {
            this.Width = padding + (columnWidth * columns.length);
        }
        for (var i = 0,j = this.Glyphs.length; i < j; i++){
            var g = this.Glyphs[i];
            g.X = padding + (this.Width - ((g.X + 1) * columnWidth));
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph.NonReserved = -3000;
});
$Inherit(AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.AlternateEndingsGlyph = function (x, y, alternateEndings){
    this._endings = null;
    this._endingsString = null;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._endings = [];
    for (var i = 0; i < 8; i++){
        if ((alternateEndings & (1 << i)) != 0){
            this._endings.push(i);
        }
    }
};
AlphaTab.Rendering.Glyphs.AlternateEndingsGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = this.Renderer.get_Resources().WordsFont.Size + (3 * this.get_Scale() + 2);
        var endingsStrings = new String();
        for (var i = 0,j = this._endings.length; i < j; i++){
            endingsStrings+=this._endings[i] + 1;
            endingsStrings+=". ";
        }
        this._endingsString = endingsStrings;
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.Paint.call(this, cx, cy, canvas);
        if (this._endings.length > 0){
            var res = this.Renderer.get_Resources();
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
    AlphaTab.Rendering.Glyphs.AlternateEndingsGlyph.Padding = 3;
});
$Inherit(AlphaTab.Rendering.Glyphs.AlternateEndingsGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.BarNumberGlyph = function (x, y, number){
    this._number = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._number = number;
};
AlphaTab.Rendering.Glyphs.BarNumberGlyph.prototype = {
    DoLayout: function (){
        this.Renderer.ScoreRenderer.Canvas.set_Font(this.Renderer.get_Resources().BarNumberFont);
        this.Width = this.Renderer.ScoreRenderer.Canvas.MeasureText(this._number.toString()) + 5 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        if (!this.Renderer.Staff.IsFirstInAccolade){
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
AlphaTab.Rendering.Glyphs.BarSeperatorGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.BarSeperatorGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.TopPadding;
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.BottomPadding;
        var left = ((cx + this.X)) | 0;
        var h = bottom - top;
        if (this.Renderer.get_IsLast()){
            // small bar
            canvas.FillRect(left, top, this.get_Scale(), h);
            // big bar
            canvas.FillRect(left + this.Width - blockWidth, top, blockWidth, h);
        }
        else {
            // small bar
            canvas.FillRect(left + this.Width, top, this.get_Scale(), h);
            if (this.Renderer.Bar.get_MasterBar().IsDoubleBar){
                canvas.FillRect(left + this.Width - 5 * this.get_Scale(), top, this.get_Scale(), h);
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BarSeperatorGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.BeamGlyph = function (x, y, duration, direction, isGrace){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.BeamGlyph.GetSymbol(duration, direction, isGrace));
};
AlphaTab.Rendering.Glyphs.BeamGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    }
};
AlphaTab.Rendering.Glyphs.BeamGlyph.GetSymbol = function (duration, direction, isGrace){
    if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
        switch (duration){
            case AlphaTab.Model.Duration.Eighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
            case AlphaTab.Model.Duration.Sixteenth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixteenth;
            case AlphaTab.Model.Duration.ThirtySecond:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpThirtySecond;
            case AlphaTab.Model.Duration.SixtyFourth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpSixtyFourth;
            case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpOneHundredTwentyEighth;
            case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpTwoHundredFiftySixth;
            default:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterUpEighth;
        }
    }
    else {
        switch (duration){
            case AlphaTab.Model.Duration.Eighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
            case AlphaTab.Model.Duration.Sixteenth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixteenth;
            case AlphaTab.Model.Duration.ThirtySecond:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownThirtySecond;
            case AlphaTab.Model.Duration.SixtyFourth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownSixtyFourth;
            case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownOneHundredTwentyEighth;
            case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownOneHundredTwentyEighth;
            default:
                return AlphaTab.Rendering.Glyphs.MusicFontSymbol.FooterDownEighth;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeamGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.BeatContainerGlyph = function (beat, voiceContainer){
    this.VoiceContainer = null;
    this.Beat = null;
    this.PreNotes = null;
    this.OnNotes = null;
    this.Ties = null;
    this.MinWidth = 0;
    this.OnTimeX = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.Beat = beat;
    this.Ties = [];
    this.VoiceContainer = voiceContainer;
};
AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype = {
    RegisterLayoutingInfo: function (layoutings){
        var preBeatStretch = this.PreNotes.Width + this.OnNotes.Width / 2;
        layoutings.AddBeatSpring(this.Beat, this.MinWidth, preBeatStretch);
        // store sizes for special renderers like the EffectBarRenderer
        layoutings.SetPreBeatSize(this.Beat, this.PreNotes.Width);
        layoutings.SetOnBeatSize(this.Beat, this.OnNotes.Width);
    },
    ApplyLayoutingInfo: function (info){
        this.PreNotes.Width = info.GetPreBeatSize(this.Beat);
        this.OnNotes.Width = info.GetOnBeatSize(this.Beat);
        this.OnNotes.X = this.PreNotes.X + this.PreNotes.Width;
        this.OnTimeX = this.OnNotes.X + this.OnNotes.Width / 2;
        this.OnNotes.UpdateBeamingHelper();
    },
    DoLayout: function (){
        this.PreNotes.X = 0;
        this.PreNotes.Renderer = this.Renderer;
        this.PreNotes.Container = this;
        this.PreNotes.DoLayout();
        this.OnNotes.X = this.PreNotes.X + this.PreNotes.Width;
        this.OnNotes.Renderer = this.Renderer;
        this.OnNotes.Container = this;
        this.OnNotes.DoLayout();
        var i = this.Beat.Notes.length - 1;
        while (i >= 0){
            this.CreateTies(this.Beat.Notes[i--]);
        }
        this.MinWidth = this.PreNotes.Width + this.OnNotes.Width;
        if (!this.Beat.get_IsRest()){
            if (this.OnNotes.BeamingHelper.Beats.length == 1){
                // make space for footer 
                if (this.Beat.Duration >= AlphaTab.Model.Duration.Eighth){
                    this.MinWidth += 20 * this.get_Scale();
                }
            }
            else {
                // ensure some space for small notes
                switch (this.Beat.Duration){
                    case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                    case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                        this.MinWidth += 10 * this.get_Scale();
                        break;
                }
            }
        }
        this.Width = this.MinWidth;
        this.OnTimeX = this.OnNotes.X + this.OnNotes.Width / 2;
    },
    ScaleToWidth: function (beatWidth){
        this.OnNotes.UpdateBeamingHelper();
        this.Width = beatWidth;
    },
    CreateTies: function (n){
    },
    Paint: function (cx, cy, canvas){
        if (this.Beat.Voice.IsEmpty)
            return;
        var isEmptyGlyph = this.PreNotes.get_IsEmpty() && this.OnNotes.get_IsEmpty() && this.Ties.length == 0;
        if (isEmptyGlyph)
            return;
        canvas.BeginGroup("b" + this.Beat.Id);
        var oldColor = canvas.get_Color();
        //canvas.Color = new Color((byte)Std.Random(255), (byte)Std.Random(255), (byte)Std.Random(255), 100);
        //canvas.FillRect(cx + X, cy + Y, Width, Renderer.Height);
        //canvas.Color = oldColor;
        //canvas.Color = new Color(200, 0, 0, 100);
        //canvas.StrokeRect(cx + X, cy + Y + 15 * Beat.Voice.Index, Width, 10);
        //canvas.Font = new Font("Arial", 10);
        //canvas.Color = new Color(0, 0, 0);
        //canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);
        //if (Beat.Voice.Index == 0)
        //{
        //    canvas.Color = new Color(200, 200, 0, 100);
        //    canvas.StrokeRect(cx + X, cy + Y + PreNotes.Y + 30, Width, 10);
        //}
        this.PreNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //if (Beat.Voice.Index == 0)
        //{
        //    canvas.Color = new Color(200, 0, 0, 100);
        //    canvas.StrokeRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
        //}
        this.OnNotes.Paint(cx + this.X, cy + this.Y, canvas);
        //if (Beat.Voice.Index == 0)
        //{
        //    canvas.Color = new Color(0, 200, 0, 100);
        //    canvas.StrokeRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
        //}
        // paint the ties relative to the whole staff, 
        // reason: we have possibly multiple staves involved and need to calculate the correct positions.
        var staffX = cx - this.VoiceContainer.X - this.Renderer.X;
        var staffY = cy - this.VoiceContainer.Y - this.Renderer.Y;
        for (var i = 0,j = this.Ties.length; i < j; i++){
            var t = this.Ties[i];
            t.Renderer = this.Renderer;
            t.Paint(staffX, staffY, canvas);
        }
        canvas.EndGroup();
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
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatGlyphBase, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase = function (){
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase.prototype = {
    UpdateBeamingHelper: function (){
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase, AlphaTab.Rendering.Glyphs.BeatGlyphBase);
AlphaTab.Rendering.Glyphs.BendGlyph = function (n, bendValueHeight){
    this._note = null;
    this._bendValueHeight = 0;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this._note = n;
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
        // what type of arrow? (up/down)
        var arrowOffset = 0;
        var arrowSize = 6 * this.get_Scale();
        if (secondPt.Value > firstPt.Value){
            canvas.BeginPath();
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - arrowSize * 0.5, y2 + arrowSize);
            canvas.LineTo(x2 + arrowSize * 0.5, y2 + arrowSize);
            canvas.ClosePath();
            canvas.Fill();
            arrowOffset = arrowSize;
        }
        else if (secondPt.Value != firstPt.Value){
            canvas.BeginPath();
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - arrowSize * 0.5, y2 - arrowSize);
            canvas.LineTo(x2 + arrowSize * 0.5, y2 - arrowSize);
            canvas.ClosePath();
            canvas.Fill();
            arrowOffset = -arrowSize;
        }
        canvas.Stroke();
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
                canvas.BezierCurveTo(x2, y1, x2, y2 + arrowOffset, x2, y2 + arrowOffset);
                canvas.Stroke();
            }
            else {
                canvas.MoveTo(x1, y1);
                canvas.LineTo(x2, y2);
                canvas.Stroke();
            }
        }
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
            else if (dV >= 4 || dV <= -4){
                var steps = (dV / 4) | 0;
                s += steps;
                // Quaters
                dV -= steps * 4;
            }
            if (dV > 0){
                s += AlphaTab.Rendering.Glyphs.BendGlyph.GetFractionSign(dV);
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
    }
};
AlphaTab.Rendering.Glyphs.BendGlyph.GetFractionSign = function (steps){
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
};
$Inherit(AlphaTab.Rendering.Glyphs.BendGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
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
    Paint: function (cx, cy, canvas){
        canvas.FillCircle(cx + this.X, cy + this.Y, this._size);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.CircleGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.ClefGlyph = function (x, y, clef, clefOttavia){
    this._clef = AlphaTab.Model.Clef.Neutral;
    this._clefOttavia = AlphaTab.Model.ClefOttavia._15ma;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ClefGlyph.GetSymbol(clef));
    this._clef = clef;
    this._clefOttavia = clefOttavia;
};
AlphaTab.Rendering.Glyphs.ClefGlyph.prototype = {
    DoLayout: function (){
        switch (this._clef){
            case AlphaTab.Model.Clef.Neutral:
                this.Width = 15 * this.get_Scale();
                break;
            case AlphaTab.Model.Clef.C3:
            case AlphaTab.Model.Clef.C4:
            case AlphaTab.Model.Clef.F4:
            case AlphaTab.Model.Clef.G2:
                this.Width = 28 * this.get_Scale();
                break;
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.Glyphs.MusicFontGlyph.prototype.Paint.call(this, cx, cy, canvas);
        var numberGlyph;
        var top = false;
        switch (this._clefOttavia){
            case AlphaTab.Model.ClefOttavia._15ma:
                numberGlyph = new AlphaTab.Rendering.Glyphs.NumberGlyph(this.Width / 2, 0, 15, 0.5);
                top = true;
                break;
            case AlphaTab.Model.ClefOttavia._8va:
                numberGlyph = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 0, 8, 0.5);
                top = true;
                break;
            case AlphaTab.Model.ClefOttavia._8vb:
                numberGlyph = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 0, 8, 0.5);
                break;
            case AlphaTab.Model.ClefOttavia._15mb:
                numberGlyph = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, 0, 15, 0.5);
                break;
            default:
                return;
        }
        var offset;
        switch (this._clef){
            case AlphaTab.Model.Clef.Neutral:
                offset = top ? -25 : 10;
                break;
            case AlphaTab.Model.Clef.C3:
                offset = top ? -30 : 20;
                break;
            case AlphaTab.Model.Clef.C4:
                offset = top ? -30 : 20;
                break;
            case AlphaTab.Model.Clef.F4:
                offset = top ? -25 : 20;
                break;
            case AlphaTab.Model.Clef.G2:
                offset = top ? -50 : 25;
                break;
            default:
                return;
        }
        numberGlyph.Renderer = this.Renderer;
        numberGlyph.DoLayout();
        var x = (this.Width - numberGlyph.Width) / 2;
        numberGlyph.Paint(cx + this.X + x, cy + this.Y + offset * this.get_Scale(), canvas);
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
AlphaTab.Rendering.Glyphs.GroupedEffectGlyph = function (endPosition){
    this._endPosition = AlphaTab.Rendering.BeatXPosition.PreNotes;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, 0, 0);
    this._endPosition = endPosition;
};
AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.prototype = {
    get_IsLinkedWithPrevious: function (){
        return this.PreviousGlyph != null && this.PreviousGlyph.Renderer.Staff.StaveGroup == this.Renderer.Staff.StaveGroup;
    },
    get_IsLinkedWithNext: function (){
        // we additionally check IsFinalized since the next renderer might not be part of the current partial
        // and therefore not finalized yet. 
        return this.NextGlyph != null && this.NextGlyph.Renderer.IsFinalized && this.NextGlyph.Renderer.Staff.StaveGroup == this.Renderer.Staff.StaveGroup;
    },
    Paint: function (cx, cy, canvas){
        // if we are linked with the previous, the first glyph of the group will also render this one.
        if (this.get_IsLinkedWithPrevious()){
            return;
        }
        // we are not linked with any glyph therefore no expansion is required, we render a simple glyph. 
        if (!this.get_IsLinkedWithNext()){
            this.PaintNonGrouped(cx, cy, canvas);
            return;
        }
        // find last linked glyph that can be  
        var lastLinkedGlyph = this.NextGlyph;
        while (lastLinkedGlyph.get_IsLinkedWithNext()){
            lastLinkedGlyph = lastLinkedGlyph.NextGlyph;
        }
        // calculate end X-position
        var cxRenderer = cx - this.Renderer.X;
        var endRenderer = lastLinkedGlyph.Renderer;
        var endBeatX = endRenderer.GetBeatX(lastLinkedGlyph.Beat, this._endPosition);
        var endX = cxRenderer + endRenderer.X + endBeatX;
        this.PaintGrouped(cx, cy, endX, canvas);
    },
    PaintNonGrouped: function (cx, cy, canvas){
        var endBeatX = this.Renderer.GetBeatX(this.Beat, AlphaTab.Rendering.BeatXPosition.EndBeat);
        var endX = cx + endBeatX;
        this.PaintGrouped(cx, cy, endX, canvas);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.GroupedEffectGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.CrescendoGlyph = function (x, y, crescendo){
    this._crescendo = AlphaTab.Model.CrescendoType.None;
    AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.call(this, AlphaTab.Rendering.BeatXPosition.EndBeat);
    this._crescendo = crescendo;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.CrescendoGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 17 * this.get_Scale();
    },
    PaintGrouped: function (cx, cy, endX, canvas){
        var startX = cx + this.X;
        var height = this.Height * this.get_Scale();
        canvas.BeginPath();
        if (this._crescendo == AlphaTab.Model.CrescendoType.Crescendo){
            canvas.MoveTo(endX, cy + this.Y);
            canvas.LineTo(startX, cy + this.Y + height / 2);
            canvas.LineTo(endX, cy + this.Y + height);
        }
        else {
            canvas.MoveTo(cx + this.X, cy + this.Y);
            canvas.LineTo(endX, cy + this.Y + (height / 2));
            canvas.LineTo(cx + this.X, cy + this.Y + height);
        }
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.CrescendoGlyph, AlphaTab.Rendering.Glyphs.GroupedEffectGlyph);
AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteDead);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHarmonic);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DigitGlyph = function (x, y, digit, scale){
    this._digit = 0;
    this._scale = 0;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, scale, AlphaTab.Rendering.Glyphs.DigitGlyph.GetSymbol(digit));
    this._digit = digit;
    this._scale = scale;
};
AlphaTab.Rendering.Glyphs.DigitGlyph.prototype = {
    DoLayout: function (){
        this.Y += 7 * this.get_Scale();
        this.Width = this.GetDigitWidth(this._digit) * this.get_Scale() * this._scale;
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
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteSideStick);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.DrumSticksGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DrumSticksGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.DynamicsGlyph = function (x, y, dynamics){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 0.6, AlphaTab.Rendering.Glyphs.DynamicsGlyph.GetSymbol(dynamics));
};
AlphaTab.Rendering.Glyphs.DynamicsGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 17 * this.get_Scale();
        this.Y += this.Height / 2;
    }
};
AlphaTab.Rendering.Glyphs.DynamicsGlyph.GetSymbol = function (dynamics){
    switch (dynamics){
        case AlphaTab.Model.DynamicValue.PPP:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicPPP;
        case AlphaTab.Model.DynamicValue.PP:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicPP;
        case AlphaTab.Model.DynamicValue.P:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicP;
        case AlphaTab.Model.DynamicValue.MP:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicMP;
        case AlphaTab.Model.DynamicValue.MF:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicMF;
        case AlphaTab.Model.DynamicValue.F:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicF;
        case AlphaTab.Model.DynamicValue.FF:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicFFF;
        case AlphaTab.Model.DynamicValue.FFF:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.DynamicFFF;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.DynamicsGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.FadeInGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.FadeInGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 17 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var size = 6 * this.get_Scale();
        var width = Math.max(this.Width, 14 * this.get_Scale());
        var offset = this.Height / 2;
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X, cy + this.Y + offset);
        canvas.QuadraticCurveTo(cx + this.X + (width / 2), cy + this.Y + offset, cx + this.X + width, cy + this.Y + offset - size);
        canvas.MoveTo(cx + this.X, cy + this.Y + offset);
        canvas.QuadraticCurveTo(cx + this.X + (width / 2), cy + this.Y + offset, cx + this.X + width, cy + this.Y + offset + size);
        canvas.Stroke();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.FadeInGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.FlatGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalFlat);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.FlatGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.FlatGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.HiHatGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHiHat);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.HiHatGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.HiHatGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup = function (){
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, 0, 0);
    this.Glyphs = [];
};
AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup.prototype = {
    AddGlyph: function (g){
        g.X = this.Glyphs.length == 0 ? 0 : (this.Glyphs[this.Glyphs.length - 1].X + this.Glyphs[this.Glyphs.length - 1].Width);
        g.Renderer = this.Renderer;
        g.DoLayout();
        this.Width = g.X + g.Width;
        AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.AddGlyph.call(this, g);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.LeftToRightLayoutingGlyphGroup, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.LineRangedGlyph = function (label){
    this._label = null;
    AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.call(this, AlphaTab.Rendering.BeatXPosition.PostNotes);
    this._label = label;
};
AlphaTab.Rendering.Glyphs.LineRangedGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = this.Renderer.get_Resources().EffectFont.Size;
    },
    PaintNonGrouped: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.EffectFont);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
        canvas.FillText(this._label, cx + this.X, cy + this.Y);
    },
    PaintGrouped: function (cx, cy, endX, canvas){
        this.PaintNonGrouped(cx, cy, canvas);
        var lineSpacing = 3 * this.get_Scale();
        var textWidth = canvas.MeasureText(this._label);
        var startX = cx + this.X + textWidth + lineSpacing;
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
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineSpacing = 3;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineTopPadding = 8;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineTopOffset = 6;
    AlphaTab.Rendering.Glyphs.LineRangedGlyph.LineSize = 8;
});
$Inherit(AlphaTab.Rendering.Glyphs.LineRangedGlyph, AlphaTab.Rendering.Glyphs.GroupedEffectGlyph);
AlphaTab.Rendering.Glyphs.LyricsGlyph = function (x, y, lines, font, textAlign){
    this._lines = null;
    this.Font = null;
    this.TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._lines = lines;
    this.Font = font;
    this.TextAlign = textAlign;
};
AlphaTab.Rendering.Glyphs.LyricsGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = this.Font.Size * this._lines.length;
    },
    Paint: function (cx, cy, canvas){
        canvas.set_Font(this.Font);
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(this.TextAlign);
        for (var i = 0; i < this._lines.length; i++){
            if (this._lines[i] != null){
                canvas.FillText(this._lines[i], cx + this.X, cy + this.Y + i * this.Font.Size);
            }
        }
        canvas.set_TextAlign(old);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.LyricsGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.MusicFontSymbol = {
    None: -1,
    ClefG: 57424,
    ClefC: 57436,
    ClefF: 57442,
    ClefNeutral: 57449,
    ClefTab: 57453,
    ClefTabSmall: 57454,
    RestQuadrupleWhole: 58593,
    RestDoubleWhole: 58594,
    RestWhole: 58595,
    RestHalf: 58596,
    RestQuarter: 58597,
    RestEighth: 58598,
    RestSixteenth: 58599,
    RestThirtySecond: 58600,
    RestSixtyFourth: 58601,
    RestOneHundredTwentyEighth: 58602,
    RestTwoHundredFiftySixth: 58603,
    GraceUp: 57815,
    GraceDown: 57816,
    Trill: 58726,
    Num0: 57472,
    Num1: 57473,
    Num2: 57474,
    Num3: 57475,
    Num4: 57476,
    Num5: 57477,
    Num6: 57478,
    Num7: 57479,
    Num8: 57480,
    Num9: 57481,
    TimeSignatureCommon: 57482,
    TimeSignatureCutCommon: 57483,
    NoteQuadrupleWhole: 57505,
    NoteDoubleWhole: 57504,
    NoteWhole: 57506,
    NoteHalf: 57507,
    NoteQuarter: 57508,
    NoteDead: 57514,
    NoteHarmonic: 57564,
    NoteRideCymbal: 57566,
    NoteHiHat: 57523,
    NoteSideStick: 57513,
    NoteHiHatHalf: 57591,
    NoteChineseCymbal: 57593,
    FooterUpEighth: 57920,
    FooterDownEighth: 57921,
    FooterUpSixteenth: 57922,
    FooterDownSixteenth: 57923,
    FooterUpThirtySecond: 57924,
    FooterDownThirtySecond: 57925,
    FooterUpSixtyFourth: 57926,
    FooterDownSixtyFourth: 57927,
    FooterUpOneHundredTwentyEighth: 57928,
    FooterDownOneHundredTwentyEighth: 57929,
    FooterUpTwoHundredFiftySixth: 57930,
    FooterDownTwoHundredFiftySixth: 57931,
    DynamicPPP: 58666,
    DynamicPP: 58667,
    DynamicP: 58656,
    DynamicMP: 58668,
    DynamicMF: 58669,
    DynamicF: 58658,
    DynamicFF: 58671,
    DynamicFFF: 58672,
    Accentuation: 58528,
    HeavyAccentuation: 58540,
    WaveHorizontal: 60068,
    PickStrokeDown: 58896,
    PickStrokeUp: 58898,
    TremoloPickingThirtySecond: 57890,
    TremoloPickingSixteenth: 57889,
    TremoloPickingEighth: 57888,
    Tempo: 57813,
    NoteEighth: 57815,
    AccidentalFlat: 57952,
    AccidentalNatural: 57953,
    AccidentalSharp: 57954
};
AlphaTab.Rendering.Glyphs.NaturalizeGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalNatural);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.NaturalizeGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NaturalizeGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.NoteHeadGlyph = function (x, y, duration, isGrace){
    this._isGrace = false;
    this._duration = AlphaTab.Model.Duration.QuadrupleWhole;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GetSymbol(duration));
    this._isGrace = isGrace;
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.NoteHeadGlyph.prototype = {
    DoLayout: function (){
        switch (this._duration){
            case AlphaTab.Model.Duration.QuadrupleWhole:
                this.Width = 14 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
                break;
            case AlphaTab.Model.Duration.DoubleWhole:
                this.Width = 14 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
                break;
            case AlphaTab.Model.Duration.Whole:
                this.Width = 14 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
                break;
            default:
                this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
                break;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GraceScale = 0.75;
    AlphaTab.Rendering.Glyphs.NoteHeadGlyph.NoteHeadHeight = 9;
});
AlphaTab.Rendering.Glyphs.NoteHeadGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.QuadrupleWhole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteQuadrupleWhole;
        case AlphaTab.Model.Duration.DoubleWhole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteDoubleWhole;
        case AlphaTab.Model.Duration.Whole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteWhole;
        case AlphaTab.Model.Duration.Half:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteHalf;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteQuarter;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NoteHeadGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.NoteNumberGlyph = function (x, y, n){
    this._noteString = null;
    this._noteStringWidth = 0;
    this._trillNoteString = null;
    this._trillNoteStringWidth = 0;
    this.IsEmpty = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    if (!n.IsTieDestination){
        this._noteString = n.IsDead ? "x" : (n.Fret - n.Beat.Voice.Bar.Staff.Track.TranspositionPitch).toString();
        if (n.IsGhost){
            this._noteString = "(" + this._noteString + ")";
        }
    }
    else if (n.Beat.Index == 0 || n.get_HasBend()){
        this._noteString = "(" + (n.TieOrigin.Fret - n.Beat.Voice.Bar.Staff.Track.TranspositionPitch) + ")";
    }
    else {
        this._noteString = "";
    }
    if (n.get_IsTrill()){
        this._trillNoteString = "(" + (n.get_TrillFret() - n.Beat.Voice.Bar.Staff.Track.TranspositionPitch) + ")";
    }
    else {
        this._trillNoteString = "";
    }
};
AlphaTab.Rendering.Glyphs.NoteNumberGlyph.prototype = {
    DoLayout: function (){
        this.IsEmpty = ((this._noteString==null)||(this._noteString.length==0)) && ((this._trillNoteString==null)||(this._trillNoteString.length==0));
        if (!this.IsEmpty){
            this.Renderer.ScoreRenderer.Canvas.set_Font(this.Renderer.get_Resources().TablatureFont);
            this._noteStringWidth = this.Renderer.ScoreRenderer.Canvas.MeasureText(this._noteString);
            this._trillNoteStringWidth = this.Renderer.ScoreRenderer.Canvas.MeasureText(this._trillNoteString);
            this.Width = this._noteStringWidth + this._trillNoteStringWidth;
        }
    },
    Paint: function (cx, cy, canvas){
        if (this.IsEmpty)
            return;
        var textWidth = this._noteStringWidth + this._trillNoteStringWidth;
        var x = cx + this.X + (this.Width - textWidth) / 2;
        canvas.FillText(this._noteString, x, cy + this.Y);
        canvas.FillText(this._trillNoteString, x + this._noteStringWidth, cy + this.Y);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.NoteNumberGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.NumberGlyph = function (x, y, number, scale){
    this._number = 0;
    this._scale = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._number = number;
    this._scale = scale;
};
AlphaTab.Rendering.Glyphs.NumberGlyph.prototype = {
    DoLayout: function (){
        var i = this._number;
        while (i > 0){
            var num = i % 10;
            var gl = new AlphaTab.Rendering.Glyphs.DigitGlyph(0, 0, num, this._scale);
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
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 0.75, AlphaTab.Rendering.Glyphs.PickStrokeGlyph.GetSymbol(pickStroke));
};
AlphaTab.Rendering.Glyphs.PickStrokeGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * this.get_Scale();
        this.Height = 10 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.Glyphs.MusicFontGlyph.prototype.Paint.call(this, cx, cy + this.Height, canvas);
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
        this.Width = 11 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.TopPadding;
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.BottomPadding;
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
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        var oldAlign = canvas.get_TextAlign();
        canvas.set_Font(res.BarNumberFont);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Right);
        var s = "x" + this._count;
        var w = canvas.MeasureText(s) / 1.5;
        canvas.FillText(s, cx + this.X - w, cy + this.Y);
        canvas.set_TextAlign(oldAlign);
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
    Paint: function (cx, cy, canvas){
        var blockWidth = 4 * this.get_Scale();
        var top = cy + this.Y + this.Renderer.TopPadding;
        var bottom = cy + this.Y + this.Renderer.Height - this.Renderer.BottomPadding;
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
AlphaTab.Rendering.Glyphs.TieGlyph = function (startBeat, endBeat, forEnd){
    this.StartBeat = null;
    this.EndBeat = null;
    this.YOffset = 0;
    this._forEnd = false;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, 0, 0);
    this.StartBeat = startBeat;
    this.EndBeat = endBeat;
    this._forEnd = forEnd;
};
AlphaTab.Rendering.Glyphs.TieGlyph.prototype = {
    DoLayout: function (){
        this.Width = 0;
    },
    Paint: function (cx, cy, canvas){
        if (this.EndBeat == null)
            return;
        var startNoteRenderer = this.Renderer.ScoreRenderer.Layout.GetRendererForBar(this.Renderer.Staff.get_StaveId(), this.StartBeat.Voice.Bar);
        var endNoteRenderer = this.Renderer.ScoreRenderer.Layout.GetRendererForBar(this.Renderer.Staff.get_StaveId(), this.EndBeat.Voice.Bar);
        var startX = 0;
        var endX = 0;
        var startY = 0;
        var endY = 0;
        var shouldDraw = false;
        var direction = this.GetBeamDirection(this.StartBeat, startNoteRenderer);
        // if we are on the tie start, we check if we 
        // either can draw till the end note, or we just can draw till the bar end
        if (!this._forEnd){
            // line break or bar break
            if (startNoteRenderer != endNoteRenderer){
                startX = cx + startNoteRenderer.X + this.GetStartX(startNoteRenderer);
                startY = cy + startNoteRenderer.Y + this.GetStartY(startNoteRenderer, direction) + this.YOffset;
                // line break: to bar end
                if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff){
                    endX = cx + startNoteRenderer.X + startNoteRenderer.Width;
                    endY = startY;
                }
                else {
                    endX = cx + endNoteRenderer.X + this.GetEndX(endNoteRenderer);
                    endY = cy + endNoteRenderer.Y + this.GetEndY(endNoteRenderer, direction) + this.YOffset;
                }
            }
            else {
                startX = cx + startNoteRenderer.X + this.GetStartX(startNoteRenderer);
                endX = cx + endNoteRenderer.X + this.GetEndX(endNoteRenderer);
                startY = cy + startNoteRenderer.Y + this.GetStartY(startNoteRenderer, direction) + this.YOffset;
                endY = cy + endNoteRenderer.Y + this.GetEndY(endNoteRenderer, direction) + this.YOffset;
            }
            shouldDraw = true;
        }
        else if (startNoteRenderer.Staff != endNoteRenderer.Staff){
            startX = cx + endNoteRenderer.X;
            endX = cx + endNoteRenderer.X + this.GetEndX(endNoteRenderer);
            startY = cy + endNoteRenderer.Y + this.GetEndY(endNoteRenderer, direction) + this.YOffset;
            endY = startY;
            shouldDraw = true;
        }
        if (shouldDraw){
            AlphaTab.Rendering.Glyphs.TieGlyph.PaintTie(canvas, this.get_Scale(), startX, startY, endX, endY, direction == AlphaTab.Rendering.Utils.BeamDirection.Down);
            canvas.Fill();
        }
    },
    GetBeamDirection: function (beat, noteRenderer){
        return AlphaTab.Rendering.Utils.BeamDirection.Down;
    },
    GetStartY: function (noteRenderer, direction){
        return 0;
    },
    GetEndY: function (noteRenderer, direction){
        return 0;
    },
    GetStartX: function (noteRenderer){
        return 0;
    },
    GetEndX: function (noteRenderer){
        return 0;
    }
};
AlphaTab.Rendering.Glyphs.TieGlyph.PaintTie = function (canvas, scale, x1, y1, x2, y2, down){
    if (x1 == x2 && y1 == y2){
        return;
    }
    // ensure endX > startX
    if (x2 < x1){
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
    var offset = 22 * scale;
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
AlphaTab.Rendering.Glyphs.ScoreLegatoGlyph = function (startBeat, endBeat, forEnd){
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startBeat, endBeat, forEnd);
};
AlphaTab.Rendering.Glyphs.ScoreLegatoGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.TieGlyph.prototype.DoLayout.call(this);
        this.YOffset = (4.5);
    },
    GetBeamDirection: function (beat, noteRenderer){
        if (beat.get_IsRest()){
            return AlphaTab.Rendering.Utils.BeamDirection.Up;
        }
        // invert direction (if stems go up, ties go down to not cross them)
        switch ((noteRenderer).GetBeatDirection(beat)){
            case AlphaTab.Rendering.Utils.BeamDirection.Up:
                return AlphaTab.Rendering.Utils.BeamDirection.Down;
            case AlphaTab.Rendering.Utils.BeamDirection.Down:
            default:
                return AlphaTab.Rendering.Utils.BeamDirection.Up;
        }
    },
    GetStartY: function (noteRenderer, direction){
        if (this.StartBeat.get_IsRest()){
            // below all lines
            return (noteRenderer).GetScoreY(9, 0);
        }
        switch (direction){
            case AlphaTab.Rendering.Utils.BeamDirection.Up:
                return noteRenderer.GetNoteY(this.StartBeat.get_MinNote());
            default:
                return noteRenderer.GetNoteY(this.StartBeat.get_MaxNote());
        }
    },
    GetEndY: function (noteRenderer, direction){
        if (this.EndBeat.get_IsRest()){
            switch (direction){
                case AlphaTab.Rendering.Utils.BeamDirection.Up:
                    return (noteRenderer).GetScoreY(9, 0);
                default:
                    return (noteRenderer).GetScoreY(0, 0);
            }
        }
        switch (direction){
            case AlphaTab.Rendering.Utils.BeamDirection.Up:
                return (noteRenderer).GetNoteY(this.EndBeat.get_MinNote());
            default:
                return (noteRenderer).GetNoteY(this.EndBeat.get_MaxNote());
        }
    },
    GetStartX: function (noteRenderer){
        if (this.StartBeat.get_IsRest()){
            return noteRenderer.GetBeatX(this.StartBeat, AlphaTab.Rendering.BeatXPosition.PreNotes);
        }
        else {
            return noteRenderer.GetNoteX(this.StartBeat.get_MinNote(), true);
        }
    },
    GetEndX: function (noteRenderer){
        if (this.EndBeat.get_IsRest()){
            return noteRenderer.GetBeatX(this.EndBeat, AlphaTab.Rendering.BeatXPosition.PreNotes);
        }
        else {
            return noteRenderer.GetNoteX(this.EndBeat.get_MinNote(), false);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreLegatoGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.ScoreRestGlyph = function (x, y, duration){
    this._duration = AlphaTab.Model.Duration.QuadrupleWhole;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol(duration));
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.prototype = {
    DoLayout: function (){
        this.Width = AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSize(this._duration) * this.get_Scale();
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX("score", this.Beat, cx + this.X + this.Width / 2, cx + this.X + this.Width / 2);
        }
    }
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.QuadrupleWhole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestQuadrupleWhole;
        case AlphaTab.Model.Duration.DoubleWhole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestDoubleWhole;
        case AlphaTab.Model.Duration.Whole:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestWhole;
        case AlphaTab.Model.Duration.Half:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestHalf;
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
        case AlphaTab.Model.Duration.OneHundredTwentyEighth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestOneHundredTwentyEighth;
        case AlphaTab.Model.Duration.TwoHundredFiftySixth:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.RestTwoHundredFiftySixth;
        default:
            return AlphaTab.Rendering.Glyphs.MusicFontSymbol.None;
    }
};
AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSize = function (duration){
    switch (duration){
        case AlphaTab.Model.Duration.QuadrupleWhole:
        case AlphaTab.Model.Duration.DoubleWhole:
        case AlphaTab.Model.Duration.Whole:
        case AlphaTab.Model.Duration.Half:
        case AlphaTab.Model.Duration.Quarter:
        case AlphaTab.Model.Duration.Eighth:
        case AlphaTab.Model.Duration.Sixteenth:
            return 9;
        case AlphaTab.Model.Duration.ThirtySecond:
            return 12;
        case AlphaTab.Model.Duration.SixtyFourth:
            return 14;
        case AlphaTab.Model.Duration.OneHundredTwentyEighth:
        case AlphaTab.Model.Duration.TwoHundredFiftySixth:
            return 20;
    }
    return 10;
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreRestGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.RideCymbalGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteRideCymbal);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.RideCymbalGlyph.prototype = {
    DoLayout: function (){
        this.Width = 9 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.RideCymbalGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.ScoreBeatContainerGlyph = function (beat, voiceContainer){
    AlphaTab.Rendering.Glyphs.BeatContainerGlyph.call(this, beat, voiceContainer);
};
AlphaTab.Rendering.ScoreBeatContainerGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.DoLayout.call(this);
        if (this.Beat.IsLegatoOrigin){
            // only create slur for very first origin of "group"
            if (this.Beat.PreviousBeat == null || !this.Beat.PreviousBeat.IsLegatoOrigin){
                // tie with end beat
                var destination = this.Beat.NextBeat;
                while (destination.NextBeat != null && destination.NextBeat.get_IsLegatoDestination()){
                    destination = destination.NextBeat;
                }
                this.Ties.push(new AlphaTab.Rendering.Glyphs.ScoreLegatoGlyph(this.Beat, destination, false));
            }
        }
        else if (this.Beat.get_IsLegatoDestination()){
            // only create slur for last destination of "group"
            if (!this.Beat.IsLegatoOrigin){
                var origin = this.Beat.PreviousBeat;
                while (origin.PreviousBeat != null && origin.PreviousBeat.IsLegatoOrigin){
                    origin = origin.PreviousBeat;
                }
                this.Ties.push(new AlphaTab.Rendering.Glyphs.ScoreLegatoGlyph(origin, this.Beat, true));
            }
        }
    },
    CreateTies: function (n){
        // create a tie if any effect requires it
        // NOTE: we create 2 tie glyphs if we have a line break inbetween 
        // the two notes
        if (n.IsTieOrigin){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.TieDestination, false);
            this.Ties.push(tie);
        }
        if (n.IsTieDestination){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n.TieOrigin, n, true);
            this.Ties.push(tie);
        }
        else if (n.IsHammerPullOrigin){
            // only create tie for very first origin of "group"
            if (n.HammerPullOrigin == null){
                // tie with end note
                var destination = n.HammerPullDestination;
                while (destination.HammerPullDestination != null){
                    destination = destination.HammerPullDestination;
                }
                var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, destination, false);
                this.Ties.push(tie);
            }
        }
        else if (n.get_IsHammerPullDestination()){
            // only create tie for last destination of "group"
            // NOTE: HOPOs over more than 2 staffs does not work with this mechanism, but this sounds unrealistic
            if (n.HammerPullDestination == null){
                var origin = n.HammerPullOrigin;
                while (origin.HammerPullOrigin != null){
                    origin = origin.HammerPullOrigin;
                }
                var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(origin, n, true);
                this.Ties.push(tie);
            }
        }
        else if (n.SlideType == AlphaTab.Model.SlideType.Legato){
            var tie = new AlphaTab.Rendering.Glyphs.ScoreTieGlyph(n, n.SlideTarget, false);
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
    AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatGlyph.prototype = {
    UpdateBeamingHelper: function (){
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
                for (var $i91 = 0,$t91 = this.Container.Beat.Notes,$l91 = $t91.length,note = $t91[$i91]; $i91 < $l91; $i91++, note = $t91[$i91]){
                    this.CreateNoteGlyph(note);
                }
                this.AddGlyph(this.NoteHeads);
                //
                // Note dots
                //
                if (this.Container.Beat.Dots > 0){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
                    for (var i = 0; i < this.Container.Beat.Dots; i++){
                        var group = new AlphaTab.Rendering.Glyphs.GlyphGroup(0, 0);
                        for (var $i92 = 0,$t92 = this.Container.Beat.Notes,$l92 = $t92.length,note = $t92[$i92]; $i92 < $l92; $i92++, note = $t92[$i92]){
                            this.CreateBeatDot(sr.GetNoteLine(note), group);
                        }
                        this.AddGlyph(group);
                    }
                }
            }
            else {
                var dotLine = 0;
                var line = 0;
                var offset = 0;
                switch (this.Container.Beat.Duration){
                    case AlphaTab.Model.Duration.QuadrupleWhole:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.DoubleWhole:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Whole:
                        line = 4;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Half:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Quarter:
                        line = 6;
                        offset = -2;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Eighth:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.Sixteenth:
                        line = 6;
                        dotLine = 5;
                        break;
                    case AlphaTab.Model.Duration.ThirtySecond:
                        line = 6;
                        dotLine = 3;
                        break;
                    case AlphaTab.Model.Duration.SixtyFourth:
                        line = 6;
                        dotLine = 3;
                        break;
                    case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                        line = 6;
                        dotLine = 3;
                        break;
                    case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                        line = 6;
                        dotLine = 3;
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
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
                    for (var i = 0; i < this.Container.Beat.Dots; i++){
                        var group = new AlphaTab.Rendering.Glyphs.GlyphGroup(0, 0);
                        this.CreateBeatDot(dotLine, group);
                        this.AddGlyph(group);
                    }
                }
            }
        }
        AlphaTab.Rendering.Glyphs.BeatGlyphBase.prototype.DoLayout.call(this);
    },
    CreateBeatDot: function (line, group){
        var sr = this.Renderer;
        group.AddGlyph(new AlphaTab.Rendering.Glyphs.CircleGlyph(0, sr.GetScoreY(line, 0), 1.5 * this.get_Scale()));
    },
    CreateNoteHeadGlyph: function (n){
        var isGrace = this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None;
        if (n.Beat.Voice.Bar.Staff.Track.IsPercussion){
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
        noteHeadGlyph.Y = sr.GetScoreY(line, 0);
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
$Inherit(AlphaTab.Rendering.Glyphs.ScoreBeatGlyph, AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase);
AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph.prototype = {
    DoLayout: function (){
        if (!this.Container.Beat.get_IsRest()){
            if (this.Container.Beat.BrushType != AlphaTab.Model.BrushType.None){
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.ScoreBrushGlyph(this.Container.Beat));
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale()));
            }
            var accidentals = new AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph();
            for (var $i93 = 0,$t93 = this.Container.Beat.Notes,$l93 = $t93.length,note = $t93[$i93]; $i93 < $l93; $i93++, note = $t93[$i93]){
                this.CreateAccidentalGlyph(note, accidentals);
            }
            if (!accidentals.get_IsEmpty()){
                this.AddGlyph(accidentals);
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * (this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None ? 0.75 : 1) * this.get_Scale()));
            }
        }
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
                accidentals.AddGlyph(new AlphaTab.Rendering.Glyphs.NaturalizeGlyph(0, sr.GetScoreY(noteLine, 0), isGrace));
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
        //TODO: Create webfont version
        var scoreBarRenderer = this.Renderer;
        var lineSize = scoreBarRenderer.get_LineOffset();
        var startY = cy + this.Y + (scoreBarRenderer.GetNoteY(this._beat.get_MaxNote()) - lineSize / 2);
        var endY = cy + this.Y + scoreBarRenderer.GetNoteY(this._beat.get_MinNote()) + lineSize;
        var arrowX = cx + this.X + this.Width / 2;
        var arrowSize = 8 * this.get_Scale();
        if (this._beat.BrushType != AlphaTab.Model.BrushType.None){
            //if (_beat.BrushType == BrushType.ArpeggioUp || _beat.BrushType == BrushType.ArpeggioDown)
            //{
            //    var size = 15 * Scale;
            //    var steps = Math.Abs(endY - startY) / size;
            //    for (var i = 0; i < steps; i++)
            //    {
            //        canvas.FillMusicFontSymbol(cx + X + (3 * Scale), 1, startY + (i * size), MusicFontSymbol.WaveVertical);
            //    }
            //}
            if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, endY);
                canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
            else if (this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioDown){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, startY);
                canvas.LineTo(arrowX + arrowSize / 2, startY + arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, startY + arrowSize);
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
    this._noteHeadPadding = 0;
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
        return this.BeamingHelper.Direction;
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
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null){
            this.BeamingHelper.RegisterBeatLineX("score", this.Beat, cx + this.X + this.UpLineX, cx + this.X + this.DownLineX);
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
        var direction = this.get_Direction();
        var w = 0;
        for (var i = 0,j = this._infos.length; i < j; i++){
            var g = this._infos[i].Glyph;
            g.Renderer = this.Renderer;
            g.DoLayout();
            var displace = false;
            if (i == 0){
                displacedX = g.Width + 0;
            }
            else {
                // check if note needs to be repositioned
                if (Math.abs(lastLine - this._infos[i].Line) <= 1){
                    // reposition if needed
                    if (!lastDisplaced){
                        displace = true;
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
            // for beat direction down we invert the displacement.
            // this means: displaced is on the left side of the stem and not displaced is right
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                g.X = displace ? 0 : displacedX;
            }
            else {
                g.X = displace ? displacedX : 0;
            }
            lastLine = this._infos[i].Line;
            w = Math.max(w, g.X + g.Width);
        }
        if (anyDisplaced){
            this._noteHeadPadding = 0;
            this.UpLineX = displacedX;
            this.DownLineX = displacedX;
        }
        else {
            this._noteHeadPadding = direction == AlphaTab.Rendering.Utils.BeamDirection.Down ? -displacedX : 0;
            w += this._noteHeadPadding;
            this.UpLineX = w;
            this.DownLineX = 0;
        }
        for (var effectKey in this.BeatEffects){
            var effect = this.BeatEffects[effectKey];
            effect.Renderer = this.Renderer;
            effect.DoLayout();
        }
        if (this.Beat.get_IsTremolo()){
            var offset;
            var baseNote = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? this.MinNote : this.MaxNote;
            var tremoloX = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? displacedX : 0;
            var speed = this.Beat.TremoloSpeed;
            switch (speed){
                case AlphaTab.Model.Duration.ThirtySecond:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -15 : 15;
                    break;
                case AlphaTab.Model.Duration.Sixteenth:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -12 : 15;
                    break;
                case AlphaTab.Model.Duration.Eighth:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -10 : 10;
                    break;
                default:
                    offset = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? -10 : 15;
                    break;
            }
            this._tremoloPicking = new AlphaTab.Rendering.Glyphs.TremoloPickingGlyph(tremoloX, baseNote.Glyph.Y + offset * (this.get_Scale()), this.Beat.TremoloSpeed);
            this._tremoloPicking.Renderer = this.Renderer;
            this._tremoloPicking.DoLayout();
        }
        this.Width = w + 0;
    },
    Paint: function (cx, cy, canvas){
        cx += this.X;
        cy += this.Y;
        // TODO: this method seems to be quite heavy according to the profiler, why?
        var scoreRenderer = this.Renderer;
        //
        // Note Effects only painted once
        //
        var effectY = this.BeamingHelper.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? scoreRenderer.GetScoreY(this.MaxNote.Line, 13.5) : scoreRenderer.GetScoreY(this.MinNote.Line, -9);
        // TODO: take care of actual glyph height
        var effectSpacing = (this.BeamingHelper.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up) ? 7 * (this.get_Scale()) : -7 * (this.get_Scale());
        for (var effectKey in this.BeatEffects){
            var g = this.BeatEffects[effectKey];
            g.Y = effectY;
            g.X = this.Width / 2;
            g.Paint(cx, cy, canvas);
            effectY += effectSpacing;
        }
        // TODO: Take care of beateffects in overflow
        var linePadding = 3 * (this.get_Scale());
        var lineWidth = this.Width + linePadding * 2;
        if (this.get_HasTopOverflow()){
            var color = canvas.get_Color();
            canvas.set_Color(this.Renderer.ScoreRenderer.RenderingResources.StaveLineColor);
            var l = -1;
            while (l >= this.MinNote.Line){
                // + 1 Because we want to place the line in the center of the note, not at the top
                var lY = cy + scoreRenderer.GetScoreY(l, 0);
                canvas.FillRect(cx - linePadding, lY, lineWidth, (this.get_Scale()));
                l -= 2;
            }
            canvas.set_Color(color);
        }
        if (this.get_HasBottomOverflow()){
            var color = canvas.get_Color();
            canvas.set_Color(this.Renderer.ScoreRenderer.RenderingResources.StaveLineColor);
            var l = 12;
            while (l <= this.MaxNote.Line){
                var lY = cy + scoreRenderer.GetScoreY(l, 0);
                canvas.FillRect(cx - linePadding, lY, lineWidth, (this.get_Scale()));
                l += 2;
            }
            canvas.set_Color(color);
        }
        if (this._tremoloPicking != null){
            this._tremoloPicking.Paint(cx, cy, canvas);
        }
        var infos = this._infos;
        var x = cx + this._noteHeadPadding;
        for (var $i94 = 0,$l94 = infos.length,g = infos[$i94]; $i94 < $l94; $i94++, g = infos[$i94]){
            g.Glyph.Renderer = this.Renderer;
            g.Glyph.Paint(x, cy, canvas);
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
    Paint: function (cx, cy, canvas){
        var r = this.Renderer;
        cx += r.X;
        cy += r.Y;
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
                endX = cx + this._parent.X;
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
AlphaTab.Rendering.Glyphs.ScoreTieGlyph = function (startNote, endNote, forEnd){
    this._startNote = null;
    this._endNote = null;
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startNote == null ? null : startNote.Beat, endNote == null ? null : endNote.Beat, forEnd);
    this._startNote = startNote;
    this._endNote = endNote;
};
AlphaTab.Rendering.Glyphs.ScoreTieGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.TieGlyph.prototype.DoLayout.call(this);
        this.YOffset = (4.5);
    },
    GetBeamDirection: function (beat, noteRenderer){
        // invert direction (if stems go up, ties go down to not cross them)
        switch ((noteRenderer).GetBeatDirection(beat)){
            case AlphaTab.Rendering.Utils.BeamDirection.Up:
                return AlphaTab.Rendering.Utils.BeamDirection.Down;
            case AlphaTab.Rendering.Utils.BeamDirection.Down:
            default:
                return AlphaTab.Rendering.Utils.BeamDirection.Up;
        }
    },
    GetStartY: function (noteRenderer, direction){
        return noteRenderer.GetNoteY(this._startNote);
    },
    GetEndY: function (noteRenderer, direction){
        return noteRenderer.GetNoteY(this._endNote);
    },
    GetStartX: function (noteRenderer){
        return noteRenderer.GetNoteX(this._startNote, true);
    },
    GetEndX: function (noteRenderer){
        return noteRenderer.GetNoteX(this._endNote, false);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreTieGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.SharpGlyph = function (x, y, isGrace){
    this._isGrace = false;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, isGrace ? 0.75 : 1, AlphaTab.Rendering.Glyphs.MusicFontSymbol.AccidentalSharp);
    this._isGrace = isGrace;
};
AlphaTab.Rendering.Glyphs.SharpGlyph.prototype = {
    DoLayout: function (){
        this.Width = 8 * (this._isGrace ? 0.75 : 1) * this.get_Scale();
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.SharpGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
AlphaTab.Rendering.Glyphs.SpacingGlyph = function (x, y, width){
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this.Width = width;
};
$Inherit(AlphaTab.Rendering.Glyphs.SpacingGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph = function (beat, voiceContainer){
    this._bendGlyphs = null;
    AlphaTab.Rendering.Glyphs.BeatContainerGlyph.call(this, beat, voiceContainer);
};
AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.DoLayout.call(this);
        this._bendGlyphs = [];
        for (var i = 0; i < this.Beat.Notes.length; i++){
            var n = this.Beat.Notes[i];
            if (n.get_HasBend()){
                var bendValueHeight = 6;
                var bendHeight = n.MaxBendPoint.Value * bendValueHeight;
                this.Renderer.RegisterOverflowTop(bendHeight);
                var bend = new AlphaTab.Rendering.Glyphs.BendGlyph(n, bendValueHeight);
                bend.X = this.OnNotes.X + this.OnNotes.Width;
                bend.Renderer = this.Renderer;
                this._bendGlyphs.push(bend);
            }
        }
    },
    ScaleToWidth: function (beatWidth){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.ScaleToWidth.call(this, beatWidth);
        for (var i = 0; i < this._bendGlyphs.length; i++){
            var g = this._bendGlyphs[i];
            g.Width = beatWidth - g.X;
        }
    },
    CreateTies: function (n){
        var renderer = this.Renderer;
        if (n.IsTieOrigin && renderer.ShowTiedNotes){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, n.TieDestination, false, false);
            this.Ties.push(tie);
        }
        if (n.IsTieDestination && renderer.ShowTiedNotes){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n.TieOrigin, n, false, true);
            this.Ties.push(tie);
        }
        else if (n.IsHammerPullOrigin){
            // only create tie for very first origin of "group"
            if (n.HammerPullOrigin == null){
                // tie with end note
                var destination = n.HammerPullDestination;
                while (destination.HammerPullDestination != null){
                    destination = destination.HammerPullDestination;
                }
                var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, destination, false, false);
                this.Ties.push(tie);
            }
        }
        else if (n.get_IsHammerPullDestination()){
            // only create tie for last destination of "group"
            // NOTE: HOPOs over more than 2 staffs does not work with this mechanism, but this sounds unrealistic
            if (n.HammerPullDestination == null){
                var origin = n.HammerPullOrigin;
                while (origin.HammerPullOrigin != null){
                    origin = origin.HammerPullOrigin;
                }
                var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(origin, n, false, true);
                this.Ties.push(tie);
            }
        }
        else if (n.SlideType == AlphaTab.Model.SlideType.Legato){
            var tie = new AlphaTab.Rendering.Glyphs.TabTieGlyph(n, n.SlideTarget, true, false);
            this.Ties.push(tie);
        }
        if (n.SlideType != AlphaTab.Model.SlideType.None){
            var l = new AlphaTab.Rendering.Glyphs.TabSlideLineGlyph(n.SlideType, n, this);
            this.Ties.push(l);
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.Glyphs.BeatContainerGlyph.prototype.Paint.call(this, cx, cy, canvas);
        for (var i = 0; i < this._bendGlyphs.length; i++){
            var g = this._bendGlyphs[i];
            g.Paint(cx + this.X, cy + this.Y, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph, AlphaTab.Rendering.Glyphs.BeatContainerGlyph);
AlphaTab.Rendering.Glyphs.TabBeatGlyph = function (){
    this.NoteNumbers = null;
    this.RestGlyph = null;
    AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatGlyph.prototype = {
    DoLayout: function (){
        var tabRenderer = this.Renderer;
        if (!this.Container.Beat.get_IsRest()){
            //
            // Note numbers
            this.NoteNumbers = new AlphaTab.Rendering.Glyphs.TabNoteChordGlyph(0, 0, this.Container.Beat.GraceType != AlphaTab.Model.GraceType.None);
            this.NoteNumbers.Beat = this.Container.Beat;
            this.NoteNumbers.BeamingHelper = this.BeamingHelper;
            for (var $i95 = 0,$t95 = this.Container.Beat.Notes,$l95 = $t95.length,note = $t95[$i95]; $i95 < $l95; $i95++, note = $t95[$i95]){
                this.CreateNoteGlyph(note);
            }
            this.AddGlyph(this.NoteNumbers);
            //
            // Whammy Bar
            if (this.Container.Beat.get_HasWhammyBar() && !this.NoteNumbers.BeatEffects.hasOwnProperty("Whammy")){
                this.NoteNumbers.BeatEffects["Whammy"] = new AlphaTab.Rendering.Glyphs.WhammyBarGlyph(this.Container.Beat, this.Container);
                var whammyValueHeight = (60 * this.get_Scale()) / 24;
                var whammyHeight = this.Container.Beat.MaxWhammyPoint.Value * whammyValueHeight;
                this.Renderer.RegisterOverflowTop(whammyHeight);
            }
            //
            // Tremolo Picking
            if (this.Container.Beat.get_IsTremolo() && !this.NoteNumbers.BeatEffects.hasOwnProperty("Tremolo")){
                var offset = 0;
                var speed = this.Container.Beat.TremoloSpeed;
                switch (speed){
                    case AlphaTab.Model.Duration.ThirtySecond:
                        offset = 10;
                        break;
                    case AlphaTab.Model.Duration.Sixteenth:
                        offset = 5;
                        break;
                    case AlphaTab.Model.Duration.Eighth:
                        offset = 0;
                        break;
                }
                this.NoteNumbers.BeatEffects["Tremolo"] = new AlphaTab.Rendering.Glyphs.TremoloPickingGlyph(5 * this.get_Scale(), offset * this.get_Scale(), this.Container.Beat.TremoloSpeed);
            }
            //
            // Note dots
            //
            if (this.Container.Beat.Dots > 0 && tabRenderer.RenderRhythm){
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
                for (var i = 0; i < this.Container.Beat.Dots; i++){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.CircleGlyph(0, tabRenderer.get_LineOffset() * tabRenderer.Bar.Staff.Track.Tuning.length + tabRenderer.RhythmHeight, 1.5 * this.get_Scale()));
                }
            }
        }
        else {
            var dotLine = 0;
            var line = 0;
            var offset = 0;
            switch (this.Container.Beat.Duration){
                case AlphaTab.Model.Duration.QuadrupleWhole:
                    line = 3;
                    dotLine = 2;
                    break;
                case AlphaTab.Model.Duration.DoubleWhole:
                    line = 3;
                    dotLine = 2;
                    break;
                case AlphaTab.Model.Duration.Whole:
                    line = 2;
                    dotLine = 2;
                    break;
                case AlphaTab.Model.Duration.Half:
                    line = 3;
                    dotLine = 3;
                    break;
                case AlphaTab.Model.Duration.Quarter:
                    line = 3;
                    dotLine = 2.5;
                    break;
                case AlphaTab.Model.Duration.Eighth:
                    line = 2;
                    dotLine = 2.5;
                    offset = 5;
                    break;
                case AlphaTab.Model.Duration.Sixteenth:
                    line = 2;
                    dotLine = 2.5;
                    offset = 5;
                    break;
                case AlphaTab.Model.Duration.ThirtySecond:
                    line = 3;
                    dotLine = 2.5;
                    break;
                case AlphaTab.Model.Duration.SixtyFourth:
                    line = 3;
                    dotLine = 2.5;
                    break;
                case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                    line = 3;
                    dotLine = 2.5;
                    break;
                case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                    line = 3;
                    dotLine = 2.5;
                    break;
            }
            var y = tabRenderer.GetTabY(line, offset);
            this.RestGlyph = new AlphaTab.Rendering.Glyphs.TabRestGlyph(0, y, tabRenderer.ShowRests, this.Container.Beat.Duration);
            this.RestGlyph.Beat = this.Container.Beat;
            this.RestGlyph.BeamingHelper = this.BeamingHelper;
            this.AddGlyph(this.RestGlyph);
            //
            // Note dots
            //
            if (this.Container.Beat.Dots > 0 && tabRenderer.ShowRests){
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
                for (var i = 0; i < this.Container.Beat.Dots; i++){
                    this.AddGlyph(new AlphaTab.Rendering.Glyphs.CircleGlyph(0, y, 1.5 * this.get_Scale()));
                }
            }
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
    UpdateBeamingHelper: function (){
        if (!this.Container.Beat.get_IsRest()){
            this.NoteNumbers.UpdateBeamingHelper(this.Container.X + this.X);
        }
        else {
            this.RestGlyph.UpdateBeamingHelper(this.Container.X + this.X);
        }
    },
    CreateNoteGlyph: function (n){
        var tr = this.Renderer;
        var noteNumberGlyph = new AlphaTab.Rendering.Glyphs.NoteNumberGlyph(0, 0, n);
        var l = n.Beat.Voice.Bar.Staff.Track.Tuning.length - n.String + 1;
        noteNumberGlyph.Y = tr.GetTabY(l, -2);
        noteNumberGlyph.Renderer = this.Renderer;
        noteNumberGlyph.DoLayout();
        this.NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabBeatGlyph, AlphaTab.Rendering.Glyphs.BeatOnNoteGlyphBase);
AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph = function (){
    AlphaTab.Rendering.Glyphs.BeatGlyphBase.call(this);
};
AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph.prototype = {
    DoLayout: function (){
        if (this.Container.Beat.BrushType != AlphaTab.Model.BrushType.None && !this.Container.Beat.get_IsRest()){
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.TabBrushGlyph(this.Container.Beat));
            this.AddGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 4 * this.get_Scale()));
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
        // TODO: Create webfont version
        var tabBarRenderer = this.Renderer;
        var res = this.Renderer.get_Resources();
        var startY = cy + this.X + (tabBarRenderer.GetNoteY(this._beat.get_MaxNote()) - res.TablatureFont.Size / 2);
        var endY = cy + this.Y + tabBarRenderer.GetNoteY(this._beat.get_MinNote()) + res.TablatureFont.Size / 2;
        var arrowX = ((cx + this.X + this.Width / 2)) | 0;
        var arrowSize = 8 * this.get_Scale();
        if (this._beat.BrushType != AlphaTab.Model.BrushType.None){
            if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.BrushDown){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, startY);
                canvas.LineTo(arrowX, endY);
                canvas.Stroke();
            }
            else {
                //var size = 15 * Scale;
                //var steps = Math.Abs(endY - startY) / size;
                //for (var i = 0; i < steps; i++)
                //{
                //    canvas.FillMusicFontSymbol(cx + X + (3 * Scale), 1, startY + (i * size), MusicFontSymbol.WaveVertical);
                //}
            }
            if (this._beat.BrushType == AlphaTab.Model.BrushType.BrushUp || this._beat.BrushType == AlphaTab.Model.BrushType.ArpeggioUp){
                canvas.BeginPath();
                canvas.MoveTo(arrowX, endY);
                canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
            }
            else {
                canvas.BeginPath();
                canvas.MoveTo(arrowX, startY);
                canvas.LineTo(arrowX + arrowSize / 2, startY + arrowSize);
                canvas.LineTo(arrowX - arrowSize / 2, startY + arrowSize);
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
    Paint: function (cx, cy, canvas){
        var strings = this.Renderer.Bar.Staff.Track.Tuning.length;
        var correction = strings * this.get_Scale() * 0.5;
        var symbol = strings <= 4 ? AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefTabSmall : AlphaTab.Rendering.Glyphs.MusicFontSymbol.ClefTab;
        var scale = strings <= 4 ? strings / 4.5 : strings / 6.5;
        canvas.FillMusicFontSymbol(cx + this.X + 5 * this.get_Scale(), cy + this.Y - correction, scale * this.get_Scale(), symbol);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabClefGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabNoteChordGlyph = function (x, y, isGrace){
    this._notes = null;
    this._isGrace = false;
    this.Beat = null;
    this.BeamingHelper = null;
    this.MinStringNote = null;
    this.BeatEffects = null;
    this.NotesPerString = null;
    AlphaTab.Rendering.Glyphs.Glyph.call(this, x, y);
    this._isGrace = isGrace;
    this._notes = [];
    this.BeatEffects = {};
    this.NotesPerString = {};
};
AlphaTab.Rendering.Glyphs.TabNoteChordGlyph.prototype = {
    GetNoteX: function (note, onEnd){
        if (this.NotesPerString.hasOwnProperty(note.String)){
            var n = this.NotesPerString[note.String];
            var pos = this.X + n.X;
            if (onEnd){
                pos += n.Width;
            }
            return pos;
        }
        return 0;
    },
    GetNoteY: function (note){
        if (this.NotesPerString.hasOwnProperty(note.String)){
            return this.Y + this.NotesPerString[note.String].Y;
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
        var effectY = this.GetNoteY(this.MinStringNote) + tabHeight / 2;
        // TODO: take care of actual glyph height
        var effectSpacing = 7 * this.get_Scale();
        for (var beatEffectKey in this.BeatEffects){
            var g = this.BeatEffects[beatEffectKey];
            g.Y += effectY;
            g.X += this.Width / 2;
            g.Renderer = this.Renderer;
            effectY += effectSpacing;
            g.DoLayout();
        }
        this.Width = w;
    },
    AddNoteGlyph: function (noteGlyph, note){
        this._notes.push(noteGlyph);
        this.NotesPerString[note.String] = noteGlyph;
        if (this.MinStringNote == null || note.String < this.MinStringNote.String)
            this.MinStringNote = note;
    },
    Paint: function (cx, cy, canvas){
        cx += this.X;
        cy += this.Y;
        var res = this.Renderer.get_Resources();
        var oldBaseLine = canvas.get_TextBaseline();
        canvas.set_TextBaseline(AlphaTab.Platform.Model.TextBaseline.Middle);
        canvas.set_Font(this._isGrace ? res.GraceFont : res.TablatureFont);
        var notes = this._notes;
        var w = this.Width;
        for (var $i96 = 0,$l96 = notes.length,g = notes[$i96]; $i96 < $l96; $i96++, g = notes[$i96]){
            g.Renderer = this.Renderer;
            g.Width = w;
            g.Paint(cx, cy, canvas);
        }
        canvas.set_TextBaseline(oldBaseLine);
        for (var beatEffectKey in this.BeatEffects){
            var g = this.BeatEffects[beatEffectKey];
            g.Paint(cx, cy, canvas);
        }
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null && this.BeamingHelper.IsPositionFrom("tab", this.Beat)){
            this.BeamingHelper.RegisterBeatLineX("tab", this.Beat, cx + this.X + this.Width, cx + this.X);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabNoteChordGlyph, AlphaTab.Rendering.Glyphs.Glyph);
AlphaTab.Rendering.Glyphs.TabRestGlyph = function (x, y, isVisibleRest, duration){
    this._isVisibleRest = false;
    this._duration = AlphaTab.Model.Duration.QuadrupleWhole;
    this.BeamingHelper = null;
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSymbol(duration));
    this._isVisibleRest = isVisibleRest;
    this._duration = duration;
};
AlphaTab.Rendering.Glyphs.TabRestGlyph.prototype = {
    DoLayout: function (){
        if (this._isVisibleRest){
            this.Width = AlphaTab.Rendering.Glyphs.ScoreRestGlyph.GetSize(this._duration) * this.get_Scale();
        }
        else {
            this.Width = 10 * this.get_Scale();
        }
    },
    UpdateBeamingHelper: function (cx){
        if (this.BeamingHelper != null && this.BeamingHelper.IsPositionFrom("tab", this.Beat)){
            this.BeamingHelper.RegisterBeatLineX("tab", this.Beat, cx + this.X + this.Width, cx + this.X);
        }
    },
    Paint: function (cx, cy, canvas){
        if (this._isVisibleRest){
            AlphaTab.Rendering.Glyphs.MusicFontGlyph.prototype.Paint.call(this, cx, cy, canvas);
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabRestGlyph, AlphaTab.Rendering.Glyphs.MusicFontGlyph);
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
    Paint: function (cx, cy, canvas){
        var r = this.Renderer;
        cx += r.X;
        cy += r.Y;
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
                endX = cx + this._parent.X;
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
AlphaTab.Rendering.Glyphs.TabTieGlyph = function (startNote, endNote, forSlide, forEnd){
    this._startNote = null;
    this._endNote = null;
    this._forSlide = false;
    AlphaTab.Rendering.Glyphs.TieGlyph.call(this, startNote.Beat, endNote.Beat, forEnd);
    this._startNote = startNote;
    this._endNote = endNote;
    this._forSlide = forSlide;
};
AlphaTab.Rendering.Glyphs.TabTieGlyph.prototype = {
    get_Offset: function (){
        return this._forSlide ? 5 * this.get_Scale() : 0;
    },
    GetBeamDirection: function (beat, noteRenderer){
        return this._startNote.String > 3 ? AlphaTab.Rendering.Utils.BeamDirection.Down : AlphaTab.Rendering.Utils.BeamDirection.Up;
    },
    GetStartY: function (noteRenderer, direction){
        return noteRenderer.GetNoteY(this._startNote) - this.get_Offset();
    },
    GetEndY: function (noteRenderer, direction){
        return noteRenderer.GetNoteY(this._endNote) - this.get_Offset();
    },
    GetStartX: function (noteRenderer){
        return noteRenderer.GetNoteX(this._startNote, true);
    },
    GetEndX: function (noteRenderer){
        return noteRenderer.GetNoteX(this._endNote, false);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabTieGlyph, AlphaTab.Rendering.Glyphs.TieGlyph);
AlphaTab.Rendering.Glyphs.TempoGlyph = function (x, y, tempo){
    this._tempo = 0;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._tempo = tempo;
};
AlphaTab.Rendering.Glyphs.TempoGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 25 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.MarkerFont);
        canvas.FillMusicFontSymbol(cx + this.X, cy + this.Y + this.Height * 0.8, 0.75, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
        canvas.FillText("= " + this._tempo, cx + this.X + (this.Height / 2), cy + this.Y + canvas.get_Font().Size / 2);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TempoGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TextGlyph = function (x, y, text, font, textAlign){
    this._text = null;
    this.Font = null;
    this.TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
    this._text = text;
    this.Font = font;
    this.TextAlign = textAlign;
};
AlphaTab.Rendering.Glyphs.TextGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = this.Font.Size;
    },
    Paint: function (cx, cy, canvas){
        canvas.set_Font(this.Font);
        var old = canvas.get_TextAlign();
        canvas.set_TextAlign(this.TextAlign);
        canvas.FillText(this._text, cx + this.X, cy + this.Y);
        canvas.set_TextAlign(old);
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TextGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TimeSignatureGlyph = function (x, y, numerator, denominator, isCommon){
    this._numerator = 0;
    this._denominator = 0;
    this._isCommon = false;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._numerator = numerator;
    this._denominator = denominator;
    this._isCommon = isCommon;
};
AlphaTab.Rendering.Glyphs.TimeSignatureGlyph.prototype = {
    DoLayout: function (){
        if (this._isCommon && this._numerator == 2 && this._denominator == 2){
            var common = new AlphaTab.Rendering.Glyphs.MusicFontGlyph(0, this.get_CommonY(), this.get_CommonScale(), AlphaTab.Rendering.Glyphs.MusicFontSymbol.TimeSignatureCutCommon);
            common.Width = 14 * this.get_Scale();
            this.AddGlyph(common);
            AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.DoLayout.call(this);
        }
        else if (this._isCommon && this._numerator == 4 && this._denominator == 4){
            var common = new AlphaTab.Rendering.Glyphs.MusicFontGlyph(0, this.get_CommonY(), this.get_CommonScale(), AlphaTab.Rendering.Glyphs.MusicFontSymbol.TimeSignatureCommon);
            common.Width = 14 * this.get_Scale();
            this.AddGlyph(common);
            AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.DoLayout.call(this);
        }
        else {
            var numerator = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, this.get_NumeratorY(), this._numerator, this.get_NumberScale());
            var denominator = new AlphaTab.Rendering.Glyphs.NumberGlyph(0, this.get_DenominatorY(), this._denominator, this.get_NumberScale());
            this.AddGlyph(numerator);
            this.AddGlyph(denominator);
            AlphaTab.Rendering.Glyphs.GlyphGroup.prototype.DoLayout.call(this);
            for (var i = 0,j = this.Glyphs.length; i < j; i++){
                var g = this.Glyphs[i];
                g.X = (this.Width - g.Width) / 2;
            }
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TimeSignatureGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.ScoreTimeSignatureGlyph = function (x, y, numerator, denominator, isCommon){
    AlphaTab.Rendering.Glyphs.TimeSignatureGlyph.call(this, x, y, numerator, denominator, isCommon);
};
AlphaTab.Rendering.Glyphs.ScoreTimeSignatureGlyph.prototype = {
    get_CommonY: function (){
        var renderer = this.Renderer;
        return renderer.GetScoreY(4, 0);
    },
    get_NumeratorY: function (){
        return 2 * this.get_Scale();
    },
    get_DenominatorY: function (){
        return 20 * this.get_Scale();
    },
    get_CommonScale: function (){
        return 1;
    },
    get_NumberScale: function (){
        return 1;
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.ScoreTimeSignatureGlyph, AlphaTab.Rendering.Glyphs.TimeSignatureGlyph);
AlphaTab.Rendering.Glyphs.TabTimeSignatureGlyph = function (x, y, numerator, denominator, isCommon){
    AlphaTab.Rendering.Glyphs.TimeSignatureGlyph.call(this, x, y, numerator, denominator, isCommon);
};
AlphaTab.Rendering.Glyphs.TabTimeSignatureGlyph.prototype = {
    get_CommonY: function (){
        var renderer = this.Renderer;
        return renderer.GetTabY(0, 0);
    },
    get_NumeratorY: function (){
        var renderer = this.Renderer;
        var offset = renderer.Bar.Staff.Track.Tuning.length <= 4 ? 0.25 : 0.3333333;
        return renderer.get_LineOffset() * renderer.Bar.Staff.Track.Tuning.length * offset * this.get_Scale();
    },
    get_DenominatorY: function (){
        var renderer = this.Renderer;
        var offset = renderer.Bar.Staff.Track.Tuning.length <= 4 ? 0.6 : 0.6;
        return renderer.get_LineOffset() * renderer.Bar.Staff.Track.Tuning.length * offset * this.get_Scale();
    },
    get_CommonScale: function (){
        return 1;
    },
    get_NumberScale: function (){
        var renderer = this.Renderer;
        if (renderer.Bar.Staff.Track.Tuning.length <= 4){
            return 0.75;
        }
        else {
            return 1;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TabTimeSignatureGlyph, AlphaTab.Rendering.Glyphs.TimeSignatureGlyph);
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph = function (x, y, duration){
    AlphaTab.Rendering.Glyphs.MusicFontGlyph.call(this, x, y, 1, AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.GetSymbol(duration));
};
AlphaTab.Rendering.Glyphs.TremoloPickingGlyph.prototype = {
    DoLayout: function (){
        this.Width = 12 * this.get_Scale();
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
AlphaTab.Rendering.Glyphs.TrillGlyph = function (x, y){
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, x, y);
};
AlphaTab.Rendering.Glyphs.TrillGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 20 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        var res = this.Renderer.get_Resources();
        canvas.set_Font(res.MarkerFont);
        var textw = canvas.MeasureText("tr");
        canvas.FillText("tr", cx + this.X, cy + this.Y + canvas.get_Font().Size / 2);
        var startX = textw + 3 * this.get_Scale();
        var endX = this.Width - startX;
        var waveScale = 1.2;
        var step = 11 * this.get_Scale() * waveScale;
        var loops = Math.max(1, ((endX - startX) / step));
        var loopX = startX;
        var loopY = cy + this.Y + this.Height;
        for (var i = 0; i < loops; i++){
            canvas.FillMusicFontSymbol(cx + this.X + loopX, loopY, waveScale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal);
            loopX += step;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TrillGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TripletFeelGlyph = function (tripletFeel){
    this._tripletFeel = AlphaTab.Model.TripletFeel.NoTripletFeel;
    AlphaTab.Rendering.Glyphs.EffectGlyph.call(this, 0, 0);
    this._tripletFeel = tripletFeel;
};
AlphaTab.Rendering.Glyphs.TripletFeelGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 25 * this.get_Scale();
    },
    Paint: function (cx, cy, canvas){
        cx += this.X;
        cy += this.Y;
        var noteY = cy + this.Height * 0.75;
        canvas.set_Font(this.Renderer.get_Resources().EffectFont);
        canvas.FillText("(", cx, cy + this.Height * 0.3);
        var leftNoteX = cx + (10 * this.get_Scale());
        var rightNoteX = cx + (40 * this.get_Scale());
        switch (this._tripletFeel){
            case AlphaTab.Model.TripletFeel.NoTripletFeel:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                break;
            case AlphaTab.Model.TripletFeel.Triplet8th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                canvas.FillMusicFontSymbol(rightNoteX, noteY, 0.4, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
                canvas.FillMusicFontSymbol(rightNoteX + (12 * this.get_Scale()), noteY, 0.4, AlphaTab.Rendering.Glyphs.MusicFontSymbol.NoteEighth);
                this.RenderTriplet(rightNoteX, cy, canvas);
                break;
            case AlphaTab.Model.TripletFeel.Triplet16th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight]);
                this.RenderTriplet(rightNoteX, cy, canvas);
                break;
            case AlphaTab.Model.TripletFeel.Dotted8th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight]);
                canvas.FillCircle(rightNoteX + (9 * this.get_Scale()), noteY, this.get_Scale());
                break;
            case AlphaTab.Model.TripletFeel.Dotted16th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight]);
                canvas.FillCircle(rightNoteX + (9 * this.get_Scale()), noteY, this.get_Scale());
                break;
            case AlphaTab.Model.TripletFeel.Scottish8th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialLeft]);
                canvas.FillCircle(rightNoteX + (12 * this.get_Scale()) + (8 * this.get_Scale()), noteY, this.get_Scale());
                break;
            case AlphaTab.Model.TripletFeel.Scottish16th:
                this.RenderBarNote(leftNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full]);
                this.RenderBarNote(rightNoteX, noteY, 0.4, canvas, [AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full, AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialLeft]);
                canvas.FillCircle(rightNoteX + (12 * this.get_Scale()) + (8 * this.get_Scale()), noteY, this.get_Scale());
                break;
        }
        canvas.FillText("=", cx + (30 * this.get_Scale()), cy + (5 * this.get_Scale()));
        canvas.FillText(")", cx + (65 * this.get_Scale()), cy + this.Height * 0.3);
    },
    RenderBarNote: function (cx, noteY, noteScale, canvas, bars){
        canvas.FillMusicFontSymbol(cx, noteY, noteScale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
        var partialBarWidth = (6) * this.get_Scale();
        for (var i = 0; i < bars.length; i++){
            switch (bars[i]){
                case AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.Full:
                    canvas.FillRect(cx + (4 * this.get_Scale()), noteY - (12 * this.get_Scale()) + (3 * this.get_Scale() * i), 12 * this.get_Scale(), 2 * this.get_Scale());
                    break;
                case AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialLeft:
                    canvas.FillRect(cx + (4 * this.get_Scale()), noteY - (12 * this.get_Scale()) + (3 * this.get_Scale() * i), partialBarWidth, 2 * this.get_Scale());
                    break;
                case AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType.PartialRight:
                    canvas.FillRect(cx + (4 * this.get_Scale()) + partialBarWidth, noteY - (12 * this.get_Scale()) + (3 * this.get_Scale() * i), partialBarWidth, 2 * this.get_Scale());
                    break;
            }
        }
        canvas.FillMusicFontSymbol(cx + (12 * this.get_Scale()), noteY, noteScale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.Tempo);
    },
    RenderTriplet: function (cx, cy, canvas){
        cy += 2 * this.get_Scale();
        var font = this.Renderer.get_Resources().EffectFont;
        canvas.set_Font(new AlphaTab.Platform.Model.Font(font.Family, font.Size * 0.8, font.Style));
        var rightX = cx + 12 * this.get_Scale() + 3 * this.get_Scale();
        canvas.BeginPath();
        canvas.MoveTo(cx, cy + (3 * this.get_Scale()));
        canvas.LineTo(cx, cy);
        canvas.LineTo(cx + (5 * this.get_Scale()), cy);
        canvas.MoveTo(rightX + (5 * this.get_Scale()), cy + (3 * this.get_Scale()));
        canvas.LineTo(rightX + (5 * this.get_Scale()), cy);
        canvas.LineTo(rightX, cy);
        canvas.Stroke();
        canvas.FillText("3", cx + (7 * this.get_Scale()), cy - (10 * this.get_Scale()));
        canvas.set_Font(font);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.NoteScale = 0.4;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.NoteHeight = 12;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.NoteSeparation = 12;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarHeight = 2;
    AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarSeparation = 3;
});
$Inherit(AlphaTab.Rendering.Glyphs.TripletFeelGlyph, AlphaTab.Rendering.Glyphs.EffectGlyph);
AlphaTab.Rendering.Glyphs.TuningGlyph = function (x, y, scale, resources, tuning){
    this._scale = 0;
    this._resources = null;
    this.Height = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this._scale = scale;
    this._resources = resources;
    this.CreateGlyphs(tuning);
};
AlphaTab.Rendering.Glyphs.TuningGlyph.prototype = {
    CreateGlyphs: function (tuning){
        // Name
        this.AddGlyph(new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, tuning.Name, this._resources.EffectFont, AlphaTab.Platform.Model.TextAlign.Left));
        this.Height += 15 * this._scale;
        if (!tuning.IsStandard){
            // Strings
            var stringsPerColumn = (Math.ceil(tuning.Tunings.length / 2)) | 0;
            var currentX = 0;
            var currentY = this.Height;
            for (var i = 0,j = tuning.Tunings.length; i < j; i++){
                var str = "(" + (i + 1) + ") = " + AlphaTab.Model.Tuning.GetTextForTuning(tuning.Tunings[i], false);
                this.AddGlyph(new AlphaTab.Rendering.Glyphs.TextGlyph(currentX, currentY, str, this._resources.EffectFont, AlphaTab.Platform.Model.TextAlign.Left));
                currentY += this.Height;
                if (i == stringsPerColumn - 1){
                    currentY = this.Height;
                    currentX += (43 * this._scale);
                }
            }
            this.Height += (stringsPerColumn * (15 * this._scale));
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.TuningGlyph, AlphaTab.Rendering.Glyphs.GlyphGroup);
AlphaTab.Rendering.Glyphs.VibratoGlyph = function (x, y, scale){
    this._scale = 0;
    AlphaTab.Rendering.Glyphs.GroupedEffectGlyph.call(this, AlphaTab.Rendering.BeatXPosition.EndBeat);
    this._scale = scale;
    this.X = x;
    this.Y = y;
};
AlphaTab.Rendering.Glyphs.VibratoGlyph.prototype = {
    DoLayout: function (){
        AlphaTab.Rendering.Glyphs.Glyph.prototype.DoLayout.call(this);
        this.Height = 10 * this.get_Scale() * this._scale;
    },
    PaintGrouped: function (cx, cy, endX, canvas){
        var startX = cx + this.X;
        var width = endX - startX;
        var step = 9 * this.get_Scale() * this._scale;
        var loops = (Math.max(1, width / step)) | 0;
        var h = this.Height;
        var loopX = 0;
        for (var i = 0; i < loops; i++){
            canvas.FillMusicFontSymbol(cx + this.X + loopX, cy + this.Y + h, this._scale, AlphaTab.Rendering.Glyphs.MusicFontSymbol.WaveHorizontal);
            loopX += step;
        }
    }
};
$Inherit(AlphaTab.Rendering.Glyphs.VibratoGlyph, AlphaTab.Rendering.Glyphs.GroupedEffectGlyph);
AlphaTab.Rendering.Glyphs.VoiceContainerGlyph = function (x, y, voice){
    this.BeatGlyphs = null;
    this.Voice = null;
    this.MinWidth = 0;
    AlphaTab.Rendering.Glyphs.GlyphGroup.call(this, x, y);
    this.Voice = voice;
    this.BeatGlyphs = [];
};
AlphaTab.Rendering.Glyphs.VoiceContainerGlyph.prototype = {
    ScaleToWidth: function (width){
        var force = this.Renderer.LayoutingInfo.SpaceToForce(width);
        this.ScaleToForce(force);
    },
    ScaleToForce: function (force){
        this.Width = this.Renderer.LayoutingInfo.CalculateVoiceWidth(force);
        var positions = this.Renderer.LayoutingInfo.BuildOnTimePositions(force);
        var beatGlyphs = this.BeatGlyphs;
        for (var i = 0,j = beatGlyphs.length; i < j; i++){
            var currentBeatGlyph = beatGlyphs[i];
            var time = currentBeatGlyph.Beat.get_AbsoluteStart();
            currentBeatGlyph.X = positions[time] - currentBeatGlyph.OnTimeX;
            // size always previousl glyph after we know the position
            // of the next glyph
            if (i > 0){
                var beatWidth = currentBeatGlyph.X - beatGlyphs[i - 1].X;
                beatGlyphs[i - 1].ScaleToWidth(beatWidth);
            }
            // for the last glyph size based on the full width
            if (i == j - 1){
                var beatWidth = this.Width - beatGlyphs[beatGlyphs.length - 1].X;
                currentBeatGlyph.ScaleToWidth(beatWidth);
            }
        }
    },
    RegisterLayoutingInfo: function (info){
        info.UpdateVoiceSize(this.Width);
        var beatGlyphs = this.BeatGlyphs;
        for (var $i97 = 0,$l97 = beatGlyphs.length,b = beatGlyphs[$i97]; $i97 < $l97; $i97++, b = beatGlyphs[$i97]){
            b.RegisterLayoutingInfo(info);
        }
    },
    ApplyLayoutingInfo: function (info){
        var beatGlyphs = this.BeatGlyphs;
        for (var $i98 = 0,$l98 = beatGlyphs.length,b = beatGlyphs[$i98]; $i98 < $l98; $i98++, b = beatGlyphs[$i98]){
            b.ApplyLayoutingInfo(info);
        }
        this.ScaleToForce(Math.max(this.Renderer.get_Settings().StretchForce, info.MinStretchForce));
    },
    AddGlyph: function (g){
        g.X = this.BeatGlyphs.length == 0 ? 0 : this.BeatGlyphs[this.BeatGlyphs.length - 1].X + this.BeatGlyphs[this.BeatGlyphs.length - 1].Width;
        g.Renderer = this.Renderer;
        g.DoLayout();
        this.BeatGlyphs.push(g);
        this.Width = g.X + g.Width;
    },
    DoLayout: function (){
        this.MinWidth = this.Width;
    },
    Paint: function (cx, cy, canvas){
        //canvas.Color = new Color((byte)Std.Random(255), (byte)Std.Random(255), (byte)Std.Random(255), 80);
        //canvas.FillRect(cx + X, cy + Y, Width, 100);
        //if (Voice.Index == 0)
        //{
        //    PaintSprings(cx + X, cy + Y, canvas);
        //}
        canvas.set_Color(this.Voice.Index == 0 ? this.Renderer.ScoreRenderer.RenderingResources.MainGlyphColor : this.Renderer.ScoreRenderer.RenderingResources.SecondaryGlyphColor);
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
        var track = this.Renderer.Bar.Staff.Track;
        var tabTop = tabBarRenderer.GetTabY(0, -2);
        var tabBottom = tabBarRenderer.GetTabY(track.Tuning.length, -2);
        var absMinY = minY + tabTop;
        var absMaxY = maxY - tabBottom;
        if (absMinY < 0)
            tabBarRenderer.RegisterOverflowTop(Math.abs(absMinY));
        if (absMaxY > 0)
            tabBarRenderer.RegisterOverflowBottom(Math.abs(absMaxY));
    },
    Paint: function (cx, cy, canvas){
        var tabBarRenderer = this.Renderer;
        var res = this.Renderer.get_Resources();
        var startX = cx + this.X + this._parent.OnNotes.Width / 2;
        var endX = this._beat.NextBeat == null || this._beat.Voice != this._beat.NextBeat.Voice ? cx + this.X + this._parent.Width : cx + tabBarRenderer.GetBeatX(this._beat.NextBeat, AlphaTab.Rendering.BeatXPosition.PreNotes);
        var startY = cy;
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
                    var dv = pt2.Value;
                    var s = "";
                    if (dv >= 4 || dv <= -4){
                        var steps = (dv / 4) | 0;
                        s += steps;
                        // Quaters
                        dv -= steps * 4;
                    }
                    if (dv > 0){
                        s += AlphaTab.Rendering.Glyphs.BendGlyph.GetFractionSign(dv);
                    }
                    if (s != ""){
                        // draw label
                        canvas.set_Font(res.GraceFont);
                        //var size = canvas.MeasureText(s);
                        var sy = pt2Y;
                        if (pt2Y < pt1Y){
                            sy -= canvas.get_Font().Size;
                        }
                        else {
                            sy += 3 * this.get_Scale();
                        }
                        var sx = pt2X;
                        canvas.FillText(s, sx, sy);
                    }
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
    this.FirstMasterBarIndex = 0;
    this.LastMasterBarIndex = 0;
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
    this.ScoreInfoGlyphs = null;
    this.TuningGlyph = null;
    this.Renderer = null;
    this.Width = 0;
    this.Height = 0;
    this.Renderer = renderer;
    this._barRendererLookup = {};
};
AlphaTab.Rendering.Layout.ScoreLayout.prototype = {
    LayoutAndRender: function (){
        this.CreateScoreInfoGlyphs();
        this.DoLayoutAndRender();
    },
    CreateScoreInfoGlyphs: function (){
        AlphaTab.Util.Logger.Info("ScoreLayout", "Creating score info glyphs", null);
        var flags = this.Renderer.Settings.Layout.Get("hideInfo", false) ? AlphaTab.Rendering.Layout.HeaderFooterElements.None : AlphaTab.Rendering.Layout.HeaderFooterElements.All;
        var score = this.Renderer.Score;
        var res = this.Renderer.RenderingResources;
        this.ScoreInfoGlyphs = {};
        if (!((score.Title==null)||(score.Title.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Title) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Title] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.Title, res.TitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.SubTitle==null)||(score.SubTitle.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.SubTitle, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.Artist==null)||(score.Artist.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Artist) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Artist] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.Artist, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.Album==null)||(score.Album.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Album) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Album] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, score.Album, res.SubTitleFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        if (!((score.Music==null)||(score.Music.length==0)) && score.Music == score.Words && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
            this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Music and Words by " + score.Words, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Center);
        }
        else {
            if (!((score.Music==null)||(score.Music.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Music) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
                this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Music] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Music by " + score.Music, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Right);
            }
            if (!((score.Words==null)||(score.Words.length==0)) && (flags & AlphaTab.Rendering.Layout.HeaderFooterElements.Words) != AlphaTab.Rendering.Layout.HeaderFooterElements.None){
                this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Words] = new AlphaTab.Rendering.Glyphs.TextGlyph(0, 0, "Words by " + score.Music, res.WordsFont, AlphaTab.Platform.Model.TextAlign.Left);
            }
        }
        // tuning info
        if (this.Renderer.Tracks.length == 1 && !this.Renderer.Tracks[0].IsPercussion && !this.Renderer.Settings.Layout.Get("hideTuning", false)){
            var tuning = AlphaTab.Model.Tuning.FindTuning(this.Renderer.Tracks[0].Tuning);
            if (tuning != null){
                this.TuningGlyph = new AlphaTab.Rendering.Glyphs.TuningGlyph(0, 0, this.get_Scale(), this.Renderer.RenderingResources, tuning);
            }
        }
    },
    get_Scale: function (){
        return this.Renderer.Settings.Scale;
    },
    CreateEmptyStaveGroup: function (){
        var group = new AlphaTab.Rendering.Staves.StaveGroup();
        group.Layout = this;
        for (var trackIndex = 0; trackIndex < this.Renderer.Tracks.length; trackIndex++){
            var track = this.Renderer.Tracks[trackIndex];
            var staveProfile;
            // use optimal profile for track 
            if (track.IsPercussion){
                staveProfile = "score";
            }
            else if (track.get_IsStringed()){
                staveProfile = this.Renderer.Settings.Staves.Id;
            }
            else {
                staveProfile = "score";
            }
            var profile = AlphaTab.Environment.StaveProfiles.hasOwnProperty(staveProfile) ? AlphaTab.Environment.StaveProfiles[staveProfile] : AlphaTab.Environment.StaveProfiles["default"];
            for (var staveIndex = 0; staveIndex < track.Staves.length; staveIndex++){
                for (var renderStaveIndex = 0; renderStaveIndex < profile.length; renderStaveIndex++){
                    var factory = profile[renderStaveIndex];
                    var staff = track.Staves[staveIndex];
                    if (factory.CanCreate(track, staff)){
                        group.AddStaff(track, new AlphaTab.Rendering.Staves.Staff(trackIndex, staff, factory));
                    }
                }
            }
        }
        return group;
    },
    RegisterBarRenderer: function (key, renderer){
        if (!this._barRendererLookup.hasOwnProperty(key)){
            this._barRendererLookup[key] = {};
        }
        this._barRendererLookup[key][renderer.Bar.Id] = renderer;
    },
    UnregisterBarRenderer: function (key, renderer){
        if (this._barRendererLookup.hasOwnProperty(key)){
            var lookup = this._barRendererLookup[key];
            delete lookup[renderer.Bar.Id];
        }
    },
    GetRendererForBar: function (key, bar){
        var barRendererId = bar.Id;
        if (this._barRendererLookup.hasOwnProperty(key) && this._barRendererLookup[key].hasOwnProperty(barRendererId)){
            return this._barRendererLookup[key][barRendererId];
        }
        return null;
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
        canvas.FillText(msg, x, resources.CopyrightFont.Size);
        var result = canvas.EndRender();
        this.Renderer.OnPartialRenderFinished((function (){
            var $v3 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v3.Width = this.Width;
            $v3.Height = height;
            $v3.RenderResult = result;
            $v3.TotalWidth = this.Width;
            $v3.TotalHeight = this.Height;
            $v3.FirstMasterBarIndex = -1;
            $v3.LastMasterBarIndex = -1;
            return $v3;
        }).call(this));
    }
};
AlphaTab.Rendering.Layout.HorizontalScreenLayout = function (renderer){
    this._group = null;
    AlphaTab.Rendering.Layout.ScoreLayout.call(this, renderer);
};
AlphaTab.Rendering.Layout.HorizontalScreenLayout.prototype = {
    get_Name: function (){
        return "HorizontalScreen";
    },
    get_SupportsResize: function (){
        return false;
    },
    Resize: function (){
        // resizing has no effect on this layout
    },
    DoLayoutAndRender: function (){
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
        this._group = this.CreateEmptyStaveGroup();
        this._group.IsLast = true;
        this._group.X = AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[0];
        this._group.Y = AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[1];
        var countPerPartial = this.Renderer.Settings.Layout.Get("countPerPartial", 10);
        var partials = [];
        var currentPartial = new AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo();
        while (currentBarIndex <= endBarIndex){
            var result = this._group.AddBars(this.Renderer.Tracks, currentBarIndex);
            // if we detect that the new renderer is linked to the previous
            // renderer, we need to put it into the previous partial 
            if (currentPartial.MasterBars.length == 0 && result.IsLinkedToPrevious && partials.length > 0){
                var previousPartial = partials[partials.length - 1];
                previousPartial.MasterBars.push(score.MasterBars[currentBarIndex]);
                previousPartial.Width += result.Width;
            }
            else {
                currentPartial.MasterBars.push(score.MasterBars[currentBarIndex]);
                currentPartial.Width += result.Width;
                // no targetPartial here because previous partials already handled this code
                if (currentPartial.MasterBars.length >= countPerPartial){
                    if (partials.length == 0){
                        currentPartial.Width += this._group.X + this._group.AccoladeSpacing;
                    }
                    partials.push(currentPartial);
                    AlphaTab.Util.Logger.Info(this.get_Name(), "Finished partial from bar " + currentPartial.MasterBars[0].Index + " to " + currentPartial.MasterBars[currentPartial.MasterBars.length - 1].Index, null);
                    currentPartial = new AlphaTab.Rendering.Layout.HorizontalScreenLayoutPartialInfo();
                }
            }
            currentBarIndex++;
        }
        // don't miss the last partial if not empty
        if (currentPartial.MasterBars.length > 0){
            if (partials.length == 0){
                currentPartial.Width += this._group.X + this._group.AccoladeSpacing;
            }
            partials.push(currentPartial);
            AlphaTab.Util.Logger.Info(this.get_Name(), "Finished partial from bar " + currentPartial.MasterBars[0].Index + " to " + currentPartial.MasterBars[currentPartial.MasterBars.length - 1].Index, null);
        }
        this._group.FinalizeGroup();
        this.Height = this._group.Y + this._group.get_Height() + AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[3];
        this.Width = this._group.X + this._group.Width + AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding[2];
        currentBarIndex = 0;
        for (var i = 0; i < partials.length; i++){
            var partial = partials[i];
            canvas.BeginRender(partial.Width, this.Height);
            canvas.set_Color(this.Renderer.RenderingResources.MainGlyphColor);
            canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
            var renderX = this._group.GetBarX(partial.MasterBars[0].Index) + this._group.AccoladeSpacing;
            if (i == 0){
                renderX -= this._group.X + this._group.AccoladeSpacing;
            }
            AlphaTab.Util.Logger.Info(this.get_Name(), "Rendering partial from bar " + partial.MasterBars[0].Index + " to " + partial.MasterBars[partial.MasterBars.length - 1].Index, null);
            this._group.PaintPartial(-renderX, this._group.Y, this.Renderer.Canvas, currentBarIndex, partial.MasterBars.length);
            var result = canvas.EndRender();
            this.Renderer.OnPartialRenderFinished((function (){
                var $v4 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                $v4.TotalWidth = this.Width;
                $v4.TotalHeight = this.Height;
                $v4.Width = partial.Width;
                $v4.Height = this.Height;
                $v4.RenderResult = result;
                $v4.FirstMasterBarIndex = partial.MasterBars[0].Index;
                $v4.LastMasterBarIndex = partial.MasterBars[partial.MasterBars.length - 1].Index;
                return $v4;
            }).call(this));
            currentBarIndex += partial.MasterBars.length;
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Layout.HorizontalScreenLayout.PagePadding = new Float32Array([20, 20, 20, 20]);
    AlphaTab.Rendering.Layout.HorizontalScreenLayout.GroupSpacing = 20;
});
$Inherit(AlphaTab.Rendering.Layout.HorizontalScreenLayout, AlphaTab.Rendering.Layout.ScoreLayout);
AlphaTab.Rendering.Layout.PageViewLayout = function (renderer){
    this._groups = null;
    this._allMasterBarRenderers = null;
    this._barsFromPreviousGroup = null;
    AlphaTab.Rendering.Layout.ScoreLayout.call(this, renderer);
};
AlphaTab.Rendering.Layout.PageViewLayout.prototype = {
    get_Name: function (){
        return "PageView";
    },
    DoLayoutAndRender: function (){
        var x = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0];
        var y = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[1];
        this.Width = this.Renderer.Settings.Width;
        this._allMasterBarRenderers = [];
        // 
        // 1. Score Info
        y = this.LayoutAndRenderScoreInfo(x, y, -1);
        //
        // 2. One result per StaveGroup
        y = this.LayoutAndRenderScore(x, y);
        this.Height = y + AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[3];
    },
    get_SupportsResize: function (){
        return true;
    },
    Resize: function (){
        var x = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0];
        var y = AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[1];
        this.Width = this.Renderer.Settings.Width;
        var oldHeight = this.Height;
        // 
        // 1. Score Info
        y = this.LayoutAndRenderScoreInfo(x, y, oldHeight);
        //
        // 2. One result per StaveGroup
        y = this.ResizeAndRenderScore(x, y, oldHeight);
        this.Height = y + AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[3];
    },
    LayoutAndRenderScoreInfo: function (x, y, totalHeight){
        AlphaTab.Util.Logger.Info(this.get_Name(), "Layouting score info", null);
        var scale = this.get_Scale();
        var res = this.Renderer.RenderingResources;
        var centeredGlyphs = [AlphaTab.Rendering.Layout.HeaderFooterElements.Title, AlphaTab.Rendering.Layout.HeaderFooterElements.SubTitle, AlphaTab.Rendering.Layout.HeaderFooterElements.Artist, AlphaTab.Rendering.Layout.HeaderFooterElements.Album, AlphaTab.Rendering.Layout.HeaderFooterElements.WordsAndMusic];
        for (var i = 0; i < centeredGlyphs.length; i++){
            if (this.ScoreInfoGlyphs.hasOwnProperty(centeredGlyphs[i])){
                var glyph = this.ScoreInfoGlyphs[centeredGlyphs[i]];
                glyph.X = this.Width / 2;
                glyph.Y = y;
                glyph.TextAlign = AlphaTab.Platform.Model.TextAlign.Center;
                y += glyph.Font.Size;
            }
        }
        var musicOrWords = false;
        var musicOrWordsHeight = 0;
        if (this.ScoreInfoGlyphs.hasOwnProperty(AlphaTab.Rendering.Layout.HeaderFooterElements.Music)){
            var glyph = this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Music];
            glyph.X = this.Width - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[2];
            glyph.Y = y;
            glyph.TextAlign = AlphaTab.Platform.Model.TextAlign.Right;
            musicOrWords = true;
            musicOrWordsHeight = glyph.Font.Size;
        }
        if (this.ScoreInfoGlyphs.hasOwnProperty(AlphaTab.Rendering.Layout.HeaderFooterElements.Words)){
            var glyph = this.ScoreInfoGlyphs[AlphaTab.Rendering.Layout.HeaderFooterElements.Words];
            glyph.X = x;
            glyph.Y = y;
            glyph.TextAlign = AlphaTab.Platform.Model.TextAlign.Left;
            musicOrWords = true;
            musicOrWordsHeight = glyph.Font.Size;
        }
        if (musicOrWords){
            y += musicOrWordsHeight;
        }
        if (this.TuningGlyph != null){
            y += 20 * scale;
            this.TuningGlyph.X = x;
            this.TuningGlyph.Y = y;
            y += this.TuningGlyph.Height;
        }
        y += 20 * scale;
        var canvas = this.Renderer.Canvas;
        canvas.BeginRender(this.Width, y);
        canvas.set_Color(res.ScoreInfoColor);
        canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Center);
        for (var key in this.ScoreInfoGlyphs){
            this.ScoreInfoGlyphs[key].Paint(0, 0, canvas);
        }
        if (this.TuningGlyph != null){
            this.TuningGlyph.Paint(0, 0, canvas);
        }
        var result = canvas.EndRender();
        this.Renderer.OnPartialRenderFinished((function (){
            var $v5 = new AlphaTab.Rendering.RenderFinishedEventArgs();
            $v5.Width = this.Width;
            $v5.Height = y;
            $v5.RenderResult = result;
            $v5.TotalWidth = this.Width;
            $v5.TotalHeight = totalHeight < 0 ? y : totalHeight;
            $v5.FirstMasterBarIndex = -1;
            $v5.LastMasterBarIndex = -1;
            return $v5;
        }).call(this));
        return y;
    },
    ResizeAndRenderScore: function (x, y, oldHeight){
        var canvas = this.Renderer.Canvas;
        // if we have a fixed number of bars per row, we only need to refit them. 
        if (this.Renderer.Settings.Layout.Get("barsPerRow", -1) != -1){
            for (var i = 0; i < this._groups.length; i++){
                var group = this._groups[i];
                this.FitGroup(group);
                group.FinalizeGroup();
                y += this.PaintGroup(group, oldHeight, canvas);
            }
        }
        else {
            this._groups = [];
            var currentIndex = 0;
            var maxWidth = this.get_MaxWidth();
            var group = this.CreateEmptyStaveGroup();
            group.Index = this._groups.length;
            group.X = x;
            group.Y = y;
            while (currentIndex < this._allMasterBarRenderers.length){
                // if the current renderer still has space in the current group add it
                // also force adding in case the group is empty
                var renderers = this._allMasterBarRenderers[currentIndex];
                if (group.Width + renderers.Width <= maxWidth || group.MasterBarsRenderers.length == 0){
                    group.AddMasterBarRenderers(this.Renderer.Tracks, renderers);
                    // move to next group
                    currentIndex++;
                }
                else {
                    // in case we do not have space, we create a new group
                    group.IsFull = true;
                    group.IsLast = false;
                    this._groups.push(group);
                    this.FitGroup(group);
                    group.FinalizeGroup();
                    y += this.PaintGroup(group, oldHeight, canvas);
                    // note: we do not increase currentIndex here to have it added to the next group
                    group = this.CreateEmptyStaveGroup();
                    group.Index = this._groups.length;
                    group.X = x;
                    group.Y = y;
                }
            }
            // don't forget to finish the last group
            this.FitGroup(group);
            group.FinalizeGroup();
            y += this.PaintGroup(group, oldHeight, canvas);
        }
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
        while (currentBarIndex <= endBarIndex){
            // create group and align set proper coordinates
            var group = this.CreateStaveGroup(currentBarIndex, endBarIndex);
            this._groups.push(group);
            group.X = x;
            group.Y = y;
            currentBarIndex = group.get_LastBarIndex() + 1;
            // finalize group (sizing etc).
            this.FitGroup(group);
            group.FinalizeGroup();
            AlphaTab.Util.Logger.Info(this.get_Name(), "Rendering partial from bar " + group.get_FirstBarIndex() + " to " + group.get_LastBarIndex(), null);
            y += this.PaintGroup(group, y, canvas);
        }
        return y;
    },
    PaintGroup: function (group, totalHeight, canvas){
        // paint into canvas
        var height = group.get_Height() + (20 * this.get_Scale());
        canvas.BeginRender(this.Width, height);
        this.Renderer.Canvas.set_Color(this.Renderer.RenderingResources.MainGlyphColor);
        this.Renderer.Canvas.set_TextAlign(AlphaTab.Platform.Model.TextAlign.Left);
        // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates 
        // since we use partial drawing
        group.Paint(0, -group.Y, canvas);
        // calculate coordinates for next group
        totalHeight += height;
        var result = canvas.EndRender();
        var args = new AlphaTab.Rendering.RenderFinishedEventArgs();
        args.TotalWidth = this.Width;
        args.TotalHeight = totalHeight;
        args.Width = this.Width;
        args.Height = height;
        args.RenderResult = result;
        args.FirstMasterBarIndex = group.get_FirstBarIndex();
        args.LastMasterBarIndex = group.get_LastBarIndex();
        this.Renderer.OnPartialRenderFinished(args);
        return height;
    },
    FitGroup: function (group){
        if (group.IsFull || group.Width > this.get_MaxWidth()){
            group.ScaleToWidth(this.get_MaxWidth());
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
            var renderers;
            if (this._barsFromPreviousGroup != null && this._barsFromPreviousGroup.MasterBar.Index == i){
                renderers = group.AddMasterBarRenderers(this.Renderer.Tracks, this._barsFromPreviousGroup);
            }
            else {
                renderers = group.AddBars(this.Renderer.Tracks, i);
                this._allMasterBarRenderers.push(renderers);
            }
            this._barsFromPreviousGroup = null;
            var groupIsFull = false;
            // can bar placed in this line?
            if (barsPerRow == -1 && ((group.Width) >= maxWidth && group.MasterBarsRenderers.length != 0)){
                groupIsFull = true;
            }
            else if (group.MasterBarsRenderers.length == barsPerRow + 1){
                groupIsFull = true;
            }
            if (groupIsFull){
                group.RevertLastBar();
                group.IsFull = true;
                group.IsLast = false;
                this._barsFromPreviousGroup = renderers;
                return group;
            }
            group.X = 0;
        }
        group.IsLast = endIndex == group.get_LastBarIndex();
        return group;
    },
    get_MaxWidth: function (){
        return this.Renderer.Settings.Width - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[0] - AlphaTab.Rendering.Layout.PageViewLayout.PagePadding[2];
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Layout.PageViewLayout.PagePadding = new Float32Array([40, 40, 40, 40]);
    AlphaTab.Rendering.Layout.PageViewLayout.GroupSpacing = 20;
});
$Inherit(AlphaTab.Rendering.Layout.PageViewLayout, AlphaTab.Rendering.Layout.ScoreLayout);
AlphaTab.Rendering.RenderingResources = function (scale){
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
    this.SecondaryGlyphColor = null;
    this.Scale = 0;
    this.ScoreInfoColor = null;
    this.Init(scale);
};
AlphaTab.Rendering.RenderingResources.prototype = {
    Init: function (scale){
        this.Scale = scale;
        var sansFont = "Arial";
        var serifFont = "Georgia";
        this.EffectFont = new AlphaTab.Platform.Model.Font(serifFont, 12 * scale, AlphaTab.Platform.Model.FontStyle.Italic);
        this.CopyrightFont = new AlphaTab.Platform.Model.Font(sansFont, 12 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.TitleFont = new AlphaTab.Platform.Model.Font(serifFont, 32 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.SubTitleFont = new AlphaTab.Platform.Model.Font(serifFont, 20 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.WordsFont = new AlphaTab.Platform.Model.Font(serifFont, 15 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.TablatureFont = new AlphaTab.Platform.Model.Font(sansFont, 13 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.GraceFont = new AlphaTab.Platform.Model.Font(sansFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.StaveLineColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
        this.BarSeperatorColor = new AlphaTab.Platform.Model.Color(34, 34, 17, 255);
        this.BarNumberFont = new AlphaTab.Platform.Model.Font(sansFont, 11 * scale, AlphaTab.Platform.Model.FontStyle.Plain);
        this.BarNumberColor = new AlphaTab.Platform.Model.Color(200, 0, 0, 255);
        this.MarkerFont = new AlphaTab.Platform.Model.Font(serifFont, 14 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.TabClefFont = new AlphaTab.Platform.Model.Font(sansFont, 18 * scale, AlphaTab.Platform.Model.FontStyle.Bold);
        this.ScoreInfoColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
        this.MainGlyphColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 255);
        this.SecondaryGlyphColor = new AlphaTab.Platform.Model.Color(0, 0, 0, 100);
    }
};
AlphaTab.Rendering.ScoreBarRenderer = function (renderer, bar){
    this._startSpacing = false;
    this.AccidentalHelper = null;
    AlphaTab.Rendering.BarRendererBase.call(this, renderer, bar);
    this.AccidentalHelper = new AlphaTab.Rendering.Utils.AccidentalHelper();
};
AlphaTab.Rendering.ScoreBarRenderer.prototype = {
    GetBeatDirection: function (beat){
        var g = this.GetOnNotesGlyphForBeat(beat);
        if (g != null){
            return g.NoteHeads.get_Direction();
        }
        return AlphaTab.Rendering.Utils.BeamDirection.Up;
    },
    GetNoteX: function (note, onEnd){
        var g = this.GetOnNotesGlyphForBeat(note.Beat);
        if (g != null){
            var x = g.Container.VoiceContainer.X + g.Container.X + g.X;
            if (onEnd){
                x += g.Width;
            }
            return x;
        }
        return 0;
    },
    GetNoteY: function (note){
        var beat = this.GetOnNotesGlyphForBeat(note.Beat);
        if (beat != null){
            return beat.NoteHeads.GetNoteY(note);
        }
        return 0;
    },
    get_LineOffset: function (){
        return ((9) * this.get_Scale());
    },
    UpdateSizes: function (){
        var res = this.get_Resources();
        var glyphOverflow = (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2);
        this.TopPadding = glyphOverflow;
        this.BottomPadding = glyphOverflow;
        this.Height = (this.get_LineOffset() * 4) + this.TopPadding + this.BottomPadding;
        AlphaTab.Rendering.BarRendererBase.prototype.UpdateSizes.call(this);
    },
    DoLayout: function (){
        AlphaTab.Rendering.BarRendererBase.prototype.DoLayout.call(this);
        var top = this.GetScoreY(0, 0);
        var bottom = this.GetScoreY(8, 0);
        for (var i = 0,j = this.Helpers.BeamHelpers.length; i < j; i++){
            var v = this.Helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                //
                // max note (highest) -> top overflow
                // 
                var maxNoteY = this.GetScoreY(this.GetNoteLine(h.MaxNote), 0);
                if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                    maxNoteY -= this.GetStemSize(h);
                    maxNoteY -= h.FingeringCount * this.get_Resources().GraceFont.Size;
                    if (h.HasTuplet){
                        maxNoteY -= this.get_Resources().EffectFont.Size * 2;
                    }
                }
                if (h.HasTuplet){
                    maxNoteY -= this.get_Resources().EffectFont.Size * 1.5;
                }
                if (maxNoteY < top){
                    this.RegisterOverflowTop(Math.abs(maxNoteY));
                }
                //
                // min note (lowest) -> bottom overflow
                //t
                var minNoteY = this.GetScoreY(this.GetNoteLine(h.MinNote), 0);
                if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                    minNoteY += this.GetStemSize(h);
                    minNoteY += h.FingeringCount * this.get_Resources().GraceFont.Size;
                }
                if (minNoteY > bottom){
                    this.RegisterOverflowBottom(Math.abs(minNoteY) - bottom);
                }
            }
        }
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.Paint.call(this, cx, cy, canvas);
        this.PaintBeams(cx, cy, canvas);
        this.PaintTuplets(cx, cy, canvas);
    },
    PaintTuplets: function (cx, cy, canvas){
        for (var i = 0,j = this.Helpers.TupletHelpers.length; i < j; i++){
            var v = this.Helpers.TupletHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintTupletHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeams: function (cx, cy, canvas){
        for (var i = 0,j = this.Helpers.BeamHelpers.length; i < j; i++){
            var v = this.Helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintBeamHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeamHelper: function (cx, cy, canvas, h){
        canvas.set_Color(h.Voice.Index == 0 ? this.get_Resources().MainGlyphColor : this.get_Resources().SecondaryGlyphColor);
        // TODO: draw stem at least at the center of the score staff. 
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
                var beamingHelper = this.Helpers.BeamHelperLookup[h.VoiceIndex][beat.Index];
                if (beamingHelper == null)
                    continue;
                var direction = beamingHelper.Direction;
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
            var firstBeamingHelper = this.Helpers.BeamHelperLookup[h.VoiceIndex][firstBeat.Index];
            var lastBeamingHelper = this.Helpers.BeamHelperLookup[h.VoiceIndex][lastBeat.Index];
            if (firstBeamingHelper != null && lastBeamingHelper != null){
                var direction = firstBeamingHelper.Direction;
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
                var startY = this.CalculateBeamYWithDirection(firstBeamingHelper, startX, firstBeamingHelper.Direction);
                var endY = this.CalculateBeamYWithDirection(lastBeamingHelper, endX, firstBeamingHelper.Direction);
                var k = (endY - startY) / (endX - startX);
                var d = startY - (k * startX);
                var offset1Y = (k * offset1X) + d;
                var middleY = (k * middleX) + d;
                var offset2Y = (k * offset2X) + d;
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
    GetStemSize: function (helper){
        return helper.Beats.length == 1 ? this.GetFooterStemSize(helper.ShortestDuration) : this.GetBarStemSize(helper.ShortestDuration);
    },
    GetBarStemSize: function (duration){
        var size;
        switch (duration){
            case AlphaTab.Model.Duration.QuadrupleWhole:
                size = 6;
                break;
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
                size = 7;
                break;
            case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                size = 9;
                break;
            case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                size = 10;
                break;
            default:
                size = 0;
                break;
        }
        return this.GetScoreY(size, 0);
    },
    GetFooterStemSize: function (duration){
        var size;
        switch (duration){
            case AlphaTab.Model.Duration.QuadrupleWhole:
                size = 6;
                break;
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
                size = 6;
                break;
            case AlphaTab.Model.Duration.SixtyFourth:
                size = 6;
                break;
            case AlphaTab.Model.Duration.OneHundredTwentyEighth:
                size = 6;
                break;
            case AlphaTab.Model.Duration.TwoHundredFiftySixth:
                size = 6;
                break;
            default:
                size = 0;
                break;
        }
        return this.GetScoreY(size, 0);
    },
    GetYPositionForNote: function (note){
        return this.GetScoreY(this.GetNoteLine(note), 0);
    },
    CalculateBeamY: function (h, x){
        var stemSize = this.GetStemSize(h);
        return h.CalculateBeamY(stemSize, this.get_Scale(), x, this.get_Scale(), this);
    },
    CalculateBeamYWithDirection: function (h, x, direction){
        var stemSize = this.GetStemSize(h);
        return h.CalculateBeamYWithDirection(stemSize, this.get_Scale(), x, this.get_Scale(), this, direction);
    },
    PaintBar: function (cx, cy, canvas, h){
        for (var i = 0,j = h.Beats.length; i < j; i++){
            var beat = h.Beats[i];
            var isGrace = beat.GraceType != AlphaTab.Model.GraceType.None;
            var scaleMod = isGrace ? 0.75 : 1;
            //
            // draw line 
            //
            var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
            var direction = h.Direction;
            var y1 = cy + this.Y;
            y1 += (direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? this.GetScoreY(this.GetNoteLine(beat.get_MinNote()), 0) : this.GetScoreY(this.GetNoteLine(beat.get_MaxNote()), 0));
            var y2 = cy + this.Y;
            y2 += scaleMod * this.CalculateBeamY(h, beatLineX);
            canvas.set_LineWidth(1.5 * this.get_Scale());
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X + beatLineX, y1);
            canvas.LineTo(cx + this.X + beatLineX, y2);
            canvas.Stroke();
            canvas.set_LineWidth(this.get_Scale());
            var fingeringY = y2;
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down){
                fingeringY += canvas.get_Font().Size * 2;
            }
            else if (i != 0){
                fingeringY -= canvas.get_Font().Size * 1.5;
            }
            this.PaintFingering(canvas, beat, cx + this.X + beatLineX, direction, fingeringY);
            var brokenBarOffset = 6 * this.get_Scale() * scaleMod;
            var barSpacing = 7 * this.get_Scale() * scaleMod;
            var barSize = 4 * this.get_Scale() * scaleMod;
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
                    if (AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin(beat, h.Beats[i + 1], barIndex)){
                        barStartX = beatLineX;
                        barEndX = h.GetBeatLineX(h.Beats[i + 1]) + this.get_Scale();
                    }
                    else if (i == 0 || !AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin(h.Beats[i - 1], beat, barIndex)){
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                    }
                    else {
                        continue;
                    }
                    barStartY = barY + this.CalculateBeamY(h, barStartX) * scaleMod;
                    barEndY = barY + this.CalculateBeamY(h, barEndX) * scaleMod;
                    AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                }
                else if (i > 0 && !AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin(beat, h.Beats[i - 1], barIndex)){
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    barStartY = barY + this.CalculateBeamY(h, barStartX) * scaleMod;
                    barEndY = barY + this.CalculateBeamY(h, barEndX) * scaleMod;
                    AlphaTab.Rendering.ScoreBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                }
            }
        }
    },
    PaintFooter: function (cx, cy, canvas, h){
        var beat = h.Beats[0];
        var isGrace = beat.GraceType != AlphaTab.Model.GraceType.None;
        var scaleMod = isGrace ? 0.75 : 1;
        //
        // draw line 
        //
        var stemSize = this.GetFooterStemSize(h.ShortestDuration);
        var beatLineX = h.GetBeatLineX(beat) + this.get_Scale();
        var direction = h.Direction;
        var topY = this.GetScoreY(this.GetNoteLine(beat.get_MaxNote()), 0);
        var bottomY = this.GetScoreY(this.GetNoteLine(beat.get_MinNote()), 0);
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
            fingeringY = cy + this.Y + topY;
        }
        this.PaintFingering(canvas, beat, cx + this.X + beatLineX, direction, fingeringY);
        if (beat.Duration == AlphaTab.Model.Duration.Whole || beat.Duration == AlphaTab.Model.Duration.DoubleWhole || beat.Duration == AlphaTab.Model.Duration.QuadrupleWhole){
            return;
        }
        canvas.set_LineWidth(1.5 * this.get_Scale());
        canvas.BeginPath();
        canvas.MoveTo(cx + this.X + beatLineX, cy + this.Y + topY);
        canvas.LineTo(cx + this.X + beatLineX, cy + this.Y + bottomY);
        canvas.Stroke();
        canvas.set_LineWidth(this.get_Scale());
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
            var glyph = new AlphaTab.Rendering.Glyphs.BeamGlyph(beatLineX - this.get_Scale() / 2, beamY, beat.Duration, direction, isGrace);
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
        }
        // sort notes ascending in their value to ensure 
        // we are drawing the numbers according to their order on the stave 
        var noteList = beat.Notes.slice();
        noteList.sort($CreateAnonymousDelegate(this, function (a, b){
            return a.get_RealValue() - b.get_RealValue();
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
        if (this.get_Settings().ForcePianoFingering || AlphaTab.Audio.GeneralMidi.IsPiano(beat.Voice.Bar.Staff.Track.PlaybackInfo.Program)){
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
        AlphaTab.Rendering.BarRendererBase.prototype.CreatePreBeatGlyphs.call(this);
        if (this.Bar.get_MasterBar().IsRepeatStart){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.get_IsFirstOfLine() || this.Bar.Clef != this.Bar.PreviousBar.Clef || this.Bar.ClefOttavia != this.Bar.PreviousBar.ClefOttavia){
            var offset = 0;
            var correction = 0;
            switch (this.Bar.Clef){
                case AlphaTab.Model.Clef.Neutral:
                    offset = 6;
                    break;
                case AlphaTab.Model.Clef.F4:
                    offset = 4;
                    correction = -1;
                    break;
                case AlphaTab.Model.Clef.C3:
                    offset = 6;
                    break;
                case AlphaTab.Model.Clef.C4:
                    offset = 4;
                    break;
                case AlphaTab.Model.Clef.G2:
                    offset = 8;
                    break;
            }
            this.CreateStartSpacing();
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.ClefGlyph(0, this.GetScoreY(offset, correction), this.Bar.Clef, this.Bar.ClefOttavia));
        }
        // Key signature
        if ((this.Index == 0 && this.Bar.get_MasterBar().KeySignature != 0) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().KeySignature != this.Bar.PreviousBar.get_MasterBar().KeySignature)){
            this.CreateStartSpacing();
            this.CreateKeySignatureGlyphs();
        }
        // Time Signature
        if ((this.Bar.PreviousBar == null) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureNumerator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureNumerator) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureDenominator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureDenominator)){
            this.CreateStartSpacing();
            this.CreateTimeSignatureGlyphs();
        }
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.BarNumberGlyph(0, this.GetScoreY(-0.5, 0), this.Bar.Index + 1));
        if (this.Bar.get_IsEmpty()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, (30 * this.get_Scale())));
        }
    },
    CreateBeatGlyphs: function (){
        for (var v = 0; v < this.Bar.Voices.length; v++){
            var voice = this.Bar.Voices[v];
            if (this.HasVoiceContainer(voice)){
                this.CreateVoiceGlyphs(voice);
            }
        }
    },
    CreatePostBeatGlyphs: function (){
        AlphaTab.Rendering.BarRendererBase.prototype.CreatePostBeatGlyphs.call(this);
        if (this.Bar.get_MasterBar().get_IsRepeatEnd()){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCloseGlyph(this.X, 0));
            if (this.Bar.get_MasterBar().RepeatCount > 2){
                this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCountGlyph(0, this.GetScoreY(-1, -3), this.Bar.get_MasterBar().RepeatCount));
            }
        }
        else if (this.Bar.NextBar == null || !this.Bar.NextBar.get_MasterBar().IsRepeatStart){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0));
        }
    },
    CreateStartSpacing: function (){
        if (this._startSpacing)
            return;
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 2 * this.get_Scale()));
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
                offsetClef = 1;
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
        var newLines = {};
        var newGlyphs = [];
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        //var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (AlphaTab.Model.ModelUtils.KeySignatureIsSharp(currentKey)){
            for (var i = 0; i < Math.abs(currentKey); i++){
                var step = AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps[i] + offsetClef;
                newGlyphs.push(new AlphaTab.Rendering.Glyphs.SharpGlyph(0, this.GetScoreY(step, 0), false));
                newLines[step] = true;
            }
        }
        else {
            for (var i = 0; i < Math.abs(currentKey); i++){
                var step = AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps[i] + offsetClef;
                newGlyphs.push(new AlphaTab.Rendering.Glyphs.FlatGlyph(0, this.GetScoreY(step, 0), false));
                newLines[step] = true;
            }
        }
        // naturalize previous key
        var naturalizeSymbols = Math.abs(previousKey);
        var previousKeyPositions = AlphaTab.Model.ModelUtils.KeySignatureIsSharp(previousKey) ? AlphaTab.Rendering.ScoreBarRenderer.SharpKsSteps : AlphaTab.Rendering.ScoreBarRenderer.FlatKsSteps;
        for (var i = 0; i < naturalizeSymbols; i++){
            var step = previousKeyPositions[i] + offsetClef;
            if (!newLines.hasOwnProperty(step)){
                this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.NaturalizeGlyph(0, this.GetScoreY(previousKeyPositions[i] + offsetClef, 0), false));
            }
        }
        for (var $i99 = 0,$l99 = newGlyphs.length,newGlyph = newGlyphs[$i99]; $i99 < $l99; $i99++, newGlyph = newGlyphs[$i99]){
            this.AddPreBeatGlyph(newGlyph);
        }
    },
    CreateTimeSignatureGlyphs: function (){
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.ScoreTimeSignatureGlyph(0, this.GetScoreY(2, 0), this.Bar.get_MasterBar().TimeSignatureNumerator, this.Bar.get_MasterBar().TimeSignatureDenominator, this.Bar.get_MasterBar().TimeSignatureCommon));
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            var container = new AlphaTab.Rendering.ScoreBeatContainerGlyph(b, this.GetOrCreateVoiceContainer(v));
            container.PreNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.ScoreBeatGlyph();
            this.AddBeatGlyph(container);
        }
    },
    GetNoteLine: function (n){
        return this.AccidentalHelper.GetNoteLine(n);
    },
    GetScoreY: function (steps, correction){
        return ((this.get_LineOffset() / 2) * steps) + (correction * this.get_Scale());
    },
    PaintBackground: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.PaintBackground.call(this, cx, cy, canvas);
        var res = this.get_Resources();
        //var c = new Color((byte)Std.Random(255),
        //                  (byte)Std.Random(255),
        //                  (byte)Std.Random(255),
        //                  100);
        //canvas.Color = c;
        //canvas.FillRect(cx + X, cy + Y, Width, Height);
        //
        // draw string lines
        //
        canvas.set_Color(res.StaveLineColor);
        var lineY = cy + this.Y + this.TopPadding;
        var lineOffset = this.get_LineOffset();
        for (var i = 0; i < 5; i++){
            if (i > 0)
                lineY += lineOffset;
            canvas.FillRect(cx + this.X, lineY | 0, this.Width, this.get_Scale());
        }
        canvas.set_Color(res.MainGlyphColor);
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.ScoreBarRenderer.StaffId = "score";
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
$Inherit(AlphaTab.Rendering.ScoreBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.ScoreBarRendererFactory = function (){
    AlphaTab.Rendering.BarRendererFactory.call(this);
};
AlphaTab.Rendering.ScoreBarRendererFactory.prototype = {
    get_StaffId: function (){
        return "score";
    },
    Create: function (renderer, bar, staveSettings){
        return new AlphaTab.Rendering.ScoreBarRenderer(renderer, bar);
    }
};
$Inherit(AlphaTab.Rendering.ScoreBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.ScoreRenderer = function (settings){
    this._currentLayoutMode = null;
    this._currentRenderEngine = null;
    this._renderedTracks = null;
    this.PreRender = null;
    this.PartialRenderFinished = null;
    this.RenderFinished = null;
    this.Error = null;
    this.PostRenderFinished = null;
    this.Canvas = null;
    this.Score = null;
    this.Tracks = null;
    this.Layout = null;
    this.RenderingResources = null;
    this.Settings = null;
    this.BoundsLookup = null;
    this.Settings = settings;
    this.RenderingResources = new AlphaTab.Rendering.RenderingResources(1);
    this.RecreateCanvas();
    this.RecreateLayout();
};
AlphaTab.Rendering.ScoreRenderer.prototype = {
    Destroy: function (){
        this.Score = null;
        this.Canvas = null;
        this.Layout = null;
        this.RenderingResources = null;
        this.Settings = null;
        this.BoundsLookup = null;
        this.Tracks = null;
    },
    RecreateCanvas: function (){
        if (this._currentRenderEngine != this.Settings.Engine){
            if (this.Settings.Engine == null || !AlphaTab.Environment.RenderEngines.hasOwnProperty(this.Settings.Engine)){
                this.Canvas = AlphaTab.Environment.RenderEngines["default"]();
            }
            else {
                this.Canvas = AlphaTab.Environment.RenderEngines[this.Settings.Engine]();
            }
            this._currentRenderEngine = this.Settings.Engine;
            return true;
        }
        return false;
    },
    RecreateLayout: function (){
        if (this._currentLayoutMode != this.Settings.Layout.Mode){
            if (this.Settings.Layout == null || !AlphaTab.Environment.LayoutEngines.hasOwnProperty(this.Settings.Layout.Mode)){
                this.Layout = AlphaTab.Environment.LayoutEngines["default"](this);
            }
            else {
                this.Layout = AlphaTab.Environment.LayoutEngines[this.Settings.Layout.Mode](this);
            }
            this._currentLayoutMode = this.Settings.Layout.Mode;
            return true;
        }
        return false;
    },
    Render: function (score, trackIndexes){
        try{
            this.Score = score;
            var tracks = [];
            for (var $i100 = 0,$l100 = trackIndexes.length,track = trackIndexes[$i100]; $i100 < $l100; $i100++, track = trackIndexes[$i100]){
                if (track >= 0 && track < score.Tracks.length){
                    tracks.push(score.Tracks[track]);
                }
            }
            if (tracks.length == 0 && score.Tracks.length > 0){
                tracks.push(score.Tracks[0]);
            }
            this.Tracks = tracks.slice(0);
            this.Invalidate();
        }
        catch(e){
            this.OnError("render", e);
        }
    },
    RenderTracks: function (tracks){
        if (tracks.length == 0){
            this.Score = null;
        }
        else {
            this.Score = tracks[0].Score;
        }
        this.Tracks = tracks;
        this.Invalidate();
    },
    UpdateSettings: function (settings){
        this.Settings = settings;
    },
    Invalidate: function (){
        if (this.Settings.Width == 0){
            AlphaTab.Util.Logger.Warning("Rendering", "AlphaTab skipped rendering because of width=0 (element invisible)", null);
            return;
        }
        this.BoundsLookup = new AlphaTab.Rendering.Utils.BoundsLookup();
        if (this.Tracks.length == 0)
            return;
        this.RecreateCanvas();
        if (this.RenderingResources.Scale != this.Settings.Scale){
            this.RenderingResources.Init(this.Settings.Scale);
            this.Canvas.set_LineWidth(this.Settings.Scale);
        }
        this.Canvas.set_Resources(this.RenderingResources);
        AlphaTab.Util.Logger.Info("Rendering", "Rendering " + this.Tracks.length + " tracks", null);
        for (var i = 0; i < this.Tracks.length; i++){
            var track = this.Tracks[i];
            AlphaTab.Util.Logger.Info("Rendering", "Track " + i + ": " + track.Name, null);
        }
        this.OnPreRender();
        this.RecreateLayout();
        this.LayoutAndRender();
        this._renderedTracks = this.Tracks;
        AlphaTab.Util.Logger.Info("Rendering", "Rendering finished", null);
    },
    Resize: function (width){
        if (this.RecreateLayout() || this.RecreateCanvas() || this._renderedTracks != this.Tracks || this.Tracks == null){
            AlphaTab.Util.Logger.Info("Rendering", "Starting full rerendering due to layout or canvas change", null);
            this.Invalidate();
        }
        else if (this.Layout.get_SupportsResize()){
            AlphaTab.Util.Logger.Info("Rendering", "Starting optimized rerendering for resize", null);
            this.BoundsLookup = new AlphaTab.Rendering.Utils.BoundsLookup();
            this.OnPreRender();
            this.Settings.Width = width;
            this.Layout.Resize();
            this.Layout.RenderAnnotation();
            this.OnRenderFinished();
            this.OnPostRender();
        }
        else {
            AlphaTab.Util.Logger.Warning("Rendering", "Current layout does not support dynamic resizing, nothing was done", null);
        }
        AlphaTab.Util.Logger.Info("Rendering", "Resize finished", null);
    },
    LayoutAndRender: function (){
        AlphaTab.Util.Logger.Info("Rendering", "Rendering at scale " + this.Settings.Scale + " with layout " + this.Layout.get_Name(), null);
        this.Layout.LayoutAndRender();
        this.Layout.RenderAnnotation();
        this.OnRenderFinished();
        this.OnPostRender();
    },
    add_PreRender: function (value){
        this.PreRender = $CombineDelegates(this.PreRender, value);
    },
    remove_PreRender: function (value){
        this.PreRender = $RemoveDelegate(this.PreRender, value);
    },
    OnPreRender: function (){
        var result = this.Canvas.OnPreRender();
        var handler = this.PreRender;
        var args = new AlphaTab.Rendering.RenderFinishedEventArgs();
        args.TotalWidth = 0;
        args.TotalHeight = 0;
        args.Width = 0;
        args.Height = 0;
        args.RenderResult = result;
        if (handler != null)
            handler(args);
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
    OnRenderFinished: function (){
        var result = this.Canvas.OnRenderFinished();
        var handler = this.RenderFinished;
        if (handler != null)
            handler((function (){
                var $v6 = new AlphaTab.Rendering.RenderFinishedEventArgs();
                $v6.RenderResult = result;
                $v6.TotalHeight = this.Layout.Height;
                $v6.TotalWidth = this.Layout.Width;
                return $v6;
            }).call(this));
    },
    add_Error: function (value){
        this.Error = $CombineDelegates(this.Error, value);
    },
    remove_Error: function (value){
        this.Error = $RemoveDelegate(this.Error, value);
    },
    OnError: function (type, details){
        var handler = this.Error;
        if (handler != null)
            handler(type, details);
    },
    add_PostRenderFinished: function (value){
        this.PostRenderFinished = $CombineDelegates(this.PostRenderFinished, value);
    },
    remove_PostRenderFinished: function (value){
        this.PostRenderFinished = $RemoveDelegate(this.PostRenderFinished, value);
    },
    OnPostRender: function (){
        var handler = this.PostRenderFinished;
        if (handler != null)
            handler();
    }
};
AlphaTab.Rendering.Staves = AlphaTab.Rendering.Staves || {};
AlphaTab.Rendering.Staves.BarLayoutingInfo = function (){
    this._timeSortedSprings = null;
    this._xMin = 0;
    this._onTimePositionsForce = 0;
    this._onTimePositions = null;
    this.Version = 0;
    this.PreBeatSizes = null;
    this.OnBeatSizes = null;
    this.PreBeatSize = 0;
    this.PostBeatSize = 0;
    this.VoiceSize = 0;
    this.MinStretchForce = 0;
    this.TotalSpringConstant = 0;
    this.Springs = null;
    this.SmallestDuration = 0;
    this.PreBeatSizes = {};
    this.OnBeatSizes = {};
    this.VoiceSize = 0;
    this.Springs = {};
    this.Version = 0;
};
AlphaTab.Rendering.Staves.BarLayoutingInfo.prototype = {
    UpdateVoiceSize: function (size){
        if (size > this.VoiceSize){
            this.VoiceSize = size;
            this.Version++;
        }
    },
    SetPreBeatSize: function (beat, size){
        if (!this.PreBeatSizes.hasOwnProperty(beat.Index) || this.PreBeatSizes[beat.Index] < size){
            this.PreBeatSizes[beat.Index] = size;
            this.Version++;
        }
    },
    GetPreBeatSize: function (beat){
        if (this.PreBeatSizes.hasOwnProperty(beat.Index)){
            return this.PreBeatSizes[beat.Index];
        }
        return 0;
    },
    SetOnBeatSize: function (beat, size){
        if (!this.OnBeatSizes.hasOwnProperty(beat.Index) || this.OnBeatSizes[beat.Index] < size){
            this.OnBeatSizes[beat.Index] = size;
            this.Version++;
        }
    },
    GetOnBeatSize: function (beat){
        if (this.OnBeatSizes.hasOwnProperty(beat.Index)){
            return this.OnBeatSizes[beat.Index];
        }
        return 0;
    },
    UpdateMinStretchForce: function (force){
        if (this.MinStretchForce < force){
            this.MinStretchForce = force;
            this.Version++;
        }
    },
    AddSpring: function (start, duration, springSize, preSpringSize){
        this.Version++;
        var spring;
        if (!this.Springs.hasOwnProperty(start)){
            spring = new AlphaTab.Rendering.Staves.Spring();
            spring.TimePosition = start;
            spring.SmallestDuration = duration;
            spring.LongestDuration = duration;
            spring.SpringWidth = springSize;
            spring.PreSpringWidth = preSpringSize;
            this.Springs[start] = spring;
        }
        else {
            spring = this.Springs[start];
            if (spring.SpringWidth < springSize){
                spring.SpringWidth = springSize;
            }
            if (spring.PreSpringWidth < preSpringSize){
                spring.PreSpringWidth = preSpringSize;
            }
            if (duration < spring.SmallestDuration){
                spring.SmallestDuration = duration;
            }
            if (duration > spring.LongestDuration){
                spring.LongestDuration = duration;
            }
        }
        if (duration < this.SmallestDuration){
            this.SmallestDuration = duration;
        }
        return spring;
    },
    AddBeatSpring: function (beat, beatSize, preBeatSize){
        return this.AddSpring(beat.get_AbsoluteStart(), beat.CalculateDuration(), beatSize, preBeatSize);
    },
    Finish: function (){
        this.CalculateSpringConstants();
        this.Version++;
    },
    CalculateSpringConstants: function (){
        var sortedSprings = this._timeSortedSprings = [];
        this._xMin = 0;
        var springs = this.Springs;
        for (var time in springs){
            var spring = springs[time];
            sortedSprings.push(spring);
            if (spring.SpringWidth < this._xMin){
                this._xMin = spring.SpringWidth;
            }
        }
        sortedSprings.sort($CreateAnonymousDelegate(this, function (a, b){
            if (a.TimePosition < b.TimePosition){
                return -1;
            }
            if (a.TimePosition > b.TimePosition){
                return 1;
            }
            return 0;
        }));
        var totalSpringConstant = 0;
        for (var i = 0; i < sortedSprings.length; i++){
            var currentSpring = sortedSprings[i];
            var duration;
            if (i == sortedSprings.length - 1){
                duration = currentSpring.LongestDuration;
            }
            else {
                var nextSpring = sortedSprings[i + 1];
                duration = nextSpring.TimePosition - currentSpring.TimePosition;
            }
            currentSpring.SpringConstant = this.CalculateSpringConstant(currentSpring, duration);
            totalSpringConstant += 1 / currentSpring.SpringConstant;
        }
        this.TotalSpringConstant = 1 / totalSpringConstant;
        // calculate the force required to have at least the minimum size. 
        for (var i = 0; i < sortedSprings.length; i++){
            var force = sortedSprings[i].SpringWidth * sortedSprings[i].SpringConstant;
            this.UpdateMinStretchForce(force);
        }
    },
    CalculateSpringConstant: function (spring, duration){
        var minDuration = spring.SmallestDuration;
        if (spring.SmallestDuration == 0){
            minDuration = duration;
        }
        var phi = 1 + 0.6 * Math.log2(duration / 30);
        return (minDuration / duration) * 1 / (phi * 10);
    },
    SpaceToForce: function (space){
        return space * this.TotalSpringConstant;
    },
    CalculateVoiceWidth: function (force){
        return this.CalculateWidth(force, this.TotalSpringConstant);
    },
    CalculateWidth: function (force, springConstant){
        return force / springConstant;
    },
    BuildOnTimePositions: function (force){
        if (Math.abs(this._onTimePositionsForce - force) < 1E-05 && this._onTimePositions != null){
            return this._onTimePositions;
        }
        this._onTimePositionsForce = force;
        var positions = this._onTimePositions = {};
        var sortedSprings = this._timeSortedSprings;
        if (sortedSprings.length == 0){
            return positions;
        }
        var springX = sortedSprings[0].PreSpringWidth;
        for (var i = 0; i < sortedSprings.length; i++){
            positions[sortedSprings[i].TimePosition] = springX;
            springX += this.CalculateWidth(force, sortedSprings[i].SpringConstant);
        }
        return positions;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Staves.BarLayoutingInfo.MinDuration = 30;
    AlphaTab.Rendering.Staves.BarLayoutingInfo.MinDurationWidth = 10;
});
AlphaTab.Rendering.Staves.Spring = function (){
    this.TimePosition = 0;
    this.LongestDuration = 0;
    this.SmallestDuration = 0;
    this.Force = 0;
    this.SpringConstant = 0;
    this.SpringWidth = 0;
    this.PreSpringWidth = 0;
};
AlphaTab.Rendering.Staves.MasterBarsRenderers = function (){
    this.Width = 0;
    this.IsLinkedToPrevious = false;
    this.MasterBar = null;
    this.Renderers = null;
    this.LayoutingInfo = null;
    this.Renderers = [];
};
AlphaTab.Rendering.Staves.Staff = function (trackIndex, staff, factory){
    this._factory = null;
    this.StaveTrackGroup = null;
    this.StaveGroup = null;
    this.BarRenderers = null;
    this.X = 0;
    this.Y = 0;
    this.Height = 0;
    this.Index = 0;
    this.StaffIndex = 0;
    this.TrackIndex = 0;
    this.ModelStaff = null;
    this.StaveTop = 0;
    this.TopSpacing = 0;
    this.BottomSpacing = 0;
    this.StaveBottom = 0;
    this.IsFirstInAccolade = false;
    this.IsLastInAccolade = false;
    this.BarRenderers = [];
    this.TrackIndex = trackIndex;
    this.ModelStaff = staff;
    this._factory = factory;
    this.TopSpacing = 15;
    this.BottomSpacing = 5;
    this.StaveTop = 0;
    this.StaveBottom = 0;
};
AlphaTab.Rendering.Staves.Staff.prototype = {
    get_StaveId: function (){
        return this._factory.get_StaffId();
    },
    get_IsInAccolade: function (){
        return this._factory.IsInAccolade;
    },
    RegisterStaffTop: function (offset){
        this.StaveTop = offset;
    },
    RegisterStaffBottom: function (offset){
        this.StaveBottom = offset;
    },
    AddBarRenderer: function (renderer){
        renderer.Staff = this;
        renderer.Index = this.BarRenderers.length;
        renderer.ReLayout();
        this.BarRenderers.push(renderer);
        this.StaveGroup.Layout.RegisterBarRenderer(this.get_StaveId(), renderer);
    },
    AddBar: function (bar, layoutingInfo){
        var renderer;
        if (bar == null){
            renderer = new AlphaTab.Rendering.BarRendererBase(this.StaveGroup.Layout.Renderer, bar);
        }
        else {
            renderer = this._factory.Create(this.StaveGroup.Layout.Renderer, bar, this.StaveGroup.Layout.Renderer.Settings.Staves);
        }
        renderer.Staff = this;
        renderer.Index = this.BarRenderers.length;
        renderer.LayoutingInfo = layoutingInfo;
        renderer.DoLayout();
        renderer.RegisterLayoutingInfo();
        this.BarRenderers.push(renderer);
        if (bar != null){
            this.StaveGroup.Layout.RegisterBarRenderer(this.get_StaveId(), renderer);
        }
    },
    RevertLastBar: function (){
        var lastBar = this.BarRenderers[this.BarRenderers.length - 1];
        this.BarRenderers.splice(this.BarRenderers.length - 1,1);
        this.StaveGroup.Layout.UnregisterBarRenderer(this.get_StaveId(), lastBar);
    },
    ScaleToWidth: function (width){
        // Note: here we could do some "intelligent" distribution of 
        // the space over the bar renderers, for now we evenly apply the space to all bars
        var difference = width - this.StaveGroup.Width;
        var spacePerBar = difference / this.BarRenderers.length;
        for (var i = 0,j = this.BarRenderers.length; i < j; i++){
            this.BarRenderers[i].ScaleToWidth(this.BarRenderers[i].Width + spacePerBar);
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
    FinalizeStave: function (){
        var x = 0;
        this.Height = 0;
        var topOverflow = this.get_TopOverflow();
        var bottomOverflow = this.get_BottomOverflow();
        for (var i = 0; i < this.BarRenderers.length; i++){
            this.BarRenderers[i].X = x;
            this.BarRenderers[i].Y = this.TopSpacing + topOverflow;
            this.Height = Math.max(this.Height, this.BarRenderers[i].Height);
            this.BarRenderers[i].FinalizeRenderer();
            x += this.BarRenderers[i].Width;
        }
        if (this.Height > 0){
            this.Height += this.TopSpacing + topOverflow + bottomOverflow + this.BottomSpacing;
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
    this.FirstStaffInAccolade = null;
    this.LastStaffInAccolade = null;
    this.StaveGroup = staveGroup;
    this.Track = track;
    this.Staves = [];
};
AlphaTab.Rendering.Staves.StaveGroup = function (){
    this._allStaves = null;
    this._firstStaffInAccolade = null;
    this._lastStaffInAccolade = null;
    this._accoladeSpacingCalculated = false;
    this.X = 0;
    this.Y = 0;
    this.Index = 0;
    this.AccoladeSpacing = 0;
    this.IsFull = false;
    this.Width = 0;
    this.IsLast = false;
    this.MasterBarsRenderers = null;
    this.Staves = null;
    this.Layout = null;
    this.MasterBarsRenderers = [];
    this.Staves = [];
    this._allStaves = [];
    this.Width = 0;
    this.Index = 0;
    this._accoladeSpacingCalculated = false;
    this.AccoladeSpacing = 0;
};
AlphaTab.Rendering.Staves.StaveGroup.prototype = {
    get_FirstBarIndex: function (){
        return this.MasterBarsRenderers[0].MasterBar.Index;
    },
    get_LastBarIndex: function (){
        return this.MasterBarsRenderers[this.MasterBarsRenderers.length - 1].MasterBar.Index;
    },
    AddMasterBarRenderers: function (tracks, renderers){
        if (tracks.length == 0)
            return null;
        this.MasterBarsRenderers.push(renderers);
        this.CalculateAccoladeSpacing(tracks);
        renderers.LayoutingInfo.PreBeatSize = 0;
        var src = 0;
        for (var i = 0,j = this.Staves.length; i < j; i++){
            var g = this.Staves[i];
            for (var k = 0,l = g.Staves.length; k < l; k++){
                var s = g.Staves[k];
                var renderer = renderers.Renderers[src++];
                s.AddBarRenderer(renderer);
            }
        }
        //Width += renderers.Width;
        this.UpdateWidth();
        return renderers;
    },
    AddBars: function (tracks, barIndex){
        if (tracks.length == 0)
            return null;
        var result = new AlphaTab.Rendering.Staves.MasterBarsRenderers();
        result.LayoutingInfo = new AlphaTab.Rendering.Staves.BarLayoutingInfo();
        result.MasterBar = tracks[0].Score.MasterBars[barIndex];
        this.MasterBarsRenderers.push(result);
        this.CalculateAccoladeSpacing(tracks);
        // add renderers
        var barLayoutingInfo = result.LayoutingInfo;
        for (var $i101 = 0,$t101 = this.Staves,$l101 = $t101.length,g = $t101[$i101]; $i101 < $l101; $i101++, g = $t101[$i101]){
            for (var $i102 = 0,$t102 = g.Staves,$l102 = $t102.length,s = $t102[$i102]; $i102 < $l102; $i102++, s = $t102[$i102]){
                s.AddBar(g.Track.Staves[s.ModelStaff.Index].Bars[barIndex], barLayoutingInfo);
                var renderer = s.BarRenderers[s.BarRenderers.length - 1];
                result.Renderers.push(renderer);
                if (renderer.IsLinkedToPrevious){
                    result.IsLinkedToPrevious = true;
                }
            }
        }
        barLayoutingInfo.Finish();
        // ensure same widths of new renderer
        result.Width = this.UpdateWidth();
        return result;
    },
    RevertLastBar: function (){
        if (this.MasterBarsRenderers.length > 1){
            this.MasterBarsRenderers.splice(this.MasterBarsRenderers.length - 1,1);
            var w = 0;
            for (var i = 0,j = this._allStaves.length; i < j; i++){
                var s = this._allStaves[i];
                w = Math.max(w, s.BarRenderers[s.BarRenderers.length - 1].Width);
                s.RevertLastBar();
            }
            this.Width -= w;
        }
    },
    UpdateWidth: function (){
        var realWidth = 0;
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            var s = this._allStaves[i];
            s.BarRenderers[s.BarRenderers.length - 1].ApplyLayoutingInfo();
            if (s.BarRenderers[s.BarRenderers.length - 1].Width > realWidth){
                realWidth = s.BarRenderers[s.BarRenderers.length - 1].Width;
            }
        }
        this.Width += realWidth;
        return realWidth;
    },
    CalculateAccoladeSpacing: function (tracks){
        if (!this._accoladeSpacingCalculated && this.Index == 0){
            this._accoladeSpacingCalculated = true;
            if (this.Layout.Renderer.Settings.Layout.Get("hideTrackNames", false)){
                this.AccoladeSpacing = 0;
            }
            else {
                var canvas = this.Layout.Renderer.Canvas;
                var res = this.Layout.Renderer.RenderingResources.EffectFont;
                canvas.set_Font(res);
                for (var i = 0; i < tracks.length; i++){
                    this.AccoladeSpacing = Math.max(this.AccoladeSpacing, canvas.MeasureText(tracks[i].ShortName));
                }
                this.AccoladeSpacing += (20);
                this.Width += this.AccoladeSpacing;
            }
        }
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
    AddStaff: function (track, staff){
        var group = this.GetStaveTrackGroup(track);
        if (group == null){
            group = new AlphaTab.Rendering.Staves.StaveTrackGroup(this, track);
            this.Staves.push(group);
        }
        staff.StaveTrackGroup = group;
        staff.StaveGroup = this;
        staff.Index = this._allStaves.length;
        this._allStaves.push(staff);
        group.Staves.push(staff);
        if (staff.get_IsInAccolade()){
            if (this._firstStaffInAccolade == null){
                this._firstStaffInAccolade = staff;
                staff.IsFirstInAccolade = true;
            }
            if (group.FirstStaffInAccolade == null){
                group.FirstStaffInAccolade = staff;
            }
            if (this._lastStaffInAccolade == null){
                this._lastStaffInAccolade = staff;
                staff.IsLastInAccolade = true;
            }
            if (this._lastStaffInAccolade != null){
                this._lastStaffInAccolade.IsLastInAccolade = false;
            }
            this._lastStaffInAccolade = staff;
            this._lastStaffInAccolade.IsLastInAccolade = true;
            group.LastStaffInAccolade = staff;
        }
    },
    get_Height: function (){
        return this._allStaves[this._allStaves.length - 1].Y + this._allStaves[this._allStaves.length - 1].Height;
    },
    ScaleToWidth: function (width){
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].ScaleToWidth(width);
        }
        this.Width = width;
    },
    Paint: function (cx, cy, canvas){
        this.PaintPartial(cx + this.X, cy + this.Y, canvas, 0, this.MasterBarsRenderers.length);
    },
    PaintPartial: function (cx, cy, canvas, startIndex, count){
        this.BuildBoundingsLookup(cx, cy);
        for (var i = 0,j = this._allStaves.length; i < j; i++){
            this._allStaves[i].Paint(cx, cy, canvas, startIndex, count);
        }
        var res = this.Layout.Renderer.RenderingResources;
        if (this.Staves.length > 0 && startIndex == 0){
            //
            // Draw start grouping
            // 
            if (this._firstStaffInAccolade != null && this._lastStaffInAccolade != null){
                //
                // draw grouping line for all staves
                //
                var firstStart = cy + this._firstStaffInAccolade.Y + this._firstStaffInAccolade.StaveTop + this._firstStaffInAccolade.TopSpacing + this._firstStaffInAccolade.get_TopOverflow();
                var lastEnd = cy + this._lastStaffInAccolade.Y + this._lastStaffInAccolade.TopSpacing + this._lastStaffInAccolade.get_TopOverflow() + this._lastStaffInAccolade.StaveBottom;
                var acooladeX = cx + this._firstStaffInAccolade.X;
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
                if (g.FirstStaffInAccolade != null && g.LastStaffInAccolade != null){
                    var firstStart = cy + g.FirstStaffInAccolade.Y + g.FirstStaffInAccolade.StaveTop + g.FirstStaffInAccolade.TopSpacing + g.FirstStaffInAccolade.get_TopOverflow();
                    var lastEnd = cy + g.LastStaffInAccolade.Y + g.LastStaffInAccolade.TopSpacing + g.LastStaffInAccolade.get_TopOverflow() + g.LastStaffInAccolade.StaveBottom;
                    var acooladeX = cx + g.FirstStaffInAccolade.X;
                    var barSize = (3 * this.Layout.Renderer.Settings.Scale);
                    var barOffset = barSize;
                    var accoladeStart = firstStart - (barSize * 4);
                    var accoladeEnd = lastEnd + (barSize * 4);
                    // text
                    if (this.Index == 0 && !this.Layout.Renderer.Settings.Layout.Get("hideTrackNames", false)){
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
    FinalizeGroup: function (){
        var currentY = 0;
        for (var $i103 = 0,$t103 = this._allStaves,$l103 = $t103.length,staff = $t103[$i103]; $i103 < $l103; $i103++, staff = $t103[$i103]){
            staff.X = this.AccoladeSpacing;
            staff.Y = (currentY);
            staff.FinalizeStave();
            currentY += staff.Height;
        }
    },
    BuildBoundingsLookup: function (cx, cy){
        if (this.Layout.Renderer.BoundsLookup.IsFinished)
            return;
        if (this._firstStaffInAccolade == null || this._lastStaffInAccolade == null)
            return;
        var visualTop = cy + this.Y + this._firstStaffInAccolade.Y;
        var visualBottom = cy + this.Y + this._lastStaffInAccolade.Y + this._lastStaffInAccolade.Height;
        var realTop = cy + this.Y + this._allStaves[0].Y;
        var realBottom = cy + this.Y + this._allStaves[this._allStaves.length - 1].Y + this._allStaves[this._allStaves.length - 1].Height;
        var visualHeight = visualBottom - visualTop;
        var realHeight = realBottom - realTop;
        var x = this.X + this._firstStaffInAccolade.X;
        var staveGroupBounds = new AlphaTab.Rendering.Utils.StaveGroupBounds();
        staveGroupBounds.VisualBounds = {
            X: cx,
            Y: cy + this.Y,
            W: this.Width,
            H: this.get_Height()
        };
        staveGroupBounds.RealBounds = {
            X: cx,
            Y: cy + this.Y,
            W: this.Width,
            H: this.get_Height()
        };
        this.Layout.Renderer.BoundsLookup.AddStaveGroup(staveGroupBounds);
        var masterBarBoundsLookup = [];
        for (var i = 0; i < this.Staves.length; i++){
            for (var j = 0,k = this.Staves[i].FirstStaffInAccolade.BarRenderers.length; j < k; j++){
                var renderer = this.Staves[i].FirstStaffInAccolade.BarRenderers[j];
                if (i == 0){
                    var masterBarBounds = new AlphaTab.Rendering.Utils.MasterBarBounds();
                    masterBarBounds.IsFirstOfLine = renderer.get_IsFirstOfLine();
                    masterBarBounds.RealBounds = {
                        X: x + renderer.X,
                        Y: realTop,
                        W: renderer.Width,
                        H: realHeight
                    };
                    masterBarBounds.VisualBounds = {
                        X: x + renderer.X,
                        Y: visualTop,
                        W: renderer.Width,
                        H: visualHeight
                    };
                    this.Layout.Renderer.BoundsLookup.AddMasterBar(masterBarBounds);
                    masterBarBoundsLookup.push(masterBarBounds);
                }
                renderer.BuildBoundingsLookup(masterBarBoundsLookup[j], x, cy + this.Y + this._firstStaffInAccolade.Y);
            }
        }
    },
    GetBarX: function (index){
        if (this._firstStaffInAccolade == null || this.Layout.Renderer.Tracks.length == 0){
            return 0;
        }
        var bar = this.Layout.Renderer.Tracks[0].Staves[0].Bars[index];
        var renderer = this.Layout.GetRendererForBar(this._firstStaffInAccolade.get_StaveId(), bar);
        return renderer.X;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Staves.StaveGroup.AccoladeLabelSpacing = 10;
});
AlphaTab.Rendering.TabBarRenderer = function (renderer, bar){
    this._startSpacing = false;
    this.ShowTimeSignature = false;
    this.ShowRests = false;
    this.ShowTiedNotes = false;
    this.RenderRhythm = false;
    this.RhythmHeight = 0;
    this.RhythmBeams = false;
    AlphaTab.Rendering.BarRendererBase.call(this, renderer, bar);
    this.RhythmHeight = 15 * renderer.Layout.get_Scale();
    this.RhythmBeams = true;
};
AlphaTab.Rendering.TabBarRenderer.prototype = {
    get_LineOffset: function (){
        return ((11) * this.get_Scale());
    },
    GetNoteX: function (note, onEnd){
        var beat = this.GetOnNotesGlyphForBeat(note.Beat);
        if (beat != null){
            return beat.Container.X + beat.Container.VoiceContainer.X + beat.X + beat.NoteNumbers.GetNoteX(note, onEnd);
        }
        return 0;
    },
    GetNoteY: function (note){
        var beat = this.GetOnNotesGlyphForBeat(note.Beat);
        if (beat != null){
            return beat.NoteNumbers.GetNoteY(note);
        }
        return 0;
    },
    UpdateSizes: function (){
        var res = this.get_Resources();
        var numberOverflow = (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2);
        this.TopPadding = numberOverflow;
        this.BottomPadding = numberOverflow;
        this.Height = this.get_LineOffset() * (this.Bar.Staff.Track.Tuning.length - 1) + (numberOverflow * 2);
        if (this.RenderRhythm){
            this.Height += this.RhythmHeight;
            this.BottomPadding += this.RhythmHeight;
        }
        AlphaTab.Rendering.BarRendererBase.prototype.UpdateSizes.call(this);
    },
    CreatePreBeatGlyphs: function (){
        AlphaTab.Rendering.BarRendererBase.prototype.CreatePreBeatGlyphs.call(this);
        if (this.Bar.get_MasterBar().IsRepeatStart){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.get_IsFirstOfLine()){
            var center = (this.Bar.Staff.Track.Tuning.length + 1) / 2;
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.TabClefGlyph(5 * this.get_Scale(), this.GetTabY(center, 0)));
        }
        // Time Signature
        if (this.ShowTimeSignature && ((this.Bar.PreviousBar == null) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureNumerator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureNumerator) || (this.Bar.PreviousBar != null && this.Bar.get_MasterBar().TimeSignatureDenominator != this.Bar.PreviousBar.get_MasterBar().TimeSignatureDenominator))){
            this.CreateStartSpacing();
            this.CreateTimeSignatureGlyphs();
        }
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.BarNumberGlyph(0, this.GetTabY(-0.5, 0), this.Bar.Index + 1));
        if (this.Bar.get_IsEmpty()){
            this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 30 * this.get_Scale()));
        }
    },
    CreateStartSpacing: function (){
        if (this._startSpacing)
            return;
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 2 * this.get_Scale()));
        this._startSpacing = true;
    },
    CreateTimeSignatureGlyphs: function (){
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.SpacingGlyph(0, 0, 5 * this.get_Scale()));
        this.AddPreBeatGlyph(new AlphaTab.Rendering.Glyphs.TabTimeSignatureGlyph(0, this.GetTabY(0, 0), this.Bar.get_MasterBar().TimeSignatureNumerator, this.Bar.get_MasterBar().TimeSignatureDenominator, this.Bar.get_MasterBar().TimeSignatureCommon));
    },
    CreateBeatGlyphs: function (){
        for (var v = 0; v < this.Bar.Voices.length; v++){
            var voice = this.Bar.Voices[v];
            if (this.HasVoiceContainer(voice)){
                this.CreateVoiceGlyphs(this.Bar.Voices[v]);
            }
        }
    },
    CreateVoiceGlyphs: function (v){
        for (var i = 0,j = v.Beats.length; i < j; i++){
            var b = v.Beats[i];
            var container = new AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph(b, this.GetOrCreateVoiceContainer(v));
            container.PreNotes = new AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph();
            container.OnNotes = new AlphaTab.Rendering.Glyphs.TabBeatGlyph();
            this.AddBeatGlyph(container);
        }
    },
    CreatePostBeatGlyphs: function (){
        AlphaTab.Rendering.BarRendererBase.prototype.CreatePostBeatGlyphs.call(this);
        if (this.Bar.get_MasterBar().get_IsRepeatEnd()){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCloseGlyph(this.X, 0));
            if (this.Bar.get_MasterBar().RepeatCount > 2){
                this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.RepeatCountGlyph(0, this.GetTabY(-0.5, -3), this.Bar.get_MasterBar().RepeatCount));
            }
        }
        else if (this.Bar.NextBar == null || !this.Bar.NextBar.get_MasterBar().IsRepeatStart){
            this.AddPostBeatGlyph(new AlphaTab.Rendering.Glyphs.BarSeperatorGlyph(0, 0));
        }
    },
    GetTabY: function (line, correction){
        return (this.get_LineOffset() * line) + (correction * this.get_Scale());
    },
    PaintBackground: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.PaintBackground.call(this, cx, cy, canvas);
        var res = this.get_Resources();
        //
        // draw string lines
        //
        canvas.set_Color(res.StaveLineColor);
        var lineY = cy + this.Y + this.TopPadding;
        var padding = this.get_Scale();
        // collect tab note position for spaces
        var tabNotes = [];
        for (var i = 0,j = this.Bar.Staff.Track.Tuning.length; i < j; i++){
            tabNotes.push([]);
        }
        for (var $i104 = 0,$t104 = this.Bar.Voices,$l104 = $t104.length,voice = $t104[$i104]; $i104 < $l104; $i104++, voice = $t104[$i104]){
            if (this.HasVoiceContainer(voice)){
                var vc = this.GetOrCreateVoiceContainer(voice);
                for (var $i105 = 0,$t105 = vc.BeatGlyphs,$l105 = $t105.length,bg = $t105[$i105]; $i105 < $l105; $i105++, bg = $t105[$i105]){
                    var notes = (bg.OnNotes);
                    var noteNumbers = notes.NoteNumbers;
                    if (noteNumbers != null){
                        for (var s in noteNumbers.NotesPerString){
                            var noteNumber = noteNumbers.NotesPerString[s];
                            if (!noteNumber.IsEmpty){
                                tabNotes[this.Bar.Staff.Track.Tuning.length - s].push(new Float32Array([vc.X + bg.X + notes.X + noteNumbers.X, noteNumbers.Width + padding]));
                            }
                        }
                    }
                }
            }
        }
        // if we have multiple voices we need to sort by X-position, otherwise have a wild mix in the list 
        // but painting relies on ascending X-position
        for (var $i106 = 0,$l106 = tabNotes.length,line = tabNotes[$i106]; $i106 < $l106; $i106++, line = tabNotes[$i106]){
            line.sort($CreateAnonymousDelegate(this, function (a, b){
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            }));
        }
        var lineOffset = this.get_LineOffset();
        for (var i = 0,j = this.Bar.Staff.Track.Tuning.length; i < j; i++){
            if (i > 0)
                lineY += lineOffset;
            var lineX = 0;
            for (var $i107 = 0,$t107 = tabNotes[i],$l107 = $t107.length,line = $t107[$i107]; $i107 < $l107; $i107++, line = $t107[$i107]){
                canvas.FillRect(cx + this.X + lineX, lineY | 0, line[0] - lineX, this.get_Scale());
                lineX = line[0] + line[1];
            }
            canvas.FillRect(cx + this.X + lineX, lineY | 0, this.Width - lineX, this.get_Scale());
        }
        canvas.set_Color(res.MainGlyphColor);
        // Info guides for debugging
        //DrawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
        //DrawInfoGuide(canvas, cx, cy, stave.StaveTop, new Color(0, 255, 0)); // stavetop
        //DrawInfoGuide(canvas, cx, cy, stave.StaveBottom, new Color(0,255,0)); // stavebottom
        //DrawInfoGuide(canvas, cx, cy, Height, new Color(255, 0, 0)); // bottom
    },
    Paint: function (cx, cy, canvas){
        AlphaTab.Rendering.BarRendererBase.prototype.Paint.call(this, cx, cy, canvas);
        if (this.RenderRhythm){
            this.PaintBeams(cx, cy, canvas);
        }
    },
    PaintBeams: function (cx, cy, canvas){
        for (var i = 0,j = this.Helpers.BeamHelpers.length; i < j; i++){
            var v = this.Helpers.BeamHelpers[i];
            for (var k = 0,l = v.length; k < l; k++){
                var h = v[k];
                this.PaintBeamHelper(cx + this.get_BeatGlyphsStart(), cy, canvas, h);
            }
        }
    },
    PaintBeamHelper: function (cx, cy, canvas, h){
        canvas.set_Color(h.Voice.Index == 0 ? this.get_Resources().MainGlyphColor : this.get_Resources().SecondaryGlyphColor);
        // check if we need to paint simple footer
        if (h.Beats.length == 1 || !this.RhythmBeams){
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
                var beatLineX = h.GetBeatLineX(beat);
                var y1 = cy + this.Y;
                var y2 = cy + this.Y + this.Height;
                var startGlyph = this.GetOnNotesGlyphForBeat(beat);
                if (startGlyph.NoteNumbers == null){
                    y1 += this.Height - this.RhythmHeight;
                }
                else {
                    y1 += startGlyph.NoteNumbers.GetNoteY(startGlyph.NoteNumbers.MinStringNote) + this.get_LineOffset() / 2;
                }
                if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                    beatLineX -= startGlyph.Width / 2;
                }
                else {
                    beatLineX += startGlyph.Width / 2;
                }
                canvas.BeginPath();
                canvas.MoveTo(cx + this.X + beatLineX, y1);
                canvas.LineTo(cx + this.X + beatLineX, y2);
                canvas.Stroke();
                var brokenBarOffset = (6 * this.get_Scale());
                var barSpacing = (6 * this.get_Scale());
                var barSize = (3 * this.get_Scale());
                var barCount = AlphaTab.Model.ModelUtils.GetIndex(beat.Duration) - 2;
                var barStart = cy + this.Y;
                barSpacing = -barSpacing;
                barStart += this.Height;
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
                        AlphaTab.Rendering.TabBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                    else if (i < h.Beats.length - 1){
                        // full bar?
                        if (AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin(beat, h.Beats[i + 1], barIndex)){
                            barStartX = beatLineX;
                            barEndX = h.GetBeatLineX(h.Beats[i + 1]) + this.get_Scale();
                            var endGlyph = this.GetOnNotesGlyphForBeat(h.Beats[i + 1]);
                            if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                                barEndX -= endGlyph.Width / 2;
                            }
                            else {
                                barEndX += endGlyph.Width / 2;
                            }
                        }
                        else if (i == 0 || !AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin(h.Beats[i - 1], beat, barIndex)){
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        }
                        else {
                            continue;
                        }
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.TabBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                    else if (i > 0 && !AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin(beat, h.Beats[i - 1], barIndex)){
                        barStartX = beatLineX - brokenBarOffset;
                        barEndX = beatLineX;
                        barStartY = barY;
                        barEndY = barY;
                        AlphaTab.Rendering.TabBarRenderer.PaintSingleBar(canvas, cx + this.X + barStartX, barStartY, cx + this.X + barEndX, barEndY, barSize);
                    }
                }
            }
        }
    },
    PaintFooter: function (cx, cy, canvas, h){
        for (var $i108 = 0,$t108 = h.Beats,$l108 = $t108.length,beat = $t108[$i108]; $i108 < $l108; $i108++, beat = $t108[$i108]){
            if (beat.Duration == AlphaTab.Model.Duration.Whole || beat.Duration == AlphaTab.Model.Duration.DoubleWhole || beat.Duration == AlphaTab.Model.Duration.QuadrupleWhole){
                return;
            }
            //
            // draw line 
            //
            var beatLineX = h.GetBeatLineX(beat);
            var y1 = cy + this.Y;
            var y2 = cy + this.Y + this.Height;
            var startGlyph = this.GetOnNotesGlyphForBeat(beat);
            if (startGlyph.NoteNumbers == null){
                y1 += this.Height - this.RhythmHeight;
            }
            else {
                y1 += startGlyph.NoteNumbers.GetNoteY(startGlyph.NoteNumbers.MinStringNote) + this.get_LineOffset() / 2;
            }
            if (h.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                beatLineX -= startGlyph.Width / 2;
            }
            else {
                beatLineX += startGlyph.Width / 2;
            }
            canvas.BeginPath();
            canvas.MoveTo(cx + this.X + beatLineX, y1);
            canvas.LineTo(cx + this.X + beatLineX, y2);
            canvas.Stroke();
            //
            // Draw beam 
            //
            if (beat.Duration > AlphaTab.Model.Duration.Quarter){
                var glyph = new AlphaTab.Rendering.Glyphs.BeamGlyph(0, 0, beat.Duration, AlphaTab.Rendering.Utils.BeamDirection.Down, false);
                glyph.Renderer = this;
                glyph.DoLayout();
                glyph.Paint(cx + this.X + beatLineX, y2, canvas);
            }
        }
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.TabBarRenderer.StaffId = "tab";
    AlphaTab.Rendering.TabBarRenderer.LineSpacing = 10;
});
AlphaTab.Rendering.TabBarRenderer.PaintSingleBar = function (canvas, x1, y1, x2, y2, size){
    canvas.BeginPath();
    canvas.MoveTo(x1, y1);
    canvas.LineTo(x2, y2);
    canvas.LineTo(x2, y2 - size);
    canvas.LineTo(x1, y1 - size);
    canvas.ClosePath();
    canvas.Fill();
};
$Inherit(AlphaTab.Rendering.TabBarRenderer, AlphaTab.Rendering.BarRendererBase);
AlphaTab.Rendering.TabBarRendererFactory = function (showTimeSignature, showRests, showTiedNotes){
    this._showTimeSignature = false;
    this._showRests = false;
    this._showTiedNotes = false;
    AlphaTab.Rendering.BarRendererFactory.call(this);
    this._showTimeSignature = showTimeSignature;
    this._showRests = showRests;
    this._showTiedNotes = showTiedNotes;
    this.HideOnPercussionTrack = true;
};
AlphaTab.Rendering.TabBarRendererFactory.prototype = {
    get_StaffId: function (){
        return "tab";
    },
    CanCreate: function (track, staff){
        return track.Tuning.length > 0 && AlphaTab.Rendering.BarRendererFactory.prototype.CanCreate.call(this, track, staff);
    },
    Create: function (renderer, bar, staveSettings){
        var tabBarRenderer = new AlphaTab.Rendering.TabBarRenderer(renderer, bar);
        tabBarRenderer.ShowRests = this._showRests;
        tabBarRenderer.ShowTimeSignature = this._showTimeSignature;
        tabBarRenderer.ShowTiedNotes = this._showTiedNotes;
        tabBarRenderer.RenderRhythm = staveSettings.Get("rhythm", tabBarRenderer.RenderRhythm);
        tabBarRenderer.RhythmHeight = staveSettings.Get("rhythmHeight", tabBarRenderer.RhythmHeight);
        tabBarRenderer.RhythmBeams = staveSettings.Get("rhythmBeams", tabBarRenderer.RhythmBeams);
        return tabBarRenderer;
    }
};
$Inherit(AlphaTab.Rendering.TabBarRendererFactory, AlphaTab.Rendering.BarRendererFactory);
AlphaTab.Rendering.Utils.AccidentalHelper = function (){
    this._registeredAccidentals = null;
    this._appliedScoreLines = null;
    this._registeredAccidentals = {};
    this._appliedScoreLines = {};
};
AlphaTab.Rendering.Utils.AccidentalHelper.prototype = {
    ApplyAccidental: function (note){
        var track = note.Beat.Voice.Bar.Staff.Track;
        var noteValue = track.IsPercussion ? AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(note) : note.get_RealValue() - track.DisplayTranspositionPitch;
        var ks = note.Beat.Voice.Bar.get_MasterBar().KeySignature;
        var ksi = (ks + 7);
        var index = (noteValue % 12);
        var accidentalToSet = AlphaTab.Model.AccidentalType.None;
        var line = this.RegisterNoteLine(note);
        if (!note.Beat.Voice.Bar.Staff.Track.IsPercussion){
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
        var track = n.Beat.Voice.Bar.Staff.Track;
        var value = track.IsPercussion ? AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(n) : n.get_RealValue() - track.DisplayTranspositionPitch;
        var ks = n.Beat.Voice.Bar.get_MasterBar().KeySignature;
        var clef = n.Beat.Voice.Bar.Clef;
        var index = value % 12;
        var octave = ((value / 12) | 0) - 1;
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
        this._appliedScoreLines[n.Id] = steps;
        return steps;
    },
    GetNoteLine: function (n){
        return this._appliedScoreLines[n.Id];
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.AccidentalHelper.KeySignatureLookup = [[true, true, true, true, true, true, true, true, true, true, true, true], [true, true, true, true, true, false, true, true, true, true, true, true], [false, true, true, true, true, false, true, true, true, true, true, true], [false, true, true, true, true, false, false, false, true, true, true, true], [false, false, false, true, true, false, false, false, true, true, true, true], [false, false, false, true, true, false, false, false, false, false, true, true], [false, false, false, false, false, false, false, false, false, false, true, true], [false, false, false, false, false, false, false, false, false, false, false, false], [false, false, false, false, false, true, true, false, false, false, false, false], [true, true, false, false, false, true, true, false, false, false, false, false], [true, true, false, false, false, true, true, true, true, false, false, false], [true, true, true, true, false, true, true, true, true, false, false, false], [true, true, true, true, false, true, true, true, true, true, true, false], [true, true, true, true, true, true, true, true, true, true, true, false], [true, true, true, true, true, true, true, true, true, true, true, true]];
    AlphaTab.Rendering.Utils.AccidentalHelper.AccidentalNotes = [false, true, false, true, false, false, true, false, true, false, true, false];
    AlphaTab.Rendering.Utils.AccidentalHelper.StepsPerOctave = 7;
    AlphaTab.Rendering.Utils.AccidentalHelper.OctaveSteps = new Int32Array([40, 34, 32, 28, 40]);
    AlphaTab.Rendering.Utils.AccidentalHelper.SharpNoteSteps = new Int32Array([0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]);
    AlphaTab.Rendering.Utils.AccidentalHelper.FlatNoteSteps = new Int32Array([0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]);
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
    if (bar != null){
        for (var i = 0,j = bar.Voices.length; i < j; i++){
            var v = bar.Voices[i];
            this.BeamHelpers.push([]);
            this.BeamHelperLookup.push({});
            this.TupletHelpers.push([]);
            for (var k = 0,l = v.Beats.length; k < l; k++){
                var b = v.Beats[k];
                var forceNewTupletHelper = false;
                // if a new beaming helper was started, we close our tuplet grouping as well
                if (!b.get_IsRest()){
                    // try to fit beam to current beamhelper
                    if (currentBeamHelper == null || !currentBeamHelper.CheckBeat(b)){
                        if (currentBeamHelper != null){
                            currentBeamHelper.Finish();
                            forceNewTupletHelper = currentBeamHelper.Beats.length > 1;
                        }
                        else {
                            forceNewTupletHelper = true;
                        }
                        // if not possible, create the next beaming helper
                        currentBeamHelper = new AlphaTab.Rendering.Utils.BeamingHelper(bar.Staff.Track);
                        currentBeamHelper.CheckBeat(b);
                        this.BeamHelpers[v.Index].push(currentBeamHelper);
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
                    if (forceNewTupletHelper && currentTupletHelper != null){
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
            if (currentBeamHelper != null){
                currentBeamHelper.Finish();
            }
            if (currentTupletHelper != null){
                currentTupletHelper.Finish();
            }
            currentBeamHelper = null;
            currentTupletHelper = null;
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
AlphaTab.Rendering.Utils.BeatLinePositions = function (staffId, up, down){
    this.StaffId = null;
    this.Up = 0;
    this.Down = 0;
    this.StaffId = staffId;
    this.Up = up;
    this.Down = down;
};
AlphaTab.Rendering.Utils.BeamingHelper = function (track){
    this._lastBeat = null;
    this._track = null;
    this._beatLineXPositions = null;
    this.Voice = null;
    this.Beats = null;
    this.ShortestDuration = AlphaTab.Model.Duration.QuadrupleWhole;
    this.FingeringCount = 0;
    this.HasTuplet = false;
    this.FirstMinNote = null;
    this.FirstMaxNote = null;
    this.LastMinNote = null;
    this.LastMaxNote = null;
    this.MinNote = null;
    this.MaxNote = null;
    this.InvertBeamDirection = false;
    this.Direction = AlphaTab.Rendering.Utils.BeamDirection.Up;
    this._track = track;
    this.Beats = [];
    this._beatLineXPositions = {};
    this.ShortestDuration = AlphaTab.Model.Duration.QuadrupleWhole;
};
AlphaTab.Rendering.Utils.BeamingHelper.prototype = {
    GetValue: function (n){
        if (this._track.IsPercussion){
            return AlphaTab.Rendering.Utils.PercussionMapper.MapNoteForDisplay(n);
        }
        else {
            return n.get_RealValue() - this._track.DisplayTranspositionPitch;
        }
    },
    GetBeatLineX: function (beat){
        if (this.HasBeatLineX(beat)){
            if (this.Direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                return this._beatLineXPositions[beat.Index].Up;
            }
            return this._beatLineXPositions[beat.Index].Down;
        }
        return 0;
    },
    HasBeatLineX: function (beat){
        return this._beatLineXPositions.hasOwnProperty(beat.Index);
    },
    RegisterBeatLineX: function (staffId, beat, up, down){
        this._beatLineXPositions[beat.Index] = new AlphaTab.Rendering.Utils.BeatLinePositions(staffId, up, down);
    },
    Finish: function (){
        this.Direction = this.CalculateDirection();
    },
    CalculateDirection: function (){
        // multivoice handling
        if (this.Voice.Index > 0){
            return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Down);
        }
        if (this.Voice.Bar.Voices.length > 1){
            for (var v = 1; v < this.Voice.Bar.Voices.length; v++){
                if (!this.Voice.Bar.Voices[v].IsEmpty){
                    return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Up);
                }
            }
        }
        if (this.Beats.length == 1 && (this.Beats[0].Duration == AlphaTab.Model.Duration.Whole || this.Beats[0].Duration == AlphaTab.Model.Duration.DoubleWhole)){
            return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Up);
        }
        if (this.Beats[0].GraceType != AlphaTab.Model.GraceType.None){
            return this.Invert(AlphaTab.Rendering.Utils.BeamDirection.Up);
        }
        // the average key is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        var avg = ((this.GetValue(this.MaxNote) + this.GetValue(this.MinNote)) / 2) | 0;
        return this.Invert(avg < AlphaTab.Rendering.Utils.BeamingHelper.ScoreMiddleKeys[this._lastBeat.Voice.Bar.Clef] ? AlphaTab.Rendering.Utils.BeamDirection.Up : AlphaTab.Rendering.Utils.BeamDirection.Down);
    },
    Invert: function (direction){
        if (!this.InvertBeamDirection)
            return direction;
        switch (direction){
            case AlphaTab.Rendering.Utils.BeamDirection.Down:
                return AlphaTab.Rendering.Utils.BeamDirection.Up;
            case AlphaTab.Rendering.Utils.BeamDirection.Up:
                return AlphaTab.Rendering.Utils.BeamDirection.Down;
        }
        return AlphaTab.Rendering.Utils.BeamDirection.Up;
    },
    CheckBeat: function (beat){
        if (beat.InvertBeamDirection){
            this.InvertBeamDirection = true;
        }
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
            if (this.ShortestDuration < beat.Duration){
                this.ShortestDuration = beat.Duration;
            }
            if (beat.get_HasTuplet()){
                this.HasTuplet = true;
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
        return this.CalculateBeamYWithDirection(stemSize, xCorrection, xPosition, scale, yPosition, this.Direction);
    },
    CalculateBeamYWithDirection: function (stemSize, xCorrection, xPosition, scale, yPosition, direction){
        // create a line between the min and max note of the group
        if (this.Beats.length == 1){
            if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up){
                return yPosition.GetYPositionForNote(this.MaxNote) - stemSize;
            }
            return yPosition.GetYPositionForNote(this.MinNote) + stemSize;
        }
        // we use the min/max notes to place the beam along their real position        
        // we only want a maximum of 10 offset for their gradient
        var maxDistance = (10 * scale);
        // if the min note is not first or last, we can align notes directly to the position
        // of the min note
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Down && this.MinNote != this.FirstMinNote && this.MinNote != this.LastMinNote){
            return yPosition.GetYPositionForNote(this.MinNote) + stemSize;
        }
        if (direction == AlphaTab.Rendering.Utils.BeamDirection.Up && this.MaxNote != this.FirstMaxNote && this.MaxNote != this.LastMaxNote){
            return yPosition.GetYPositionForNote(this.MaxNote) - stemSize;
        }
        var startX = this.GetBeatLineX(this.FirstMinNote.Beat) + xCorrection;
        var startY = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? yPosition.GetYPositionForNote(this.FirstMaxNote) - stemSize : yPosition.GetYPositionForNote(this.FirstMinNote) + stemSize;
        var endX = this.GetBeatLineX(this.LastMaxNote.Beat) + xCorrection;
        var endY = direction == AlphaTab.Rendering.Utils.BeamDirection.Up ? yPosition.GetYPositionForNote(this.LastMaxNote) - stemSize : yPosition.GetYPositionForNote(this.LastMinNote) + stemSize;
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
    },
    IsPositionFrom: function (staffId, beat){
        if (!this._beatLineXPositions.hasOwnProperty(beat.Index)){
            return true;
        }
        return this._beatLineXPositions[beat.Index].StaffId == staffId;
    }
};
$StaticConstructor(function (){
    AlphaTab.Rendering.Utils.BeamingHelper.ScoreMiddleKeys = new Int32Array([60, 60, 57, 50, 71]);
});
AlphaTab.Rendering.Utils.BeamingHelper.CanJoin = function (b1, b2){
    // is this a voice we can join with?
    if (b1 == null || b2 == null || b1.get_IsRest() || b2.get_IsRest() || b1.GraceType != b2.GraceType){
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
AlphaTab.Rendering.Utils.BeamingHelper.IsFullBarJoin = function (a, b, barIndex){
    // TODO: this getindex call seems expensive since we call this method very often. 
    return (AlphaTab.Model.ModelUtils.GetIndex(a.Duration) - 2 - barIndex > 0) && (AlphaTab.Model.ModelUtils.GetIndex(b.Duration) - 2 - barIndex > 0);
};
AlphaTab.Rendering.Utils.StaveGroupBounds = function (){
    this.Index = 0;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Bars = null;
    this.BoundsLookup = null;
    this.Bars = [];
    this.Index = 0;
};
AlphaTab.Rendering.Utils.StaveGroupBounds.prototype = {
    Finish: function (){
        for (var i = 0; i < this.Bars.length; i++){
            this.Bars[i].Finish();
        }
    },
    AddBar: function (bounds){
        bounds.StaveGroupBounds = this;
        this.Bars.push(bounds);
    },
    FindBarAtPos: function (x){
        var b = null;
        // move from left to right as long we find bars that start before the clicked position
        for (var i = 0; i < this.Bars.length; i++){
            if (b == null || this.Bars[i].RealBounds.X < x){
                b = this.Bars[i];
            }
            else if (x > this.Bars[i].RealBounds.X + this.Bars[i].RealBounds.W){
                break;
            }
        }
        return b;
    }
};
AlphaTab.Rendering.Utils.MasterBarBounds = function (){
    this.IsFirstOfLine = false;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Bars = null;
    this.StaveGroupBounds = null;
    this.Bars = [];
};
AlphaTab.Rendering.Utils.MasterBarBounds.prototype = {
    AddBar: function (bounds){
        bounds.MasterBarBounds = this;
        this.Bars.push(bounds);
    },
    FindBeatAtPos: function (x, y){
        var beat = null;
        for (var i = 0; i < this.Bars.length; i++){
            var b = this.Bars[i].FindBeatAtPos(x);
            if (b != null && (beat == null || beat.RealBounds.X < b.RealBounds.X)){
                beat = b;
            }
        }
        return beat == null ? null : beat.Beat;
    },
    Finish: function (){
        this.Bars.sort($CreateAnonymousDelegate(this, function (a, b){
            if (a.RealBounds.Y < b.RealBounds.Y){
                return -1;
            }
            if (a.RealBounds.Y > b.RealBounds.Y){
                return 1;
            }
            if (a.RealBounds.X < b.RealBounds.X){
                return -1;
            }
            if (a.RealBounds.X > b.RealBounds.X){
                return 1;
            }
            return 0;
        }));
    },
    AddBeat: function (bounds){
        this.StaveGroupBounds.BoundsLookup.AddBeat(bounds);
    }
};
AlphaTab.Rendering.Utils.BarBounds = function (){
    this.MasterBarBounds = null;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Bar = null;
    this.Beats = null;
    this.Beats = [];
};
AlphaTab.Rendering.Utils.BarBounds.prototype = {
    AddBeat: function (bounds){
        bounds.BarBounds = this;
        this.Beats.push(bounds);
        this.MasterBarBounds.AddBeat(bounds);
    },
    FindBeatAtPos: function (x){
        var beat = null;
        for (var i = 0; i < this.Beats.length; i++){
            if (beat == null || this.Beats[i].RealBounds.X < x){
                beat = this.Beats[i];
            }
            else if (this.Beats[i].RealBounds.X > x){
                break;
            }
        }
        return beat;
    }
};
AlphaTab.Rendering.Utils.BeatBounds = function (){
    this.BarBounds = null;
    this.VisualBounds = null;
    this.RealBounds = null;
    this.Beat = null;
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
        if (this.AdditionalSettings.hasOwnProperty(key.toLowerCase())){
            return (this.AdditionalSettings[key.toLowerCase()]);
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
AlphaTab.StaveSettings.prototype = {
    Get: function (key, def){
        if (this.AdditionalSettings.hasOwnProperty(key.toLowerCase())){
            return (this.AdditionalSettings[key.toLowerCase()]);
        }
        return def;
    }
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
AlphaTab.Util.Logger = function (){
};
$StaticConstructor(function (){
    AlphaTab.Util.Logger.LogLevel = AlphaTab.Util.LogLevel.None;
    AlphaTab.Util.Logger.LogLevel = AlphaTab.Util.LogLevel.Info;
});
AlphaTab.Util.Logger.Debug = function (category, msg, details){
    AlphaTab.Util.Logger.Log(AlphaTab.Util.LogLevel.Debug, category, msg, details);
};
AlphaTab.Util.Logger.Warning = function (category, msg, details){
    AlphaTab.Util.Logger.Log(AlphaTab.Util.LogLevel.Warning, category, msg, details);
};
AlphaTab.Util.Logger.Info = function (category, msg, details){
    AlphaTab.Util.Logger.Log(AlphaTab.Util.LogLevel.Info, category, msg, details);
};
AlphaTab.Util.Logger.Error = function (category, msg, details){
    AlphaTab.Util.Logger.Log(AlphaTab.Util.LogLevel.Error, category, msg, details);
};
AlphaTab.Util.Logger.Log = function (logLevel, category, msg, details){
    if (logLevel < AlphaTab.Util.Logger.LogLevel)
        return;
    AlphaTab.Platform.Std.Log(logLevel, category, msg, details);
};
AlphaTab.Util.LogLevel = {
    None: 0,
    Debug: 1,
    Info: 2,
    Warning: 3,
    Error: 4
};
AlphaTab.Xml = AlphaTab.Xml || {};
AlphaTab.Xml.XmlNode = function (){
    this.NodeType = AlphaTab.Xml.XmlNodeType.None;
    this.LocalName = null;
    this.Value = null;
    this.ChildNodes = null;
    this.Attributes = null;
    this.FirstChild = null;
    this.FirstElement = null;
    this.Attributes = {};
    this.ChildNodes = [];
};
AlphaTab.Xml.XmlNode.prototype = {
    AddChild: function (node){
        this.ChildNodes.push(node);
        this.FirstChild = node;
        if (node.NodeType == AlphaTab.Xml.XmlNodeType.Element){
            this.FirstElement = node;
        }
    },
    GetAttribute: function (name){
        if (this.Attributes.hasOwnProperty(name)){
            return this.Attributes[name];
        }
        return "";
    },
    GetElementsByTagName: function (name){
        var tags = [];
        for (var $i109 = 0,$t109 = this.ChildNodes,$l109 = $t109.length,c = $t109[$i109]; $i109 < $l109; $i109++, c = $t109[$i109]){
            if (c != null && c.NodeType == AlphaTab.Xml.XmlNodeType.Element && c.LocalName == name){
                tags.push(c);
            }
        }
        return tags.slice(0);
    },
    FindChildElement: function (name){
        for (var $i110 = 0,$t110 = this.ChildNodes,$l110 = $t110.length,c = $t110[$i110]; $i110 < $l110; $i110++, c = $t110[$i110]){
            if (c != null && c.NodeType == AlphaTab.Xml.XmlNodeType.Element && c.LocalName == name){
                return c;
            }
        }
        return null;
    },
    get_InnerText: function (){
        if (this.NodeType == AlphaTab.Xml.XmlNodeType.Element || this.NodeType == AlphaTab.Xml.XmlNodeType.Document){
            var txt = new String();
            for (var $i111 = 0,$t111 = this.ChildNodes,$l111 = $t111.length,c = $t111[$i111]; $i111 < $l111; $i111++, c = $t111[$i111]){
                txt+=c.get_InnerText();
            }
            return txt.trim();
        }
        return this.Value;
    }
};
AlphaTab.Xml.XmlDocument = function (xml){
    this.DocumentElement = null;
    AlphaTab.Xml.XmlNode.call(this);
    this.NodeType = AlphaTab.Xml.XmlNodeType.Document;
    AlphaTab.Xml.XmlParser.Parse(xml, 0, this);
    for (var $i112 = 0,$t112 = this.ChildNodes,$l112 = $t112.length,child = $t112[$i112]; $i112 < $l112; $i112++, child = $t112[$i112]){
        if (child.NodeType == AlphaTab.Xml.XmlNodeType.Element){
            this.DocumentElement = child;
            break;
        }
    }
};
$Inherit(AlphaTab.Xml.XmlDocument, AlphaTab.Xml.XmlNode);
AlphaTab.Xml.XmlException = function (message, xml, pos){
    this.Xml = null;
    this.Pos = 0;
    AlphaTab.AlphaTabException.call(this, message);
    this.Xml = xml;
    this.Pos = pos;
};
$Inherit(AlphaTab.Xml.XmlException, AlphaTab.AlphaTabException);
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
AlphaTab.Xml.XmlParser = function (){
};
$StaticConstructor(function (){
    AlphaTab.Xml.XmlParser.CharCodeLF = "\n";
    AlphaTab.Xml.XmlParser.CharCodeTab = "\t";
    AlphaTab.Xml.XmlParser.CharCodeCR = "\r";
    AlphaTab.Xml.XmlParser.CharCodeSpace = " ";
    AlphaTab.Xml.XmlParser.CharCodeLowerThan = "<";
    AlphaTab.Xml.XmlParser.CharCodeAmp = "&";
    AlphaTab.Xml.XmlParser.CharCodeBrackedClose = "]";
    AlphaTab.Xml.XmlParser.CharCodeBrackedOpen = "[";
    AlphaTab.Xml.XmlParser.CharCodeGreaterThan = ">";
    AlphaTab.Xml.XmlParser.CharCodeExclamation = "!";
    AlphaTab.Xml.XmlParser.CharCodeUpperD = "D";
    AlphaTab.Xml.XmlParser.CharCodeLowerD = "d";
    AlphaTab.Xml.XmlParser.CharCodeMinus = "-";
    AlphaTab.Xml.XmlParser.CharCodeQuestion = "?";
    AlphaTab.Xml.XmlParser.CharCodeSlash = "/";
    AlphaTab.Xml.XmlParser.CharCodeEquals = "=";
    AlphaTab.Xml.XmlParser.CharCodeDoubleQuote = "\"";
    AlphaTab.Xml.XmlParser.CharCodeSingleQuote = "\'";
    AlphaTab.Xml.XmlParser.CharCodeSharp = "#";
    AlphaTab.Xml.XmlParser.CharCodeLowerX = "x";
    AlphaTab.Xml.XmlParser.CharCodeLowerA = "a";
    AlphaTab.Xml.XmlParser.CharCodeLowerZ = "z";
    AlphaTab.Xml.XmlParser.CharCodeUpperA = "A";
    AlphaTab.Xml.XmlParser.CharCodeUpperZ = "Z";
    AlphaTab.Xml.XmlParser.CharCode0 = "0";
    AlphaTab.Xml.XmlParser.CharCode9 = "0";
    AlphaTab.Xml.XmlParser.CharCodeColon = ":";
    AlphaTab.Xml.XmlParser.CharCodeDot = ".";
    AlphaTab.Xml.XmlParser.CharCodeUnderscore = "_";
    AlphaTab.Xml.XmlParser.Escapes = null;
    AlphaTab.Xml.XmlParser.Escapes = {};
    AlphaTab.Xml.XmlParser.Escapes["lt"] = "<";
    AlphaTab.Xml.XmlParser.Escapes["gt"] = ">";
    AlphaTab.Xml.XmlParser.Escapes["amp"] = "&";
    AlphaTab.Xml.XmlParser.Escapes["quot"] = "\"";
    AlphaTab.Xml.XmlParser.Escapes["apos"] = "\'";
});
AlphaTab.Xml.XmlParser.Parse = function (str, p, parent){
    var c = str.charCodeAt(p);
    var state = 1;
    var next = 1;
    var start = 0;
    var buf = new String();
    var escapeNext = 1;
    var xml = null;
    var aname = null;
    var nbrackets = 0;
    var attrValQuote = 0;
    while (p < str.length){
        c = str.charCodeAt(p);
        switch (state){
            case 0:
                switch (c){
                    case 10:
                    case 13:
                    case 9:
                    case 32:
                    break;
                    default:
                    state = next;
                    continue;
                }
                break;
            case 1:
                switch (c){
                    case 60:
                    state = 0;
                    next = 2;
                    break;
                    default:
                    start = p;
                    state = 13;
                    continue;
                }
                break;
            case 13:
                if (c == 60){
                // <
                buf+=str.substr(start, p - start);
                var child = new AlphaTab.Xml.XmlNode();
                child.NodeType = AlphaTab.Xml.XmlNodeType.Text;
                child.Value = buf;
                buf = new String();
                parent.AddChild(child);
                state = 0;
                next = 2;
            }
                else if (c == 38){
                // &
                buf+=str.substr(start, p - start);
                state = 18;
                escapeNext = 13;
                start = p + 1;
            }
                break;
            case 17:
                if (c == 93 && str.charCodeAt(p + 1) == 93 && str.charCodeAt(p + 2) == 62){
                // ]]>
                var child = new AlphaTab.Xml.XmlNode();
                child.NodeType = AlphaTab.Xml.XmlNodeType.CDATA;
                child.Value = str.substr(start, p - start);
                parent.AddChild(child);
                p += 2;
                state = 1;
            }
                break;
            case 2:
                switch (c){
                    case 33:
                    if (str.charCodeAt(p + 1) == 91){
                    // ]
                    p += 2;
                    if (str.substr(p, 6).toUpperCase() != "CDATA["){
                        throw $CreateException(new AlphaTab.Xml.XmlException("Expected <![CDATA[", str, p), new Error());
                    }
                    p += 5;
                    state = 17;
                    start = p + 1;
                }
                    else if (str.charCodeAt(p + 1) == 68 || str.charCodeAt(p + 1) == 100){
                    // D
                    if (str.substr(p + 2, 6).toUpperCase() != "OCTYPE"){
                        throw $CreateException(new AlphaTab.Xml.XmlException("Expected <!DOCTYPE", str, p), new Error());
                    }
                    p += 8;
                    state = 16;
                    start = p + 1;
                }
                else if (str.charCodeAt(p + 1) != 45 || str.charCodeAt(p + 2) != 45){
                    // --
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected <!--", str, p), new Error());
                }
                else {
                    p += 2;
                    state = 15;
                    start = p + 1;
                }
                    break;
                    case 63:
                    state = 14;
                    start = p;
                    break;
                    case 47:
                    if (parent == null){
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected node name", str, p), new Error());
                }
                    start = p + 1;
                    state = 0;
                    next = 10;
                    break;
                    default:
                    state = 3;
                    start = p;
                    continue;
                }
                break;
            case 3:
                if (!AlphaTab.Xml.XmlParser.IsValidChar(c)){
                if (p == start){
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected node name", str, p), new Error());
                }
                xml = new AlphaTab.Xml.XmlNode();
                xml.NodeType = AlphaTab.Xml.XmlNodeType.Element;
                xml.LocalName = str.substr(start, p - start);
                parent.AddChild(xml);
                state = 0;
                next = 4;
                continue;
            }
                break;
            case 4:
                switch (c){
                    case 47:
                    state = 11;
                    break;
                    case 62:
                    state = 9;
                    break;
                    default:
                    state = 5;
                    start = p;
                    continue;
                }
                break;
            case 5:
                if (!AlphaTab.Xml.XmlParser.IsValidChar(c)){
                if (start == p){
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected attribute name", str, p), new Error());
                }
                var tmp = str.substr(start, p - start);
                aname = tmp;
                if (xml.Attributes.hasOwnProperty(aname)){
                    throw $CreateException(new AlphaTab.Xml.XmlException("Duplicate attribute [" + aname + "]", str, p), new Error());
                }
                state = 0;
                next = 6;
                continue;
            }
                break;
            case 6:
                switch (c){
                    case 61:
                    state = 0;
                    next = 7;
                    break;
                    default:
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected =", str, p), new Error());
                }
                break;
            case 7:
                switch (c){
                    case 34:
                    case 39:
                    buf = new String();
                    state = 8;
                    start = p + 1;
                    attrValQuote = c;
                    break;
                }
                break;
            case 8:
                switch (c){
                    case 38:
                    buf+=str.substr(start, p - start);
                    state = 18;
                    escapeNext = 8;
                    start = p + 1;
                    break;
                    default:
                    if (c == attrValQuote){
                    buf+=str.substr(start, p - start);
                    var val = buf;
                    buf = new String();
                    xml.Attributes[aname] = val;
                    state = 0;
                    next = 4;
                }
                    break;
                }
                break;
            case 9:
                p = AlphaTab.Xml.XmlParser.Parse(str, p, xml);
                start = p;
                state = 1;
                break;
            case 11:
                switch (c){
                    case 62:
                    state = 1;
                    break;
                    default:
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected >", str, p), new Error());
                }
                break;
            case 12:
                switch (c){
                    case 62:
                    return p;
                    default:
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected >", str, p), new Error());
                }
                break;
            case 10:
                if (!AlphaTab.Xml.XmlParser.IsValidChar(c)){
                if (start == p){
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected node name", str, p), new Error());
                }
                var v = str.substr(start, p - start);
                if (v != parent.LocalName){
                    throw $CreateException(new AlphaTab.Xml.XmlException("Expected </" + parent.LocalName + ">", str, p), new Error());
                }
                state = 0;
                next = 12;
                continue;
            }
                break;
            case 15:
                if (c == 45 && str.charCodeAt(p + 1) == 45 && str.charCodeAt(p + 2) == 62){
                // -->
                //var comment = new XmlNode();
                //comment.NodeType = XmlNodeType.Comment;
                //comment.Value = str.Substring(start, p - start);
                //parent.AddChild(comment);
                p += 2;
                state = 1;
            }
                break;
            case 16:
                if (c == 91){
                // [
                nbrackets++;
            }
                else if (c == 93){
                // ]
                nbrackets--;
            }
            else if (c == 62 && nbrackets == 0){
                // >
                var node = new AlphaTab.Xml.XmlNode();
                node.NodeType = AlphaTab.Xml.XmlNodeType.DocumentType;
                node.Value = str.substr(start, p - start);
                parent.AddChild(node);
                state = 1;
            }
                break;
            case 14:
                if (c == 63 && str.charCodeAt(p + 1) == 62){
                // ?>
                p++;
                // skip
                state = 1;
            }
                break;
            case 18:
                if (c == 59){
                // ;
                var s = str.substr(start, p - start);
                if (s.charCodeAt(0) == 35){
                    // #
                    var code = s.charCodeAt(1) == 120 ? AlphaTab.Platform.Std.ParseInt("0" + s.substr(1, s.length - 1)) : AlphaTab.Platform.Std.ParseInt(s.substr(1, s.length - 1));
                    buf+=String.fromCharCode(code);
                }
                else if (AlphaTab.Xml.XmlParser.Escapes.hasOwnProperty(s)){
                    buf+=AlphaTab.Xml.XmlParser.Escapes[s];
                }
                else {
                    buf+="&" + s + ";";
                }
                start = p + 1;
                state = escapeNext;
            }
                else if (!AlphaTab.Xml.XmlParser.IsValidChar(c) && c != 35){
                // #
                buf+="&";
                buf+=str.substr(start, p - start);
                p--;
                start = p + 1;
                state = escapeNext;
            }
                break;
        }
        p++;
    }
    if (state == 1){
        start = p;
        state = 13;
    }
    if (state == 13){
        if (p != start){
            buf+=str.substr(start, p - start);
            var node = new AlphaTab.Xml.XmlNode();
            node.NodeType = AlphaTab.Xml.XmlNodeType.Text;
            node.Value = buf;
            parent.AddChild(node);
        }
        return p;
    }
    if (state == 18 && escapeNext == 13){
        buf+="&";
        buf+=str.substr(start, p - start);
        var node = new AlphaTab.Xml.XmlNode();
        node.NodeType = AlphaTab.Xml.XmlNodeType.Text;
        node.Value = buf;
        parent.AddChild(node);
        return p;
    }
    throw $CreateException(new AlphaTab.Xml.XmlException("Unexpected end", str, p), new Error());
};
AlphaTab.Xml.XmlParser.IsValidChar = function (c){
    return (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 48) || c == 58 || c == 46 || c == 95 || c == 45;
};
AlphaTab.Model.Lyrics = AlphaTab.Model.Lyrics || {};
AlphaTab.Model.Lyrics.LyricsState = function (){
};
$StaticConstructor(function (){
    AlphaTab.Model.Lyrics.LyricsState.IGNORE_SPACES = 0;
    AlphaTab.Model.Lyrics.LyricsState.BEGIN = 1;
    AlphaTab.Model.Lyrics.LyricsState.TEXT = 2;
    AlphaTab.Model.Lyrics.LyricsState.COMMENT = 3;
    AlphaTab.Model.Lyrics.LyricsState.DASH = 4;
});
AlphaTab.Rendering.Glyphs.TripletFeelGlyph = AlphaTab.Rendering.Glyphs.TripletFeelGlyph || {};
AlphaTab.Rendering.Glyphs.TripletFeelGlyph.BarType = {
    Full: 0,
    PartialLeft: 1,
    PartialRight: 2
};
AlphaTab.Xml.XmlParser = AlphaTab.Xml.XmlParser || {};
AlphaTab.Xml.XmlParser.XmlState = function (){
};
$StaticConstructor(function (){
    AlphaTab.Xml.XmlParser.XmlState.IGNORE_SPACES = 0;
    AlphaTab.Xml.XmlParser.XmlState.BEGIN = 1;
    AlphaTab.Xml.XmlParser.XmlState.BEGIN_NODE = 2;
    AlphaTab.Xml.XmlParser.XmlState.TAG_NAME = 3;
    AlphaTab.Xml.XmlParser.XmlState.BODY = 4;
    AlphaTab.Xml.XmlParser.XmlState.ATTRIB_NAME = 5;
    AlphaTab.Xml.XmlParser.XmlState.EQUALS = 6;
    AlphaTab.Xml.XmlParser.XmlState.ATTVAL_BEGIN = 7;
    AlphaTab.Xml.XmlParser.XmlState.ATTRIB_VAL = 8;
    AlphaTab.Xml.XmlParser.XmlState.CHILDS = 9;
    AlphaTab.Xml.XmlParser.XmlState.CLOSE = 10;
    AlphaTab.Xml.XmlParser.XmlState.WAIT_END = 11;
    AlphaTab.Xml.XmlParser.XmlState.WAIT_END_RET = 12;
    AlphaTab.Xml.XmlParser.XmlState.PCDATA = 13;
    AlphaTab.Xml.XmlParser.XmlState.HEADER = 14;
    AlphaTab.Xml.XmlParser.XmlState.COMMENT = 15;
    AlphaTab.Xml.XmlParser.XmlState.DOCTYPE = 16;
    AlphaTab.Xml.XmlParser.XmlState.CDATA = 17;
    AlphaTab.Xml.XmlParser.XmlState.ESCAPE = 18;
});

for(var i = 0; i < $StaticConstructors.length; i++) {
    $StaticConstructors[i]();
}


