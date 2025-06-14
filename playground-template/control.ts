import * as alphaTab from '../src/alphaTab.main';

const toDomElement = (function () {
    const parser = document.createElement('div');
    return function (html) {
        parser.innerHTML = html;
        return parser.firstElementChild;
    };
})();

const params = new URL(window.location.href).searchParams;

const defaultSettings = {
    core: {
        logLevel: params.get('loglevel') ?? 'info',
        file: '/test-data/audio/full-song.gp5',
        fontDirectory: '/font/bravura/'
    },
    player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        scrollOffsetX: -10,
        soundFont: '/font/sonivox/sonivox.sf2'
    }
};

function applyFonts(settings) {
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

function createTrackItem(track, trackSelection) {
    const trackTemplate = Handlebars.compile(document.querySelector('#at-track-template').innerHTML);
    const trackItem = toDomElement(trackTemplate(track));

    // init track controls
    const muteButton = trackItem.querySelector('.at-track-mute');
    const soloButton = trackItem.querySelector('.at-track-solo');
    const volumeSlider = trackItem.querySelector('.at-track-volume');

    muteButton.onclick = function (e) {
        e.stopPropagation();
        muteButton.classList.toggle('active');
        at.changeTrackMute([track], muteButton.classList.contains('active'));
    };

    soloButton.onclick = function (e) {
        e.stopPropagation();
        soloButton.classList.toggle('active');
        at.changeTrackSolo([track], soloButton.classList.contains('active'));
    };

    volumeSlider.oninput = function (e) {
        e.preventDefault();
        // Here we need to do some math to map the 1-16 slider to the
        // volume in alphaTab. In alphaTab it is 1.0 for 100% which is
        // equal to the volume in the track information
        at.changeTrackVolume([track], volumeSlider.value / track.playbackInfo.volume);
    };

    volumeSlider.onclick = function (e) {
        e.stopPropagation();
    };

    trackItem.onclick = function (e) {
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

    muteButton.value = track.playbackInfo.isMute;
    soloButton.value = track.playbackInfo.isSolo;
    volumeSlider.value = track.playbackInfo.volume;

    trackItem.track = track;
    return trackItem;
}

let backingTrackScore = null;
let backingTrackAudioElement = null;
let waveForm = null;
let waveFormCursor = null;
window.onload = ()=>{
    waveForm = document.querySelector('.at-waveform');
    waveFormCursor = waveForm.querySelector('.at-waveform-cursor');
    waveForm.onclick = (e)=>{
        const percent = e.offsetX / waveForm.offsetWidth;
        if(backingTrackAudioElement) {
            backingTrackAudioElement.currentTime = backingTrackAudioElement.duration * percent;
        }
    };
}

function updateWaveFormCursor(){
    if(waveFormCursor) {
        waveFormCursor.style.left = ((backingTrackAudioElement.currentTime / backingTrackAudioElement.duration) * 100) + '%';
    }
};

function hideBackingTrack(at) {
    if(backingTrackAudioElement) {
        backingTrackAudioElement.removeEventListener('timeupdate', updateWaveFormCursor);
        backingTrackAudioElement.removeEventListener('durationchange', updateWaveFormCursor);
        backingTrackAudioElement.removeEventListener('seeked', updateWaveFormCursor);
    }
    const waveForm = document.querySelector('.at-waveform');
    waveForm.classList.add('d-none');
}


async function showBackingTrack(at) {
    if(!at.score.backingTrack) {
        hideBackingTrack();
        return;
    }

    const audioElement = at.player.output.audioElement;
    if(audioElement !== backingTrackAudioElement) {
        backingTrackAudioElement = audioElement;
        audioElement.addEventListener('timeupdate', updateWaveFormCursor);
        audioElement.addEventListener('durationchange', updateWaveFormCursor);
        audioElement.addEventListener('seeked', updateWaveFormCursor);
        updateWaveFormCursor();
    }

    const score = at.score;
    if(score === backingTrackScore) {
        return;
    }
    backingTrackScore = at.score;

    const audioContext = new AudioContext();
    const rawData = await audioContext.decodeAudioData(
        structuredClone(at.score.backingTrack.rawAudioFile.buffer)
    );

    const topChannel = rawData.getChannelData(0);
    const bottomChannel = rawData.numberOfChannels > 1 ? rawData.getChannelData(1) : topChannel;
    const length = topChannel.length

    waveForm.classList.remove('d-none');

    const canvas = document.querySelector('.at-waveform canvas') ?? document.createElement('canvas');
    const width = waveForm.offsetWidth;
    const height = 80;
    canvas.width = width;
    canvas.height = height;
    waveForm.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio;
    const halfHeight = height / 2;

    const barWidth = 2 * pixelRatio;
    const barGap = 1 * pixelRatio;
    const barIndexScale = width / (barWidth + barGap) / length

    ctx.beginPath();

    let prevX = 0
    let maxTop = 0
    let maxBottom = 0
    for (let i = 0; i <= length; i++) {
        const x = Math.round(i * barIndexScale)

        if (x > prevX) {
            const topBarHeight = Math.round(maxTop * halfHeight)
            const bottomBarHeight = Math.round(maxBottom * halfHeight)
            const barHeight = topBarHeight + bottomBarHeight || 1

            ctx.roundRect(prevX * (barWidth + barGap), halfHeight - topBarHeight, barWidth, barHeight, 2)

            prevX = x
            maxTop = 0
            maxBottom = 0
        }

        const magnitudeTop = Math.abs(topChannel[i] || 0)
        const magnitudeBottom = Math.abs(bottomChannel[i] || 0)
        if (magnitudeTop > maxTop) maxTop = magnitudeTop
        if (magnitudeBottom > maxBottom) maxBottom = magnitudeBottom
    }

    ctx.fillStyle = '#436d9d'  
    ctx.fill()
}

function updateBackingTrack(at) {
    switch(at.actualPlayerMode) {
        case alphaTab.PlayerMode.Disabled:
        case alphaTab.PlayerMode.EnabledSynthesizer:
        case alphaTab.PlayerMode.EnabledExternalMedia:
            hideBackingTrack(at);
            break;
        case alphaTab.PlayerMode.EnabledBackingTrack:
            showBackingTrack(at);
            break;
    }
}

export function setupControl(selector, customSettings) {
    const el = document.querySelector(selector);
    const control = el.closest('.at-wrap');

    const viewPort =
        'playerScrollelement' in el.dataset ? el.dataset.playerScrollelement : control.querySelector('.at-viewport');

    const settings = new alphaTab.Settings();
    applyFonts(settings);
    settings.fillFromJson(defaultSettings);
    settings.fillFromJson({
        player: {
            scrollElement: viewPort
        },
    });
    settings.fillFromJson(customSettings);

    const at = new alphaTab.AlphaTabApi(el, settings);
    at.error.on(function (e) {
        console.error('alphaTab error', e);
    });

    el.ondragover = function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'link';
    };

    el.ondrop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length === 1) {
            const reader = new FileReader();
            reader.onload = function (data) {
                at.load(data.target.result, [0]);
            };
            reader.readAsArrayBuffer(files[0]);
        }
        console.log('drop', files);
    };

    const tracks = new Map();
    const trackItems = [];
    at.renderStarted.on(function (isResize) {
        if (!isResize) {
            control.classList.add('loading');
        }

        tracks.clear();
        at.tracks.forEach(function (t) {
            tracks.set(t.index, t);
        });

        trackItems.forEach(function (trackItem) {
            if (tracks.has(trackItem.track.index)) {
                trackItem.classList.add('active');
            } else {
                trackItem.classList.remove('active');
            }
        });
    });

    const playerLoadingIndicator = control.querySelector('.at-player-loading');
    at.soundFontLoad.on(function (args) {
        updateProgress(playerLoadingIndicator, args.loaded / args.total);
    });
    at.soundFontLoaded.on(function () {
        playerLoadingIndicator.classList.add('d-none');
    });
    at.renderFinished.on(function () {
        control.classList.remove('loading');
    });

    at.scoreLoaded.on(function (score) {
        control.querySelector('.at-song-title').innerText = score.title;
        control.querySelector('.at-song-artist').innerText = score.artist;

        // fill track selector
        const trackList = control.querySelector('.at-track-list');
        trackList.innerHTML = '';

        score.tracks.forEach(function (track) {
            const trackItem = createTrackItem(track, tracks);
            trackItems.push(trackItem);
            trackList.appendChild(trackItem);
        });

        updateBackingTrack(at);
    });

    const timePositionLabel = control.querySelector('.at-time-position');
    const timeSliderValue = control.querySelector('.at-time-slider-value');

    const timeSlider = control.querySelector('.at-time-slider');
    let songTimeInfo = null;
    timeSlider.onclick = (e)=>{
        const percent = e.offsetX / timeSlider.offsetWidth;
        if(songTimeInfo) {
            at.timePosition = Math.floor(songTimeInfo.endTime * percent); 
        }
    };
    at.midiLoaded.on(e => { songTimeInfo = e; });

    

    function formatDuration(milliseconds) {
        let seconds = milliseconds / 1000;
        const minutes = (seconds / 60) | 0;
        seconds = (seconds - minutes * 60) | 0;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    let previousTime = -1;
    at.playerPositionChanged.on(function (args) {
        // reduce number of UI updates to second changes.
        const currentSeconds = (args.currentTime / 1000) | 0;
        if (currentSeconds == previousTime) {
            return;
        }
        previousTime = currentSeconds;

        timePositionLabel.innerText = formatDuration(args.currentTime) + ' / ' + formatDuration(args.endTime);
        timeSliderValue.style.width = ((args.currentTime / args.endTime) * 100).toFixed(2) + '%';
    });

    const playPauseButton = control.querySelector('.at-play-pause');
    at.playerReady.on(function () {
        control.querySelectorAll('.at-player .disabled').forEach(function (c) {
            c.classList.remove('disabled');
        });

        updateBackingTrack(at);
    });

    at.playerStateChanged.on(function (args) {
        const icon = playPauseButton.querySelector('i');
        if (args.state == 0) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
    });

    playPauseButton.onclick = function (e) {
        e.stopPropagation();
        if (!e.target.classList.contains('disabled')) {
            at.playPause();
        }
    };

    control.querySelector('.at-stop').onclick = function (e) {
        e.stopPropagation();
        if (!e.target.classList.contains('disabled')) {
            at.stop();
        }
    };

    control.querySelector('.at-metronome').onclick = function (e) {
        e.stopPropagation();
        const link = e.target.closest('a');
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.metronomeVolume = 1;
        } else {
            at.metronomeVolume = 0;
        }
    };

    control.querySelector('.at-count-in').onclick = function (e) {
        e.stopPropagation();
        const link = e.target.closest('a');
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.countInVolume = 1;
        } else {
            at.countInVolume = 0;
        }
    };

    function createOutputDeviceItem(device) {
        const item = document.createElement('a');
        item.classList.add('dropdown-item');
        item.href = '#';
        item.onclick = async () => {
            await at.setOutputDevice(device);
        };
        item.innerText = device.label + (device.isDefault ? ' (default)' : '');
        return item;
    }

    control.querySelector('.at-output-device').addEventListener('show.bs.dropdown', async () => {
        const devices = await at.enumerateOutputDevices();
        if (devices.length === 0) {
            return;
        }

        const list = control.querySelector('.at-output-device .dropdown-menu');
        list.innerHTML = '';
        for (const d of devices) {
            const item = createOutputDeviceItem(d);
            list.appendChild(item);
        }
    });

    control.querySelectorAll('.at-speed-options a').forEach(function (a) {
        a.onclick = function (e) {
            e.preventDefault();
            at.playbackSpeed = parseFloat(e.target.innerText);
            control.querySelector('.at-speed-label').innerText = e.target.innerText;
        };
    });

    control.querySelector('.at-loop').onclick = function (e) {
        e.stopPropagation();
        const link = e.target.closest('a');
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.isLooping = true;
        } else {
            at.isLooping = false;
        }
    };

    control.querySelector('.at-print').onclick = function (e) {
        at.print();
    };

    control.querySelector('.at-download').onclick = function (e) {
        const exporter = new alphaTab.exporter.Gp7Exporter();
        const data = exporter.export(at.score, at.settings);
        const a = document.createElement('a');
        a.download = at.score.title.length > 0 ? at.score.title + '.gp' : 'song.gp';
        a.href = URL.createObjectURL(new Blob([data]));
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    control.querySelectorAll('.at-zoom-options a').forEach(function (a) {
        a.onclick = function (e) {
            e.preventDefault();
            at.settings.display.scale = parseInt(e.target.innerText) / 100.0;
            control.querySelector('.at-zoom-label').innerText = e.target.innerText;
            at.updateSettings();
            at.render();
        };
    });

    control.querySelectorAll('.at-layout-options a').forEach(function (a) {
        a.onclick = function (e) {
            e.preventDefault();
            const settings = at.settings;
            switch (e.target.dataset.layout) {
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
    });

    for (const t of control.querySelectorAll('[data-toggle="tooltip"]')) {
        new bootstrap.Tooltip(t);
    }

    return at;
}

function updateProgress(el, value) {
    value = value * 100;
    const left = el.querySelector('.progress-left .progress-bar');
    const right = el.querySelector('.progress-right .progress-bar');
    function percentageToDegrees(percentage) {
        return (percentage / 100) * 360;
    }

    if (value > 0) {
        if (value <= 50) {
            right.style.transform = 'rotate(' + percentageToDegrees(value) + 'deg)';
        } else {
            right.style.transform = 'rotate(180deg)';
            left.style.transform = 'rotate(' + percentageToDegrees(value - 50) + 'deg)';
        }
    }
    el.querySelector('.progress-value-number').innerText = value | 0;
}
