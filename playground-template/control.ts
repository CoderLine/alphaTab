import * as alphaTab from '../src/alphaTab.main';
import Handlebars from 'handlebars';
import * as bootstrap from 'bootstrap';

const toDomElement = (() => {
    const parser = document.createElement('div');
    return (html: string) => {
        parser.innerHTML = html;
        return parser.firstElementChild as HTMLElement;
    };
})();

const params = new URL(window.location.href).searchParams;

const defaultSettings = {
    core: {
        logLevel: (params.get('loglevel') ?? 'info') as alphaTab.json.CoreSettingsJson['logLevel'],
        file: '/test-data/audio/full-song.gp5',
        fontDirectory: '/font/bravura/'
    },
    player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        scrollOffsetX: -10,
        soundFont: '/font/sonivox/sonivox.sf2'
    }
} satisfies alphaTab.json.SettingsJson;

function applyFonts(settings: alphaTab.Settings) {
    settings.display.resources.copyrightFont.families = ['Noto Sans'];
    settings.display.resources.titleFont.families = ['Noto Serif'];
    settings.display.resources.subTitleFont.families = ['Noto Serif'];
    settings.display.resources.wordsFont.families = ['Noto Serif'];
    settings.display.resources.effectFont.families = ['Noto Serif'];
    settings.display.resources.timerFont.families = ['Noto Serif'];
    settings.display.resources.fretboardNumberFont.families = ['Noto Sans'];
    settings.display.resources.tablatureFont.families = ['Noto Sans'];
    settings.display.resources.graceFont.families = ['Noto Sans'];
    settings.display.resources.barNumberFont.families = ['Noto Sans'];
    settings.display.resources.fingeringFont.families = ['Noto Serif'];
    settings.display.resources.inlineFingeringFont.families = ['Noto Serif'];
    settings.display.resources.markerFont.families = ['Noto Serif'];
    settings.display.resources.directionsFont.families = ['Noto Serif'];
    settings.display.resources.numberedNotationFont.families = ['Noto Sans'];
    settings.display.resources.numberedNotationGraceFont.families = ['Noto Sans'];
}

type HTMLElementWithTrack = HTMLElement & {
    track: alphaTab.model.Track;
};

function createTrackItem(
    at: alphaTab.AlphaTabApi,
    track: alphaTab.model.Track,
    trackSelection: Map<number, alphaTab.model.Track>
) {
    const trackTemplate = Handlebars.compile(document.querySelector('#at-track-template')!.innerHTML);
    const trackItem = toDomElement(trackTemplate(track)) as HTMLElementWithTrack;

    // init track controls
    const muteButton = trackItem.querySelector<HTMLButtonElement>('.at-track-mute')!;
    const soloButton = trackItem.querySelector<HTMLButtonElement>('.at-track-solo')!;
    const volumeSlider = trackItem.querySelector<HTMLInputElement>('.at-track-volume')!;

    muteButton.onclick = e => {
        e.stopPropagation();
        muteButton.classList.toggle('active');
        at.changeTrackMute([track], muteButton.classList.contains('active'));
    };

    soloButton.onclick = e => {
        e.stopPropagation();
        soloButton.classList.toggle('active');
        at.changeTrackSolo([track], soloButton.classList.contains('active'));
    };

    volumeSlider.oninput = e => {
        e.preventDefault();
        // Here we need to do some math to map the 1-16 slider to the
        // volume in alphaTab. In alphaTab it is 1.0 for 100% which is
        // equal to the volume in the track information
        at.changeTrackVolume([track], volumeSlider.valueAsNumber / track.playbackInfo.volume);
    };

    volumeSlider.onclick = e => {
        e.stopPropagation();
    };

    trackItem.onclick = e => {
        e.stopPropagation();
        if (!e.ctrlKey) {
            trackSelection.clear();
            trackSelection.set(track.index, track);
        } else if (trackSelection.has(track.index)) {
            trackSelection.delete(track.index);
        } else {
            trackSelection.set(track.index, track);
        }
        at.renderTracks(Array.from(trackSelection.values()).sort(t => t.index));
    };

    volumeSlider.valueAsNumber = track.playbackInfo.volume;

    trackItem.track = track;
    return trackItem;
}

let backingTrackScore: alphaTab.model.Score | null;
let backingTrackAudioElement!: HTMLAudioElement;
let waveForm!: HTMLDivElement;
let waveFormCursor!: HTMLDivElement;

function updateWaveFormCursor() {
    if (waveFormCursor) {
        waveFormCursor.style.left = `${(backingTrackAudioElement.currentTime / backingTrackAudioElement.duration) * 100}%`;
    }
}

function hideBackingTrack() {
    if (backingTrackAudioElement) {
        backingTrackAudioElement.removeEventListener('timeupdate', updateWaveFormCursor);
        backingTrackAudioElement.removeEventListener('durationchange', updateWaveFormCursor);
        backingTrackAudioElement.removeEventListener('seeked', updateWaveFormCursor);
    }
    if (waveForm) {
        waveForm.classList.add('d-none');
    }
}

async function showBackingTrack(at: alphaTab.AlphaTabApi) {
    if (!at.score!.backingTrack) {
        hideBackingTrack();
        return;
    }

    if (!waveForm) {
        waveForm = document.querySelector<HTMLDivElement>('.at-waveform')!;
        waveForm.onclick = e => {
            const percent = e.offsetX / waveForm.offsetWidth;
            if (backingTrackAudioElement) {
                backingTrackAudioElement.currentTime = backingTrackAudioElement.duration * percent;
            }
        };
        waveFormCursor = waveForm.querySelector<HTMLDivElement>('.at-waveform-cursor')!;
    }

    const audioElement = (at.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput).audioElement;
    if (audioElement !== backingTrackAudioElement) {
        backingTrackAudioElement = audioElement;
        audioElement.addEventListener('timeupdate', updateWaveFormCursor);
        audioElement.addEventListener('durationchange', updateWaveFormCursor);
        audioElement.addEventListener('seeked', updateWaveFormCursor);
        updateWaveFormCursor();
    }

    const score = at.score;
    if (score === backingTrackScore) {
        return;
    }
    backingTrackScore = at.score;

    const audioContext = new AudioContext();
    const rawData = await audioContext.decodeAudioData(structuredClone(at.score!.backingTrack.rawAudioFile!.buffer));

    const topChannel = rawData.getChannelData(0);
    const bottomChannel = rawData.numberOfChannels > 1 ? rawData.getChannelData(1) : topChannel;
    const length = topChannel.length;

    waveForm.classList.remove('d-none');

    const canvas = document.querySelector<HTMLCanvasElement>('.at-waveform canvas') ?? document.createElement('canvas');
    const width = waveForm.offsetWidth;
    const height = 80;
    canvas.width = width;
    canvas.height = height;
    waveForm.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;

    const pixelRatio = window.devicePixelRatio;
    const halfHeight = height / 2;

    const barWidth = 2 * pixelRatio;
    const barGap = 1 * pixelRatio;
    const barIndexScale = width / (barWidth + barGap) / length;

    ctx.beginPath();

    let prevX = 0;
    let maxTop = 0;
    let maxBottom = 0;
    for (let i = 0; i <= length; i++) {
        const x = Math.round(i * barIndexScale);

        if (x > prevX) {
            const topBarHeight = Math.round(maxTop * halfHeight);
            const bottomBarHeight = Math.round(maxBottom * halfHeight);
            const barHeight = topBarHeight + bottomBarHeight || 1;

            ctx.roundRect(prevX * (barWidth + barGap), halfHeight - topBarHeight, barWidth, barHeight, 2);

            prevX = x;
            maxTop = 0;
            maxBottom = 0;
        }

        const magnitudeTop = Math.abs(topChannel[i] || 0);
        const magnitudeBottom = Math.abs(bottomChannel[i] || 0);
        if (magnitudeTop > maxTop) {
            maxTop = magnitudeTop;
        }
        if (magnitudeBottom > maxBottom) {
            maxBottom = magnitudeBottom;
        }
    }

    ctx.fillStyle = '#436d9d';
    ctx.fill();
}

function updateBackingTrack(at: alphaTab.AlphaTabApi) {
    switch (at.actualPlayerMode) {
        case alphaTab.PlayerMode.Disabled:
        case alphaTab.PlayerMode.EnabledSynthesizer:
        case alphaTab.PlayerMode.EnabledExternalMedia:
            hideBackingTrack();
            break;
        case alphaTab.PlayerMode.EnabledBackingTrack:
            showBackingTrack(at);
            break;
    }
}

export function setupControl(selector: string, customSettings: alphaTab.json.SettingsJson) {
    const el = document.querySelector<HTMLElement>(selector)!;
    const control = el.closest<HTMLDivElement>('.at-wrap')!;

    const viewPort = control.querySelector<HTMLDivElement>('.at-viewport')!;

    const settings = new alphaTab.Settings();
    applyFonts(settings);
    settings.fillFromJson(defaultSettings);
    settings.fillFromJson({
        player: {
            scrollElement: viewPort
        }
    });
    settings.fillFromJson(customSettings);

    const at = new alphaTab.AlphaTabApi(el, settings);
    at.error.on(e => {
        console.error('alphaTab error', e);
    });

    el.ondragover = e => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'link';
    };

    el.ondrop = e => {
        e.stopPropagation();
        e.preventDefault();
        const files = e.dataTransfer!.files;
        if (files.length === 1) {
            const reader = new FileReader();
            reader.onload = data => {
                at.load(data.target!.result, [0]);
            };
            reader.readAsArrayBuffer(files[0]);
        }
        console.log('drop', files);
    };

    const tracks = new Map();
    const trackItems: HTMLElementWithTrack[] = [];
    at.renderStarted.on(isResize => {
        if (!isResize) {
            control.classList.add('loading');
        }

        tracks.clear();
        for (const t of at.tracks) {
            tracks.set(t.index, t);
        }

        for (const trackItem of trackItems) {
            if (tracks.has(trackItem.track.index)) {
                trackItem.classList.add('active');
            } else {
                trackItem.classList.remove('active');
            }
        }
    });

    const playerLoadingIndicator = control.querySelector<HTMLElement>('.at-player-loading')!;
    at.soundFontLoad.on(args => {
        updateProgress(playerLoadingIndicator, args.loaded / args.total);
    });
    at.soundFontLoaded.on(() => {
        playerLoadingIndicator.classList.add('d-none');
    });
    at.renderFinished.on(() => {
        control.classList.remove('loading');
    });

    at.scoreLoaded.on(score => {
        control.querySelector<HTMLElement>('.at-song-title')!.innerText = score.title;
        control.querySelector<HTMLElement>('.at-song-artist')!.innerText = score.artist;

        // fill track selector
        const trackList = control.querySelector<HTMLElement>('.at-track-list')!;
        trackList.innerHTML = '';

        for (const track of score.tracks) {
            const trackItem = createTrackItem(at, track, tracks);
            trackItems.push(trackItem);
            trackList.appendChild(trackItem);
        }

        updateBackingTrack(at);
    });

    const timePositionLabel = control.querySelector<HTMLElement>('.at-time-position')!;
    const timeSliderValue = control.querySelector<HTMLElement>('.at-time-slider-value')!;

    const timeSlider = control.querySelector<HTMLInputElement>('.at-time-slider')!;
    let songTimeInfo: alphaTab.synth.PositionChangedEventArgs | null = null;
    timeSlider.onclick = e => {
        const percent = e.offsetX / timeSlider.offsetWidth;
        if (songTimeInfo) {
            at.timePosition = Math.floor(songTimeInfo.endTime * percent);
        }
    };
    at.midiLoaded.on(e => {
        songTimeInfo = e;
    });

    function formatDuration(milliseconds: number) {
        let seconds = milliseconds / 1000;
        const minutes = (seconds / 60) | 0;
        seconds = (seconds - minutes * 60) | 0;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    let previousTime = -1;
    at.playerPositionChanged.on(args => {
        // reduce number of UI updates to second changes.
        const currentSeconds = (args.currentTime / 1000) | 0;
        if (currentSeconds === previousTime) {
            return;
        }
        previousTime = currentSeconds;

        timePositionLabel.innerText = `${formatDuration(args.currentTime)} / ${formatDuration(args.endTime)}`;
        timeSliderValue.style.width = `${((args.currentTime / args.endTime) * 100).toFixed(2)}%`;
    });

    const playPauseButton = control.querySelector<HTMLButtonElement>('.at-play-pause')!;
    at.playerReady.on(() => {
        for (const c of control.querySelectorAll('.at-player .disabled')) {
            c.classList.remove('disabled');
        }

        updateBackingTrack(at);
    });

    at.playerStateChanged.on(args => {
        const icon = playPauseButton.querySelector('i')!;
        if (args.state === 0) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
    });

    playPauseButton.onclick = e => {
        e.stopPropagation();
        if (!playPauseButton.classList.contains('disabled')) {
            at.playPause();
        }
    };

    control.querySelector<HTMLButtonElement>('.at-stop')!.onclick = e => {
        e.stopPropagation();
        if (!(e.target as HTMLButtonElement).classList.contains('disabled')) {
            at.stop();
        }
    };

    control.querySelector<HTMLButtonElement>('.at-metronome')!.onclick = e => {
        e.stopPropagation();
        const link = (e.target as HTMLElement).closest('a')!;
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.metronomeVolume = 1;
        } else {
            at.metronomeVolume = 0;
        }
    };

    control.querySelector<HTMLElement>('.at-count-in')!.onclick = e => {
        e.stopPropagation();
        const link = (e.target as HTMLElement).closest('a')!;
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.countInVolume = 1;
        } else {
            at.countInVolume = 0;
        }
    };

    function createOutputDeviceItem(device: alphaTab.synth.ISynthOutputDevice) {
        const item = document.createElement('a');
        item.classList.add('dropdown-item');
        item.href = '#';
        item.onclick = async () => {
            await at.setOutputDevice(device);
        };
        item.innerText = device.label + (device.isDefault ? ' (default)' : '');
        return item;
    }

    control.querySelector('.at-output-device')!.addEventListener('show.bs.dropdown', async () => {
        const devices = await at.enumerateOutputDevices();
        if (devices.length === 0) {
            return;
        }

        const list = control.querySelector('.at-output-device .dropdown-menu')!;
        list.innerHTML = '';
        for (const d of devices) {
            const item = createOutputDeviceItem(d);
            list.appendChild(item);
        }
    });

    for (const a of control.querySelectorAll<HTMLAnchorElement>('.at-speed-options a')) {
        a.onclick = e => {
            e.preventDefault();
            at.playbackSpeed = Number.parseFloat((e.target as HTMLAnchorElement).innerText);
            control.querySelector<HTMLElement>('.at-speed-label')!.innerText = (
                e.target as HTMLAnchorElement
            ).innerText;
        };
    }

    control.querySelector<HTMLButtonElement>('.at-loop')!.onclick = e => {
        e.stopPropagation();
        const link = (e.target as HTMLButtonElement).closest('a')!;
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.isLooping = true;
        } else {
            at.isLooping = false;
        }
    };

    control.querySelector<HTMLButtonElement>('.at-print')!.onclick = () => {
        at.print();
    };

    control.querySelector<HTMLButtonElement>('.at-download')!.onclick = () => {
        const exporter = new alphaTab.exporter.Gp7Exporter();
        const data = exporter.export(at.score!, at.settings);
        const a = document.createElement('a');
        a.download = at.score!.title.length > 0 ? `${at.score!.title}.gp` : 'song.gp';
        a.href = URL.createObjectURL(new Blob([data]));
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    control.querySelector<HTMLButtonElement>('.at-download-audio')!.onclick = async () => {
        const exportOptions = new alphaTab.synth.AudioExportOptions();
        exportOptions.sampleRate = 44100;

        // use settings as configured currently
        exportOptions.masterVolume = at.masterVolume;
        exportOptions.metronomeVolume = at.metronomeVolume;
        if (at.playbackRange) {
            exportOptions.playbackRange = at.playbackRange;
        }

        const trackList = control.querySelectorAll<HTMLElementWithTrack>('.at-track-list .at-track');

        const soloTracks = new Set();
        for (const t of trackList) {
            const trackIndex = t.track.index;
            const volumeSlider = t.querySelector<HTMLInputElement>('.at-track-volume')!;
            exportOptions.trackVolume.set(trackIndex, volumeSlider.valueAsNumber / t.track.playbackInfo.volume);

            const muteButton = t.querySelector<HTMLButtonElement>('.at-track-mute')!;
            if (muteButton.classList.contains('active')) {
                exportOptions.trackVolume.set(trackIndex, 0);
            }

            const soloButton = t.querySelector<HTMLButtonElement>('.at-track-solo')!;
            if (soloButton.classList.contains('active')) {
                soloTracks.add(trackIndex);
            }
        }

        if (soloTracks.size > 0) {
            for (const t of at.score!.tracks) {
                if (!soloTracks.has(t.index)) {
                    exportOptions.trackVolume.set(t.index, 0);
                }
            }
        }

        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open('GET', defaultSettings.player.soundFont, true);
            xhr.onload = () => {
                exportOptions.soundFonts = [new Uint8Array(xhr.response)];
                resolve();
            };
            xhr.onerror = e => {
                reject(e);
            };
            xhr.send();
        });

        const exporter = await at.exportAudio(exportOptions);
        let generated: Float32Array | undefined = undefined;
        try {
            let chunk: alphaTab.synth.AudioExportChunk | undefined;
            let totalSamples = 0;

            while (true) {
                chunk = await exporter.render(500);
                if (chunk === undefined) {
                    break;
                }

                if (generated === undefined) {
                    generated = new Float32Array(exportOptions.sampleRate * (chunk.endTime / 1000) * 2 /* Stereo */);
                }

                const neededSize = totalSamples + chunk.samples.length;
                if (generated.length < neededSize) {
                    const needed = neededSize - generated.length;
                    const newBuffer:Float32Array = new Float32Array(generated.length + needed);
                    newBuffer.set(generated, 0);
                    generated = newBuffer;
                }

                generated!.set(chunk.samples, totalSamples);
                totalSamples += chunk.samples.length;
            }

            if (generated && totalSamples < generated.length) {
                generated = generated.subarray(0, totalSamples);
            }
        } finally {
            exporter.destroy();
        }

        if (generated) {
            const a = document.createElement('a');
            a.download =
                at.score!.title.length > 0
                    ? `${at.score!.title}_${exportOptions.sampleRate}_float32.pcm`
                    : `song_${exportOptions.sampleRate}_float32.pcm`;
            a.href = URL.createObjectURL(
                new Blob([new Uint8Array(generated.buffer, generated.byteOffset, generated.byteLength)])
            );
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    for (const a of control.querySelectorAll<HTMLAnchorElement>('.at-zoom-options a')) {
        a.onclick = e => {
            e.preventDefault();
            at.settings.display.scale = Number.parseInt((e.target as HTMLAnchorElement).innerText) / 100.0;
            control.querySelector<HTMLElement>('.at-zoom-label')!.innerText = (e.target as HTMLAnchorElement).innerText;
            at.updateSettings();
            at.render();
        };
    }

    for (const a of control.querySelectorAll<HTMLAnchorElement>('.at-layout-options a')) {
        a.onclick = e => {
            e.preventDefault();
            const settings = at.settings;
            switch ((e.target as HTMLAnchorElement).dataset.layout) {
                case 'page':
                    settings.display.layoutMode = alphaTab.LayoutMode.Page;
                    settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
                    break;
                case 'horizontal-bar':
                    settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
                    settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
                    break;
                case 'horizontal-screen':
                    settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
                    settings.player.scrollMode = alphaTab.ScrollMode.OffScreen;
                    break;
            }

            at.updateSettings();
            at.render();
        };
    }

    for (const t of control.querySelectorAll('[data-toggle="tooltip"]')) {
        new bootstrap.Tooltip(t);
    }

    return at;
}

function percentageToDegrees(percentage: number) {
    return (percentage / 100) * 360;
}

function updateProgress(el: HTMLElement, value: number) {
    value = value * 100;
    const left = el.querySelector<HTMLElement>('.progress-left .progress-bar')!;
    const right = el.querySelector<HTMLElement>('.progress-right .progress-bar')!;

    if (value > 0) {
        if (value <= 50) {
            right.style.transform = `rotate(${percentageToDegrees(value)}deg)`;
        } else {
            right.style.transform = 'rotate(180deg)';
            left.style.transform = `rotate(${percentageToDegrees(value - 50)}deg)`;
        }
    }
    el.querySelector<HTMLElement>('.progress-value-number')!.innerText = String(value | 0);
}
