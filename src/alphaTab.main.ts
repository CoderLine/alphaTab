export * from './alphaTab.core';
import * as alphaTab from './alphaTab.core';

alphaTab.Environment.initializeMain(
    settings => {
        if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.NodeJs) {
            throw new alphaTab.AlphaTabError(alphaTab.AlphaTabErrorType.General, "Workers not yet supported in Node.js");
        }

        if (alphaTab.Environment.isWebPackBundled) {
            // WebPack currently requires this exact syntax: new Worker(new URL(..., import.meta.url)))
            // The module `@coderline/alphatab` will be resolved by WebPack to alphaTab consumed as library
            // this will not work with CDNs because worker start scripts need to have the same origin like
            // the current browser. 

            // https://github.com/webpack/webpack/discussions/14066

            return new Worker(
                /* webpackChunkName: "alphatab.worker" */ new URL('./alphaTab.worker', import.meta.url)
            );
        }
        else if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.BrowserModule) {
            return new Worker(new URL('./alphaTab.worker', import.meta.url), { type: 'module' }
            );
        }

        // classical browser entry point
        if (!settings.core.scriptFile) {
            throw new alphaTab.AlphaTabError(alphaTab.AlphaTabErrorType.General, "Could not detect alphaTab script file, cannot initialize renderer");
        }

        try {
            const script: string = `importScripts('${settings.core.scriptFile}')`;
            const blob: Blob = new Blob([script]);
            return new Worker(URL.createObjectURL(blob));
        }
        catch (e) {
            alphaTab.Logger.warning('Rendering', 'Could not create inline worker, fallback to normal worker');
            return new Worker(settings.core.scriptFile!);
        }
    },

    (context, settings) => {
        if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.NodeJs) {
            throw new alphaTab.AlphaTabError(alphaTab.AlphaTabErrorType.General, "Audio Worklets not yet supported in Node.js");
        }

        if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.BrowserModule ||
            alphaTab.Environment.isWebPackBundled) {
            // WebPack currently requires this exact syntax: new Worker(new URL(..., import.meta.url)))
            // The module `@coderline/alphatab` will be resolved by WebPack to alphaTab consumed as library
            // this will not work with CDNs because worker start scripts need to have the same origin like
            // the current browser. 

            // https://github.com/webpack/webpack/discussions/14066

            // TODO: webpack compatibility
            return context.audioWorklet.addModule(new URL('./alphaTab.worklet', import.meta.url));
        }

        return context.audioWorklet.addModule(settings.core.scriptFile!);
    }
);