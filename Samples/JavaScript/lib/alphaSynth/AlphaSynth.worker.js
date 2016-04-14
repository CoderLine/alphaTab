self.onmessage = function(e) {
    if(e.data.cmd == "playerReady") {
        importScripts(e.data.root + "alphaSynth.js");
        AlphaSynth.Player.WebWorkerOutput.PreferredSampleRate = e.data.sampleRate;
        //debugger;
        new AlphaSynth.Main.AlphaSynthWebWorker(self);
    }
}