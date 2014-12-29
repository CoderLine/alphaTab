self.onmessage = function(e) {
    if(e.data.cmd == "playerReady") {
        importScripts(e.data.root + "AlphaSynth.js");
        //debugger;
        new AlphaSynth.Main.AlphaSynthWebWorker(self);
    }
}