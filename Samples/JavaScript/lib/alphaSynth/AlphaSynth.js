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
        for (var p in ex)
           error[p] = ex[p];
        return error;
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

var Int16Array = Int16Array || Array;
var Uint8Array = Uint8Array || Array;
var Int32Array = Int32Array || Array;
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

var Float32Array = Float32Array || Array;

var AlphaSynth = AlphaSynth || {};
AlphaSynth.Main = AlphaSynth.Main || {};
AlphaSynth.Main.AlphaSynthApi = function (){
};
AlphaSynth.Main.AlphaSynthApi.Create = function (alphaSynthScriptFile){
    // var swf = SwfObject;
    var supportsWebAudio = !!window.ScriptProcessorNode;
    var supportsWebWorkers = !!window.Worker;
    var forceFlash = !!window.ForceFlash;
    // explicitly specified file/root path
    if (!((alphaSynthScriptFile==null)||(alphaSynthScriptFile.length==0))){
        // append script name 
        if (!(alphaSynthScriptFile.lastIndexOf(".js")==(alphaSynthScriptFile.length-".js".length))){
            if (!(alphaSynthScriptFile.lastIndexOf("/")==(alphaSynthScriptFile.length-"/".length))){
                alphaSynthScriptFile += "/";
            }
            alphaSynthScriptFile += "AlphaSynth.js";
        }
        if (!alphaSynthScriptFile.indexOf("http")==0 && !alphaSynthScriptFile.indexOf("https")==0){
            var root = new Array();
            root.push(window.location.protocol);
            root.push("//");
            root.push(window.location.hostname);
            if (window.location.port){
                root.push(":");
                root.push(window.location.port);
            }
            root.push(alphaSynthScriptFile);
            alphaSynthScriptFile = root.join('');
        }
    }
    else {
        alphaSynthScriptFile = AlphaSynth.Platform.Platform.ScriptFile;
    }
    if (supportsWebAudio && !forceFlash){
        AlphaSynth.Util.Logger.Info("Will use webworkers for synthesizing and web audio api for playback");
        return new AlphaSynth.Main.AlphaSynthWebWorkerApi(new AlphaSynth.Main.AlphaSynthWebAudioOutput(), alphaSynthScriptFile);
    }
    if (supportsWebWorkers){
        AlphaSynth.Util.Logger.Info("Will use webworkers for synthesizing and flash for playback");
        return new AlphaSynth.Main.AlphaSynthWebWorkerApi(new AlphaSynth.Main.AlphaSynthFlashOutput(alphaSynthScriptFile), alphaSynthScriptFile);
    }
    AlphaSynth.Util.Logger.Error("Incompatible browser");
    throw $CreateException(new System.Exception.ctor$$String("Incompatible browser"), new Error());
};
AlphaSynth.Main.AlphaSynthFlashOutput = function (alphaSynthRoot){
    this._alphaSynthRoot = null;
    this._id = null;
    this._swfId = null;
    this._swfContainer = null;
    this._playbackSpeed = 0;
    this.Ready = null;
    this.SampleRequest = null;
    this.Finished = null;
    this.SamplesPlayed = null;
    this._alphaSynthRoot = alphaSynthRoot;
    var lastSlash = this._alphaSynthRoot.lastIndexOf("/");
    if (lastSlash != -1){
        this._alphaSynthRoot = this._alphaSynthRoot.substr(0, lastSlash + 1);
    }
};
AlphaSynth.Main.AlphaSynthFlashOutput.prototype = {
    get_SampleRate: function (){
        return 44100;
    },
    Open: function (){
        this._playbackSpeed = 1;
        this._id = "alphaSynthFlashPlayer" + AlphaSynth.Main.AlphaSynthFlashOutput.NextId;
        this._swfId = this._id + "swf";
        AlphaSynth.Main.AlphaSynthFlashOutput.Lookup[this._id] = this;
        AlphaSynth.Main.AlphaSynthFlashOutput.NextId++;
        this._swfContainer = document.createElement("div");
        this._swfContainer.className = "alphaSynthFlashPlayer";
        this._swfContainer.setAttribute("id", this._id);
        document.body.appendChild(this._swfContainer);
        var swf =  swfobject;
        var embedSwf = swf["embedSWF"];
        embedSwf(this._alphaSynthRoot + "AlphaSynth.FlashOutput.swf", this._id, "1px", "1px", "9.0.0", null, {
            id: this._id,
            sampleRate: 44100
        }, {
            allowScriptAccess: "always"
        }, {
            id: this._swfId
        });
    },
    Play: function (){
        document.getElementById(this._swfId).AlphaSynthPlay();
    },
    Pause: function (){
        document.getElementById(this._swfId).AlphaSynthPause();
    },
    SequencerFinished: function (){
        document.getElementById(this._swfId).AlphaSynthSequencerFinished();
    },
    AddSamples: function (samples){
        var uint8 = new Uint8Array(samples.buffer);
        var fromCharCode =  String.fromCharCode;
        var b64 = window.btoa(fromCharCode.apply(null, uint8));
        document.getElementById(this._swfId).AlphaSynthAddSamples(b64);
    },
    ResetSamples: function (){
        document.getElementById(this._swfId).AlphaSynthResetSamples();
    },
    add_Ready: function (value){
        this.Ready = $CombineDelegates(this.Ready, value);
    },
    remove_Ready: function (value){
        this.Ready = $RemoveDelegate(this.Ready, value);
    },
    add_SampleRequest: function (value){
        this.SampleRequest = $CombineDelegates(this.SampleRequest, value);
    },
    remove_SampleRequest: function (value){
        this.SampleRequest = $RemoveDelegate(this.SampleRequest, value);
    },
    add_Finished: function (value){
        this.Finished = $CombineDelegates(this.Finished, value);
    },
    remove_Finished: function (value){
        this.Finished = $RemoveDelegate(this.Finished, value);
    },
    add_SamplesPlayed: function (value){
        this.SamplesPlayed = $CombineDelegates(this.SamplesPlayed, value);
    },
    remove_SamplesPlayed: function (value){
        this.SamplesPlayed = $RemoveDelegate(this.SamplesPlayed, value);
    }
};
$StaticConstructor(function (){
    AlphaSynth.Main.AlphaSynthFlashOutput.PreferredSampleRate = 44100;
    AlphaSynth.Main.AlphaSynthFlashOutput.Id = "alphaSynthFlashPlayer";
    AlphaSynth.Main.AlphaSynthFlashOutput.Lookup = null;
    AlphaSynth.Main.AlphaSynthFlashOutput.NextId = 0;
    AlphaSynth.Main.AlphaSynthFlashOutput.Lookup = {};
});
AlphaSynth.Main.AlphaSynthFlashOutput.OnReady = function (id){
    if (AlphaSynth.Main.AlphaSynthFlashOutput.Lookup.hasOwnProperty(id)){
        AlphaSynth.Main.AlphaSynthFlashOutput.Lookup[id].Ready();
    }
};
AlphaSynth.Main.AlphaSynthFlashOutput.OnSampleRequest = function (id){
    if (AlphaSynth.Main.AlphaSynthFlashOutput.Lookup.hasOwnProperty(id)){
        AlphaSynth.Main.AlphaSynthFlashOutput.Lookup[id].SampleRequest();
    }
};
AlphaSynth.Main.AlphaSynthFlashOutput.OnFinished = function (id){
    if (AlphaSynth.Main.AlphaSynthFlashOutput.Lookup.hasOwnProperty(id) && AlphaSynth.Main.AlphaSynthFlashOutput.Lookup[id].Finished != null){
        AlphaSynth.Main.AlphaSynthFlashOutput.Lookup[id].Finished();
    }
};
AlphaSynth.Main.AlphaSynthFlashOutput.OnSamplesPlayed = function (id, samples){
    if (AlphaSynth.Main.AlphaSynthFlashOutput.Lookup.hasOwnProperty(id)){
        AlphaSynth.Main.AlphaSynthFlashOutput.Lookup[id].SamplesPlayed(samples);
    }
};
AlphaSynth.Main.AlphaSynthWebAudioOutput = function (){
    this._context = null;
    this._buffer = null;
    this._source = null;
    this._audioNode = null;
    this._circularBuffer = null;
    this._finished = false;
    this.Ready = null;
    this.SamplesPlayed = null;
    this.SampleRequest = null;
    this.Finished = null;
};
AlphaSynth.Main.AlphaSynthWebAudioOutput.prototype = {
    get_SampleRate: function (){
        return this._context.sampleRate | 0;
    },
    Open: function (){
        this._finished = false;
        this._circularBuffer = new AlphaSynth.Ds.CircularSampleBuffer(40960);
         window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this._context = new AudioContext();
        // possible fix for Web Audio in iOS 9 (issue #4)
        var ctx = this._context;
        if (ctx.state == "suspended"){
            var resume = null;
            resume = $CreateAnonymousDelegate(this, function (e){
                ctx.resume();
                window.setTimeout($CreateAnonymousDelegate(this, function (){
                    if (ctx.state == "running"){
                        document.body.removeEventListener("touchend", resume, false);
                    }
                }), 0);
            });
            document.body.addEventListener("touchend", resume, false);
        }
        // create an empty buffer source (silence)
        this._buffer = this._context.createBuffer(2, 4096, this._context.sampleRate);
        // create a script processor node which will replace the silence with the generated audio
        this._audioNode = this._context.createScriptProcessor(4096, 0, 2);
        this._audioNode.onaudioprocess = $CreateDelegate(this, this.GenerateSound);
        this.Ready();
    },
    Play: function (){
        this.RequestBuffers();
        this._finished = false;
        this._source = this._context.createBufferSource();
        this._source.buffer = this._buffer;
        this._source.loop = true;
        this._source.connect(this._audioNode, 0, 0);
        this._source.start(0);
        this._audioNode.connect(this._context.destination, 0, 0);
    },
    Pause: function (){
        if (this._source != null){
            this._source.stop(0);
        }
        this._source = null;
        this._audioNode.disconnect(0);
    },
    SequencerFinished: function (){
        this._finished = true;
    },
    AddSamples: function (f){
        this._circularBuffer.Write(f, 0, f.length);
    },
    ResetSamples: function (){
        this._circularBuffer.Clear();
    },
    RequestBuffers: function (){
        // if we fall under the half of buffers
        // we request one half
        var count = 20480;
        if (this._circularBuffer.get_Count() < count && this.SampleRequest != null){
            for (var i = 0; i < 5; i++){
                this.SampleRequest();
            }
        }
    },
    GenerateSound: function (e){
        var ae = e;
        var left = ae.outputBuffer.getChannelData(0);
        var right = ae.outputBuffer.getChannelData(1);
        var samples = left.length + right.length;
        if (this._circularBuffer.get_Count() < samples){
            if (this._finished){
                this.Finished();
            }
        }
        else {
            var buffer = new Float32Array(samples);
            this._circularBuffer.Read(buffer, 0, buffer.length);
            var s = 0;
            for (var i = 0; i < left.length; i++){
                left[i] = buffer[s++];
                right[i] = buffer[s++];
            }
            this.SamplesPlayed(left.length);
        }
        if (!this._finished){
            this.RequestBuffers();
        }
    },
    add_Ready: function (value){
        this.Ready = $CombineDelegates(this.Ready, value);
    },
    remove_Ready: function (value){
        this.Ready = $RemoveDelegate(this.Ready, value);
    },
    add_SamplesPlayed: function (value){
        this.SamplesPlayed = $CombineDelegates(this.SamplesPlayed, value);
    },
    remove_SamplesPlayed: function (value){
        this.SamplesPlayed = $RemoveDelegate(this.SamplesPlayed, value);
    },
    add_SampleRequest: function (value){
        this.SampleRequest = $CombineDelegates(this.SampleRequest, value);
    },
    remove_SampleRequest: function (value){
        this.SampleRequest = $RemoveDelegate(this.SampleRequest, value);
    },
    add_Finished: function (value){
        this.Finished = $CombineDelegates(this.Finished, value);
    },
    remove_Finished: function (value){
        this.Finished = $RemoveDelegate(this.Finished, value);
    }
};
$StaticConstructor(function (){
    AlphaSynth.Main.AlphaSynthWebAudioOutput.BufferSize = 4096;
    AlphaSynth.Main.AlphaSynthWebAudioOutput.BufferCount = 10;
});
AlphaSynth.Main.AlphaSynthWebWorker = function (main){
    this._player = null;
    this._main = null;
    this._main = main;
    this._main.addEventListener("message", $CreateDelegate(this, this.HandleMessage), false);
    this._player = new AlphaSynth.AlphaSynth();
    this._player.add_PositionChanged($CreateDelegate(this, this.OnPositionChanged));
    this._player.add_PlayerStateChanged($CreateDelegate(this, this.OnPlayerStateChanged));
    this._player.add_Finished($CreateDelegate(this, this.OnFinished));
    this._player.add_SoundFontLoaded($CreateDelegate(this, this.OnSoundFontLoaded));
    this._player.add_SoundFontLoadFailed($CreateDelegate(this, this.OnSoundFontLoadFailed));
    this._player.add_SoundFontLoadFailed($CreateDelegate(this, this.OnSoundFontLoadFailed));
    this._player.add_MidiLoaded($CreateDelegate(this, this.OnMidiLoaded));
    this._player.add_MidiLoadFailed($CreateDelegate(this, this.OnMidiLoadFailed));
    this._player.add_ReadyForPlayback($CreateDelegate(this, this.OnReadyForPlayback));
    this._main.postMessage({
        cmd: "alphaSynth.ready"
    });
};
AlphaSynth.Main.AlphaSynthWebWorker.prototype = {
    HandleMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "alphaSynth.setLogLevel":
                AlphaSynth.Util.Logger.LogLevel = data["value"];
                break;
            case "alphaSynth.setMasterVolume":
                this._player.set_MasterVolume(data["value"]);
                break;
            case "alphaSynth.setPlaybackSpeed":
                this._player.set_PlaybackSpeed(data["value"]);
                break;
            case "alphaSynth.setTickPosition":
                this._player.set_TickPosition(data["value"]);
                break;
            case "alphaSynth.setTimePosition":
                this._player.set_TimePosition(data["value"]);
                break;
            case "alphaSynth.setPlaybackRange":
                this._player.set_PlaybackRange(data["value"]);
                break;
            case "alphaSynth.play":
                this._player.Play();
                break;
            case "alphaSynth.pause":
                this._player.Pause();
                break;
            case "alphaSynth.playPause":
                this._player.PlayPause();
                break;
            case "alphaSynth.stop":
                this._player.Stop();
                break;
            case "alphaSynth.loadSoundFontBytes":
                this._player.LoadSoundFont(data["data"]);
                break;
            case "alphaSynth.loadMidiBytes":
                this._player.LoadMidi(data["data"]);
                break;
            case "alphaSynth.setChannelMute":
                this._player.SetChannelMute(data["channel"], data["mute"]);
                break;
            case "alphaSynth.setChannelSolo":
                this._player.SetChannelSolo(data["channel"], data["solo"]);
                break;
            case "alphaSynth.setChannelVolume":
                this._player.SetChannelVolume(data["channel"], data["volume"]);
                break;
            case "alphaSynth.setChannelProgram":
                this._player.SetChannelProgram(data["channel"], data["program"]);
                break;
            case "alphaSynth.resetChannelStates":
                this._player.ResetChannelStates();
                break;
        }
    },
    OnPositionChanged: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.positionChanged",
            currentTime: e.CurrentTime,
            endTime: e.EndTime,
            currentTick: e.CurrentTick,
            endTick: e.EndTick
        });
    },
    OnPlayerStateChanged: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.playerStateChanged",
            state: e.State
        });
    },
    OnFinished: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.finished"
        });
    },
    OnSoundFontLoaded: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.soundFontLoaded"
        });
    },
    OnSoundFontLoadFailed: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.soundFontLoadFailed"
        });
    },
    OnMidiLoaded: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.midiLoaded"
        });
    },
    OnMidiLoadFailed: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.midiLoaded"
        });
    },
    OnReadyForPlayback: function (sender, e){
        this._main.postMessage({
            cmd: "alphaSynth.readyForPlayback"
        });
    },
    SendLog: function (level, s){
        this._main.postMessage({
            cmd: "alphaSynth.log",
            level: level,
            message: s
        });
    }
};
$StaticConstructor(function (){
    AlphaSynth.Main.AlphaSynthWebWorker.CmdPrefix = "alphaSynth.";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdInitialize = "alphaSynth.initialize";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetLogLevel = "alphaSynth.setLogLevel";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetMasterVolume = "alphaSynth.setMasterVolume";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetPlaybackSpeed = "alphaSynth.setPlaybackSpeed";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetTickPosition = "alphaSynth.setTickPosition";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetTimePosition = "alphaSynth.setTimePosition";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetPlaybackRange = "alphaSynth.setPlaybackRange";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdPlay = "alphaSynth.play";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdPause = "alphaSynth.pause";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdPlayPause = "alphaSynth.playPause";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdStop = "alphaSynth.stop";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdLoadSoundFontBytes = "alphaSynth.loadSoundFontBytes";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdLoadMidiBytes = "alphaSynth.loadMidiBytes";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetChannelMute = "alphaSynth.setChannelMute";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetChannelSolo = "alphaSynth.setChannelSolo";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetChannelVolume = "alphaSynth.setChannelVolume";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSetChannelProgram = "alphaSynth.setChannelProgram";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdResetChannelStates = "alphaSynth.resetChannelStates";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdReady = "alphaSynth.ready";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdReadyForPlayback = "alphaSynth.readyForPlayback";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdPositionChanged = "alphaSynth.positionChanged";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdPlayerStateChanged = "alphaSynth.playerStateChanged";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdFinished = "alphaSynth.finished";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSoundFontLoaded = "alphaSynth.soundFontLoaded";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdSoundFontLoadFailed = "alphaSynth.soundFontLoadFailed";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdMidiLoaded = "alphaSynth.midiLoaded";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdMidiLoadFailed = "alphaSynth.midiLoadFailed";
    AlphaSynth.Main.AlphaSynthWebWorker.CmdLog = "alphaSynth.log";
    if (!self.document){
        var main = self;
        main.addEventListener("message", function (e){
            var data = e.data;
            var cmd = data["cmd"];
            switch (cmd){
                case "alphaSynth.initialize":
                    AlphaSynth.Player.WebWorkerOutput.PreferredSampleRate = data["sampleRate"];
                    new AlphaSynth.Main.AlphaSynthWebWorker(main);
                    break;
            }
        }, false);
    }
});
AlphaSynth.Main.AlphaSynthWebWorkerApi = function (player, alphaSynthScriptFile){
    this._synth = null;
    this._output = null;
    this._events = null;
    this._workerIsReadyForPlayback = false;
    this._workerIsReady = false;
    this._outputIsReady = false;
    this._state = AlphaSynth.PlayerState.Paused;
    this._logLevel = AlphaSynth.Util.LogLevel.None;
    this._masterVolume = 0;
    this._playbackSpeed = 0;
    this._isSoundFontLoaded = false;
    this._isMidiLoaded = false;
    this._tickPosition = 0;
    this._timePosition = 0;
    this._playbackRange = null;
    this._output = player;
    this._output.add_Ready($CreateDelegate(this, this.OnOutputReady));
    this._output.add_SamplesPlayed($CreateDelegate(this, this.OnOutputSamplesPlayed));
    this._output.add_SampleRequest($CreateDelegate(this, this.OnOutputSampleRequest));
    this._output.add_Finished($CreateDelegate(this, this.OnOutputFinished));
    this._events = {};
    this._output.Open();
    this._synth = new Worker(alphaSynthScriptFile);
    this._synth.addEventListener("message", $CreateDelegate(this, this.HandleWorkerMessage), false);
    this._synth.postMessage({
        cmd: "alphaSynth.initialize",
        sampleRate: this._output.get_SampleRate()
    });
    this.set_MasterVolume(1);
    this.set_PlaybackSpeed(1);
};
AlphaSynth.Main.AlphaSynthWebWorkerApi.prototype = {
    get_IsReady: function (){
        return this._workerIsReady && this._outputIsReady;
    },
    get_IsReadyForPlayback: function (){
        return this._workerIsReadyForPlayback;
    },
    get_State: function (){
        return this._state;
    },
    get_LogLevel: function (){
        return AlphaSynth.Util.Logger.LogLevel;
    },
    set_LogLevel: function (value){
        AlphaSynth.Util.Logger.LogLevel = value;
        this._synth.postMessage({
            cmd: "alphaSynth.setLogLevel",
            value: value
        });
    },
    get_MasterVolume: function (){
        return this._masterVolume;
    },
    set_MasterVolume: function (value){
        value = AlphaSynth.Synthesis.SynthHelper.ClampF(value, 0, 10);
        this._masterVolume = value;
        this._synth.postMessage({
            cmd: "alphaSynth.setMasterVolume",
            value: value
        });
    },
    get_PlaybackSpeed: function (){
        return this._playbackSpeed;
    },
    set_PlaybackSpeed: function (value){
        value = AlphaSynth.Synthesis.SynthHelper.ClampD(value, 0.125, 8);
        this._playbackSpeed = value;
        this._synth.postMessage({
            cmd: "alphaSynth.setPlaybackSpeed",
            value: value
        });
    },
    get_TickPosition: function (){
        return this._tickPosition;
    },
    set_TickPosition: function (value){
        if (value < 0){
            value = 0;
        }
        this._tickPosition = value;
        this._synth.postMessage({
            cmd: "alphaSynth.setTickPosition",
            value: value
        });
    },
    get_TimePosition: function (){
        return this._timePosition;
    },
    set_TimePosition: function (value){
        if (value < 0){
            value = 0;
        }
        this._timePosition = value;
        this._synth.postMessage({
            cmd: "alphaSynth.setTimePosition",
            value: value
        });
    },
    get_PlaybackRange: function (){
        return this._playbackRange;
    },
    set_PlaybackRange: function (value){
        if (value != null){
            if (value.StartTick < 0){
                value.StartTick = 0;
            }
            if (value.EndTick < 0){
                value.EndTick = 0;
            }
        }
        this._playbackRange = value;
        this._synth.postMessage({
            cmd: "alphaSynth.setPlaybackRange",
            value: value
        });
    },
    Play: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.play"
        });
    },
    Pause: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.pause"
        });
    },
    PlayPause: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.playPause"
        });
    },
    Stop: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.stop"
        });
    },
    LoadSoundFont: function (data){
        if (typeof(data) == "string"){
            var url = data;
            AlphaSynth.Util.Logger.Info("Start loading Soundfont from url " + url);
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.onload = $CreateAnonymousDelegate(this, function (e){
                var buffer = new Uint8Array(request.response);
                this._synth.postMessage({
                    cmd: "alphaSynth.loadSoundFontBytes",
                    data: buffer
                });
            });
            request.onerror = $CreateAnonymousDelegate(this, function (e){
                AlphaSynth.Util.Logger.Error("Loading failed: " + e.message);
                this.TriggerEvent("soundFontLoadFailed", null);
            });
            request.onprogress = $CreateAnonymousDelegate(this, function (e){
                AlphaSynth.Util.Logger.Debug("Soundfont downloading: " + e.loaded + "/" + e.total + " bytes");
                this.TriggerEvent("soundFontLoad", [{
                    loaded: e.loaded,
                    total: e.total
                }
                ]);
            });
            request.send();
        }
        else {
            this._synth.postMessage({
                cmd: "alphaSynth.loadSoundFontBytes",
                data: data
            });
        }
    },
    LoadMidi: function (data){
        if (typeof(data) == "string"){
            var url = data;
            AlphaSynth.Util.Logger.Info("Start loading midi from url " + url);
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.onload = $CreateAnonymousDelegate(this, function (e){
                var buffer = new Uint8Array(request.response);
                this._synth.postMessage({
                    cmd: "alphaSynth.loadMidiBytes",
                    data: buffer
                });
            });
            request.onerror = $CreateAnonymousDelegate(this, function (e){
                AlphaSynth.Util.Logger.Error("Loading failed: " + e.message);
                this.TriggerEvent("midiLoadFailed", null);
            });
            request.onprogress = $CreateAnonymousDelegate(this, function (e){
                AlphaSynth.Util.Logger.Debug("Midi downloading: " + e.loaded + "/" + e.total + " bytes");
                this.TriggerEvent("midiLoad", [{
                    loaded: e.loaded,
                    total: e.total
                }
                ]);
            });
            request.send();
        }
        else {
            this._synth.postMessage({
                cmd: "alphaSynth.loadMidiBytes",
                data: data
            });
        }
    },
    SetChannelMute: function (channel, mute){
        this._synth.postMessage({
            cmd: "alphaSynth.setChannelMute",
            channel: channel,
            mute: mute
        });
    },
    ResetChannelStates: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.resetChannelStates"
        });
    },
    SetChannelSolo: function (channel, solo){
        this._synth.postMessage({
            cmd: "alphaSynth.setChannelSolo",
            channel: channel,
            solo: solo
        });
    },
    SetChannelVolume: function (channel, volume){
        volume = AlphaSynth.Synthesis.SynthHelper.ClampD(volume, 0, 10);
        this._synth.postMessage({
            cmd: "alphaSynth.setChannelVolume",
            channel: channel,
            volume: volume
        });
    },
    SetChannelProgram: function (channel, program){
        program = AlphaSynth.Synthesis.SynthHelper.ClampB(program, 0, 127);
        this._synth.postMessage({
            cmd: "alphaSynth.setChannelProgram",
            channel: channel,
            program: program
        });
    },
    HandleWorkerMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "alphaSynth.ready":
                this._workerIsReady = true;
                this.CheckReady();
                break;
            case "alphaSynth.readyForPlayback":
                this._workerIsReadyForPlayback = true;
                this.CheckReadyForPlayback();
                break;
            case "alphaSynth.positionChanged":
                this._timePosition = data["currentTime"];
                this._tickPosition = data["currentTick"];
                this.TriggerEvent("positionChanged", [data]);
                break;
            case "alphaSynth.playerStateChanged":
                this._state = data["state"];
                this.TriggerEvent("playerStateChanged", [data]);
                break;
            case "alphaSynth.finished":
                this.TriggerEvent("finished", null);
                break;
            case "alphaSynth.soundFontLoaded":
                this.TriggerEvent("soundFontLoaded", null);
                break;
            case "alphaSynth.soundFontLoadFailed":
                this.TriggerEvent("soundFontLoadFailed", null);
                break;
            case "alphaSynth.midiLoaded":
                this._isMidiLoaded = true;
                this.CheckReadyForPlayback();
                this.TriggerEvent("midiFileLoaded", null);
                break;
            case "alphaSynth.midiLoadFailed":
                this._isSoundFontLoaded = true;
                this.CheckReadyForPlayback();
                this.TriggerEvent("midiFileLoadFailed", null);
                break;
            case "alphaSynth.log":
                AlphaSynth.Util.Logger.Log(data["level"], data["message"]);
                break;
            case "alphaSynth.output.sequencerFinished":
                this._output.SequencerFinished();
                break;
            case "alphaSynth.output.addSamples":
                this._output.AddSamples(data["samples"]);
                break;
            case "alphaSynth.output.play":
                this._output.Play();
                break;
            case "alphaSynth.output.pause":
                this._output.Pause();
                break;
            case "alphaSynth.output.resetSamples":
                this._output.ResetSamples();
                break;
        }
    },
    CheckReady: function (){
        if (this.get_IsReady()){
            this.TriggerEvent("ready", null);
        }
    },
    CheckReadyForPlayback: function (){
        if (this.get_IsReadyForPlayback()){
            this.TriggerEvent("readyForPlayback", null);
        }
    },
    On: function (events, action){
        if (!this._events.hasOwnProperty(events)){
            this._events[events] = [];
        }
        this._events[events].push(action);
    },
    TriggerEvent: function (name, args){
        var events = this._events[name];
        if (events != null){
            for (var i = 0; i < events.length; i++){
                events[i].apply(null, args);
            }
        }
    },
    OnOutputSampleRequest: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.output.sampleRequest"
        });
    },
    OnOutputFinished: function (){
        this._synth.postMessage({
            cmd: "alphaSynth.output.finished"
        });
    },
    OnOutputSamplesPlayed: function (samples){
        this._synth.postMessage({
            cmd: "alphaSynth.output.samplesPlayed",
            samples: samples
        });
    },
    OnOutputReady: function (){
        this._outputIsReady = true;
        this.CheckReady();
    }
};
AlphaSynth.Main.AlphaSynthWebWorkerApi.QualifyUrl = function (url){
    var img = document.createElement("a");
    img.onerror = function (e){
    };
    img.href = url;
    url = img.href;
    return url;
};
AlphaSynth.Platform = AlphaSynth.Platform || {};
AlphaSynth.Platform.Platform = function (){
};
AlphaSynth.Platform.Platform.CreateOutput = function (){
    return new AlphaSynth.Player.WebWorkerOutput();
};
$StaticConstructor(function (){
    AlphaSynth.Platform.Platform.ScriptFile = null;
    AlphaSynth.Platform.Platform.PlatformInit();
});
AlphaSynth.Platform.Platform.PlatformInit = function (){
    // try to build the find the alphaTab script url in case we are not in the webworker already
    if (self.document){
        var scriptElement = document["currentScript"];
        if (!scriptElement){
            // try to get javascript from exception stack
            try{
                var error = new Error();
                var stack = error["stack"];
                if (!stack){
                    throw $CreateException(error, new Error());
                }
                AlphaSynth.Platform.Platform.ScriptFile = AlphaSynth.Platform.Platform.ScriptFileFromStack(stack);
            }
            catch(e){
                var stack = e["stack"];
                if (!stack){
                    scriptElement = document.querySelector("script[data-alphasynth]");
                }
                else {
                    AlphaSynth.Platform.Platform.ScriptFile = AlphaSynth.Platform.Platform.ScriptFileFromStack(stack);
                }
            }
        }
        // failed to automatically resolve
        if (((AlphaSynth.Platform.Platform.ScriptFile==null)||(AlphaSynth.Platform.Platform.ScriptFile.length==0))){
            if (!scriptElement){
                console.warn("Could not automatically find alphaSynth script file for worker, please add the data-alphasynth attribute to the script tag that includes alphaSynth or provide it when initializing alphaSynth");
            }
            else {
                AlphaSynth.Platform.Platform.ScriptFile = scriptElement.src;
            }
        }
    }
};
AlphaSynth.Platform.Platform.ScriptFileFromStack = function (stack){
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
AlphaSynth.Platform.Std = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Platform.Std.IsLittleEndian = true;
});
AlphaSynth.Platform.Std.ParseInt = function (s){
    var f = parseInt(s);
    if (isNaN(f)){
        f = 0;
    }
    return f;
};
AlphaSynth.Platform.Std.StringFromCharCode = function (c){
    return "";
};
AlphaSynth.Platform.Std.Random = function (){
    return Math.random();
};
AlphaSynth.Platform.Std.BlockCopy = function (src, srcOffset, dst, dstOffset, count){
};
AlphaSynth.Platform.Std.ArrayCopy = function (src, srcOffset, dst, dstOffset, count){
    for (var i = 0; i < count; i++){
        dst[dstOffset + i] = src[srcOffset + i];
    }
};
AlphaSynth.Platform.Std.Reverse = function (array){
    var i = 0;
    var j = array.length - 1;
    while (i < j){
        var t = array[i];
        array[i] = array[j];
        array[j] = t;
        i++;
        j--;
    }
};
AlphaSynth.Platform.TypeUtils = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Platform.TypeUtils.IsLittleEndian = true;
    AlphaSynth.Platform.TypeUtils.Int16 = new Int16Array(1);
});
AlphaSynth.Platform.TypeUtils.ToUInt32 = function (i){
    return i | 0;
};
AlphaSynth.Platform.TypeUtils.ToInt16 = function (i){
    AlphaSynth.Platform.TypeUtils.Int16[0] = i | 0;
    return AlphaSynth.Platform.TypeUtils.Int16[0];
};
AlphaSynth.Platform.TypeUtils.ToUInt16 = function (i){
    return i | 0;
};
AlphaSynth.Platform.TypeUtils.ToUInt8 = function (i){
    return i;
};
AlphaSynth.Platform.TypeUtils.ClearIntArray = function (array){
    for (var i = 0; i < array.length; i++){
        array[i] = 0;
    }
};
AlphaSynth.Platform.TypeUtils.ClearShortArray = function (array){
    for (var i = 0; i < array.length; i++){
        array[i] = 0;
    }
};
AlphaSynth.Player = AlphaSynth.Player || {};
AlphaSynth.Player.WebWorkerOutput = function (){
    this._worker = null;
    this.Ready = null;
    this.SamplesPlayed = null;
    this.SampleRequest = null;
    this.Finished = null;
};
AlphaSynth.Player.WebWorkerOutput.prototype = {
    get_SampleRate: function (){
        return AlphaSynth.Player.WebWorkerOutput.PreferredSampleRate;
    },
    Open: function (){
        AlphaSynth.Util.Logger.Debug("Initializing webworker worker");
        this._worker =  self;
        this._worker.addEventListener("message", $CreateDelegate(this, this.HandleMessage), false);
        this.Ready();
    },
    HandleMessage: function (e){
        var data = e.data;
        var cmd = data["cmd"];
        switch (cmd){
            case "alphaSynth.output.sampleRequest":
                this.SampleRequest();
                break;
            case "alphaSynth.output.finished":
                this.Finished();
                break;
            case "alphaSynth.output.samplesPlayed":
                this.SamplesPlayed(data["samples"]);
                break;
        }
    },
    add_Ready: function (value){
        this.Ready = $CombineDelegates(this.Ready, value);
    },
    remove_Ready: function (value){
        this.Ready = $RemoveDelegate(this.Ready, value);
    },
    add_SamplesPlayed: function (value){
        this.SamplesPlayed = $CombineDelegates(this.SamplesPlayed, value);
    },
    remove_SamplesPlayed: function (value){
        this.SamplesPlayed = $RemoveDelegate(this.SamplesPlayed, value);
    },
    add_SampleRequest: function (value){
        this.SampleRequest = $CombineDelegates(this.SampleRequest, value);
    },
    remove_SampleRequest: function (value){
        this.SampleRequest = $RemoveDelegate(this.SampleRequest, value);
    },
    add_Finished: function (value){
        this.Finished = $CombineDelegates(this.Finished, value);
    },
    remove_Finished: function (value){
        this.Finished = $RemoveDelegate(this.Finished, value);
    },
    SequencerFinished: function (){
        this._worker.postMessage({
            cmd: "alphaSynth.output.sequencerFinished"
        });
    },
    AddSamples: function (samples){
        this._worker.postMessage({
            cmd: "alphaSynth.output.addSamples",
            samples: samples
        });
    },
    Play: function (){
        this._worker.postMessage({
            cmd: "alphaSynth.output.play"
        });
    },
    Pause: function (){
        this._worker.postMessage({
            cmd: "alphaSynth.output.pause"
        });
    },
    ResetSamples: function (){
        this._worker.postMessage({
            cmd: "alphaSynth.output.resetSamples"
        });
    }
};
$StaticConstructor(function (){
    AlphaSynth.Player.WebWorkerOutput.CmdOutputPrefix = "alphaSynth.output.";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputSequencerFinished = "alphaSynth.output.sequencerFinished";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputAddSamples = "alphaSynth.output.addSamples";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputPlay = "alphaSynth.output.play";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputPause = "alphaSynth.output.pause";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputResetSamples = "alphaSynth.output.resetSamples";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputSampleRequest = "alphaSynth.output.sampleRequest";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputFinished = "alphaSynth.output.finished";
    AlphaSynth.Player.WebWorkerOutput.CmdOutputSamplesPlayed = "alphaSynth.output.samplesPlayed";
    AlphaSynth.Player.WebWorkerOutput.PreferredSampleRate = 0;
});
AlphaSynth.Util = AlphaSynth.Util || {};
AlphaSynth.Util.Extensions = function (){
};
AlphaSynth.Util.Logger = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Util.Logger.LogLevel = AlphaSynth.Util.LogLevel.None;
    AlphaSynth.Util.Logger.LogHandler = null;
    AlphaSynth.Util.Logger.LogLevel = AlphaSynth.Util.LogLevel.Info;
    AlphaSynth.Util.Logger.LogHandler = function (level, message){
        switch (level){
            case AlphaSynth.Util.LogLevel.None:
                console.log(message);
                break;
            case AlphaSynth.Util.LogLevel.Debug:
                console.debug(message);
                break;
            case AlphaSynth.Util.LogLevel.Info:
                console.info(message);
                break;
            case AlphaSynth.Util.LogLevel.Warning:
                console.warn(message);
                break;
            case AlphaSynth.Util.LogLevel.Error:
                console.error(message);
                break;
        }
    };
});
AlphaSynth.Util.Logger.Debug = function (msg){
    AlphaSynth.Util.Logger.Log(AlphaSynth.Util.LogLevel.Debug, msg);
};
AlphaSynth.Util.Logger.Warning = function (msg){
    AlphaSynth.Util.Logger.Log(AlphaSynth.Util.LogLevel.Warning, msg);
};
AlphaSynth.Util.Logger.Info = function (msg){
    AlphaSynth.Util.Logger.Log(AlphaSynth.Util.LogLevel.Info, msg);
};
AlphaSynth.Util.Logger.Error = function (msg){
    AlphaSynth.Util.Logger.Log(AlphaSynth.Util.LogLevel.Error, msg);
};
AlphaSynth.Util.Logger.Log = function (logLevel, msg){
    if (logLevel < AlphaSynth.Util.Logger.LogLevel)
        return;
    var caller = (arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.caller ? arguments.callee.caller.caller.name : '');
    if (AlphaSynth.Util.Logger.LogHandler != null){
        AlphaSynth.Util.Logger.LogHandler(logLevel, caller + "-" + msg);
    }
};
AlphaSynth.Util.Logger.GetCaller = function (){
    return "";
};
AlphaSynth.Util.LogLevel = {
    None: 0,
    Debug: 1,
    Info: 2,
    Warning: 3,
    Error: 4
};
AlphaSynth.AlphaSynth = function (){
    this._sequencer = null;
    this._synthesizer = null;
    this._outputIsReady = false;
    this._state = AlphaSynth.PlayerState.Paused;
    this._logLevel = AlphaSynth.Util.LogLevel.None;
    this._isSoundFontLoaded = false;
    this._isMidiLoaded = false;
    this._tickPosition = 0;
    this._timePosition = 0;
    this.Finished = null;
    this.PlayerStateChanged = null;
    this.SoundFontLoaded = null;
    this.ReadyForPlayback = null;
    this.SoundFontLoadFailed = null;
    this.MidiLoaded = null;
    this.MidiLoadFailed = null;
    this.PositionChanged = null;
    this.Output = null;
    AlphaSynth.Util.Logger.Debug("Initializing player");
    this._state = AlphaSynth.PlayerState.Paused;
    AlphaSynth.Util.Logger.Debug("Creating output");
    this.Output = AlphaSynth.Platform.Platform.CreateOutput();
    this.Output.add_Ready($CreateAnonymousDelegate(this, function (){
        this._outputIsReady = true;
        this.CheckReadyForPlayback();
    }));
    this.Output.add_Finished($CreateAnonymousDelegate(this, function (){
        // stop everything
        this.Stop();
        AlphaSynth.Util.Logger.Debug("Finished playback");
        this.OnFinished();
    }));
    this.Output.add_SampleRequest($CreateAnonymousDelegate(this, function (){
        // synthesize buffer
        this._sequencer.FillMidiEventQueue();
        this._synthesizer.Synthesize();
        // send it to output
        this.Output.AddSamples(this._synthesizer.SampleBuffer);
        // tell sequencer to check whether its work is done
        this._sequencer.CheckForStop();
    }));
    this.Output.add_SamplesPlayed($CreateDelegate(this, this.OnSamplesPlayed));
    AlphaSynth.Util.Logger.Debug("Creating synthesizer");
    this._synthesizer = new AlphaSynth.Synthesis.Synthesizer(this.Output.get_SampleRate(), 2, 441, 3, 100);
    this._sequencer = new AlphaSynth.MidiFileSequencer(this._synthesizer);
    this._sequencer.add_Finished($CreateDelegate(this.Output, this.Output.SequencerFinished));
    AlphaSynth.Util.Logger.Debug("Opening output");
    this.Output.Open();
};
AlphaSynth.AlphaSynth.prototype = {
    get_IsReady: function (){
        return this._outputIsReady;
    },
    get_IsReadyForPlayback: function (){
        return this.get_IsReady() && this._isSoundFontLoaded && this._isMidiLoaded;
    },
    get_State: function (){
        return this._state;
    },
    get_LogLevel: function (){
        return AlphaSynth.Util.Logger.LogLevel;
    },
    set_LogLevel: function (value){
        AlphaSynth.Util.Logger.LogLevel = value;
    },
    get_MasterVolume: function (){
        return this._synthesizer.get_MasterVolume();
    },
    set_MasterVolume: function (value){
        value = AlphaSynth.Synthesis.SynthHelper.ClampF(value, 0, 10);
        this._synthesizer.set_MasterVolume(value);
    },
    get_PlaybackSpeed: function (){
        return this._sequencer.PlaybackSpeed;
    },
    set_PlaybackSpeed: function (value){
        value = AlphaSynth.Synthesis.SynthHelper.ClampD(value, 0.125, 8);
        var oldSpeed = this._sequencer.PlaybackSpeed;
        this._sequencer.PlaybackSpeed = value;
        this.UpdateTimePosition(this._timePosition * (oldSpeed / value));
    },
    get_TickPosition: function (){
        return this._tickPosition;
    },
    set_TickPosition: function (value){
        this.set_TimePosition(this._sequencer.TickPositionToTimePosition(value));
    },
    get_TimePosition: function (){
        return this._timePosition;
    },
    set_TimePosition: function (value){
        AlphaSynth.Util.Logger.Debug("Seeking to position " + value + "ms");
        // tell the sequencer to jump to the given position
        this._sequencer.Seek(value * this._sequencer.PlaybackSpeed);
        // update the internal position 
        this.UpdateTimePosition(value);
        // tell the output to reset the already synthesized buffers and request data again 
        this.Output.ResetSamples();
    },
    get_PlaybackRange: function (){
        return this._sequencer.get_PlaybackRange();
    },
    set_PlaybackRange: function (value){
        this._sequencer.set_PlaybackRange(value);
        if (value != null){
            this.set_TickPosition(value.StartTick);
        }
    },
    Play: function (){
        if (this.get_State() == AlphaSynth.PlayerState.Playing || !this.get_IsReadyForPlayback())
            return;
        AlphaSynth.Util.Logger.Debug("Starting playback");
        this._state = AlphaSynth.PlayerState.Playing;
        this.OnPlayerStateChanged(new AlphaSynth.PlayerStateChangedEventArgs(this._state));
        this.Output.Play();
    },
    Pause: function (){
        if (this.get_State() == AlphaSynth.PlayerState.Paused || !this.get_IsReadyForPlayback())
            return;
        AlphaSynth.Util.Logger.Debug("Pausing playback");
        this._state = AlphaSynth.PlayerState.Paused;
        this.OnPlayerStateChanged(new AlphaSynth.PlayerStateChangedEventArgs(this._state));
        this.Output.Pause();
        this._synthesizer.NoteOffAll(false);
    },
    PlayPause: function (){
        if (this.get_State() == AlphaSynth.PlayerState.Playing || !this.get_IsReadyForPlayback()){
            this.Pause();
        }
        else {
            this.Play();
        }
    },
    Stop: function (){
        if (!this.get_IsReadyForPlayback())
            return;
        AlphaSynth.Util.Logger.Debug("Stopping playback");
        this.Pause();
        this.set_TickPosition(this._sequencer.get_PlaybackRange() != null ? this._sequencer.get_PlaybackRange().StartTick : 0);
    },
    LoadSoundFont: function (data){
        this.Pause();
        var input = AlphaSynth.IO.ByteBuffer.FromBuffer(data);
        try{
            AlphaSynth.Util.Logger.Info("Loading soundfont from bytes");
            var bank = new AlphaSynth.Bank.PatchBank();
            bank.LoadSf2(input);
            this._synthesizer.LoadBank(bank);
            this._isSoundFontLoaded = true;
            this.OnSoundFontLoaded();
            AlphaSynth.Util.Logger.Info("soundFont successfully loaded");
            this.CheckReadyForPlayback();
        }
        catch(e){
            AlphaSynth.Util.Logger.Error("Could not load soundfont from bytes " + e);
            this.OnSoundFontLoadFailed();
        }
    },
    CheckReadyForPlayback: function (){
        if (this.get_IsReadyForPlayback()){
            this.OnReadyForPlayback();
        }
    },
    LoadMidi: function (data){
        this.Stop();
        var input = AlphaSynth.IO.ByteBuffer.FromBuffer(data);
        try{
            AlphaSynth.Util.Logger.Info("Loading midi from bytes");
            var midi = new AlphaSynth.Midi.MidiFile();
            midi.Load(input);
            this._sequencer.LoadMidi(midi);
            this._isMidiLoaded = true;
            this.OnMidiLoaded();
            AlphaSynth.Util.Logger.Info("Midi successfully loaded");
            this.CheckReadyForPlayback();
            this.set_TickPosition(0);
        }
        catch(e){
            AlphaSynth.Util.Logger.Error("Could not load midi from bytes " + e);
            this.OnMidiLoadFailed();
        }
    },
    SetChannelMute: function (channel, mute){
        this._synthesizer.SetChannelMute(channel, mute);
    },
    ResetChannelStates: function (){
        this._synthesizer.ResetChannelStates();
    },
    SetChannelSolo: function (channel, solo){
        this._synthesizer.SetChannelSolo(channel, solo);
    },
    SetChannelVolume: function (channel, volume){
        volume = AlphaSynth.Synthesis.SynthHelper.ClampD(volume, 0, 10);
        this._synthesizer.SetChannelVolume(channel, volume);
    },
    SetChannelProgram: function (channel, program){
        program = AlphaSynth.Synthesis.SynthHelper.ClampB(program, 0, 127);
        this._sequencer.SetChannelProgram(channel, program);
        this._synthesizer.SetChannelProgram(channel, program);
    },
    OnSamplesPlayed: function (sampleCount){
        var playedMillis = (sampleCount / this._synthesizer.SampleRate) * 1000;
        this.UpdateTimePosition(this._timePosition + playedMillis);
    },
    UpdateTimePosition: function (timePosition){
        // update the real positions
        var currentTime = this._timePosition = timePosition;
        var currentTick = this._tickPosition = this._sequencer.TimePositionToTickPosition(currentTime);
        var endTime = this._sequencer.get_EndTime();
        var endTick = this._sequencer.EndTick;
        AlphaSynth.Util.Logger.Debug("Position changed: (time: " + currentTime + "/" + endTime + ", tick: " + currentTick + "/" + endTime + ")");
        this.OnPositionChanged(new AlphaSynth.PositionChangedEventArgs(currentTime, endTime, currentTick, endTick));
    },
    add_Finished: function (value){
        this.Finished = $CombineDelegates(this.Finished, value);
    },
    remove_Finished: function (value){
        this.Finished = $RemoveDelegate(this.Finished, value);
    },
    OnFinished: function (){
        var handler = this.Finished;
        if (handler != null)
            handler(this, AlphaSynth.EmptyEventArgs.Instance);
    },
    add_PlayerStateChanged: function (value){
        this.PlayerStateChanged = $CombineDelegates(this.PlayerStateChanged, value);
    },
    remove_PlayerStateChanged: function (value){
        this.PlayerStateChanged = $RemoveDelegate(this.PlayerStateChanged, value);
    },
    OnPlayerStateChanged: function (e){
        var handler = this.PlayerStateChanged;
        if (handler != null)
            handler(this, e);
    },
    add_SoundFontLoaded: function (value){
        this.SoundFontLoaded = $CombineDelegates(this.SoundFontLoaded, value);
    },
    remove_SoundFontLoaded: function (value){
        this.SoundFontLoaded = $RemoveDelegate(this.SoundFontLoaded, value);
    },
    OnSoundFontLoaded: function (){
        var handler = this.SoundFontLoaded;
        if (handler != null)
            handler(this, AlphaSynth.EmptyEventArgs.Instance);
    },
    add_ReadyForPlayback: function (value){
        this.ReadyForPlayback = $CombineDelegates(this.ReadyForPlayback, value);
    },
    remove_ReadyForPlayback: function (value){
        this.ReadyForPlayback = $RemoveDelegate(this.ReadyForPlayback, value);
    },
    OnReadyForPlayback: function (){
        var handler = this.ReadyForPlayback;
        if (handler != null)
            handler(this, AlphaSynth.EmptyEventArgs.Instance);
    },
    add_SoundFontLoadFailed: function (value){
        this.SoundFontLoadFailed = $CombineDelegates(this.SoundFontLoadFailed, value);
    },
    remove_SoundFontLoadFailed: function (value){
        this.SoundFontLoadFailed = $RemoveDelegate(this.SoundFontLoadFailed, value);
    },
    OnSoundFontLoadFailed: function (){
        var handler = this.SoundFontLoadFailed;
        if (handler != null)
            handler(this, AlphaSynth.EmptyEventArgs.Instance);
    },
    add_MidiLoaded: function (value){
        this.MidiLoaded = $CombineDelegates(this.MidiLoaded, value);
    },
    remove_MidiLoaded: function (value){
        this.MidiLoaded = $RemoveDelegate(this.MidiLoaded, value);
    },
    OnMidiLoaded: function (){
        var handler = this.MidiLoaded;
        if (handler != null)
            handler(this, AlphaSynth.EmptyEventArgs.Instance);
    },
    add_MidiLoadFailed: function (value){
        this.MidiLoadFailed = $CombineDelegates(this.MidiLoadFailed, value);
    },
    remove_MidiLoadFailed: function (value){
        this.MidiLoadFailed = $RemoveDelegate(this.MidiLoadFailed, value);
    },
    OnMidiLoadFailed: function (){
        var handler = this.MidiLoadFailed;
        if (handler != null)
            handler(this, AlphaSynth.EmptyEventArgs.Instance);
    },
    add_PositionChanged: function (value){
        this.PositionChanged = $CombineDelegates(this.PositionChanged, value);
    },
    remove_PositionChanged: function (value){
        this.PositionChanged = $RemoveDelegate(this.PositionChanged, value);
    },
    OnPositionChanged: function (e){
        var handler = this.PositionChanged;
        if (handler != null)
            handler(this, e);
    }
};
AlphaSynth.EmptyEventArgs = function (){
};
$StaticConstructor(function (){
    AlphaSynth.EmptyEventArgs.Instance = new AlphaSynth.EmptyEventArgs();
});
AlphaSynth.ProgressEventArgs = function (loaded, total){
    this.Loaded = 0;
    this.Total = 0;
    this.Loaded = loaded;
    this.Total = total;
};
AlphaSynth.PlayerStateChangedEventArgs = function (state){
    this.State = AlphaSynth.PlayerState.Paused;
    this.State = state;
};
AlphaSynth.PositionChangedEventArgs = function (currentTime, endTime, currentTick, endTick){
    this.CurrentTime = 0;
    this.EndTime = 0;
    this.CurrentTick = 0;
    this.EndTick = 0;
    this.CurrentTime = currentTime;
    this.EndTime = endTime;
    this.CurrentTick = currentTick;
    this.EndTick = endTick;
};
AlphaSynth.Bank = AlphaSynth.Bank || {};
AlphaSynth.Bank.AssetManager = function (){
    this.PatchAssets = null;
    this.SampleAssets = null;
    this.PatchAssets = [];
    this.SampleAssets = [];
};
AlphaSynth.Bank.AssetManager.prototype = {
    FindPatch: function (name){
        for (var i = 0; i < this.PatchAssets.length; i++){
            var patchAsset = this.PatchAssets[i];
            if (patchAsset.Name == name){
                return patchAsset;
            }
        }
        return null;
    },
    FindSample: function (name){
        for (var i = 0; i < this.SampleAssets.length; i++){
            var sampleDataAsset = this.SampleAssets[i];
            if (sampleDataAsset.Name == name){
                return sampleDataAsset;
            }
        }
        return null;
    }
};
AlphaSynth.Bank.Components = AlphaSynth.Bank.Components || {};
AlphaSynth.Bank.Components.Generators = AlphaSynth.Bank.Components.Generators || {};
AlphaSynth.Bank.Components.Generators.Generator = function (description){
    this.LoopMode = AlphaSynth.Bank.Components.Generators.LoopMode.NoLoop;
    this.LoopStartPhase = 0;
    this.LoopEndPhase = 0;
    this.StartPhase = 0;
    this.EndPhase = 0;
    this.Offset = 0;
    this.Period = 0;
    this.Frequency = 0;
    this.RootKey = 0;
    this.KeyTrack = 0;
    this.VelocityTrack = 0;
    this.Tune = 0;
    this.LoopMode = description.LoopMethod;
    this.LoopStartPhase = description.LoopStartPhase;
    this.LoopEndPhase = description.LoopEndPhase;
    this.StartPhase = description.StartPhase;
    this.EndPhase = description.EndPhase;
    this.Offset = description.Offset;
    this.Period = description.Period;
    this.Frequency = 0;
    this.RootKey = description.RootKey;
    this.KeyTrack = description.KeyTrack;
    this.VelocityTrack = description.VelTrack;
    this.Tune = description.Tune;
};
AlphaSynth.Bank.Components.Generators.Generator.prototype = {
    Release: function (generatorParams){
        if (this.LoopMode == AlphaSynth.Bank.Components.Generators.LoopMode.LoopUntilNoteOff){
            generatorParams.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.PostLoop;
            generatorParams.CurrentStart = this.StartPhase;
            generatorParams.CurrentEnd = this.EndPhase;
        }
    },
    GetValues: function (generatorParams, blockBuffer, increment){
        var proccessed = 0;
        do{
            var samplesAvailable = ((Math.ceil((generatorParams.CurrentEnd - generatorParams.Phase) / increment))) | 0;
            if (samplesAvailable > blockBuffer.length - proccessed){
                while (proccessed < blockBuffer.length){
                    blockBuffer[proccessed++] = this.GetValue(generatorParams.Phase);
                    generatorParams.Phase += increment;
                }
            }
            else {
                var endProccessed = proccessed + samplesAvailable;
                while (proccessed < endProccessed){
                    blockBuffer[proccessed++] = this.GetValue(generatorParams.Phase);
                    generatorParams.Phase += increment;
                }
                switch (generatorParams.CurrentState){
                    case AlphaSynth.Bank.Components.Generators.GeneratorState.PreLoop:
                        generatorParams.CurrentStart = this.LoopStartPhase;
                        generatorParams.CurrentEnd = this.LoopEndPhase;
                        generatorParams.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Loop;
                        break;
                    case AlphaSynth.Bank.Components.Generators.GeneratorState.Loop:
                        generatorParams.Phase += generatorParams.CurrentStart - generatorParams.CurrentEnd;
                        break;
                    case AlphaSynth.Bank.Components.Generators.GeneratorState.PostLoop:
                        generatorParams.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Finished;
                        while (proccessed < blockBuffer.length)
                        blockBuffer[proccessed++] = 0;
                        break;
                }
            }
        }
        while (proccessed < blockBuffer.length)
    }
};
AlphaSynth.Bank.Components.Generators.WhiteNoiseGenerator = function (description){
    AlphaSynth.Bank.Components.Generators.Generator.call(this, description);
    if (this.EndPhase < 0)
        this.EndPhase = 1;
    if (this.StartPhase < 0)
        this.StartPhase = 0;
    if (this.LoopEndPhase < 0)
        this.LoopEndPhase = this.EndPhase;
    if (this.LoopStartPhase < 0)
        this.LoopStartPhase = this.StartPhase;
    if (this.Period < 0)
        this.Period = 1;
    if (this.RootKey < 0)
        this.RootKey = 69;
    this.Frequency = 440;
};
AlphaSynth.Bank.Components.Generators.WhiteNoiseGenerator.prototype = {
    GetValue: function (phase){
        return ((AlphaSynth.Platform.Std.Random() * 2) - 1);
    }
};
$Inherit(AlphaSynth.Bank.Components.Generators.WhiteNoiseGenerator, AlphaSynth.Bank.Components.Generators.Generator);
AlphaSynth.Bank.Components.Generators.TriangleGenerator = function (description){
    AlphaSynth.Bank.Components.Generators.Generator.call(this, description);
    if (this.EndPhase < 0)
        this.EndPhase = 1.25;
    if (this.StartPhase < 0)
        this.StartPhase = 0.25;
    if (this.LoopEndPhase < 0)
        this.LoopEndPhase = this.EndPhase;
    if (this.LoopStartPhase < 0)
        this.LoopStartPhase = this.StartPhase;
    if (this.Period < 0)
        this.Period = 1;
    if (this.RootKey < 0)
        this.RootKey = 69;
    this.Frequency = 440;
};
AlphaSynth.Bank.Components.Generators.TriangleGenerator.prototype = {
    GetValue: function (phase){
        return (Math.abs(phase - Math.Floor(phase + 0.5)) * 4 - 1);
    }
};
$Inherit(AlphaSynth.Bank.Components.Generators.TriangleGenerator, AlphaSynth.Bank.Components.Generators.Generator);
AlphaSynth.Bank.Components.Generators.SquareGenerator = function (description){
    AlphaSynth.Bank.Components.Generators.Generator.call(this, description);
    if (this.EndPhase < 0)
        this.EndPhase = 6.28318530717958;
    if (this.StartPhase < 0)
        this.StartPhase = 0;
    if (this.LoopEndPhase < 0)
        this.LoopEndPhase = this.EndPhase;
    if (this.LoopStartPhase < 0)
        this.LoopStartPhase = this.StartPhase;
    if (this.Period < 0)
        this.Period = 6.28318530717958;
    if (this.RootKey < 0)
        this.RootKey = 69;
    this.Frequency = 440;
};
AlphaSynth.Bank.Components.Generators.SquareGenerator.prototype = {
    GetValue: function (phase){
        return Math.Sign(Math.sin(phase));
    }
};
$Inherit(AlphaSynth.Bank.Components.Generators.SquareGenerator, AlphaSynth.Bank.Components.Generators.Generator);
AlphaSynth.Bank.Components.Generators.SineGenerator = function (description){
    AlphaSynth.Bank.Components.Generators.Generator.call(this, description);
    if (this.EndPhase < 0)
        this.EndPhase = 6.28318530717958;
    if (this.StartPhase < 0)
        this.StartPhase = 0;
    if (this.LoopEndPhase < 0)
        this.LoopEndPhase = this.EndPhase;
    if (this.LoopStartPhase < 0)
        this.LoopStartPhase = this.StartPhase;
    if (this.Period < 0)
        this.Period = 6.28318530717958;
    if (this.RootKey < 0)
        this.RootKey = 69;
    this.Frequency = 440;
};
AlphaSynth.Bank.Components.Generators.SineGenerator.prototype = {
    GetValue: function (phase){
        return Math.sin(phase);
    }
};
$Inherit(AlphaSynth.Bank.Components.Generators.SineGenerator, AlphaSynth.Bank.Components.Generators.Generator);
AlphaSynth.Bank.Components.Generators.SawGenerator = function (description){
    AlphaSynth.Bank.Components.Generators.Generator.call(this, description);
    if (this.EndPhase < 0)
        this.EndPhase = 1;
    if (this.StartPhase < 0)
        this.StartPhase = 0;
    if (this.LoopEndPhase < 0)
        this.LoopEndPhase = this.EndPhase;
    if (this.LoopStartPhase < 0)
        this.LoopStartPhase = this.StartPhase;
    if (this.Period < 0)
        this.Period = 1;
    if (this.RootKey < 0)
        this.RootKey = 69;
    this.Frequency = 440;
};
AlphaSynth.Bank.Components.Generators.SawGenerator.prototype = {
    GetValue: function (phase){
        return (2 * (phase - Math.Floor(phase + 0.5)));
    }
};
$Inherit(AlphaSynth.Bank.Components.Generators.SawGenerator, AlphaSynth.Bank.Components.Generators.Generator);
AlphaSynth.Bank.Components.Generators.Interpolation = {
    None: 0,
    Linear: 1,
    Cosine: 2,
    CubicSpline: 3,
    Sinc: 4
};
AlphaSynth.Bank.Components.Generators.SampleGenerator = function (){
    this.Samples = null;
    AlphaSynth.Bank.Components.Generators.Generator.call(this, new AlphaSynth.Bank.Descriptors.GeneratorDescriptor());
};
AlphaSynth.Bank.Components.Generators.SampleGenerator.prototype = {
    GetValue: function (phase){
        return this.Samples.get_Item(((phase)) | 0);
    },
    GetValues: function (generatorParams, blockBuffer, increment){
        var proccessed = 0;
        do{
            var samplesAvailable = (Math.ceil((generatorParams.CurrentEnd - generatorParams.Phase) / increment)) | 0;
            if (samplesAvailable > blockBuffer.length - proccessed){
                this.Interpolate(generatorParams, blockBuffer, increment, proccessed, blockBuffer.length);
                return;
                //proccessed = blockBuffer.Length;
            }
            else {
                var endProccessed = proccessed + samplesAvailable;
                this.Interpolate(generatorParams, blockBuffer, increment, proccessed, endProccessed);
                proccessed = endProccessed;
                switch (generatorParams.CurrentState){
                    case AlphaSynth.Bank.Components.Generators.GeneratorState.PreLoop:
                        generatorParams.CurrentStart = this.LoopStartPhase;
                        generatorParams.CurrentEnd = this.LoopEndPhase;
                        generatorParams.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Loop;
                        break;
                    case AlphaSynth.Bank.Components.Generators.GeneratorState.Loop:
                        generatorParams.Phase += generatorParams.CurrentStart - generatorParams.CurrentEnd;
                        break;
                    case AlphaSynth.Bank.Components.Generators.GeneratorState.PostLoop:
                        generatorParams.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Finished;
                        while (proccessed < blockBuffer.length)
                        blockBuffer[proccessed++] = 0;
                        break;
                }
            }
        }
        while (proccessed < blockBuffer.length)
    },
    Interpolate: function (generatorParams, blockBuffer, increment, start, end){
        switch (1){
            case AlphaSynth.Bank.Components.Generators.Interpolation.Linear:
                {
                var _end = generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop ? this.LoopEndPhase - 1 : this.EndPhase - 1;
                var index;
                var s1,s2,mu;
                while (start < end && generatorParams.Phase < _end){
                    index = generatorParams.Phase | 0;
                    s1 = this.Samples.get_Item(index);
                    s2 = this.Samples.get_Item(index + 1);
                    mu = (generatorParams.Phase - index);
                    blockBuffer[start++] = s1 + mu * (s2 - s1);
                    generatorParams.Phase += increment;
                }
                while (start < end){
                    index = generatorParams.Phase | 0;
                    s1 = this.Samples.get_Item(index);
                    if (generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop)
                        s2 = this.Samples.get_Item(generatorParams.CurrentStart | 0);
                    else
                        s2 = s1;
                    mu = (generatorParams.Phase - index);
                    blockBuffer[start++] = s1 + mu * (s2 - s1);
                    generatorParams.Phase += increment;
                }
                }
                break;
            case AlphaSynth.Bank.Components.Generators.Interpolation.Cosine:
                {
                var _end = generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop ? this.LoopEndPhase - 1 : this.EndPhase - 1;
                var index;
                var s1,s2,mu;
                while (start < end && generatorParams.Phase < _end){
                    index = generatorParams.Phase | 0;
                    s1 = this.Samples.get_Item(index);
                    s2 = this.Samples.get_Item(index + 1);
                    mu = (1 - Math.cos((generatorParams.Phase - index) * 3.14159265358979)) * 0.5;
                    blockBuffer[start++] = s1 * (1 - mu) + s2 * mu;
                    generatorParams.Phase += increment;
                }
                while (start < end){
                    index = generatorParams.Phase | 0;
                    s1 = this.Samples.get_Item(index);
                    if (generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop)
                        s2 = this.Samples.get_Item(generatorParams.CurrentStart | 0);
                    else
                        s2 = s1;
                    mu = (1 - Math.cos((generatorParams.Phase - index) * 3.14159265358979)) * 0.5;
                    blockBuffer[start++] = s1 * (1 - mu) + s2 * mu;
                    generatorParams.Phase += increment;
                }
                }
                break;
            case AlphaSynth.Bank.Components.Generators.Interpolation.CubicSpline:
                {
                var _end = generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop ? this.LoopStartPhase + 1 : this.StartPhase + 1;
                var index;
                var s0,s1,s2,s3,mu;
                while (start < end && generatorParams.Phase < _end){
                    index = generatorParams.Phase | 0;
                    if (generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop)
                        s0 = this.Samples.get_Item(generatorParams.CurrentEnd | 0 - 1);
                    else
                        s0 = this.Samples.get_Item(index);
                    s1 = this.Samples.get_Item(index);
                    s2 = this.Samples.get_Item(index + 1);
                    s3 = this.Samples.get_Item(index + 2);
                    mu = (generatorParams.Phase - index);
                    blockBuffer[start++] = ((-0.5 * s0 + 1.5 * s1 - 1.5 * s2 + 0.5 * s3) * mu * mu * mu + (s0 - 2.5 * s1 + 2 * s2 - 0.5 * s3) * mu * mu + (-0.5 * s0 + 0.5 * s2) * mu + (s1));
                    generatorParams.Phase += increment;
                }
                _end = generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop ? this.LoopEndPhase - 2 : this.EndPhase - 2;
                while (start < end && generatorParams.Phase < _end){
                    index = generatorParams.Phase | 0;
                    s0 = this.Samples.get_Item(index - 1);
                    s1 = this.Samples.get_Item(index);
                    s2 = this.Samples.get_Item(index + 1);
                    s3 = this.Samples.get_Item(index + 2);
                    mu = (generatorParams.Phase - index);
                    blockBuffer[start++] = ((-0.5 * s0 + 1.5 * s1 - 1.5 * s2 + 0.5 * s3) * mu * mu * mu + (s0 - 2.5 * s1 + 2 * s2 - 0.5 * s3) * mu * mu + (-0.5 * s0 + 0.5 * s2) * mu + (s1));
                    generatorParams.Phase += increment;
                }
                _end += 1;
                while (start < end){
                    index = generatorParams.Phase | 0;
                    s0 = this.Samples.get_Item(index - 1);
                    s1 = this.Samples.get_Item(index);
                    if (generatorParams.Phase < _end){
                        s2 = this.Samples.get_Item(index + 1);
                        if (generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop)
                            s3 = this.Samples.get_Item(generatorParams.CurrentStart | 0);
                        else
                            s3 = s2;
                    }
                    else {
                        if (generatorParams.CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Loop){
                            s2 = this.Samples.get_Item(generatorParams.CurrentStart | 0);
                            s3 = this.Samples.get_Item(generatorParams.CurrentStart | 0 + 1);
                        }
                        else {
                            s2 = s1;
                            s3 = s1;
                        }
                    }
                    mu = (generatorParams.Phase - index);
                    blockBuffer[start++] = ((-0.5 * s0 + 1.5 * s1 - 1.5 * s2 + 0.5 * s3) * mu * mu * mu + (s0 - 2.5 * s1 + 2 * s2 - 0.5 * s3) * mu * mu + (-0.5 * s0 + 0.5 * s2) * mu + (s1));
                    generatorParams.Phase += increment;
                }
                }
                break;
            default:
                {
                while (start < end){
                    blockBuffer[start++] = this.Samples.get_Item(generatorParams.Phase | 0);
                    generatorParams.Phase += increment;
                }
                }
                break;
        }
    }
};
$Inherit(AlphaSynth.Bank.Components.Generators.SampleGenerator, AlphaSynth.Bank.Components.Generators.Generator);
AlphaSynth.Bank.Components.Generators.GeneratorParameters = function (){
    this.Phase = 0;
    this.CurrentStart = 0;
    this.CurrentEnd = 0;
    this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.PreLoop;
    this.Phase = 0;
    this.CurrentStart = 0;
    this.CurrentEnd = 0;
    this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.PreLoop;
};
AlphaSynth.Bank.Components.Generators.GeneratorParameters.prototype = {
    QuickSetup: function (generator){
        this.CurrentStart = generator.StartPhase;
        this.Phase = this.CurrentStart + generator.Offset;
        switch (generator.LoopMode){
            case AlphaSynth.Bank.Components.Generators.LoopMode.Continuous:
            case AlphaSynth.Bank.Components.Generators.LoopMode.LoopUntilNoteOff:
                if (this.Phase >= generator.EndPhase){
                //phase is greater than the end index so generator is finished
                this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Finished;
            }
                else if (this.Phase >= generator.LoopEndPhase){
                //phase is greater than the loop end point so generator is in post loop
                this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.PostLoop;
                this.CurrentEnd = generator.EndPhase;
            }
            else if (this.Phase >= generator.LoopStartPhase){
                //phase is greater than loop start so we are inside the loop
                this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Loop;
                this.CurrentEnd = generator.LoopEndPhase;
                this.CurrentStart = generator.LoopStartPhase;
            }
            else {
                //phase is less than the loop so generator is in pre loop
                this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.PreLoop;
                this.CurrentEnd = generator.LoopStartPhase;
            }
                break;
            default:
                this.CurrentEnd = generator.EndPhase;
                if (this.Phase >= this.CurrentEnd)
                this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.Finished;
                else
                this.CurrentState = AlphaSynth.Bank.Components.Generators.GeneratorState.PostLoop;
                break;
        }
    }
};
AlphaSynth.Bank.Components.Generators.LoopMode = {
    NoLoop: 0,
    OneShot: 1,
    Continuous: 2,
    LoopUntilNoteOff: 3
};
AlphaSynth.Bank.Components.Generators.GeneratorState = {
    PreLoop: 0,
    Loop: 1,
    PostLoop: 2,
    Finished: 3
};
AlphaSynth.Bank.Components.Generators.DefaultGenerators = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSine = new AlphaSynth.Bank.Components.Generators.SineGenerator(new AlphaSynth.Bank.Descriptors.GeneratorDescriptor());
    AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSaw = new AlphaSynth.Bank.Components.Generators.SawGenerator(new AlphaSynth.Bank.Descriptors.GeneratorDescriptor());
    AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSquare = new AlphaSynth.Bank.Components.Generators.SquareGenerator(new AlphaSynth.Bank.Descriptors.GeneratorDescriptor());
    AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultTriangle = new AlphaSynth.Bank.Components.Generators.TriangleGenerator(new AlphaSynth.Bank.Descriptors.GeneratorDescriptor());
});
AlphaSynth.Bank.Components.LfoState = {
    Delay: 0,
    Sustain: 1
};
AlphaSynth.Bank.Components.Lfo = function (){
    this._phase = 0;
    this._increment = 0;
    this._delayTime = 0;
    this._generator = null;
    this.Frequency = 0;
    this.CurrentState = AlphaSynth.Bank.Components.LfoState.Delay;
    this.Value = 0;
    this.Depth = 0;
    this.CurrentState = AlphaSynth.Bank.Components.LfoState.Delay;
    this._generator = AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSine;
    this._delayTime = 0;
    this._increment = 0;
    this._phase = 0;
    this.Frequency = 0;
    this.CurrentState = AlphaSynth.Bank.Components.LfoState.Delay;
    this.Value = 0;
    this.Depth = 0;
};
AlphaSynth.Bank.Components.Lfo.prototype = {
    QuickSetup: function (sampleRate, lfoInfo){
        this._generator = lfoInfo.Generator;
        this._delayTime = ((sampleRate * lfoInfo.DelayTime)) | 0;
        this.Frequency = lfoInfo.Frequency;
        this._increment = this._generator.Period * this.Frequency / sampleRate;
        this.Depth = lfoInfo.Depth;
        this.Reset();
    },
    Increment: function (amount){
        if (this.CurrentState == AlphaSynth.Bank.Components.LfoState.Delay){
            this._phase -= amount;
            if (this._phase <= 0){
                this._phase = this._generator.LoopStartPhase + this._increment * -this._phase;
                this.Value = this._generator.GetValue(this._phase);
                this.CurrentState = AlphaSynth.Bank.Components.LfoState.Sustain;
            }
        }
        else {
            this._phase += this._increment * amount;
            if (this._phase >= this._generator.LoopEndPhase)
                this._phase = this._generator.LoopStartPhase + (this._phase - this._generator.LoopEndPhase) % (this._generator.LoopEndPhase - this._generator.LoopStartPhase);
            this.Value = this._generator.GetValue(this._phase);
        }
    },
    Reset: function (){
        this.Value = 0;
        if (this._delayTime > 0){
            this._phase = this._delayTime;
            this.CurrentState = AlphaSynth.Bank.Components.LfoState.Delay;
        }
        else {
            this._phase = 0;
            this.CurrentState = AlphaSynth.Bank.Components.LfoState.Sustain;
        }
    }
};
AlphaSynth.Bank.Components.FilterType = {
    None: 0,
    BiquadLowpass: 1,
    BiquadHighpass: 2,
    OnePoleLowpass: 3
};
AlphaSynth.Bank.Components.Filter = function (){
    this._a1 = 0;
    this._a2 = 0;
    this._b1 = 0;
    this._b2 = 0;
    this._m1 = 0;
    this._m2 = 0;
    this._m3 = 0;
    this._cutOff = 0;
    this._resonance = 0;
    this.FilterMethod = AlphaSynth.Bank.Components.FilterType.None;
    this.CoeffNeedsUpdating = false;
    this._a1 = 0;
    this._a2 = 0;
    this._b1 = 0;
    this._b2 = 0;
    this._m1 = 0;
    this._m2 = 0;
    this._m3 = 0;
    this.FilterMethod = AlphaSynth.Bank.Components.FilterType.None;
    this.set_CutOff(0);
    this.set_Resonance(0);
};
AlphaSynth.Bank.Components.Filter.prototype = {
    get_CutOff: function (){
        return this._cutOff;
    },
    set_CutOff: function (value){
        this._cutOff = value;
        this.CoeffNeedsUpdating = true;
    },
    get_Resonance: function (){
        return this._resonance;
    },
    set_Resonance: function (value){
        this._resonance = value;
        this.CoeffNeedsUpdating = true;
    },
    get_Enabled: function (){
        return this.FilterMethod != AlphaSynth.Bank.Components.FilterType.None;
    },
    Disable: function (){
        this.FilterMethod = AlphaSynth.Bank.Components.FilterType.None;
    },
    QuickSetup: function (sampleRate, note, velocity, filterInfo){
        this.CoeffNeedsUpdating = false;
        this.set_CutOff(filterInfo.CutOff);
        this.set_Resonance(filterInfo.Resonance);
        this.FilterMethod = filterInfo.FilterMethod;
        this._a1 = 0;
        this._a2 = 0;
        this._b1 = 0;
        this._b2 = 0;
        this._m1 = 0;
        this._m2 = 0;
        this._m3 = 0;
        if (this.get_CutOff() <= 0 || this.get_Resonance() <= 0){
            this.FilterMethod = AlphaSynth.Bank.Components.FilterType.None;
        }
        if (this.FilterMethod != AlphaSynth.Bank.Components.FilterType.None){
            this.set_CutOff(this.get_CutOff() * AlphaSynth.Synthesis.SynthHelper.CentsToPitch((note - filterInfo.RootKey) * filterInfo.KeyTrack + ((velocity * filterInfo.VelTrack)) | 0));
            this.UpdateCoefficients(sampleRate);
        }
    },
    ApplyFilter: function (sample){
        switch (this.FilterMethod){
            case AlphaSynth.Bank.Components.FilterType.BiquadHighpass:
            case AlphaSynth.Bank.Components.FilterType.BiquadLowpass:
                this._m3 = sample - this._a1 * this._m1 - this._a2 * this._m2;
                sample = this._b2 * (this._m3 + this._m2) + this._b1 * this._m1;
                this._m2 = this._m1;
                this._m1 = this._m3;
                return sample;
            case AlphaSynth.Bank.Components.FilterType.OnePoleLowpass:
                this._m1 += this._a1 * (sample - this._m1);
                return this._m1;
            default:
                return 0;
        }
    },
    ApplyFilter: function (data){
        switch (this.FilterMethod){
            case AlphaSynth.Bank.Components.FilterType.BiquadHighpass:
            case AlphaSynth.Bank.Components.FilterType.BiquadLowpass:
                for (var x = 0; x < data.length; x++){
                this._m3 = data[x] - this._a1 * this._m1 - this._a2 * this._m2;
                data[x] = this._b2 * (this._m3 + this._m2) + this._b1 * this._m1;
                this._m2 = this._m1;
                this._m1 = this._m3;
            }
                break;
            case AlphaSynth.Bank.Components.FilterType.OnePoleLowpass:
                for (var x = 0; x < data.length; x++){
                this._m1 += this._a1 * (data[x] - this._m1);
                data[x] = this._m1;
            }
                break;
        }
    },
    ApplyFilterInterp: function (data, sampleRate){
        var ic = this.GenerateFilterCoeff(this.get_CutOff() / sampleRate, this.get_Resonance());
        var a1_inc = (ic[0] - this._a1) / data.length;
        var a2_inc = (ic[1] - this._a2) / data.length;
        var b1_inc = (ic[2] - this._b1) / data.length;
        var b2_inc = (ic[3] - this._b2) / data.length;
        switch (this.FilterMethod){
            case AlphaSynth.Bank.Components.FilterType.BiquadHighpass:
            case AlphaSynth.Bank.Components.FilterType.BiquadLowpass:
                for (var x = 0; x < data.length; x++){
                this._a1 += a1_inc;
                this._a2 += a2_inc;
                this._b1 += b1_inc;
                this._b2 += b2_inc;
                this._m3 = data[x] - this._a1 * this._m1 - this._a2 * this._m2;
                data[x] = this._b2 * (this._m3 + this._m2) + this._b1 * this._m1;
                this._m2 = this._m1;
                this._m1 = this._m3;
            }
                this._a1 = ic[0];
                this._a2 = ic[1];
                this._b1 = ic[2];
                this._b2 = ic[3];
                break;
            case AlphaSynth.Bank.Components.FilterType.OnePoleLowpass:
                for (var x = 0; x < data.length; x++){
                this._a1 += a1_inc;
                this._m1 += this._a1 * (data[x] - this._m1);
                data[x] = this._m1;
            }
                this._a1 = ic[0];
                break;
        }
        this.CoeffNeedsUpdating = false;
    },
    UpdateCoefficients: function (sampleRate){
        var coeff = this.GenerateFilterCoeff(this.get_CutOff() / sampleRate, this.get_Resonance());
        this._a1 = coeff[0];
        this._a2 = coeff[1];
        this._b1 = coeff[2];
        this._b2 = coeff[3];
        this.CoeffNeedsUpdating = false;
    },
    GenerateFilterCoeff: function (fc, q){
        fc = AlphaSynth.Synthesis.SynthHelper.ClampD(fc, 1E-38, 0.49);
        var coeff = new Float32Array(4);
        switch (this.FilterMethod){
            case AlphaSynth.Bank.Components.FilterType.BiquadLowpass:
                {
                var w0 = 6.28318530717958 * fc;
                var cosw0 = Math.cos(w0);
                var alpha = Math.sin(w0) / (2 * q);
                var a0inv = 1 / (1 + alpha);
                coeff[0] = (-2 * cosw0 * a0inv);
                coeff[1] = ((1 - alpha) * a0inv);
                coeff[2] = ((1 - cosw0) * a0inv * (1 / Math.sqrt(q)));
                coeff[3] = this._b1 * 0.5;
                }
                break;
            case AlphaSynth.Bank.Components.FilterType.BiquadHighpass:
                {
                var w0 = 6.28318530717958 * fc;
                var cosw0 = Math.cos(w0);
                var alpha = Math.sin(w0) / (2 * q);
                var a0inv = 1 / (1 + alpha);
                var qinv = 1 / Math.sqrt(q);
                coeff[0] = (-2 * cosw0 * a0inv);
                coeff[1] = ((1 - alpha) * a0inv);
                coeff[2] = ((-1 - cosw0) * a0inv * qinv);
                coeff[3] = ((1 + cosw0) * a0inv * qinv * 0.5);
                }
                break;
            case AlphaSynth.Bank.Components.FilterType.OnePoleLowpass:
                coeff[0] = 1 - Math.Exp(-6.28318530717959 * fc);
                break;
        }
        return coeff;
    }
};
AlphaSynth.Bank.Components.EnvelopeState = {
    Delay: 0,
    Attack: 1,
    Hold: 2,
    Decay: 3,
    Sustain: 4,
    Release: 5,
    None: 6
};
AlphaSynth.Bank.Components.Envelope = function (){
    this._stages = null;
    this._index = 0;
    this._stage = null;
    this.Value = 0;
    this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.Delay;
    this.Depth = 0;
    this.Value = 0;
    this.Depth = 0;
    this._stages = new Array(7);
    for (var x = 0; x < this._stages.length; x++){
        this._stages[x] = new AlphaSynth.Bank.Components.EnvelopeStage();
        this._stages[x].Graph = AlphaSynth.Util.Tables.EnvelopeTables(0);
    }
    this._stages[3].Reverse = true;
    this._stages[5].Reverse = true;
    this._stages[6].Time = 100000000;
    this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.Delay;
    this._stage = this._stages[this.CurrentStage];
};
AlphaSynth.Bank.Components.Envelope.prototype = {
    QuickSetupSf2: function (sampleRate, note, keyNumToHold, keyNumToDecay, isVolumeEnvelope, envelopeInfo){
        this.Depth = envelopeInfo.Depth;
        // Delay
        this._stages[0].Offset = 0;
        this._stages[0].Scale = 0;
        this._stages[0].Time = Math.max(0, ((sampleRate * (envelopeInfo.DelayTime))) | 0);
        // Attack
        this._stages[1].Offset = envelopeInfo.StartLevel;
        this._stages[1].Scale = envelopeInfo.PeakLevel - envelopeInfo.StartLevel;
        this._stages[1].Time = Math.max(0, ((sampleRate * (envelopeInfo.AttackTime))) | 0);
        this._stages[1].Graph = AlphaSynth.Util.Tables.EnvelopeTables(envelopeInfo.AttackGraph);
        // Hold
        this._stages[2].Offset = 0;
        this._stages[2].Scale = envelopeInfo.PeakLevel;
        this._stages[2].Time = (Math.max(0, sampleRate * (envelopeInfo.HoldTime) * Math.pow(2, ((60 - note) * keyNumToHold) / 1200))) | 0;
        // Decay
        this._stages[3].Offset = envelopeInfo.SustainLevel;
        this._stages[3].Scale = envelopeInfo.PeakLevel - envelopeInfo.SustainLevel;
        if (envelopeInfo.SustainLevel == envelopeInfo.PeakLevel)
            this._stages[3].Time = 0;
        else
            this._stages[3].Time = Math.max(0, ((sampleRate * (envelopeInfo.DecayTime) * Math.pow(2, ((60 - note) * keyNumToDecay) / 1200))) | 0);
        this._stages[3].Graph = AlphaSynth.Util.Tables.EnvelopeTables(envelopeInfo.DecayGraph);
        // Sustain
        this._stages[4].Offset = 0;
        this._stages[4].Scale = envelopeInfo.SustainLevel;
        this._stages[4].Time = ((sampleRate * envelopeInfo.SustainTime)) | 0;
        // Release
        this._stages[5].Scale = this._stages[3].Time == 0 && this._stages[4].Time == 0 ? envelopeInfo.PeakLevel : this._stages[4].Scale;
        if (isVolumeEnvelope){
            this._stages[5].Offset = -100;
            this._stages[5].Scale += 100;
            this._stages[6].Scale = -100;
        }
        else {
            this._stages[5].Offset = 0;
            this._stages[6].Scale = 0;
        }
        this._stages[5].Time = Math.max(0, ((sampleRate * (envelopeInfo.ReleaseTime))) | 0);
        this._stages[5].Graph = AlphaSynth.Util.Tables.EnvelopeTables(envelopeInfo.ReleaseGraph);
        this._index = 0;
        this.Value = 0;
        this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.Delay;
        while (this._stages[this.CurrentStage].Time == 0){
            this.CurrentStage++;
        }
        this._stage = this._stages[this.CurrentStage];
    },
    Increment: function (samples){
        do{
            var neededSamples = this._stage.Time - this._index;
            if (neededSamples > samples){
                this._index += samples;
                samples = 0;
            }
            else {
                this._index = 0;
                if (this.CurrentStage != AlphaSynth.Bank.Components.EnvelopeState.None){
                    do{
                        this._stage = this._stages[++this.CurrentStage];
                    }
                    while (this._stage.Time == 0)
                }
                samples -= neededSamples;
            }
        }
        while (samples > 0)
        var i = ((this._stage.Graph.length * (this._index / this._stage.Time))) | 0;
        if (this._stage.Reverse)
            this.Value = (1 - this._stage.Graph[i]) * this._stage.Scale + this._stage.Offset;
        else
            this.Value = this._stage.Graph[i] * this._stage.Scale + this._stage.Offset;
    },
    Release: function (lowerLimit){
        if (this.Value <= lowerLimit){
            this._index = 0;
            this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.None;
            this._stage = this._stages[this.CurrentStage];
        }
        else if (this.CurrentStage < AlphaSynth.Bank.Components.EnvelopeState.Release){
            this._index = 0;
            this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.Release;
            this._stage = this._stages[this.CurrentStage];
            this._stage.Scale = this.Value;
        }
    },
    ReleaseSf2VolumeEnvelope: function (){
        if (this.Value <= -100){
            this._index = 0;
            this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.None;
            this._stage = this._stages[this.CurrentStage];
        }
        else if (this.CurrentStage < AlphaSynth.Bank.Components.EnvelopeState.Release){
            this._index = 0;
            this.CurrentStage = AlphaSynth.Bank.Components.EnvelopeState.Release;
            this._stage = this._stages[this.CurrentStage];
            this._stage.Offset = -100;
            this._stage.Scale = 100 + this.Value;
        }
    }
};
AlphaSynth.Bank.Components.EnvelopeStage = function (){
    this.Time = 0;
    this.Graph = null;
    this.Scale = 0;
    this.Offset = 0;
    this.Reverse = false;
    this.Time = 0;
    this.Graph = null;
    this.Scale = 0;
    this.Offset = 0;
    this.Reverse = false;
};
AlphaSynth.Bank.Components.PanFormulaEnum = {
    Neg3dBCenter: 0,
    Neg6dBCenter: 1,
    ZeroCenter: 2
};
AlphaSynth.Bank.Components.PanComponent = function (){
    this.Left = 0;
    this.Right = 0;
};
AlphaSynth.Bank.Components.PanComponent.prototype = {
    SetValue: function (value, formula){
        value = AlphaSynth.Synthesis.SynthHelper.ClampF(value, -1, 1);
        var dvalue;
        switch (formula){
            case AlphaSynth.Bank.Components.PanFormulaEnum.Neg3dBCenter:
                dvalue = 1.5707963267949 * (value + 1) / 2;
                this.Left = Math.cos(dvalue);
                this.Right = Math.sin(dvalue);
                break;
            case AlphaSynth.Bank.Components.PanFormulaEnum.Neg6dBCenter:
                this.Left = (0.5 + value * -0.5);
                this.Right = (0.5 + value * 0.5);
                break;
            case AlphaSynth.Bank.Components.PanFormulaEnum.ZeroCenter:
                dvalue = 1.5707963267949 * (value + 1) / 2;
                this.Left = (Math.cos(dvalue) / 0.707106781186);
                this.Right = (Math.sin(dvalue) / 0.707106781186);
                break;
            default:
                throw $CreateException(new System.Exception.ctor$$String("Invalid pan law selected."), new Error());
        }
    }
};
AlphaSynth.Bank.Descriptors = AlphaSynth.Bank.Descriptors || {};
AlphaSynth.Bank.Descriptors.LfoDescriptor = function (){
    this.DelayTime = 0;
    this.Frequency = 0;
    this.Depth = 0;
    this.Generator = null;
    this.DelayTime = 0;
    this.Frequency = 8;
    this.Depth = 1;
    this.Generator = AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSine;
};
AlphaSynth.Bank.Descriptors.Waveform = {
    Sine: 0,
    Square: 1,
    Saw: 2,
    Triangle: 3,
    SampleData: 4,
    WhiteNoise: 5
};
AlphaSynth.Bank.Descriptors.GeneratorDescriptor = function (){
    this.LoopMethod = AlphaSynth.Bank.Components.Generators.LoopMode.NoLoop;
    this.SamplerType = AlphaSynth.Bank.Descriptors.Waveform.Sine;
    this.AssetName = null;
    this.EndPhase = 0;
    this.StartPhase = 0;
    this.LoopEndPhase = 0;
    this.LoopStartPhase = 0;
    this.Offset = 0;
    this.Period = 0;
    this.RootKey = 0;
    this.KeyTrack = 0;
    this.VelTrack = 0;
    this.Tune = 0;
    this.LoopMethod = AlphaSynth.Bank.Components.Generators.LoopMode.NoLoop;
    this.SamplerType = AlphaSynth.Bank.Descriptors.Waveform.Sine;
    this.AssetName = "null";
    this.EndPhase = -1;
    this.StartPhase = -1;
    this.LoopEndPhase = -1;
    this.LoopStartPhase = -1;
    this.Offset = 0;
    this.Period = -1;
    this.RootKey = -1;
    this.KeyTrack = 100;
    this.VelTrack = 0;
    this.Tune = 0;
};
AlphaSynth.Bank.Descriptors.FilterDescriptor = function (){
    this.FilterMethod = AlphaSynth.Bank.Components.FilterType.None;
    this.CutOff = 0;
    this.Resonance = 0;
    this.RootKey = 0;
    this.KeyTrack = 0;
    this.VelTrack = 0;
    this.FilterMethod = AlphaSynth.Bank.Components.FilterType.None;
    this.CutOff = -1;
    this.Resonance = 1;
    this.RootKey = 60;
    this.KeyTrack = 0;
    this.VelTrack = 0;
};
AlphaSynth.Bank.Descriptors.EnvelopeDescriptor = function (){
    this.DelayTime = 0;
    this.AttackTime = 0;
    this.AttackGraph = 0;
    this.HoldTime = 0;
    this.DecayTime = 0;
    this.DecayGraph = 0;
    this.SustainTime = 0;
    this.ReleaseTime = 0;
    this.ReleaseGraph = 0;
    this.SustainLevel = 0;
    this.PeakLevel = 0;
    this.StartLevel = 0;
    this.Depth = 0;
    this.Vel2Delay = 0;
    this.Vel2Attack = 0;
    this.Vel2Hold = 0;
    this.Vel2Decay = 0;
    this.Vel2Sustain = 0;
    this.Vel2Release = 0;
    this.Vel2Depth = 0;
    this.DelayTime = 0;
    this.AttackTime = 0;
    this.AttackGraph = 1;
    this.HoldTime = 0;
    this.DecayTime = 0;
    this.DecayGraph = 1;
    this.SustainTime = 3600;
    this.ReleaseTime = 0;
    this.ReleaseGraph = 1;
    this.SustainLevel = 0;
    this.PeakLevel = 1;
    this.StartLevel = 0;
    this.Depth = 1;
    this.Vel2Delay = 0;
    this.Vel2Attack = 0;
    this.Vel2Hold = 0;
    this.Vel2Decay = 0;
    this.Vel2Sustain = 0;
    this.Vel2Release = 0;
    this.Vel2Depth = 0;
};
AlphaSynth.Bank.Patch = AlphaSynth.Bank.Patch || {};
AlphaSynth.Bank.Patch.Patch = function (name){
    this.ExclusiveGroupTarget = 0;
    this.ExclusiveGroup = 0;
    this.Name = null;
    this.Name = name;
    this.ExclusiveGroup = 0;
    this.ExclusiveGroupTarget = 0;
};
AlphaSynth.Bank.Patch.Sf2Patch = function (name){
    this.iniFilterFc = 0;
    this.filterQ = 0;
    this.initialAttn = 0;
    this.keyOverride = 0;
    this.velOverride = 0;
    this.keynumToModEnvHold = 0;
    this.keynumToModEnvDecay = 0;
    this.keynumToVolEnvHold = 0;
    this.keynumToVolEnvDecay = 0;
    this.pan = null;
    this.modLfoToPitch = 0;
    this.vibLfoToPitch = 0;
    this.modEnvToPitch = 0;
    this.modLfoToFilterFc = 0;
    this.modEnvToFilterFc = 0;
    this.modLfoToVolume = 0;
    this.gen = null;
    this.mod_env = null;
    this.vel_env = null;
    this.mod_lfo = null;
    this.vib_lfo = null;
    this.fltr = null;
    AlphaSynth.Bank.Patch.Patch.call(this, name);
};
AlphaSynth.Bank.Patch.Sf2Patch.prototype = {
    Start: function (voiceparams){
        var note = this.keyOverride > -1 ? this.keyOverride : voiceparams.Note;
        var vel = this.velOverride > -1 ? this.velOverride : voiceparams.Velocity;
        //setup generator
        voiceparams.GeneratorParams[0].QuickSetup(this.gen);
        //setup envelopes
        voiceparams.Envelopes[0].QuickSetupSf2(voiceparams.SynthParams.Synth.SampleRate, note, this.keynumToModEnvHold, this.keynumToModEnvDecay, false, this.mod_env);
        voiceparams.Envelopes[1].QuickSetupSf2(voiceparams.SynthParams.Synth.SampleRate, note, this.keynumToVolEnvHold, this.keynumToVolEnvDecay, true, this.vel_env);
        //setup filter
        //voiceparams.pData[0].int1 = iniFilterFc - (int)(2400 * CalculateModulator(SourceTypeEnum.Linear, TransformEnum.Linear, DirectionEnum.MaxToMin, PolarityEnum.Unipolar, voiceparams.velocity, 0, 127)); 
        //if (iniFilterFc >= 13500 && fltr.Resonance <= 1)
        voiceparams.Filters[0].Disable();
        //else
        //    voiceparams.filters[0].QuickSetup(voiceparams.synthParams.synth.SampleRate, note, 1f, fltr);
        //setup lfos
        voiceparams.Lfos[0].QuickSetup(voiceparams.SynthParams.Synth.SampleRate, this.mod_lfo);
        voiceparams.Lfos[1].QuickSetup(voiceparams.SynthParams.Synth.SampleRate, this.vib_lfo);
        //calculate initial pitch
        voiceparams.PitchOffset = (note - this.gen.RootKey) * this.gen.KeyTrack + this.gen.Tune;
        voiceparams.PitchOffset += ((100 * (voiceparams.SynthParams.MasterCoarseTune + (voiceparams.SynthParams.MasterFineTune.get_Combined() - 8192) / 8192))) | 0;
        //calculate initial volume
        voiceparams.VolOffset = this.initialAttn;
        voiceparams.VolOffset -= 96 * AlphaSynth.Bank.Patch.Sf2Patch.CalculateModulator(AlphaSynth.Sf2.SourceTypeEnum.Concave, AlphaSynth.Sf2.TransformEnum.Linear, AlphaSynth.Sf2.DirectionEnum.MaxToMin, AlphaSynth.Sf2.PolarityEnum.Unipolar, voiceparams.Velocity, 0, 127);
        voiceparams.VolOffset -= 96 * AlphaSynth.Bank.Patch.Sf2Patch.CalculateModulator(AlphaSynth.Sf2.SourceTypeEnum.Concave, AlphaSynth.Sf2.TransformEnum.Linear, AlphaSynth.Sf2.DirectionEnum.MaxToMin, AlphaSynth.Sf2.PolarityEnum.Unipolar, voiceparams.SynthParams.Volume.get_Coarse(), 0, 127);
        //check if we have finished before we have begun
        return voiceparams.GeneratorParams[0].CurrentState != AlphaSynth.Bank.Components.Generators.GeneratorState.Finished && voiceparams.Envelopes[1].CurrentStage != AlphaSynth.Bank.Components.EnvelopeState.None;
    },
    Stop: function (voiceparams){
        this.gen.Release(voiceparams.GeneratorParams[0]);
        if (this.gen.LoopMode != AlphaSynth.Bank.Components.Generators.LoopMode.OneShot){
            voiceparams.Envelopes[0].Release(1E-38);
            voiceparams.Envelopes[1].ReleaseSf2VolumeEnvelope();
        }
    },
    Process: function (voiceparams, startIndex, endIndex, isMuted){
        //--Base pitch calculation
        var basePitchFrequency = AlphaSynth.Synthesis.SynthHelper.CentsToPitch(voiceparams.SynthParams.CurrentPitch) * this.gen.Frequency;
        var pitchWithBend = basePitchFrequency * AlphaSynth.Synthesis.SynthHelper.CentsToPitch(voiceparams.PitchOffset);
        var basePitch = pitchWithBend / voiceparams.SynthParams.Synth.SampleRate;
        var baseVolume = isMuted ? 0 : voiceparams.SynthParams.Synth.get_MasterVolume() * voiceparams.SynthParams.CurrentVolume * 0.35 * voiceparams.SynthParams.MixVolume;
        //--Main Loop
        for (var x = startIndex; x < endIndex; x += 128){
            voiceparams.Envelopes[0].Increment(64);
            voiceparams.Envelopes[1].Increment(64);
            voiceparams.Lfos[0].Increment(64);
            voiceparams.Lfos[1].Increment(64);
            //--Calculate pitch and get next block of samples
            this.gen.GetValues(voiceparams.GeneratorParams[0], voiceparams.BlockBuffer, basePitch * AlphaSynth.Synthesis.SynthHelper.CentsToPitch(((voiceparams.Envelopes[0].Value * this.modEnvToPitch + voiceparams.Lfos[0].Value * this.modLfoToPitch + voiceparams.Lfos[1].Value * this.vibLfoToPitch)) | 0));
            //--Filter
            if (voiceparams.Filters[0].get_Enabled()){
                var centsFc = voiceparams.PData[0].getInt32(0,true) + voiceparams.Lfos[0].Value * this.modLfoToFilterFc + voiceparams.Envelopes[0].Value * this.modEnvToFilterFc;
                if (centsFc > 13500)
                    centsFc = 13500;
                voiceparams.Filters[0].set_CutOff(AlphaSynth.Synthesis.SynthHelper.KeyToFrequency(centsFc / 100, 69));
                if (voiceparams.Filters[0].CoeffNeedsUpdating)
                    voiceparams.Filters[0].ApplyFilterInterp(voiceparams.BlockBuffer, voiceparams.SynthParams.Synth.SampleRate);
                else
                    voiceparams.Filters[0].ApplyFilter(voiceparams.BlockBuffer);
            }
            //--Volume calculation
            var volume = AlphaSynth.Synthesis.SynthHelper.DBtoLinear(voiceparams.VolOffset + voiceparams.Envelopes[1].Value + voiceparams.Lfos[0].Value * this.modLfoToVolume) * baseVolume;
            //--Mix block based on number of channels
            if (true)
                voiceparams.MixMonoToStereoInterp(x, volume * this.pan.Left * voiceparams.SynthParams.CurrentPan.Left, volume * this.pan.Right * voiceparams.SynthParams.CurrentPan.Right);
            else
                voiceparams.MixMonoToMonoInterp(x, volume);
            //--Check and end early if necessary
            if ((voiceparams.Envelopes[1].CurrentStage > AlphaSynth.Bank.Components.EnvelopeState.Hold && volume <= 1E-05) || voiceparams.GeneratorParams[0].CurrentState == AlphaSynth.Bank.Components.Generators.GeneratorState.Finished){
                voiceparams.State = AlphaSynth.Synthesis.VoiceStateEnum.Stopped;
                return;
            }
        }
    },
    Load: function (region, assets){
        this.ExclusiveGroup = region.Generators[57];
        this.ExclusiveGroupTarget = this.ExclusiveGroup;
        this.iniFilterFc = region.Generators[8];
        this.filterQ = AlphaSynth.Synthesis.SynthHelper.DBtoLinear(region.Generators[9] / 10);
        this.initialAttn = -region.Generators[48] / 10;
        this.keyOverride = region.Generators[46];
        this.velOverride = region.Generators[47];
        this.keynumToModEnvHold = region.Generators[31];
        this.keynumToModEnvDecay = region.Generators[32];
        this.keynumToVolEnvHold = region.Generators[39];
        this.keynumToVolEnvDecay = region.Generators[40];
        this.pan = new AlphaSynth.Bank.Components.PanComponent();
        this.pan.SetValue(region.Generators[17] / 500, AlphaSynth.Bank.Components.PanFormulaEnum.Neg3dBCenter);
        this.modLfoToPitch = region.Generators[5];
        this.vibLfoToPitch = region.Generators[6];
        this.modEnvToPitch = region.Generators[7];
        this.modLfoToFilterFc = region.Generators[10];
        this.modEnvToFilterFc = region.Generators[11];
        this.modLfoToVolume = region.Generators[13] / 10;
        this.LoadGen(region, assets);
        this.LoadEnvelopes(region);
        this.LoadLfos(region);
        this.LoadFilter(region);
    },
    LoadGen: function (region, assets){
        var sda = assets.SampleAssets[region.Generators[53]];
        this.gen = new AlphaSynth.Bank.Components.Generators.SampleGenerator();
        this.gen.EndPhase = sda.End + region.Generators[1] + 32768 * region.Generators[12];
        this.gen.Frequency = sda.SampleRate;
        this.gen.KeyTrack = region.Generators[56];
        this.gen.LoopEndPhase = sda.LoopEnd + region.Generators[3] + 32768 * region.Generators[50];
        switch (region.Generators[54] & 3){
            case 0:
            case 2:
                this.gen.LoopMode = AlphaSynth.Bank.Components.Generators.LoopMode.NoLoop;
                break;
            case 1:
                this.gen.LoopMode = AlphaSynth.Bank.Components.Generators.LoopMode.Continuous;
                break;
            case 3:
                this.gen.LoopMode = AlphaSynth.Bank.Components.Generators.LoopMode.LoopUntilNoteOff;
                break;
        }
        this.gen.LoopStartPhase = sda.LoopStart + region.Generators[2] + 32768 * region.Generators[45];
        this.gen.Offset = 0;
        this.gen.Period = 1;
        if (region.Generators[58] > -1)
            this.gen.RootKey = region.Generators[58];
        else
            this.gen.RootKey = sda.RootKey;
        this.gen.StartPhase = sda.Start + region.Generators[0] + 32768 * region.Generators[4];
        this.gen.Tune = ((sda.Tune + region.Generators[52] + 100 * region.Generators[51])) | 0;
        this.gen.VelocityTrack = 0;
        (this.gen).Samples = sda.SampleData;
    },
    LoadEnvelopes: function (region){
        //
        //mod env
        this.mod_env = new AlphaSynth.Bank.Descriptors.EnvelopeDescriptor();
        this.mod_env.AttackTime = Math.pow(2, region.Generators[26] / 1200);
        this.mod_env.AttackGraph = 3;
        this.mod_env.DecayTime = Math.pow(2, region.Generators[28] / 1200);
        this.mod_env.DelayTime = Math.pow(2, region.Generators[25] / 1200);
        this.mod_env.HoldTime = Math.pow(2, region.Generators[27] / 1200);
        this.mod_env.PeakLevel = 1;
        this.mod_env.ReleaseTime = Math.pow(2, region.Generators[30] / 1200);
        this.mod_env.StartLevel = 0;
        this.mod_env.SustainLevel = 1 - AlphaSynth.Synthesis.SynthHelper.ClampS(region.Generators[29], 0, 1000) / 1000;
        //checks
        if (this.mod_env.AttackTime < 0.001)
            this.mod_env.AttackTime = 0.001;
        else if (this.mod_env.AttackTime > 100)
            this.mod_env.AttackTime = 100;
        if (this.mod_env.DecayTime < 0.001)
            this.mod_env.DecayTime = 0;
        else if (this.mod_env.DecayTime > 100)
            this.mod_env.DecayTime = 100;
        if (this.mod_env.DelayTime < 0.001)
            this.mod_env.DelayTime = 0;
        else if (this.mod_env.DelayTime > 20)
            this.mod_env.DelayTime = 20;
        if (this.mod_env.HoldTime < 0.001)
            this.mod_env.HoldTime = 0;
        else if (this.mod_env.HoldTime > 20)
            this.mod_env.HoldTime = 20;
        if (this.mod_env.ReleaseTime < 0.001)
            this.mod_env.ReleaseTime = 0.001;
        else if (this.mod_env.ReleaseTime > 100)
            this.mod_env.ReleaseTime = 100;
        //
        // volume env
        this.vel_env = new AlphaSynth.Bank.Descriptors.EnvelopeDescriptor();
        this.vel_env.AttackTime = Math.pow(2, region.Generators[34] / 1200);
        this.vel_env.AttackGraph = 3;
        this.vel_env.DecayTime = Math.pow(2, region.Generators[36] / 1200);
        this.vel_env.DelayTime = Math.pow(2, region.Generators[33] / 1200);
        this.vel_env.HoldTime = Math.pow(2, region.Generators[35] / 1200);
        this.vel_env.PeakLevel = 0;
        this.vel_env.ReleaseTime = Math.pow(2, region.Generators[38] / 1200);
        this.vel_env.StartLevel = -100;
        this.vel_env.SustainLevel = AlphaSynth.Synthesis.SynthHelper.ClampS(region.Generators[37], 0, 1000) / -10;
        // checks
        if (this.vel_env.AttackTime < 0.001)
            this.vel_env.AttackTime = 0.001;
        else if (this.vel_env.AttackTime > 100)
            this.vel_env.AttackTime = 100;
        if (this.vel_env.DecayTime < 0.001)
            this.vel_env.DecayTime = 0;
        else if (this.vel_env.DecayTime > 100)
            this.vel_env.DecayTime = 100;
        if (this.vel_env.DelayTime < 0.001)
            this.vel_env.DelayTime = 0;
        else if (this.vel_env.DelayTime > 20)
            this.vel_env.DelayTime = 20;
        if (this.vel_env.HoldTime < 0.001)
            this.vel_env.HoldTime = 0;
        else if (this.vel_env.HoldTime > 20)
            this.vel_env.HoldTime = 20;
        if (this.vel_env.ReleaseTime < 0.001)
            this.vel_env.ReleaseTime = 0.001;
        else if (this.vel_env.ReleaseTime > 100)
            this.vel_env.ReleaseTime = 100;
    },
    LoadLfos: function (region){
        this.mod_lfo = new AlphaSynth.Bank.Descriptors.LfoDescriptor();
        this.mod_lfo.DelayTime = Math.pow(2, region.Generators[21] / 1200);
        this.mod_lfo.Frequency = (Math.pow(2, region.Generators[22] / 1200) * 8.176);
        this.mod_lfo.Generator = AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSine;
        this.vib_lfo = new AlphaSynth.Bank.Descriptors.LfoDescriptor();
        this.vib_lfo.DelayTime = Math.pow(2, region.Generators[23] / 1200);
        this.vib_lfo.Frequency = (Math.pow(2, region.Generators[24] / 1200) * 8.176);
        this.vib_lfo.Generator = AlphaSynth.Bank.Components.Generators.DefaultGenerators.DefaultSine;
    },
    LoadFilter: function (region){
        this.fltr = new AlphaSynth.Bank.Descriptors.FilterDescriptor();
        this.fltr.FilterMethod = AlphaSynth.Bank.Components.FilterType.BiquadLowpass;
        this.fltr.CutOff = AlphaSynth.Synthesis.SynthHelper.KeyToFrequency(region.Generators[8] / 100, 69);
        this.fltr.Resonance = AlphaSynth.Synthesis.SynthHelper.DBtoLinear(region.Generators[9] / 10);
    }
};
AlphaSynth.Bank.Patch.Sf2Patch.CalculateModulator = function (s, t, d, p, value, min, max){
    var output = 0;
    var i;
    value = value - min;
    max = max - min;
    if (d == AlphaSynth.Sf2.DirectionEnum.MaxToMin)
        value = max - value;
    switch (s){
        case AlphaSynth.Sf2.SourceTypeEnum.Linear:
            output = (value / max) | 0;
            break;
        case AlphaSynth.Sf2.SourceTypeEnum.Concave:
            i = 127 - value;
            output = -0.208333333333333 * (Math.log((i * i) / (max * max))/Math.LN10);
            break;
        case AlphaSynth.Sf2.SourceTypeEnum.Convex:
            i = value;
            output = 1 + (0.208333333333333) * (Math.log((i * i) / (max * max))/Math.LN10);
            break;
        case AlphaSynth.Sf2.SourceTypeEnum.Switch:
            if (value <= ((max / 2) | 0))
            output = 0;
            else
            output = 1;
            break;
    }
    if (p == AlphaSynth.Sf2.PolarityEnum.Bipolar)
        output = (output * 2) - 1;
    if (t == AlphaSynth.Sf2.TransformEnum.AbsoluteValue)
        output = Math.abs(output);
    return output;
};
$Inherit(AlphaSynth.Bank.Patch.Sf2Patch, AlphaSynth.Bank.Patch.Patch);
AlphaSynth.Bank.Patch.MultiPatch = function (name){
    this._intervalType = AlphaSynth.Bank.Patch.IntervalType.ChannelKeyVelocity;
    this._intervalList = null;
    AlphaSynth.Bank.Patch.Patch.call(this, name);
    this._intervalType = AlphaSynth.Bank.Patch.IntervalType.ChannelKeyVelocity;
};
AlphaSynth.Bank.Patch.MultiPatch.prototype = {
    FindPatches: function (channel, key, velocity, layers){
        var count = 0;
        switch (this._intervalType){
            case AlphaSynth.Bank.Patch.IntervalType.ChannelKeyVelocity:
                for (var x = 0; x < this._intervalList.length; x++){
                if (this._intervalList[x].CheckAllIntervals(channel, key, velocity)){
                    layers[count++] = this._intervalList[x].Patch;
                    if (count == layers.length)
                        break;
                }
            }
                break;
            case AlphaSynth.Bank.Patch.IntervalType.ChannelKey:
                for (var x = 0; x < this._intervalList.length; x++){
                if (this._intervalList[x].CheckChannelAndKey(channel, key)){
                    layers[count++] = this._intervalList[x].Patch;
                    if (count == layers.length)
                        break;
                }
            }
                break;
            case AlphaSynth.Bank.Patch.IntervalType.KeyVelocity:
                for (var x = 0; x < this._intervalList.length; x++){
                if (this._intervalList[x].CheckKeyAndVelocity(key, velocity)){
                    layers[count++] = this._intervalList[x].Patch;
                    if (count == layers.length)
                        break;
                }
            }
                break;
            case AlphaSynth.Bank.Patch.IntervalType.Key:
                for (var x = 0; x < this._intervalList.length; x++){
                if (this._intervalList[x].CheckKey(key)){
                    layers[count++] = this._intervalList[x].Patch;
                    if (count == layers.length)
                        break;
                }
            }
                break;
        }
        return count;
    },
    Start: function (voiceparams){
        return false;
    },
    Process: function (voiceparams, startIndex, endIndex, isMuted){
    },
    Stop: function (voiceparams){
    },
    LoadSf2: function (regions, assets){
        this._intervalList = new Array(regions.length);
        for (var x = 0; x < regions.length; x++){
            var loKey;
            var hiKey;
            var loVel;
            var hiVel;
            if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                loKey = (regions[x].Generators[43] & 255&255);
                hiKey = ((regions[x].Generators[43] >> 8) & 255&255);
                loVel = (regions[x].Generators[44] & 255&255);
                hiVel = ((regions[x].Generators[44] >> 8) & 255&255);
            }
            else {
                hiKey = (regions[x].Generators[43] & 255&255);
                loKey = ((regions[x].Generators[43] >> 8) & 255&255);
                hiVel = (regions[x].Generators[44] & 255&255);
                loVel = ((regions[x].Generators[44] >> 8) & 255&255);
            }
            var sf2 = new AlphaSynth.Bank.Patch.Sf2Patch(this.Name + "_" + x);
            sf2.Load(regions[x], assets);
            this._intervalList[x] = new AlphaSynth.Bank.Patch.PatchInterval(sf2, 0, 15, loKey, hiKey, loVel, hiVel);
        }
        this.DetermineIntervalType();
    },
    DetermineIntervalType: function (){
        var checkChannel = false;
        var checkVelocity = false;
        for (var x = 0; x < this._intervalList.length; x++){
            if (this._intervalList[x].StartChannel != 0 || this._intervalList[x].EndChannel != 15){
                checkChannel = true;
                if (checkChannel && checkVelocity)
                    break;
            }
            if (this._intervalList[x].StartVelocity != 0 || this._intervalList[x].EndVelocity != 127){
                checkVelocity = true;
                if (checkChannel && checkVelocity)
                    break;
            }
        }
        if (checkChannel & checkVelocity)
            this._intervalType = AlphaSynth.Bank.Patch.IntervalType.ChannelKeyVelocity;
        else if (checkChannel)
            this._intervalType = AlphaSynth.Bank.Patch.IntervalType.ChannelKey;
        else if (checkVelocity)
            this._intervalType = AlphaSynth.Bank.Patch.IntervalType.KeyVelocity;
        else
            this._intervalType = AlphaSynth.Bank.Patch.IntervalType.Key;
    }
};
$Inherit(AlphaSynth.Bank.Patch.MultiPatch, AlphaSynth.Bank.Patch.Patch);
AlphaSynth.Bank.Patch.IntervalType = {
    ChannelKeyVelocity: 0,
    ChannelKey: 1,
    KeyVelocity: 2,
    Key: 3
};
AlphaSynth.Bank.Patch.PatchInterval = function (patch, startChannel, endChannel, startKey, endKey, startVelocity, endVelocity){
    this.Patch = null;
    this.StartChannel = 0;
    this.StartKey = 0;
    this.StartVelocity = 0;
    this.EndChannel = 0;
    this.EndKey = 0;
    this.EndVelocity = 0;
    this.Patch = patch;
    this.StartChannel = startChannel;
    this.EndChannel = endChannel;
    this.StartKey = startKey;
    this.EndKey = endKey;
    this.StartVelocity = startVelocity;
    this.EndVelocity = endVelocity;
};
AlphaSynth.Bank.Patch.PatchInterval.prototype = {
    CheckAllIntervals: function (channel, key, velocity){
        return (channel >= this.StartChannel && channel <= this.EndChannel) && (key >= this.StartKey && key <= this.EndKey) && (velocity >= this.StartVelocity && velocity <= this.EndVelocity);
    },
    CheckChannelAndKey: function (channel, key){
        return (channel >= this.StartChannel && channel <= this.EndChannel) && (key >= this.StartKey && key <= this.EndKey);
    },
    CheckKeyAndVelocity: function (key, velocity){
        return (key >= this.StartKey && key <= this.EndKey) && (velocity >= this.StartVelocity && velocity <= this.EndVelocity);
    },
    CheckKey: function (key){
        return (key >= this.StartKey && key <= this.EndKey);
    }
};
AlphaSynth.Bank.SampleDataAsset = function (sample, sampleData){
    this.Name = null;
    this.Channels = 0;
    this.SampleRate = 0;
    this.RootKey = 0;
    this.Tune = 0;
    this.Start = 0;
    this.End = 0;
    this.LoopStart = 0;
    this.LoopEnd = 0;
    this.SampleData = null;
    this.Channels = 1;
    this.Name = sample.Name;
    this.SampleRate = sample.SampleRate;
    this.RootKey = sample.RootKey;
    this.Tune = sample.Tune;
    this.Start = sample.Start;
    this.End = sample.End;
    this.LoopStart = sample.StartLoop;
    this.LoopEnd = sample.EndLoop;
    if ((sample.SoundFontSampleLink & AlphaSynth.Sf2.SFSampleLink.OggVobis) != 0){
        throw $CreateException(new System.Exception.ctor$$String("Ogg Vobis encoded soundfonts not supported"), new Error());
    }
    else {
        this.SampleData = AlphaSynth.Util.PcmData.Create(sampleData.BitsPerSample, sampleData.SampleData, true);
    }
};
AlphaSynth.Bank.PatchBank = function (){
    this._bank = null;
    this._assets = null;
    this.Name = null;
    this.Comments = null;
    this.Reset();
};
AlphaSynth.Bank.PatchBank.prototype = {
    Reset: function (){
        this._bank = {};
        this._assets = new AlphaSynth.Bank.AssetManager();
        this.Name = "";
        this.Comments = "";
    },
    get_LoadedBanks: function (){
        var banks = [];
        for (var $i2 = 0,$t2 = Object.keys(this._bank),$l2 = $t2.length,bank = $t2[$i2]; $i2 < $l2; $i2++, bank = $t2[$i2]){
            banks.push(AlphaSynth.Platform.Std.ParseInt(bank));
        }
        return banks.slice(0);
    },
    GetBank: function (bankNumber){
        return this._bank.hasOwnProperty(bankNumber) ? this._bank[bankNumber] : null;
    },
    GetPatchByNumber: function (bankNumber, patchNumber){
        return this._bank.hasOwnProperty(bankNumber) ? this._bank[bankNumber][patchNumber] : null;
    },
    GetPatchByName: function (bankNumber, name){
        if (this._bank.hasOwnProperty(bankNumber)){
            var patches = this._bank[bankNumber];
            for (var $i3 = 0,$l3 = patches.length,patch = patches[$i3]; $i3 < $l3; $i3++, patch = patches[$i3]){
                if (patch != null && patch.Name == name){
                    return patch;
                }
            }
        }
        return null;
    },
    IsBankLoaded: function (bankNumber){
        return this._bank.hasOwnProperty(bankNumber);
    },
    LoadSf2: function (input){
        this.Reset();
        AlphaSynth.Util.Logger.Debug("Reading SF2");
        var sf = new AlphaSynth.Sf2.SoundFont();
        sf.Load(input);
        AlphaSynth.Util.Logger.Debug("Building patchbank");
        this.Name = sf.Info.BankName;
        this.Comments = sf.Info.Comments;
        //load samples
        for (var $i4 = 0,$t4 = sf.Presets.SampleHeaders,$l4 = $t4.length,sampleHeader = $t4[$i4]; $i4 < $l4; $i4++, sampleHeader = $t4[$i4]){
            this._assets.SampleAssets.push(new AlphaSynth.Bank.SampleDataAsset(sampleHeader, sf.SampleData));
        }
        //create instrument regions first
        var sfinsts = this.ReadSf2Instruments(sf.Presets.Instruments);
        //load each patch
        for (var $i5 = 0,$t5 = sf.Presets.PresetHeaders,$l5 = $t5.length,p = $t5[$i5]; $i5 < $l5; $i5++, p = $t5[$i5]){
            var globalGens = null;
            var i;
            if (p.Zones[0].Generators.length == 0 || p.Zones[0].Generators[p.Zones[0].Generators.length - 1].GeneratorType != AlphaSynth.Sf2.GeneratorEnum.Instrument){
                globalGens = p.Zones[0].Generators;
                i = 1;
            }
            else {
                i = 0;
            }
            var regionList = [];
            while (i < p.Zones.length){
                var presetLoKey = 0;
                var presetHiKey = 127;
                var presetLoVel = 0;
                var presetHiVel = 127;
                if (p.Zones[i].Generators[0].GeneratorType == AlphaSynth.Sf2.GeneratorEnum.KeyRange){
                    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                        presetLoKey = (p.Zones[i].Generators[0].get_AmountInt16() & 255&255);
                        presetHiKey = ((p.Zones[i].Generators[0].get_AmountInt16() >> 8) & 255&255);
                    }
                    else {
                        presetHiKey = (p.Zones[i].Generators[0].get_AmountInt16() & 255&255);
                        presetLoKey = ((p.Zones[i].Generators[0].get_AmountInt16() >> 8) & 255&255);
                    }
                    if (p.Zones[i].Generators.length > 1 && p.Zones[i].Generators[1].GeneratorType == AlphaSynth.Sf2.GeneratorEnum.VelocityRange){
                        if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                            presetLoVel = (p.Zones[i].Generators[1].get_AmountInt16() & 255&255);
                            presetHiVel = ((p.Zones[i].Generators[1].get_AmountInt16() >> 8) & 255&255);
                        }
                        else {
                            presetHiVel = (p.Zones[i].Generators[1].get_AmountInt16() & 255&255);
                            presetLoVel = ((p.Zones[i].Generators[1].get_AmountInt16() >> 8) & 255&255);
                        }
                    }
                }
                else if (p.Zones[i].Generators[0].GeneratorType == AlphaSynth.Sf2.GeneratorEnum.VelocityRange){
                    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                        presetLoVel = (p.Zones[i].Generators[0].get_AmountInt16() & 255&255);
                        presetHiVel = ((p.Zones[i].Generators[0].get_AmountInt16() >> 8) & 255&255);
                    }
                    else {
                        presetHiVel = (p.Zones[i].Generators[0].get_AmountInt16() & 255&255);
                        presetLoVel = ((p.Zones[i].Generators[0].get_AmountInt16() >> 8) & 255&255);
                    }
                }
                if (p.Zones[i].Generators[p.Zones[i].Generators.length - 1].GeneratorType == AlphaSynth.Sf2.GeneratorEnum.Instrument){
                    var insts = sfinsts[p.Zones[i].Generators[p.Zones[i].Generators.length - 1].get_AmountInt16()];
                    for (var $i6 = 0,$l6 = insts.length,inst = insts[$i6]; $i6 < $l6; $i6++, inst = insts[$i6]){
                        var instLoKey;
                        var instHiKey;
                        var instLoVel;
                        var instHiVel;
                        if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                            instLoKey = (inst.Generators[43] & 255&255);
                            instHiKey = ((inst.Generators[43] >> 8) & 255&255);
                            instLoVel = (inst.Generators[44] & 255&255);
                            instHiVel = ((inst.Generators[44] >> 8) & 255&255);
                        }
                        else {
                            instHiKey = (inst.Generators[43] & 255&255);
                            instLoKey = ((inst.Generators[43] >> 8) & 255&255);
                            instHiVel = (inst.Generators[44] & 255&255);
                            instLoVel = ((inst.Generators[44] >> 8) & 255&255);
                        }
                        if ((instLoKey <= presetHiKey && presetLoKey <= instHiKey) && (instLoVel <= presetHiVel && presetLoVel <= instHiVel)){
                            var r = new AlphaSynth.Sf2.Sf2Region();
                            AlphaSynth.Platform.Std.ArrayCopy(inst.Generators, 0, r.Generators, 0, r.Generators.length);
                            this.ReadSf2Region(r, globalGens, p.Zones[i].Generators, true);
                            regionList.push(r);
                        }
                    }
                }
                i++;
            }
            var mp = new AlphaSynth.Bank.Patch.MultiPatch(p.Name);
            mp.LoadSf2(regionList.slice(0), this._assets);
            this._assets.PatchAssets.push(new AlphaSynth.Bank.PatchAsset(mp.Name, mp));
            this.AssignPatchToBank(mp, p.BankNumber, p.PatchNumber, p.PatchNumber);
        }
    },
    ReadSf2Instruments: function (instruments){
        var regions = new Array(instruments.length);
        for (var x = 0; x < instruments.length; x++){
            var globalGens = null;
            var i;
            if (instruments[x].Zones[0].Generators.length == 0 || instruments[x].Zones[0].Generators[instruments[x].Zones[0].Generators.length - 1].GeneratorType != AlphaSynth.Sf2.GeneratorEnum.SampleID){
                globalGens = instruments[x].Zones[0].Generators;
                i = 1;
            }
            else
                i = 0;
            regions[x] = new Array(instruments[x].Zones.length - i);
            for (var j = 0; j < regions[x].length; j++){
                var r = new AlphaSynth.Sf2.Sf2Region();
                r.ApplyDefaultValues();
                this.ReadSf2Region(r, globalGens, instruments[x].Zones[j + i].Generators, false);
                regions[x][j] = r;
            }
        }
        return regions;
    },
    ReadSf2Region: function (region, globals, gens, isRelative){
        if (!isRelative){
            if (globals != null){
                for (var x = 0; x < globals.length; x++){
                    region.Generators[globals[x].GeneratorType] = globals[x].get_AmountInt16();
                }
            }
            for (var x = 0; x < gens.length; x++){
                region.Generators[gens[x].GeneratorType] = gens[x].get_AmountInt16();
            }
        }
        else {
            var genList = [];
            for (var $i7 = 0,$l7 = gens.length,generator = gens[$i7]; $i7 < $l7; $i7++, generator = gens[$i7]){
                genList.push(generator);
            }
            if (globals != null){
                for (var x = 0; x < globals.length; x++){
                    var found = false;
                    for (var i = 0; i < genList.length; i++){
                        if (genList[i].GeneratorType == globals[x].GeneratorType){
                            found = true;
                            break;
                        }
                    }
                    if (!found){
                        genList.push(globals[x]);
                    }
                }
            }
            for (var x = 0; x < genList.length; x++){
                var value = genList[x].GeneratorType;
                if (value < 5 || value == 12 || value == 45 || value == 46 || value == 47 || value == 50 || value == 54 || value == 57 || value == 58){
                    continue;
                }
                else if (value == 43 || value == 44){
                    var lo_a;
                    var hi_a;
                    var lo_b;
                    var hi_b;
                    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                        lo_a = (region.Generators[value] & 255&255);
                        hi_a = ((region.Generators[value] >> 8) & 255&255);
                        lo_b = (genList[x].get_AmountInt16() & 255&255);
                        hi_b = ((genList[x].get_AmountInt16() >> 8) & 255&255);
                    }
                    else {
                        hi_a = (region.Generators[value] & 255&255);
                        lo_a = ((region.Generators[value] >> 8) & 255&255);
                        hi_b = (genList[x].get_AmountInt16() & 255&255);
                        lo_b = ((genList[x].get_AmountInt16() >> 8) & 255&255);
                    }
                    lo_a = Math.max(lo_a, lo_b);
                    hi_a = Math.min(hi_a, hi_b);
                    if (lo_a > hi_a){
                        throw $CreateException(new System.Exception.ctor$$String("Invalid sf2 region. The range generators do not intersect."), new Error());
                    }
                    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
                        region.Generators[value] = AlphaSynth.Platform.TypeUtils.ToInt16((lo_a | (hi_a << 8)));
                    }
                    else {
                        region.Generators[value] = AlphaSynth.Platform.TypeUtils.ToInt16((lo_a << 8) | hi_a);
                    }
                }
                else {
                    region.Generators[value] = AlphaSynth.Platform.TypeUtils.ToInt16(region.Generators[value] + genList[x].get_AmountInt16());
                }
            }
        }
    },
    AssignPatchToBank: function (patch, bankNumber, startRange, endRange){
        if (bankNumber < 0)
            return;
        if (startRange > endRange){
            var range = startRange;
            startRange = endRange;
            endRange = range;
        }
        if (startRange < 0 || startRange >= 128)
            throw $CreateException(new System.Exception.ctor$$String("startRange out of range"), new Error());
        if (endRange < 0 || endRange >= 128)
            throw $CreateException(new System.Exception.ctor$$String("endRange out of range"), new Error());
        var patches;
        if (this._bank.hasOwnProperty(bankNumber)){
            patches = this._bank[bankNumber];
        }
        else {
            patches = new Array(128);
            this._bank[bankNumber] = patches;
        }
        for (var x = startRange; x <= endRange; x++){
            patches[x] = patch;
        }
    }
};
$StaticConstructor(function (){
    AlphaSynth.Bank.PatchBank.DrumBank = 128;
    AlphaSynth.Bank.PatchBank.BankSize = 128;
});
AlphaSynth.Bank.PatchAsset = function (name, patch){
    this.Name = null;
    this.Patch = null;
    this.Name = name;
    this.Patch = patch;
};
AlphaSynth.Ds = AlphaSynth.Ds || {};
AlphaSynth.Ds.LinkedList = function (){
    this.First = null;
    this.Length = 0;
    this.Length = 0;
};
AlphaSynth.Ds.LinkedList.prototype = {
    AddFirst: function (value){
        var node = new AlphaSynth.Ds.LinkedListNode();
        node.Value = value;
        if (this.First == null){
            this.InsertNodeToEmptyList(node);
        }
        else {
            this.InsertNodeBefore(this.First, node);
            this.First = node;
        }
    },
    AddLast: function (value){
        var node = new AlphaSynth.Ds.LinkedListNode();
        node.Value = value;
        if (this.First == null){
            this.InsertNodeToEmptyList(node);
        }
        else {
            this.InsertNodeBefore(this.First, node);
        }
    },
    RemoveFirst: function (){
        if (this.First == null)
            return null;
        var v = this.First.Value;
        this.Remove(this.First);
        return v;
    },
    RemoveLast: function (){
        if (this.First == null)
            return null;
        var v = this.First._prev != null ? this.First._prev.Value : null;
        this.Remove(this.First._prev);
        return v;
    },
    Remove: function (n){
        if (n._next == n){
            this.First = null;
        }
        else {
            n._next._prev = n._prev;
            n._prev._next = n._next;
            if (this.First == n){
                this.First = n._next;
            }
        }
        n.Invalidate();
        this.Length--;
    },
    InsertNodeBefore: function (node, newNode){
        newNode._next = node;
        newNode._prev = node._prev;
        node._prev._next = newNode;
        node._prev = newNode;
        newNode._list = this;
        this.Length++;
    },
    InsertNodeToEmptyList: function (node){
        node._next = node;
        node._prev = node;
        node._list = this;
        this.First = node;
        this.Length++;
    }
};
AlphaSynth.Ds.LinkedListNode = function (){
    this._list = null;
    this._next = null;
    this._prev = null;
    this.Value = null;
};
AlphaSynth.Ds.LinkedListNode.prototype = {
    get_Next: function (){
        return this._next == null || this._list.First == this._next ? null : this._next;
    },
    get_Prev: function (){
        return this._prev == null || this == this._list.First ? null : this._prev;
    },
    Invalidate: function (){
        this._list = null;
        this._next = null;
        this._prev = null;
    }
};
AlphaSynth.Ds.CircularSampleBuffer = function (size){
    this._buffer = null;
    this._writePosition = 0;
    this._readPosition = 0;
    this._sampleCount = 0;
    this._buffer = new Float32Array(size);
    this._writePosition = 0;
    this._readPosition = 0;
    this._sampleCount = 0;
};
AlphaSynth.Ds.CircularSampleBuffer.prototype = {
    get_Count: function (){
        return this._sampleCount;
    },
    Clear: function (){
        this._readPosition = 0;
        this._writePosition = 0;
        this._sampleCount = 0;
        this._buffer = new Float32Array(this._buffer.length);
    },
    Write: function (data, offset, count){
        var samplesWritten = 0;
        if (count > this._buffer.length - this._sampleCount){
            count = this._buffer.length - this._sampleCount;
        }
        var writeToEnd = Math.min(this._buffer.length - this._writePosition, count);
        this._buffer.set(data.subarray(offset,offset+writeToEnd),this._writePosition);
        this._writePosition += writeToEnd;
        this._writePosition %= this._buffer.length;
        samplesWritten += writeToEnd;
        if (samplesWritten < count){
            this._buffer.set(data.subarray(offset + samplesWritten,offset + samplesWritten+count - samplesWritten),this._writePosition);
            this._writePosition += (count - samplesWritten);
            samplesWritten = count;
        }
        this._sampleCount += samplesWritten;
        return samplesWritten;
    },
    Read: function (data, offset, count){
        if (count > this._sampleCount){
            count = this._sampleCount;
        }
        var samplesRead = 0;
        var readToEnd = Math.min(this._buffer.length - this._readPosition, count);
        data.set(this._buffer.subarray(this._readPosition,this._readPosition+readToEnd),offset);
        samplesRead += readToEnd;
        this._readPosition += readToEnd;
        this._readPosition %= this._buffer.length;
        if (samplesRead < count){
            data.set(this._buffer.subarray(this._readPosition,this._readPosition+count - samplesRead),offset + samplesRead);
            this._readPosition += (count - samplesRead);
            samplesRead = count;
        }
        this._sampleCount -= samplesRead;
        return samplesRead;
    }
};
AlphaSynth.IO = AlphaSynth.IO || {};
AlphaSynth.IO.ByteBuffer = function (){
    this._buffer = null;
    this._capacity = 0;
    this.Length = 0;
    this.Position = 0;
};
AlphaSynth.IO.ByteBuffer.prototype = {
    GetBuffer: function (){
        return this._buffer;
    },
    Reset: function (){
        this.Position = 0;
    },
    Skip: function (offset){
        this.Position += offset;
    },
    SetCapacity: function (value){
        if (value != this._capacity){
            if (value > 0){
                var newBuffer = new Uint8Array(value);
                if (this.Length > 0)
                    newBuffer.set(this._buffer.subarray(0,0+this.Length),0);
                this._buffer = newBuffer;
            }
            else {
                this._buffer = null;
            }
            this._capacity = value;
        }
    },
    ReadByte: function (){
        var n = this.Length - this.Position;
        if (n <= 0)
            return -1;
        var b = this._buffer[this.Position];
        this.Position++;
        return b;
    },
    Read: function (buffer, offset, count){
        var n = this.Length - this.Position;
        if (n > count)
            n = count;
        if (n <= 0)
            return 0;
        if (n <= 8){
            var byteCount = n;
            while (--byteCount >= 0)
                buffer[offset + byteCount] = this._buffer[this.Position + byteCount];
        }
        else
            buffer.set(this._buffer.subarray(this.Position,this.Position+n),offset);
        this.Position += n;
        return n;
    },
    ToArray: function (){
        var copy = new Uint8Array(this.Length);
        copy.set(this._buffer.subarray(0,0+this.Length),0);
        return copy;
    }
};
AlphaSynth.IO.ByteBuffer.Empty = function (){
    return AlphaSynth.IO.ByteBuffer.WithCapactiy(0);
};
AlphaSynth.IO.ByteBuffer.WithCapactiy = function (capacity){
    var buffer = new AlphaSynth.IO.ByteBuffer();
    buffer._buffer = new Uint8Array(capacity);
    buffer._capacity = capacity;
    return buffer;
};
AlphaSynth.IO.ByteBuffer.FromBuffer = function (data){
    var buffer = new AlphaSynth.IO.ByteBuffer();
    buffer._buffer = data;
    buffer._capacity = buffer.Length = data.length;
    return buffer;
};
AlphaSynth.MidiFileSequencer = function (synthesizer){
    this._synthesizer = null;
    this._tempoChanges = null;
    this._firstProgramEventPerChannel = null;
    this._synthData = null;
    this._division = 0;
    this._eventIndex = 0;
    this._currentTime = 0;
    this._playbackRange = null;
    this._playbackRangeStartTime = 0;
    this._playbackRangeEndTime = 0;
    this._endTime = 0;
    this.Finished = null;
    this.EndTick = 0;
    this.PlaybackSpeed = 0;
    this._synthesizer = synthesizer;
    this._firstProgramEventPerChannel = {};
    this._tempoChanges = [];
    this.PlaybackSpeed = 1;
};
AlphaSynth.MidiFileSequencer.prototype = {
    get_PlaybackRange: function (){
        return this._playbackRange;
    },
    set_PlaybackRange: function (value){
        this._playbackRange = value;
        if (value != null){
            this._playbackRangeStartTime = this.TickPositionToTimePositionWithSpeed(value.StartTick, 1);
            this._playbackRangeEndTime = this.TickPositionToTimePositionWithSpeed(value.EndTick, 1);
        }
    },
    get_EndTime: function (){
        return this._endTime / this.PlaybackSpeed;
    },
    Seek: function (timePosition){
        if (timePosition < 0){
            timePosition = 0;
        }
        // map to speed=1
        timePosition /= this.PlaybackSpeed;
        // ensure playback range
        if (this.get_PlaybackRange() != null){
            if (timePosition < this._playbackRangeStartTime){
                timePosition = this._playbackRangeStartTime;
            }
            else if (timePosition > this._playbackRangeEndTime){
                timePosition = this._playbackRangeEndTime;
            }
        }
        if (timePosition > (this._currentTime)){
            this.SilentProcess(timePosition - (this._currentTime));
        }
        else if (timePosition < (this._currentTime)){
            //we have to restart the midi to make sure we get the right state: instruments, volume, pan, etc
            (this._currentTime) = 0;
            this._eventIndex = 0;
            this._synthesizer.NoteOffAll(true);
            this._synthesizer.ResetPrograms();
            this._synthesizer.ResetSynthControls();
            this.SilentProcess(timePosition);
        }
    },
    SilentProcess: function (milliseconds){
        if (milliseconds <= 0)
            return;
        (this._currentTime) += milliseconds;
        while (this._eventIndex < this._synthData.length && this._synthData[this._eventIndex].Delta < (this._currentTime)){
            var m = this._synthData[this._eventIndex];
            this._synthesizer.ProcessMidiMessage(m.Event);
            this._eventIndex++;
        }
    },
    LoadMidi: function (midiFile){
        this._tempoChanges = [];
        // Converts midi to milliseconds for easy sequencing
        var bpm = 120;
        // Combine all tracks into 1 track that is organized from lowest to highest absolute time
        if (midiFile.Tracks.length > 1 || midiFile.Tracks[0].EndTime == 0){
            midiFile.CombineTracks();
        }
        this._division = midiFile.Division;
        this._eventIndex = 0;
        (this._currentTime) = 0;
        // build synth events. 
        this._synthData = new Array(midiFile.Tracks[0].MidiEvents.length);
        var absTick = 0;
        var absTime = 0;
        for (var x = 0; x < midiFile.Tracks[0].MidiEvents.length; x++){
            var mEvent = midiFile.Tracks[0].MidiEvents[x];
            var synthData = this._synthData[x] = new AlphaSynth.Synthesis.SynthEvent(mEvent);
            absTick += mEvent.DeltaTime;
            absTime += mEvent.DeltaTime * (60000 / (bpm * midiFile.Division));
            synthData.Delta = absTime;
            // Update tempo
            if (mEvent.get_Command() == AlphaSynth.Midi.Event.MidiEventTypeEnum.Meta && mEvent.get_Data1() == 81){
                var meta = mEvent;
                bpm = 60000000 / meta.Value;
                this._tempoChanges.push(new AlphaSynth.MidiFileSequencerTempoChange(bpm, absTick, ((absTime)) | 0));
            }
            else if (mEvent.get_Command() == AlphaSynth.Midi.Event.MidiEventTypeEnum.ProgramChange){
                var channel = mEvent.get_Channel();
                if (!this._firstProgramEventPerChannel.hasOwnProperty(channel)){
                    this._firstProgramEventPerChannel[channel] = synthData;
                }
            }
        }
        this._endTime = absTime;
        this.EndTick = absTick;
    },
    FillMidiEventQueue: function (){
        var millisecondsPerBuffer = (this._synthesizer.MicroBufferSize / this._synthesizer.SampleRate) * 1000 * this.PlaybackSpeed;
        for (var i = 0; i < this._synthesizer.MicroBufferCount; i++){
            (this._currentTime) += millisecondsPerBuffer;
            while (this._eventIndex < this._synthData.length && this._synthData[this._eventIndex].Delta < (this._currentTime)){
                this._synthesizer.DispatchEvent(i, this._synthData[this._eventIndex]);
                this._eventIndex++;
            }
        }
    },
    TickPositionToTimePosition: function (tickPosition){
        return this.TickPositionToTimePositionWithSpeed(tickPosition, this.PlaybackSpeed);
    },
    TimePositionToTickPosition: function (timePosition){
        return this.TimePositionToTickPositionWithSpeed(timePosition, this.PlaybackSpeed);
    },
    TickPositionToTimePositionWithSpeed: function (tickPosition, playbackSpeed){
        var timePosition = 0;
        var bpm = 120;
        var lastChange = 0;
        // find start and bpm of last tempo change before time
        for (var i = 0; i < this._tempoChanges.length; i++){
            var c = this._tempoChanges[i];
            if (tickPosition < c.Ticks){
                break;
            }
            timePosition = c.Time;
            bpm = c.Bpm;
            lastChange = c.Ticks;
        }
        // add the missing millis
        tickPosition -= lastChange;
        timePosition += (tickPosition * (60000 / (bpm * this._division)));
        return timePosition * playbackSpeed;
    },
    TimePositionToTickPositionWithSpeed: function (timePosition, playbackSpeed){
        timePosition *= playbackSpeed;
        var ticks = 0;
        var bpm = 120;
        var lastChange = 0;
        // find start and bpm of last tempo change before time
        for (var i = 0; i < this._tempoChanges.length; i++){
            var c = this._tempoChanges[i];
            if (timePosition < c.Time){
                break;
            }
            ticks = c.Ticks;
            bpm = c.Bpm;
            lastChange = c.Time;
        }
        // add the missing ticks
        timePosition -= lastChange;
        ticks += ((timePosition / (60000 / (bpm * this._division)))) | 0;
        // we add 1 for possible rounding errors.(floating point issuses)
        return ticks + 1;
    },
    add_Finished: function (value){
        this.Finished = $CombineDelegates(this.Finished, value);
    },
    remove_Finished: function (value){
        this.Finished = $RemoveDelegate(this.Finished, value);
    },
    OnFinished: function (){
        var finished = this.Finished;
        if (finished != null){
            finished();
        }
    },
    CheckForStop: function (){
        if (this.get_PlaybackRange() == null && (this._currentTime) >= this._endTime){
            (this._currentTime) = 0;
            this._eventIndex = 0;
            this._synthesizer.NoteOffAll(true);
            this._synthesizer.ResetPrograms();
            this._synthesizer.ResetSynthControls();
            this.OnFinished();
        }
        else if (this.get_PlaybackRange() != null && (this._currentTime) >= this._playbackRangeEndTime){
            (this._currentTime) = this.get_PlaybackRange().StartTick;
            this._eventIndex = 0;
            this._synthesizer.NoteOffAll(true);
            this._synthesizer.ResetPrograms();
            this._synthesizer.ResetSynthControls();
            this.OnFinished();
        }
    },
    SetChannelProgram: function (channel, program){
        if (this._firstProgramEventPerChannel.hasOwnProperty(channel)){
            this._firstProgramEventPerChannel[channel].Event.set_Data1(program);
        }
    }
};
AlphaSynth.MidiFileSequencerTempoChange = function (bpm, ticks, time){
    this.Bpm = 0;
    this.Ticks = 0;
    this.Time = 0;
    this.Bpm = bpm;
    this.Ticks = ticks;
    this.Time = time;
};
AlphaSynth.Midi = AlphaSynth.Midi || {};
AlphaSynth.Midi.Event = AlphaSynth.Midi.Event || {};
AlphaSynth.Midi.Event.MidiEvent = function (delta, status, data1, data2){
    this.Message = 0;
    this.DeltaTime = 0;
    this.DeltaTime = delta;
    this.Message = status | (data1 << 8) | (data2 << 16);
};
AlphaSynth.Midi.Event.MidiEvent.prototype = {
    get_Channel: function (){
        return this.Message & 15;
    },
    get_Command: function (){
        return (this.Message & 240);
    },
    get_Data1: function (){
        return (this.Message & 65280) >> 8;
    },
    set_Data1: function (value){
        this.Message &= -65281;
        this.Message |= value << 8;
    },
    get_Data2: function (){
        return (this.Message & 16711680) >> 16;
    },
    set_Data2: function (value){
        this.Message &= -16711681;
        this.Message |= value << 16;
    }
};
AlphaSynth.Midi.Event.SystemCommonEvent = function (delta, status, data1, data2){
    AlphaSynth.Midi.Event.MidiEvent.call(this, delta, status, data1, data2);
};
AlphaSynth.Midi.Event.SystemCommonEvent.prototype = {
    get_Channel: function (){
        return -1;
    },
    get_Command: function (){
        return (this.Message & 255);
    }
};
$Inherit(AlphaSynth.Midi.Event.SystemCommonEvent, AlphaSynth.Midi.Event.MidiEvent);
AlphaSynth.Midi.Event.SystemExclusiveEvent = function (delta, status, id, data){
    this.Data = null;
    AlphaSynth.Midi.Event.SystemCommonEvent.call(this, delta, status, (id & 255), (id >> 8));
    this.Data = data;
};
AlphaSynth.Midi.Event.SystemExclusiveEvent.prototype = {
    get_ManufacturerId: function (){
        return this.Message >> 8;
    }
};
$Inherit(AlphaSynth.Midi.Event.SystemExclusiveEvent, AlphaSynth.Midi.Event.SystemCommonEvent);
AlphaSynth.Midi.Event.SystemCommonTypeEnum = {
    SystemExclusive: 240,
    MtcQuarterFrame: 241,
    SongPosition: 242,
    SongSelect: 243,
    TuneRequest: 246,
    SystemExclusive2: 247
};
AlphaSynth.Midi.Event.RealTimeTypeEnum = {
    MidiClock: 248,
    MidiTick: 249,
    MidiStart: 250,
    MidiContinue: 252,
    MidiStop: 253,
    ActiveSense: 254,
    Reset: 255
};
AlphaSynth.Midi.Event.RealTimeEvent = function (delta, status, data1, data2){
    AlphaSynth.Midi.Event.MidiEvent.call(this, delta, status, data1, data2);
};
AlphaSynth.Midi.Event.RealTimeEvent.prototype = {
    get_Channel: function (){
        return -1;
    },
    get_Command: function (){
        return (this.Message & 255);
    }
};
$Inherit(AlphaSynth.Midi.Event.RealTimeEvent, AlphaSynth.Midi.Event.MidiEvent);
AlphaSynth.Midi.Event.MidiEventTypeEnum = {
    NoteOff: 128,
    NoteOn: 144,
    NoteAftertouch: 160,
    Controller: 176,
    ProgramChange: 192,
    ChannelAftertouch: 208,
    PitchBend: 224,
    Meta: 255
};
AlphaSynth.Midi.Event.ControllerTypeEnum = {
    BankSelectCoarse: 0,
    ModulationCoarse: 1,
    BreathControllerCoarse: 2,
    FootControllerCoarse: 4,
    PortamentoTimeCoarse: 5,
    DataEntryCoarse: 6,
    VolumeCoarse: 7,
    BalanceCoarse: 8,
    PanCoarse: 10,
    ExpressionControllerCoarse: 11,
    EffectControl1Coarse: 12,
    EffectControl2Coarse: 13,
    GeneralPurposeSlider1: 16,
    GeneralPurposeSlider2: 17,
    GeneralPurposeSlider3: 18,
    GeneralPurposeSlider4: 19,
    BankSelectFine: 32,
    ModulationFine: 33,
    BreathControllerFine: 34,
    FootControllerFine: 36,
    PortamentoTimeFine: 37,
    DataEntryFine: 38,
    VolumeFine: 39,
    BalanceFine: 40,
    PanFine: 42,
    ExpressionControllerFine: 43,
    EffectControl1Fine: 44,
    EffectControl2Fine: 45,
    HoldPedal: 64,
    Portamento: 65,
    SostenutoPedal: 66,
    SoftPedal: 67,
    LegatoPedal: 68,
    Hold2Pedal: 69,
    SoundVariation: 70,
    SoundTimbre: 71,
    SoundReleaseTime: 72,
    SoundAttackTime: 73,
    SoundBrightness: 74,
    SoundControl6: 75,
    SoundControl7: 76,
    SoundControl8: 77,
    SoundControl9: 78,
    SoundControl10: 79,
    GeneralPurposeButton1: 80,
    GeneralPurposeButton2: 81,
    GeneralPurposeButton3: 82,
    GeneralPurposeButton4: 83,
    EffectsLevel: 91,
    TremuloLevel: 92,
    ChorusLevel: 93,
    CelesteLevel: 94,
    PhaseLevel: 95,
    DataButtonIncrement: 96,
    DataButtonDecrement: 97,
    NonRegisteredParameterFine: 98,
    NonRegisteredParameterCourse: 99,
    RegisteredParameterFine: 100,
    RegisteredParameterCourse: 101,
    AllSoundOff: 120,
    ResetControllers: 121,
    LocalKeyboard: 122,
    AllNotesOff: 123,
    OmniModeOff: 124,
    OmniModeOn: 125,
    MonoMode: 126,
    PolyMode: 127
};
AlphaSynth.Midi.Event.MetaEvent = function (delta, status, data1, data2){
    AlphaSynth.Midi.Event.MidiEvent.call(this, delta, status, data1, data2);
};
AlphaSynth.Midi.Event.MetaEvent.prototype = {
    get_Channel: function (){
        return -1;
    },
    get_Command: function (){
        return (this.Message & 255);
    },
    get_MetaStatus: function (){
        return this.get_Data1();
    }
};
$Inherit(AlphaSynth.Midi.Event.MetaEvent, AlphaSynth.Midi.Event.MidiEvent);
AlphaSynth.Midi.Event.MetaTextEvent = function (delta, status, metaId, text){
    this.Text = null;
    AlphaSynth.Midi.Event.MetaEvent.call(this, delta, status, metaId, 0);
    this.Text = text;
};
$Inherit(AlphaSynth.Midi.Event.MetaTextEvent, AlphaSynth.Midi.Event.MetaEvent);
AlphaSynth.Midi.Event.MetaNumberEvent = function (delta, status, metaId, number){
    this.Value = 0;
    AlphaSynth.Midi.Event.MetaEvent.call(this, delta, status, metaId, 0);
    this.Value = number;
};
$Inherit(AlphaSynth.Midi.Event.MetaNumberEvent, AlphaSynth.Midi.Event.MetaEvent);
AlphaSynth.Midi.Event.MetaEventTypeEnum = {
    SequenceNumber: 0,
    TextEvent: 1,
    CopyrightNotice: 2,
    SequenceOrTrackName: 3,
    InstrumentName: 4,
    LyricText: 5,
    MarkerText: 6,
    CuePoint: 7,
    PatchName: 8,
    PortName: 9,
    MidiChannel: 32,
    MidiPort: 33,
    EndOfTrack: 47,
    Tempo: 81,
    SmpteOffset: 84,
    TimeSignature: 88,
    KeySignature: 89,
    SequencerSpecific: 127
};
AlphaSynth.Midi.Event.MetaDataEvent = function (delta, status, metaId, data){
    this.Data = null;
    AlphaSynth.Midi.Event.MetaEvent.call(this, delta, status, metaId, 0);
    this.Data = data;
};
$Inherit(AlphaSynth.Midi.Event.MetaDataEvent, AlphaSynth.Midi.Event.MetaEvent);
AlphaSynth.Midi.MidiTrack = function (instPrograms, drumPrograms, activeChannels, midiEvents){
    this.Instruments = null;
    this.DrumInstruments = null;
    this.ActiveChannels = null;
    this.MidiEvents = null;
    this.NoteOnCount = 0;
    this.EndTime = 0;
    this.Instruments = instPrograms;
    this.DrumInstruments = drumPrograms;
    this.ActiveChannels = activeChannels;
    this.MidiEvents = midiEvents;
    this.NoteOnCount = 0;
    this.EndTime = 0;
};
AlphaSynth.Midi.MidiHelper = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Midi.MidiHelper.MicroSecondsPerMinute = 60000000;
    AlphaSynth.Midi.MidiHelper.MinChannel = 0;
    AlphaSynth.Midi.MidiHelper.MaxChannel = 15;
    AlphaSynth.Midi.MidiHelper.DrumChannel = 9;
});
AlphaSynth.Midi.MidiFile = function (){
    this.Division = 0;
    this.TrackFormat = AlphaSynth.Midi.MidiTrackFormat.SingleTrack;
    this.TimingStandard = AlphaSynth.Midi.MidiTimeFormat.TicksPerBeat;
    this.Tracks = null;
    this.Division = 0;
    this.TrackFormat = AlphaSynth.Midi.MidiTrackFormat.SingleTrack;
    this.TimingStandard = AlphaSynth.Midi.MidiTimeFormat.TicksPerBeat;
};
AlphaSynth.Midi.MidiFile.prototype = {
    CombineTracks: function (){
        var finalTrack = this.MergeTracks();
        var absEvents = new Array(this.Tracks.length);
        for (var i = 0; i < this.Tracks.length; i++){
            absEvents[i] = new Array(this.Tracks[i].MidiEvents.length);
            var totalDeltaTime = 0;
            for (var j = 0; j < this.Tracks[i].MidiEvents.length; j++){
                absEvents[i][j] = this.Tracks[i].MidiEvents[j];
                totalDeltaTime += absEvents[i][j].DeltaTime;
                absEvents[i][j].DeltaTime = totalDeltaTime;
            }
        }
        var eventCount = 0;
        var delta = 0;
        var nextdelta = 2147483647;
        var counters = new Int32Array(absEvents.length);
        AlphaSynth.Platform.TypeUtils.ClearIntArray(counters);
        while (eventCount < finalTrack.MidiEvents.length){
            for (var x = 0; x < absEvents.length; x++){
                while (counters[x] < absEvents[x].length && absEvents[x][counters[x]].DeltaTime == delta){
                    finalTrack.MidiEvents[eventCount] = absEvents[x][counters[x]];
                    eventCount++;
                    counters[x]++;
                }
                if (counters[x] < absEvents[x].length && absEvents[x][counters[x]].DeltaTime < nextdelta)
                    nextdelta = absEvents[x][counters[x]].DeltaTime;
            }
            delta = nextdelta;
            nextdelta = 2147483647;
        }
        finalTrack.EndTime = finalTrack.MidiEvents[finalTrack.MidiEvents.length - 1].DeltaTime;
        var deltaDiff = 0;
        for (var x = 0; x < finalTrack.MidiEvents.length; x++){
            var oldTime = finalTrack.MidiEvents[x].DeltaTime;
            finalTrack.MidiEvents[x].DeltaTime -= deltaDiff;
            deltaDiff = oldTime;
        }
        this.Tracks = [finalTrack];
        this.TrackFormat = AlphaSynth.Midi.MidiTrackFormat.SingleTrack;
    },
    MergeTracks: function (){
        var eventCount = 0;
        var notesPlayed = 0;
        var programsUsed = [];
        var drumProgramsUsed = [];
        var channelsUsed = [];
        for (var x = 0; x < this.Tracks.length; x++){
            eventCount += this.Tracks[x].MidiEvents.length;
            notesPlayed += this.Tracks[x].NoteOnCount;
            for (var i = 0; i < this.Tracks[x].Instruments.length; i++){
                var p = this.Tracks[x].Instruments[i];
                if (Array.prototype.indexOf.call(programsUsed,p) == -1)
                    programsUsed.push(p);
            }
            for (var i = 0; i < this.Tracks[x].DrumInstruments.length; i++){
                var p = this.Tracks[x].DrumInstruments[i];
                if (Array.prototype.indexOf.call(drumProgramsUsed,p) == -1)
                    drumProgramsUsed.push(p);
            }
            for (var i = 0; i < this.Tracks[x].ActiveChannels.length; i++){
                var p = this.Tracks[x].ActiveChannels[i];
                if (Array.prototype.indexOf.call(channelsUsed,p) == -1)
                    channelsUsed.push(p);
            }
        }
        var track = new AlphaSynth.Midi.MidiTrack(programsUsed.slice(0), drumProgramsUsed.slice(0), channelsUsed.slice(0), new Array(eventCount));
        track.NoteOnCount = notesPlayed;
        return track;
    },
    Load: function (input){
        if (!this.FindHead(input, 500))
            throw $CreateException(new System.Exception.ctor$$String("Invalid midi file : MThd chunk could not be found."), new Error());
        this.ReadHeader(input);
        for (var x = 0; x < this.Tracks.length; x++){
            this.Tracks[x] = this.ReadTrack(input);
        }
    },
    FindHead: function (input, attempts){
        var match = 0;
        while (attempts > 0){
            switch (input.ReadByte()){
                case 77:
                    match = 1;
                    break;
                case 84:
                    match = match == 1 ? 2 : 0;
                    break;
                case 104:
                    match = match == 2 ? 3 : 0;
                    break;
                case 100:
                    if (match == 3)
                    return true;
                    match = 0;
                    break;
            }
            attempts--;
        }
        return false;
    },
    ReadHeader: function (input){
        if (AlphaSynth.Util.IOHelper.ReadInt32BE(input) != 6)
            throw $CreateException(new System.Exception.ctor$$String("Midi header is invalid."), new Error());
        this.TrackFormat = AlphaSynth.Util.IOHelper.ReadInt16BE(input);
        this.Tracks = new Array(AlphaSynth.Util.IOHelper.ReadInt16BE(input));
        var div = AlphaSynth.Util.IOHelper.ReadInt16BE(input);
        this.Division = div & 32767;
        this.TimingStandard = ((div & 32768) > 0) ? AlphaSynth.Midi.MidiTimeFormat.FramesPerSecond : AlphaSynth.Midi.MidiTimeFormat.TicksPerBeat;
    },
    ReadTrack: function (input){
        var instList = [];
        var drumList = [];
        var channelList = [];
        var eventList = [];
        var noteOnCount = 0;
        var totalTime = 0;
        while (AlphaSynth.Util.IOHelper.Read8BitChars(input, 4) != "MTrk"){
            var length = AlphaSynth.Util.IOHelper.ReadInt32BE(input);
            while (length > 0){
                length--;
                input.ReadByte();
            }
        }
        var endPosition = AlphaSynth.Util.IOHelper.ReadInt32BE(input) + input.Position;
        var prevStatus = 0;
        while (input.Position < endPosition){
            var delta = AlphaSynth.Midi.MidiFile.ReadVariableLength(input);
            totalTime += delta;
            var status = input.ReadByte();
            if (status >= 128 && status <= 239){
                //voice message
                prevStatus = status;
                eventList.push(AlphaSynth.Midi.MidiFile.ReadVoiceMessage(input, delta, status, input.ReadByte()));
                noteOnCount = AlphaSynth.Midi.MidiFile.TrackVoiceStats(eventList[eventList.length - 1], instList, drumList, channelList, noteOnCount);
            }
            else if (status >= 240 && status <= 247){
                //system common message
                prevStatus = 0;
                eventList.push(AlphaSynth.Midi.MidiFile.ReadSystemCommonMessage(input, delta, status));
            }
            else if (status >= 248 && status <= 255){
                //realtime message
                eventList.push(AlphaSynth.Midi.MidiFile.ReadRealTimeMessage(input, delta, status));
            }
            else {
                //data bytes
                if (prevStatus == 0){
                    //if no running status continue to next status byte
                    while ((status & 128) != 128){
                        status = input.ReadByte();
                    }
                    if (status >= 128 && status <= 239){
                        //voice message
                        prevStatus = status;
                        eventList.push(AlphaSynth.Midi.MidiFile.ReadVoiceMessage(input, delta, status, input.ReadByte()));
                        noteOnCount = AlphaSynth.Midi.MidiFile.TrackVoiceStats(eventList[eventList.length - 1], instList, drumList, channelList, noteOnCount);
                    }
                    else if (status >= 240 && status <= 247){
                        //system common message
                        eventList.push(AlphaSynth.Midi.MidiFile.ReadSystemCommonMessage(input, delta, status));
                    }
                    else if (status >= 248 && status <= 255){
                        //realtime message
                        eventList.push(AlphaSynth.Midi.MidiFile.ReadRealTimeMessage(input, delta, status));
                    }
                }
                else {
                    //otherwise apply running status
                    eventList.push(AlphaSynth.Midi.MidiFile.ReadVoiceMessage(input, delta, prevStatus, status));
                    noteOnCount = AlphaSynth.Midi.MidiFile.TrackVoiceStats(eventList[eventList.length - 1], instList, drumList, channelList, noteOnCount);
                }
            }
        }
        if (input.Position != endPosition)
            throw $CreateException(new System.Exception.ctor$$String("The track length was invalid for the current MTrk chunk."), new Error());
        if (Array.prototype.indexOf.call(channelList,9) != -1){
            if (Array.prototype.indexOf.call(drumList,0) == -1)
                drumList.push(0);
        }
        else {
            if (Array.prototype.indexOf.call(instList,0) == -1)
                instList.push(0);
        }
        var track = new AlphaSynth.Midi.MidiTrack(instList.slice(0), drumList.slice(0), channelList.slice(0), eventList.slice(0));
        track.NoteOnCount = noteOnCount;
        track.EndTime = totalTime;
        return track;
    }
};
AlphaSynth.Midi.MidiFile.ReadMetaMessage = function (input, delta, status){
    var metaStatus = input.ReadByte();
    switch (metaStatus){
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.SequenceNumber:
            {
            var count = input.ReadByte();
            if (count == 0)
                return new AlphaSynth.Midi.Event.MetaNumberEvent(delta, status, metaStatus, -1);
            else if (count == 2){
                return new AlphaSynth.Midi.Event.MetaNumberEvent(delta, status, metaStatus, AlphaSynth.Util.IOHelper.ReadInt16BE(input));
            }
            else
                throw $CreateException(new System.Exception.ctor$$String("Invalid sequence number event."), new Error());
            }
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.TextEvent:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.CopyrightNotice:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.SequenceOrTrackName:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.InstrumentName:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.LyricText:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.MarkerText:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.CuePoint:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.PatchName:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.PortName:
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, AlphaSynth.Midi.MidiFile.ReadString(input));
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.MidiChannel:
            if (input.ReadByte() != 1)
            throw $CreateException(new System.Exception.ctor$$String("Invalid midi channel event. Expected size of 1."), new Error());
            return new AlphaSynth.Midi.Event.MetaEvent(delta, status, metaStatus, input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.MidiPort:
            if (input.ReadByte() != 1)
            throw $CreateException(new System.Exception.ctor$$String("Invalid midi port event. Expected size of 1."), new Error());
            return new AlphaSynth.Midi.Event.MetaEvent(delta, status, metaStatus, input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.EndOfTrack:
            return new AlphaSynth.Midi.Event.MetaEvent(delta, status, metaStatus, input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.Tempo:
            if (input.ReadByte() != 3)
            throw $CreateException(new System.Exception.ctor$$String("Invalid tempo event. Expected size of 3."), new Error());
            return new AlphaSynth.Midi.Event.MetaNumberEvent(delta, status, metaStatus, (input.ReadByte() << 16) | (input.ReadByte() << 8) | input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.SmpteOffset:
            if (input.ReadByte() != 5)
            throw $CreateException(new System.Exception.ctor$$String("Invalid smpte event. Expected size of 5."), new Error());
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.TimeSignature:
            if (input.ReadByte() != 4)
            throw $CreateException(new System.Exception.ctor$$String("Invalid time signature event. Expected size of 4."), new Error());
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.KeySignature:
            if (input.ReadByte() != 2)
            throw $CreateException(new System.Exception.ctor$$String("Invalid key signature event. Expected size of 2."), new Error());
            return new AlphaSynth.Midi.Event.MetaTextEvent(delta, status, metaStatus, input.ReadByte() + ":" + input.ReadByte());
        case AlphaSynth.Midi.Event.MetaEventTypeEnum.SequencerSpecific:
            var length = AlphaSynth.Midi.MidiFile.ReadVariableLength(input);
            var data = AlphaSynth.Util.IOHelper.ReadByteArray(input, length);
            return new AlphaSynth.Midi.Event.MetaDataEvent(delta, status, metaStatus, data);
    }
    throw $CreateException(new System.Exception.ctor$$String("Not a valid meta message Status: " + status + " Meta: " + metaStatus), new Error());
};
AlphaSynth.Midi.MidiFile.ReadRealTimeMessage = function (input, delta, status){
    switch (status){
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.MidiClock:
            return new AlphaSynth.Midi.Event.RealTimeEvent(delta, status, 0, 0);
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.MidiTick:
            return new AlphaSynth.Midi.Event.RealTimeEvent(delta, status, 0, 0);
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.MidiStart:
            return new AlphaSynth.Midi.Event.RealTimeEvent(delta, status, 0, 0);
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.MidiContinue:
            return new AlphaSynth.Midi.Event.RealTimeEvent(delta, status, 0, 0);
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.MidiStop:
            return new AlphaSynth.Midi.Event.RealTimeEvent(delta, status, 0, 0);
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.ActiveSense:
            return new AlphaSynth.Midi.Event.RealTimeEvent(delta, status, 0, 0);
        case AlphaSynth.Midi.Event.RealTimeTypeEnum.Reset:
            return AlphaSynth.Midi.MidiFile.ReadMetaMessage(input, delta, status);
        default:
            throw $CreateException(new System.Exception.ctor$$String("The real time message was invalid or unsupported : " + status), new Error());
    }
};
AlphaSynth.Midi.MidiFile.ReadSystemCommonMessage = function (input, delta, status){
    switch (status){
        case AlphaSynth.Midi.Event.SystemCommonTypeEnum.SystemExclusive2:
        case AlphaSynth.Midi.Event.SystemCommonTypeEnum.SystemExclusive:
            {
            var maker = AlphaSynth.Util.IOHelper.ReadInt16BE(input);
            if (maker == 0){
                maker = AlphaSynth.Util.IOHelper.ReadInt16BE(input);
            }
            else if (maker == 247)
                return null;
            var data = [];
            var b = input.ReadByte();
            while (b != 247){
                data.push(b);
                b = input.ReadByte();
            }
            return new AlphaSynth.Midi.Event.SystemExclusiveEvent(delta, status, maker, data.slice(0));
            }
        case AlphaSynth.Midi.Event.SystemCommonTypeEnum.MtcQuarterFrame:
            return new AlphaSynth.Midi.Event.SystemCommonEvent(delta, status, input.ReadByte(), 0);
        case AlphaSynth.Midi.Event.SystemCommonTypeEnum.SongPosition:
            return new AlphaSynth.Midi.Event.SystemCommonEvent(delta, status, input.ReadByte(), input.ReadByte());
        case AlphaSynth.Midi.Event.SystemCommonTypeEnum.SongSelect:
            return new AlphaSynth.Midi.Event.SystemCommonEvent(delta, status, input.ReadByte(), 0);
        case AlphaSynth.Midi.Event.SystemCommonTypeEnum.TuneRequest:
            return new AlphaSynth.Midi.Event.SystemCommonEvent(delta, status, 0, 0);
        default:
            throw $CreateException(new System.Exception.ctor$$String("The system common message was invalid or unsupported : " + status), new Error());
    }
};
AlphaSynth.Midi.MidiFile.ReadVoiceMessage = function (input, delta, status, data1){
    switch ((status & 240)){
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteOff:
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, input.ReadByte());
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteOn:
            var velocity = input.ReadByte();
            if (velocity == 0)
            status = ((status & 15) | 128);
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, velocity);
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteAftertouch:
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, input.ReadByte());
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.Controller:
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, input.ReadByte());
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.ProgramChange:
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, 0);
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.ChannelAftertouch:
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, 0);
        case AlphaSynth.Midi.Event.MidiEventTypeEnum.PitchBend:
            return new AlphaSynth.Midi.Event.MidiEvent(delta, status, data1, input.ReadByte());
        default:
            throw $CreateException(new System.Exception.ctor$$String("The status provided was not that of a voice message."), new Error());
    }
};
AlphaSynth.Midi.MidiFile.TrackVoiceStats = function (midiEvent, instList, drumList, channelList, noteOnCount){
    if (midiEvent.get_Command() == AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteOn){
        var chan = midiEvent.get_Channel();
        if (Array.prototype.indexOf.call(channelList,chan) == -1)
            channelList.push(chan);
        noteOnCount++;
    }
    else if (midiEvent.get_Command() == AlphaSynth.Midi.Event.MidiEventTypeEnum.ProgramChange){
        var chan = midiEvent.get_Channel();
        var prog = midiEvent.get_Data1();
        if (chan == 9){
            if (Array.prototype.indexOf.call(drumList,prog) == -1)
                drumList.push(prog);
        }
        else {
            if (Array.prototype.indexOf.call(instList,prog) == -1)
                instList.push(prog);
        }
    }
    return noteOnCount;
};
AlphaSynth.Midi.MidiFile.ReadVariableLength = function (input){
    var value = 0;
    var next;
    do{
        next = input.ReadByte();
        value = value << 7;
        value = value | (next & 127);
    }
    while ((next & 128) == 128)
    return value;
};
AlphaSynth.Midi.MidiFile.ReadString = function (input){
    var length = AlphaSynth.Midi.MidiFile.ReadVariableLength(input);
    return AlphaSynth.Util.IOHelper.Read8BitChars(input, length);
    // TODO: check for correct string encoding
};
AlphaSynth.Midi.MidiTrackFormat = {
    SingleTrack: 0,
    MultiTrack: 1,
    MultiSong: 2
};
AlphaSynth.Midi.MidiTimeFormat = {
    TicksPerBeat: 0,
    FramesPerSecond: 1
};
AlphaSynth.PlayerState = {
    Paused: 0,
    Playing: 1
};
AlphaSynth.Sf2 = AlphaSynth.Sf2 || {};
AlphaSynth.Sf2.Chunks = AlphaSynth.Sf2.Chunks || {};
AlphaSynth.Sf2.Chunks.Chunk = function (id, size){
    this.Id = null;
    this.Size = 0;
    this.Id = id;
    this.Size = size;
};
AlphaSynth.Sf2.Chunks.ZoneChunk = function (id, size, input){
    this._zoneData = null;
    AlphaSynth.Sf2.Chunks.Chunk.call(this, id, size);
    this._zoneData = new Array((((size / 4)) | 0));
    var lastZone = null;
    for (var x = 0; x < this._zoneData.length; x++){
        var z = new AlphaSynth.Sf2.Chunks.RawZoneData();
        z.GeneratorIndex = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
        z.ModulatorIndex = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
        if (lastZone != null){
            lastZone.GeneratorCount = (z.GeneratorIndex - lastZone.GeneratorIndex&65535);
            lastZone.ModulatorCount = (z.ModulatorIndex - lastZone.ModulatorIndex&65535);
        }
        this._zoneData[x] = z;
        lastZone = z;
    }
};
AlphaSynth.Sf2.Chunks.ZoneChunk.prototype = {
    ToZones: function (modulators, generators){
        var zones = new Array((this._zoneData.length - 1));
        for (var x = 0; x < zones.length; x++){
            var rawZone = this._zoneData[x];
            var zone = new AlphaSynth.Sf2.Zone();
            zone.Generators = new Array(rawZone.GeneratorCount);
            AlphaSynth.Platform.Std.ArrayCopy(generators, rawZone.GeneratorIndex, zone.Generators, 0, rawZone.GeneratorCount);
            zone.Modulators = new Array(rawZone.ModulatorCount);
            AlphaSynth.Platform.Std.ArrayCopy(modulators, rawZone.ModulatorIndex, zone.Modulators, 0, rawZone.ModulatorCount);
            zones[x] = zone;
        }
        return zones;
    }
};
$Inherit(AlphaSynth.Sf2.Chunks.ZoneChunk, AlphaSynth.Sf2.Chunks.Chunk);
AlphaSynth.Sf2.Chunks.RawZoneData = function (){
    this.GeneratorIndex = 0;
    this.ModulatorIndex = 0;
    this.GeneratorCount = 0;
    this.ModulatorCount = 0;
};
AlphaSynth.Sf2.Chunks.SampleHeaderChunk = function (id, size, input){
    this.SampleHeaders = null;
    AlphaSynth.Sf2.Chunks.Chunk.call(this, id, size);
    if (size % 46 != 0)
        throw $CreateException(new System.Exception.ctor$$String("Invalid SoundFont. The sample header chunk was invalid."), new Error());
    this.SampleHeaders = new Array((((size / 46) - 1)) | 0);
    for (var x = 0; x < this.SampleHeaders.length; x++){
        this.SampleHeaders[x] = new AlphaSynth.Sf2.SampleHeader(input);
    }
    new AlphaSynth.Sf2.SampleHeader(input);
    //read terminal record
};
$Inherit(AlphaSynth.Sf2.Chunks.SampleHeaderChunk, AlphaSynth.Sf2.Chunks.Chunk);
AlphaSynth.Sf2.Chunks.PresetHeaderChunk = function (id, size, input){
    this._rawPresets = null;
    AlphaSynth.Sf2.Chunks.Chunk.call(this, id, size);
    if (size % 38 != 0)
        throw $CreateException(new System.Exception.ctor$$String("Invalid SoundFont. The preset chunk was invalid."), new Error());
    this._rawPresets = new Array((((size / 38)) | 0));
    var lastPreset = null;
    for (var x = 0; x < this._rawPresets.length; x++){
        var p = new AlphaSynth.Sf2.Chunks.RawPreset();
        p.Name = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, 20);
        p.PatchNumber = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
        p.BankNumber = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
        p.StartPresetZoneIndex = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
        p.Library = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        p.Genre = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        p.Morphology = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        if (lastPreset != null){
            lastPreset.EndPresetZoneIndex = ((p.StartPresetZoneIndex - 1)&65535);
        }
        this._rawPresets[x] = p;
        lastPreset = p;
    }
};
AlphaSynth.Sf2.Chunks.PresetHeaderChunk.prototype = {
    ToPresets: function (presetZones){
        var presets = new Array((this._rawPresets.length - 1));
        for (var x = 0; x < presets.length; x++){
            var rawPreset = this._rawPresets[x];
            var p = new AlphaSynth.Sf2.PresetHeader();
            p.BankNumber = rawPreset.BankNumber;
            p.Genre = rawPreset.Genre;
            p.Library = rawPreset.Library;
            p.Morphology = rawPreset.Morphology;
            p.Name = rawPreset.Name;
            p.PatchNumber = rawPreset.PatchNumber;
            p.Zones = new Array((rawPreset.EndPresetZoneIndex - rawPreset.StartPresetZoneIndex + 1));
            AlphaSynth.Platform.Std.ArrayCopy(presetZones, rawPreset.StartPresetZoneIndex, p.Zones, 0, p.Zones.length);
            presets[x] = p;
        }
        return presets;
    }
};
$Inherit(AlphaSynth.Sf2.Chunks.PresetHeaderChunk, AlphaSynth.Sf2.Chunks.Chunk);
AlphaSynth.Sf2.Chunks.RawPreset = function (){
    this.Name = null;
    this.PatchNumber = 0;
    this.BankNumber = 0;
    this.StartPresetZoneIndex = 0;
    this.EndPresetZoneIndex = 0;
    this.Library = 0;
    this.Genre = 0;
    this.Morphology = 0;
};
AlphaSynth.Sf2.Chunks.ModulatorChunk = function (id, size, input){
    this.Modulators = null;
    AlphaSynth.Sf2.Chunks.Chunk.call(this, id, size);
    if (size % 10 != 0)
        throw $CreateException(new System.Exception.ctor$$String("Invalid SoundFont. The presetzone chunk was invalid."), new Error());
    this.Modulators = new Array(((size / 10) | 0) - 1);
    for (var x = 0; x < this.Modulators.length; x++){
        this.Modulators[x] = new AlphaSynth.Sf2.Modulator(input);
    }
    new AlphaSynth.Sf2.Modulator(input);
};
$Inherit(AlphaSynth.Sf2.Chunks.ModulatorChunk, AlphaSynth.Sf2.Chunks.Chunk);
AlphaSynth.Sf2.Chunks.InstrumentChunk = function (id, size, input){
    this._rawInstruments = null;
    AlphaSynth.Sf2.Chunks.Chunk.call(this, id, size);
    if (size % 22 != 0)
        throw $CreateException(new System.Exception.ctor$$String("Invalid SoundFont. The preset chunk was invalid."), new Error());
    this._rawInstruments = new Array((((size / 22)) | 0));
    var lastInstrument = null;
    for (var x = 0; x < this._rawInstruments.length; x++){
        var i = new AlphaSynth.Sf2.Chunks.RawInstrument();
        i.Name = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, 20);
        i.StartInstrumentZoneIndex = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
        if (lastInstrument != null){
            lastInstrument.EndInstrumentZoneIndex = ((i.StartInstrumentZoneIndex - 1)&65535);
        }
        this._rawInstruments[x] = i;
        lastInstrument = i;
    }
};
AlphaSynth.Sf2.Chunks.InstrumentChunk.prototype = {
    ToInstruments: function (zones){
        var inst = new Array(this._rawInstruments.length - 1);
        for (var x = 0; x < inst.length; x++){
            var rawInst = this._rawInstruments[x];
            var i = new AlphaSynth.Sf2.Instrument();
            i.Name = rawInst.Name;
            i.Zones = new Array(rawInst.EndInstrumentZoneIndex - rawInst.StartInstrumentZoneIndex + 1);
            AlphaSynth.Platform.Std.ArrayCopy(zones, rawInst.StartInstrumentZoneIndex, i.Zones, 0, i.Zones.length);
            inst[x] = i;
        }
        return inst;
    }
};
$Inherit(AlphaSynth.Sf2.Chunks.InstrumentChunk, AlphaSynth.Sf2.Chunks.Chunk);
AlphaSynth.Sf2.Chunks.RawInstrument = function (){
    this.Name = null;
    this.StartInstrumentZoneIndex = 0;
    this.EndInstrumentZoneIndex = 0;
};
AlphaSynth.Sf2.Chunks.GeneratorChunk = function (id, size, input){
    this.Generators = null;
    AlphaSynth.Sf2.Chunks.Chunk.call(this, id, size);
    if (size % 4 != 0)
        throw $CreateException(new System.Exception.ctor$$String("Invalid SoundFont. The presetzone chunk was invalid"), new Error());
    this.Generators = new Array((((size / 4) - 1)) | 0);
    for (var x = 0; x < this.Generators.length; x++){
        this.Generators[x] = new AlphaSynth.Sf2.Generator(input);
    }
    new AlphaSynth.Sf2.Generator(input);
    // terminal record
};
$Inherit(AlphaSynth.Sf2.Chunks.GeneratorChunk, AlphaSynth.Sf2.Chunks.Chunk);
AlphaSynth.Sf2.Modulator = function (input){
    this._sourceModulationData = null;
    this._destinationGenerator = 0;
    this._amount = 0;
    this._sourceModulationAmount = null;
    this._sourceTransform = 0;
    this._sourceModulationData = new AlphaSynth.Sf2.ModulatorType(input);
    this._destinationGenerator = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
    this._amount = AlphaSynth.Util.IOHelper.ReadInt16LE(input);
    this._sourceModulationAmount = new AlphaSynth.Sf2.ModulatorType(input);
    this._sourceTransform = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
};
AlphaSynth.Sf2.Zone = function (){
    this.Modulators = null;
    this.Generators = null;
};
AlphaSynth.Sf2.SoundFontSampleData = function (input){
    this.BitsPerSample = 0;
    this.SampleData = null;
    var id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
    var size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    if (id.toLowerCase() != "list")
        throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Could not find sdta LIST chunk."), new Error());
    var readTo = input.Position + size;
    id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
    if (id.toLowerCase() != "sdta")
        throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. The LIST chunk is not of type sdta."), new Error());
    this.BitsPerSample = 0;
    var rawSampleData = null;
    while (input.Position < readTo){
        var subID = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
        size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        switch (subID.toLowerCase()){
            case "smpl":
                this.BitsPerSample = 16;
                rawSampleData = AlphaSynth.Util.IOHelper.ReadByteArray(input, size);
                break;
            case "sm24":
                if (rawSampleData == null || size != Math.ceil(this.SampleData.length / 2)){
                //ignore this chunk if wrong size or if it comes first
                input.Skip(size);
            }
                else {
                this.BitsPerSample = 24;
                for (var x = 0; x < this.SampleData.length; x++){
                    var b = new Uint8Array(3);
                    b[0] = input.ReadByte();
                    b[1] = rawSampleData[2 * x];
                    b[2] = rawSampleData[2 * x + 1];
                }
            }
                if (size % 2 == 1){
                if (input.ReadByte() != 0){
                    input.Position--;
                }
            }
                break;
            default:
                throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Unknown chunk id: " + subID + "."), new Error());
        }
    }
    if (this.BitsPerSample == 16){
        this.SampleData = rawSampleData;
    }
    else if (this.BitsPerSample != 24)
        throw $CreateException(new System.Exception.ctor$$String("Only 16 and 24 bit samples are supported."), new Error());
};
AlphaSynth.Sf2.SoundFontPresets = function (input){
    this.SampleHeaders = null;
    this.PresetHeaders = null;
    this.Instruments = null;
    var id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
    var size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    if (id.toLowerCase() != "list")
        throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Could not find pdta LIST chunk."), new Error());
    var readTo = input.Position + size;
    id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
    if (id.toLowerCase() != "pdta")
        throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. The LIST chunk is not of type pdta."), new Error());
    var presetModulators = null;
    var presetGenerators = null;
    var instrumentModulators = null;
    var instrumentGenerators = null;
    var pbag = null;
    var ibag = null;
    var phdr = null;
    var inst = null;
    while (input.Position < readTo){
        id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
        size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        switch (id.toLowerCase()){
            case "phdr":
                phdr = new AlphaSynth.Sf2.Chunks.PresetHeaderChunk(id, size, input);
                break;
            case "pbag":
                pbag = new AlphaSynth.Sf2.Chunks.ZoneChunk(id, size, input);
                break;
            case "pmod":
                presetModulators = new AlphaSynth.Sf2.Chunks.ModulatorChunk(id, size, input).Modulators;
                break;
            case "pgen":
                presetGenerators = new AlphaSynth.Sf2.Chunks.GeneratorChunk(id, size, input).Generators;
                break;
            case "inst":
                inst = new AlphaSynth.Sf2.Chunks.InstrumentChunk(id, size, input);
                break;
            case "ibag":
                ibag = new AlphaSynth.Sf2.Chunks.ZoneChunk(id, size, input);
                break;
            case "imod":
                instrumentModulators = new AlphaSynth.Sf2.Chunks.ModulatorChunk(id, size, input).Modulators;
                break;
            case "igen":
                instrumentGenerators = new AlphaSynth.Sf2.Chunks.GeneratorChunk(id, size, input).Generators;
                break;
            case "shdr":
                this.SampleHeaders = new AlphaSynth.Sf2.Chunks.SampleHeaderChunk(id, size, input).SampleHeaders;
                break;
            default:
                throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Unrecognized sub chunk: " + id), new Error());
        }
    }
    var pZones = pbag.ToZones(presetModulators, presetGenerators);
    this.PresetHeaders = phdr.ToPresets(pZones);
    var iZones = ibag.ToZones(instrumentModulators, instrumentGenerators);
    this.Instruments = inst.ToInstruments(iZones);
};
AlphaSynth.Sf2.SoundFontInfo = function (input){
    this.RomVersionMajor = 0;
    this.RomVersionMinor = 0;
    this.SfVersionMajor = 0;
    this.SfVersionMinor = 0;
    this.SoundEngine = null;
    this.BankName = null;
    this.DataRom = null;
    this.CreationDate = null;
    this.Author = null;
    this.TargetProduct = null;
    this.Copyright = null;
    this.Comments = null;
    this.Tools = null;
    this.Tools = "";
    this.Comments = "";
    this.Copyright = "";
    this.TargetProduct = "";
    this.Author = "";
    this.DataRom = "";
    this.CreationDate = "";
    this.BankName = "";
    this.SoundEngine = "";
    var id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
    var size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    if (id.toLowerCase() != "list")
        throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Could not find INFO LIST chunk."), new Error());
    var readTo = input.Position + size;
    id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
    if (id.toLowerCase() != "info")
        throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. The LIST chunk is not of type INFO."), new Error());
    while (input.Position < readTo){
        id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
        size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        switch (id.toLowerCase()){
            case "ifil":
                this.SfVersionMajor = AlphaSynth.Util.IOHelper.ReadInt16LE(input);
                this.SfVersionMinor = AlphaSynth.Util.IOHelper.ReadInt16LE(input);
                break;
            case "isng":
                this.SoundEngine = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "inam":
                this.BankName = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "irom":
                this.DataRom = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "iver":
                this.RomVersionMajor = AlphaSynth.Util.IOHelper.ReadInt16LE(input);
                this.RomVersionMinor = AlphaSynth.Util.IOHelper.ReadInt16LE(input);
                break;
            case "icrd":
                this.CreationDate = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "ieng":
                this.Author = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "iprd":
                this.TargetProduct = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "icop":
                this.Copyright = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "icmt":
                this.Comments = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            case "isft":
                this.Tools = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, size);
                break;
            default:
                throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. The Chunk: " + id + " was not expected."), new Error());
        }
    }
};
AlphaSynth.Sf2.SoundFont = function (){
    this.Info = null;
    this.SampleData = null;
    this.Presets = null;
};
AlphaSynth.Sf2.SoundFont.prototype = {
    Load: function (input){
        var id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
        var size = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
        if (id.toLowerCase() != "riff")
            throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Could not find RIFF header."), new Error());
        id = AlphaSynth.Util.IOHelper.Read8BitChars(input, 4);
        if (id.toLowerCase() != "sfbk")
            throw $CreateException(new System.Exception.ctor$$String("Invalid soundfont. Riff type is invalid."), new Error());
        AlphaSynth.Util.Logger.Debug("Reading info chunk");
        this.Info = new AlphaSynth.Sf2.SoundFontInfo(input);
        AlphaSynth.Util.Logger.Debug("Reading sampledata chunk");
        this.SampleData = new AlphaSynth.Sf2.SoundFontSampleData(input);
        AlphaSynth.Util.Logger.Debug("Reading preset chunk");
        this.Presets = new AlphaSynth.Sf2.SoundFontPresets(input);
    }
};
AlphaSynth.Sf2.Sf2Region = function (){
    this.Generators = null;
    this.Generators = new Int16Array(61);
};
AlphaSynth.Sf2.Sf2Region.prototype = {
    ApplyDefaultValues: function (){
        this.Generators[0] = 0;
        this.Generators[1] = 0;
        this.Generators[2] = 0;
        this.Generators[3] = 0;
        this.Generators[4] = 0;
        this.Generators[5] = 0;
        this.Generators[6] = 0;
        this.Generators[7] = 0;
        this.Generators[8] = 13500;
        this.Generators[9] = 0;
        this.Generators[10] = 0;
        this.Generators[11] = 0;
        this.Generators[12] = 0;
        this.Generators[13] = 0;
        this.Generators[15] = 0;
        this.Generators[16] = 0;
        this.Generators[17] = 0;
        this.Generators[21] = -12000;
        this.Generators[22] = 0;
        this.Generators[23] = -12000;
        this.Generators[24] = 0;
        this.Generators[25] = -12000;
        this.Generators[26] = -12000;
        this.Generators[27] = -12000;
        this.Generators[28] = -12000;
        this.Generators[29] = 0;
        this.Generators[30] = -12000;
        this.Generators[31] = 0;
        this.Generators[32] = 0;
        this.Generators[33] = -12000;
        this.Generators[34] = -12000;
        this.Generators[35] = -12000;
        this.Generators[36] = -12000;
        this.Generators[37] = 0;
        this.Generators[38] = -12000;
        this.Generators[39] = 0;
        this.Generators[40] = 0;
        this.Generators[43] = 32512;
        this.Generators[44] = 32512;
        this.Generators[45] = 0;
        this.Generators[46] = -1;
        this.Generators[47] = -1;
        this.Generators[48] = 0;
        this.Generators[50] = 0;
        this.Generators[51] = 0;
        this.Generators[52] = 0;
        this.Generators[54] = 0;
        this.Generators[56] = 100;
        this.Generators[57] = 0;
        this.Generators[58] = -1;
    }
};
AlphaSynth.Sf2.SampleHeader = function (input){
    this.Name = null;
    this.Start = 0;
    this.End = 0;
    this.StartLoop = 0;
    this.EndLoop = 0;
    this.SampleRate = 0;
    this.RootKey = 0;
    this.Tune = 0;
    this.SampleLink = 0;
    this.SoundFontSampleLink = AlphaSynth.Sf2.SFSampleLink.MonoSample;
    this.Name = AlphaSynth.Util.IOHelper.Read8BitStringLength(input, 20);
    this.Start = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    this.End = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    this.StartLoop = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    this.EndLoop = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    this.SampleRate = AlphaSynth.Util.IOHelper.ReadInt32LE(input);
    this.RootKey = input.ReadByte();
    this.Tune = AlphaSynth.Platform.TypeUtils.ToInt16(input.ReadByte());
    this.SampleLink = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
    this.SoundFontSampleLink = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
};
AlphaSynth.Sf2.PresetHeader = function (){
    this.Name = null;
    this.PatchNumber = 0;
    this.BankNumber = 0;
    this.Library = 0;
    this.Genre = 0;
    this.Morphology = 0;
    this.Zones = null;
};
AlphaSynth.Sf2.ModulatorType = function (input){
    this._controllerSource = 0;
    this.Polarity = AlphaSynth.Sf2.PolarityEnum.Unipolar;
    this.Direction = AlphaSynth.Sf2.DirectionEnum.MinToMax;
    this.SourceType = 0;
    this.IsMidiContinuousController = false;
    var raw = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
    this.Polarity = (raw & 512) == 512 ? AlphaSynth.Sf2.PolarityEnum.Bipolar : AlphaSynth.Sf2.PolarityEnum.Unipolar;
    this.Direction = (raw & 256) == 256 ? AlphaSynth.Sf2.DirectionEnum.MaxToMin : AlphaSynth.Sf2.DirectionEnum.MinToMax;
    this.IsMidiContinuousController = ((raw & 128) == 128);
    this.SourceType = ((raw & (64512)) >> 10);
    this._controllerSource = ((raw & 127)&65535);
};
AlphaSynth.Sf2.Instrument = function (){
    this.Name = null;
    this.Zones = null;
};
AlphaSynth.Sf2.Generator = function (input){
    this._rawAmount = 0;
    this.GeneratorType = AlphaSynth.Sf2.GeneratorEnum.StartAddressOffset;
    this.GeneratorType = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
    this._rawAmount = AlphaSynth.Util.IOHelper.ReadUInt16LE(input);
};
AlphaSynth.Sf2.Generator.prototype = {
    get_AmountInt16: function (){
        return AlphaSynth.Platform.TypeUtils.ToInt16(this._rawAmount);
    },
    set_AmountInt16: function (value){
        this._rawAmount = (value&65535);
    },
    get_LowByteAmount: function (){
        return (this._rawAmount & 255&255);
    },
    set_LowByteAmount: function (value){
        this._rawAmount = ((this._rawAmount & 65280) + (value&255)&65535);
    },
    get_HighByteAmount: function (){
        return ((this._rawAmount & 65280) >> 8&255);
    },
    set_HighByteAmount: function (value){
        this._rawAmount = ((this._rawAmount & 255) + ((value&255) << 8)&65535);
    }
};
AlphaSynth.Sf2.SFSampleLink = {
    MonoSample: 1,
    RightSample: 2,
    LeftSample: 4,
    LinkedSample: 8,
    OggVobis: 16,
    RomMonoSample: 32769,
    RomRightSample: 32770,
    RomLeftSample: 32772,
    RomLinkedSample: 32776
};
AlphaSynth.Sf2.GeneratorEnum = {
    StartAddressOffset: 0,
    EndAddressOffset: 1,
    StartLoopAddressOffset: 2,
    EndLoopAddressOffset: 3,
    StartAddressCoarseOffset: 4,
    ModulationLFOToPitch: 5,
    VibratoLFOToPitch: 6,
    ModulationEnvelopeToPitch: 7,
    InitialFilterCutoffFrequency: 8,
    InitialFilterQ: 9,
    ModulationLFOToFilterCutoffFrequency: 10,
    ModulationEnvelopeToFilterCutoffFrequency: 11,
    EndAddressCoarseOffset: 12,
    ModulationLFOToVolume: 13,
    Unused1: 14,
    ChorusEffectsSend: 15,
    ReverbEffectsSend: 16,
    Pan: 17,
    Unused2: 18,
    Unused3: 19,
    Unused4: 20,
    DelayModulationLFO: 21,
    FrequencyModulationLFO: 22,
    DelayVibratoLFO: 23,
    FrequencyVibratoLFO: 24,
    DelayModulationEnvelope: 25,
    AttackModulationEnvelope: 26,
    HoldModulationEnvelope: 27,
    DecayModulationEnvelope: 28,
    SustainModulationEnvelope: 29,
    ReleaseModulationEnvelope: 30,
    KeyNumberToModulationEnvelopeHold: 31,
    KeyNumberToModulationEnvelopeDecay: 32,
    DelayVolumeEnvelope: 33,
    AttackVolumeEnvelope: 34,
    HoldVolumeEnvelope: 35,
    DecayVolumeEnvelope: 36,
    SustainVolumeEnvelope: 37,
    ReleaseVolumeEnvelope: 38,
    KeyNumberToVolumeEnvelopeHold: 39,
    KeyNumberToVolumeEnvelopeDecay: 40,
    Instrument: 41,
    Reserved1: 42,
    KeyRange: 43,
    VelocityRange: 44,
    StartLoopAddressCoarseOffset: 45,
    KeyNumber: 46,
    Velocity: 47,
    InitialAttenuation: 48,
    Reserved2: 49,
    EndLoopAddressCoarseOffset: 50,
    CoarseTune: 51,
    FineTune: 52,
    SampleID: 53,
    SampleModes: 54,
    Reserved3: 55,
    ScaleTuning: 56,
    ExclusiveClass: 57,
    OverridingRootKey: 58,
    Unused5: 59,
    UnusedEnd: 60
};
AlphaSynth.Sf2.TransformEnum = {
    Linear: 0,
    AbsoluteValue: 2
};
AlphaSynth.Sf2.ControllerSourceEnum = {
    NoController: 0,
    NoteOnVelocity: 2,
    NoteOnKeyNumber: 3,
    PolyPressure: 10,
    ChannelPressure: 13,
    PitchWheel: 14,
    PitchWheelSensitivity: 16,
    Link: 127
};
AlphaSynth.Sf2.DirectionEnum = {
    MinToMax: 0,
    MaxToMin: 1
};
AlphaSynth.Sf2.PolarityEnum = {
    Unipolar: 0,
    Bipolar: 1
};
AlphaSynth.Sf2.SourceTypeEnum = {
    Linear: 0,
    Concave: 1,
    Convex: 2,
    Switch: 3
};
AlphaSynth.Synthesis = AlphaSynth.Synthesis || {};
AlphaSynth.Synthesis.CCValue = function (coarse, fine){
    this._coarseValue = 0;
    this._fineValue = 0;
    this._combined = 0;
    this._coarseValue = coarse;
    this._fineValue = fine;
    this._combined = 0;
    this.UpdateCombined();
};
AlphaSynth.Synthesis.CCValue = function (combined){
    this._coarseValue = 0;
    this._fineValue = 0;
    this._combined = 0;
    this._coarseValue = 0;
    this._fineValue = 0;
    this._combined = combined;
    this.UpdateCoarseFinePair();
};
AlphaSynth.Synthesis.CCValue.prototype = {
    get_Coarse: function (){
        return this._coarseValue;
    },
    set_Coarse: function (value){
        this._coarseValue = value;
        this.UpdateCombined();
    },
    get_Fine: function (){
        return this._fineValue;
    },
    set_Fine: function (value){
        this._fineValue = value;
        this.UpdateCombined();
    },
    get_Combined: function (){
        return this._combined;
    },
    set_Combined: function (value){
        this._combined = value;
        this.UpdateCoarseFinePair();
    },
    UpdateCombined: function (){
        if (AlphaSynth.Platform.TypeUtils.IsLittleEndian)
            this._combined = (((this._coarseValue << 7) | this._fineValue)) | 0;
        else
            this._combined = (((this._fineValue << 7) | this._coarseValue)) | 0;
    },
    UpdateCoarseFinePair: function (){
        if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
            this._coarseValue = (this._combined >> 7);
            this._fineValue = (this._combined & 127);
        }
        else {
            this._fineValue = (this._combined >> 7);
            this._coarseValue = (this._combined & 127);
        }
    }
};
AlphaSynth.Synthesis.PlaybackRange = function (){
    this.StartTick = 0;
    this.EndTick = 0;
};
AlphaSynth.Synthesis.SynthParameters = function (synth){
    this.Program = 0;
    this.BankSelect = 0;
    this.ChannelAfterTouch = 0;
    this.Pan = null;
    this.Volume = null;
    this.Expression = null;
    this.ModRange = null;
    this.PitchBend = null;
    this.PitchBendRangeCoarse = 0;
    this.PitchBendRangeFine = 0;
    this.MasterCoarseTune = 0;
    this.MasterFineTune = null;
    this.HoldPedal = false;
    this.LegatoPedal = false;
    this.Rpn = null;
    this.Synth = null;
    this.CurrentVolume = 0;
    this.CurrentPitch = 0;
    this.CurrentMod = 0;
    this.CurrentPan = null;
    this.MixVolume = 0;
    this.Synth = synth;
    this.Pan = new AlphaSynth.Synthesis.CCValue(0);
    this.Volume = new AlphaSynth.Synthesis.CCValue(0);
    this.Expression = new AlphaSynth.Synthesis.CCValue(0);
    this.ModRange = new AlphaSynth.Synthesis.CCValue(0);
    this.PitchBend = new AlphaSynth.Synthesis.CCValue(0);
    this.MasterFineTune = new AlphaSynth.Synthesis.CCValue(0);
    this.Rpn = new AlphaSynth.Synthesis.CCValue(0);
    this.MixVolume = 1;
    this.CurrentPan = new AlphaSynth.Bank.Components.PanComponent();
    this.ResetControllers();
};
AlphaSynth.Synthesis.SynthParameters.prototype = {
    ResetControllers: function (){
        this.Program = 0;
        this.BankSelect = 0;
        this.ChannelAfterTouch = 0;
        //Reset Channel Pressure to 0
        this.Pan.set_Combined(8192);
        this.Volume.set_Fine(0);
        this.Volume.set_Coarse(100);
        //Reset Vol Positions back to 90/127 (GM spec)
        this.Expression.set_Combined(16383);
        //Reset Expression positions back to 127/127
        this.ModRange.set_Combined(0);
        this.PitchBend.set_Combined(8192);
        this.PitchBendRangeCoarse = 2;
        //Reset pitch wheel to +-2 semitones (GM spec)
        this.PitchBendRangeFine = 0;
        this.MasterCoarseTune = 0;
        this.MasterFineTune.set_Combined(8192);
        //Reset fine tune
        this.HoldPedal = false;
        this.LegatoPedal = false;
        this.Rpn.set_Combined(16383);
        //Reset rpn
        this.UpdateCurrentPan();
        this.UpdateCurrentPitch();
        this.UpdateCurrentVolumeFromExpression();
    },
    UpdateCurrentPitch: function (){
        this.CurrentPitch = ((((this.PitchBend.get_Combined() - 8192) / 8192) * ((100 * this.PitchBendRangeCoarse) + this.PitchBendRangeFine))) | 0;
    },
    UpdateCurrentMod: function (){
        this.CurrentMod = ((100 * (this.ModRange.get_Combined() / 16383))) | 0;
    },
    UpdateCurrentPan: function (){
        var value = 1.5707963267949 * (this.Pan.get_Combined() / 16383);
        this.CurrentPan.Left = Math.cos(value);
        this.CurrentPan.Right = Math.sin(value);
    },
    UpdateCurrentVolumeFromVolume: function (){
        this.CurrentVolume = this.Volume.get_Combined() / 16383;
        this.CurrentVolume *= this.CurrentVolume;
    },
    UpdateCurrentVolumeFromExpression: function (){
        this.CurrentVolume = this.Expression.get_Combined() / 16383;
        this.CurrentVolume *= this.CurrentVolume;
    }
};
AlphaSynth.Synthesis.VoiceParameters = function (){
    this.mix1 = 0;
    this.mix2 = 0;
    this.Channel = 0;
    this.Note = 0;
    this.Velocity = 0;
    this.NoteOffPending = false;
    this.State = AlphaSynth.Synthesis.VoiceStateEnum.Stopped;
    this.PitchOffset = 0;
    this.VolOffset = 0;
    this.BlockBuffer = null;
    this.PData = null;
    this.SynthParams = null;
    this.GeneratorParams = null;
    this.Envelopes = null;
    this.Filters = null;
    this.Lfos = null;
    this.BlockBuffer = new Float32Array(64);
    //create default number of each component
    this.PData = new Array(4);
    this.GeneratorParams = new Array(4);
    this.Envelopes = new Array(4);
    this.Filters = new Array(4);
    this.Lfos = new Array(4);
    //initialize each component
    for (var x = 0; x < 4; x++){
        this.GeneratorParams[x] = new AlphaSynth.Bank.Components.Generators.GeneratorParameters();
        this.Envelopes[x] = new AlphaSynth.Bank.Components.Envelope();
        this.Filters[x] = new AlphaSynth.Bank.Components.Filter();
        this.Lfos[x] = new AlphaSynth.Bank.Components.Lfo();
    }
};
AlphaSynth.Synthesis.VoiceParameters.prototype = {
    get_CombinedVolume: function (){
        return this.mix1 + this.mix2;
    },
    Reset: function (){
        this.NoteOffPending = false;
        this.PitchOffset = 0;
        this.VolOffset = 0;
        for (var i = 0; i < this.PData.length; i++){
            this.PData[i] = new DataView(new ArrayBuffer(8));
        }
        this.mix1 = 0;
        this.mix2 = 0;
    },
    MixMonoToMonoInterp: function (startIndex, volume){
        var inc = (volume - this.mix1) / 64;
        for (var i = 0; i < this.BlockBuffer.length; i++){
            this.mix1 += inc;
            this.SynthParams.Synth.SampleBuffer[startIndex + i] += this.BlockBuffer[i] * this.mix1;
        }
        this.mix1 = volume;
    },
    MixMonoToStereoInterp: function (startIndex, leftVol, rightVol){
        var inc_l = (leftVol - this.mix1) / 64;
        var inc_r = (rightVol - this.mix2) / 64;
        for (var i = 0; i < this.BlockBuffer.length; i++){
            this.mix1 += inc_l;
            this.mix2 += inc_r;
            this.SynthParams.Synth.SampleBuffer[startIndex] += this.BlockBuffer[i] * this.mix1;
            this.SynthParams.Synth.SampleBuffer[startIndex + 1] += this.BlockBuffer[i] * this.mix2;
            startIndex += 2;
        }
        this.mix1 = leftVol;
        this.mix2 = rightVol;
    },
    MixStereoToStereoInterp: function (startIndex, leftVol, rightVol){
        var inc_l = (leftVol - this.mix1) / 64;
        var inc_r = (rightVol - this.mix2) / 64;
        for (var i = 0; i < this.BlockBuffer.length; i++){
            this.mix1 += inc_l;
            this.mix2 += inc_r;
            this.SynthParams.Synth.SampleBuffer[startIndex + i] += this.BlockBuffer[i] * this.mix1;
            i++;
            this.SynthParams.Synth.SampleBuffer[startIndex + i] += this.BlockBuffer[i] * this.mix2;
        }
        this.mix1 = leftVol;
        this.mix2 = rightVol;
    }
};
AlphaSynth.Synthesis.VoiceNode = function (){
    this.Value = null;
    this.Next = null;
};
AlphaSynth.Synthesis.VoiceManager = function (voiceCount){
    this._voicePool = null;
    this._vNodes = null;
    this.Polyphony = 0;
    this.FreeVoices = null;
    this.ActiveVoices = null;
    this.Registry = null;
    this.Polyphony = voiceCount;
    this._voicePool = new Array(voiceCount);
    this._vNodes = new AlphaSynth.Ds.LinkedList();
    this.FreeVoices = new AlphaSynth.Ds.LinkedList();
    this.ActiveVoices = new AlphaSynth.Ds.LinkedList();
    for (var i = 0; i < voiceCount; i++){
        var v = new AlphaSynth.Synthesis.Voice();
        this._voicePool[i] = v;
        this._vNodes.AddLast(new AlphaSynth.Synthesis.VoiceNode());
        this.FreeVoices.AddLast(v);
    }
    this.Registry = new Array(16);
    for (var i = 0; i < this.Registry.length; i++){
        this.Registry[i] = new Array(128);
    }
};
AlphaSynth.Synthesis.VoiceManager.prototype = {
    GetFreeVoice: function (){
        if (this.FreeVoices.Length > 0){
            var voice = this.FreeVoices.First.Value;
            this.FreeVoices.RemoveFirst();
            return voice;
        }
        return this.StealQuietestVoice();
    },
    AddToRegistry: function (voice){
        var node = this._vNodes.RemoveLast();
        node.Value = voice;
        node.Next = this.Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note];
        this.Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note] = node;
    },
    RemoveFromRegistry: function (channel, note){
        var node = this.Registry[channel][note];
        while (node != null){
            this._vNodes.AddLast(node);
            node = node.Next;
        }
        this.Registry[channel][note] = null;
    },
    RemoveVoiceFromRegistry: function (voice){
        var node = this.Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note];
        if (node == null)
            return;
        if (node.Value == voice){
            this.Registry[voice.VoiceParams.Channel][voice.VoiceParams.Note] = node.Next;
            this._vNodes.AddLast(node);
        }
        else {
            var node2 = node;
            node = node.Next;
            while (node != null){
                if (node.Value == voice){
                    node2.Next = node.Next;
                    this._vNodes.AddLast(node);
                    return;
                }
                node2 = node;
                node = node.Next;
            }
        }
    },
    ClearRegistry: function (){
        var node = this.ActiveVoices.First;
        while (node != null){
            var vnode = this.Registry[node.Value.VoiceParams.Channel][node.Value.VoiceParams.Note];
            while (vnode != null){
                this._vNodes.AddLast(vnode);
                vnode = vnode.Next;
            }
            this.Registry[node.Value.VoiceParams.Channel][node.Value.VoiceParams.Note] = null;
            node = node.get_Next();
        }
    },
    UnloadPatches: function (){
        for (var $i8 = 0,$t8 = this._voicePool,$l8 = $t8.length,v = $t8[$i8]; $i8 < $l8; $i8++, v = $t8[$i8]){
            v.Configure(0, 0, 0, null, null);
            var current = this._vNodes.First;
            while (current != null){
                current.Value.Value = null;
                current = current.get_Next();
            }
        }
    },
    StealQuietestVoice: function (){
        var voiceVolume = 1000;
        var quietest = null;
        var node = this.ActiveVoices.First;
        while (node != null){
            if (node.Value.VoiceParams.State != AlphaSynth.Synthesis.VoiceStateEnum.Playing){
                var volume = node.Value.VoiceParams.get_CombinedVolume();
                if (volume < voiceVolume){
                    quietest = node;
                    voiceVolume = volume;
                }
            }
            node = node.get_Next();
        }
        if (quietest == null)
            quietest = this.ActiveVoices.First;
        //check and remove from registry
        this.RemoveVoiceFromRegistry(quietest.Value);
        this.ActiveVoices.Remove(quietest);
        //stop voice if it is not already
        quietest.Value.VoiceParams.State = AlphaSynth.Synthesis.VoiceStateEnum.Stopped;
        return quietest.Value;
    }
};
AlphaSynth.Synthesis.VoiceStateEnum = {
    Stopped: 0,
    Stopping: 1,
    Playing: 2
};
AlphaSynth.Synthesis.Voice = function (){
    this.Patch = null;
    this.VoiceParams = null;
    this.VoiceParams = new AlphaSynth.Synthesis.VoiceParameters();
};
AlphaSynth.Synthesis.Voice.prototype = {
    Start: function (){
        if (this.VoiceParams.State != AlphaSynth.Synthesis.VoiceStateEnum.Stopped)
            return;
        if (this.Patch.Start(this.VoiceParams))
            this.VoiceParams.State = AlphaSynth.Synthesis.VoiceStateEnum.Playing;
    },
    Stop: function (){
        if (this.VoiceParams.State != AlphaSynth.Synthesis.VoiceStateEnum.Playing)
            return;
        this.VoiceParams.State = AlphaSynth.Synthesis.VoiceStateEnum.Stopping;
        this.Patch.Stop(this.VoiceParams);
    },
    StopImmediately: function (){
        this.VoiceParams.State = AlphaSynth.Synthesis.VoiceStateEnum.Stopped;
    },
    Process: function (startIndex, endIndex, isMuted){
        //do not process if the voice is stopped
        if (this.VoiceParams.State == AlphaSynth.Synthesis.VoiceStateEnum.Stopped)
            return;
        //process using the patch's algorithm
        this.Patch.Process(this.VoiceParams, startIndex, endIndex, isMuted);
    },
    Configure: function (channel, note, velocity, patch, synthParams){
        this.VoiceParams.Reset();
        this.VoiceParams.Channel = channel;
        this.VoiceParams.Note = note;
        this.VoiceParams.Velocity = velocity;
        this.VoiceParams.SynthParams = synthParams;
        this.Patch = patch;
    }
};
AlphaSynth.Synthesis.SynthHelper = function (){
};
AlphaSynth.Synthesis.SynthHelper.ClampB = function (value, min, max){
    if (value <= min)
        return min;
    else if (value >= max)
        return max;
    else
        return value;
};
AlphaSynth.Synthesis.SynthHelper.ClampD = function (value, min, max){
    if (value <= min)
        return min;
    else if (value >= max)
        return max;
    else
        return value;
};
AlphaSynth.Synthesis.SynthHelper.ClampF = function (value, min, max){
    if (value <= min)
        return min;
    else if (value >= max)
        return max;
    else
        return value;
};
AlphaSynth.Synthesis.SynthHelper.ClampI = function (value, min, max){
    if (value <= min)
        return min;
    else if (value >= max)
        return max;
    else
        return value;
};
AlphaSynth.Synthesis.SynthHelper.ClampS = function (value, min, max){
    if (value <= min)
        return min;
    else if (value >= max)
        return max;
    else
        return value;
};
AlphaSynth.Synthesis.SynthHelper.NearestPowerOfTwo = function (value){
    return Math.pow(2, Math.Round(Math.Log(value, 2)));
};
AlphaSynth.Synthesis.SynthHelper.SamplesFromTime = function (sampleRate, seconds){
    return sampleRate * seconds;
};
AlphaSynth.Synthesis.SynthHelper.TimeFromSamples = function (sampleRate, samples){
    return samples / sampleRate;
};
AlphaSynth.Synthesis.SynthHelper.DBtoLinear = function (dBvalue){
    return Math.pow(10, (dBvalue / 20));
};
AlphaSynth.Synthesis.SynthHelper.LineartoDB = function (linearvalue){
    return 20 * (Math.log(linearvalue)/Math.LN10);
};
AlphaSynth.Synthesis.SynthHelper.FrequencyToKey = function (frequency, rootkey){
    return 12 * Math.Log(frequency / 440, 2) + rootkey;
};
AlphaSynth.Synthesis.SynthHelper.KeyToFrequency = function (key, rootkey){
    return Math.pow(2, (key - rootkey) / 12) * 440;
};
AlphaSynth.Synthesis.SynthHelper.SemitoneToPitch = function (key){
    //does not return a frequency, only the 2^(1/12) value.
    if (key < -127)
        key = -127;
    else if (key > 127)
        key = 127;
    return AlphaSynth.Util.Tables.SemitoneTable(127 + key);
};
AlphaSynth.Synthesis.SynthHelper.CentsToPitch = function (cents){
    //does not return a frequency, only the 2^(1/12) value.
    var key = (cents / 100) | 0;
    cents -= key * 100;
    if (key < -127)
        key = -127;
    else if (key > 127)
        key = 127;
    return AlphaSynth.Util.Tables.SemitoneTable(127 + key) * AlphaSynth.Util.Tables.CentTable(100 + cents);
};
AlphaSynth.Synthesis.SynthEvent = function (e){
    this.Event = null;
    this.Delta = 0;
    this.Event = e;
};
AlphaSynth.Synthesis.Synthesizer = function (sampleRate, audioChannels, bufferSize, bufferCount, polyphony){
    this._voiceManager = null;
    this._synthChannels = null;
    this._masterVolume = 0;
    this._layerList = null;
    this._midiEventQueue = null;
    this._midiEventCounts = null;
    this._mutedChannels = null;
    this._soloChannels = null;
    this._isAnySolo = false;
    this.MidiEventProcessed = null;
    this.MicroBufferSize = 0;
    this.MicroBufferCount = 0;
    this.SampleBuffer = null;
    this.SoundBank = null;
    this.SampleRate = 0;
    var MinSampleRate = 8000;
    var MaxSampleRate = 96000;
    //
    // Setup synth parameters
    this._masterVolume = 1;
    this.SampleRate = AlphaSynth.Synthesis.SynthHelper.ClampI(sampleRate, MinSampleRate, MaxSampleRate);
    this.MicroBufferSize = AlphaSynth.Synthesis.SynthHelper.ClampI(bufferSize, ((0.001 * sampleRate)) | 0, ((0.05 * sampleRate)) | 0);
    this.MicroBufferSize = ((Math.ceil(this.MicroBufferSize / 64) * 64)) | 0;
    //ensure multiple of block size
    this.MicroBufferCount = (Math.max(1, bufferCount));
    this.SampleBuffer = new Float32Array((this.MicroBufferSize * this.MicroBufferCount * audioChannels));
    // Setup Controllers
    this._synthChannels = new Array(16);
    for (var x = 0; x < this._synthChannels.length; x++){
        this._synthChannels[x] = new AlphaSynth.Synthesis.SynthParameters(this);
    }
    // Create synth voices
    this._voiceManager = new AlphaSynth.Synthesis.VoiceManager(AlphaSynth.Synthesis.SynthHelper.ClampI(polyphony, 5, 250));
    // Create midi containers
    this._midiEventQueue = new AlphaSynth.Ds.LinkedList();
    this._midiEventCounts = new Int32Array(this.MicroBufferCount);
    this._layerList = new Array(15);
    this._mutedChannels = {};
    this._soloChannels = {};
    this.ResetSynthControls();
};
AlphaSynth.Synthesis.Synthesizer.prototype = {
    get_MasterVolume: function (){
        return this._masterVolume;
    },
    set_MasterVolume: function (value){
        this._masterVolume = AlphaSynth.Synthesis.SynthHelper.ClampF(value, 0, 10);
    },
    LoadBank: function (bank){
        this.UnloadBank();
        this.SoundBank = bank;
    },
    UnloadBank: function (){
        if (this.SoundBank != null){
            this.NoteOffAll(true);
            this._voiceManager.UnloadPatches();
            this.SoundBank = null;
        }
    },
    ResetSynthControls: function (){
        for (var $i9 = 0,$t9 = this._synthChannels,$l9 = $t9.length,parameters = $t9[$i9]; $i9 < $l9; $i9++, parameters = $t9[$i9]){
            parameters.ResetControllers();
        }
        this._synthChannels[9].BankSelect = 128;
        this.ReleaseAllHoldPedals();
    },
    ResetPrograms: function (){
        for (var $i10 = 0,$t10 = this._synthChannels,$l10 = $t10.length,parameters = $t10[$i10]; $i10 < $l10; $i10++, parameters = $t10[$i10]){
            parameters.Program = 0;
        }
    },
    Synthesize: function (){
        this.SampleBuffer=new Float32Array(this.SampleBuffer.length);
        this.FillWorkingBuffer();
    },
    FillWorkingBuffer: function (){
        /*Break the process loop into sections representing the smallest timeframe before the midi controls need to be updated
        the bigger the timeframe the more efficent the process is, but playback quality will be reduced.*/
        var sampleIndex = 0;
        var anySolo = this._isAnySolo;
        for (var x = 0; x < this.MicroBufferCount; x++){
            if (this._midiEventQueue.Length > 0){
                for (var i = 0; i < this._midiEventCounts[x]; i++){
                    var m = this._midiEventQueue.RemoveLast();
                    this.ProcessMidiMessage(m.Event);
                }
            }
            //voice processing loop
            var node = this._voiceManager.ActiveVoices.First;
            //node used to traverse the active voices
            while (node != null){
                var channel = node.Value.VoiceParams.Channel;
                // channel is muted if it is either explicitley muted, or another channel is set to solo but not this one. 
                var isChannelMuted = this._mutedChannels.hasOwnProperty(channel) || (anySolo && !this._soloChannels.hasOwnProperty(channel));
                node.Value.Process(sampleIndex, sampleIndex + this.MicroBufferSize * 2, isChannelMuted);
                //if an active voice has stopped remove it from the list
                if (node.Value.VoiceParams.State == AlphaSynth.Synthesis.VoiceStateEnum.Stopped){
                    var delnode = node;
                    //node used to remove inactive voices
                    node = node.get_Next();
                    this._voiceManager.RemoveVoiceFromRegistry(delnode.Value);
                    this._voiceManager.ActiveVoices.Remove(delnode);
                    this._voiceManager.FreeVoices.AddFirst(delnode.Value);
                }
                else {
                    node = node.get_Next();
                }
            }
            sampleIndex += this.MicroBufferSize * 2;
        }
        AlphaSynth.Platform.TypeUtils.ClearIntArray(this._midiEventCounts);
    },
    NoteOn: function (channel, note, velocity){
        // Get the correct instrument depending if it is a drum or not
        var sChan = this._synthChannels[channel];
        var inst = this.SoundBank.GetPatchByNumber(sChan.BankSelect, sChan.Program);
        if (inst == null)
            return;
        // A NoteOn can trigger multiple voices via layers
        var layerCount;
        if (true){
            layerCount = (inst).FindPatches(channel, note, velocity, this._layerList);
        }
        else {
            layerCount = 1;
            this._layerList[0] = inst;
        }
        // If a key with the same note value exists, stop it
        if (this._voiceManager.Registry[channel][note] != null){
            var node = this._voiceManager.Registry[channel][note];
            while (node != null){
                node.Value.Stop();
                node = node.Next;
            }
            this._voiceManager.RemoveFromRegistry(channel, note);
        }
        // Check exclusive groups
        for (var x = 0; x < layerCount; x++){
            var notseen = true;
            for (var i = x - 1; i >= 0; i--){
                if (this._layerList[x].ExclusiveGroupTarget == this._layerList[i].ExclusiveGroupTarget){
                    notseen = false;
                    break;
                }
            }
            if (this._layerList[x].ExclusiveGroupTarget != 0 && notseen){
                var node = this._voiceManager.ActiveVoices.First;
                while (node != null){
                    if (this._layerList[x].ExclusiveGroupTarget == node.Value.Patch.ExclusiveGroup){
                        node.Value.Stop();
                        this._voiceManager.RemoveVoiceFromRegistry(node.Value);
                    }
                    node = node.get_Next();
                }
            }
        }
        // Assign a voice to each layer
        for (var x = 0; x < layerCount; x++){
            var voice = this._voiceManager.GetFreeVoice();
            if (voice == null)
                break;
            voice.Configure(channel, note, velocity, this._layerList[x], this._synthChannels[channel]);
            this._voiceManager.AddToRegistry(voice);
            this._voiceManager.ActiveVoices.AddLast(voice);
            voice.Start();
        }
        // Clear layer list
        for (var x = 0; x < layerCount; x++)
            this._layerList[x] = null;
    },
    NoteOff: function (channel, note){
        if (this._synthChannels[channel].HoldPedal){
            var node = this._voiceManager.Registry[channel][note];
            while (node != null){
                node.Value.VoiceParams.NoteOffPending = true;
                node = node.Next;
            }
        }
        else {
            var node = this._voiceManager.Registry[channel][note];
            while (node != null){
                node.Value.Stop();
                node = node.Next;
            }
            this._voiceManager.RemoveFromRegistry(channel, note);
        }
    },
    NoteOffAll: function (immediate){
        var node = this._voiceManager.ActiveVoices.First;
        if (immediate){
            //if immediate ignore hold pedals and clear the entire registry
            this._voiceManager.ClearRegistry();
            while (node != null){
                node.Value.StopImmediately();
                var delnode = node;
                node = node.get_Next();
                this._voiceManager.ActiveVoices.Remove(delnode);
                this._voiceManager.FreeVoices.AddFirst(delnode.Value);
            }
        }
        else {
            //otherwise we have to check for hold pedals and double check the registry before removing the voice
            while (node != null){
                var voiceParams = node.Value.VoiceParams;
                if (voiceParams.State == AlphaSynth.Synthesis.VoiceStateEnum.Playing){
                    //if hold pedal is enabled do not stop the voice
                    if (this._synthChannels[voiceParams.Channel].HoldPedal){
                        voiceParams.NoteOffPending = true;
                    }
                    else {
                        node.Value.Stop();
                        this._voiceManager.RemoveVoiceFromRegistry(node.Value);
                    }
                }
                node = node.get_Next();
            }
        }
    },
    NoteOffAllChannel: function (channel, immediate){
        var node = this._voiceManager.ActiveVoices.First;
        while (node != null){
            if (channel == node.Value.VoiceParams.Channel){
                if (immediate){
                    node.Value.StopImmediately();
                    var delnode = node;
                    node = node.get_Next();
                    this._voiceManager.ActiveVoices.Remove(delnode);
                    this._voiceManager.FreeVoices.AddFirst(delnode.Value);
                }
                else {
                    //if hold pedal is enabled do not stop the voice
                    if (this._synthChannels[channel].HoldPedal)
                        node.Value.VoiceParams.NoteOffPending = true;
                    else
                        node.Value.Stop();
                    node = node.get_Next();
                }
            }
        }
    },
    ProcessMidiMessage: function (e){
        var command = e.get_Command();
        var channel = e.get_Channel();
        var data1 = e.get_Data1();
        var data2 = e.get_Data2();
        switch (command){
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteOff:
                this.NoteOff(channel, data1);
                break;
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteOn:
                if (data2 == 0)
                this.NoteOff(channel, data1);
                else
                this.NoteOn(channel, data1, data2);
                break;
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.NoteAftertouch:
                break;
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.Controller:
                switch (data1){
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.BankSelectCoarse:
                    if (channel == 9)
                    data2 += 128;
                    if (this.SoundBank.IsBankLoaded(data2))
                    this._synthChannels[channel].BankSelect = data2;
                    else
                    this._synthChannels[channel].BankSelect = ((channel == 9) ? 128 : 0);
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.ModulationCoarse:
                    this._synthChannels[channel].ModRange.set_Coarse(data2);
                    this._synthChannels[channel].UpdateCurrentMod();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.ModulationFine:
                    this._synthChannels[channel].ModRange.set_Fine(data2);
                    this._synthChannels[channel].UpdateCurrentMod();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.VolumeCoarse:
                    this._synthChannels[channel].Volume.set_Coarse(data2);
                    this._synthChannels[channel].UpdateCurrentVolumeFromVolume();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.VolumeFine:
                    this._synthChannels[channel].Volume.set_Fine(data2);
                    this._synthChannels[channel].UpdateCurrentVolumeFromVolume();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.PanCoarse:
                    this._synthChannels[channel].Pan.set_Coarse(data2);
                    this._synthChannels[channel].UpdateCurrentPan();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.PanFine:
                    this._synthChannels[channel].Pan.set_Fine(data2);
                    this._synthChannels[channel].UpdateCurrentPan();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.ExpressionControllerCoarse:
                    this._synthChannels[channel].Expression.set_Coarse(data2);
                    this._synthChannels[channel].UpdateCurrentVolumeFromExpression();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.ExpressionControllerFine:
                    this._synthChannels[channel].Expression.set_Fine(data2);
                    this._synthChannels[channel].UpdateCurrentVolumeFromExpression();
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.HoldPedal:
                    if (this._synthChannels[channel].HoldPedal && !(data2 > 63))
                    this.ReleaseHoldPedal(channel);
                    this._synthChannels[channel].HoldPedal = data2 > 63;
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.LegatoPedal:
                    this._synthChannels[channel].LegatoPedal = data2 > 63;
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.NonRegisteredParameterCourse:
                    this._synthChannels[channel].Rpn.set_Combined(16383);
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.NonRegisteredParameterFine:
                    this._synthChannels[channel].Rpn.set_Combined(16383);
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.RegisteredParameterCourse:
                    this._synthChannels[channel].Rpn.set_Coarse(data2);
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.RegisteredParameterFine:
                    this._synthChannels[channel].Rpn.set_Fine(data2);
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.AllNotesOff:
                    this.NoteOffAll(false);
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.DataEntryCoarse:
                    switch (this._synthChannels[channel].Rpn.get_Combined()){
                        case 0:
                        this._synthChannels[channel].PitchBendRangeCoarse = data2;
                        this._synthChannels[channel].UpdateCurrentPitch();
                        break;
                        case 1:
                        this._synthChannels[channel].MasterFineTune.set_Coarse(data2);
                        break;
                        case 2:
                        this._synthChannels[channel].MasterCoarseTune = ((data2 - 64)) | 0;
                        break;
                    }
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.DataEntryFine:
                    switch (this._synthChannels[channel].Rpn.get_Combined()){
                        case 0:
                        this._synthChannels[channel].PitchBendRangeFine = data2;
                        this._synthChannels[channel].UpdateCurrentPitch();
                        break;
                        case 1:
                        this._synthChannels[channel].MasterFineTune.set_Fine(data2);
                        break;
                    }
                    break;
                    case AlphaSynth.Midi.Event.ControllerTypeEnum.ResetControllers:
                    this._synthChannels[channel].Expression.set_Combined(16383);
                    this._synthChannels[channel].ModRange.set_Combined(0);
                    if (this._synthChannels[channel].HoldPedal)
                    this.ReleaseHoldPedal(channel);
                    this._synthChannels[channel].HoldPedal = false;
                    this._synthChannels[channel].LegatoPedal = false;
                    this._synthChannels[channel].Rpn.set_Combined(16383);
                    this._synthChannels[channel].PitchBend.set_Combined(8192);
                    this._synthChannels[channel].ChannelAfterTouch = 0;
                    this._synthChannels[channel].UpdateCurrentPitch();
                    this._synthChannels[channel].UpdateCurrentVolumeFromExpression();
                    break;
                    default:
                    return;
                }
                break;
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.ProgramChange:
                this._synthChannels[channel].Program = data1;
                break;
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.ChannelAftertouch:
                this._synthChannels[channel].ChannelAfterTouch = data2;
                break;
            case AlphaSynth.Midi.Event.MidiEventTypeEnum.PitchBend:
                this._synthChannels[channel].PitchBend.set_Coarse(data2);
                this._synthChannels[channel].PitchBend.set_Fine(data1);
                this._synthChannels[channel].UpdateCurrentPitch();
                break;
        }
        this.OnMidiEventProcessed(e);
    },
    add_MidiEventProcessed: function (value){
        this.MidiEventProcessed = $CombineDelegates(this.MidiEventProcessed, value);
    },
    remove_MidiEventProcessed: function (value){
        this.MidiEventProcessed = $RemoveDelegate(this.MidiEventProcessed, value);
    },
    OnMidiEventProcessed: function (e){
        var handler = this.MidiEventProcessed;
        if (handler != null){
            handler(e);
        }
    },
    ReleaseAllHoldPedals: function (){
        var node = this._voiceManager.ActiveVoices.First;
        while (node != null){
            if (node.Value.VoiceParams.NoteOffPending){
                node.Value.Stop();
                this._voiceManager.RemoveVoiceFromRegistry(node.Value);
            }
            node = node.get_Next();
        }
    },
    ReleaseHoldPedal: function (channel){
        var node = this._voiceManager.ActiveVoices.First;
        while (node != null){
            if (node.Value.VoiceParams.Channel == channel && node.Value.VoiceParams.NoteOffPending){
                node.Value.Stop();
                this._voiceManager.RemoveVoiceFromRegistry(node.Value);
            }
            node = node.get_Next();
        }
    },
    DispatchEvent: function (i, synthEvent){
        this._midiEventQueue.AddFirst(synthEvent);
        this._midiEventCounts[i]++;
    },
    SetChannelMute: function (channel, mute){
        if (mute){
            this._mutedChannels[channel] = true;
        }
        else {
            delete this._mutedChannels[channel];
        }
    },
    ResetChannelStates: function (){
        this._mutedChannels = {};
        this._soloChannels = {};
        this._isAnySolo = false;
    },
    SetChannelSolo: function (channel, solo){
        if (solo){
            this._soloChannels[channel] = true;
        }
        else {
            delete this._soloChannels[channel];
        }
        this._isAnySolo = Object.keys(this._soloChannels).length > 0;
    },
    SetChannelProgram: function (channel, program){
        if (channel < 0 || channel >= this._synthChannels.length)
            return;
        this._synthChannels[channel].Program = program;
    },
    SetChannelVolume: function (channel, volume){
        if (channel < 0 || channel >= this._synthChannels.length)
            return;
        this._synthChannels[channel].MixVolume = volume;
    }
};
AlphaSynth.Util.PcmData = function (bits, pcmData, isDataInLittleEndianFormat){
    this.Data = null;
    this.Length = 0;
    this.BytesPerSample = 0;
    this.BytesPerSample = ((bits / 8) | 0);
    //if (pcmData.Length % BytesPerSample != 0)
    //    throw new Exception("Invalid PCM format. The PCM data was an invalid size.");
    this.Data = pcmData;
    this.Length = (this.Data.length / this.BytesPerSample) | 0;
    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian != isDataInLittleEndianFormat){
        AlphaSynth.Util.WaveHelper.SwapEndianess(this.Data, bits);
    }
};
AlphaSynth.Util.PcmData.prototype = {
    get_BitsPerSample: function (){
        return this.BytesPerSample * 8;
    }
};
AlphaSynth.Util.PcmData.Create = function (bits, pcmData, isDataInLittleEndianFormat){
    switch (bits){
        case 8:
            return new AlphaSynth.Util.PcmData8Bit(bits, pcmData, isDataInLittleEndianFormat);
        case 16:
            return new AlphaSynth.Util.PcmData16Bit(bits, pcmData, isDataInLittleEndianFormat);
        case 24:
            return new AlphaSynth.Util.PcmData24Bit(bits, pcmData, isDataInLittleEndianFormat);
        case 32:
            return new AlphaSynth.Util.PcmData32Bit(bits, pcmData, isDataInLittleEndianFormat);
        default:
            throw $CreateException(new System.Exception.ctor$$String("Invalid PCM format. " + bits + "bit pcm data is not supported."), new Error());
    }
};
AlphaSynth.Util.PcmData8Bit = function (bits, pcmData, isDataInLittleEndianFormat){
    AlphaSynth.Util.PcmData.call(this, bits, pcmData, isDataInLittleEndianFormat);
};
AlphaSynth.Util.PcmData8Bit.prototype = {
    get_Item: function (index){
        return ((this.Data[index] / 255) * 2) - 1;
    }
};
$Inherit(AlphaSynth.Util.PcmData8Bit, AlphaSynth.Util.PcmData);
AlphaSynth.Util.PcmData16Bit = function (bits, pcmData, isDataInLittleEndianFormat){
    AlphaSynth.Util.PcmData.call(this, bits, pcmData, isDataInLittleEndianFormat);
};
AlphaSynth.Util.PcmData16Bit.prototype = {
    get_Item: function (index){
        index *= 2;
        return (((this.Data[index] | (this.Data[index + 1] << 8)) << 16) >> 16) / 32768;
    }
};
$Inherit(AlphaSynth.Util.PcmData16Bit, AlphaSynth.Util.PcmData);
AlphaSynth.Util.PcmData24Bit = function (bits, pcmData, isDataInLittleEndianFormat){
    AlphaSynth.Util.PcmData.call(this, bits, pcmData, isDataInLittleEndianFormat);
};
AlphaSynth.Util.PcmData24Bit.prototype = {
    get_Item: function (index){
        index *= 3;
        return (((this.Data[index] | (this.Data[index + 1] << 8) | (this.Data[index + 2] << 16)) << 12) >> 12) / 8388608;
    }
};
$Inherit(AlphaSynth.Util.PcmData24Bit, AlphaSynth.Util.PcmData);
AlphaSynth.Util.PcmData32Bit = function (bits, pcmData, isDataInLittleEndianFormat){
    AlphaSynth.Util.PcmData.call(this, bits, pcmData, isDataInLittleEndianFormat);
};
AlphaSynth.Util.PcmData32Bit.prototype = {
    get_Item: function (index){
        index *= 4;
        return (this.Data[index] | (this.Data[index + 1] << 8) | (this.Data[index + 2] << 16) | (this.Data[index + 3] << 24)) / 2.147484E+09;
    }
};
$Inherit(AlphaSynth.Util.PcmData32Bit, AlphaSynth.Util.PcmData);
AlphaSynth.Util.Tables = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Util.Tables._isInitialized = false;
    AlphaSynth.Util.Tables._envelopeTables = null;
    AlphaSynth.Util.Tables._semitoneTable = null;
    AlphaSynth.Util.Tables._centTable = null;
    AlphaSynth.Util.Tables._sincTable = null;
});
AlphaSynth.Util.Tables.EnvelopeTables = function (index){
    if (!AlphaSynth.Util.Tables._isInitialized)
        AlphaSynth.Util.Tables.Init();
    return AlphaSynth.Util.Tables._envelopeTables[index];
};
AlphaSynth.Util.Tables.SemitoneTable = function (index){
    if (!AlphaSynth.Util.Tables._isInitialized)
        AlphaSynth.Util.Tables.Init();
    return AlphaSynth.Util.Tables._semitoneTable[index];
};
AlphaSynth.Util.Tables.CentTable = function (index){
    if (!AlphaSynth.Util.Tables._isInitialized)
        AlphaSynth.Util.Tables.Init();
    return AlphaSynth.Util.Tables._centTable[index];
};
AlphaSynth.Util.Tables.SincTable = function (index){
    if (!AlphaSynth.Util.Tables._isInitialized)
        AlphaSynth.Util.Tables.Init();
    return AlphaSynth.Util.Tables._sincTable[index];
};
AlphaSynth.Util.Tables.Init = function (){
    var EnvelopeSize = 64;
    var ExponentialCoeff = 0.09;
    AlphaSynth.Util.Tables._envelopeTables = new Array(4);
    AlphaSynth.Util.Tables._envelopeTables[0] = (AlphaSynth.Util.Tables.RemoveDenormals(AlphaSynth.Util.Tables.CreateSustainTable(EnvelopeSize)));
    AlphaSynth.Util.Tables._envelopeTables[1] = (AlphaSynth.Util.Tables.RemoveDenormals(AlphaSynth.Util.Tables.CreateLinearTable(EnvelopeSize)));
    AlphaSynth.Util.Tables._envelopeTables[2] = (AlphaSynth.Util.Tables.RemoveDenormals(AlphaSynth.Util.Tables.CreateExponentialTable(EnvelopeSize, ExponentialCoeff)));
    AlphaSynth.Util.Tables._envelopeTables[3] = (AlphaSynth.Util.Tables.RemoveDenormals(AlphaSynth.Util.Tables.CreateSineTable(EnvelopeSize)));
    AlphaSynth.Util.Tables._centTable = AlphaSynth.Util.Tables.CreateCentTable();
    AlphaSynth.Util.Tables._semitoneTable = AlphaSynth.Util.Tables.CreateSemitoneTable();
    AlphaSynth.Util.Tables._sincTable = AlphaSynth.Util.Tables.CreateSincTable(16, 64, 0.43, AlphaSynth.Util.Tables.HammingWindow);
    AlphaSynth.Util.Tables._isInitialized = true;
};
AlphaSynth.Util.Tables.CreateSquareTable = function (size, k){
    //Uses Fourier Expansion up to k terms 
    var FourOverPi = 1.27323954473516;
    var squaretable = new Float32Array(size);
    var inc = 1 / size;
    var phase = 0;
    for (var x = 0; x < size; x++){
        var value = 0;
        for (var i = 1; i < k + 1; i++){
            var twokminus1 = (2 * i) - 1;
            value += Math.sin(6.28318530717958 * (twokminus1) * phase) / (twokminus1);
        }
        squaretable[x] = AlphaSynth.Synthesis.SynthHelper.ClampF((FourOverPi * value), -1, 1);
        phase += inc;
    }
    return squaretable;
};
AlphaSynth.Util.Tables.CreateCentTable = function (){
    //-100 to 100 cents
    var cents = new Float32Array(201);
    for (var x = 0; x < cents.length; x++){
        cents[x] = Math.pow(2, (x - 100) / 1200);
    }
    return cents;
};
AlphaSynth.Util.Tables.CreateSemitoneTable = function (){
    //-127 to 127 semitones
    var table = new Float32Array(255);
    for (var x = 0; x < table.length; x++){
        table[x] = Math.pow(2, (x - 127) / 12);
    }
    return table;
};
AlphaSynth.Util.Tables.CreateSustainTable = function (size){
    var table = new Float32Array(size);
    for (var x = 0; x < size; x++){
        table[x] = 1;
    }
    return table;
};
AlphaSynth.Util.Tables.CreateLinearTable = function (size){
    var table = new Float32Array(size);
    for (var x = 0; x < size; x++){
        table[x] = x / (size - 1);
    }
    return table;
};
AlphaSynth.Util.Tables.CreateExponentialTable = function (size, coeff){
    coeff = AlphaSynth.Synthesis.SynthHelper.ClampF(coeff, 0.001, 0.9);
    var graph = new Float32Array(size);
    var val = 0;
    for (var x = 0; x < size; x++){
        graph[x] = val;
        val += coeff * ((1.58730158730159) - val);
    }
    for (var x = 0; x < size; x++){
        graph[x] = graph[x] / graph[graph.length - 1];
    }
    return graph;
};
AlphaSynth.Util.Tables.CreateSineTable = function (size){
    var graph = new Float32Array(size);
    var inc = 4.712389 / (size - 1);
    var phase = 0;
    for (var x = 0; x < size; x++){
        graph[x] = Math.abs(Math.sin(phase));
        phase += inc;
    }
    return graph;
};
AlphaSynth.Util.Tables.RemoveDenormals = function (data){
    for (var x = 0; x < data.length; x++){
        if (Math.abs(data[x]) < 1E-38)
            data[x] = 0;
    }
    return data;
};
AlphaSynth.Util.Tables.VonHannWindow = function (i, size){
    return (0.5 - 0.5 * Math.cos(6.28318530717958 * (0.5 + i / size)));
};
AlphaSynth.Util.Tables.HammingWindow = function (i, size){
    return (0.54 - 0.46 * Math.cos(6.28318530717958 * i / size));
};
AlphaSynth.Util.Tables.BlackmanWindow = function (i, size){
    return (0.42659 - 0.49656 * Math.cos(6.28318530717958 * i / size) + 0.076849 * Math.cos(12.5663706143592 * i / size));
};
AlphaSynth.Util.Tables.CreateSincTable = function (windowSize, resolution, cornerRatio, windowFunction){
    var subWindow = (((windowSize / 2) | 0) + 1);
    var table = new Float32Array((subWindow * resolution));
    var gain = 2 * cornerRatio;
    for (var x = 0; x < subWindow; x++){
        for (var y = 0; y < resolution; y++){
            var a = x + (y / (resolution));
            var sinc = 6.28318530717958 * cornerRatio * a;
            if (Math.abs(sinc) > 1E-05)
                sinc = Math.sin(sinc) / sinc;
            else
                sinc = 1;
            table[x * 64 + y] = (gain * sinc * windowFunction(a, windowSize));
        }
    }
    return table;
};
AlphaSynth.Util.SynthConstants = function (){
};
$StaticConstructor(function (){
    AlphaSynth.Util.SynthConstants.InterpolationMode = AlphaSynth.Bank.Components.Generators.Interpolation.Linear;
    AlphaSynth.Util.SynthConstants.AudioChannels = 2;
    AlphaSynth.Util.SynthConstants.Pi = 3.14159265358979;
    AlphaSynth.Util.SynthConstants.TwoPi = 6.28318530717958;
    AlphaSynth.Util.SynthConstants.HalfPi = 1.5707963267949;
    AlphaSynth.Util.SynthConstants.InverseSqrtOfTwo = 0.707106781186;
    AlphaSynth.Util.SynthConstants.DefaultLfoFrequency = 8;
    AlphaSynth.Util.SynthConstants.DefaultModDepth = 100;
    AlphaSynth.Util.SynthConstants.DefaultPolyphony = 40;
    AlphaSynth.Util.SynthConstants.MinPolyphony = 5;
    AlphaSynth.Util.SynthConstants.MaxPolyphony = 250;
    AlphaSynth.Util.SynthConstants.DefaultBlockSize = 64;
    AlphaSynth.Util.SynthConstants.MaxBufferSize = 0.05;
    AlphaSynth.Util.SynthConstants.MinBufferSize = 0.001;
    AlphaSynth.Util.SynthConstants.DenormLimit = 1E-38;
    AlphaSynth.Util.SynthConstants.NonAudible = 1E-05;
    AlphaSynth.Util.SynthConstants.SincWidth = 16;
    AlphaSynth.Util.SynthConstants.SincResolution = 64;
    AlphaSynth.Util.SynthConstants.MaxVoiceComponents = 4;
    AlphaSynth.Util.SynthConstants.DefaultChannelCount = 16;
    AlphaSynth.Util.SynthConstants.DefaultKeyCount = 128;
    AlphaSynth.Util.SynthConstants.DefaultMixGain = 0.35;
    AlphaSynth.Util.SynthConstants.MinVolume = 0;
    AlphaSynth.Util.SynthConstants.MaxVolume = 10;
    AlphaSynth.Util.SynthConstants.MinProgram = 0;
    AlphaSynth.Util.SynthConstants.MaxProgram = 127;
    AlphaSynth.Util.SynthConstants.MinPlaybackSpeed = 0.125;
    AlphaSynth.Util.SynthConstants.MaxPlaybackSpeed = 8;
});
AlphaSynth.Util.IOHelper = function (){
};
AlphaSynth.Util.IOHelper.ReadInt32LE = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    var ch3 = input.ReadByte();
    var ch4 = input.ReadByte();
    return ((ch4 << 24) | (ch3 << 16) | (ch2 << 8) | (ch1 << 0));
};
AlphaSynth.Util.IOHelper.ReadUInt16LE = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    return ((ch2 << 8) | (ch1 << 0)&65535);
};
AlphaSynth.Util.IOHelper.ReadInt16LE = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    return AlphaSynth.Platform.TypeUtils.ToInt16((ch2 << 8) | (ch1 << 0));
};
AlphaSynth.Util.IOHelper.ReadInt32BE = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    var ch3 = input.ReadByte();
    var ch4 = input.ReadByte();
    return ((ch1 << 24) | (ch2 << 16) | (ch3 << 8) | (ch4 << 0));
};
AlphaSynth.Util.IOHelper.ReadUInt16BE = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    return ((ch1 << 8) | (ch2 << 0)&65535);
};
AlphaSynth.Util.IOHelper.ReadInt16BE = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    return AlphaSynth.Platform.TypeUtils.ToInt16((ch1 << 8) | (ch2 << 0));
};
AlphaSynth.Util.IOHelper.ReadByteArray = function (input, length){
    var v = new Uint8Array(length);
    input.Read(v, 0, length);
    return v;
};
AlphaSynth.Util.IOHelper.Read8BitChars = function (input, length){
    var s = new Array();
    for (var i = 0; i < length; i++){
        s.push(String.fromCharCode(input.ReadByte()));
    }
    return s.join('');
};
AlphaSynth.Util.IOHelper.Read8BitString = function (input){
    var s = new Array();
    var c = input.ReadByte();
    while (c != 0){
        s.push(String.fromCharCode(c));
        c = input.ReadByte();
    }
    return s.join('');
};
AlphaSynth.Util.IOHelper.Read8BitStringLength = function (input, length){
    var s = new Array();
    var z = -1;
    for (var i = 0; i < length; i++){
        var c = input.ReadByte();
        if (c == 0 && z == -1)
            z = i;
        s.push(String.fromCharCode(c));
    }
    var t = s.join('');
    if (z >= 0)
        return t.substr(0, z);
    return t;
};
AlphaSynth.Util.IOHelper.ReadSInt8 = function (input){
    var v = input.ReadByte();
    return ((((v & 255) >> 7) * (-256)) + (v & 255));
};
AlphaSynth.Util.IOHelper.ReadUInt32 = function (input){
    var ch1 = input.ReadByte();
    var ch2 = input.ReadByte();
    var ch3 = input.ReadByte();
    var ch4 = input.ReadByte();
    return (ch1 << 24) | (ch2 << 16) | (ch3 << 8) | (ch4 << 0);
};
AlphaSynth.Util.IOHelper.ReadInt24 = function (input, index){
    var i;
    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
        i = input[index] | (input[index + 1] << 8) | (input[index + 2] << 16);
        if ((i & 8388608) == 8388608)
            i = i | (-16777216);
    }
    else {
        i = (input[index] << 16) | (input[index + 1] << 8) | input[index + 2];
        if ((i & 256) == 256)
            i = i | 255;
    }
    return i;
};
AlphaSynth.Util.IOHelper.ReadInt16 = function (input, index){
    if (AlphaSynth.Platform.TypeUtils.IsLittleEndian){
        return AlphaSynth.Platform.TypeUtils.ToInt16(input[index] | (input[index + 1] << 8));
    }
    else {
        return AlphaSynth.Platform.TypeUtils.ToInt16((input[index] << 8) | input[index + 1]);
    }
};
AlphaSynth.Util.WaveHelper = function (){
};
AlphaSynth.Util.WaveHelper.SwapEndianess = function (data, bits){
    bits /= 8;
    //get bytes per sample
    var swapArray = new Uint8Array(bits);
    for (var x = 0; x < data.length; x += bits){
        swapArray.set(data.subarray(x,x+bits),0);
        AlphaSynth.Platform.Std.Reverse(swapArray);
        data.set(swapArray.subarray(0,0+bits),x);
    }
};

for(var i = 0; i < $StaticConstructors.length; i++) {
    $StaticConstructors[i]();
}


