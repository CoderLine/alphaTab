/**@target web */
export * from './alphaTab.core';
import * as alphaTab from './alphaTab.core';

if (alphaTab.Environment.isRunningInWorker) {
    alphaTab.Environment.initializeWorker();
} else if (alphaTab.Environment.isRunningInAudioWorklet) {
    alphaTab.Environment.initializeAudioWorklet();
} else {
    alphaTab.Environment.initializeMain(
        settings => {
            if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.NodeJs) {
                throw new alphaTab.AlphaTabError(
                    alphaTab.AlphaTabErrorType.General,
                    'Workers not yet supported in Node.js'
                );
            }

	        if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.BrowserModule || alphaTab.Environment.isWebPackBundled) {
	            alphaTab.Logger.debug("AlphaTab", "Creating webworker");
	            return new alphaTab.Environment.alphaTabWorker(new URL('./alphaTab.worker', import.meta.url), { type: 'module' });
	        }

            // classical browser entry point
            if (!settings.core.scriptFile) {
                throw new alphaTab.AlphaTabError(
                    alphaTab.AlphaTabErrorType.General,
                    'Could not detect alphaTab script file, cannot initialize renderer'
                );
            }

            try {
                alphaTab.Logger.debug('AlphaTab', 'Creating Blob worker');
                const script: string = `importScripts('${settings.core.scriptFile}')`;
                const blob: Blob = new Blob([script]);
                return new Worker(URL.createObjectURL(blob));
            } catch (e) {
                alphaTab.Logger.warning('Rendering', 'Could not create inline worker, fallback to normal worker');
                return new Worker(settings.core.scriptFile!);
            }
        },

        (context, settings) => {
            if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.NodeJs) {
                throw new alphaTab.AlphaTabError(
                    alphaTab.AlphaTabErrorType.General,
                    'Audio Worklets not yet supported in Node.js'
                );
            }

	        if (alphaTab.Environment.webPlatform == alphaTab.WebPlatform.BrowserModule || alphaTab.Environment.isWebPackBundled) {
	            alphaTab.Logger.debug("AlphaTab", "Creating Module worklet");
	            const alphaTabWorklet = context.audioWorklet; // this name triggers the WebPack Plugin
	            return alphaTabWorklet.addModule(new URL('./alphaTab.worklet', import.meta.url));
	        }

            alphaTab.Logger.debug('AlphaTab', 'Creating Script worklet');
            return context.audioWorklet.addModule(settings.core.scriptFile!);
        }
    );
}
