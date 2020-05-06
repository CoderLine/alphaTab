const toDomElement = (function () {
    const parser = document.createElement('div');
    return function (html) {
        parser.innerHTML = html;
        return parser.firstElementChild;
    };
})();

function createTrackItem(track) {
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
        at.renderTracks([track]);
    };

    muteButton.value = track.playbackInfo.isMute;
    soloButton.value = track.playbackInfo.isSolo;
    volumeSlider.value = track.playbackInfo.volume;

    trackItem.track = track;
    return trackItem;
}

function setupControl(selector) {
    const el = document.querySelector(selector);
    const control = el.closest('.at-wrap');

    const viewPort =
        'playerScrollelement' in el.dataset ? el.dataset.playerScrollelement : control.querySelector('.at-viewport');
    const at = new alphaTab.AlphaTabApi(el, {
        core: {
            logLevel: 'debug'
        },
        player: {
            scrollElement: viewPort
        }
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

    const trackItems = [];
    at.renderStarted.on(function (isResize) {
        if (!isResize) {
            control.classList.add('loading');
        }
        const tracks = new Map();
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
            const trackItem = createTrackItem(track);
            trackItems.push(trackItem);
            trackList.appendChild(trackItem);
        });

        currentTempo = score.tempo;
        updateMasterBarTimes(score.masterBars[0]);
    });

    const barPositionLabel = control.querySelector('.at-bar-position');
    const timeSignatureLabel = control.querySelector('.at-time-signature');
    const tempoLabel = control.querySelector('.at-tempo');

    let currentTempo = 0;

    function updateMasterBarTimes(currentMasterBar) {
        const masterBarCount = currentMasterBar.score.masterBars.length;
        if (currentMasterBar.tempoAutomation != null) {
            currentTempo = currentMasterBar.tempoAutomation.value | 0;
        }

        barPositionLabel.innerText = currentMasterBar.index + 1 + ' / ' + masterBarCount;
        timeSignatureLabel.innerText =
            currentMasterBar.timeSignatureNumerator + ' / ' + currentMasterBar.timeSignatureDenominator;
        tempoLabel.innerText = currentTempo;
    }

    at.playedBeatChanged.on(function (beat) {
        updateMasterBarTimes(beat.voice.bar.masterBar);
    });

    const timePositionLabel = control.querySelector('.at-time-position');
    const timeSliderValue = control.querySelector('.at-time-slider-value');

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
    });

    at.playerStateChanged.on(function (args) {
        const icon = playPauseButton.querySelector('i');
        if (args.state == 0) {
            icon.classList.remove('fa-pause-circle');
            icon.classList.add('fa-play-circle');
        } else {
            icon.classList.remove('fa-play-circle');
            icon.classList.add('fa-pause-circle');
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

    control.querySelector('.at-speed').oninput = function (e) {
        e.stopPropagation();
        at.playbackSpeed = e.target.value / 100.0;
        e.target.title = e.target.value + '%';
        if (e.target.value == '100') {
            control.querySelector('.at-speed-value').innerText = '';
        } else {
            control.querySelector('.at-speed-value').innerText = e.target.value + '%';
        }
    };

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

    control.querySelectorAll('.at-zoom-options a').forEach(function (a) {
        a.onclick = function (e) {
            e.preventDefault();
            at.settings.scale = parseInt(e.target.innerText) / 100.0;
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
                    settings.layout.mode = 'page';
                    settings.scrollMode = 1;
                    break;
                case 'horizontal-bar':
                    settings.layout.mode = 'horizontal';
                    settings.scrollMode = 1;
                    break;
                case 'horizontal-screen':
                    settings.layout.mode = 'horizontal';
                    settings.scrollMode = 2;
                    break;
            }

            at.updateSettings();
            at.render();
        };
    });

    $(control).find('[data-toggle="tooltip"]').tooltip();

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
