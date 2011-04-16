<?php 
/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
$title = "Converter";
$description = "This sample shows how to use the alphaTex converter.";
?> 
<!-- Include the Editor Plugin -->
<script language="JavaScript" type="text/javascript">

var loadedSong = null; 
$(document).ready(function() {
    // initialize button events
	$('#LoadSample').click(function() {
		var testFile = $('#TestFile :selected').val();
        loadFile(testFile);
    }); 
	$('#UpdateTrack').click(function() { 
		var index = parseInt($('#Tracks :selected').val());
        
        var converter = new alphatab.file.alphatex.AlphaTexWriter(loadedSong.tracks[index]);
        $("#result").val(converter.write());
	});
});

function loadFile(testFile) 
{
    try
	{   
		// use SongLoader to load files
		var factory = new alphatab.tablature.model.DrawingSongModelFactory();
        alphatab.file.SongLoader.loadSong(testFile, factory, 
			function(song){ 
                loadedSong = song;
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
            });
	}
	catch(e)
	{
		if(e instanceof alphatab.file.FileFormatException)
			alert(e.message);
		else 
			alert(e);
	}
}


</script>

<select id="TestFile">
	<option value="files/GuitarPro6Jingle.gpx">Guitar Pro 6 Jingle(Gpx)</option>
	<option value="files/FadeToBlack.gp4">Metallica - Fade To Black (Gp4)</option>
	<option value="files/Love.gp4">Love(Gp4)</option>
	<option value="files/Canon.gp5">JerryC - CanonRock (Gp5)</option>
	<option value="files/Serenade.gp5">Suidakra - Serenade to a Dream (Gp5)</option>
	<option value="files/Effects.gp5">Effects (Gp5)</option>
	<option value="files/Effects.gpx">Effects (Gpx)</option>
	<option value="files/Drums.gp5">Drums (Gp5)</option>
	<option value="files/Displaced.gp5">Displaced (Gp5)</option>
</select>
<input id="LoadSample" type="button" value="Load" />
| 

<!-- Tracks -->
<label for="Tracks">Tracks:</label>
<select id="Tracks">
</select>
<input id="UpdateTrack" type="button" value="Convert" />
|
<br />
<textarea id="result"></textarea>