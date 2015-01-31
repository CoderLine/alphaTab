self.onmessage = function(e) {
    if(e.data.cmd == "initialize") {
        importScripts(e.data.root + "AlphaTab.js");
        new AlphaTab.Platform.JavaScript.JsWorker(self, e.data.settings);
    }
}