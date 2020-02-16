// some helper functions for later
function updateProgress(el, value) {
	value = value * 100;
	const left = el.querySelector('.progress-left .progress-bar');
	const right = el.querySelector('.progress-right .progress-bar');
	function percentageToDegrees(percentage) { return percentage / 100 * 360 }

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

function formatDuration(milliseconds) {
	let seconds = milliseconds / 1000;
	const minutes = (seconds / 60) | 0;
	seconds = (seconds - (minutes * 60)) | 0;
	return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

const toDomElement = (function() {
	const parser = document.createElement('div');
	return function(html) {
		parser.innerHTML = html;
		return parser.firstElementChild;
	};
})();

// we're using handlebars as template engine to generate the track selector items later
const trackTemplate = Handlebars.compile(document.querySelector('#at-track-template').innerHTML);

const el = document.querySelector('#alphaTab');
const control = el.closest('.at-wrap');
let at = null; // will hold the alphaTab API later, declared here for visibility below
const trackItems = []; // a list of all track items for better handling later

// creates a new track selector item with all events hooked up
function createTrackItem(track) {        
	const trackItem = toDomElement(trackTemplate(track));
	
	// init track controls
	const muteButton = trackItem.querySelector('.at-track-mute');
	const soloButton = trackItem.querySelector('.at-track-solo');
	const volumeSlider = trackItem.querySelector('.at-track-volume');

	muteButton.onclick = function(e) {
		e.stopPropagation();
		// toggle active state of button
		muteButton.classList.toggle('active');
		
		// set mute flag of track based on active class
		at.changeTrackMute([track], muteButton.classList.contains('active'));                        
	};
	
	soloButton.onclick = function(e) {
		e.stopPropagation();
		
		// toggle active state of button
		soloButton.classList.toggle('active');
		
		// set solo flag of track based on active class
		at.changeTrackSolo([track], soloButton.classList.contains('active'));                        
	};                    
	
	volumeSlider.oninput = function(e) {
		e.preventDefault();
		// Here we need to do some math to map the 1-16 slider to the 
		// volume in alphaTab. In alphaTab it is 1.0 for 100% which is
		// equal to the volume in the track information
		at.changeTrackVolume([track], volumeSlider.value / track.playbackInfo.volume)
	};
	
	volumeSlider.onclick = function(e) {
		// here we avoid that the trackItem.click below is triggered
		e.stopPropagation();
	};
	
	trackItem.onclick = function(e) {
		e.stopPropagation();
		// on click render the track, 
		// via some shift click you could add a multi-track rendering feature
		at.renderTracks([track]);
	};
	
	// setup initial values from score
	muteButton.value = track.playbackInfo.isMute;
	soloButton.value = track.playbackInfo.isSolo;
	volumeSlider.value = track.playbackInfo.volume;
	
	// remember track for later usage
	trackItem.track = track;
	return trackItem;
}

// once the file is loaded, we can fill the UI 
// with all the info about the song
el.addEventListener('alphaTab.loaded', function(e) {
	const score = e.detail;
	
	control.querySelector('.at-song-title').innerText = score.title;
	control.querySelector('.at-song-artist').innerText = score.artist;

	// fill track selector
	const trackList = control.querySelector('.at-track-list');
	trackList.innerHTML = '';
	
	for(track of score.tracks) {
		const trackItem = createTrackItem(track);                    
		trackItems.push(trackItem);
		trackList.appendChild(trackItem);
	}
	
	// initialize some player related indicators after load
	currentTempo = score.tempo;
	updateMasterBarTimes(score.masterBars[0]);
});

// player loading indicator
const playerLoadingIndicator = control.querySelector('.at-player-loading');
const playerLoadingIndicatorPercent = control.querySelector('.at-player-loading-percent');
el.addEventListener('alphaTab.soundFontLoad', function(e) {
	updateProgress(playerLoadingIndicator, e.detail.loaded / e.detail.total);
});
el.addEventListener('alphaTab.soundFontLoaded', function(e) {
   playerLoadingIndicator.classList.add('d-none'); 
});


// once a score is about to be rendered, we can already
// initialize some UI info
el.addEventListener('alphaTab.render', function(e) {
	// show/hide indicator (do not show it on resize)
	const isResize = e.detail;
	if(!isResize) {
		control.classList.add('loading');
	}
	
	// mark tracks active/inactive in selector
	const tracks = new Map();
	at.tracks.forEach(function(t) { tracks.set(t.index, t); });            
	for(trackItem of trackItems) {
		if(tracks.has(trackItem.track.index)) {
			trackItem.classList.add('active');
		} else {
			trackItem.classList.remove('active');
		}
	}
});
el.addEventListener('alphaTab.rendered', function(e) {
	control.classList.remove('loading');
});

// during playback we want to update the displayed information
// depending on the currently played bar/beat
const barPositionLabel = control.querySelector('.at-bar-position');
const timeSignatureLabel = control.querySelector('.at-time-signature');
const tempoLabel = control.querySelector('.at-tempo');

let currentTempo = 0;
function updateMasterBarTimes(currentMasterBar) {
	var masterBarCount = currentMasterBar.score.masterBars.length;
	if(currentMasterBar.tempoAutomation != null) {
		currentTempo = currentMasterBar.tempoAutomation.value | 0;
	}
	
	barPositionLabel.innerText = (currentMasterBar.index + 1) + ' / ' + masterBarCount;
	timeSignatureLabel.innerText = currentMasterBar.timeSignatureNumerator + ' / ' + currentMasterBar.timeSignatureDenominator;
	tempoLabel.innerText = currentTempo;
}

el.addEventListener('alphaTab.playedBeatChanged', function(e) {
	updateMasterBarTimes(e.detail.voice.bar.masterBar);
});

// we also have some time related information shown in the UI
const timePositionLabel = control.querySelector('.at-time-position');
const timeSliderValue = control.querySelector('.at-time-slider-value');

let previousTime = -1;
el.addEventListener('alphaTab.positionChanged', function(e) {
	var args = e.detail;                
	
	// reduce number of UI updates to second changes. 
	const currentSeconds = (args.currentTime / 1000) | 0;
	if(currentSeconds == previousTime) {
		return;
	}
	previousTime = currentSeconds;
	
	
	timePositionLabel.innerText = formatDuration(args.currentTime) + ' / ' + formatDuration(args.endTime);
	timeSliderValue.style.width = ((args.currentTime / args.endTime) * 100).toFixed(2) + '%';
});

// below we initialize and update the player controls based on events
const playPauseButton = control.querySelector('.at-play-pause');
el.addEventListener('alphaTab.playerReady', function(e) {
	control.querySelectorAll('.at-player .disabled').forEach(function(c) {
		c.classList.remove('disabled');
	});
});
el.addEventListener('alphaTab.playerStateChanged', function(e) {
	const args = e.detail;
	const icon = playPauseButton.querySelector('i');
	if(args.state == 0) {
		icon.classList.remove('fa-pause-circle');
		icon.classList.add('fa-play-circle');
	}   
	else {
		icon.classList.remove('fa-play-circle');
		icon.classList.add('fa-pause-circle');
	}
});
playPauseButton.onclick = function(e) {
	e.stopPropagation();
	e.preventDefault();
	if(!e.target.classList.contains('disabled')) {
		at.playPause();
	}
};
control.querySelector('.at-stop').onclick = function(e) {
	e.stopPropagation();
	e.preventDefault();
	if(!e.target.classList.contains('disabled')) {
		at.stop();
	}
};

// here we setup the remaining UI controls and hook them up with the API
control.querySelector('.at-metronome').onclick = function(e) {
	e.stopPropagation();
	e.preventDefault();
	const link = e.target.closest('a');
	link.classList.toggle('active');
	if(link.classList.contains('active')) {
		at.metronomeVolume = 1;                        
	} else {
		at.metronomeVolume = 0;                        
	}
};

control.querySelector('.at-speed').oninput = function(e) {
	e.stopPropagation();
	e.preventDefault();
	at.playbackSpeed = e.target.value / 100.0;
	e.target.title = e.target.value + "%";
	control.querySelector('.at-speed-value').innerText = e.target.value + "%";
};

control.querySelector('.at-loop').onclick = function(e) {
	e.stopPropagation();
	e.preventDefault();
	const link = e.target.closest('a');
	link.classList.toggle('active');
	if(link.classList.contains('active')) {
		at.isLooping = true;                        
	} else {
		at.isLooping = false;                        
	}
};

control.querySelector('.at-print').onclick = function(e) {
	e.stopPropagation();
	e.preventDefault();
	at.print();
};

control.querySelectorAll('.at-zoom-options a').forEach(function(a) {
	a.onclick = function(e) {
		e.preventDefault();
		at.settings.display.scale = parseInt(e.target.innerText) / 100.0;
		control.querySelector('.at-zoom-label').innerText = e.target.innerText;
		at.updateSettings();
		at.render();
	};
});

control.querySelectorAll('.at-layout-options a').forEach(function(a) {
	a.onclick = function(e) {
		e.preventDefault();
		const settings = at.settings;
		switch(e.target.dataset.layout)
		{
			case 'page':
				settings.display.layoutMode = 'page';
				settings.scrollMode = 1;
			break;
			case 'horizontal-bar':
				settings.display.layoutMode = 'horizontal';
				settings.scrollMode = 1;
			break;
			case 'horizontal-screen':
				settings.display.layoutMode = 'horizontal';
				settings.scrollMode = 2;
			break;
		}
		
		at.updateSettings();
		at.render();
	};
});


// now with all events hooked up, we can kick-off alphatab

const additionalSettings = {
	// in this sample we want alphaTab to scroll the viewport element
	// depending on your own layout, you might want to set this to another element
	// that should be scrolled to keep alphaTab in the view
	// usually the scroll element should point to the next scrollable parent above alphaTab
	player: {
		scrollElement: control.querySelector('.at-viewport')
	}
};
at = new alphaTab.platform.javaScript.AlphaTabApi(el, additionalSettings);

// setup all bootstrap tooltips
$('[data-toggle="tooltip"]').tooltip();