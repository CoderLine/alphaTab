/**@target web */
export * from '@coderline/alphatab/alphaTab.core';
import * as alphaTab from '@coderline/alphatab/alphaTab.core';

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
                    // the standard form bundlers (webpack, Rspack, Vite, Parcel) turn into a worker entry
                    return new Worker(new URL('./alphaTab.worker.ts', import.meta.url), {
                        type: 'module'
                    });
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
            } catch {
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
                // Bundlers create the worklet entry from the `*alphaTabWorklet.addModule()` syntax
                // (configured by @coderline/alphatab-webpack, or by the user); the binding name is
                // that contract, and the destructuring keeps it through Rolldown's inlining.
                const { audioWorklet: alphaTabWorklet } = createWorkletContext(context);
                return alphaTabWorklet.addModule(new URL('./alphaTab.worklet.ts', import.meta.url));
            }

            alphaTab.Logger.debug('AlphaTab', 'Creating Script worklet');
            return context.audioWorklet.addModule(settings.core.scriptFile!);
        }
    );
}

// The `audioWorklet` of an AudioContext, with `addModule` preloading the bundler chunks a
// worklet entry needs (see addAudioWorkletModule).
function createWorkletContext(context: AudioContext) {
    return {
        audioWorklet: {
            addModule: (moduleUrl: URL | string) => addAudioWorkletModule(context, moduleUrl)
        }
    };
}

/**
 * Loads an alphaTab worklet module. With webpack-style classic chunk output, the worklet entry
 * needs the chunks it shares with the page (alphaTab's core) in its scope first; the bundler
 * runtime lists them via `__webpack_require__.atwm` (provided by @coderline/alphatab-webpack).
 * An AudioWorkletGlobalScope has no `self`, `location` or `importScripts`, which those chunks
 * expect, so a shim module provides them before the chunks are added.
 */
async function addAudioWorkletModule(context: AudioContext, moduleUrl: URL | string): Promise<void> {
    let preload: string[] = [];
    try {
        // @ts-expect-error
        if (typeof __webpack_require__ === 'function' && typeof __webpack_require__.atwm === 'function') {
            // @ts-expect-error
            preload = __webpack_require__.atwm(String(moduleUrl));
        }
    } catch {
        // not bundled with webpack-style chunks
    }

    if (preload.length > 0) {
        const shim = [
            'globalThis.self = globalThis.self || globalThis;',
            `globalThis.location = ${JSON.stringify(document.baseURI)};`,
            'globalThis.importScripts = () => { throw new Error("importScripts is not available in an AudioWorkletGlobalScope"); };'
        ].join('\n');
        await context.audioWorklet.addModule(
            URL.createObjectURL(new Blob([shim], { type: 'application/javascript' }))
        );
        for (const chunkUrl of preload) {
            await context.audioWorklet.addModule(chunkUrl);
        }
    }

    await context.audioWorklet.addModule(moduleUrl);
}
