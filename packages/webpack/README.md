# alphaTab WebPack Plugin

This is the plugin for bundling [alphaTab](https://alphatab.net/) correctly in your WebPack powered projects.

alphaTab internally off-loads some work to background workers to not block the browser while rendering or generating audio. These background workers are realized through Web Workers and Audio Worklets. This plugin ensures WebPack correctly bundles alphaTab by: 

* Ensures the Web Font (Bravura) and the SoundFont (SONiVOX) shipped with alphaTab are copied to the build output and made available through <root>/font/ and <root>/soundfont/ of your application.
* Ensures Web Workers and Audio Worklets are correctly configured and working.

See https://alphatab.net/docs/getting-started/installation-webpack for more details.