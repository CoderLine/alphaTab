<?php 
$title = "Extended";
$description = "This extended sample shows up different features like file loading and zoom adjustments.";
?> 
<script language="JavaScript" type="text/javascript"> 
$(document).ready(function() { 
	var api = $('div.alphaTab').alphaTab({
		loadCallback: function(song) {
			var tracks = $('#Tracks');
			tracks.find('option').remove();
			for(var i = 0; i < song.tracks.length; i++) 
			{
				var elm = $('<option value="'+i+'">'+song.tracks[i].name+'</option>');
				if(i == 0)
				{
					elm.attr("selected", "selected");
				}	
				tracks.append(elm);
			}
		}
	});
	
	// initialize button events
	$('#LoadSample').click(function(){
		var testFile = $('#TestFile :selected').val();
		api.loadFile(testFile);
    }); 
	$('#Zoom').change(function(){
		var zoomlvl = parseFloat($('#Zoom :selected').val());
		api.tablature.updateScale(zoomlvl);
	});  
	$('#UpdateTrack').click(function() { 
		var index = parseInt($('#Tracks :selected').val());
		api.tablature.setTrack(api.tablature.track.song.tracks[index]);
	});
});
</script>
<!-- File List -->
<select id="TestFile">
	<option value="files/FadeToBlack.gp4">Metallica - Fade To Black</option>
	<option value="files/Canon.gp5">JerryC - CanonRock</option>
	<option value="files/Serenade.gp5">Suidakra - Serenade to a Dream</option>
	<option value="files/Effects.gp5">Effects</option>
</select>
<input id="LoadSample" type="button" value="Load" />
| 

<!-- Tracks -->
<label for="Tracks">Tracks:</label>
<select id="Tracks">
</select>
<input id="UpdateTrack" type="button" value="Show" />
|

<!-- Zoom -->
<select id="Zoom">
	<option value="0.5">50%</option>
	<option value="0.75">75%</option>
	<option value="1.0">100%</option>
	<option value="1.1" selected="selected">110%</option>
	<option value="1.25">125%</option>
	<option value="1.5">150%</option>
	<option value="2.0">200%</option>
</select>

<br />


<div class="alphaTab"></div>