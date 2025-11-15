import * as alphaTab from '@coderline/alphatab';
import type { SettingsJson } from '@src/generated/SettingsJson';

export type AlphaTexPreviewMessages =
    | {
          command: 'alphatab-vscode.commands.refreshPreview';
          alphaTex: string;
          documentUri: string;
      }
    | {
          command: 'alphatab-vscode.commands.previewInitialized';
      };

export type AlphaTabConfig = {
    soundfont: string;
    bravura: string;
};

export type AlphaTexPreviewState = {
    config: AlphaTabConfig;
    documentUri: string;
};

const vscode = (globalThis as any).acquireVsCodeApi?.();

async function initMain() {
    const style = document.createElement('style');
    style.innerText = `
    .at-cursor-bar {
        background: var(--vscode-focusBorder);
        opacity: 0.2
    }

    .at-selection div {
        background: var(--vscode-editor-selectionBackground);
        opacity: 0.4
    }

    .at-cursor-beat {
        background: var(--vscode-focusBorder);
        width: 3px;
    }

    .at-highlight * {
        fill: var(--vscode-focusBorder);
        stroke: var(--vscode-focusBorder);
    }

    .playPause {
        position: absolute;
        top: 1rem;
        right: 1rem;
        opacity: 0;
        z-index: 10000;
        transition: .2s ease-in-out;
        font-size: 24px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);

        padding: 0.2rem 1rem;
        border-radius: 2px;
        border: 1px solid var(--vscode-button-border, transparent);

        display: flex;
        align-content: center;
        justify-content: center;
    }

     .playPause:hover {
        background: var(--vscode-button-hoverBackground);
     }

    body:hover .playPause {
        opacity: 1;
    }
    `;
    document.head.appendChild(style);

    // adjust worker/worklet creation
    alphaTab.Environment.initializeMain(
        settings => {
            try {
                const script: string = `importScripts('${settings.core.scriptFile}')`;
                const blob: Blob = new Blob([script], {
                    type: 'application/javascript'
                });
                return new Worker(URL.createObjectURL(blob));
            } catch {
                return new Worker(settings.core.scriptFile!);
            }
        },
        (context, settings) => {
            return context.audioWorklet.addModule(settings.core.scriptFile!);
        }
    );

    const config: AlphaTabConfig = (window as any).alphaTabConfig;

    const at = document.createElement('div');
    document.body.appendChild(at);

    const computedStyle = window.getComputedStyle(at);

    document.getElementById('initializing')?.remove();

    const mainGlyphColor = alphaTab.model.Color.fromJson(computedStyle.getPropertyValue('--vscode-foreground'))!;
    const sansFont = alphaTab.model.Font.fromJson(`12px ${computedStyle.getPropertyValue('--vscode-font-family')}`)!;
    const serifFont = alphaTab.model.Font.fromJson(`12px ${computedStyle.getPropertyValue('--vscode-font-family')}`)!;

    console.trace('Initializing alphaTab');

    const api = new alphaTab.AlphaTabApi(at, {
        player: {
            playerMode: 'EnabledAutomatic',
            enableCursor: true,
            soundFont: config.soundfont
        },
        core: {
            smuflFontSources: new Map<alphaTab.FontFileFormat, string>([
                [alphaTab.FontFileFormat.Woff2, config.bravura]
            ])
        },
        display: {
            scale: 1.2,
            resources: {
                mainGlyphColor: mainGlyphColor,
                secondaryGlyphColor: new alphaTab.model.Color(
                    mainGlyphColor.r,
                    mainGlyphColor.g,
                    mainGlyphColor.b,
                    0.4
                ),
                // TODO: check for good theme colors or add extension settings?
                staffLineColor: mainGlyphColor,
                barSeparatorColor: mainGlyphColor,
                barNumberColor: computedStyle.getPropertyValue('--vscode-focusBorder'),
                scoreInfoColor: mainGlyphColor
            }
        }
    } satisfies SettingsJson);

    api.settings.display.resources.copyrightFont.families = sansFont.families;
    api.settings.display.resources.titleFont.families = serifFont.families;
    api.settings.display.resources.subTitleFont.families = serifFont.families;
    api.settings.display.resources.wordsFont.families = sansFont.families;
    api.settings.display.resources.effectFont.families = serifFont.families;
    api.settings.display.resources.timerFont.families = serifFont.families;
    api.settings.display.resources.directionsFont.families = serifFont.families;
    api.settings.display.resources.fretboardNumberFont.families = sansFont.families;
    api.settings.display.resources.numberedNotationFont.families = sansFont.families;
    api.settings.display.resources.numberedNotationGraceFont.families = sansFont.families;
    api.settings.display.resources.tablatureFont.families = sansFont.families;
    api.settings.display.resources.graceFont.families = sansFont.families;
    api.settings.display.resources.barNumberFont.families = sansFont.families;

    const playPause = document.createElement('button');
    playPause.type = 'button';
    playPause.classList.add('playPause');
    playPause.innerText = '▶';
    document.body.appendChild(playPause);
    playPause.onclick = () => {
        api.playPause();
    };
    api.playerStateChanged.on(e => {
        switch (e.state) {
            case alphaTab.synth.PlayerState.Paused:
                playPause.innerText = '▶';
                break;
            case alphaTab.synth.PlayerState.Playing:
                playPause.innerText = '⏸';
                break;
        }
    });

    window.addEventListener('message', e => {
        console.trace('Received message', e.data);
        const message: AlphaTexPreviewMessages = e.data;
        switch (message.command) {
            case 'alphatab-vscode.commands.refreshPreview':
                try {
                    api.tex(message.alphaTex);
                    if (vscode) {
                        vscode.setState({
                            config: config,
                            documentUri: message.documentUri
                        } satisfies AlphaTexPreviewState);
                    }
                } catch {
                    // ignore
                }
                break;
        }
    });


    vscode?.postMessage({ command: 'alphatab-vscode.commands.previewInitialized' } satisfies AlphaTexPreviewMessages);
}

if (!alphaTab.Environment.isRunningInWorker && !alphaTab.Environment.isRunningInAudioWorklet) {
    initMain();
}
