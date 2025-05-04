/**@target web */
export * from '@src/alphaTab.core';
import * as alphaTab from '@src/alphaTab.core';

if (alphaTab.Environment.isRunningInWorker) {
    alphaTab.Environment.initializeWorker();
} else if (alphaTab.Environment.isRunningInAudioWorklet) {
    alphaTab.Environment.initializeAudioWorklet();
} else {
    alphaTab.Environment.initializeMain(
        settings => {
            if (alphaTab.Environment.webPlatform === alphaTab.WebPlatform.NodeJs) {
                throw new alphaTab.AlphaTabError(
                    alphaTab.AlphaTabErrorType.General,
                    'Workers not yet supported in Node.js'
                );
            }

            if (
                alphaTab.Environment.webPlatform === alphaTab.WebPlatform.BrowserModule ||
                alphaTab.Environment.isWebPackBundled ||
                alphaTab.Environment.isViteBundled
            ) {
                alphaTab.Logger.debug('AlphaTab', 'Creating webworker');
                try {
                    return new alphaTab.Environment.alphaTabWorker(
                        new alphaTab.Environment.alphaTabUrl('./alphaTab.worker.ts', import.meta.url),
                        {
                            type: 'module'
                        }
                    );
                } catch (e) {
                    alphaTab.Logger.debug('AlphaTab', 'ESM webworker construction with direct URL failed', e);
                    // continue with fallbacks
                }

                // fallback to blob worker with ESM URL
                let workerUrl: URL | string = '';
                try {
                    // Note: prevent bundlers to copy worker as asset via alphaTabUrl
                    workerUrl = new alphaTab.Environment.alphaTabUrl('./alphaTab.worker.ts', import.meta.url);
                    const script: string = `import ${JSON.stringify(workerUrl)}`;
                    const blob: Blob = new Blob([script], {
                        type: 'application/javascript'
                    });
                    return new Worker(URL.createObjectURL(blob), {
                        type: 'module'
                    });
                } catch (e) {
                    alphaTab.Logger.debug(
                        'AlphaTab',
                        'ESM webworker construction with blob import failed',
                        workerUrl,
                        e
                    );
                }

                // fallback to worker with configurable fallback URL
                try {
                    // Note: prevent bundlers to copy worker as asset
                    if (!settings.core.scriptFile) {
                        throw new Error('Could not detect alphaTab script file');
                    }
                    workerUrl = settings.core.scriptFile;
                    const script: string = `import ${JSON.stringify(settings.core.scriptFile)}`;
                    const blob: Blob = new Blob([script], {
                        type: 'application/javascript'
                    });
                    return new Worker(URL.createObjectURL(blob), {
                        type: 'module'
                    });
                } catch (e) {
                    alphaTab.Logger.debug(
                        'AlphaTab',
                        'ESM webworker construction with blob import failed',
                        settings.core.scriptFile,
                        e
                    );
                }
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
                const blob: Blob = new Blob([script], {
                    type: 'application/javascript'
                });
                return new Worker(URL.createObjectURL(blob));
            } catch (e) {
                alphaTab.Logger.warning('Rendering', 'Could not create inline worker, fallback to normal worker');
                return new Worker(settings.core.scriptFile!);
            }
        },

        (context, settings) => {
            if (alphaTab.Environment.webPlatform === alphaTab.WebPlatform.NodeJs) {
                throw new alphaTab.AlphaTabError(
                    alphaTab.AlphaTabErrorType.General,
                    'Audio Worklets not yet supported in Node.js'
                );
            }

            if (
                alphaTab.Environment.webPlatform === alphaTab.WebPlatform.BrowserModule ||
                alphaTab.Environment.isWebPackBundled ||
                alphaTab.Environment.isViteBundled
            ) {
                alphaTab.Logger.debug('AlphaTab', 'Creating Module worklet');
                const alphaTabWorklet = context.audioWorklet; // this name triggers the WebPack Plugin
                return alphaTabWorklet.addModule(
                    new alphaTab.Environment.alphaTabUrl('./alphaTab.worklet.ts', import.meta.url)
                );
            }

            alphaTab.Logger.debug('AlphaTab', 'Creating Script worklet');
            return context.audioWorklet.addModule(settings.core.scriptFile!);
        }
    );
}
